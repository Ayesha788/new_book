/*
 * Copyright (C) 2023 Open Source Robotics Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include <gazebo/common/Plugin.hh>
#include <gazebo/physics/physics.hh>
#include <gazebo/transport/transport.hh>
#include <gazebo/msgs/msgs.hh>
#include <ros/ros.h>
#include <geometry_msgs/Twist.h>
#include <nav_msgs/Odometry.h>
#include <tf/transform_broadcaster.h>

namespace gazebo
{
  class DiffDrivePlugin : public ModelPlugin
  {
    public: void Load(physics::ModelPtr _model, sdf::ElementPtr _sdf)
    {
      // Store the model pointer for convenience
      this->model = _model;

      // Get the joints for the wheels
      this->leftJoint = _model->GetJoint("left_wheel_joint");
      this->rightJoint = _model->GetJoint("right_wheel_joint");

      if (!this->leftJoint || !this->rightJoint)
      {
        gzerr << "Unable to find left/right wheel joints. Make sure they are specified in the URDF/SDF.\n";
        return;
      }

      // Initialize ROS
      if (!ros::isInitialized())
      {
        int argc = 0;
        char** argv = NULL;
        ros::init(argc, argv, "gazebo_client", ros::init_options::NoSigintHandler);
      }

      this->rosNode.reset(new ros::NodeHandle);

      // Subscribe to cmd_vel topic
      this->rosSub = this->rosNode->subscribe("cmd_vel", 1, &DiffDrivePlugin::OnRosCmdVel, this);

      // Advertise odometry topic
      this->odomPub = this->rosNode->advertise<nav_msgs::Odometry>("odom", 1);

      // Create a timer to update the plugin
      this->updateConnection = event::Events::ConnectWorldUpdateBegin(
          std::bind(&DiffDrivePlugin::OnUpdate, this));
    }

    // Update function called every simulation iteration
    private: void OnUpdate()
    {
      // Update odometry
      this->PublishOdometry();

      // Apply velocities to joints
      if (this->leftJoint && this->rightJoint)
      {
        this->leftJoint->SetParam("vel", 0, this->leftVel);
        this->rightJoint->SetParam("vel", 0, this->rightVel);
      }
    }

    // Callback for ROS cmd_vel messages
    private: void OnRosCmdVel(const geometry_msgs::Twist::ConstPtr& _msg)
    {
      // Convert Twist message to wheel velocities
      double linear = _msg->linear.x;
      double angular = _msg->angular.z;

      // Differential drive kinematics
      double wheelSep = 0.3;  // Wheel separation (meters)
      double wheelRadius = 0.075;  // Wheel radius (meters)

      this->leftVel = (linear - angular * wheelSep / 2.0) / wheelRadius;
      this->rightVel = (linear + angular * wheelSep / 2.0) / wheelRadius;
    }

    // Publish odometry data
    private: void PublishOdometry()
    {
      // Get current pose and velocity from Gazebo
      ignition::math::Pose3d pose = this->model->WorldPose();
      ignition::math::Vector3d velocity = this->model->WorldLinearVel();

      // Create odometry message
      nav_msgs::Odometry odom;
      odom.header.stamp = ros::Time::now();
      odom.header.frame_id = "odom";

      // Set position
      odom.pose.pose.position.x = pose.Pos().X();
      odom.pose.pose.position.y = pose.Pos().Y();
      odom.pose.pose.position.z = pose.Pos().Z();
      odom.pose.pose.orientation.x = pose.Rot().X();
      odom.pose.pose.orientation.y = pose.Rot().Y();
      odom.pose.pose.orientation.z = pose.Rot().Z();
      odom.pose.pose.orientation.w = pose.Rot().W();

      // Set velocity
      odom.child_frame_id = "base_footprint";
      odom.twist.twist.linear.x = velocity.X();
      odom.twist.twist.linear.y = velocity.Y();
      odom.twist.twist.angular.z = this->model->WorldAngularVel().Z();

      // Publish the message
      this->odomPub.publish(odom);
    }

    private: physics::ModelPtr model;
    private: physics::JointPtr leftJoint;
    private: physics::JointPtr rightJoint;
    private: double leftVel = 0.0;
    private: double rightVel = 0.0;
    private: std::unique_ptr<ros::NodeHandle> rosNode;
    private: ros::Subscriber rosSub;
    private: ros::Publisher odomPub;
    private: event::ConnectionPtr updateConnection;
  };

  // Register this plugin with the simulator
  GZ_REGISTER_MODEL_PLUGIN(DiffDrivePlugin)
}
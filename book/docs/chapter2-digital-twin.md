# Chapter 2: Digital Twin - Simulating Humanoid Robots

## Introduction to Digital Twin Technology

Digital Twin technology creates virtual replicas of physical systems, allowing for simulation, analysis, and optimization before implementing in the real world. In robotics, digital twins are crucial for testing and validating robot behaviors in safe, controlled virtual environments before deployment on actual hardware.

For humanoid robotics, digital twins enable:
- Safe testing of complex locomotion algorithms
- Sensor simulation and validation
- Physics-based interaction testing
- Control system development without hardware risk

## Gazebo Simulation Environment

Gazebo is a powerful 3D simulation environment that provides realistic physics simulation, high-quality graphics, and convenient programmatic interfaces. It's widely used in the ROS ecosystem for robotics simulation.

### Key Features of Gazebo:
- Physics simulation with ODE, Bullet, Simbody, or DART engines
- High-quality graphics rendering
- Sensor simulation (cameras, LiDAR, IMU, etc.)
- Realistic lighting and environment modeling
- Plugin architecture for custom functionality

### Installing Gazebo with ROS 2

For ROS 2 Humble, Gazebo can be installed as part of the desktop package or separately:

```bash
# Install Gazebo Garden (recommended for ROS 2 Humble)
sudo apt install ros-humble-gazebo-*

# Install the ROS 2 Gazebo bridge
sudo apt install ros-humble-gazebo-ros-pkgs
```

## Setting up a Humanoid Robot in Gazebo

### Robot Configuration

To simulate a humanoid robot in Gazebo, you need:

1. **URDF Model**: A detailed robot description file
2. **Gazebo Plugins**: For physics simulation and sensor integration
3. **Launch Files**: To start the simulation with proper configuration

### Example Gazebo Integration in URDF

```xml
<?xml version="1.0"?>
<robot name="humanoid_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Include Gazebo-specific plugins -->
  <gazebo>
    <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
      <robotNamespace>/humanoid_robot</robotNamespace>
    </plugin>
  </gazebo>

  <!-- Link definitions with Gazebo properties -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Example joint with physics properties -->
  <joint name="hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_leg"/>
    <origin xyz="0 0.1 -0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="100" velocity="1.0"/>
    <dynamics damping="0.1" friction="0.0"/>
  </joint>

  <link name="left_leg">
    <visual>
      <geometry>
        <cylinder length="0.5" radius="0.05"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.5" radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.05" ixy="0.0" ixz="0.0" iyy="0.05" iyz="0.0" izz="0.001"/>
    </inertial>
  </link>
</robot>
```

## Physics Simulation Setup

### Gravity and Environment Configuration

Gazebo allows detailed configuration of physics properties:

```xml
<sdf version='1.7'>
  <world name='default'>
    <physics type='ode'>
      <gravity>0 0 -9.8</gravity>
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <!-- Include a ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Include sun for lighting -->
    <include>
      <uri>model://sun</uri>
    </include>
  </world>
</sdf>
```

### Sensor Simulation

<Diagram
  title="Sensor Simulation in Gazebo"
  description="A diagram showing how sensors are integrated into the Gazebo simulation. The humanoid robot model has multiple sensors attached: a LiDAR on the head, cameras on the torso, IMU sensors distributed across the body, and contact sensors on the feet. Each sensor publishes data to ROS 2 topics. The Gazebo physics engine processes sensor data based on the robot's position and the environment.">

  ![Sensor Simulation](pathname:///img/diagrams/sensor-simulation.svg)

</Diagram>

Gazebo can simulate various sensors crucial for humanoid robotics:

#### LiDAR Sensor
```xml
<gazebo reference="lidar_link">
  <sensor type="ray" name="humanoid_lidar">
    <pose>0 0 0 0 0 0</pose>
    <visualize>true</visualize>
    <update_rate>10</update_rate>
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/humanoid_robot</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
    </plugin>
  </sensor>
</gazebo>
```

#### IMU Sensor
```xml
<gazebo reference="imu_link">
  <sensor name="humanoid_imu" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <visualize>false</visualize>
    <imu>
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </z>
      </angular_velocity>
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </z>
      </linear_acceleration>
    </imu>
    <plugin name="imu_controller" filename="libgazebo_ros_imu.so">
      <ros>
        <namespace>/humanoid_robot</namespace>
        <remapping>~/out:=imu/data</remapping>
      </ros>
    </plugin>
  </sensor>
</gazebo>
```

## Unity Integration for High-Fidelity Visualization

Unity provides a high-fidelity 3D environment that can be used alongside Gazebo for more realistic visualization and testing. Unity Robotics provides tools for connecting Unity with ROS 2.

<Diagram
  title="Simulation Architecture Overview"
  description="A diagram showing the architecture of the simulation system. On the left is the ROS 2 ecosystem with nodes for robot control, sensor processing, and planning. In the center is the Gazebo simulation environment containing the humanoid robot model with various sensors (LiDAR, IMU, cameras). On the right is the Unity visualization environment showing the same robot in a high-fidelity 3D environment. Bidirectional arrows show communication between ROS 2 and both simulation environments.">

  ![Simulation Architecture](pathname:///img/diagrams/simulation-architecture.svg)

</Diagram>

### Unity-ROS 2 Bridge Setup

1. Install Unity Hub and Unity Editor (2021.3 LTS or newer)
2. Import the Unity Robotics Hub package
3. Use the ROS-TCP-Connector to establish communication between Unity and ROS 2

### Basic Unity-ROS 2 Connection

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class RobotController : MonoBehaviour
{
    private ROSConnection ros;
    private string robotTopic = "/unity_robot/joint_commands";

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<JointStateMsg>(robotTopic);
    }

    void Update()
    {
        // Send joint commands to ROS
        var jointMsg = new JointStateMsg();
        jointMsg.name = new string[] { "hip_joint", "knee_joint" };
        jointMsg.position = new double[] { Mathf.Sin(Time.time), Mathf.Cos(Time.time) };

        ros.Publish(robotTopic, jointMsg);
    }
}
```

## Creating a Simulation Environment

### Launch File for Gazebo Simulation

Create a launch file to start your humanoid robot simulation:

```python
import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    # Get the package directory
    pkg_gazebo_ros = get_package_share_directory('gazebo_ros')
    pkg_humanoid_description = get_package_share_directory('humanoid_description')

    # Simulation arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    world = LaunchConfiguration('world', default=os.path.join(
        pkg_humanoid_description, 'worlds', 'simple_room.sdf'
    ))

    # Launch Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(pkg_gazebo_ros, 'launch', 'gazebo.launch.py')
        ),
        launch_arguments={
            'world': world,
            'verbose': 'false',
        }.items()
    )

    # Spawn the robot in Gazebo
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description',
            '-entity', 'humanoid_robot'
        ],
        output='screen'
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='true',
            description='Use simulation (Gazebo) clock if true'
        ),
        DeclareLaunchArgument(
            'world',
            default_value=os.path.join(pkg_humanoid_description, 'worlds', 'simple_room.sdf'),
            description='SDF world file'
        ),
        gazebo,
        spawn_entity,
    ])
```

## Running the Simulation

### Starting the Simulation

1. Build your ROS 2 workspace:
   ```bash
   cd ~/ros2_ws
   colcon build --packages-select humanoid_description
   source install/setup.bash
   ```

2. Launch the simulation:
   ```bash
   ros2 launch humanoid_description.launch.py
   ```

3. In another terminal, run RViz to visualize the robot:
   ```bash
   rviz2
   ```

### Verifying Sensor Data

Check that your simulated sensors are publishing data:

```bash
# Check available topics
ros2 topic list

# View LiDAR data
ros2 topic echo /humanoid_robot/scan

# View IMU data
ros2 topic echo /humanoid_robot/imu/data
```

## Practice Tasks

1. Create a complete URDF model for a simple humanoid robot with at least 10 joints
2. Set up a Gazebo simulation environment with obstacles
3. Add a LiDAR sensor to your robot and verify it publishes scan data
4. Implement a simple walking gait simulation using joint position control
5. Create a Unity scene that mirrors the Gazebo simulation with the same robot model

## Summary

In this chapter, you've learned how to create and work with digital twins of humanoid robots using Gazebo and Unity. You now understand:
- How to set up physics simulation environments
- How to integrate sensors into your robot models
- How to connect simulation environments with ROS 2
- How to verify that your simulated robot behaves as expected

Digital twins are essential for developing and testing humanoid robots safely and efficiently. The skills you've learned in this chapter will be crucial as you move on to implementing AI control systems in the next chapter.
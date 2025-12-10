#!/usr/bin/env python3
"""
Humanoid Robot Controller Example

This node demonstrates controlling a humanoid robot by publishing joint commands
and subscribing to sensor feedback.
"""

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint
from std_msgs.msg import Header


class HumanoidController(Node):
    def __init__(self):
        super().__init__('humanoid_controller')

        # Publisher for joint commands
        self.joint_cmd_pub = self.create_publisher(
            JointTrajectory,
            '/joint_trajectory',
            10
        )

        # Subscriber for joint states
        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )

        # Timer for control loop
        self.timer = self.create_timer(0.1, self.control_loop)  # 10Hz

        # Robot joint names
        self.joint_names = [
            'left_hip_joint', 'left_knee_joint', 'left_ankle_joint',
            'right_hip_joint', 'right_knee_joint', 'right_ankle_joint',
            'left_shoulder_joint', 'left_elbow_joint',
            'right_shoulder_joint', 'right_elbow_joint'
        ]

        self.current_joint_states = None
        self.get_logger().info('Humanoid Controller initialized')

    def joint_state_callback(self, msg):
        """Callback to receive joint state updates"""
        self.current_joint_states = msg

    def control_loop(self):
        """Main control loop"""
        # Create a joint trajectory message
        traj_msg = JointTrajectory()
        traj_msg.header = Header()
        traj_msg.header.stamp = self.get_clock().now().to_msg()
        traj_msg.header.frame_id = 'base_link'
        traj_msg.joint_names = self.joint_names

        # Create a trajectory point
        point = JointTrajectoryPoint()

        # Set desired joint positions (example: walking gait)
        positions = []
        for i, joint_name in enumerate(self.joint_names):
            # Simple oscillating pattern for demonstration
            pos = 0.1 * (i % 3)  # Different positions for different joint groups
            positions.append(pos)

        point.positions = positions
        point.velocities = [0.0] * len(positions)  # Zero velocity
        point.accelerations = [0.0] * len(positions)  # Zero acceleration

        # Set the time from start (0.1 seconds for 10Hz control)
        point.time_from_start.sec = 0
        point.time_from_start.nanosec = 100000000  # 0.1 seconds

        traj_msg.points = [point]

        # Publish the trajectory
        self.joint_cmd_pub.publish(traj_msg)

        self.get_logger().info(f'Published joint trajectory with {len(positions)} joints')


def main(args=None):
    rclpy.init(args=args)

    controller = HumanoidController()

    try:
        rclpy.spin(controller)
    except KeyboardInterrupt:
        controller.get_logger().info('Shutting down Humanoid Controller')
    finally:
        controller.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
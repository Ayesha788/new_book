#!/usr/bin/env python3

"""
Simple Navigation Node for Simulation

This node demonstrates basic navigation in a simulated environment.
It subscribes to laser scan data and publishes velocity commands to avoid obstacles.
"""

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
import math
import numpy as np


class SimpleNavigator(Node):
    def __init__(self):
        super().__init__('simple_navigator')

        # Create subscribers
        self.scan_sub = self.create_subscription(
            LaserScan,
            '/scan',
            self.scan_callback,
            10
        )

        self.odom_sub = self.create_subscription(
            Odometry,
            '/odom',
            self.odom_callback,
            10
        )

        # Create publisher for velocity commands
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # Timer for control loop
        self.timer = self.create_timer(0.1, self.control_loop)

        # Robot state
        self.scan_data = None
        self.odom_data = None
        self.obstacle_detected = False
        self.obstacle_distance = float('inf')

        self.get_logger().info('Simple Navigator node initialized')

    def scan_callback(self, msg):
        """Process laser scan data"""
        self.scan_data = msg
        # Process scan to detect obstacles
        if len(msg.ranges) > 0:
            # Get distances in front of robot (forward 30 degrees on each side)
            front_ranges = []
            center_idx = len(msg.ranges) // 2

            # Look at the front 60 degrees (30 degrees on each side)
            for i in range(center_idx - 15, center_idx + 15):
                if 0 <= i < len(msg.ranges) and not math.isinf(msg.ranges[i]):
                    front_ranges.append(msg.ranges[i])

            if front_ranges:
                min_front_dist = min(front_ranges)
                self.obstacle_distance = min_front_dist
                self.obstacle_detected = min_front_dist < 1.0  # Obstacle within 1 meter
            else:
                self.obstacle_distance = float('inf')
                self.obstacle_detected = False

    def odom_callback(self, msg):
        """Process odometry data"""
        self.odom_data = msg

    def control_loop(self):
        """Main control loop"""
        if self.scan_data is None:
            return

        cmd_vel = Twist()

        if self.obstacle_detected:
            # Stop and turn if obstacle detected
            cmd_vel.linear.x = 0.0
            cmd_vel.angular.z = 0.5  # Turn right
            self.get_logger().info(f'Obstacle detected at {self.obstacle_distance:.2f}m, turning...')
        else:
            # Move forward if no obstacle
            cmd_vel.linear.x = 0.5  # Move forward at 0.5 m/s
            cmd_vel.angular.z = 0.0  # No turning
            self.get_logger().info(f'Clear path, moving forward. Distance to nearest obstacle: {self.obstacle_distance:.2f}m')

        # Publish command
        self.cmd_vel_pub.publish(cmd_vel)


def main(args=None):
    rclpy.init(args=args)

    navigator = SimpleNavigator()

    try:
        rclpy.spin(navigator)
    except KeyboardInterrupt:
        navigator.get_logger().info('Node stopped by user')
    finally:
        # Stop the robot before shutting down
        stop_msg = Twist()
        navigator.cmd_vel_pub.publish(stop_msg)
        navigator.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
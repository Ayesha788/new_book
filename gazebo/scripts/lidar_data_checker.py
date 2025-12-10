#!/usr/bin/env python3
"""
LiDAR Data Checker for Humanoid Robot Simulation

This script demonstrates how to subscribe to and verify LiDAR data from a simulated humanoid robot.
"""

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
import numpy as np


class LidarDataChecker(Node):
    def __init__(self):
        super().__init__('lidar_data_checker')

        # Subscribe to the LiDAR scan topic
        self.subscription = self.create_subscription(
            LaserScan,
            '/humanoid_robot/scan',  # Standard topic name for LiDAR data
            self.lidar_callback,
            10
        )

        self.subscription  # prevent unused variable warning
        self.data_received = False
        self.get_logger().info('LiDAR Data Checker node initialized')

    def lidar_callback(self, msg):
        """Callback function to process LiDAR data"""
        if not self.data_received:
            self.get_logger().info('LiDAR data received successfully!')
            self.data_received = True

        # Log some basic information about the scan
        self.get_logger().info(f'Range count: {len(msg.ranges)}')
        self.get_logger().info(f'Angle min: {msg.angle_min:.2f}, Angle max: {msg.angle_max:.2f}')
        self.get_logger().info(f'Angle increment: {msg.angle_increment:.4f}')

        # Calculate some statistics
        valid_ranges = [r for r in msg.ranges if r != float('inf') and not np.isnan(r)]
        if valid_ranges:
            avg_range = sum(valid_ranges) / len(valid_ranges)
            min_range = min(valid_ranges)
            max_range = max(valid_ranges)

            self.get_logger().info(f'Average range: {avg_range:.2f}m')
            self.get_logger().info(f'Min range: {min_range:.2f}m')
            self.get_logger().info(f'Max range: {max_range:.2f}m')
        else:
            self.get_logger().info('No valid range data received')


def main(args=None):
    rclpy.init(args=args)

    lidar_checker = LidarDataChecker()

    try:
        rclpy.spin(lidar_checker)
    except KeyboardInterrupt:
        lidar_checker.get_logger().info('Shutting down LiDAR Data Checker')
    finally:
        lidar_checker.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
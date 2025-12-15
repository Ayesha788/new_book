#!/usr/bin/env python3

"""
Isaac ROS Navigation Example

This example demonstrates how to use Isaac ROS for navigation tasks.
It shows integration with SLAM, path planning, and obstacle avoidance.
"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped, Point
from sensor_msgs.msg import LaserScan
from nav_msgs.msg import Odometry, OccupancyGrid
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener
from visualization_msgs.msg import Marker, MarkerArray
import numpy as np
import math


class IsaacNavigationExample(Node):
    def __init__(self):
        super().__init__('isaac_navigation_example')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.goal_pub = self.create_publisher(PoseStamped, '/goal_pose', 10)
        self.visualization_pub = self.create_publisher(MarkerArray, '/navigation_markers', 10)

        # Subscribers
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)
        self.map_sub = self.create_subscription(OccupancyGrid, '/map', self.map_callback, 10)

        # TF
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Navigation state
        self.current_pose = None
        self.current_odom = None
        self.scan_data = None
        self.map_data = None
        self.goal_pose = None
        self.path = []

        # Navigation parameters
        self.linear_speed = 0.3
        self.angular_speed = 0.4
        self.arrival_threshold = 0.5
        self.rotation_threshold = 0.1
        self.safety_distance = 0.6

        # Navigation state machine
        self.navigation_state = 'IDLE'  # IDLE, PLANNING, NAVIGATING, AVOIDING, REACHED_GOAL
        self.last_command_time = self.get_clock().now()

        # Timer for navigation control loop
        self.nav_timer = self.create_timer(0.1, self.navigation_control_loop)

        # Waypoints for demonstration
        self.waypoints = [
            (2.0, 0.0, 0.0),   # x, y, theta
            (2.0, 2.0, 1.57),  # x, y, theta
            (0.0, 2.0, 3.14),  # x, y, theta
            (0.0, 0.0, 0.0)    # x, y, theta
        ]
        self.current_waypoint_idx = 0

        self.get_logger().info('Isaac Navigation Example initialized')

    def odom_callback(self, msg):
        """Update current pose from odometry"""
        self.current_odom = msg
        self.current_pose = msg.pose.pose

    def scan_callback(self, msg):
        """Update laser scan data"""
        self.scan_data = msg

    def map_callback(self, msg):
        """Update occupancy grid map"""
        self.map_data = msg

    def navigation_control_loop(self):
        """Main navigation control loop"""
        if self.current_pose is None:
            return

        # Update navigation state based on conditions
        self.update_navigation_state()

        # Execute navigation based on current state
        if self.navigation_state == 'IDLE':
            self.execute_idle_state()
        elif self.navigation_state == 'NAVIGATING':
            self.execute_navigating_state()
        elif self.navigation_state == 'AVOIDING':
            self.execute_avoiding_state()
        elif self.navigation_state == 'REACHED_GOAL':
            self.execute_reached_goal_state()

    def update_navigation_state(self):
        """Update navigation state based on conditions"""
        if self.goal_pose is None:
            self.navigation_state = 'IDLE'
            return

        if self.navigation_state == 'IDLE':
            if self.goal_pose is not None:
                self.navigation_state = 'NAVIGATING'

        elif self.navigation_state == 'NAVIGATING':
            # Check if close to goal
            if self.is_close_to_goal():
                self.navigation_state = 'REACHED_GOAL'
            # Check for obstacles
            elif self.detect_obstacles_in_path():
                self.navigation_state = 'AVOIDING'

        elif self.navigation_state == 'AVOIDING':
            # Check if obstacle is cleared
            if not self.detect_obstacles_in_path() and not self.is_close_to_goal():
                self.navigation_state = 'NAVIGATING'
            elif self.is_close_to_goal():
                self.navigation_state = 'REACHED_GOAL'

        elif self.navigation_state == 'REACHED_GOAL':
            # Check if goal has changed
            if not self.is_close_to_goal():
                self.navigation_state = 'NAVIGATING'

    def execute_idle_state(self):
        """Execute idle state - no movement"""
        cmd_vel = Twist()
        self.cmd_vel_pub.publish(cmd_vel)

    def execute_navigating_state(self):
        """Execute navigation state - move toward goal"""
        if self.goal_pose is None:
            return

        cmd_vel = Twist()

        # Calculate direction to goal
        dx = self.goal_pose.position.x - self.current_pose.position.x
        dy = self.goal_pose.position.y - self.current_pose.position.y
        distance_to_goal = math.sqrt(dx**2 + dy**2)

        if distance_to_goal < self.arrival_threshold:
            # Close enough to goal
            cmd_vel.linear.x = 0.0
            cmd_vel.angular.z = 0.0
            self.navigation_state = 'REACHED_GOAL'
        else:
            # Calculate required rotation to face goal
            goal_angle = math.atan2(dy, dx)
            current_yaw = self.get_yaw_from_quaternion(self.current_pose.orientation)
            angle_diff = self.normalize_angle(goal_angle - current_yaw)

            # Rotate to face goal if needed
            if abs(angle_diff) > self.rotation_threshold:
                cmd_vel.angular.z = self.angular_speed if angle_diff > 0 else -self.angular_speed
                cmd_vel.linear.x = 0.0  # Don't move forward while rotating
            else:
                # Move forward toward goal
                cmd_vel.linear.x = min(self.linear_speed, distance_to_goal * 0.5)
                cmd_vel.angular.z = 0.0

        self.cmd_vel_pub.publish(cmd_vel)

    def execute_avoiding_state(self):
        """Execute obstacle avoidance state"""
        cmd_vel = Twist()

        # Simple obstacle avoidance: turn away from obstacles
        if self.scan_data:
            obstacle_direction = self.get_obstacle_direction()
            cmd_vel.angular.z = self.angular_speed if obstacle_direction > 0 else -self.angular_speed
            cmd_vel.linear.x = self.linear_speed * 0.3  # Move slowly while avoiding

        self.cmd_vel_pub.publish(cmd_vel)

    def execute_reached_goal_state(self):
        """Execute reached goal state - stop and wait for new goal"""
        cmd_vel = Twist()
        self.cmd_vel_pub.publish(cmd_vel)

        # For demonstration, set next waypoint after a delay
        if self.get_clock().now().nanoseconds > (self.last_command_time.nanoseconds + 5e9):  # 5 seconds
            self.set_next_waypoint()

    def is_close_to_goal(self):
        """Check if robot is close to goal"""
        if self.current_pose is None or self.goal_pose is None:
            return False

        dx = self.goal_pose.position.x - self.current_pose.position.x
        dy = self.goal_pose.position.y - self.current_pose.position.y
        distance = math.sqrt(dx**2 + dy**2)

        return distance < self.arrival_threshold

    def detect_obstacles_in_path(self):
        """Check if there are obstacles in the path to the goal"""
        if not self.scan_data or not self.goal_pose:
            return False

        # Check if obstacles are in the direct path to goal
        dx = self.goal_pose.position.x - self.current_pose.position.x
        dy = self.goal_pose.position.y - self.current_pose.position.y
        goal_angle = math.atan2(dy, dx)

        # Convert goal angle to laser scan index
        angle_min = self.scan_data.angle_min
        angle_increment = self.scan_data.angle_increment

        # Check a cone in the direction of the goal
        cone_width = 0.5  # radians
        for i, distance in enumerate(self.scan_data.ranges):
            angle = angle_min + i * angle_increment
            if abs(angle - goal_angle) < cone_width / 2:
                if distance < self.safety_distance and not math.isinf(distance):
                    return True

        return False

    def get_obstacle_direction(self):
        """Get the direction of the nearest obstacle"""
        if not self.scan_data:
            return 0

        # Find the closest obstacle
        min_distance = float('inf')
        min_index = -1

        for i, distance in enumerate(self.scan_data.ranges):
            if distance < min_distance and not math.isinf(distance):
                min_distance = distance
                min_index = i

        if min_index != -1:
            # Convert index to angle
            angle_min = self.scan_data.angle_min
            angle_increment = self.scan_data.angle_increment
            obstacle_angle = angle_min + min_index * angle_increment

            # Return 1 for right, -1 for left
            return 1 if obstacle_angle > 0 else -1

        return 0

    def set_next_waypoint(self):
        """Set the next waypoint in the sequence"""
        if self.current_waypoint_idx < len(self.waypoints):
            wp = self.waypoints[self.current_waypoint_idx]

            # Create goal pose
            goal = PoseStamped()
            goal.header.stamp = self.get_clock().now().to_msg()
            goal.header.frame_id = 'map'
            goal.pose.position.x = wp[0]
            goal.pose.position.y = wp[1]
            goal.pose.position.z = 0.0

            # Convert orientation (theta) to quaternion
            quat = self.euler_to_quaternion(0, 0, wp[2])
            goal.pose.orientation.x = quat[0]
            goal.pose.orientation.y = quat[1]
            goal.pose.orientation.z = quat[2]
            goal.pose.orientation.w = quat[3]

            self.goal_pose = goal.pose
            self.navigation_state = 'NAVIGATING'
            self.last_command_time = self.get_clock().now()

            self.get_logger().info(f'Navigating to waypoint {self.current_waypoint_idx + 1}: ({wp[0]}, {wp[1]})')

            self.current_waypoint_idx += 1
            if self.current_waypoint_idx >= len(self.waypoints):
                self.current_waypoint_idx = 0  # Loop back to start

    def get_yaw_from_quaternion(self, quaternion):
        """Extract yaw from quaternion"""
        siny_cosp = 2 * (quaternion.w * quaternion.z + quaternion.x * quaternion.y)
        cosy_cosp = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z)
        return math.atan2(siny_cosp, cosy_cosp)

    def normalize_angle(self, angle):
        """Normalize angle to [-pi, pi]"""
        while angle > math.pi:
            angle -= 2 * math.pi
        while angle < -math.pi:
            angle += 2 * math.pi
        return angle

    def euler_to_quaternion(self, roll, pitch, yaw):
        """Convert Euler angles to quaternion"""
        cy = math.cos(yaw * 0.5)
        sy = math.sin(yaw * 0.5)
        cp = math.cos(pitch * 0.5)
        sp = math.sin(pitch * 0.5)
        cr = math.cos(roll * 0.5)
        sr = math.sin(roll * 0.5)

        w = cr * cp * cy + sr * sp * sy
        x = sr * cp * cy - cr * sp * sy
        y = cr * sp * cy + sr * cp * sy
        z = cr * cp * sy - sr * sp * cy

        return [x, y, z, w]

    def publish_navigation_markers(self):
        """Publish visualization markers for navigation"""
        if not self.path or not self.current_pose:
            return

        marker_array = MarkerArray()
        marker_id = 0

        # Path markers
        for i, pose in enumerate(self.path):
            marker = Marker()
            marker.header.frame_id = 'map'
            marker.header.stamp = self.get_clock().now().to_msg()
            marker.ns = 'path'
            marker.id = marker_id
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD
            marker.pose.position = pose.position
            marker.pose.orientation.w = 1.0
            marker.scale.x = 0.1
            marker.scale.y = 0.1
            marker.scale.z = 0.1
            marker.color.r = 0.0
            marker.color.g = 1.0
            marker.color.b = 0.0
            marker.color.a = 0.8
            marker_array.markers.append(marker)
            marker_id += 1

        # Goal marker
        if self.goal_pose:
            marker = Marker()
            marker.header.frame_id = 'map'
            marker.header.stamp = self.get_clock().now().to_msg()
            marker.ns = 'goal'
            marker.id = marker_id
            marker.type = Marker.CYLINDER
            marker.action = Marker.ADD
            marker.pose.position = self.goal_pose.position
            marker.pose.orientation.w = 1.0
            marker.scale.x = 0.5
            marker.scale.y = 0.5
            marker.scale.z = 0.2
            marker.color.r = 1.0
            marker.color.g = 0.0
            marker.color.b = 0.0
            marker.color.a = 0.8
            marker_array.markers.append(marker)

        self.visualization_pub.publish(marker_array)


def main(args=None):
    rclpy.init(args=args)
    nav_example = IsaacNavigationExample()

    try:
        # Set initial goal for demonstration
        nav_example.set_next_waypoint()
        rclpy.spin(nav_example)
    except KeyboardInterrupt:
        nav_example.get_logger().info('Shutting down Isaac Navigation Example')
    finally:
        # Stop robot before shutdown
        cmd_vel = Twist()
        nav_example.cmd_vel_pub.publish(cmd_vel)
        nav_example.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
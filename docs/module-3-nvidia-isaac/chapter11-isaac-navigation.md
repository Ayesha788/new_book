# Chapter 11: Navigation and Path Planning

## Overview

In this chapter, we'll explore navigation and path planning in robotics, focusing on how robots use AI and NVIDIA Isaac to move intelligently through their environment. We'll cover Simultaneous Localization and Mapping (SLAM), path planning algorithms, and how these systems work together to enable autonomous navigation.

## Introduction to Robot Navigation

### The Navigation Problem
Robot navigation involves several key challenges:
- **Localization**: Where am I in the environment?
- **Mapping**: What does the environment look like?
- **Path Planning**: How do I get to my destination?
- **Motion Control**: How do I execute the plan safely?

### Navigation Stack Overview
```
Sensor Data → Perception → Localization → Mapping → Path Planning → Motion Control → Robot Movement
```

## Simultaneous Localization and Mapping (SLAM)

### What is SLAM?
SLAM is the process of building a map of an unknown environment while simultaneously tracking the robot's position within that map. This is fundamental for autonomous navigation.

### SLAM Approaches
1. **Visual SLAM**: Uses cameras for mapping
2. **LiDAR SLAM**: Uses LiDAR sensors for mapping
3. **Visual-Inertial SLAM**: Combines cameras and IMU data
4. **Multi-Sensor SLAM**: Combines multiple sensor types

### Isaac ROS Visual SLAM
NVIDIA Isaac provides GPU-accelerated visual SLAM:

```xml
<!-- Example launch file for Isaac ROS Visual SLAM -->
<launch>
  <node pkg="isaac_ros_visual_slam" exec="isaac_ros_visual_slam_node" name="visual_slam">
    <param name="enable_imu" value="true"/>
    <param name="enable_rectification" value="true"/>
    <param name="map_frame" value="map"/>
    <param name="odom_frame" value="odom"/>
    <param name="base_frame" value="base_link"/>
    <param name="publish_odom_tf" value="true"/>
  </node>
</launch>
```

### Visual SLAM Node Implementation
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, Imu
from nav_msgs.msg import Odometry
from geometry_msgs.msg import PoseStamped
import tf2_ros

class VisualSLAMNode(Node):
    def __init__(self):
        super().__init__('visual_slam_node')

        # Subscribe to stereo camera images
        self.left_image_sub = self.create_subscription(
            Image, '/camera/left/image_rect', self.left_image_callback, 10)
        self.right_image_sub = self.create_subscription(
            Image, '/camera/right/image_rect', self.right_image_callback, 10)

        # Subscribe to IMU data if available
        self.imu_sub = self.create_subscription(
            Imu, '/imu/data', self.imu_callback, 10)

        # Publish odometry
        self.odom_pub = self.create_publisher(Odometry, '/visual_slam/odometry', 10)

        # Publish pose
        self.pose_pub = self.create_publisher(PoseStamped, '/visual_slam/pose', 10)

        # Initialize TF broadcaster
        self.tf_broadcaster = tf2_ros.TransformBroadcaster(self)

        # SLAM state
        self.current_pose = None
        self.map = {}

    def left_image_callback(self, msg):
        # Process left camera image for SLAM
        # This would typically use Isaac ROS Visual SLAM
        pass

    def right_image_callback(self, msg):
        # Process right camera image for stereo depth
        pass

    def imu_callback(self, msg):
        # Use IMU data for motion prediction
        pass
```

## Path Planning Algorithms

### Global Path Planning
Global planners create a path from start to goal considering the entire map:

#### A* Algorithm
A popular path planning algorithm that balances path optimality and search efficiency:

```python
import heapq
import numpy as np

class AStarPlanner:
    def __init__(self, occupancy_grid):
        self.grid = occupancy_grid  # 2D array with 0=free, 1=occupied

    def plan_path(self, start, goal):
        """
        Plan a path from start to goal using A* algorithm
        start, goal: (x, y) coordinates
        """
        # Convert to grid coordinates
        start_grid = (int(start[0]), int(start[1]))
        goal_grid = (int(goal[0]), int(goal[1]))

        # Priority queue: (f_score, g_score, position)
        open_set = [(0, 0, start_grid)]
        came_from = {}
        g_score = {start_grid: 0}
        f_score = {start_grid: self.heuristic(start_grid, goal_grid)}

        # Keep track of visited nodes
        open_set_hash = {start_grid}

        while open_set:
            current = heapq.heappop(open_set)
            current_pos = current[2]
            open_set_hash.remove(current_pos)

            if current_pos == goal_grid:
                # Reconstruct path
                return self.reconstruct_path(came_from, current_pos)

            # Check neighbors (8-connected)
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue

                    neighbor = (current_pos[0] + dx, current_pos[1] + dy)

                    # Check bounds
                    if (0 <= neighbor[0] < self.grid.shape[0] and
                        0 <= neighbor[1] < self.grid.shape[1]):

                        # Check if cell is free
                        if self.grid[neighbor[0], neighbor[1]] == 0:
                            tentative_g_score = g_score[current_pos] + self.distance(current_pos, neighbor)

                            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                                came_from[neighbor] = current_pos
                                g_score[neighbor] = tentative_g_score
                                f_score[neighbor] = tentative_g_score + self.heuristic(neighbor, goal_grid)

                                if neighbor not in open_set_hash:
                                    heapq.heappush(open_set, (f_score[neighbor], g_score[neighbor], neighbor))
                                    open_set_hash.add(neighbor)

        return None  # No path found

    def heuristic(self, pos1, pos2):
        """Manhattan distance heuristic"""
        return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])

    def distance(self, pos1, pos2):
        """Euclidean distance"""
        return np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

    def reconstruct_path(self, came_from, current):
        """Reconstruct path from came_from dictionary"""
        path = [current]
        while current in came_from:
            current = came_from[current]
            path.append(current)
        path.reverse()
        return path
```

#### Dijkstra's Algorithm
Similar to A* but without heuristic (guaranteed shortest path):

```python
class DijkstraPlanner(AStarPlanner):
    def heuristic(self, pos1, pos2):
        # For Dijkstra, heuristic is 0 (no heuristic)
        return 0
```

### Local Path Planning
Local planners handle immediate obstacles and adjust the global path:

#### Dynamic Window Approach (DWA)
```python
import math

class DWAPlanner:
    def __init__(self, robot_params):
        self.max_speed = robot_params['max_speed']
        self.min_speed = robot_params['min_speed']
        self.max_yawrate = robot_params['max_yawrate']
        self.max_accel = robot_params['max_accel']
        self.max_dyawrate = robot_params['max_dyawrate']
        self.v_resolution = robot_params['v_resolution']
        self.yawrate_resolution = robot_params['yawrate_resolution']
        self.predict_time = robot_params['predict_time']
        self.to_goal_cost_gain = robot_params['to_goal_cost_gain']
        self.speed_cost_gain = robot_params['speed_cost_gain']
        self.obstacle_cost_gain = robot_params['obstacle_cost_gain']

    def plan_velocity(self, x, goal, obstacles):
        """
        x = [x, y, theta, v, omega]
        goal = [goal_x, goal_y]
        obstacles = [[ox, oy], ...]
        """
        # Generate velocity window
        vs = self.calc_dynamic_window(x)

        # Evaluate trajectories
        trajectories = []
        for v in np.arange(vs[0], vs[1], self.v_resolution):
            for yawrate in np.arange(vs[2], vs[3], self.yawrate_resolution):
                trajectory = self.predict_trajectory(x[3], x[4], v, yawrate)

                # Calculate costs
                to_goal_cost = self.calc_to_goal_cost(trajectory, goal)
                speed_cost = self.calc_speed_cost(trajectory)
                obstacle_cost = self.calc_obstacle_cost(trajectory, obstacles)

                # Total cost
                final_cost = (self.to_goal_cost_gain * to_goal_cost +
                             self.speed_cost_gain * speed_cost +
                             self.obstacle_cost_gain * obstacle_cost)

                trajectories.append([v, yawrate, final_cost, trajectory])

        # Find best trajectory
        if not trajectories:
            return [0.0, 0.0]  # Stop

        best_traj = min(trajectories, key=lambda x: x[2])
        return [best_traj[0], best_traj[1]]

    def calc_dynamic_window(self, x):
        """
        Calculate dynamic window based on current state
        """
        # Dynamic window from motion model
        vs = [self.min_speed, self.max_speed,
              -self.max_yawrate, self.max_yawrate]

        # Dynamic window from motion constraints
        vd = [x[3] - self.max_accel * 0.1,
              x[3] + self.max_accel * 0.1,
              x[4] - self.max_dyawrate * 0.1,
              x[4] + self.max_dyawrate * 0.1]

        # Static window
        dw = [max(vs[0], vd[0]), min(vs[1], vd[1]),
              max(vs[2], vd[2]), min(vs[3], vd[3])]

        return dw
```

## Isaac ROS Navigation Packages

### Isaac ROS Navigation Stack
Isaac provides GPU-accelerated navigation packages:

```xml
<!-- Complete navigation stack launch file -->
<launch>
  <!-- Localization -->
  <node pkg="isaac_ros_visual_slam" exec="isaac_ros_visual_slam_node" name="visual_slam">
    <param name="enable_imu" value="true"/>
  </node>

  <!-- Costmap -->
  <node pkg="nav2_costmap_2d" exec="nav2_costmap_2d" name="local_costmap">
    <param name="update_frequency" value="5.0"/>
    <param name="publish_frequency" value="2.0"/>
  </node>

  <!-- Global planner -->
  <node pkg="nav2_navfn_planner" exec="nav2_navfn_planner" name="global_planner"/>

  <!-- Local planner -->
  <node pkg="nav2_dwb_controller" exec="nav2_dwb_controller" name="local_planner"/>

  <!-- Behavior trees -->
  <node pkg="nav2_bt_navigator" exec="nav2_bt_navigator" name="bt_navigator"/>
</launch>
```

### Navigation Node Example
```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped, Twist
from nav_msgs.msg import OccupancyGrid, Odometry
from sensor_msgs.msg import LaserScan
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener
import numpy as np

class NavigationNode(Node):
    def __init__(self):
        super().__init__('navigation_node')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.goal_pub = self.create_publisher(PoseStamped, '/goal_pose', 10)

        # Subscribers
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)
        self.map_sub = self.create_subscription(OccupancyGrid, '/map', self.map_callback, 10)

        # TF
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Navigation state
        self.current_pose = None
        self.goal_pose = None
        self.map = None
        self.scan_data = None

        # Navigation parameters
        self.linear_speed = 0.5
        self.angular_speed = 0.5
        self.arrival_threshold = 0.5

        # Timer for navigation loop
        self.nav_timer = self.create_timer(0.1, self.navigation_loop)

    def odom_callback(self, msg):
        """Update current pose from odometry"""
        self.current_pose = msg.pose.pose

    def scan_callback(self, msg):
        """Update laser scan data"""
        self.scan_data = msg

    def map_callback(self, msg):
        """Update occupancy grid map"""
        self.map = msg

    def navigation_loop(self):
        """Main navigation control loop"""
        if self.current_pose is None or self.goal_pose is None:
            return

        # Calculate distance to goal
        dx = self.goal_pose.pose.position.x - self.current_pose.position.x
        dy = self.goal_pose.pose.position.y - self.current_pose.position.y
        distance = np.sqrt(dx**2 + dy**2)

        if distance < self.arrival_threshold:
            # Reached goal
            self.stop_robot()
            self.get_logger().info('Reached goal!')
            return

        # Calculate required rotation to face goal
        goal_angle = math.atan2(dy, dx)
        current_angle = self.get_yaw_from_quaternion(self.current_pose.orientation)

        angle_diff = self.normalize_angle(goal_angle - current_angle)

        # Create velocity command
        cmd_vel = Twist()

        if abs(angle_diff) > 0.1:  # Need to rotate
            cmd_vel.angular.z = self.angular_speed if angle_diff > 0 else -self.angular_speed
        else:  # Move forward
            cmd_vel.linear.x = min(self.linear_speed, distance * 0.5)  # Scale speed with distance

        # Check for obstacles
        if self.scan_data and self.detect_obstacles():
            cmd_vel.linear.x = 0.0
            cmd_vel.angular.z = 0.1  # Rotate to avoid obstacle

        self.cmd_vel_pub.publish(cmd_vel)

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

    def detect_obstacles(self):
        """Check if there are obstacles in front of robot"""
        if not self.scan_data:
            return False

        # Check the front 30 degrees of laser scan
        center_idx = len(self.scan_data.ranges) // 2
        for i in range(center_idx - 15, center_idx + 15):
            if 0 <= i < len(self.scan_data.ranges):
                if self.scan_data.ranges[i] < 0.8:  # Obstacle within 0.8m
                    return True
        return False

    def stop_robot(self):
        """Stop the robot"""
        cmd_vel = Twist()
        self.cmd_vel_pub.publish(cmd_vel)

def main(args=None):
    rclpy.init(args=args)
    nav_node = NavigationNode()

    try:
        rclpy.spin(nav_node)
    except KeyboardInterrupt:
        nav_node.get_logger().info('Navigation node stopped')
    finally:
        nav_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Navigation Behaviors

### Waypoint Following
```python
class WaypointFollower:
    def __init__(self):
        self.waypoints = []
        self.current_waypoint_idx = 0
        self.arrival_threshold = 1.0

    def set_waypoints(self, waypoints):
        """Set a sequence of waypoints to follow"""
        self.waypoints = waypoints
        self.current_waypoint_idx = 0

    def follow_waypoints(self, current_pose):
        """Follow the sequence of waypoints"""
        if self.current_waypoint_idx >= len(self.waypoints):
            return None  # All waypoints completed

        current_waypoint = self.waypoints[self.current_waypoint_idx]

        # Calculate distance to current waypoint
        dx = current_waypoint.x - current_pose.position.x
        dy = current_waypoint.y - current_pose.position.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance < self.arrival_threshold:
            # Move to next waypoint
            self.current_waypoint_idx += 1
            if self.current_waypoint_idx < len(self.waypoints):
                return self.waypoints[self.current_waypoint_idx]
            else:
                return None  # Finished all waypoints

        return current_waypoint
```

### Exploration and Coverage
```python
class ExplorationPlanner:
    def __init__(self, occupancy_grid):
        self.grid = occupancy_grid
        self.explored_area = set()

    def frontier_exploration(self):
        """
        Find frontiers (boundaries between known and unknown space)
        and plan paths to explore them
        """
        frontiers = self.find_frontiers()

        if not frontiers:
            return None  # No frontiers to explore

        # Select the closest frontier
        robot_pos = self.get_robot_position()
        closest_frontier = min(frontiers, key=lambda f: self.distance(robot_pos, f))

        return closest_frontier

    def find_frontiers(self):
        """Find frontiers in the occupancy grid"""
        frontiers = []

        for i in range(1, self.grid.shape[0]-1):
            for j in range(1, self.grid.shape[1]-1):
                if self.grid[i, j] == -1:  # Unknown space
                    # Check if adjacent to free space
                    if self.has_free_neighbor(i, j):
                        frontiers.append((i, j))

        return frontiers

    def has_free_neighbor(self, i, j):
        """Check if cell has at least one free neighbor"""
        for di in [-1, 0, 1]:
            for dj in [-1, 0, 1]:
                ni, nj = i + di, j + dj
                if (0 <= ni < self.grid.shape[0] and
                    0 <= nj < self.grid.shape[1] and
                    self.grid[ni, nj] == 0):  # Free space
                    return True
        return False
```

## Navigation in Dynamic Environments

### Dynamic Obstacle Avoidance
```python
class DynamicObstacleAvoider:
    def __init__(self):
        self.tracked_objects = {}  # Track moving objects
        self.prediction_horizon = 2.0  # seconds

    def update_object_tracking(self, detection_list):
        """Update tracked objects with new detections"""
        for detection in detection_list.detections:
            obj_id = detection.results[0].id
            position = detection.bbox.center

            if obj_id in self.tracked_objects:
                # Update existing track
                self.tracked_objects[obj_id]['position'] = position
                self.tracked_objects[obj_id]['last_seen'] = self.get_time()
            else:
                # Create new track
                self.tracked_objects[obj_id] = {
                    'position': position,
                    'velocity': (0, 0),
                    'last_seen': self.get_time()
                }

    def predict_object_trajectories(self):
        """Predict where dynamic objects will be in the future"""
        predictions = {}

        for obj_id, obj_data in self.tracked_objects.items():
            # Simple constant velocity prediction
            velocity = self.estimate_velocity(obj_id)
            predicted_pos = (
                obj_data['position'].x + velocity[0] * self.prediction_horizon,
                obj_data['position'].y + velocity[1] * self.prediction_horizon
            )
            predictions[obj_id] = predicted_pos

        return predictions

    def estimate_velocity(self, obj_id):
        """Estimate velocity of tracked object"""
        # This would typically use a Kalman filter or similar
        # For simplicity, returning zero velocity
        return (0.0, 0.0)
```

## Isaac Sim for Navigation Training

### Creating Navigation Scenarios
Isaac Sim allows you to create complex navigation scenarios for training:

```python
# Example Python code for Isaac Sim navigation scenario
import omni
from pxr import Gf
import numpy as np

def create_navigation_scenario():
    """
    Create a navigation scenario in Isaac Sim
    """
    # Create a room with obstacles
    room_size = [10, 10, 3]  # x, y, z
    create_room(room_size)

    # Add obstacles
    obstacles = [
        {'position': [2, 2, 0.5], 'size': [1, 1, 1]},
        {'position': [5, 5, 0.5], 'size': [2, 0.5, 1]},
        {'position': [7, 2, 0.5], 'size': [0.5, 2, 1]}
    ]

    for i, obs in enumerate(obstacles):
        create_obstacle(f"obstacle_{i}", obs['position'], obs['size'])

    # Add a robot
    robot_position = [0, 0, 0.2]
    create_robot("navigation_robot", robot_position)

    # Add navigation goals
    goals = [
        {'position': [8, 8, 0.1], 'name': 'goal_1'},
        {'position': [2, 8, 0.1], 'name': 'goal_2'}
    ]

    for goal in goals:
        create_navigation_goal(goal['name'], goal['position'])

def create_room(size):
    """Create a simple room environment"""
    # Implementation would use Isaac Sim API
    pass

def create_obstacle(name, position, size):
    """Create an obstacle in the environment"""
    # Implementation would use Isaac Sim API
    pass
```

## Navigation Performance Metrics

### Common Metrics
1. **Path Efficiency**: Ratio of optimal path length to actual path length
2. **Success Rate**: Percentage of successful navigation attempts
3. **Time to Goal**: Time taken to reach destination
4. **Safety**: Number of collisions or near-misses
5. **Smoothness**: Continuity of the planned path

### Evaluation Node
```python
class NavigationEvaluator:
    def __init__(self):
        self.start_time = None
        self.path_length = 0.0
        self.collision_count = 0
        self.trajectory = []

    def start_evaluation(self, start_pose):
        """Start navigation evaluation"""
        self.start_time = self.get_time()
        self.path_length = 0.0
        self.collision_count = 0
        self.trajectory = [start_pose]

    def update_evaluation(self, current_pose):
        """Update evaluation metrics"""
        if len(self.trajectory) > 0:
            last_pose = self.trajectory[-1]
            # Calculate distance traveled
            dx = current_pose.position.x - last_pose.position.x
            dy = current_pose.position.y - last_pose.position.y
            dist = math.sqrt(dx**2 + dy**2)
            self.path_length += dist

        self.trajectory.append(current_pose)

    def evaluate_performance(self, goal_pose, success):
        """Calculate final performance metrics"""
        if not self.start_time:
            return None

        execution_time = self.get_time() - self.start_time

        # Calculate distance to goal (if successful)
        if success:
            dx = goal_pose.position.x - self.trajectory[-1].position.x
            dy = goal_pose.position.y - self.trajectory[-1].position.y
            final_distance = math.sqrt(dx**2 + dy**2)
        else:
            final_distance = float('inf')

        metrics = {
            'execution_time': execution_time,
            'path_length': self.path_length,
            'collision_count': self.collision_count,
            'final_distance': final_distance,
            'success': success
        }

        return metrics
```

## Best Practices for Navigation

### 1. Multi-Layer Safety
- **Reactive Avoidance**: Immediate obstacle response
- **Predictive Planning**: Plan around predicted obstacles
- **Emergency Stops**: Hard stops when needed

### 2. Robust Localization
- **Multi-Sensor Fusion**: Combine multiple localization methods
- **Regular Calibration**: Keep sensors properly calibrated
- **Failure Detection**: Detect and handle localization failures

### 3. Adaptive Planning
- **Dynamic Replanning**: Update plans as environment changes
- **Risk Assessment**: Consider uncertainty in planning
- **Alternative Paths**: Have backup plans ready

### 4. Simulation-to-Reality Transfer
- **Domain Randomization**: Train in varied simulated conditions
- **Reality Gap Analysis**: Identify and address sim-to-real differences
- **Progressive Transfer**: Gradually increase real-world complexity

## Chapter Summary

In this chapter, you learned:
- The fundamentals of robot navigation and SLAM
- Path planning algorithms (A*, DWA, etc.)
- How to use Isaac ROS navigation packages
- Navigation behaviors like waypoint following
- Dynamic obstacle handling
- Evaluation metrics for navigation systems
- Best practices for robust navigation

Navigation is a critical capability for autonomous robots, enabling them to move safely and efficiently through their environment. With NVIDIA Isaac's acceleration, these navigation capabilities can run in real-time on robotic platforms.

## Practice Tasks

1. Set up Isaac ROS Visual SLAM and test with stereo camera
2. Implement a simple A* path planner
3. Create a navigation node that follows waypoints
4. Test navigation in Isaac Sim with various obstacle configurations
5. Evaluate navigation performance metrics in simulation

## Next Steps

In the next chapter, we'll explore intelligent decision making in robotics, building on navigation and perception to create robots that can make complex decisions based on their understanding of the environment and task requirements.
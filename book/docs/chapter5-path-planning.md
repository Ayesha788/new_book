# Chapter 5: Path Planning and Navigation for Humanoid Robots

## Introduction to Path Planning

Path planning is a critical component of humanoid robotics, enabling robots to navigate complex environments while avoiding obstacles and reaching desired goals. Unlike wheeled robots, humanoid robots face unique challenges due to their bipedal locomotion, balance constraints, and complex kinematics.

## Types of Path Planning

### Global Path Planning

Global path planning involves finding an optimal path from a start position to a goal position based on a known map of the environment. For humanoid robots, this must account for:

- **Footstep planning**: Ensuring stable placement of feet along the path
- **Center of Mass (CoM) trajectory**: Maintaining balance throughout the path
- **Kinematic constraints**: Joint limits and workspace boundaries
- **Stability requirements**: Maintaining static or dynamic balance

### Local Path Planning

Local path planning handles real-time obstacle avoidance and path adjustments based on sensor data. For humanoid robots, this includes:

- **Dynamic obstacle avoidance**: Moving objects in the environment
- **Reactive stepping**: Adjusting foot placement in real-time
- **Balance recovery**: Adjusting posture to maintain stability

## Footstep Planning Algorithms

### A* Algorithm for Footstep Planning

The A* algorithm can be adapted for humanoid footstep planning by considering the robot's bipedal nature:

```python
import numpy as np
from heapq import heappop, heappush

class FootstepPlanner:
    def __init__(self, map_resolution=0.1):
        self.resolution = map_resolution
        # Additional humanoid-specific parameters
        self.step_length = 0.3  # Maximum step length
        self.step_width = 0.2   # Lateral step capability
        self.max_step_height = 0.1  # Maximum step-over height

    def plan_footsteps(self, start_pose, goal_pose, occupancy_grid):
        """
        Plan a sequence of footsteps from start to goal
        """
        # Convert to grid coordinates
        start_cell = self.pose_to_grid(start_pose)
        goal_cell = self.pose_to_grid(goal_pose)

        # Priority queue for A* algorithm
        open_set = [(0, start_cell, [])]  # (f_score, cell, path)
        closed_set = set()

        while open_set:
            current_f, current_cell, current_path = heappop(open_set)

            if current_cell == goal_cell:
                return current_path + [current_cell]

            if current_cell in closed_set:
                continue

            closed_set.add(current_cell)

            # Generate possible next footsteps
            for next_step in self.get_valid_footsteps(current_cell, occupancy_grid):
                if next_step not in closed_set:
                    new_path = current_path + [current_cell]
                    g_score = len(new_path)  # Simple path cost
                    h_score = self.heuristic(next_step, goal_cell)
                    f_score = g_score + h_score

                    heappush(open_set, (f_score, next_step, new_path))

        return None  # No path found

    def get_valid_footsteps(self, current_cell, occupancy_grid):
        """
        Generate valid next footsteps based on humanoid constraints
        """
        footsteps = []
        # Consider possible step directions and distances
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue  # Skip current position

                next_cell = (current_cell[0] + dx, current_cell[1] + dy)

                # Check if the next position is valid
                if self.is_valid_footstep(next_cell, occupancy_grid):
                    footsteps.append(next_cell)

        return footsteps

    def is_valid_footstep(self, cell, occupancy_grid):
        """
        Check if a footstep is valid (not in collision)
        """
        if (cell[0] < 0 or cell[0] >= occupancy_grid.shape[0] or
            cell[1] < 0 or cell[1] >= occupancy_grid.shape[1]):
            return False  # Out of bounds

        return occupancy_grid[cell] == 0  # Free space
```

## Navigation Stack for Humanoid Robots

### Overview

The navigation stack for humanoid robots extends the traditional ROS navigation stack with humanoid-specific components:

1. **Costmap Generation**: Creating costmaps that account for humanoid-specific constraints
2. **Footstep Planner**: Planning stable footsteps
3. **Trajectory Controller**: Generating dynamically stable trajectories
4. **Local Planner**: Adjusting path based on sensor feedback
5. **Recovery Behaviors**: Handling navigation failures while maintaining balance

### Costmap Configuration for Humanoid Robots

```yaml
# costmap_common_params.yaml
map_type: costmap

# Robot footprint - considering the humanoid's base
footprint: [[-0.3, -0.2], [-0.3, 0.2], [0.3, 0.2], [0.3, -0.2]]
footprint_padding: 0.05

# Obstacle range should account for sensor placement on humanoid
obstacle_range: 3.0
raytrace_range: 4.0

# Humanoid-specific inflation
inflation_radius: 0.5
cost_scaling_factor: 5.0

# Sensors used for costmap
observation_sources: laser_scan_sensor point_cloud_sensor

laser_scan_sensor:
  sensor_frame: base_scan
  topic: /scan
  observation_range: 3.0
  raytrace_range: 4.0
  max_obstacle_height: 2.0
  min_obstacle_height: 0.0
  obstacle_range: 3.0
```

## Dynamic Balance and Walking Patterns

### ZMP (Zero Moment Point) Planning

For stable bipedal locomotion, humanoid robots must maintain their ZMP within the support polygon defined by their feet:

```python
class ZMPController:
    def __init__(self):
        self.com_height = 0.8  # Center of mass height
        self.gravity = 9.81
        self.omega = np.sqrt(self.gravity / self.com_height)

    def compute_zmp_trajectory(self, footsteps, step_time, double_support_ratio=0.2):
        """
        Compute ZMP trajectory based on footsteps
        """
        zmp_trajectory = []

        for i, (foot_pos, foot_yaw) in enumerate(footsteps):
            # Calculate ZMP for single support phase
            single_support_time = step_time * (1 - double_support_ratio)

            # ZMP moves from previous foot position to current foot position
            if i > 0:
                prev_foot_pos = footsteps[i-1][0]
                for t in np.arange(0, single_support_time, 0.01):
                    # Interpolate ZMP position
                    alpha = t / single_support_time
                    zmp_x = (1 - alpha) * prev_foot_pos[0] + alpha * foot_pos[0]
                    zmp_y = (1 - alpha) * prev_foot_pos[1] + alpha * foot_pos[1]
                    zmp_trajectory.append([zmp_x, zmp_y])

        return zmp_trajectory
```

## Practical Implementation

### Setting up Navigation for a Humanoid Robot

1. **Create a navigation configuration package**:
```bash
mkdir -p ~/ros2_ws/src/humanoid_navigation/config
mkdir -p ~/ros2_ws/src/humanoid_navigation/launch
mkdir -p ~/ros2_ws/src/humanoid_navigation/maps
```

2. **Create a launch file for navigation**:
```python
# launch/navigation.launch.py
import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    # Config file paths
    config_dir = os.path.join(
        get_package_share_directory('humanoid_navigation'),
        'config'
    )

    return LaunchDescription([
        # AMCL for localization
        Node(
            package='nav2_amcl',
            executable='amcl',
            name='amcl',
            parameters=[os.path.join(config_dir, 'amcl.yaml')]
        ),

        # Map server
        Node(
            package='nav2_map_server',
            executable='map_server',
            name='map_server',
            parameters=[os.path.join(config_dir, 'map_server.yaml')]
        ),

        # Planner server
        Node(
            package='nav2_bt_navigator',
            executable='bt_navigator',
            name='bt_navigator',
            parameters=[os.path.join(config_dir, 'bt_navigator.yaml')]
        ),

        # Controller server
        Node(
            package='nav2_controller',
            executable='controller_server',
            name='controller_server',
            parameters=[os.path.join(config_dir, 'controller.yaml')]
        )
    ])
```

## Challenges in Humanoid Navigation

### Balance Maintenance

The primary challenge in humanoid navigation is maintaining balance while executing navigation commands. This requires:

- Real-time balance feedback and adjustment
- Coordination between walking pattern generation and navigation planning
- Robust recovery behaviors when balance is compromised

### Terrain Adaptation

Humanoid robots must adapt to various terrains:

- Stairs and steps
- Uneven surfaces
- Sloped terrain
- Narrow passages

## Practice Tasks

1. Implement a simple footstep planner that can navigate around static obstacles
2. Create a ZMP-based walking pattern generator
3. Integrate the footstep planner with a basic navigation stack
4. Test navigation performance on different terrain types in simulation
5. Implement recovery behaviors for when the robot loses balance during navigation

## Summary

Path planning and navigation for humanoid robots requires specialized algorithms that account for the robot's bipedal nature and balance constraints. By combining traditional path planning techniques with humanoid-specific considerations, we can enable robots to navigate complex environments safely and efficiently.
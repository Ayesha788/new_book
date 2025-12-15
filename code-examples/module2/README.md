# Module 2: Simulation Environments Code Examples

This directory contains code examples for Module 2 of the Physical AI & Humanoid Robotics book, focusing on simulation environments including Gazebo and Unity.

## Examples Included

### 1. Simple Gazebo Plugin (`simple_gazebo_plugin.cpp`)
A basic differential drive plugin for Gazebo that:
- Subscribes to `/cmd_vel` ROS topic
- Publishes odometry to `/odom` topic
- Controls wheel joints based on velocity commands
- Demonstrates integration between Gazebo physics and ROS

**Usage:**
1. Compile the plugin with your Gazebo workspace
2. Add the plugin to your robot's SDF/URDF:
```xml
<gazebo>
  <plugin name="diff_drive" filename="libdiff_drive.so">
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
  </plugin>
</gazebo>
```

### 2. Simple Navigation Node (`simple_navigation.py`)
A Python ROS 2 node that:
- Subscribes to laser scan data (`/scan`)
- Subscribes to odometry data (`/odom`)
- Publishes velocity commands (`/cmd_vel`) to avoid obstacles
- Demonstrates basic navigation in simulation

**Usage:**
```bash
# Run in a simulated environment with laser scanner and differential drive
ros2 run my_package simple_navigation.py
```

## Running the Examples

### Prerequisites
- ROS 2 Humble Hawksbill
- Gazebo (with ros_gz bridge)
- Basic robot model with differential drive and laser scanner

### Setup
1. Make sure your ROS 2 environment is sourced:
```bash
source /opt/ros/humble/setup.bash
source install/setup.bash  # If using custom workspace
```

2. For the Gazebo plugin example:
   - Compile with your robot package
   - Launch a Gazebo world with your robot

3. For the navigation example:
   - Ensure your robot publishes laser scan data
   - Ensure your robot accepts velocity commands on `/cmd_vel`

## Key Concepts Demonstrated

- **Simulation Integration**: How ROS nodes interact with simulation environments
- **Sensor Processing**: Handling laser scan data for navigation
- **Control Systems**: Converting sensor data to motion commands
- **Plugin Development**: Creating Gazebo plugins for robot simulation
- **Navigation**: Basic obstacle avoidance in simulated environments

## Verification Steps

For each example, verify:
1. The code compiles without errors (for C++ examples)
2. Nodes start without errors
3. Topics are being published/subscribed correctly
4. Robot behavior is as expected in simulation

## Troubleshooting

- **Missing Topics**: Ensure Gazebo simulation is running with proper robot configuration
- **Compilation Errors**: Check Gazebo and ROS 2 development libraries are installed
- **No Movement**: Verify joint names match your robot model
- **Sensor Issues**: Confirm sensor topics match your robot's configuration
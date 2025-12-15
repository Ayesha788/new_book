# Module 3: AI Perception & Navigation Code Examples

This directory contains code examples for Module 3 of the Physical AI & Humanoid Robotics book, focusing on AI perception and navigation using NVIDIA Isaac.

## Examples Included

### 1. Isaac Perception Pipeline (`isaac_perception_pipeline.py`)
A complete perception pipeline example that demonstrates:
- Integration with Isaac ROS DNN packages (simulated)
- Synchronized image and camera info processing
- Object detection simulation
- TF broadcasting for coordinate frames
- Debug image publishing for visualization

**Key Concepts:**
- Sensor data synchronization
- Perception pipeline architecture
- Object detection workflows
- Coordinate frame management

**Usage:**
```bash
# Make sure you have camera data being published on /camera/image_raw and /camera/camera_info
ros2 run module3_examples isaac_perception_pipeline.py
```

### 2. Isaac Navigation Example (`isaac_navigation_example.py`)
A complete navigation example that demonstrates:
- SLAM and localization integration
- Path planning and execution
- Obstacle detection and avoidance
- Waypoint following
- State machine-based navigation
- Visualization with RViz markers

**Key Concepts:**
- Navigation state machine
- Obstacle avoidance algorithms
- Waypoint navigation
- Safety considerations
- Visualization techniques

**Usage:**
```bash
# Make sure you have odometry on /odom, laser scan on /scan, and map on /map
ros2 run module3_examples isaac_navigation_example.py
```

## Running the Examples

### Prerequisites
- ROS 2 Humble Hawksbill
- Isaac ROS packages installed
- Appropriate sensors (camera, LiDAR, IMU) or simulation environment
- Basic robot model with differential drive

### Setup
1. Make sure your ROS 2 environment is sourced:
```bash
source /opt/ros/humble/setup.bash
source install/setup.bash  # If using custom workspace
```

2. For perception example:
   - Ensure camera is publishing images on `/camera/image_raw`
   - Ensure camera info is published on `/camera/camera_info`

3. For navigation example:
   - Ensure odometry is published on `/odom`
   - Ensure laser scan is published on `/scan`
   - Ensure map is published on `/map` (if using global planning)

### Testing with Simulation
To test these examples in a simulated environment:

1. **Launch a robot simulation** (e.g., TurtleBot3 in Gazebo):
```bash
# Launch simulation environment
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
```

2. **Run the navigation example**:
```bash
ros2 run module3_examples isaac_navigation_example.py
```

3. **Visualize in RViz2**:
```bash
# In another terminal
rviz2
```

Add displays for:
- Robot model (RobotModel)
- Laser scan (LaserScan)
- Path (Path)
- Goal markers (VisualizationMarkers)

## Key Technologies Demonstrated

- **Isaac ROS**: GPU-accelerated robotics packages
- **Computer Vision**: Object detection and image processing
- **SLAM**: Simultaneous Localization and Mapping
- **Path Planning**: Global and local planning algorithms
- **Behavior Trees**: Decision making and state management
- **Sensor Fusion**: Combining multiple sensor inputs

## Understanding the Code Structure

### Perception Pipeline Structure
```
Raw Sensor Data → Synchronization → Processing → Detection → Output
```

### Navigation System Structure
```
Localization → Mapping → Path Planning → Obstacle Avoidance → Control
```

## Verification Steps

For each example, verify:
1. The code runs without errors
2. Appropriate topics are being published/subscribed
3. Robot behavior matches expectations
4. Visualization markers appear correctly in RViz (where applicable)

## Troubleshooting

- **Missing Topics**: Ensure all required sensor topics are being published
- **TF Issues**: Verify proper TF tree structure between frames
- **Performance**: Check CPU/GPU usage and optimize as needed
- **Parameter Issues**: Adjust navigation and perception parameters for your robot

## Extending the Examples

These examples provide a foundation that can be extended for specific applications:
- Add more sophisticated perception algorithms
- Integrate with Isaac Sim for advanced simulation
- Add machine learning components for adaptive behavior
- Implement multi-robot coordination
- Add advanced planning algorithms

## Integration with Isaac Ecosystem

These examples demonstrate how to integrate with the broader Isaac ecosystem:
- Use Isaac ROS packages for GPU acceleration
- Prepare for Isaac Sim integration for training
- Structure code for Isaac Apps compatibility
- Follow Isaac best practices for performance
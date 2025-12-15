# Chapter 5: Introduction to Gazebo Simulation

## Overview

Welcome to Module 2 of our Physical AI and Humanoid Robotics course! In this chapter, we'll introduce you to Gazebo, one of the most popular simulation environments in robotics. Gazebo provides realistic physics simulation, high-quality graphics, and accurate sensor simulation - making it an essential tool for robotics development and testing.

## What is Gazebo?

Gazebo is a 3D simulation environment for robotics that provides:
- **Realistic Physics Simulation**: Accurate modeling of real-world physics with engines like ODE, Bullet, and Simbody
- **High-Quality Graphics**: Visual rendering using the OGRE engine for realistic environments
- **Sensor Simulation**: Accurate simulation of cameras, LiDAR, IMU, GPS, and other sensors
- **Robot Models**: Support for URDF and SDF robot descriptions
- **Environment Modeling**: Tools to create complex indoor and outdoor environments

### The Robot Nervous System in Simulation

Just like ROS 2 serves as the "nervous system" for real robots, Gazebo serves as the "virtual world" where robots can learn and practice before entering the real world. This is crucial for:
- Testing robot behaviors safely
- Developing and debugging algorithms
- Training AI models with synthetic data
- Validating control systems

## Installing Gazebo

Gazebo comes with ROS 2 installations, but you may need to install additional components:

```bash
# Install Gazebo Harmonic (or appropriate version for your ROS 2 distribution)
sudo apt update
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-plugins ros-humble-gazebo-dev

# For newer ROS 2 distributions, replace 'humble' with your distribution name
```

## Basic Gazebo Concepts

### World Files (SDF Format)
Gazebo uses SDF (Simulation Description Format) to define simulation environments:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="default">
    <!-- Include a default model -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Include default lighting -->
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Add your robot or objects here -->
    <model name="my_robot">
      <!-- Robot definition -->
    </model>
  </world>
</sdf>
```

### Models
Models in Gazebo represent:
- Robots (described in URDF/SDF)
- Environment objects (tables, walls, etc.)
- Sensors and actuators
- Static and dynamic objects

### Plugins
Gazebo uses plugins to:
- Connect to ROS 2 topics and services
- Implement custom physics behaviors
- Add sensor interfaces
- Control simulation parameters

## Running Your First Gazebo Simulation

Let's start with a simple example:

```bash
# Launch Gazebo with an empty world
ros2 launch gazebo_ros empty_world.launch.py

# Launch with a specific world file
ros2 launch gazebo_ros empty_world.launch.py world_name:=path/to/world.sdf
```

### Gazebo GUI Components
When Gazebo launches, you'll see several components:
- **3D View**: Main simulation environment
- **Scene Graph**: Hierarchical view of objects in the simulation
- **Layers**: Different visualization layers
- **Tools**: Simulation controls and object placement tools

## Interacting with Gazebo

### Command Line Tools
```bash
# List all Gazebo topics
ros2 topic list | grep gazebo

# Get model states
ros2 topic echo /model_states

# Set model pose
ros2 service call /set_entity_state gazebo_msgs/srv/SetEntityState "{
  state: {
    name: 'my_robot',
    pose: {
      position: {x: 1.0, y: 0.0, z: 0.0},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  }
}"
```

### Spawning Objects
```bash
# Spawn a model from the model database
ros2 run gazebo_ros spawn_entity.py -entity my_box -database box -z 0.5

# Spawn from a file
ros2 run gazebo_ros spawn_entity.py -entity my_robot -file path/to/robot.urdf -z 1.0
```

## Gazebo + ROS 2 Integration

The integration between Gazebo and ROS 2 is seamless through the `ros_gz` bridge packages:

### Key Topics
- `/clock` - Simulation time
- `/model_states` - Positions of all models
- `/joint_states` - Joint positions for robots
- `/tf` and `/tf_static` - Transform information

### Key Services
- `/spawn_entity` - Add new objects to simulation
- `/delete_entity` - Remove objects from simulation
- `/reset_simulation` - Reset the entire simulation
- `/set_entity_state` - Modify object positions

## Practical Example: Moving a Simple Robot

Let's create a simple differential drive robot simulation:

1. **Create a launch file** (`launch/gazebo_diff_drive.launch.py`):
```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_launch_package_share_directory

def generate_launch_description():
    ld = LaunchDescription()

    # Launch Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([get_launch_package_share_directory('gazebo_ros'), '/launch/gazebo.launch.py']),
    )

    ld.add_action(gazebo)

    return ld
```

2. **Launch the simulation**:
```bash
ros2 launch your_package gazebo_diff_drive.launch.py
```

## Best Practices for Gazebo Simulation

1. **Start Simple**: Begin with basic models and gradually add complexity
2. **Validate Physics**: Ensure your robot model has realistic mass, friction, and collision properties
3. **Use Appropriate Time Steps**: Balance accuracy with performance
4. **Test Transitions**: Always test that behaviors work in both simulation and reality
5. **Document Differences**: Keep track of sim-to-real differences for better transfer learning

## Chapter Summary

In this chapter, you learned:
- What Gazebo is and why it's important for robotics
- How to install and run basic Gazebo simulations
- Key concepts: worlds, models, plugins, and SDF
- How Gazebo integrates with ROS 2
- Basic interaction methods through command line tools

Gazebo provides a safe, controlled environment where robots can learn and develop skills before encountering the real world. This "digital twin" approach is fundamental to modern robotics development, allowing for rapid iteration and testing without risk to expensive hardware or human safety.

## Practice Tasks

1. Launch Gazebo with the empty world and explore the interface
2. Spawn a simple object (box, sphere, or cylinder) into the simulation
3. Examine the topics that Gazebo publishes using `ros2 topic list` and `ros2 topic echo`
4. Create a simple SDF world file with a ground plane and a light source

## Next Steps

In the next chapter, we'll dive deeper into advanced Gazebo concepts including custom world creation, physics parameters, and sensor simulation. We'll also explore how to create more complex robot models for simulation.
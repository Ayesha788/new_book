# Version-Specific Documentation for Different Technology Versions

## Overview

This document provides version-specific instructions and configurations for different technology stacks used in the Physical AI & Humanoid Robotics course. It ensures compatibility across different ROS 2 distributions, simulation environments, and hardware platforms.

## ROS 2 Distribution Compatibility

### ROS 2 Humble Hawksbill (Recommended - LTS)
**Target Audience**: Production environments, long-term projects
**Support Period**: Until May 2027
**Hardware Support**: NVIDIA Jetson AGX Orin, Jetson Orin NX, x86_64, ARM64

#### Installation
```bash
# Ubuntu 22.04 LTS
sudo apt update && sudo apt install curl gnupg lsb-release
curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key | sudo gpg --dearmor -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install ros-humble-desktop ros-humble-ros-base
sudo apt install ros-dev-tools
```

#### Course Module Compatibility
- **Module 1 (ROS 2)**: Full compatibility
- **Module 2 (Simulation)**: Gazebo Garden, Ignition Dome
- **Module 3 (AI Perception)**: Isaac ROS 3.0+
- **Module 4 (Humanoid)**: Full compatibility

### ROS 2 Iron Irwin (Current)
**Target Audience**: Latest features, development work
**Support Period**: Until November 2024
**Note**: Not recommended for long-term projects

#### Installation
```bash
# Ubuntu 22.04 LTS
# (Similar to Humble but with 'iron' instead of 'humble')
sudo apt install ros-iron-desktop ros-iron-ros-base
```

#### Course Module Compatibility
- **Module 1 (ROS 2)**: Full compatibility with minor API changes
- **Module 2 (Simulation)**: Gazebo Garden (recommended)
- **Module 3 (AI Perception)**: Isaac ROS 3.1+
- **Module 4 (Humanoid)**: Full compatibility

### ROS 2 Rolling Ridley (Development)
**Target Audience**: Cutting-edge development, testing
**Note**: Not recommended for educational use due to instability

## Simulation Environment Versions

### Gazebo Compatibility

#### Gazebo Garden (Recommended for Humble)
**Version**: 7.x series
**Features**:
- Improved rendering performance
- Better plugin system
- Enhanced physics accuracy

**Installation for ROS 2 Humble**:
```bash
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-plugins ros-humble-gazebo-dev
```

#### Gazebo Fortress (Alternative)
**Version**: 6.x series
**Features**:
- Compatible with ROS 2 Galactic/Humble
- Good performance for educational purposes

**Installation**:
```bash
# If Garden is not available
sudo apt install gazebo11 libgazebo11-dev ros-humble-gazebo-ros-pkgs
```

### Isaac Sim Compatibility

#### Isaac Sim 2023.1.0 (Recommended)
**Requirements**:
- NVIDIA GPU with CUDA 11.8+
- RTX series recommended
- Omniverse 2022.2.1+

**Installation**:
```bash
# Download from NVIDIA Developer website
# Follow Isaac Sim installation guide
```

#### Isaac Sim 2022.2.1 (Legacy Support)
**Requirements**:
- NVIDIA GPU with CUDA 11.6+
- Compatible with older hardware

### Unity Version Compatibility

#### Unity 2022.3 LTS (Recommended)
**Target**: Long-term support for robotics projects
**Features**:
- ML-Agents v2 compatibility
- XR plugin framework support
- Long-term support until 2024

**Installation**:
- Use Unity Hub to install 2022.3.x LTS
- Install ROS# package for ROS communication

#### Unity 2021.3 LTS (Legacy Support)
**Target**: Projects requiring older Unity features
**Note**: ML-Agents support may be limited

## Hardware Platform Versions

### NVIDIA Jetson Platforms

#### Jetson AGX Orin (Recommended)
**Specifications**:
- 2048-core NVIDIA Ampere GPU
- 12-core ARM v8.4 64-bit CPU
- 32GB LPDDR5 memory
- 128GB eMMC 5.1 storage

**Isaac ROS Compatibility**:
- Full compatibility with Isaac ROS 3.x
- Supports all perception packages
- Recommended for complex VLA systems

**Setup**:
```bash
# Flash JetPack 5.1+ (based on Ubuntu 20.04)
# Install Isaac ROS packages
sudo apt install ros-humble-isaac-ros-common
```

#### Jetson Orin NX
**Specifications**:
- 1024-core NVIDIA Ampere GPU
- 8-core ARM v8.4 64-bit CPU
- 8GB LPDDR5 memory

**Isaac ROS Compatibility**:
- Good compatibility with Isaac ROS 3.x
- Limited by memory for complex models
- Suitable for educational purposes

#### Jetson Nano
**Specifications**:
- 128-core NVIDIA Maxwell GPU
- Quad-core ARM A57 CPU
- 4GB LPDDR4 memory

**Isaac ROS Compatibility**:
- Limited to basic perception packages
- Not recommended for complex VLA systems
- Good for learning basic concepts

### x86_64 Platforms

#### High-Performance Desktop (Recommended for Development)
**Specifications**:
- Multi-core CPU (8+ cores recommended)
- NVIDIA RTX GPU (3060 or better)
- 32GB+ RAM
- SSD storage

**Isaac ROS Compatibility**:
- Full compatibility with all packages
- Supports Isaac Sim for development
- Recommended for development work

#### Standard Laptop (Minimum Requirement)
**Specifications**:
- Quad-core CPU
- Integrated GPU or entry-level discrete GPU
- 16GB RAM minimum
- SSD storage preferred

**Isaac ROS Compatibility**:
- Basic perception packages only
- Limited Isaac Sim usage
- Suitable for learning ROS 2 concepts

## Code Example Version Differences

### Module 1: ROS 2 Fundamentals

#### Humble vs Iron API Differences
```python
# Humble (stable)
from rclpy.qos import QoSProfile
qos_profile = QoSProfile(depth=10)

# Iron (newer features)
from rclpy.qos import QoSProfile
qos_profile = QoSProfile(depth=10)
# Additional features may be available in Iron
```

### Module 2: Simulation Environments

#### Gazebo Garden vs Fortress
```xml
<!-- Gazebo Garden (Humble) -->
<plugin filename="libgazebo_ros_diff_drive.so" name="diff_drive">
    <ros>
        <namespace>/robot</namespace>
    </ros>
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
</plugin>

<!-- Fortress (older) may have different parameter names -->
<plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
    <commandTopic>cmd_vel</commandTopic>
    <odometryTopic>odom</odometryTopic>
</plugin>
```

### Module 3: AI Perception

#### Isaac ROS Version Differences

**Isaac ROS 2.x to 3.x Migration**:
```python
# Isaac ROS 2.x
from isaac_ros_utils import ImageFormat
format_converter = ImageFormat()

# Isaac ROS 3.x
from isaac_ros_image_proc import ImageFormatConverter
format_converter = ImageFormatConverter()
```

### Module 4: Humanoid Robotics

#### Different Control Frameworks
```python
# For newer systems (Isaac ROS 3.x)
from isaac_ros.control import JointController
controller = JointController()

# For older systems (Isaac ROS 2.x)
from isaac_ros.ros_control import ROSControl
controller = ROSControl()
```

## Version Migration Guide

### Upgrading from ROS 2 Galactic to Humble
```bash
# 1. Backup current workspace
cp -r ~/ros2_ws ~/ros2_ws_backup

# 2. Install Humble
# (Follow Humble installation guide)

# 3. Update package.xml dependencies
# Change <depend> tags from galactic to humble packages

# 4. Update CMakeLists.txt
# Update find_package calls to use humble versions

# 5. Test and rebuild
cd ~/ros2_ws
colcon build
```

### Isaac ROS Version Updates
```bash
# Check current Isaac ROS version
dpkg -l | grep isaac-ros

# Update to latest version
sudo apt update
sudo apt upgrade ros-humble-isaac-ros-*
```

## Troubleshooting Version Issues

### Common Version Conflicts
1. **Package Not Found**: Check if package exists for your ROS 2 version
2. **API Incompatibility**: Refer to version-specific documentation
3. **Dependency Issues**: Use rosdep to resolve dependencies
4. **Plugin Compatibility**: Verify plugin compatibility with Gazebo version

### Version Checking Commands
```bash
# Check ROS 2 version
echo $ROS_DISTRO

# Check Gazebo version
gazebo --version

# Check Isaac ROS packages
dpkg -l | grep isaac-ros

# Check available ROS packages
apt search ros-humble-*
```

## Best Practices for Version Management

### 1. Use LTS Versions for Production
- ROS 2 Humble for long-term projects
- Ubuntu 22.04 LTS for stability
- Isaac ROS 3.x LTS for robotics applications

### 2. Document Version Dependencies
- Maintain a `requirements.txt` file
- Document hardware requirements
- Specify simulation environment versions

### 3. Test Across Versions
- Test code examples on target platforms
- Verify compatibility before deployment
- Maintain version compatibility matrices

### 4. Plan for Updates
- Schedule regular updates for development environments
- Maintain migration paths for production systems
- Keep backup configurations for rollback

## Version-Specific Configuration Files

### Humble Configuration (`config/humble_setup.sh`)
```bash
#!/bin/bash
# ROS 2 Humble specific setup

# Source ROS 2 Humble
source /opt/ros/humble/setup.bash

# Set Gazebo environment
export GAZEBO_MODEL_PATH=/usr/share/gazebo-7/models:$GAZEBO_MODEL_PATH
export GAZEBO_RESOURCE_PATH=/usr/share/gazebo-7:$GAZEBO_RESOURCE_PATH

# Set Isaac ROS parameters
export ISAAC_ROS_PERCEPTION_MODE=GPU
export ISAAC_ROS_NAVIGATION_MODE=ACCURATE
```

### Iron Configuration (`config/iron_setup.sh`)
```bash
#!/bin/bash
# ROS 2 Iron specific setup

# Source ROS 2 Iron
source /opt/ros/iron/setup.bash

# Set Gazebo environment
export GAZEBO_MODEL_PATH=/usr/share/gazebo-7/models:$GAZEBO_MODEL_PATH
export GAZEBO_RESOURCE_PATH=/usr/share/gazebo-7:$GAZEBO_RESOURCE_PATH

# Set Isaac ROS parameters
export ISAAC_ROS_PERCEPTION_MODE=REALTIME
export ISAAC_ROS_NAVIGATION_MODE=BALANCED
```

This version-specific documentation ensures that students and educators can properly configure their environments based on the technology versions they are using, and provides clear guidance for maintaining compatibility across different system configurations.
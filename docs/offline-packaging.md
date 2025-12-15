# Offline Content Packaging for Simulation Environments

## Overview

This document provides instructions for packaging the Physical AI & Humanoid Robotics educational content for offline use and downloadable simulation environments. The packaging ensures students can access all materials and run simulations without requiring constant internet connectivity.

## Package Contents

### Core Educational Content
- All course modules (1-4) with complete documentation
- Code examples for each module
- Diagrams and visual assets
- Practice tasks and assessments
- Video tutorials (where applicable)

### Simulation Environment Components
- Gazebo world files and models
- Unity simulation assets and scenes
- Isaac Sim environments and configurations
- Pre-configured robot models
- Sensor simulation packages

### Development Tools and Dependencies
- ROS 2 Humble Hawksbill installation packages
- Required Python libraries and dependencies
- Docker images for Isaac ROS
- Simulation environment configurations
- Development environment setup scripts

## Packaging Structure

```
physical-ai-book-offline/
├── docs/                           # All course documentation
│   ├── module-1-ros2/
│   ├── module-2-gazebo-unity/
│   ├── module-3-nvidia-isaac/
│   └── module-4-vla-humanoid/
├── code-examples/                  # All code examples from all modules
│   ├── module1/
│   ├── module2/
│   ├── module3/
│   └── module4/
├── assets/                         # All diagrams and visual assets
│   ├── module1/
│   ├── module2/
│   ├── module3/
│   └── module4/
├── simulation/                     # Simulation environments
│   ├── gazebo-worlds/
│   ├── unity-scenes/
│   └── isaac-sim/
├── tools/                          # Development tools
│   ├── docker-images/
│   ├── setup-scripts/
│   └── dependencies/
├── offline-viewer/                 # Offline documentation viewer
└── README.md                       # Package documentation
```

## Implementation Instructions

### 1. Content Aggregation Script
```bash
#!/bin/bash
# offline_package_builder.sh

set -e  # Exit on any error

echo "Building offline package for Physical AI & Humanoid Robotics course..."

# Create package directory structure
mkdir -p physical-ai-book-offline/{docs,code-examples,assets,simulation,tools,offline-viewer}

# Copy documentation
echo "Copying documentation..."
cp -r docs/* physical-ai-book-offline/docs/

# Copy code examples
echo "Copying code examples..."
cp -r code-examples/* physical-ai-book-offline/code-examples/

# Copy assets
echo "Copying assets..."
cp -r assets/* physical-ai-book-offline/assets/

# Package simulation environments
echo "Packaging simulation environments..."
mkdir -p physical-ai-book-offline/simulation/{gazebo,unity,isaac}
# Copy pre-built simulation assets here

# Package tools and dependencies
echo "Packaging tools and dependencies..."
mkdir -p physical-ai-book-offline/tools/{docker,scripts,deps}

# Create offline viewer
echo "Creating offline viewer..."
cat > physical-ai-book-offline/offline-viewer/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Physical AI & Humanoid Robotics - Offline Viewer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .module { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .module h2 { color: #2E7D32; }
        .nav { margin: 20px 0; }
        .nav a { margin-right: 15px; text-decoration: none; color: #1976D2; }
    </style>
</head>
<body>
    <h1>Physical AI & Humanoid Robotics Course</h1>

    <div class="nav">
        <a href="#module1">Module 1: ROS 2 Fundamentals</a>
        <a href="#module2">Module 2: Simulation Environments</a>
        <a href="#module3">Module 3: AI Perception & Navigation</a>
        <a href="#module4">Module 4: Humanoid Robotics Capstone</a>
    </div>

    <div id="module1" class="module">
        <h2>Module 1: ROS 2 Fundamentals</h2>
        <p><a href="docs/module-1-ros2/intro.md" target="_blank">Introduction to ROS 2</a></p>
        <p><a href="docs/module-1-ros2/chapter1-intro-ros2.md" target="_blank">Chapter 1: Introduction to ROS 2</a></p>
        <p><a href="docs/module-1-ros2/chapter2-ros2-nodes.md" target="_blank">Chapter 2: ROS 2 Nodes and Communication</a></p>
        <p><a href="docs/module-1-ros2/chapter3-ros2-topics.md" target="_blank">Chapter 3: Topics and Services</a></p>
        <p><a href="docs/module-1-ros2/chapter4-ros2-services.md" target="_blank">Chapter 4: ROS 2 Tools and Best Practices</a></p>
    </div>

    <div id="module2" class="module">
        <h2>Module 2: Simulation Environments</h2>
        <p><a href="docs/module-2-gazebo-unity/chapter5-intro-gazebo.md" target="_blank">Chapter 5: Introduction to Gazebo Simulation</a></p>
        <p><a href="docs/module-2-gazebo-unity/chapter6-gazebo-simulation.md" target="_blank">Chapter 6: Advanced Gazebo Concepts</a></p>
        <p><a href="docs/module-2-gazebo-unity/chapter7-unity-simulation.md" target="_blank">Chapter 7: Unity for Robotics Simulation</a></p>
        <p><a href="docs/module-2-gazebo-unity/chapter8-digital-twin.md" target="_blank">Chapter 8: Digital Twin Concepts</a></p>
    </div>

    <div id="module3" class="module">
        <h2>Module 3: AI Perception & Navigation</h2>
        <p><a href="docs/module-3-nvidia-isaac/chapter9-isaac-intro.md" target="_blank">Chapter 9: Introduction to NVIDIA Isaac</a></p>
        <p><a href="docs/module-3-nvidia-isaac/chapter10-isaac-perception.md" target="_blank">Chapter 10: AI Perception Systems</a></p>
        <p><a href="docs/module-3-nvidia-isaac/chapter11-isaac-navigation.md" target="_blank">Chapter 11: Navigation and Path Planning</a></p>
        <p><a href="docs/module-3-nvidia-isaac/chapter12-isaac-decision-making.md" target="_blank">Chapter 12: Intelligent Decision Making</a></p>
    </div>

    <div id="module4" class="module">
        <h2>Module 4: Humanoid Robotics Capstone</h2>
        <p><a href="docs/module-4-vla-humanoid/chapter13-vla-intro.md" target="_blank">Chapter 13: Introduction to Vision-Language-Action Systems</a></p>
        <p><a href="docs/module-4-vla-humanoid/chapter14-humanoid-control.md" target="_blank">Chapter 14: Humanoid Robot Control</a></p>
        <p><a href="docs/module-4-vla-humanoid/chapter15-humanoid-capstone.md" target="_blank">Chapter 15: Capstone Project - Autonomous Humanoid</a></p>
        <p><a href="docs/module-4-vla-humanoid/chapter16-conversational-robotics.md" target="_blank">Chapter 16: Conversational Robotics</a></p>
    </div>

    <h2>Code Examples</h2>
    <p>Code examples are available in the <code>code-examples/</code> directory.</p>

    <h2>Simulation Environments</h2>
    <p>Simulation environments are available in the <code>simulation/</code> directory.</p>
</body>
</html>
EOF

# Create setup script
cat > physical-ai-book-offline/tools/setup-offline-environment.sh << 'EOF'
#!/bin/bash
# Setup script for offline Physical AI & Humanoid Robotics environment

echo "Setting up offline Physical AI & Humanoid Robotics environment..."

# Check if ROS 2 is installed
if [ -f "/opt/ros/humble/setup.bash" ]; then
    echo "ROS 2 Humble already installed"
    source /opt/ros/humble/setup.bash
else
    echo "Please install ROS 2 Humble Hawksbill before proceeding"
    echo "Follow installation guide at: https://docs.ros.org/en/humble/Installation.html"
    exit 1
fi

# Create workspace
mkdir -p ~/physical_ai_ws/src
cd ~/physical_ai_ws

# Copy code examples to workspace
cp -r ../physical-ai-book-offline/code-examples/* src/

# Build workspace
colcon build

# Setup environment
echo "source ~/physical_ai_ws/install/setup.bash" >> ~/.bashrc
echo "export GAZEBO_MODEL_PATH=~/physical_ai_ws/src/simulation/gazebo/models:$GAZEBO_MODEL_PATH" >> ~/.bashrc

echo "Offline environment setup complete!"
echo "Run 'source ~/physical_ai_ws/install/setup.bash' to activate the environment"
EOF

chmod +x physical-ai-book-offline/tools/setup-offline-environment.sh

# Create package manifest
cat > physical-ai-book-offline/package-manifest.json << EOF
{
  "name": "physical-ai-book-offline",
  "version": "1.0.0",
  "description": "Offline package for Physical AI & Humanoid Robotics course",
  "author": "Physical AI Education Team",
  "date_created": "$(date -I)",
  "size_mb": $(du -sb physical-ai-book-offline | cut -f1),
  "contents": [
    "docs/",
    "code-examples/",
    "assets/",
    "simulation/",
    "tools/",
    "offline-viewer/"
  ],
  "requirements": [
    "ROS 2 Humble Hawksbill",
    "Gazebo Garden",
    "Python 3.8+",
    "Docker (optional)"
  ]
}
EOF

# Create download instructions
cat > physical-ai-book-offline/INSTALLATION.md << 'EOF'
# Physical AI & Humanoid Robotics - Offline Package Installation

## System Requirements
- Ubuntu 22.04 LTS or compatible Linux distribution
- 8GB+ RAM recommended
- 20GB+ free disk space
- Multi-core processor (4+ cores recommended)

## Prerequisites
1. Install ROS 2 Humble Hawksbill:
   ```bash
   # Follow official installation guide:
   # https://docs.ros.org/en/humble/Installation.html
   ```

2. Install additional dependencies:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-colcon-common-extensions
   sudo apt install gazebo libgazebo-dev
   ```

## Installation Steps

### Method 1: Using Setup Script (Recommended)
1. Extract the package to your home directory
2. Navigate to the tools directory: `cd ~/physical-ai-book-offline/tools/`
3. Run the setup script: `./setup-offline-environment.sh`
4. Source the environment: `source ~/physical_ai_ws/install/setup.bash`

### Method 2: Manual Installation
1. Extract the package
2. Copy code examples to your ROS workspace
3. Build the workspace with `colcon build`
4. Set up environment variables as needed

## Running Simulations Offline

### Gazebo Simulations
```bash
# Source the environment
source ~/physical_ai_ws/install/setup.bash

# Launch a simulation example
ros2 launch gazebo_ros empty_world.launch.py
```

### Running Course Examples
```bash
# Navigate to the code examples
cd ~/physical_ai_ws/src/code-examples/

# Run a specific example (e.g., from Module 2)
python3 module2/simple_navigation.py
```

## Offline Documentation Access

Open the offline viewer:
```bash
cd ~/physical-ai-book-offline/offline-viewer/
firefox index.html  # or your preferred browser
```

Or access individual markdown files directly:
```bash
# Using a markdown viewer or text editor
code docs/module-1-ros2/intro.md
```

## Troubleshooting

### Common Issues
- **Missing dependencies**: Run the setup script to ensure all dependencies are installed
- **Permission errors**: Ensure you have write permissions to the installation directory
- **ROS workspace issues**: Verify that the workspace was built successfully with `colcon build`

### Getting Help
Since this is an offline package, refer to the included documentation and examples.
For online resources when connectivity is available, visit the course website.
EOF

echo "Offline package created successfully!"
echo "Package location: physical-ai-book-offline/"
echo "Package size: $(du -sh physical-ai-book-offline/ | cut -f1)"
EOF

chmod +x offline_package_builder.sh

# Run the builder script
./offline_package_builder.sh

echo "Offline packaging complete!"
# Environment Setup for Physical AI & Humanoid Robotics

This guide will help you set up the development environment needed to work through the examples in this book. The setup involves installing ROS 2, simulation environments, and AI frameworks.

## System Requirements

Before starting, ensure your system meets the following requirements:

- **Operating System**: Ubuntu 22.04 LTS (recommended) or Windows 10/11 with WSL2
- **RAM**: At least 8GB (16GB recommended for AI workloads)
- **Storage**: At least 50GB of free disk space
- **GPU**: NVIDIA GPU with CUDA support (for NVIDIA Isaac and AI workloads)

## Software Installation

### 1. Python 3.8 or Higher

Python is required for ROS 2 and AI development.

**On Ubuntu:**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

**On Windows (with WSL2):**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### 2. ROS 2 Humble Hawksbill

ROS 2 is the core framework for robotics development.

**On Ubuntu:**
```bash
# Add ROS 2 repository
sudo apt update && sudo apt install -y curl gnupg lsb-release
curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key | sudo gpg --dearmor -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install ros-humble-desktop
sudo apt install python3-colcon-common-extensions
sudo apt install ros-humble-gazebo-ros-pkgs
```

**Source ROS 2 in your shell:**
```bash
source /opt/ros/humble/setup.bash
```

To make this permanent, add the following line to your `~/.bashrc`:
```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

### 3. Gazebo Simulation Environment

Gazebo is included with ROS 2 Humble, but you can install additional packages:

```bash
sudo apt install ros-humble-gazebo-*
```

### 4. NVIDIA Isaac ROS

For NVIDIA Isaac integration, you'll need:

1. **NVIDIA GPU drivers** (version 470 or higher)
2. **CUDA toolkit** (version 11.8 or higher)
3. **NVIDIA Isaac ROS packages**

**Install NVIDIA drivers:**
```bash
sudo apt install nvidia-driver-535
```

**Install CUDA:**
```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key add /var/cuda-repo-ubuntu2204/7fa2af80.pub
sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /"
sudo apt update
sudo apt -y install cuda-toolkit-12-3
```

### 5. Development Tools

Install essential development tools:

```bash
sudo apt install git cmake build-essential
```

### 6. Node.js and npm (for Documentation)

To run the book locally:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## Workspace Setup

Create a ROS 2 workspace for the examples:

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build
source install/setup.bash
```

## Python Virtual Environment

Create a virtual environment for Python dependencies:

```bash
cd ~/ros2_ws
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Verification

To verify your setup, run the following commands:

1. **Check ROS 2 installation:**
```bash
ros2 --version
```

2. **Check Gazebo:**
```bash
gazebo --version
```

3. **Test ROS 2 basic functionality:**
```bash
# Terminal 1
ros2 run demo_nodes_cpp talker

# Terminal 2
ros2 run demo_nodes_py listener
```

## Troubleshooting

### Common Issues

1. **ROS 2 commands not found**: Make sure you've sourced the ROS 2 environment:
```bash
source /opt/ros/humble/setup.bash
```

2. **Python packages not found**: Activate your virtual environment:
```bash
source ~/ros2_ws/venv/bin/activate
```

3. **Gazebo won't start**: Check that you have a proper display setup:
```bash
echo $DISPLAY
```

4. **CUDA not detected**: Verify your GPU and driver installation:
```bash
nvidia-smi
```

## Next Steps

Once your environment is set up, you can proceed to the [ROS 2 Fundamentals](./chapter1-ros2.md) chapter to begin learning about robotic systems.
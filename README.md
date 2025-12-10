# Physical AI & Humanoid Robotics Hackathon Book

This repository contains the source code and documentation for the Physical AI & Humanoid Robotics Hackathon Book, a comprehensive guide for university-level students, AI enthusiasts, and educators to apply AI in controlling humanoid robots.

## Prerequisites

Before starting with this book, you'll need to set up your development environment with the following technologies:

### System Requirements
- Ubuntu 22.04 LTS (recommended) or Windows 10/11 with WSL2
- At least 8GB RAM (16GB recommended)
- 50GB free disk space
- NVIDIA GPU with CUDA support (for NVIDIA Isaac and AI workloads)

### Software Requirements

1. **Python 3.8 or higher**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv
   ```

2. **ROS 2 Humble Hawksbill** (For Ubuntu)
   ```bash
   # Add ROS 2 repository
   sudo apt update && sudo apt install -y curl gnupg lsb-release
   curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key | sudo gpg --dearmor -o /usr/share/keyrings/ros-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
   sudo apt update
   sudo apt install ros-humble-desktop
   sudo apt install ros-humble-ros-base
   sudo apt install python3-colcon-common-extensions
   ```

3. **Gazebo (included with ROS 2 Humble)**
   ```bash
   sudo apt install ros-humble-gazebo-ros-pkgs
   ```

4. **Node.js and npm** (for Docusaurus documentation)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

5. **Git**
   ```bash
   sudo apt install git
   ```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/my_book.git
   cd my_book
   ```

2. **Install Python dependencies:**
   ```bash
   pip3 install -r requirements.txt
   ```

3. **Install Node.js dependencies for the book:**
   ```bash
   cd book
   npm install
   ```

## Running the Documentation

To run the Docusaurus-based book locally:

```bash
cd book
npm start
```

This will start a local development server at `http://localhost:3000`.

## Running ROS 2 Examples

1. **Source ROS 2:**
   ```bash
   source /opt/ros/humble/setup.bash
   ```

2. **Run the publisher example:**
   ```bash
   cd code-examples/ros2-basics
   python3 publisher.py
   ```

3. **In a separate terminal, run the subscriber:**
   ```bash
   cd code-examples/ros2-basics
   python3 subscriber.py
   ```

## NVIDIA Isaac Setup

For NVIDIA Isaac integration, you'll need:
1. CUDA-compatible GPU
2. NVIDIA drivers (version 470 or higher)
3. CUDA toolkit (version 11.8 or higher)
4. NVIDIA Isaac ROS packages

For detailed installation instructions, refer to the NVIDIA Isaac documentation.

## Unity Setup (Optional)

To work with Unity-based digital twins:
1. Download Unity Hub from unity.com
2. Install Unity 2022.3 LTS or newer
3. Import the robotics packages as described in the book

## Troubleshooting

### Common Issues

1. **ROS 2 not found:** Make sure to source the ROS 2 environment:
   ```bash
   source /opt/ros/humble/setup.bash
   ```

2. **Python packages not found:** Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Docusaurus build fails:** Clear the cache and reinstall:
   ```bash
   cd book
   npm run clear
   npm install
   npm start
   ```

## Contributing

This book is designed to be a living document. If you find errors or have suggestions for improvements, please submit a pull request or open an issue in the repository.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
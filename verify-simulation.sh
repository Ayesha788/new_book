#!/bin/bash
# Verification script for Gazebo simulation examples in the Physical AI & Humanoid Robotics Book

echo "Verifying Gazebo simulation examples..."

# Check if launch file has proper syntax
echo "Checking Python syntax in gazebo/launch/..."
python3 -m py_compile gazebo/launch/humanoid_simulation.launch.py
if [ $? -eq 0 ]; then
    echo "✓ humanoid_simulation.launch.py syntax is valid"
else
    echo "✗ humanoid_simulation.launch.py has syntax errors"
fi

# Check if world file is valid XML
if [ -f "gazebo/worlds/simple_room.sdf" ]; then
    echo "✓ simple_room.sdf exists"
    # Check if it's valid XML
    if python3 -c "import xml.etree.ElementTree as ET; ET.parse('gazebo/worlds/simple_room.sdf')" 2>/dev/null; then
        echo "✓ simple_room.sdf is valid XML"
    else
        echo "✗ simple_room.sdf is not valid XML"
    fi
else
    echo "✗ simple_room.sdf missing"
fi

# Check if LiDAR data checker has proper syntax
if [ -f "gazebo/scripts/lidar_data_checker.py" ]; then
    echo "✓ lidar_data_checker.py exists"
    python3 -m py_compile gazebo/scripts/lidar_data_checker.py
    if [ $? -eq 0 ]; then
        echo "✓ lidar_data_checker.py syntax is valid"
    else
        echo "✗ lidar_data_checker.py has syntax errors"
    fi
else
    echo "✓ No lidar_data_checker.py file (not required)"
fi

# Check if URDF file exists and is valid
if [ -f "urdf/humanoid.urdf" ]; then
    echo "✓ humanoid.urdf exists"
    # Check if it's valid XML
    if python3 -c "import xml.etree.ElementTree as ET; ET.parse('urdf/humanoid.urdf')" 2>/dev/null; then
        echo "✓ humanoid.urdf is valid XML"
    else
        echo "✗ humanoid.urdf is not valid XML"
    fi
else
    echo "✗ humanoid.urdf missing"
fi

echo "Simulation verification complete. Note: Full Gazebo execution tests require a properly configured ROS 2 and Gazebo environment."
#!/bin/bash
# Verification script for ROS 2 examples in the Physical AI & Humanoid Robotics Book

echo "Verifying ROS 2 examples..."

# Check if Python files have proper syntax
echo "Checking Python syntax in code-examples/ros2-basics/..."
python3 -m py_compile code-examples/ros2-basics/publisher.py
if [ $? -eq 0 ]; then
    echo "✓ publisher.py syntax is valid"
else
    echo "✗ publisher.py has syntax errors"
fi

python3 -m py_compile code-examples/ros2-basics/subscriber.py
if [ $? -eq 0 ]; then
    echo "✓ subscriber.py syntax is valid"
else
    echo "✗ subscriber.py has syntax errors"
fi

# Check if humanoid controller has proper syntax
echo "Checking Python syntax in code-examples/ros2-packages/humanoid_robot_examples/..."
python3 -m py_compile code-examples/ros2-packages/humanoid_robot_examples/humanoid_controller.py
if [ $? -eq 0 ]; then
    echo "✓ humanoid_controller.py syntax is valid"
else
    echo "✗ humanoid_controller.py has syntax errors"
fi

# Check if ROS 2 packages have proper structure
echo "Checking ROS 2 package structure..."
if [ -f "code-examples/ros2-packages/setup.py" ]; then
    echo "✓ setup.py exists"
else
    echo "✗ setup.py missing"
fi

if [ -f "code-examples/ros2-packages/package.xml" ]; then
    echo "✓ package.xml exists"
else
    echo "✗ package.xml missing"
fi

# Check URDF file
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

echo "Verification complete. Note: Full ROS 2 execution tests require a properly configured ROS 2 environment."
# ROS 2 Code Examples

This directory contains runnable code examples for Module 1: ROS 2 (Robot Nervous System).

## Examples

### 1. simple_publisher.py
A basic ROS 2 publisher node that sends "Hello World" messages to a topic.

**To run:**
```bash
source /opt/ros/humble/setup.bash
python3 simple_publisher.py
```

### 2. simple_subscriber.py
A basic ROS 2 subscriber node that receives messages from a topic.

**To run:**
```bash
source /opt/ros/humble/setup.bash
python3 simple_subscriber.py
```

### 3. node_with_pub_sub.py
A node that both publishes and subscribes to different topics.

**To run:**
```bash
source /opt/ros/humble/setup.bash
python3 node_with_pub_sub.py
```

To test with command line tools:
```bash
# In another terminal, publish to the 'listen' topic:
ros2 topic pub /listen std_msgs/String "data: 'Hello from command line'"
```

### 4. topics_and_services_demo.py
A demonstration of both topics and services in a single node.

**To run:**
```bash
source /opt/ros/humble/setup.bash
python3 topics_and_services_demo.py
```

To test the service:
```bash
# In another terminal, call the service:
ros2 service call /add_two_ints example_interfaces/AddTwoInts "{a: 2, b: 3}"
```

To test the command topic:
```bash
# In another terminal, publish to the command topic:
ros2 topic pub /command_topic std_msgs/String "data: 'test command'"
```

## Requirements

- ROS 2 Humble Hawksbill
- Python 3.8 or higher
- Standard ROS 2 packages (typically installed with ROS 2)

## Dependencies

All examples use standard ROS 2 message types:
- std_msgs
- example_interfaces
- rcl_interfaces

These should be available with a standard ROS 2 Humble installation.
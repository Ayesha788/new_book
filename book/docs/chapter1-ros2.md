# Chapter 1: ROS 2 Fundamentals - The Robotic Nervous System

## Introduction to ROS 2

ROS 2 (Robot Operating System 2) is a flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robot platforms.

Unlike traditional operating systems, ROS 2 is not an actual OS but rather a middleware that provides services designed for a heterogeneous computer cluster. It includes hardware abstraction, device drivers, libraries, visualizers, message-passing, package management, and more.

## ROS 2 Architecture

ROS 2 uses a client library architecture with multiple client libraries (rcl) that wrap the underlying DDS (Data Distribution Service) implementation. This provides a clean separation between the application code and the middleware implementation.

import Diagram from '@site/src/components/Diagram';

<Diagram
  title="ROS 2 Architecture Overview"
  description="A diagram showing the layered architecture of ROS 2. At the bottom is the DDS/RTPS layer which handles network communication. Above it is the rcl layer (ROS Client Library) which provides common functionality. Then comes the client libraries like rclpy and rclcpp. At the top are the application nodes that communicate through topics, services, and actions.">

  *ROS 2 Architecture Diagram would be displayed here*

</Diagram>

### Nodes

A node is an executable that uses ROS 2 to communicate with other nodes. Nodes are the fundamental building blocks of a ROS 2 program. They allow your code to perform computation and interact with the ROS 2 ecosystem.

### Topics and Messages

Topics are named buses over which nodes exchange messages. A node can publish messages to a topic or subscribe to messages from a topic. This publish/subscribe communication model allows for asynchronous communication between nodes.

<Diagram
  title="ROS 2 Publish-Subscribe Model"
  description="A diagram showing the publish-subscribe communication pattern in ROS 2. There is a publisher node on the left labeled 'Publisher Node' with an arrow pointing to a central topic named '/sensor_data'. From the topic, an arrow points to two subscriber nodes on the right labeled 'Subscriber Node 1' and 'Subscriber Node 2'. This illustrates how one publisher can send data to multiple subscribers.">

  *Publish-Subscribe Model Diagram would be displayed here*

</Diagram>

Messages are data structures that are exchanged between nodes. They are defined in special files with the `.msg` extension and are used to define the data exchanged in ROS 2.

### Services

Services provide a request/reply communication pattern. Unlike the asynchronous publish/subscribe model of topics, services are synchronous and block until a response is received.

<Diagram
  title="ROS 2 Service Communication"
  description="A diagram showing the service communication pattern in ROS 2. A client node on the left labeled 'Service Client' sends a request to a central service named '/move_robot'. The service processes the request and sends a response back to the client. This illustrates the synchronous request-response pattern.">

  ![Service Communication](pathname:///img/diagrams/service-communication.svg)

</Diagram>

## Setting up Your ROS 2 Environment

### Prerequisites

Before starting with ROS 2, ensure you have:

- Ubuntu 22.04 (Jammy) or Windows 10/11 with WSL2
- Python 3.8 or higher
- Git
- Basic knowledge of Linux command line

### Installation

For Ubuntu users, install ROS 2 Humble Hawksbill (long-term support release):

```bash
# Add the ROS 2 apt repository
sudo apt update && sudo apt install -y curl gnupg lsb-release
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install ros-humble-desktop
```

For Windows users, install WSL2 with Ubuntu 22.04 and follow the Ubuntu installation instructions.

### Environment Setup

After installation, source the ROS 2 environment:

```bash
source /opt/ros/humble/setup.bash
```

To make this permanent, add the following line to your `~/.bashrc` file:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

## Creating Your First ROS 2 Package

ROS 2 organizes code into packages. Let's create a simple package:

```bash
# Create a workspace
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Create a package
colcon build
source install/setup.bash
cd src
ros2 pkg create --build-type ament_python my_robot_pkg --dependencies rclpy std_msgs
```

## Basic Publisher-Subscriber Example

Let's create a simple publisher and subscriber to understand the communication model:

### Publisher Code (publisher_member_function.py)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Subscriber Code (subscriber_member_function.py)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    minimal_subscriber = MinimalSubscriber()
    rclpy.spin(minimal_subscriber)
    minimal_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Running the Publisher-Subscriber Example

1. Open two terminal windows
2. In both terminals, navigate to your workspace and source the setup file:
   ```bash
   cd ~/ros2_ws
   source install/setup.bash
   ```
3. In the first terminal, run the publisher:
   ```bash
   ros2 run my_robot_pkg publisher_member_function
   ```
4. In the second terminal, run the subscriber:
   ```bash
   ros2 run my_robot_pkg subscriber_member_function
   ```

You should see the publisher sending messages and the subscriber receiving them.

## Working with URDF Models

URDF (Unified Robot Description Format) is an XML format used to describe robot models in ROS. It defines the physical and visual properties of a robot.

### Simple URDF Example

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.5"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
  </link>

  <link name="sensor_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
      <material name="red">
        <color rgba="1 0 0 1"/>
      </material>
    </visual>
  </link>

  <joint name="sensor_joint" type="fixed">
    <parent link="base_link"/>
    <child link="sensor_link"/>
    <origin xyz="0.3 0 0"/>
  </joint>
</robot>
```

## Visualizing URDF in RViz

RViz is ROS's 3D visualization tool. To visualize your URDF model:

1. Launch RViz:
   ```bash
   rviz2
   ```
2. Add a RobotModel display
3. Set the Robot Description parameter to your URDF file

## Practice Tasks

1. Create a new ROS 2 package called `humanoid_control`
2. Implement a publisher that sends joint position commands
3. Create a subscriber that logs received sensor data
4. Design a simple URDF model for a basic humanoid robot with at least 5 links
5. Load your URDF model in RViz and verify it displays correctly

## Summary

In this chapter, you've learned the fundamentals of ROS 2, including:
- The core concepts of nodes, topics, and services
- How to set up your ROS 2 environment
- How to create and run simple publisher-subscriber examples
- How to work with URDF models for robot description

These concepts form the foundation for controlling humanoid robots and will be essential as you progress through the rest of this book.
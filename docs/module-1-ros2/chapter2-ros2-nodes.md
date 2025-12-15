---
sidebar_position: 3
---

# Chapter 2: ROS 2 Nodes and Communication

## Explanation

In ROS 2, a node is a process that performs computation. Nodes are the fundamental building blocks of a ROS 2 system. Each node is designed to perform a specific task, such as sensor data processing, motion control, or user interface. Nodes communicate with each other through topics, services, and actions.

The communication between nodes follows a distributed architecture where nodes don't need to know about each other directly. Instead, they communicate through a publish-subscribe model (topics), request-response model (services), or goal-oriented model (actions). This design allows for flexible and modular robot systems.

Nodes are organized into packages, which are collections of related functionality that can be built and distributed together. A package typically contains source code, configuration files, and launch files that define how nodes should be executed.

## Example

A practical example of nodes and communication is a robot with a camera and a processing node. The camera driver node publishes images to a topic called "camera/image_raw". A separate image processing node subscribes to this topic and performs computer vision tasks like object detection. The processing node then publishes the results to another topic "camera/object_detected" which can be used by other nodes like navigation or manipulation systems.

This approach allows the camera driver to be developed and tested independently from the image processing algorithms, making the system more modular and maintainable.

## Diagram

![ROS 2 node communication with publisher and subscriber nodes](../../assets/module1/ros2-communication-patterns.svg)

*Alt-text: Diagram showing three rectangular boxes labeled "Camera Driver Node", "Image Processing Node", and "Navigation Node". Arrows indicate communication: "Camera Driver" publishes to "image_raw" topic, "Image Processing" subscribes to "image_raw" and publishes to "object_detected", and "Navigation" subscribes to "object_detected". The topics are shown as circular hubs connecting the nodes.*

## Code

Here's an example of a simple ROS 2 node with both publisher and subscriber functionality:

```python
# node_with_pub_sub.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class NodeWithPubSub(Node):

    def __init__(self):
        super().__init__('node_with_pub_sub')

        # Create a publisher
        self.publisher_ = self.create_publisher(String, 'chatter', 10)

        # Create a timer to publish messages
        timer_period = 2  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

        # Create a subscription
        self.subscription = self.create_subscription(
            String,
            'listen',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

        self.get_logger().info('Node with publisher and subscriber initialized')

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello, it is {self.get_clock().now()}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')


def main(args=None):
    rclpy.init(args=args)

    node_with_pub_sub = NodeWithPubSub()

    rclpy.spin(node_with_pub_sub)

    # Destroy the node explicitly
    node_with_pub_sub.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Verification Steps

1. Save the code as `node_with_pub_sub.py`
2. Open a terminal and source your ROS 2 environment:
   ```bash
   source /opt/ros/humble/setup.bash
   ```
3. Navigate to your ROS 2 workspace and run the node:
   ```bash
   python3 node_with_pub_sub.py
   ```
4. In another terminal, publish a message to the 'listen' topic:
   ```bash
   ros2 topic pub /listen std_msgs/String "data: 'Hello from command line'"
   ```
5. You should see the node both publishing messages to 'chatter' and receiving messages from 'listen'

## Practice Task

Create two separate nodes - one publisher and one subscriber - that communicate with each other. The publisher should send a counter value that increments every second, and the subscriber should log the received counter values.

### Task Requirements

- Create a publisher node that sends counter values as integers
- Create a subscriber node that receives and logs the counter values
- Use appropriate message types (Int32 or similar)
- Implement proper error handling

### Expected Outcome

Two separate nodes that can be run independently and communicate with each other through ROS 2 topics.

### Verification Steps

1. Run the publisher node in one terminal
2. Run the subscriber node in another terminal
3. Observe that the subscriber receives and logs the counter values from the publisher
4. Confirm that the counter increments as expected

## Summary

This chapter covered the fundamentals of ROS 2 nodes and their communication patterns. You learned how nodes can publish and subscribe to topics, enabling modular and distributed robot systems. The example demonstrated a node with both publishing and subscribing capabilities, which is common in real-world robotics applications.

## Next Steps

In the next chapter, you'll learn about topics and services in more detail, exploring advanced communication patterns in ROS 2.

## Additional Resources

- [ROS 2 Nodes and Packages Documentation](https://docs.ros.org/en/humble/How-To-Guides/Creating-Your-First-ROS2-Package.html)
- [ROS 2 Publisher/Subscriber Tutorial](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)
- [ROS 2 Communication Primitives](https://docs.ros.org/en/humble/Concepts/About-Topics.html)
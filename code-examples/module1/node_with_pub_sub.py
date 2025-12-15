#!/usr/bin/env python3

"""
Node with both publisher and subscriber functionality
This is a complete, runnable example from Chapter 2
"""

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
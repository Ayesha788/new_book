#!/usr/bin/env python3

"""
Topics and Services demonstration
This is a complete, runnable example from Chapter 3
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from example_interfaces.srv import AddTwoInts
from rcl_interfaces.msg import SetParametersResult


class TopicsAndServicesDemo(Node):

    def __init__(self):
        super().__init__('topics_and_services_demo')

        # Create a publisher for a topic
        self.publisher_ = self.create_publisher(String, 'demo_topic', 10)

        # Create a subscription
        self.subscription = self.create_subscription(
            String,
            'command_topic',
            self.command_callback,
            10)

        # Create a service server
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

        # Timer to periodically publish messages
        self.timer = self.create_timer(2.0, self.timer_callback)

        self.get_logger().info('Topics and Services Demo node started')

    def timer_callback(self):
        msg = String()
        msg.data = f'Demo message at {self.get_clock().now()}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Published: "{msg.data}"')

    def command_callback(self, msg):
        self.get_logger().info(f'Received command: "{msg.data}"')
        # Process the command here
        response_msg = String()
        response_msg.data = f'Processed: {msg.data}'
        # In a real system, you might publish a response to another topic
        self.publisher_.publish(response_msg)

    def add_two_ints_callback(self, request, response):
        result = request.a + request.b
        response.sum = result
        self.get_logger().info(f'Request: {request.a} + {request.b} = {response.sum}')
        return response


def main(args=None):
    rclpy.init(args=args)

    demo_node = TopicsAndServicesDemo()

    try:
        rclpy.spin(demo_node)
    except KeyboardInterrupt:
        pass
    finally:
        demo_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
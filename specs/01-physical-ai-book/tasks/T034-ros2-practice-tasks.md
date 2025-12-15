# ROS 2 Practice Tasks: Module 1 - ROS 2 Fundamentals

## Task 1: Create Your First ROS 2 Package

### Objective
Create a basic ROS 2 package with a simple publisher and subscriber.

### Prerequisites
- ROS 2 Humble Hawksbill installed
- Basic understanding of ROS 2 concepts
- Terminal/command line access

### Steps
1. Create a new ROS 2 workspace:
   ```bash
   mkdir -p ~/ros2_ws/src
   cd ~/ros2_ws
   ```

2. Create a new package:
   ```bash
   cd src
   ros2 pkg create --build-type ament_python my_first_package --dependencies rclpy std_msgs
   ```

3. Create a publisher node in `my_first_package/my_first_package/publisher.py`:
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

4. Create a subscriber node in `my_first_package/my_first_package/subscriber.py`:
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

5. Build the package:
   ```bash
   cd ~/ros2_ws
   colcon build --packages-select my_first_package
   source install/setup.bash
   ```

6. Run the publisher and subscriber in separate terminals:
   ```bash
   ros2 run my_first_package publisher
   ros2 run my_first_package subscriber
   ```

### Verification Steps
- [ ] Publisher successfully publishes messages every 0.5 seconds
- [ ] Subscriber successfully receives and displays messages
- [ ] Messages are correctly formatted and displayed
- [ ] Both nodes can be terminated with Ctrl+C

## Task 2: Explore ROS 2 Tools

### Objective
Use ROS 2 command-line tools to examine your running nodes and topics.

### Steps
1. While your publisher and subscriber are running, open a new terminal and source your workspace:
   ```bash
   cd ~/ros2_ws
   source install/setup.bash
   ```

2. List all active nodes:
   ```bash
   ros2 node list
   ```

3. List all active topics:
   ```bash
   ros2 topic list
   ```

4. Echo messages on the topic:
   ```bash
   ros2 topic echo /topic std_msgs/msg/String
   ```

5. Check the topic type:
   ```bash
   ros2 topic type /topic
   ```

6. Get information about the topic:
   ```bash
   ros2 topic info /topic
   ```

7. Check the publisher and subscriber connections:
   ```bash
   ros2 topic info /topic --verbose
   ```

### Verification Steps
- [ ] Node list shows both publisher and subscriber nodes
- [ ] Topic list shows the `/topic` topic
- [ ] Topic echo shows messages being published
- [ ] Topic type shows `std_msgs/msg/String`
- [ ] Topic info shows one publisher and one subscriber

## Task 3: Create a Simple Service

### Objective
Create a custom service that responds to requests.

### Steps
1. Create a service definition file `my_first_package/my_first_package/add_two_ints.srv`:
   ```
   int64 a
   int64 b
   ---
   int64 sum
   ```

2. Create a service server node in `my_first_package/my_first_package/service_server.py`:
   ```python
   import rclpy
   from rclpy.node import Node
   from example_interfaces.srv import AddTwoInts

   class MinimalService(Node):
       def __init__(self):
           super().__init__('minimal_service')
           self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

       def add_two_ints_callback(self, request, response):
           response.sum = request.a + request.b
           self.get_logger().info(f'Returning {request.a} + {request.b} = {response.sum}')
           return response

   def main(args=None):
       rclpy.init(args=args)
       minimal_service = MinimalService()
       rclpy.spin(minimal_service)
       rclpy.shutdown()

   if __name__ == '__main__':
       main()
   ```

3. Create a service client node in `my_first_package/my_first_package/service_client.py`:
   ```python
   import sys
   import rclpy
   from rclpy.node import Node
   from example_interfaces.srv import AddTwoInts

   class MinimalClient(Node):
       def __init__(self):
           super().__init__('minimal_client')
           self.cli = self.create_client(AddTwoInts, 'add_two_ints')
           while not self.cli.wait_for_service(timeout_sec=1.0):
               self.get_logger().info('service not available, waiting again...')
           self.req = AddTwoInts.Request()

       def send_request(self, a, b):
           self.req.a = a
           self.req.b = b
           future = self.cli.call_async(self.req)
           rclpy.spin_until_future_complete(self, future)
           return future.result()

   def main():
       rclpy.init()

       minimal_client = MinimalClient()
       response = minimal_client.send_request(int(sys.argv[1]), int(sys.argv[2]))

       minimal_client.get_logger().info(
           f'Result of add_two_ints: {response.sum}')

       minimal_client.destroy_node()
       rclpy.shutdown()

   if __name__ == '__main__':
       main()
   ```

4. Build the package again:
   ```bash
   cd ~/ros2_ws
   colcon build --packages-select my_first_package
   source install/setup.bash
   ```

5. Run the service server in one terminal:
   ```bash
   ros2 run my_first_package service_server
   ```

6. Run the service client in another terminal:
   ```bash
   ros2 run my_first_package service_client 1 2
   ```

### Verification Steps
- [ ] Service server starts without errors
- [ ] Service client successfully sends request
- [ ] Service client receives correct response (3 for input 1, 2)
- [ ] Service server logs the request and response

## Assessment Questions

1. What is the difference between a topic and a service in ROS 2?
2. What is the purpose of a ROS 2 workspace?
3. How do you create a new ROS 2 package?
4. What is the role of the ROS 2 daemon?
5. Explain the publisher-subscriber communication pattern.
# AI Perception Practice Tasks: Module 3 - AI Perception & Navigation

## Task 1: Set Up Isaac ROS Perception Pipeline

### Objective
Install and configure Isaac ROS perception packages for object detection.

### Prerequisites
- NVIDIA GPU or Jetson platform
- ROS 2 Humble Hawksbill
- Docker and NVIDIA Container Toolkit (optional)

### Steps
1. **Install Isaac ROS packages**:
   ```bash
   # Option 1: Using Docker (recommended for development)
   docker pull nvcr.io/nvidia/isaac_ros:latest

   # Option 2: Native installation
   sudo apt update
   sudo apt install ros-humble-isaac-ros-common
   sudo apt install ros-humble-isaac-ros-dnn-image-encoder
   sudo apt install ros-humble-isaac-ros-dnn-inference
   sudo apt install ros-humble-isaac-ros-visual-slam
   ```

2. **Verify installation**:
   ```bash
   # Check available Isaac ROS packages
   ros2 pkg list | grep isaac_ros

   # Check specific package
   ros2 pkg executables isaac_ros_visual_slam
   ```

3. **Test with sample data**:
   ```bash
   # Run a simple Isaac ROS node
   ros2 run isaac_ros_visual_slam isaac_ros_visual_slam_node --ros-args --log-level info
   ```

### Verification Steps
- [ ] Isaac ROS packages install without errors
- [ ] Available packages can be listed
- [ ] Sample nodes run without errors
- [ ] Docker container pulls successfully (if using Docker option)

## Task 2: Implement Object Detection Pipeline

### Objective
Create a complete object detection pipeline using Isaac ROS DNN packages.

### Steps
1. **Create a ROS 2 package** for perception:
   ```bash
   mkdir -p ~/perception_ws/src
   cd ~/perception_ws/src
   ros2 pkg create --build-type ament_python object_detection_pkg --dependencies rclpy sensor_msgs vision_msgs std_msgs
   cd object_detection_pkg
   ```

2. **Create the object detection node** (`object_detection_pkg/object_detection_pkg/detector_node.py`):
   ```python
   #!/usr/bin/env python3

   import rclpy
   from rclpy.node import Node
   from sensor_msgs.msg import Image
   from vision_msgs.msg import Detection2DArray
   from std_msgs.msg import Header
   import numpy as np

   class ObjectDetectorNode(Node):
       def __init__(self):
           super().__init__('object_detector_node')

           # Create subscriber for camera images
           self.image_sub = self.create_subscription(
               Image,
               '/camera/image_raw',
               self.image_callback,
               10
           )

           # Create publisher for detections
           self.detection_pub = self.create_publisher(
               Detection2DArray,
               '/object_detections',
               10
           )

           self.get_logger().info('Object Detector Node Initialized')

       def image_callback(self, msg):
           # In a real implementation, this would process the image through
           # Isaac ROS DNN packages to detect objects
           # For this example, we'll simulate detections

           detection_array = Detection2DArray()
           detection_array.header = msg.header

           # Simulate some detections (in practice, these come from DNN)
           # This is just to demonstrate the message format
           self.get_logger().info(f'Received image: {msg.width}x{msg.height}')

           # Publish empty array (in real implementation, this would contain detections)
           self.detection_pub.publish(detection_array)

   def main(args=None):
       rclpy.init(args=args)
       node = ObjectDetectorNode()

       try:
           rclpy.spin(node)
       except KeyboardInterrupt:
           node.get_logger().info('Shutting down object detector node')
       finally:
           node.destroy_node()
           rclpy.shutdown()

   if __name__ == '__main__':
       main()
   ```

3. **Create a launch file** (`object_detection_pkg/launch/detection_pipeline.launch.py`):
   ```python
   from launch import LaunchDescription
   from launch_ros.actions import Node
   from ament_index_python.packages import get_package_share_directory
   import os

   def generate_launch_description():
       ld = LaunchDescription()

       # Isaac ROS DNN Image Encoder Node
       dnn_encoder_node = Node(
           package='isaac_ros_dnn_image_encoder',
           executable='dnn_image_encoder_node',
           name='dnn_encoder',
           parameters=[
               {'input_image_width': 1280},
               {'input_image_height': 720},
               {'tensor_output_width': 640},
               {'tensor_output_height': 640},
               {'input_tensor_layout': 'NHWC'},
               {'output_tensor_layout': 'NHWC'},
           ],
           remappings=[
               ('encoded_tensor', 'tensor_pub'),
               ('input/image', '/camera/image_raw'),
           ]
       )

       # Isaac ROS DNN Inference Node
       dnn_inference_node = Node(
           package='isaac_ros_dnn_inference',
           executable='dnn_inference_node',
           name='dnn_inference',
           parameters=[
               {'model_file_path': '/path/to/model.plan'},  # Replace with actual model
               {'input_tensor_name': 'input'},
               {'output_tensor_name': 'output'},
               {'input_binding_name': 'input'},
               {'output_binding_name': 'output'},
           ],
           remappings=[
               ('tensor_sub', 'tensor_pub'),
               ('dnn_inference_result', 'detections'),
           ]
       )

       # Your custom detection processor
       detection_processor = Node(
           package='object_detection_pkg',
           executable='detector_node',
           name='detection_processor',
           parameters=[]
       )

       ld.add_action(dnn_encoder_node)
       ld.add_action(dnn_inference_node)
       ld.add_action(detection_processor)

       return ld
   ```

4. **Update setup.py** to include the executable:
   ```python
   # In object_detection_pkg/setup.py
   import os
   from glob import glob
   from setuptools import setup

   package_name = 'object_detection_pkg'

   setup(
       name=package_name,
       version='0.0.0',
       packages=[package_name],
       data_files=[
           ('share/ament_index/resource_index/packages',
           ['resource/' + package_name]),
           ('share/' + package_name, ['package.xml']),
           # Include launch files
           (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
       ],
       install_requires=['setuptools'],
       zip_safe=True,
       maintainer='Your Name',
       maintainer_email='your.email@example.com',
       description='Object Detection Package using Isaac ROS',
       license='TODO: License declaration',
       tests_require=['pytest'],
       entry_points={
           'console_scripts': [
               'detector_node = object_detection_pkg.detector_node:main',
           ],
       },
   )
   ```

5. **Build and run the package**:
   ```bash
   cd ~/perception_ws
   colcon build --packages-select object_detection_pkg
   source install/setup.bash
   ros2 launch object_detection_pkg detection_pipeline.launch.py
   ```

### Verification Steps
- [ ] Package builds without errors
- [ ] Launch file runs without errors
- [ ] Isaac ROS DNN nodes start successfully
- [ ] Detection messages are published on the topic

## Task 3: Implement SLAM with Isaac ROS

### Objective
Set up and test Isaac ROS Visual SLAM with simulated or real camera data.

### Steps
1. **Create SLAM launch file** (`slam_pkg/launch/visual_slam.launch.py`):
   ```python
   from launch import LaunchDescription
   from launch_ros.actions import Node
   from launch.actions import DeclareLaunchArgument
   from launch.substitutions import LaunchConfiguration

   def generate_launch_description():
       ld = LaunchDescription()

       # Launch arguments
       namespace = LaunchConfiguration('namespace')
       namespace_arg = DeclareLaunchArgument(
           'namespace',
           default_value='',
           description='Namespace for the SLAM nodes'
       )

       # Isaac ROS Visual SLAM Node
       visual_slam_node = Node(
           package='isaac_ros_visual_slam',
           executable='isaac_ros_visual_slam_node',
           namespace=namespace,
           parameters=[{
               'enable_rectification': True,
               'enable_imu': False,  # Set to True if IMU is available
               'map_frame': 'map',
               'odom_frame': 'odom',
               'base_frame': 'base_link',
               'publish_odom_tf': True,
               'publish_map_odom_tf': True,
           }],
           remappings=[
               ('/visual_slam/image_raw', '/camera/image_raw'),
               ('/visual_slam/camera_info', '/camera/camera_info'),
           ]
       )

       # ROS 2 message filters for stereo input (if using stereo)
       left_rectify_node = Node(
           package='image_proc',
           executable='rectify',
           name='left_rectify_node',
           namespace=namespace,
           parameters=[{'use_sensor_data_qos': True}],
           remappings=[
               ('image', '/camera/left/image_raw'),
               ('camera_info', '/camera/left/camera_info'),
               ('image_rect', '/camera/left/image_rect'),
           ]
       )

       right_rectify_node = Node(
           package='image_proc',
           executable='rectify',
           name='right_rectify_node',
           namespace=namespace,
           parameters=[{'use_sensor_data_qos': True}],
           remappings=[
               ('image', '/camera/right/image_raw'),
               ('camera_info', '/camera/right/camera_info'),
               ('image_rect', '/camera/right/image_rect'),
           ]
       )

       ld.add_action(namespace_arg)
       ld.add_action(visual_slam_node)
       ld.add_action(left_rectify_node)
       ld.add_action(right_rectify_node)

       return ld
   ```

2. **Test SLAM with sample data**:
   ```bash
   # If you have a dataset or simulation environment
   ros2 launch slam_pkg visual_slam.launch.py

   # Check if SLAM is publishing transforms
   ros2 run tf2_tools view_frames

   # Check SLAM topics
   ros2 topic list | grep slam
   ```

3. **Visualize SLAM results** (if using RViz2):
   ```bash
   # In another terminal
   rviz2

   # Add displays for:
   # - TF to see robot pose
   # - Map if available
   # - PointCloud2 if 3D data is available
   ```

### Verification Steps
- [ ] SLAM nodes start without errors
- [ ] TF tree shows SLAM transforms (map -> odom -> base_link)
- [ ] SLAM publishes pose and odometry messages
- [ ] Robot pose updates as it moves in the environment

## Task 4: Create a Decision Making Behavior Tree

### Objective
Implement a behavior tree for robot navigation that integrates perception and navigation.

### Steps
1. **Create a behavior tree package**:
   ```bash
   cd ~/perception_ws/src
   ros2 pkg create --build-type ament_python decision_making_pkg --dependencies rclpy sensor_msgs geometry_msgs nav_msgs std_msgs
   ```

2. **Create behavior tree implementation** (`decision_making_pkg/behavior_tree.py`):
   ```python
   from enum import Enum
   import rclpy
   from rclpy.node import Node
   from sensor_msgs.msg import LaserScan
   from geometry_msgs.msg import Twist
   from geometry_msgs.msg import PoseStamped
   import math

   class NodeStatus(Enum):
       SUCCESS = 1
       FAILURE = 2
       RUNNING = 3

   class BehaviorNode:
       def __init__(self, name):
           self.name = name
           self.status = NodeStatus.FAILURE

       def tick(self):
           pass

   class SequenceNode(BehaviorNode):
       def __init__(self, name, children):
           super().__init__(name)
           self.children = children

       def tick(self):
           for child in self.children:
               child_status = child.tick()

               if child_status == NodeStatus.FAILURE:
                   return NodeStatus.FAILURE
               elif child_status == NodeStatus.RUNNING:
                   return NodeStatus.RUNNING
               # If SUCCESS, continue to next child

           return NodeStatus.SUCCESS

   class SelectorNode(BehaviorNode):
       def __init__(self, name, children):
           super().__init__(name)
           self.children = children

       def tick(self):
           for child in self.children:
               child_status = child.tick()

               if child_status == NodeStatus.SUCCESS:
                   return NodeStatus.SUCCESS
               elif child_status == NodeStatus.RUNNING:
                   return NodeStatus.RUNNING
               # If FAILURE, try next child

           return NodeStatus.FAILURE

   class CheckObstaclesNode(BehaviorNode):
       def __init__(self, name, scan_data):
           super().__init__(name)
           self.scan_data = scan_data

       def tick(self):
           if self.scan_data is None:
               return NodeStatus.FAILURE

           # Check for obstacles in front (simplified)
           front_ranges = self.scan_data.ranges[len(self.scan_data.ranges)//2-10:len(self.scan_data.ranges)//2+10]
           has_obstacle = any(r < 1.0 and not math.isinf(r) for r in front_ranges)

           if has_obstacle:
               return NodeStatus.SUCCESS  # Obstacle detected
           else:
               return NodeStatus.FAILURE  # No obstacle

   class MoveToGoalNode(BehaviorNode):
       def __init__(self, name, cmd_pub, goal_pose):
           super().__init__(name)
           self.cmd_pub = cmd_pub
           self.goal_pose = goal_pose

       def tick(self):
           # Simplified movement toward goal
           cmd_vel = Twist()
           cmd_vel.linear.x = 0.5  # Move forward
           self.cmd_pub.publish(cmd_vel)
           return NodeStatus.RUNNING  # Running until goal reached
   ```

3. **Create main decision making node** (`decision_making_pkg/decision_maker.py`):
   ```python
   #!/usr/bin/env python3

   import rclpy
   from rclpy.node import Node
   from sensor_msgs.msg import LaserScan
   from geometry_msgs.msg import Twist
   from geometry_msgs.msg import PoseStamped
   import math
   from .behavior_tree import *

   class DecisionMakerNode(Node):
       def __init__(self):
           super().__init__('decision_maker_node')

           # Publishers
           self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)

           # Subscribers
           self.scan_sub = self.create_subscription(
               LaserScan,
               '/scan',
               self.scan_callback,
               10
           )

           self.goal_sub = self.create_subscription(
               PoseStamped,
               '/goal_pose',
               self.goal_callback,
               10
           )

           # Data storage
           self.scan_data = None
           self.goal_pose = None

           # Create behavior tree
           self.create_behavior_tree()

           # Timer for behavior tree execution
           self.bt_timer = self.create_timer(0.1, self.execute_behavior_tree)

       def scan_callback(self, msg):
           self.scan_data = msg

       def goal_callback(self, msg):
           self.goal_pose = msg.pose

       def create_behavior_tree(self):
           """Create the main navigation behavior tree"""
           # Selector: try different strategies
           self.root = SelectorNode("navigation_selector", [
               # Check if goal is reached (simplified)
               self.create_check_goal_reached_node(),
               # If not reached, try to navigate
               SequenceNode("navigation_sequence", [
                   # Check for obstacles
                   CheckObstaclesNode("check_obstacles", self.scan_data),
                   # If obstacles detected, avoid them
                   self.create_avoid_obstacle_node(),
               ]),
               # If no obstacles, move to goal
               MoveToGoalNode("move_to_goal", self.cmd_vel_pub, self.goal_pose),
           ])

       def create_check_goal_reached_node(self):
           """Create node to check if goal is reached"""
           class CheckGoalReachedNode(BehaviorNode):
               def __init__(self, name, goal_pose):
                   super().__init__(name)
                   self.goal_pose = goal_pose

               def tick(self):
                   # Simplified goal check
                   # In real implementation, you'd check robot's current position vs goal
                   return NodeStatus.FAILURE  # Goal not reached

           return CheckGoalReachedNode("check_goal_reached", self.goal_pose)

       def create_avoid_obstacle_node(self):
           """Create node to avoid obstacles"""
           class AvoidObstacleNode(BehaviorNode):
               def __init__(self, name, cmd_pub):
                   super().__init__(name)
                   self.cmd_pub = cmd_pub

               def tick(self):
                   cmd_vel = Twist()
                   cmd_vel.angular.z = 0.5  # Turn to avoid
                   cmd_vel.linear.x = 0.2   # Move slowly
                   self.cmd_pub.publish(cmd_vel)
                   return NodeStatus.RUNNING

           return AvoidObstacleNode("avoid_obstacle", self.cmd_vel_pub)

       def execute_behavior_tree(self):
           """Execute the behavior tree"""
           if self.root:
               status = self.root.tick()
               self.get_logger().info(f'Behavior tree status: {status}')

   def main(args=None):
       rclpy.init(args=args)
       node = DecisionMakerNode()

       try:
           rclpy.spin(node)
       except KeyboardInterrupt:
           node.get_logger().info('Shutting down decision maker node')
       finally:
           # Stop robot on shutdown
           cmd_vel = Twist()
           node.cmd_vel_pub.publish(cmd_vel)
           node.destroy_node()
           rclpy.shutdown()

   if __name__ == '__main__':
       main()
   ```

4. **Build and test the decision making system**:
   ```bash
   cd ~/perception_ws
   colcon build --packages-select decision_making_pkg
   source install/setup.bash
   ros2 run decision_making_pkg decision_maker
   ```

### Verification Steps
- [ ] Behavior tree package builds successfully
- [ ] Decision maker node runs without errors
- [ ] Behavior tree executes and makes decisions
- [ ] Robot responds to simulated obstacles in the behavior tree

## Task 5: Integrate Perception and Navigation

### Objective
Create a complete system that integrates perception, navigation, and decision making.

### Steps
1. **Create a system integration launch file**:
   ```xml
   <!-- perception_navigation_integration.launch.py -->
   from launch import LaunchDescription
   from launch_ros.actions import Node
   from launch.actions import IncludeLaunchDescription
   from launch.launch_description_sources import PythonLaunchDescriptionSource
   from ament_index_python.packages import get_launch_package_share_directory
   import os

   def generate_launch_description():
       ld = LaunchDescription()

       # Isaac ROS Visual SLAM (for localization and mapping)
       visual_slam_node = Node(
           package='isaac_ros_visual_slam',
           executable='isaac_ros_visual_slam_node',
           parameters=[{
               'enable_rectification': True,
               'enable_imu': True,
               'map_frame': 'map',
               'odom_frame': 'odom',
               'base_frame': 'base_link',
               'publish_odom_tf': True,
           }],
           remappings=[
               ('/visual_slam/image_raw', '/camera/image_raw'),
               ('/visual_slam/camera_info', '/camera/camera_info'),
           ]
       )

       # Isaac ROS DNN for object detection
       dnn_encoder_node = Node(
           package='isaac_ros_dnn_image_encoder',
           executable='dnn_image_encoder_node',
           parameters=[
               {'input_image_width': 640},
               {'input_image_height': 480},
               {'tensor_output_width': 320},
               {'tensor_output_height': 320},
           ],
           remappings=[
               ('input/image', '/camera/image_raw'),
               ('encoded_tensor', 'tensor_pub'),
           ]
       )

       # Navigation decision maker
       decision_maker_node = Node(
           package='decision_making_pkg',
           executable='decision_maker',
       )

       # Object detector (using our custom package)
       object_detector_node = Node(
           package='object_detection_pkg',
           executable='detector_node',
       )

       ld.add_action(visual_slam_node)
       ld.add_action(dnn_encoder_node)
       ld.add_action(decision_maker_node)
       ld.add_action(object_detector_node)

       return ld
   ```

2. **Test the integrated system**:
   ```bash
   # In simulation environment (like Gazebo with a robot)
   ros2 launch perception_navigation_pkg perception_navigation_integration.launch.py

   # Monitor the system
   ros2 topic list
   ros2 topic echo /object_detections
   ros2 topic echo /tf --field transforms
   ```

### Verification Steps
- [ ] All nodes in the integrated system start successfully
- [ ] Perception system detects objects
- [ ] SLAM system creates map and tracks pose
- [ ] Decision maker integrates perception and navigation
- [ ] System responds appropriately to environmental changes

## Assessment Questions

1. What is the main advantage of using Isaac ROS for perception compared to traditional computer vision approaches?
2. Explain the difference between a Sequence node and a Selector node in behavior trees.
3. What is SLAM and why is it important for robot navigation?
4. How does sensor fusion improve robot perception capabilities?
5. What are the key components of an AI-powered navigation system?
6. Describe the role of decision making in robotics and how it integrates with perception and navigation.
7. What are the main challenges in implementing real-time perception systems on robotic platforms?
8. How can simulation environments like Isaac Sim accelerate the development of perception systems?
9. Explain the concept of "sim-to-real transfer" in the context of AI perception.
10. What safety considerations should be taken into account when developing autonomous navigation systems?
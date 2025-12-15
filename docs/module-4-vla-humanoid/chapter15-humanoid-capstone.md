# Chapter 15: Capstone Project - Autonomous Humanoid

## Overview

Welcome to the capstone project of our Physical AI and Humanoid Robotics course! In this chapter, we'll integrate all the concepts you've learned to create an autonomous humanoid robot that can listen to voice commands, plan actions, navigate to locations, perceive objects, and manipulate them. This represents the culmination of your learning journey from ROS 2 fundamentals to advanced Vision-Language-Action systems.

## Project Architecture

### The Complete VLA Pipeline
Our autonomous humanoid will implement the complete pipeline:
```
Voice Command → Language Understanding → World Perception → Task Planning → Motion Planning → Action Execution → Feedback
```

### System Components
The complete system will include:
1. **Voice Interface**: Speech recognition and natural language processing
2. **Vision System**: Object detection, scene understanding, spatial reasoning
3. **Planning System**: Task planning, motion planning, path planning
4. **Control System**: Balance control, manipulation control, walking control
5. **Integration Layer**: Coordinating all components in real-time

## Voice Command Processing

### Speech Recognition and NLP
```python
import speech_recognition as sr
import openai
from transformers import pipeline
import rospy
from std_msgs.msg import String

class VoiceCommandProcessor:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()

        # Initialize NLP pipeline
        self.nlp_pipeline = pipeline("text-classification",
                                   model="distilbert-base-uncased-finetuned-sst-2-english")

        # ROS publishers/subscribers
        self.command_pub = rospy.Publisher('/robot/command', String, queue_size=10)
        self.response_pub = rospy.Publisher('/robot/response', String, queue_size=10)

    def listen_and_process(self):
        """
        Listen for voice command and process it
        """
        with self.microphone as source:
            print("Listening for command...")
            self.recognizer.adjust_for_ambient_noise(source)
            audio = self.recognizer.listen(source)

        try:
            # Convert speech to text
            command_text = self.recognizer.recognize_google(audio)
            print(f"Heard: {command_text}")

            # Process the command
            processed_command = self.process_command(command_text)

            # Publish the command
            cmd_msg = String()
            cmd_msg.data = str(processed_command)
            self.command_pub.publish(cmd_msg)

            return processed_command

        except sr.UnknownValueError:
            print("Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Could not request results; {e}")
            return None

    def process_command(self, command_text):
        """
        Process natural language command into structured format
        """
        # Simple command parsing (in practice, use more sophisticated NLP)
        command_lower = command_text.lower()

        if 'pick up' in command_lower or 'grasp' in command_lower or 'get' in command_lower:
            return self.parse_pickup_command(command_lower)
        elif 'go to' in command_lower or 'move to' in command_lower or 'navigate to' in command_lower:
            return self.parse_navigation_command(command_lower)
        elif 'bring' in command_lower or 'deliver' in command_lower:
            return self.parse_delivery_command(command_lower)
        else:
            return self.parse_generic_command(command_lower)

    def parse_pickup_command(self, command):
        """
        Parse pickup-related commands
        """
        # Extract object to pick up
        object_name = self.extract_object_name(command)

        return {
            'action': 'pickup',
            'object': object_name,
            'location': 'current',
            'confidence': 0.9
        }

    def parse_navigation_command(self, command):
        """
        Parse navigation-related commands
        """
        # Extract destination
        destination = self.extract_location(command)

        return {
            'action': 'navigate',
            'destination': destination,
            'confidence': 0.85
        }

    def parse_delivery_command(self, command):
        """
        Parse delivery-related commands
        """
        # Extract object and destination
        object_name = self.extract_object_name(command)
        destination = self.extract_location(command)

        return {
            'action': 'deliver',
            'object': object_name,
            'destination': destination,
            'confidence': 0.9
        }

    def extract_object_name(self, command):
        """
        Extract object name from command (simplified)
        """
        # In practice, use more sophisticated NLP
        common_objects = ['cup', 'bottle', 'book', 'box', 'ball', 'phone', 'tablet']

        for obj in common_objects:
            if obj in command:
                return obj

        return 'unknown_object'

    def extract_location(self, command):
        """
        Extract location from command (simplified)
        """
        # In practice, use more sophisticated NLP
        common_locations = ['kitchen', 'living room', 'bedroom', 'office', 'table', 'counter']

        for loc in common_locations:
            if loc in command:
                return loc

        return 'unknown_location'
```

## World Perception System

### Integrated Perception Pipeline
```python
import cv2
import numpy as np
import rospy
from sensor_msgs.msg import Image, CameraInfo
from cv_bridge import CvBridge
from geometry_msgs.msg import PointStamped
from visualization_msgs.msg import MarkerArray
import torch
from torchvision import transforms

class WorldPerceptionSystem:
    def __init__(self):
        self.cv_bridge = CvBridge()

        # Publishers and subscribers
        self.image_sub = rospy.Subscriber('/camera/rgb/image_raw', Image, self.image_callback)
        self.depth_sub = rospy.Subscriber('/camera/depth/image_raw', Image, self.depth_callback)
        self.camera_info_sub = rospy.Subscriber('/camera/rgb/camera_info', CameraInfo, self.camera_info_callback)

        self.object_pub = rospy.Publisher('/detected_objects', MarkerArray, queue_size=10)
        self.scene_pub = rospy.Publisher('/scene_description', String, queue_size=10)

        # Perception components
        self.object_detector = self.initialize_object_detector()
        self.spatial_reasoner = SpatialReasoner()

        # Camera parameters
        self.camera_intrinsics = None
        self.latest_image = None
        self.latest_depth = None

    def initialize_object_detector(self):
        """
        Initialize object detection model (using YOLO or similar)
        """
        # In practice, load a pre-trained model like YOLOv5 or DETR
        # For this example, we'll simulate detection
        return ObjectDetector()

    def image_callback(self, msg):
        """
        Process incoming RGB image
        """
        try:
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
            self.latest_image = cv_image

            # Process image for object detection
            detections = self.process_image(cv_image)

            # Publish detected objects
            self.publish_detections(detections, msg.header)

        except Exception as e:
            rospy.logerr(f"Error processing image: {e}")

    def depth_callback(self, msg):
        """
        Process incoming depth image
        """
        try:
            depth_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='32FC1')
            self.latest_depth = depth_image

        except Exception as e:
            rospy.logerr(f"Error processing depth: {e}")

    def camera_info_callback(self, msg):
        """
        Store camera intrinsics
        """
        self.camera_intrinsics = {
            'fx': msg.K[0],  # Focal length x
            'fy': msg.K[4],  # Focal length y
            'cx': msg.K[2],  # Principal point x
            'cy': msg.K[5],  # Principal point y
        }

    def process_image(self, cv_image):
        """
        Process image for object detection and scene understanding
        """
        if self.object_detector is None:
            return []

        # Run object detection
        detections = self.object_detector.detect(cv_image)

        # Add 3D position information using depth
        for detection in detections:
            bbox = detection['bbox']
            center_x = int(bbox[0] + bbox[2] / 2)
            center_y = int(bbox[1] + bbox[3] / 2)

            if self.latest_depth is not None and self.camera_intrinsics:
                # Get depth at object center
                depth = self.latest_depth[center_y, center_x]

                # Convert to 3D world coordinates
                x_3d = (center_x - self.camera_intrinsics['cx']) * depth / self.camera_intrinsics['fx']
                y_3d = (center_y - self.camera_intrinsics['cy']) * depth / self.camera_intrinsics['fy']
                z_3d = depth

                detection['position_3d'] = [x_3d, y_3d, z_3d]

        return detections

    def publish_detections(self, detections, header):
        """
        Publish detected objects as visualization markers
        """
        marker_array = MarkerArray()

        for i, detection in enumerate(detections):
            marker = Marker()
            marker.header = header
            marker.ns = "objects"
            marker.id = i
            marker.type = Marker.CUBE
            marker.action = Marker.ADD

            # Set position
            if 'position_3d' in detection:
                pos = detection['position_3d']
                marker.pose.position.x = pos[0]
                marker.pose.position.y = pos[1]
                marker.pose.position.z = pos[2]

            # Set size based on bounding box
            bbox = detection['bbox']
            marker.scale.x = bbox[2] * 0.01  # Scale appropriately
            marker.scale.y = bbox[3] * 0.01
            marker.scale.z = 0.1  # Fixed height

            # Set color based on object class
            if detection['class'] == 'cup':
                marker.color.r = 1.0
            elif detection['class'] == 'bottle':
                marker.color.g = 1.0
            else:
                marker.color.b = 1.0
            marker.color.a = 0.8

            marker_array.markers.append(marker)

        self.object_pub.publish(marker_array)

class ObjectDetector:
    def __init__(self):
        # In practice, load a pre-trained model
        pass

    def detect(self, image):
        """
        Detect objects in image (simulated)
        """
        # This would use a real object detection model
        # For simulation, return some fake detections
        return [
            {
                'class': 'cup',
                'confidence': 0.95,
                'bbox': [100, 100, 50, 80],
                'name': 'red cup'
            },
            {
                'class': 'bottle',
                'confidence': 0.89,
                'bbox': [200, 150, 40, 100],
                'name': 'water bottle'
            }
        ]
```

## Task Planning System

### Hierarchical Task Planner
```python
class TaskPlanner:
    def __init__(self):
        self.navigation_planner = NavigationPlanner()
        self.manipulation_planner = ManipulationPlanner()
        self.trajectory_generator = TrajectoryGenerator()

    def plan_task(self, command, current_state, world_model):
        """
        Plan a complete task based on command and world state
        """
        if command['action'] == 'pickup':
            return self.plan_pickup_task(command, current_state, world_model)
        elif command['action'] == 'navigate':
            return self.plan_navigation_task(command, current_state, world_model)
        elif command['action'] == 'deliver':
            return self.plan_delivery_task(command, current_state, world_model)
        else:
            return self.plan_generic_task(command, current_state, world_model)

    def plan_pickup_task(self, command, current_state, world_model):
        """
        Plan task to pick up an object
        """
        # Find the target object in the world model
        target_object = self.find_object_by_name(command['object'], world_model)

        if not target_object:
            # Object not found, need to search
            search_task = self.plan_search_task(command['object'], current_state)
            return search_task

        # Plan navigation to object
        navigation_task = self.navigation_planner.plan_to_object(target_object, current_state)

        # Plan manipulation to pick up object
        manipulation_task = self.manipulation_planner.plan_pickup(target_object, current_state)

        # Combine tasks
        return {
            'task_type': 'pickup',
            'subtasks': [
                {
                    'type': 'navigation',
                    'destination': target_object['position'],
                    'trajectory': navigation_task['trajectory']
                },
                {
                    'type': 'manipulation',
                    'action': 'grasp',
                    'object': target_object,
                    'trajectory': manipulation_task['trajectory']
                }
            ]
        }

    def plan_delivery_task(self, command, current_state, world_model):
        """
        Plan task to deliver an object to a destination
        """
        # First, find the object to deliver
        target_object = self.find_object_by_name(command['object'], world_model)

        if not target_object:
            # Object not found, need to search
            search_task = self.plan_search_task(command['object'], current_state)
            return search_task

        # Plan navigation to object
        navigate_to_object = self.navigation_planner.plan_to_object(target_object, current_state)

        # Plan pickup
        pickup_task = self.manipulation_planner.plan_pickup(target_object, current_state)

        # Plan navigation to destination
        destination = self.get_location_coordinates(command['destination'], world_model)
        navigate_to_dest = self.navigation_planner.plan_to_location(destination, current_state)

        # Plan placement
        place_task = self.manipulation_planner.plan_place(destination, current_state)

        return {
            'task_type': 'delivery',
            'subtasks': [
                {
                    'type': 'navigation',
                    'description': 'Go to object',
                    'destination': target_object['position'],
                    'trajectory': navigate_to_object['trajectory']
                },
                {
                    'type': 'manipulation',
                    'description': 'Pick up object',
                    'action': 'grasp',
                    'object': target_object,
                    'trajectory': pickup_task['trajectory']
                },
                {
                    'type': 'navigation',
                    'description': 'Go to destination',
                    'destination': destination,
                    'trajectory': navigate_to_dest['trajectory']
                },
                {
                    'type': 'manipulation',
                    'description': 'Place object',
                    'action': 'place',
                    'destination': destination,
                    'trajectory': place_task['trajectory']
                }
            ]
        }

    def find_object_by_name(self, name, world_model):
        """
        Find object by name in world model
        """
        for obj in world_model.get('objects', []):
            if name.lower() in obj.get('name', '').lower():
                return obj
        return None

    def get_location_coordinates(self, location_name, world_model):
        """
        Get coordinates for a named location
        """
        # In practice, this would use a semantic map
        # For now, return some default coordinates
        location_map = {
            'kitchen': [3.0, 1.0, 0.0],
            'living room': [0.0, 0.0, 0.0],
            'bedroom': [-2.0, 1.0, 0.0],
            'office': [1.0, -2.0, 0.0],
            'table': [2.0, 0.5, 0.0],
            'counter': [2.5, 0.0, 0.0]
        }

        return location_map.get(location_name.lower(), [0.0, 0.0, 0.0])
```

## Motion Planning and Control

### Integration with Humanoid Control
```python
import numpy as np
from scipy.interpolate import CubicSpline

class MotionPlanner:
    def __init__(self):
        self.walk_controller = WalkingController()
        self.manip_controller = ManipulationController()
        self.balance_controller = BalanceController()

    def execute_task_plan(self, task_plan, current_state):
        """
        Execute a planned task by coordinating motion and control
        """
        for subtask in task_plan['subtasks']:
            if subtask['type'] == 'navigation':
                self.execute_navigation_task(subtask, current_state)
            elif subtask['type'] == 'manipulation':
                self.execute_manipulation_task(subtask, current_state)
            elif subtask['type'] == 'combined':
                self.execute_combined_task(subtask, current_state)

    def execute_navigation_task(self, task, current_state):
        """
        Execute navigation subtask
        """
        # Generate walking trajectory
        walking_trajectory = self.walk_controller.generate_walking_trajectory(
            destination=task['destination'],
            current_state=current_state
        )

        # Execute the walking pattern
        self.walk_controller.execute_trajectory(walking_trajectory)

        # Monitor progress and adjust for balance
        self.balance_controller.monitor_and_adjust(current_state)

    def execute_manipulation_task(self, task, current_state):
        """
        Execute manipulation subtask
        """
        if task['action'] == 'grasp':
            # Plan and execute grasp
            grasp_plan = self.manip_controller.plan_grasp(
                object_pose=task['object']['pose'],
                hand_type='right'
            )
            self.manip_controller.execute_grasp(grasp_plan)

        elif task['action'] == 'place':
            # Plan and execute placement
            place_plan = self.manip_controller.plan_placement(
                target_pose=task['destination'],
                object_pose=task['object']['pose']
            )
            self.manip_controller.execute_placement(place_plan)

    def generate_arm_trajectory(self, start_pose, end_pose, obstacles=None):
        """
        Generate trajectory for arm movement
        """
        # Simple straight-line trajectory in joint space
        # In practice, use more sophisticated path planning
        num_points = 50
        trajectory = []

        for i in range(num_points + 1):
            t = i / num_points
            current_pose = self.interpolate_poses(start_pose, end_pose, t)
            trajectory.append(current_pose)

        return trajectory

    def interpolate_poses(self, start_pose, end_pose, t):
        """
        Linear interpolation between two poses
        """
        # Interpolate position
        pos = start_pose[:3] + t * (end_pose[:3] - start_pose[:3])

        # Interpolate orientation (simplified)
        # In practice, use quaternion interpolation
        rot = start_pose[3:] + t * (end_pose[3:] - start_pose[3:])

        return np.concatenate([pos, rot])
```

## Complete Autonomous System

### Main System Integration
```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from sensor_msgs.msg import Image, JointState
from geometry_msgs.msg import PoseStamped
import time
import threading

class AutonomousHumanoidSystem(Node):
    def __init__(self):
        super().__init__('autonomous_humanoid_system')

        # Initialize components
        self.voice_processor = VoiceCommandProcessor()
        self.perception_system = WorldPerceptionSystem()
        self.task_planner = TaskPlanner()
        self.motion_planner = MotionPlanner()

        # Publishers and subscribers
        self.command_sub = self.create_subscription(
            String, '/robot/command', self.command_callback, 10
        )
        self.joint_state_sub = self.create_subscription(
            JointState, '/joint_states', self.joint_state_callback, 10
        )

        # Robot state
        self.current_joint_states = None
        self.world_model = {}
        self.is_executing = False

        # Timer for continuous operation
        self.voice_timer = self.create_timer(1.0, self.check_for_voice_commands)

    def joint_state_callback(self, msg):
        """
        Update current joint states
        """
        self.current_joint_states = msg

    def command_callback(self, msg):
        """
        Process incoming command
        """
        if self.is_executing:
            self.get_logger().info('Still executing previous command, ignoring new command')
            return

        try:
            command = eval(msg.data)  # In practice, use safer parsing
            self.execute_command(command)
        except Exception as e:
            self.get_logger().error(f'Error processing command: {e}')

    def check_for_voice_commands(self):
        """
        Periodically check for voice commands
        """
        if not self.is_executing:
            # This would run the voice processing in a separate thread
            # to avoid blocking the main ROS loop
            threading.Thread(target=self.voice_processor.listen_and_process).start()

    def execute_command(self, command):
        """
        Execute a high-level command through the complete pipeline
        """
        self.is_executing = True
        self.get_logger().info(f'Executing command: {command}')

        try:
            # 1. Update world model with current perception
            self.update_world_model()

            # 2. Plan the task
            task_plan = self.task_planner.plan_task(
                command, self.current_joint_states, self.world_model
            )

            # 3. Execute the task plan
            self.motion_planner.execute_task_plan(task_plan, self.current_joint_states)

            # 4. Report success
            response = f'Successfully executed: {command["action"]} {command.get("object", "")}'
            self.get_logger().info(response)

        except Exception as e:
            self.get_logger().error(f'Error executing command: {e}')
            response = f'Failed to execute command: {e}'

        finally:
            self.is_executing = False

    def update_world_model(self):
        """
        Update world model with current perception data
        """
        # In practice, this would integrate data from multiple sensors
        # For now, we'll simulate a simple world model
        self.world_model = {
            'objects': [
                {'name': 'red cup', 'position': [1.0, 0.5, 0.0], 'pose': [1.0, 0.5, 0.0, 0, 0, 0]},
                {'name': 'water bottle', 'position': [1.5, 0.0, 0.0], 'pose': [1.5, 0.0, 0.0, 0, 0, 0]}
            ],
            'locations': {
                'kitchen': [3.0, 1.0, 0.0],
                'living_room': [0.0, 0.0, 0.0]
            }
        }

def main(args=None):
    rclpy.init(args=args)

    # Create and run the autonomous humanoid system
    autonomous_system = AutonomousHumanoidSystem()

    try:
        rclpy.spin(autonomous_system)
    except KeyboardInterrupt:
        autonomous_system.get_logger().info('Shutting down autonomous humanoid system')
    finally:
        autonomous_system.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Simulation Environment Setup

### Gazebo Simulation Configuration
```xml
<!-- humanoid_robot.gazebo -->
<robot name="autonomous_humanoid" xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10"/>
      <inertia ixx="1" ixy="0" ixz="0" iyy="1" iyz="0" izz="1"/>
    </inertial>
  </link>

  <!-- Torso -->
  <joint name="torso_joint" type="fixed">
    <parent link="base_link"/>
    <child link="torso"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
  </joint>

  <link name="torso">
    <visual>
      <geometry>
        <box size="0.2 0.2 0.5"/>
      </geometry>
      <material name="gray">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.2 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Head with camera -->
  <joint name="head_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10" velocity="1"/>
  </joint>

  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
      <material name="white">
        <color rgba="1 1 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Camera in head -->
  <gazebo reference="head">
    <sensor type="camera" name="head_camera">
      <update_rate>30.0</update_rate>
      <camera name="head">
        <horizontal_fov>1.3962634015954636</horizontal_fov>
        <image>
          <width>640</width>
          <height>480</height>
          <format>R8G8B8</format>
        </image>
        <clip>
          <near>0.02</near>
          <far>300</far>
        </clip>
      </camera>
      <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
        <frame_name>head_camera_optical_frame</frame_name>
        <topic_name>/camera/rgb/image_raw</topic_name>
      </plugin>
    </sensor>
  </gazebo>

  <!-- Left arm -->
  <joint name="left_shoulder_joint" type="revolute">
    <parent link="torso"/>
    <child link="left_upper_arm"/>
    <origin xyz="0.15 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
  </joint>

  <link name="left_upper_arm">
    <visual>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
      <material name="red">
        <color rgba="1 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Additional joints and links for complete humanoid model -->
  <!-- ... (similar definitions for right arm, legs, etc.) ... -->

  <!-- ROS Control interface -->
  <gazebo>
    <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
      <robotNamespace>/autonomous_humanoid</robotNamespace>
    </plugin>
  </gazebo>

</robot>
```

## Launch Configuration

### Complete System Launch File
```xml
<!-- launch/autonomous_humanoid.launch.py -->
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_launch_package_share_directory
import os

def generate_launch_description():
    ld = LaunchDescription()

    # Launch Gazebo simulation
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            get_launch_package_share_directory('gazebo_ros'),
            '/launch/gazebo.launch.py'
        ]),
        launch_arguments={
            'world': os.path.join(get_launch_package_share_directory('autonomous_humanoid'), 'worlds', 'home_world.world')
        }.items()
    )

    # Launch robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[
            {'use_sim_time': True},
            {'robot_description': open(os.path.join(get_launch_package_share_directory('autonomous_humanoid'), 'urdf', 'humanoid_robot.urdf')).read()}
        ]
    )

    # Launch joint state publisher
    joint_state_publisher = Node(
        package='joint_state_publisher',
        executable='joint_state_publisher',
        name='joint_state_publisher',
        parameters=[{'use_sim_time': True}]
    )

    # Launch perception system
    perception_node = Node(
        package='autonomous_humanoid',
        executable='perception_system',
        name='perception_system',
        parameters=[{'use_sim_time': True}]
    )

    # Launch navigation system
    navigation_node = Node(
        package='nav2_bringup',
        executable='nav2_bringup',
        name='navigation_system',
        parameters=[
            os.path.join(get_launch_package_share_directory('autonomous_humanoid'), 'config', 'nav2_params.yaml')
        ]
    )

    # Launch the main autonomous system
    autonomous_system = Node(
        package='autonomous_humanoid',
        executable='autonomous_humanoid_system',
        name='autonomous_humanoid_system',
        parameters=[{'use_sim_time': True}]
    )

    # Add all actions to launch description
    ld.add_action(gazebo)
    ld.add_action(robot_state_publisher)
    ld.add_action(joint_state_publisher)
    ld.add_action(perception_node)
    ld.add_action(navigation_node)
    ld.add_action(autonomous_system)

    return ld
```

## Testing and Validation

### Test Scenarios
```python
class SystemTester:
    def __init__(self):
        self.test_scenarios = [
            self.test_simple_navigation,
            self.test_object_pickup,
            self.test_delivery_task,
            self.test_voice_command_response
        ]

    def run_all_tests(self):
        """
        Run all system tests
        """
        results = []
        for test in self.test_scenarios:
            result = test()
            results.append((test.__name__, result))
            print(f"{test.__name__}: {'PASS' if result else 'FAIL'}")

        return results

    def test_simple_navigation(self):
        """
        Test simple navigation to a known location
        """
        try:
            # Send navigation command
            command = {'action': 'navigate', 'destination': 'kitchen', 'confidence': 0.9}

            # Execute command and check if robot reaches destination
            # This would involve checking robot position after execution
            success = self.check_navigation_success('kitchen')

            return success
        except Exception as e:
            print(f"Navigation test failed: {e}")
            return False

    def test_object_pickup(self):
        """
        Test object pickup capability
        """
        try:
            # Place object in known location
            # Send pickup command
            command = {'action': 'pickup', 'object': 'red cup', 'confidence': 0.95}

            # Execute command and check if object is grasped
            success = self.check_grasp_success('red cup')

            return success
        except Exception as e:
            print(f"Pickup test failed: {e}")
            return False

    def test_delivery_task(self):
        """
        Test complete delivery task
        """
        try:
            # Send delivery command
            command = {
                'action': 'deliver',
                'object': 'red cup',
                'destination': 'living room',
                'confidence': 0.9
            }

            # Execute command and check if object is delivered to destination
            success = self.check_delivery_success('red cup', 'living room')

            return success
        except Exception as e:
            print(f"Delivery test failed: {e}")
            return False

    def test_voice_command_response(self):
        """
        Test voice command processing
        """
        try:
            # Simulate voice command
            simulated_command = "Please pick up the red cup"

            # Process command and check if correct action is generated
            processed_command = self.voice_processor.process_command(simulated_command)

            expected_action = 'pickup'
            expected_object = 'cup'

            success = (processed_command['action'] == expected_action and
                      expected_object in processed_command['object'])

            return success
        except Exception as e:
            print(f"Voice command test failed: {e}")
            return False

    def check_navigation_success(self, destination):
        """
        Check if navigation was successful
        """
        # In simulation, check if robot is close to destination
        # This would involve checking robot position vs target position
        return True  # Simplified for example

    def check_grasp_success(self, object_name):
        """
        Check if object grasp was successful
        """
        # Check if object is in robot's gripper
        return True  # Simplified for example

    def check_delivery_success(self, object_name, destination):
        """
        Check if delivery was successful
        """
        # Check if object is at destination and robot is not holding it
        return True  # Simplified for example
```

## Performance Evaluation

### Metrics and Benchmarks
```python
class PerformanceEvaluator:
    def __init__(self):
        self.metrics = {
            'task_success_rate': 0.0,
            'response_time': 0.0,
            'navigation_accuracy': 0.0,
            'grasp_success_rate': 0.0,
            'voice_recognition_accuracy': 0.0,
            'safety_incidents': 0
        }

    def evaluate_system(self, test_results):
        """
        Evaluate system performance based on test results
        """
        successful_tasks = sum(1 for _, result in test_results if result)
        total_tasks = len(test_results)

        self.metrics['task_success_rate'] = successful_tasks / total_tasks if total_tasks > 0 else 0.0

        # Calculate other metrics based on test results
        # For example, average response time, navigation accuracy, etc.

        return self.metrics

    def generate_performance_report(self):
        """
        Generate detailed performance report
        """
        report = f"""
        === Autonomous Humanoid Performance Report ===

        Task Success Rate: {self.metrics['task_success_rate']:.2%}
        Navigation Accuracy: {self.metrics['navigation_accuracy']:.2%}
        Grasp Success Rate: {self.metrics['grasp_success_rate']:.2%}
        Voice Recognition Accuracy: {self.metrics['voice_recognition_accuracy']:.2%}
        Safety Incidents: {self.metrics['safety_incidents']}

        Overall Performance: {"EXCELLENT" if self.metrics['task_success_rate'] > 0.9 else
                             "GOOD" if self.metrics['task_success_rate'] > 0.7 else
                             "FAIR" if self.metrics['task_success_rate'] > 0.5 else "POOR"}
        """

        return report
```

## Safety and Error Handling

### Comprehensive Error Handling
```python
class SafetyManager:
    def __init__(self):
        self.safety_thresholds = {
            'joint_limit_violation': 0.1,  # radians
            'collision_distance': 0.1,     # meters
            'fall_angle': 30,              # degrees
            'force_limit': 50              # Newtons
        }
        self.emergency_stop = False

    def monitor_system_safety(self, robot_state):
        """
        Monitor system for safety violations
        """
        violations = []

        # Check joint limits
        joint_violations = self.check_joint_limits(robot_state)
        if joint_violations:
            violations.extend(joint_violations)

        # Check for potential collisions
        collision_risks = self.check_collision_risks(robot_state)
        if collision_risks:
            violations.extend(collision_risks)

        # Check balance
        balance_issues = self.check_balance(robot_state)
        if balance_issues:
            violations.extend(balance_issues)

        # Trigger emergency stop if critical violations
        if self.has_critical_violations(violations):
            self.trigger_emergency_stop()
            return False

        return True

    def check_joint_limits(self, robot_state):
        """
        Check for joint limit violations
        """
        violations = []
        # Check each joint against its limits
        # Return list of violations
        return violations

    def check_collision_risks(self, robot_state):
        """
        Check for potential collisions
        """
        violations = []
        # Use distance sensors and planning to check for collision risks
        # Return list of collision risks
        return violations

    def check_balance(self, robot_state):
        """
        Check robot balance
        """
        violations = []
        # Check orientation, center of mass position, etc.
        # Return balance issues
        return violations

    def has_critical_violations(self, violations):
        """
        Check if there are critical safety violations
        """
        critical_violations = [
            'fall_imminent', 'high_force_detected', 'critical_collision_risk'
        ]

        return any(violation_type in critical_violations
                  for violation_type, _ in violations)

    def trigger_emergency_stop(self):
        """
        Trigger emergency stop and safe shutdown
        """
        self.emergency_stop = True
        # Stop all robot motion
        # Move to safe position if possible
        # Log incident
        print("EMERGENCY STOP ACTIVATED - SAFETY SYSTEM ENGAGED")
```

## Chapter Summary

In this capstone chapter, you learned:
- How to integrate all components into a complete autonomous humanoid system
- The architecture for Vision-Language-Action systems
- Voice command processing and natural language understanding
- World perception and scene understanding
- Task planning and motion control integration
- Simulation setup and testing procedures
- Performance evaluation and safety considerations

The autonomous humanoid system represents the integration of all the concepts covered in this course, from ROS 2 fundamentals to advanced AI perception and control systems. This system can understand natural language commands, perceive its environment, plan appropriate actions, and execute them safely.

## Practice Tasks

1. Implement the complete autonomous humanoid system in simulation
2. Test the system with various voice commands
3. Evaluate system performance using the provided metrics
4. Add additional safety features and error handling
5. Extend the system to handle more complex tasks

## Next Steps

In the final chapter of this module, we'll explore conversational robotics and how to make your humanoid robot more natural and intuitive to interact with. We'll cover advanced dialogue systems, social robotics principles, and how to create robots that can engage in meaningful conversations with humans.
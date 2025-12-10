# Capstone Project: Integrated Physical AI & Humanoid Robotics System

## Project Overview

The capstone project brings together all the concepts learned throughout this book into a comprehensive Physical AI & Humanoid Robotics system. You'll create a complete application that integrates ROS 2 fundamentals, digital twin simulation, AI-powered control, and voice-driven interaction.

## Project Requirements

### Core Functionality
1. **ROS 2 Integration**: Implement a complete ROS 2 system with multiple nodes communicating via topics and services
2. **Simulation Environment**: Create a Gazebo simulation with a humanoid robot and interactive environment
3. **AI Control**: Develop AI algorithms for perception, planning, and control
4. **Voice Interface**: Implement voice command recognition and execution
5. **Humanoid Control**: Execute complex humanoid robot behaviors

### Technical Constraints
- Use ROS 2 Humble Hawksbill
- Implement GPU-accelerated processing where possible
- Ensure system runs in simulation before considering real hardware
- Include comprehensive error handling and safety measures

## System Architecture

### High-Level Design

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Voice Input   │───▶│  NLP Processing  │───▶│ Action Planning │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Camera Feed   │───▶│ Visual Analysis  │───▶│ Motion Control  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
                    ┌─────────────────────────────────────────┐
                    │           Robot Platform              │
                    │  ┌─────────────┐  ┌─────────────────┐  │
                    │  │ Simulation  │  │ Real Hardware   │  │
                    │  │   (Gazebo)  │  │   (Optional)    │  │
                    │  └─────────────┘  └─────────────────┘  │
                    └─────────────────────────────────────────┘
```

### Component Breakdown

1. **Voice Processing Module**: Handles speech-to-text conversion and command interpretation
2. **Visual Perception Module**: Processes camera feeds for object detection and scene understanding
3. **Cognitive Planning Module**: Combines voice and visual inputs to determine appropriate actions
4. **Motion Control Module**: Translates high-level actions into low-level joint commands
5. **Robot Platform**: Either simulated in Gazebo or on real hardware

## Implementation Steps

### Step 1: Project Setup

First, create the package structure for your capstone project:

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python capstone_project --dependencies rclpy std_msgs sensor_msgs geometry_msgs nav_msgs message_generation
```

### Step 2: Define Custom Messages

Create a message file for the capstone project:

File: `capstone_project/msg/RobotCommand.msg`
```
string command_type
string target_object
float64[] target_position
string description
```

Update your `package.xml` to include message generation dependencies:

```xml
<depend>message_runtime</depend>
<depend>builtin_interfaces</depend>
```

### Step 3: Voice Command Node

Create the main voice processing node:

File: `capstone_project/voice_processor.py`

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
import whisper
import pyaudio
import wave
import numpy as np
from std_msgs.msg import String
from sensor_msgs.msg import Image
from capstone_project.msg import RobotCommand
import threading
import queue

class VoiceProcessorNode(Node):
    def __init__(self):
        super().__init__('voice_processor')

        # Initialize Whisper model
        self.model = whisper.load_model("base")

        # Audio parameters
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 44100
        self.record_seconds = 3

        # Publishers and subscribers
        self.command_pub = self.create_publisher(RobotCommand, 'robot_command', 10)
        self.status_pub = self.create_publisher(String, 'voice_status', 10)

        # Initialize audio
        self.audio = pyaudio.PyAudio()

        # Create a thread for continuous listening
        self.listening = True
        self.command_queue = queue.Queue()

        # Start listening thread
        self.listen_thread = threading.Thread(target=self.continuous_listening)
        self.listen_thread.start()

        self.get_logger().info("Voice Processor initialized")

    def continuous_listening(self):
        """Continuously listen for voice commands"""
        while self.listening:
            try:
                # Record audio
                frames = self.record_audio()

                # Transcribe
                command_text = self.transcribe_audio(frames)

                if command_text:
                    self.get_logger().info(f"Recognized: {command_text}")

                    # Process and publish command
                    self.process_command(command_text)

            except Exception as e:
                self.get_logger().error(f"Error in listening loop: {e}")

            # Small delay to prevent excessive CPU usage
            time.sleep(0.1)

    def record_audio(self):
        """Record audio from microphone"""
        stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk
        )

        frames = []
        for i in range(0, int(self.rate / self.chunk * self.record_seconds)):
            data = stream.read(self.chunk)
            frames.append(data)

        stream.stop_stream()
        stream.close()

        return frames

    def transcribe_audio(self, frames):
        """Transcribe audio using Whisper"""
        # Save to temp file
        filename = "/tmp/temp_recording.wav"
        wf = wave.open(filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(self.audio.get_sample_size(self.format))
        wf.setframerate(self.rate)
        wf.writeframes(b''.join(frames))
        wf.close()

        # Transcribe
        result = self.model.transcribe(filename)
        transcription = result["text"]

        # Clean up
        import os
        os.remove(filename)

        return transcription.strip()

    def process_command(self, command_text):
        """Process the recognized command"""
        command_text = command_text.lower().strip()

        # Create robot command message
        cmd_msg = RobotCommand()
        cmd_msg.description = command_text

        if "move forward" in command_text:
            cmd_msg.command_type = "MOVE"
            cmd_msg.target_position = [1.0, 0.0, 0.0]  # Move 1m forward
        elif "turn left" in command_text:
            cmd_msg.command_type = "ROTATE"
            cmd_msg.target_position = [0.0, 0.0, 1.57]  # 90 degrees left
        elif "turn right" in command_text:
            cmd_msg.command_type = "ROTATE"
            cmd_msg.target_position = [0.0, 0.0, -1.57]  # 90 degrees right
        elif "wave" in command_text or "hello" in command_text:
            cmd_msg.command_type = "GESTURE"
            cmd_msg.target_object = "wave"
        elif "pick up" in command_text:
            obj = command_text.replace("pick up", "").strip()
            cmd_msg.command_type = "GRASP"
            cmd_msg.target_object = obj
        else:
            cmd_msg.command_type = "UNKNOWN"
            cmd_msg.description = f"Unknown command: {command_text}"

        self.command_pub.publish(cmd_msg)

    def destroy_node(self):
        """Clean up resources"""
        self.listening = False
        if hasattr(self, 'listen_thread'):
            self.listen_thread.join()
        if hasattr(self, 'audio'):
            self.audio.terminate()
        super().destroy_node()

def main(args=None):
    rclpy.init(args=args)
    node = VoiceProcessorNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Visual Perception Node

Create the visual perception component:

File: `capstone_project/visual_perceptor.py`

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
import cv2
import numpy as np
from cv_bridge import CvBridge
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray
from std_msgs.msg import String
from capstone_project.msg import RobotCommand
import threading

class VisualPerceptorNode(Node):
    def __init__(self):
        super().__init__('visual_perceptor')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Subscribers
        self.image_sub = self.create_subscription(
            Image, 'camera/image_raw', self.image_callback, 10
        )

        self.command_sub = self.create_subscription(
            RobotCommand, 'robot_command', self.command_callback, 10
        )

        # Publishers
        self.detection_pub = self.create_publisher(
            Detection2DArray, 'object_detections', 10
        )

        self.status_pub = self.create_publisher(String, 'vision_status', 10)

        # Object detection model (using OpenCV DNN for simplicity)
        # In practice, you'd use a more sophisticated model like YOLO
        self.detector = cv2.dnn_DetectionModel()

        self.get_logger().info("Visual Perceptor initialized")

    def image_callback(self, msg):
        """Process incoming camera images"""
        try:
            # Convert ROS image to OpenCV
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Perform object detection
            detections = self.detect_objects(cv_image)

            # Publish detections
            self.publish_detections(detections, msg.header)

        except Exception as e:
            self.get_logger().error(f"Error processing image: {e}")

    def detect_objects(self, image):
        """Detect objects in the image"""
        # For this example, we'll use a simple color-based detection
        # In practice, use a deep learning model
        height, width = image.shape[:2]

        # Detect red objects (potential targets)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lower_red = np.array([0, 120, 70])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)

        # Upper red range (for colors that wrap around)
        lower_red = np.array([170, 120, 70])
        upper_red = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red, upper_red)

        mask = mask1 + mask2

        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detections = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Filter out small detections
                x, y, w, h = cv2.boundingRect(contour)
                detections.append({
                    'class': 'red_object',
                    'confidence': 0.8,
                    'bbox': [x, y, w, h],
                    'center': [x + w/2, y + h/2]
                })

        return detections

    def publish_detections(self, detections, header):
        """Publish object detections"""
        detection_array = Detection2DArray()
        detection_array.header = header

        for det in detections:
            detection = Detection2D()
            detection.header = header

            # Set bounding box
            detection.bbox.size_x = det['bbox'][2]
            detection.bbox.size_y = det['bbox'][3]
            detection.bbox.center.x = det['bbox'][0] + det['bbox'][2] / 2
            detection.bbox.center.y = det['bbox'][1] + det['bbox'][3] / 2

            # Set classification
            hypothesis = ObjectHypothesisWithPose()
            hypothesis.id = det['class']
            hypothesis.score = det['confidence']
            detection.results.append(hypothesis)

            detection_array.detections.append(detection)

        self.detection_pub.publish(detection_array)

    def command_callback(self, msg):
        """Process commands that require visual confirmation"""
        if msg.command_type == "GRASP" and msg.target_object == "red_object":
            # Look for red objects to grasp
            self.get_logger().info("Looking for red object to grasp")

def main(args=None):
    rclpy.init(args=args)
    node = VisualPerceptorNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Action Planning Node

Create the cognitive planning component:

File: `capstone_project/action_planner.py`

```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from capstone_project.msg import RobotCommand
from geometry_msgs.msg import Twist
from std_msgs.msg import String
import json

class ActionPlannerNode(Node):
    def __init__(self):
        super().__init__('action_planner')

        # Subscribers
        self.command_sub = self.create_subscription(
            RobotCommand, 'robot_command', self.command_callback, 10
        )

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.status_pub = self.create_publisher(String, 'planning_status', 10)

        # Robot state
        self.robot_position = [0.0, 0.0, 0.0]  # x, y, theta
        self.is_moving = False

        self.get_logger().info("Action Planner initialized")

    def command_callback(self, msg):
        """Process incoming robot commands"""
        self.get_logger().info(f"Planning action: {msg.command_type} - {msg.description}")

        if msg.command_type == "MOVE":
            self.execute_move_command(msg)
        elif msg.command_type == "ROTATE":
            self.execute_rotate_command(msg)
        elif msg.command_type == "GESTURE":
            self.execute_gesture_command(msg)
        elif msg.command_type == "GRASP":
            self.execute_grasp_command(msg)
        else:
            self.get_logger().warn(f"Unknown command type: {msg.command_type}")

    def execute_move_command(self, msg):
        """Execute movement command"""
        if len(msg.target_position) >= 3:
            linear_x = msg.target_position[0]
            linear_y = msg.target_position[1] if len(msg.target_position) > 1 else 0.0

            twist = Twist()
            twist.linear.x = linear_x
            twist.linear.y = linear_y
            twist.angular.z = 0.0  # No rotation during linear movement

            self.cmd_vel_pub.publish(twist)

            # Update status
            status_msg = String()
            status_msg.data = f"Moving: x={linear_x}, y={linear_y}"
            self.status_pub.publish(status_msg)

    def execute_rotate_command(self, msg):
        """Execute rotation command"""
        if len(msg.target_position) >= 3:
            angular_z = msg.target_position[2]

            twist = Twist()
            twist.linear.x = 0.0
            twist.linear.y = 0.0
            twist.angular.z = angular_z

            self.cmd_vel_pub.publish(twist)

            # Update status
            status_msg = String()
            status_msg.data = f"Rotating: {angular_z} rad/s"
            self.status_pub.publish(status_msg)

    def execute_gesture_command(self, msg):
        """Execute gesture command (placeholder for humanoid actions)"""
        self.get_logger().info(f"Executing gesture: {msg.target_object}")

        # In a real implementation, this would send commands to joint controllers
        status_msg = String()
        status_msg.data = f"Executing gesture: {msg.target_object}"
        self.status_pub.publish(status_msg)

    def execute_grasp_command(self, msg):
        """Execute grasping command"""
        self.get_logger().info(f"Attempting to grasp: {msg.target_object}")

        # This would integrate with manipulation stack in a real system
        status_msg = String()
        status_msg.data = f"Attempting to grasp: {msg.target_object}"
        self.status_pub.publish(status_msg)

def main(args=None):
    rclpy.init(args=args)
    node = ActionPlannerNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 6: Launch File

Create a launch file to start all nodes:

File: `capstone_project/launch/capstone_launch.py`

```python
import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    # Get package directory
    pkg_capstone = get_package_share_directory('capstone_project')

    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')

    # Voice processor node
    voice_processor = Node(
        package='capstone_project',
        executable='voice_processor',
        name='voice_processor',
        output='screen',
    )

    # Visual perceptor node
    visual_perceptor = Node(
        package='capstone_project',
        executable='visual_perceptor',
        name='visual_perceptor',
        output='screen',
    )

    # Action planner node
    action_planner = Node(
        package='capstone_project',
        executable='action_planner',
        name='action_planner',
        output='screen',
    )

    # Combined launch description
    ld = LaunchDescription([
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='true',
            description='Use simulation (Gazebo) clock if true'
        ),
        voice_processor,
        visual_perceptor,
        action_planner,
    ])

    return ld
```

### Step 7: Simulation Environment

Create a Gazebo world file for the capstone project:

File: `capstone_project/worlds/capstone_world.sdf`

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="capstone_world">
    <!-- Physics -->
    <physics type="ode">
      <gravity>0 0 -9.8</gravity>
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <!-- Ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Lighting -->
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Simple room with objects -->
    <model name="wall_1">
      <pose>0 5 0 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>10 0.2 2</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>10 0.2 2</size>
            </box>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
            <diffuse>0.8 0.8 0.8 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Red object for detection -->
    <model name="red_cube">
      <pose>2 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>0.2 0.2 0.2</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>0.2 0.2 0.2</size>
            </box>
          </geometry>
          <material>
            <ambient>1 0 0 1</ambient>
            <diffuse>1 0 0 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Blue object for detection -->
    <model name="blue_cube">
      <pose>-2 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>0.2 0.2 0.2</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>0.2 0.2 0.2</size>
            </box>
          </geometry>
          <material>
            <ambient>0 0 1 1</ambient>
            <diffuse>0 0 1 1</diffuse>
          </material>
        </visual>
      </link>
    </model>
  </world>
</sdf>
```

## Testing the System

### Running the Complete System

1. Build your workspace:
   ```bash
   cd ~/ros2_ws
   colcon build --packages-select capstone_project
   source install/setup.bash
   ```

2. Launch the simulation:
   ```bash
   # In one terminal, start Gazebo
   gazebo --verbose ~/ros2_ws/src/capstone_project/worlds/capstone_world.sdf
   ```

3. In another terminal, launch the capstone nodes:
   ```bash
   ros2 launch capstone_project capstone_launch.py
   ```

4. Test voice commands through the voice processor node.

### Verification Steps

1. **Voice Recognition**: Verify that voice commands are properly recognized and converted to text
2. **Visual Detection**: Check that objects are detected in the camera feed
3. **Command Mapping**: Confirm that voice commands are correctly mapped to robot actions
4. **Motion Execution**: Verify that the robot executes requested movements
5. **Integration**: Test the complete pipeline from voice command to robot action

## Extensions and Improvements

### Advanced Features
1. **Multi-modal Learning**: Train a model that jointly processes voice and visual inputs
2. **Semantic Mapping**: Create semantic maps of the environment with object locations
3. **Adaptive Interaction**: Implement learning from user feedback to improve interaction
4. **Multi-robot Coordination**: Extend to multiple robots working together

### Performance Optimizations
1. **Real-time Processing**: Optimize for real-time performance
2. **Edge Deployment**: Optimize models for deployment on robot hardware
3. **Safety Mechanisms**: Implement safety checks and emergency stops
4. **Robustness**: Add error recovery and fallback mechanisms

## Conclusion

The capstone project demonstrates the integration of all key components covered in this book:
- ROS 2 for system integration and communication
- Digital twin simulation for testing and development
- AI algorithms for perception and decision-making
- Voice interfaces for natural human-robot interaction

This complete system serves as a foundation for more advanced humanoid robotics applications and provides a framework for extending capabilities in specialized domains.
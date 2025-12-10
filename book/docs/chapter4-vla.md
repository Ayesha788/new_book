# Chapter 4: Vision-Language-Action (VLA) - Converting Voice Commands to Robot Actions

## Introduction to Vision-Language-Action Systems

Vision-Language-Action (VLA) systems represent the cutting edge of human-robot interaction, enabling robots to understand natural language commands, perceive their environment visually, and execute appropriate physical actions. This convergence of computer vision, natural language processing, and robotics creates intuitive interfaces that allow humans to interact with robots using everyday language.

For humanoid robots, VLA systems enable:
- Natural voice command interpretation
- Visual scene understanding
- Cognitive planning and task execution
- Adaptive behavior based on environmental context

## Architecture of VLA Systems

### Core Components

A typical VLA system consists of:

1. **Speech Recognition**: Converting voice commands to text
2. **Natural Language Understanding**: Interpreting the meaning of commands
3. **Visual Perception**: Understanding the current environment
4. **Cognitive Planning**: Determining appropriate actions
5. **Action Execution**: Sending commands to robot actuators

### Integration with ROS 2

VLA systems integrate with ROS 2 through:
- Message passing for sensor data and commands
- Action servers for long-running tasks
- Services for immediate queries
- Parameter servers for configuration

## Voice Command Processing with OpenAI Whisper

OpenAI Whisper is a state-of-the-art speech recognition model that can transcribe speech to text with high accuracy across multiple languages.

### Installing Whisper

```bash
pip install openai-whisper
# Or for GPU acceleration
pip install openai-whisper[cuda]
```

### Basic Whisper Integration

```python
import whisper
import rospy
import pyaudio
import wave
import numpy as np
from std_msgs.msg import String

class VoiceCommandProcessor:
    def __init__(self):
        rospy.init_node('voice_command_processor')

        # Load Whisper model
        self.model = whisper.load_model("base")  # Options: tiny, base, small, medium, large

        # Audio parameters
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 44100
        self.record_seconds = 5

        # Publishers and subscribers
        self.command_pub = rospy.Publisher('/vla/voice_command', String, queue_size=10)
        self.result_pub = rospy.Publisher('/vla/command_result', String, queue_size=10)

        # Initialize audio stream
        self.audio = pyaudio.PyAudio()

        rospy.loginfo("Voice Command Processor initialized")

    def record_audio(self):
        """Record audio from microphone"""
        stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk
        )

        rospy.loginfo("Recording...")
        frames = []

        for i in range(0, int(self.rate / self.chunk * self.record_seconds)):
            data = stream.read(self.chunk)
            frames.append(data)

        rospy.loginfo("Recording finished")

        stream.stop_stream()
        stream.close()

        return frames

    def transcribe_audio(self, frames):
        """Transcribe recorded audio using Whisper"""
        # Save frames to temporary WAV file
        filename = "temp_recording.wav"
        wf = wave.open(filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(self.audio.get_sample_size(self.format))
        wf.setframerate(self.rate)
        wf.writeframes(b''.join(frames))
        wf.close()

        # Transcribe using Whisper
        result = self.model.transcribe(filename)
        transcription = result["text"]

        # Clean up temporary file
        import os
        os.remove(filename)

        return transcription.strip()

    def process_voice_command(self):
        """Main loop for processing voice commands"""
        rate = rospy.Rate(1)  # Process commands once per second

        while not rospy.is_shutdown():
            try:
                # Record audio
                frames = self.record_audio()

                # Transcribe to text
                command_text = self.transcribe_audio(frames)

                if command_text:
                    rospy.loginfo(f"Recognized command: {command_text}")

                    # Publish the recognized command
                    cmd_msg = String()
                    cmd_msg.data = command_text
                    self.command_pub.publish(cmd_msg)

                    # Process the command and execute action
                    self.execute_command(command_text)

                rate.sleep()

            except Exception as e:
                rospy.logerr(f"Error processing voice command: {str(e)}")

    def execute_command(self, command_text):
        """Parse command and execute appropriate action"""
        command_text = command_text.lower()

        if "move forward" in command_text:
            self.move_robot("forward")
        elif "turn left" in command_text:
            self.move_robot("left")
        elif "turn right" in command_text:
            self.move_robot("right")
        elif "stop" in command_text:
            self.stop_robot()
        elif "pick up" in command_text or "grasp" in command_text:
            self.grasp_object()
        elif "wave" in command_text:
            self.wave_gesture()
        else:
            rospy.logwarn(f"Unknown command: {command_text}")
            result_msg = String()
            result_msg.data = f"Unknown command: {command_text}"
            self.result_pub.publish(result_msg)

    def move_robot(self, direction):
        """Execute movement command"""
        rospy.loginfo(f"Moving robot {direction}")
        # Publish movement command to robot controller
        pass

    def stop_robot(self):
        """Stop robot movement"""
        rospy.loginfo("Stopping robot")
        # Publish stop command
        pass

    def grasp_object(self):
        """Execute grasping action"""
        rospy.loginfo("Attempting to grasp object")
        # Publish grasping command
        pass

    def wave_gesture(self):
        """Execute waving gesture"""
        rospy.loginfo("Waving gesture")
        # Publish waving motion command
        pass

def main():
    processor = VoiceCommandProcessor()
    try:
        processor.process_voice_command()
    except rospy.ROSInterruptException:
        pass

if __name__ == '__main__':
    main()
```

## Natural Language to ROS 2 Action Mapping

Converting natural language commands to specific ROS 2 actions requires a cognitive planning system that can interpret intent and map it to executable robot behaviors.

### Intent Recognition and Action Mapping

```python
import re
import rospy
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from actionlib_msgs.msg import GoalStatusArray

class CognitivePlanner:
    def __init__(self):
        rospy.init_node('cognitive_planner')

        # Publishers for different robot actions
        self.cmd_vel_pub = rospy.Publisher('/cmd_vel', Twist, queue_size=10)
        self.action_pub = rospy.Publisher('/robot_action', String, queue_size=10)

        # Subscriber for voice commands
        self.voice_sub = rospy.Subscriber('/vla/voice_command', String, self.command_callback)

        # Define command patterns and corresponding actions
        self.command_patterns = {
            r'move forward|go forward|forward': self.move_forward,
            r'move backward|go backward|backward': self.move_backward,
            r'turn left|rotate left|left': self.turn_left,
            r'turn right|rotate right|right': self.turn_right,
            r'stop|halt|freeze': self.stop_movement,
            r'go to (.+)|move to (.+)': self.navigate_to_location,
            r'pick up (.+)|grasp (.+)|get (.+)': self.grasp_object,
            r'wave|waving|hello': self.wave_gesture,
            r'follow me|follow': self.follow_person,
        }

        rospy.loginfo("Cognitive Planner initialized")

    def command_callback(self, msg):
        """Process incoming voice commands"""
        command = msg.data.lower().strip()
        rospy.loginfo(f"Processing command: {command}")

        # Match command to pattern and execute action
        action_executed = False
        for pattern, action_func in self.command_patterns.items():
            match = re.search(pattern, command)
            if match:
                if match.groups():  # If pattern has capture groups
                    action_func(*match.groups())
                else:
                    action_func()
                action_executed = True
                break

        if not action_executed:
            rospy.logwarn(f"No action matched for command: {command}")
            self.unknown_command(command)

    def move_forward(self):
        """Move robot forward"""
        twist = Twist()
        twist.linear.x = 0.5  # Adjust speed as needed
        self.cmd_vel_pub.publish(twist)
        rospy.loginfo("Moving forward")

    def move_backward(self):
        """Move robot backward"""
        twist = Twist()
        twist.linear.x = -0.5
        self.cmd_vel_pub.publish(twist)
        rospy.loginfo("Moving backward")

    def turn_left(self):
        """Turn robot left"""
        twist = Twist()
        twist.angular.z = 0.5
        self.cmd_vel_pub.publish(twist)
        rospy.loginfo("Turning left")

    def turn_right(self):
        """Turn robot right"""
        twist = Twist()
        twist.angular.z = -0.5
        self.cmd_vel_pub.publish(twist)
        rospy.loginfo("Turning right")

    def stop_movement(self):
        """Stop all robot movement"""
        twist = Twist()
        self.cmd_vel_pub.publish(twist)
        rospy.loginfo("Stopping movement")

    def navigate_to_location(self, location):
        """Navigate to specified location"""
        rospy.loginfo(f"Navigating to {location}")
        # This would integrate with navigation stack
        # For now, just publish the location as an action
        action_msg = String()
        action_msg.data = f"navigate_to:{location}"
        self.action_pub.publish(action_msg)

    def grasp_object(self, object_name):
        """Grasp specified object"""
        rospy.loginfo(f"Attempting to grasp {object_name}")
        # Publish grasp command with object name
        action_msg = String()
        action_msg.data = f"grasp_object:{object_name}"
        self.action_pub.publish(action_msg)

    def wave_gesture(self):
        """Perform waving gesture"""
        rospy.loginfo("Performing waving gesture")
        action_msg = String()
        action_msg.data = "wave_gesture"
        self.action_pub.publish(action_msg)

    def follow_person(self):
        """Start following person"""
        rospy.loginfo("Starting person following")
        action_msg = String()
        action_msg.data = "follow_person"
        self.action_pub.publish(action_msg)

    def unknown_command(self, command):
        """Handle unknown commands"""
        rospy.logwarn(f"Unknown command: {command}")
        # Could implement learning or clarification here

def main():
    planner = CognitivePlanner()
    rospy.spin()

if __name__ == '__main__':
    main()
```

## Visual Scene Understanding

For effective VLA systems, robots must understand their visual environment to contextualize voice commands.

### Object Detection and Recognition

```python
import cv2
import numpy as np
import rospy
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
from vision_msgs.msg import Detection2DArray, ObjectHypothesisWithPose

class VisualPerception:
    def __init__(self):
        rospy.init_node('visual_perception')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Subscribe to camera feed
        self.image_sub = rospy.Subscriber('/camera/rgb/image_raw', Image, self.image_callback)

        # Publish object detections
        self.detection_pub = rospy.Publisher('/vla/detections', Detection2DArray, queue_size=10)

        # Load pre-trained object detection model (e.g., YOLO)
        # For this example, we'll use a placeholder
        self.detector = self.load_detector()

        rospy.loginfo("Visual Perception node initialized")

    def load_detector(self):
        """Load object detection model"""
        # In practice, this would load a model like YOLOv5, Detectron2, etc.
        # For this example, we'll return a placeholder
        return None

    def image_callback(self, msg):
        """Process incoming camera images"""
        try:
            # Convert ROS image message to OpenCV image
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Perform object detection
            detections = self.detect_objects(cv_image)

            # Publish detections
            self.publish_detections(detections, msg.header)

        except Exception as e:
            rospy.logerr(f"Error processing image: {str(e)}")

    def detect_objects(self, image):
        """Detect objects in the image"""
        # Placeholder for object detection
        # In practice, this would run inference on a deep learning model
        height, width = image.shape[:2]

        # Example detections (in practice, these would come from the model)
        detections = [
            {
                'class': 'person',
                'confidence': 0.95,
                'bbox': [int(width * 0.3), int(height * 0.4), int(width * 0.2), int(height * 0.4)]
            },
            {
                'class': 'chair',
                'confidence': 0.87,
                'bbox': [int(width * 0.6), int(height * 0.5), int(width * 0.2), int(height * 0.3)]
            }
        ]

        return detections

    def publish_detections(self, detections, header):
        """Publish object detections as ROS messages"""
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

def main():
    perception = VisualPerception()
    rospy.spin()

if __name__ == '__main__':
    main()
```

## Voice Command Pipeline Integration

Combining all components into a complete VLA system:

```python
import rospy
import threading
from std_msgs.msg import String
from geometry_msgs.msg import Twist

class VLASystem:
    def __init__(self):
        rospy.init_node('vla_system')

        # Publishers
        self.cmd_vel_pub = rospy.Publisher('/cmd_vel', Twist, queue_size=10)
        self.status_pub = rospy.Publisher('/vla/status', String, queue_size=10)

        # Subscribers
        self.voice_sub = rospy.Subscriber('/vla/voice_command', String, self.voice_command_callback)
        self.vision_sub = rospy.Subscriber('/vla/detections', String, self.vision_callback)

        # System state
        self.current_context = {}
        self.is_listening = True

        rospy.loginfo("VLA System initialized")

    def voice_command_callback(self, msg):
        """Process voice command in context of visual information"""
        command = msg.data

        # Combine voice command with visual context
        action = self.interpret_command_with_context(command, self.current_context)

        if action:
            self.execute_action(action)
            self.update_status(f"Executed: {action}")

    def vision_callback(self, msg):
        """Update visual context"""
        # Update current visual context based on detections
        self.current_context['objects'] = msg.data  # Simplified
        rospy.loginfo(f"Updated visual context: {msg.data}")

    def interpret_command_with_context(self, command, context):
        """Interpret command using visual context"""
        command_lower = command.lower()

        # Example: "Pick up the red ball" - need to find red ball in context
        if "pick up" in command_lower or "grasp" in command_lower:
            # Look for objects that match the description in visual context
            if "red ball" in command_lower and "red ball" in context.get('objects', ''):
                return "grasp_red_ball"

        elif "go to" in command_lower:
            # Use navigation based on visual landmarks
            return f"navigate_to:{command_lower.replace('go to', '').strip()}"

        # Default interpretation
        return command

    def execute_action(self, action):
        """Execute the interpreted action"""
        rospy.loginfo(f"Executing action: {action}")

        # Map action to ROS command
        if "forward" in action:
            self.move_forward()
        elif "grasp" in action:
            self.execute_grasp()
        elif "navigate" in action:
            self.start_navigation(action)
        # Add more action mappings as needed

    def move_forward(self):
        """Move robot forward"""
        twist = Twist()
        twist.linear.x = 0.3
        self.cmd_vel_pub.publish(twist)

    def execute_grasp(self):
        """Execute grasping action (placeholder)"""
        rospy.loginfo("Executing grasp action")
        # Publish grasp command to manipulation system

    def start_navigation(self, action):
        """Start navigation to specified location"""
        rospy.loginfo(f"Starting navigation: {action}")
        # Integrate with navigation stack

    def update_status(self, status):
        """Publish system status"""
        status_msg = String()
        status_msg.data = status
        self.status_pub.publish(status_msg)

def main():
    vla_system = VLASystem()

    # Keep the node running
    try:
        rospy.spin()
    except KeyboardInterrupt:
        rospy.loginfo("VLA System shutting down")

if __name__ == '__main__':
    main()
```

## Integration with Humanoid Robot Control

Connecting VLA systems to humanoid robot actuators requires careful consideration of the robot's kinematic structure and safety constraints.

### Humanoid Action Execution

```python
import rospy
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint
from control_msgs.msg import FollowJointTrajectoryAction, FollowJointTrajectoryGoal
import actionlib

class HumanoidActionExecutor:
    def __init__(self):
        rospy.init_node('humanoid_action_executor')

        # Joint trajectory publisher for simple movements
        self.joint_pub = rospy.Publisher('/joint_trajectory_controller/command', JointTrajectory, queue_size=10)

        # Action client for complex movements
        self.trajectory_client = actionlib.SimpleActionClient(
            '/joint_trajectory_controller/follow_joint_trajectory',
            FollowJointTrajectoryAction
        )

        # Wait for action server
        rospy.loginfo("Waiting for joint trajectory controller...")
        self.trajectory_client.wait_for_server()
        rospy.loginfo("Connected to joint trajectory controller")

        # Define joint names for humanoid robot
        self.joint_names = [
            'left_hip_joint', 'left_knee_joint', 'left_ankle_joint',
            'right_hip_joint', 'right_knee_joint', 'right_ankle_joint',
            'left_shoulder_joint', 'left_elbow_joint', 'left_wrist_joint',
            'right_shoulder_joint', 'right_elbow_joint', 'right_wrist_joint'
        ]

    def execute_waving_motion(self):
        """Execute waving gesture with arm joints"""
        trajectory = JointTrajectory()
        trajectory.joint_names = self.joint_names

        # Create trajectory points for waving motion
        point1 = JointTrajectoryPoint()
        point1.positions = [0.0] * len(self.joint_names)  # Default positions
        point1.positions[7] = 1.0  # Left elbow up
        point1.time_from_start = rospy.Duration(1.0)

        point2 = JointTrajectoryPoint()
        point2.positions = point1.positions[:]
        point2.positions[7] = -1.0  # Left elbow down
        point2.time_from_start = rospy.Duration(2.0)

        trajectory.points = [point1, point2]
        trajectory.header.stamp = rospy.Time.now()

        self.joint_pub.publish(trajectory)

    def execute_walking_gait(self):
        """Execute basic walking gait"""
        trajectory = JointTrajectory()
        trajectory.joint_names = self.joint_names

        # Simplified walking gait (in practice, this would be much more complex)
        points = []
        time_step = 0.5

        for i in range(10):  # 10 steps
            point = JointTrajectoryPoint()
            point.positions = [0.0] * len(self.joint_names)

            # Alternate leg movements for walking
            if i % 2 == 0:
                point.positions[0] = 0.2  # Left hip forward
                point.positions[3] = -0.1  # Right hip back
            else:
                point.positions[0] = -0.1  # Left hip back
                point.positions[3] = 0.2  # Right hip forward

            point.time_from_start = rospy.Duration(i * time_step)
            points.append(point)

        trajectory.points = points
        trajectory.header.stamp = rospy.Time.now()

        self.joint_pub.publish(trajectory)

    def execute_voice_command(self, command):
        """Map voice command to humanoid action"""
        command_lower = command.lower()

        if "wave" in command_lower:
            self.execute_waving_motion()
        elif "walk" in command_lower or "move" in command_lower:
            self.execute_walking_gait()
        elif "stand" in command_lower:
            self.stand_up()
        # Add more commands as needed

    def stand_up(self):
        """Return to standing position"""
        trajectory = JointTrajectory()
        trajectory.joint_names = self.joint_names

        point = JointTrajectoryPoint()
        point.positions = [0.0] * len(self.joint_names)  # Neutral standing position
        point.time_from_start = rospy.Duration(2.0)

        trajectory.points = [point]
        trajectory.header.stamp = rospy.Time.now()

        self.joint_pub.publish(trajectory)

def main():
    executor = HumanoidActionExecutor()

    # Example: Execute waving motion when node starts
    rospy.sleep(1.0)  # Wait for publishers to connect
    executor.execute_waving_motion()

    rospy.spin()

if __name__ == '__main__':
    main()
```

## Practice Tasks

1. Install and configure OpenAI Whisper for voice recognition
2. Create a simple voice command that makes your robot move forward
3. Implement object detection that identifies basic objects in the camera feed
4. Develop a system that combines voice commands with visual information (e.g., "pick up the red ball")
5. Create a gesture that your humanoid robot performs when it hears "hello"

## Summary

In this chapter, you've learned to build Vision-Language-Action systems that enable natural human-robot interaction:

- How to integrate OpenAI Whisper for voice command recognition
- Techniques for mapping natural language to ROS 2 actions
- Methods for incorporating visual scene understanding
- Approaches for combining voice, vision, and action in a unified system
- Implementation of humanoid-specific action execution

VLA systems represent the future of human-robot interaction, making robots more accessible and intuitive to use. By combining speech recognition, visual perception, and intelligent action planning, you can create humanoid robots that respond naturally to human commands and adapt to their environment.
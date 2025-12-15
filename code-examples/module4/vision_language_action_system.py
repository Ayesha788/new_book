#!/usr/bin/env python3

"""
Vision-Language-Action System for Humanoid Robotics

This example demonstrates a complete VLA (Vision-Language-Action) system
that integrates speech recognition, natural language understanding,
computer vision, and robotic action execution.
"""

import rospy
import cv2
import numpy as np
import speech_recognition as sr
from cv_bridge import CvBridge
from sensor_msgs.msg import Image, JointState
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
from visualization_msgs.msg import MarkerArray
from audio_common_msgs.msg import AudioData
import threading
import time
import openai
from transformers import pipeline
import torch


class VisionLanguageActionSystem:
    def __init__(self):
        # Initialize ROS node
        rospy.init_node('vla_system', anonymous=True)

        # Initialize components
        self.cv_bridge = CvBridge()
        self.speech_recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()

        # Initialize NLP pipeline
        self.nlp_pipeline = pipeline(
            "text-classification",
            model="microsoft/DialoGPT-medium"  # For demonstration
        )

        # Publishers and subscribers
        self.image_sub = rospy.Subscriber('/camera/rgb/image_raw', Image, self.image_callback)
        self.joint_state_sub = rospy.Subscriber('/joint_states', JointState, self.joint_state_callback)
        self.voice_cmd_pub = rospy.Publisher('/robot/voice_command', String, queue_size=10)
        self.action_cmd_pub = rospy.Publisher('/robot/action_command', String, queue_size=10)
        self.status_pub = rospy.Publisher('/robot/status', String, queue_size=10)
        self.object_pub = rospy.Publisher('/detected_objects', MarkerArray, queue_size=10)

        # System state
        self.current_image = None
        self.current_joints = None
        self.is_listening = False
        self.command_history = []
        self.world_model = {'objects': [], 'locations': {}}

        # Object detection model (using OpenCV for simplicity)
        self.object_detector = self.initialize_object_detector()

        # Adjust microphone for ambient noise
        with self.microphone as source:
            self.speech_recognizer.adjust_for_ambient_noise(source)

        rospy.loginfo("Vision-Language-Action System initialized")

    def initialize_object_detector(self):
        """
        Initialize object detection model
        For this example, using simple color-based detection
        In practice, use YOLO, DETR, or similar
        """
        return ColorBasedObjectDetector()

    def image_callback(self, msg):
        """
        Process incoming camera images
        """
        try:
            self.current_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
            # Update world model with current objects
            self.update_world_model()
        except Exception as e:
            rospy.logerr(f"Error processing image: {e}")

    def joint_state_callback(self, msg):
        """
        Update current joint states
        """
        self.current_joints = msg

    def update_world_model(self):
        """
        Update world model with detected objects
        """
        if self.current_image is not None:
            detections = self.object_detector.detect(self.current_image)
            self.world_model['objects'] = detections

            # Publish detected objects for visualization
            self.publish_detected_objects(detections)

    def publish_detected_objects(self, detections):
        """
        Publish detected objects as visualization markers
        """
        marker_array = MarkerArray()

        for i, detection in enumerate(detections):
            marker = self.create_object_marker(detection, i)
            marker_array.markers.append(marker)

        self.object_pub.publish(marker_array)

    def create_object_marker(self, detection, marker_id):
        """
        Create a visualization marker for a detected object
        """
        from visualization_msgs.msg import Marker
        from geometry_msgs.msg import Point

        marker = Marker()
        marker.header.frame_id = "camera_rgb_optical_frame"
        marker.header.stamp = rospy.Time.now()
        marker.ns = "objects"
        marker.id = marker_id
        marker.type = Marker.CUBE
        marker.action = Marker.ADD

        # Set position based on bounding box center
        bbox = detection['bbox']
        center_x = bbox[0] + bbox[2] / 2
        center_y = bbox[1] + bbox[3] / 2

        # Convert pixel coordinates to 3D (simplified)
        marker.pose.position.x = (center_x - 320) * 0.001  # Rough conversion
        marker.pose.position.y = (center_y - 240) * 0.001
        marker.pose.position.z = 1.0  # Assume 1m distance

        marker.pose.orientation.w = 1.0
        marker.scale.x = bbox[2] * 0.001
        marker.scale.y = bbox[3] * 0.001
        marker.scale.z = 0.1

        # Color based on object type
        if 'red' in detection['label']:
            marker.color.r = 1.0
        elif 'blue' in detection['label']:
            marker.color.g = 1.0
        else:
            marker.color.b = 1.0
        marker.color.a = 0.8

        marker.lifetime = rospy.Duration(1.0)  # 1 second

        return marker

    def listen_for_command(self):
        """
        Listen for voice command and process it
        """
        if self.is_listening:
            return None

        self.is_listening = True
        self.publish_status("Listening for command...")

        try:
            with self.microphone as source:
                rospy.loginfo("Listening for command...")
                audio = self.speech_recognizer.listen(source, timeout=5.0)

            # Recognize speech
            command_text = self.speech_recognizer.recognize_google(audio)
            rospy.loginfo(f"Heard command: {command_text}")

            # Process the command
            self.process_command(command_text)

        except sr.WaitTimeoutError:
            rospy.loginfo("No speech detected within timeout")
        except sr.UnknownValueError:
            rospy.logerr("Could not understand audio")
            self.publish_status("Could not understand audio")
        except sr.RequestError as e:
            rospy.logerr(f"Speech recognition error: {e}")
            self.publish_status(f"Recognition error: {e}")
        finally:
            self.is_listening = False

    def process_command(self, command_text):
        """
        Process a voice command through the VLA pipeline
        """
        rospy.loginfo(f"Processing command: {command_text}")

        # Add to command history
        self.command_history.append({
            'text': command_text,
            'timestamp': rospy.Time.now(),
            'status': 'processing'
        })

        # 1. Language Understanding
        parsed_command = self.parse_language_command(command_text)
        rospy.loginfo(f"Parsed command: {parsed_command}")

        # 2. Vision Integration - Use current world model
        vision_context = self.get_vision_context()
        rospy.loginfo(f"Vision context: {len(vision_context)} objects detected")

        # 3. Action Planning
        action_plan = self.plan_action(parsed_command, vision_context)
        rospy.loginfo(f"Action plan: {action_plan}")

        # 4. Action Execution
        if action_plan['valid']:
            self.execute_action_plan(action_plan)
            self.update_command_status(len(self.command_history) - 1, 'completed')
        else:
            self.publish_status(f"Could not plan action: {action_plan.get('reason', 'Unknown')}")
            self.update_command_status(len(self.command_history) - 1, 'failed')

    def parse_language_command(self, command_text):
        """
        Parse natural language command into structured format
        """
        # Simple command parsing (in practice, use more sophisticated NLP)
        command_lower = command_text.lower()

        if 'pick up' in command_lower or 'grasp' in command_lower or 'get' in command_lower:
            # Extract object to pick up
            object_name = self.extract_object_from_command(command_lower)
            return {
                'intent': 'pickup',
                'object': object_name,
                'location': None,
                'confidence': 0.9
            }
        elif 'go to' in command_lower or 'move to' in command_lower or 'navigate to' in command_lower:
            # Extract destination
            destination = self.extract_location_from_command(command_lower)
            return {
                'intent': 'navigate',
                'destination': destination,
                'object': None,
                'confidence': 0.85
            }
        elif 'bring' in command_lower or 'deliver' in command_lower:
            # Extract object and destination
            obj = self.extract_object_from_command(command_lower)
            dest = self.extract_location_from_command(command_lower)
            return {
                'intent': 'deliver',
                'object': obj,
                'destination': dest,
                'confidence': 0.9
            }
        else:
            return {
                'intent': 'unknown',
                'object': None,
                'destination': None,
                'confidence': 0.5
            }

    def extract_object_from_command(self, command):
        """
        Extract object name from command
        """
        # Simple extraction based on common object words
        common_objects = [
            'cup', 'bottle', 'book', 'phone', 'tablet', 'box', 'ball',
            'glass', 'plate', 'bowl', 'mug', 'keys', 'wallet', 'remote'
        ]

        for obj in common_objects:
            if obj in command:
                # Check for color descriptors
                color_prefixes = ['red', 'blue', 'green', 'yellow', 'black', 'white']
                for color in color_prefixes:
                    if f"{color} {obj}" in command:
                        return f"{color} {obj}"
                return obj

        return 'unknown_object'

    def extract_location_from_command(self, command):
        """
        Extract location from command
        """
        common_locations = [
            'kitchen', 'living room', 'bedroom', 'office', 'dining room',
            'bathroom', 'hallway', 'table', 'counter', 'couch', 'chair'
        ]

        for loc in common_locations:
            if loc in command:
                return loc

        return 'unknown_location'

    def get_vision_context(self):
        """
        Get current vision context from world model
        """
        return self.world_model['objects']

    def plan_action(self, parsed_command, vision_context):
        """
        Plan appropriate action based on command and vision context
        """
        intent = parsed_command['intent']
        confidence = parsed_command['confidence']

        if confidence < 0.7:
            return {
                'valid': False,
                'reason': 'Low confidence in command understanding',
                'action_sequence': []
            }

        if intent == 'pickup':
            return self.plan_pickup_action(parsed_command, vision_context)
        elif intent == 'navigate':
            return self.plan_navigation_action(parsed_command, vision_context)
        elif intent == 'deliver':
            return self.plan_delivery_action(parsed_command, vision_context)
        else:
            return {
                'valid': False,
                'reason': f'Unknown intent: {intent}',
                'action_sequence': []
            }

    def plan_pickup_action(self, parsed_command, vision_context):
        """
        Plan action to pick up an object
        """
        target_object_name = parsed_command['object']

        # Find the target object in vision context
        target_object = None
        for obj in vision_context:
            if target_object_name.lower() in obj['label'].lower():
                target_object = obj
                break

        if target_object is None:
            # Object not found, plan to search
            return {
                'valid': True,
                'action_sequence': [
                    {'type': 'search', 'object': target_object_name},
                    {'type': 'report', 'message': f'Could not find {target_object_name}'}
                ]
            }

        # Plan navigation to object and pickup
        return {
            'valid': True,
            'action_sequence': [
                {'type': 'navigate', 'target': target_object['position_3d']},
                {'type': 'grasp', 'object': target_object},
                {'type': 'lift', 'height': 0.1}
            ]
        }

    def plan_navigation_action(self, parsed_command, vision_context):
        """
        Plan navigation action
        """
        destination = parsed_command['destination']

        # In practice, use semantic map to find coordinates
        # For this example, return a simple navigation command
        return {
            'valid': True,
            'action_sequence': [
                {'type': 'navigate', 'target': destination}
            ]
        }

    def plan_delivery_action(self, parsed_command, vision_context):
        """
        Plan delivery action (pick up object and deliver to location)
        """
        target_object_name = parsed_command['object']
        destination = parsed_command['destination']

        # First, find the object to pick up
        target_object = None
        for obj in vision_context:
            if target_object_name.lower() in obj['label'].lower():
                target_object = obj
                break

        if target_object is None:
            # Object not found, plan to search
            return {
                'valid': True,
                'action_sequence': [
                    {'type': 'search', 'object': target_object_name},
                    {'type': 'report', 'message': f'Could not find {target_object_name}'}
                ]
            }

        # Plan: navigate to object -> pick up -> navigate to destination -> place
        return {
            'valid': True,
            'action_sequence': [
                {'type': 'navigate', 'target': target_object['position_3d']},
                {'type': 'grasp', 'object': target_object},
                {'type': 'navigate', 'target': destination},
                {'type': 'place', 'target': destination}
            ]
        }

    def execute_action_plan(self, action_plan):
        """
        Execute the planned action sequence
        """
        rospy.loginfo("Executing action plan...")

        for i, action in enumerate(action_plan['action_sequence']):
            rospy.loginfo(f"Executing action {i+1}/{len(action_plan['action_sequence'])}: {action}")

            success = self.execute_single_action(action)

            if not success:
                rospy.logerr(f"Action failed: {action}")
                self.publish_status(f"Action failed: {action['type']}")
                break

        rospy.loginfo("Action plan execution completed")

    def execute_single_action(self, action):
        """
        Execute a single action
        """
        action_type = action['type']

        if action_type == 'navigate':
            return self.execute_navigation(action)
        elif action_type == 'grasp':
            return self.execute_grasp(action)
        elif action_type == 'place':
            return self.execute_placement(action)
        elif action_type == 'lift':
            return self.execute_lift(action)
        elif action_type == 'search':
            return self.execute_search(action)
        elif action_type == 'report':
            self.publish_status(action['message'])
            return True
        else:
            rospy.logerr(f"Unknown action type: {action_type}")
            return False

    def execute_navigation(self, action):
        """
        Execute navigation action
        """
        target = action.get('target', 'unknown')
        rospy.loginfo(f"Navigating to: {target}")

        # In practice, send navigation command to navigation stack
        # For simulation, just return success
        self.publish_status(f"Navigating to {target}")
        time.sleep(2)  # Simulate navigation time

        return True

    def execute_grasp(self, action):
        """
        Execute grasp action
        """
        obj = action.get('object', {})
        rospy.loginfo(f"Grasping object: {obj.get('label', 'unknown')}")

        # In practice, send grasp command to manipulation stack
        # For simulation, just return success
        self.publish_status(f"Grasping {obj.get('label', 'object')}")
        time.sleep(1)  # Simulate grasp time

        return True

    def execute_placement(self, action):
        """
        Execute placement action
        """
        target = action.get('target', 'unknown')
        rospy.loginfo(f"Placing object at: {target}")

        # In practice, send placement command to manipulation stack
        # For simulation, just return success
        self.publish_status(f"Placing object at {target}")
        time.sleep(1)  # Simulate placement time

        return True

    def execute_lift(self, action):
        """
        Execute lift action
        """
        height = action.get('height', 0.1)
        rospy.loginfo(f"Lifting object by {height}m")

        # In practice, send lift command to manipulation stack
        # For simulation, just return success
        self.publish_status(f"Lifting object")
        time.sleep(0.5)  # Simulate lift time

        return True

    def execute_search(self, action):
        """
        Execute search action
        """
        obj_name = action.get('object', 'unknown')
        rospy.loginfo(f"Searching for: {obj_name}")

        # In practice, execute search pattern
        # For simulation, just return success
        self.publish_status(f"Searching for {obj_name}")
        time.sleep(3)  # Simulate search time

        return True

    def publish_status(self, status):
        """
        Publish system status
        """
        status_msg = String()
        status_msg.data = status
        self.status_pub.publish(status_msg)

    def update_command_status(self, index, status):
        """
        Update the status of a command in history
        """
        if 0 <= index < len(self.command_history):
            self.command_history[index]['status'] = status
            self.command_history[index]['completed_at'] = rospy.Time.now()

    def continuous_listening_loop(self):
        """
        Continuous loop for listening to voice commands
        """
        rospy.loginfo("Starting continuous listening loop...")

        while not rospy.is_shutdown():
            if not self.is_listening:
                self.listen_for_command()
            time.sleep(1)  # Wait between listening attempts

    def run(self):
        """
        Run the VLA system
        """
        # Start continuous listening in a separate thread
        listening_thread = threading.Thread(target=self.continuous_listening_loop, daemon=True)
        listening_thread.start()

        rospy.loginfo("VLA System is running. Listening for voice commands...")
        rospy.spin()


class ColorBasedObjectDetector:
    """
    Simple color-based object detector for demonstration
    In practice, use YOLO, DETR, or similar advanced models
    """
    def __init__(self):
        # Define color ranges for common objects
        self.color_ranges = {
            'red_cup': ([0, 50, 50], [10, 255, 255]),
            'blue_bottle': ([100, 50, 50], [130, 255, 255]),
            'green_bowl': ([40, 50, 50], [80, 255, 255]),
            'yellow_book': ([20, 100, 100], [30, 255, 255])
        }

    def detect(self, image):
        """
        Detect objects based on color
        """
        detections = []
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        for obj_name, (lower, upper) in self.color_ranges.items():
            # Create mask for the color range
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))

            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 500:  # Filter small detections
                    # Get bounding box
                    x, y, w, h = cv2.boundingRect(contour)

                    # Calculate 3D position (simplified)
                    center_x = x + w/2
                    center_y = y + h/2
                    # Convert to approximate 3D coordinates
                    pos_3d = ((center_x - 320) * 0.001, (center_y - 240) * 0.001, 1.0)

                    detection = {
                        'label': obj_name,
                        'bbox': (x, y, w, h),
                        'confidence': 0.8,  # Placeholder confidence
                        'position_3d': pos_3d
                    }

                    detections.append(detection)

        return detections


def main():
    """
    Main function to run the VLA system
    """
    try:
        vla_system = VisionLanguageActionSystem()
        vla_system.run()
    except rospy.ROSInterruptException:
        rospy.loginfo("VLA System interrupted")
    except KeyboardInterrupt:
        rospy.loginfo("VLA System stopped by user")


if __name__ == '__main__':
    main()
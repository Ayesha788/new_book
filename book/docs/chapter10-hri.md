# Chapter 10: Human-Robot Interaction for Humanoid Systems

## Introduction to Human-Robot Interaction

Human-Robot Interaction (HRI) is a critical aspect of humanoid robotics, focusing on how humans and robots can effectively communicate, collaborate, and work together. Unlike traditional industrial robots, humanoid robots are designed to operate in human-centered environments and interact naturally with people.

## Social Robotics Principles

### Anthropomorphic Design Considerations

Humanoid robots leverage human-like features to facilitate natural interaction:

```python
import numpy as np
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional

class GazeBehavior(Enum):
    ATTENTIVE = "attentive"
    CORDIAL = "cordial"
    FOCUSED = "focused"
    AVOIDANT = "avoidant"

class GestureType(Enum):
    GREETING = "greeting"
    POINTING = "pointing"
    EMPHASIS = "emphasis"
    REGULATORY = "regulatory"
    ADAPTIVE = "adaptive"

@dataclass
class SocialState:
    engagement_level: float  # 0.0 to 1.0
    attention_direction: np.ndarray  # 3D vector
    emotional_state: str  # happy, neutral, concerned, etc.
    proximity_comfort: float  # Personal space comfort level

class SocialBehaviorController:
    def __init__(self, robot_id: str):
        self.robot_id = robot_id
        self.social_state = SocialState(
            engagement_level=0.5,
            attention_direction=np.array([0.0, 0.0, 1.0]),
            emotional_state="neutral",
            proximity_comfort=0.8
        )
        self.human_tracking = {}  # Track multiple humans
        self.social_rules = self.define_social_rules()

    def define_social_rules(self) -> Dict:
        """Define social behavior rules based on context"""
        return {
            "personal_space": 0.8,  # meters
            "social_space": 1.2,   # meters
            "public_space": 3.6,   # meters
            "gaze_duration_min": 0.5,  # seconds
            "gaze_duration_max": 3.0,  # seconds
        }

    def update_human_tracking(self, human_id: str, position: np.ndarray, is_looking_at_robot: bool):
        """Update tracking information for a human"""
        self.human_tracking[human_id] = {
            'position': position,
            'is_looking_at_robot': is_looking_at_robot,
            'last_seen': self.get_current_time(),
            'engagement_score': self.calculate_engagement_score(position, is_looking_at_robot)
        }

    def calculate_engagement_score(self, position: np.ndarray, is_looking: bool) -> float:
        """Calculate how engaged a human is with the robot"""
        # Distance-based engagement (closer humans are more likely to engage)
        distance = np.linalg.norm(position)
        distance_factor = max(0, 1 - distance / 2.0)  # Higher engagement when closer

        # Looking direction factor
        looking_factor = 1.0 if is_looking else 0.3

        return distance_factor * looking_factor

    def select_appropriate_behavior(self, context: Dict) -> Dict:
        """Select appropriate social behavior based on context"""
        behaviors = {}

        # Gaze behavior selection
        if context.get('human_count', 0) == 1:
            behaviors['gaze'] = self.select_gaze_behavior(context)
        else:
            behaviors['gaze'] = self.select_group_gaze_behavior(context)

        # Gesture selection
        behaviors['gesture'] = self.select_gesture(context)

        # Proximity management
        behaviors['proximity'] = self.manage_proximity(context)

        return behaviors

    def select_gaze_behavior(self, context: Dict) -> GazeBehavior:
        """Select appropriate gaze behavior"""
        human_id = context.get('target_human', '')
        if human_id in self.human_tracking:
            engagement = self.human_tracking[human_id]['engagement_score']
            if engagement > 0.7:
                return GazeBehavior.ATTENTIVE
            elif engagement > 0.4:
                return GazeBehavior.CORDIAL
            else:
                return GazeBehavior.AVOIDANT
        return GazeBehavior.AVOIDANT

    def select_gesture(self, context: Dict) -> GestureType:
        """Select appropriate gesture based on interaction context"""
        interaction_type = context.get('interaction_type', 'unknown')
        if interaction_type == 'greeting':
            return GestureType.GREETING
        elif interaction_type == 'instruction':
            return GestureType.POINTING
        elif interaction_type == 'emphasis':
            return GestureType.EMPHASIS
        else:
            return GestureType.CORDIAL
```

## Natural Language Processing for HRI

### Speech Recognition and Understanding

```python
import speech_recognition as sr
import nltk
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

class NaturalLanguageProcessor:
    def __init__(self):
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()

        # Initialize NLP models
        self.tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
        self.intent_model = AutoModelForSequenceClassification.from_pretrained(
            "microsoft/DialoGPT-medium"
        )

        # Intent classification pipeline
        self.intent_classifier = pipeline(
            "text-classification",
            model="microsoft/DialoGPT-medium"
        )

        # Predefined commands and intents
        self.intent_patterns = {
            'greeting': ['hello', 'hi', 'hey', 'good morning', 'good evening'],
            'navigation': ['go to', 'move to', 'navigate to', 'walk to', 'go'],
            'manipulation': ['pick up', 'grasp', 'take', 'get', 'bring me'],
            'information': ['what', 'how', 'when', 'where', 'who', 'tell me'],
            'social': ['how are you', 'what are you doing', 'nice to meet you'],
            'farewell': ['goodbye', 'bye', 'see you', 'thank you', 'thanks']
        }

    def recognize_speech(self, audio_file: str = None) -> str:
        """Recognize speech from audio input"""
        try:
            if audio_file:
                with sr.AudioFile(audio_file) as source:
                    audio = self.recognizer.record(source)
            else:
                with self.microphone as source:
                    self.recognizer.adjust_for_ambient_noise(source)
                    print("Listening...")
                    audio = self.recognizer.listen(source)

            # Use Google Speech Recognition (or other engines)
            text = self.recognizer.recognize_google(audio)
            return text.lower()

        except sr.UnknownValueError:
            return ""
        except sr.RequestError:
            return ""

    def classify_intent(self, text: str) -> Dict:
        """Classify the intent of the given text"""
        # Simple keyword-based classification first
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in text for pattern in patterns):
                return {
                    'intent': intent,
                    'confidence': 0.8,  # Placeholder confidence
                    'entities': self.extract_entities(text)
                }

        # If no keyword match, use more sophisticated NLP
        result = self.intent_classifier(text)
        return {
            'intent': result['label'],
            'confidence': result['score'],
            'entities': self.extract_entities(text)
        }

    def extract_entities(self, text: str) -> List[Dict]:
        """Extract named entities from text"""
        entities = []

        # Simple entity extraction (in practice, use spaCy or similar)
        words = text.split()
        for i, word in enumerate(words):
            if word in ['kitchen', 'living room', 'bedroom', 'table', 'chair', 'cup', 'book']:
                entities.append({
                    'text': word,
                    'type': 'LOCATION' if word in ['kitchen', 'living room', 'bedroom'] else 'OBJECT',
                    'position': i
                })

        return entities

    def generate_response(self, user_input: str, context: Dict = None) -> str:
        """Generate appropriate response to user input"""
        intent_info = self.classify_intent(user_input)

        if intent_info['intent'] == 'greeting':
            return self.generate_greeting_response()
        elif intent_info['intent'] == 'navigation':
            return self.generate_navigation_response(intent_info['entities'])
        elif intent_info['intent'] == 'manipulation':
            return self.generate_manipulation_response(intent_info['entities'])
        elif intent_info['intent'] == 'information':
            return self.generate_information_response(user_input)
        elif intent_info['intent'] == 'social':
            return self.generate_social_response()
        elif intent_info['intent'] == 'farewell':
            return self.generate_farewell_response()
        else:
            return self.generate_default_response()

    def generate_greeting_response(self) -> str:
        """Generate greeting response"""
        responses = [
            "Hello! It's nice to meet you.",
            "Hi there! How can I help you today?",
            "Good to see you! What would you like to do?"
        ]
        import random
        return random.choice(responses)

    def generate_navigation_response(self, entities: List[Dict]) -> str:
        """Generate navigation response"""
        if entities:
            location = entities[0]['text']
            return f"I can help you navigate to the {location}. Please follow me."
        return "I can help you navigate. Where would you like to go?"

    def generate_manipulation_response(self, entities: List[Dict]) -> str:
        """Generate manipulation response"""
        if entities:
            obj = entities[0]['text']
            return f"I can help you with the {obj}. I'll retrieve it for you."
        return "I can help you with that. What would you like me to do?"

    def generate_default_response(self) -> str:
        """Generate default response when intent is unclear"""
        return "I'm not sure I understand. Could you please rephrase that?"
```

## Gesture Recognition and Generation

### Human Gesture Recognition

```python
import cv2
import mediapipe as mp
import numpy as np
from enum import Enum

class Gesture(Enum):
    WAVING = "waving"
    POINTING = "pointing"
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    STOP = "stop"
    COME_HERE = "come_here"

class GestureRecognizer:
    def __init__(self):
        # Initialize MediaPipe for pose and hand tracking
        self.mp_pose = mp.solutions.pose
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils

        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5
        )

        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5
        )

    def recognize_gestures(self, image):
        """Recognize gestures from image"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Process pose
        pose_results = self.pose.process(rgb_image)
        # Process hands
        hand_results = self.hands.process(rgb_image)

        recognized_gestures = []

        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                gesture = self.analyze_hand_gesture(hand_landmarks, image.shape)
                if gesture:
                    recognized_gestures.append(gesture)

        if pose_results.pose_landmarks:
            pose_gesture = self.analyze_body_gesture(pose_results.pose_landmarks)
            if pose_gesture:
                recognized_gestures.append(pose_gesture)

        return recognized_gestures

    def analyze_hand_gesture(self, hand_landmarks, image_shape):
        """Analyze hand landmarks to recognize specific gestures"""
        # Get landmark coordinates
        landmarks = []
        for landmark in hand_landmarks.landmark:
            x = int(landmark.x * image_shape[1])
            y = int(landmark.y * image_shape[0])
            landmarks.append((x, y))

        # Calculate distances between key points
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]

        # Waving: moving hand side to side
        # This would require tracking movement over time

        # Thumbs up: thumb up, other fingers down
        if (thumb_tip[1] < index_tip[1] and  # Thumb higher than index
            thumb_tip[1] < middle_tip[1] and  # Thumb higher than middle
            thumb_tip[1] < ring_tip[1] and    # Thumb higher than ring
            thumb_tip[1] < pinky_tip[1]):     # Thumb higher than pinky
            return Gesture.THUMBS_UP

        # Stop: palm facing forward, fingers extended
        # Come here: index finger pointing toward robot

        # Pointing: index finger extended, other fingers curled
        if (index_tip[1] < middle_tip[1] and  # Index higher than middle
            index_tip[1] < ring_tip[1] and    # Index higher than ring
            index_tip[1] < pinky_tip[1]):     # Index higher than pinky
            return Gesture.POINTING

        return None

    def analyze_body_gesture(self, pose_landmarks):
        """Analyze body pose to recognize gestures"""
        # Extract key pose landmarks
        landmarks = pose_landmarks.landmark

        # Access specific landmarks by index
        left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_arm = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST]
        right_arm = landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST]

        # Analyze based on relative positions
        # For example, waving could be detected by arm movement over time

        return None  # Placeholder
```

### Robot Gesture Generation

```python
import numpy as np
import math

class GestureGenerator:
    def __init__(self, robot_joints):
        self.robot_joints = robot_joints  # Joint configuration for the humanoid
        self.gesture_sequences = self.define_gestures()

    def define_gestures(self):
        """Define gesture sequences for different gestures"""
        return {
            'waving': self.create_waving_gesture(),
            'pointing': self.create_pointing_gesture(),
            'greeting': self.create_greeting_gesture(),
            'acknowledging': self.create_acknowledging_gesture()
        }

    def create_waving_gesture(self):
        """Create a waving gesture sequence"""
        sequence = []
        base_pos = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]  # Base joint positions

        # Wave motion: move arm up and down
        for t in np.linspace(0, 2*np.pi, 20):  # 20 time steps
            # Elbow and wrist joints move in wave pattern
            elbow_pos = 0.5 * math.sin(t)
            wrist_pos = 0.3 * math.sin(2*t)

            joint_pos = base_pos.copy()
            joint_pos[1] = elbow_pos  # Elbow joint
            joint_pos[2] = wrist_pos  # Wrist joint

            sequence.append({
                'joints': joint_pos,
                'duration': 0.1  # 100ms per step
            })

        return sequence

    def create_pointing_gesture(self):
        """Create a pointing gesture"""
        sequence = []
        base_pos = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

        # Move arm to pointing position
        for i in range(10):
            progress = i / 9.0  # 0 to 1
            joint_pos = base_pos.copy()
            joint_pos[0] = 0.8 * progress  # Shoulder
            joint_pos[1] = 0.6 * progress  # Elbow
            joint_pos[2] = 0.4 * progress  # Wrist

            sequence.append({
                'joints': joint_pos,
                'duration': 0.05
            })

        # Hold position briefly
        for i in range(5):
            sequence.append({
                'joints': sequence[-1]['joints'],
                'duration': 0.1
            })

        # Return to neutral
        for i in range(10):
            progress = 1 - (i / 9.0)  # 1 to 0
            joint_pos = base_pos.copy()
            joint_pos[0] = 0.8 * progress
            joint_pos[1] = 0.6 * progress
            joint_pos[2] = 0.4 * progress

            sequence.append({
                'joints': joint_pos,
                'duration': 0.05
            })

        return sequence

    def execute_gesture(self, gesture_name: str):
        """Execute a predefined gesture"""
        if gesture_name in self.gesture_sequences:
            sequence = self.gesture_sequences[gesture_name]
            return self.execute_sequence(sequence)
        else:
            print(f"Gesture '{gesture_name}' not defined")
            return False

    def execute_sequence(self, sequence):
        """Execute a sequence of joint positions"""
        for step in sequence:
            # In a real robot, this would send commands to joint controllers
            target_joints = step['joints']
            duration = step['duration']

            # Simulate execution
            print(f"Moving to joints: {target_joints} for {duration}s")

            # In ROS 2, you would publish joint trajectory messages here
            # self.joint_trajectory_publisher.publish(trajectory_msg)

        return True
```

## Emotional Interaction and Expression

### Emotional State Management

```python
import numpy as np
from enum import Enum
from typing import Dict, List

class EmotionalState(Enum):
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    SURPRISED = "surprised"
    NEUTRAL = "neutral"
    CONFUSED = "confused"
    CONCERNED = "concerned"

class EmotionalStateEstimator:
    def __init__(self):
        self.current_emotion = EmotionalState.NEUTRAL
        self.emotion_history = []
        self.confidence_threshold = 0.6

    def estimate_emotion_from_audio(self, audio_features: Dict) -> EmotionalState:
        """Estimate emotion from audio features (tone, pitch, speed)"""
        # Simplified emotion estimation
        pitch = audio_features.get('pitch', 0.5)
        speed = audio_features.get('speed', 1.0)
        volume = audio_features.get('volume', 0.5)

        if speed > 1.5 and pitch > 0.7:  # Fast and high pitch
            return EmotionalState.SURPRISED
        elif speed < 0.7 and pitch < 0.3:  # Slow and low pitch
            return EmotionalState.SAD
        elif volume > 0.8 and pitch > 0.6:  # Loud and high pitch
            return EmotionalState.ANGRY
        else:
            return EmotionalState.NEUTRAL

    def estimate_emotion_from_vision(self, facial_features: Dict) -> EmotionalState:
        """Estimate emotion from facial expression"""
        # Based on facial landmark analysis
        eyebrow_raised = facial_features.get('eyebrow_raised', False)
        mouth_open = facial_features.get('mouth_open', False)
        eyes_wide = facial_features.get('eyes_wide', False)

        if eyebrow_raised and eyes_wide:
            return EmotionalState.SURPRISED
        elif mouth_open and eyes_wide:
            return EmotionalState.SURPRISED
        elif not mouth_open and not eyes_wide and not eyebrow_raised:
            return EmotionalState.NEUTRAL
        else:
            return EmotionalState.CONFUSED

    def estimate_emotion_from_context(self, context: Dict) -> EmotionalState:
        """Estimate emotion based on interaction context"""
        recent_events = context.get('recent_events', [])
        user_tone = context.get('user_tone', 'neutral')

        if 'error' in recent_events:
            return EmotionalState.CONCERNED
        elif user_tone == 'frustrated':
            return EmotionalState.CONCERNED
        elif user_tone == 'happy':
            return EmotionalState.HAPPY
        else:
            return EmotionalState.NEUTRAL

class EmotionalExpressionController:
    def __init__(self):
        self.face_expression_map = {
            EmotionalState.HAPPY: {'mouth': 'smile', 'eyebrows': 'neutral', 'eyes': 'normal'},
            EmotionalState.SAD: {'mouth': 'frown', 'eyebrows': 'dropped', 'eyes': 'droopy'},
            EmotionalState.ANGRY: {'mouth': 'tight', 'eyebrows': 'furrowed', 'eyes': 'narrow'},
            EmotionalState.SURPRISED: {'mouth': 'open', 'eyebrows': 'raised', 'eyes': 'wide'},
            EmotionalState.NEUTRAL: {'mouth': 'neutral', 'eyebrows': 'neutral', 'eyes': 'normal'},
            EmotionalState.CONFUSED: {'mouth': 'slightly_open', 'eyebrows': 'one_raised', 'eyes': 'looking_around'},
            EmotionalState.CONCERNED: {'mouth': 'tight', 'eyebrows': 'furrowed', 'eyes': 'wide'},
        }

    def generate_emotional_response(self, perceived_emotion: EmotionalState, context: Dict) -> Dict:
        """Generate appropriate emotional response"""
        response = {
            'face_expression': self.face_expression_map[perceived_emotion],
            'vocal_tone': self.get_vocal_tone_for_emotion(perceived_emotion),
            'body_posture': self.get_posture_for_emotion(perceived_emotion),
            'response_text': self.get_response_text_for_emotion(perceived_emotion, context)
        }
        return response

    def get_vocal_tone_for_emotion(self, emotion: EmotionalState) -> Dict:
        """Get vocal tone parameters for an emotion"""
        tone_map = {
            EmotionalState.HAPPY: {'pitch': 1.2, 'speed': 1.1, 'volume': 1.0},
            EmotionalState.SAD: {'pitch': 0.8, 'speed': 0.7, 'volume': 0.8},
            EmotionalState.ANGRY: {'pitch': 1.1, 'speed': 1.5, 'volume': 1.3},
            EmotionalState.SURPRISED: {'pitch': 1.4, 'speed': 1.2, 'volume': 1.1},
            EmotionalState.NEUTRAL: {'pitch': 1.0, 'speed': 1.0, 'volume': 1.0},
            EmotionalState.CONFUSED: {'pitch': 0.9, 'speed': 0.9, 'volume': 0.9},
            EmotionalState.CONCERNED: {'pitch': 0.95, 'speed': 0.8, 'volume': 0.9}
        }
        return tone_map.get(emotion, tone_map[EmotionalState.NEUTRAL])

    def get_posture_for_emotion(self, emotion: EmotionalState) -> str:
        """Get body posture for an emotion"""
        posture_map = {
            EmotionalState.HAPPY: 'upright_and_open',
            EmotionalState.SAD: 'slightly_hunched',
            EmotionalState.ANGRY: 'stiff_and_direct',
            EmotionalState.SURPRISED: 'leaning_forward',
            EmotionalState.NEUTRAL: 'normal_standing',
            EmotionalState.CONFUSED: 'slight_head_tilt',
            EmotionalState.CONCERNED: 'leaning_slightly_forward'
        }
        return posture_map.get(emotion, 'normal_standing')

    def get_response_text_for_emotion(self, emotion: EmotionalState, context: Dict) -> str:
        """Get appropriate response text for an emotion"""
        response_templates = {
            EmotionalState.HAPPY: "I'm glad you're happy! How can I help?",
            EmotionalState.SAD: "I'm sorry you're feeling down. Is there anything I can do?",
            EmotionalState.ANGRY: "I understand you're upset. Let me help resolve this.",
            EmotionalState.SURPRISED: "Oh! Did I surprise you? I didn't mean to.",
            EmotionalState.NEUTRAL: "Hello! How can I assist you today?",
            EmotionalState.CONFUSED: "I see you look confused. Let me clarify.",
            EmotionalState.CONCERNED: "I notice you seem concerned. How can I help?"
        }
        return response_templates.get(emotion, "Hello! How can I help?")
```

## Multi-Modal Interaction Framework

### Integration of Multiple Interaction Modalities

```python
import threading
import time
from queue import Queue

class MultiModalInteractionFramework:
    def __init__(self):
        # Initialize all interaction modules
        self.nlp_processor = NaturalLanguageProcessor()
        self.gesture_recognizer = GestureRecognizer()
        self.emotion_estimator = EmotionalStateEstimator()
        self.social_controller = SocialBehaviorController("robot1")
        self.gesture_generator = GestureGenerator(robot_joints=[])

        # Queues for different modalities
        self.speech_queue = Queue()
        self.vision_queue = Queue()
        self.tactile_queue = Queue()

        # Interaction state
        self.current_interaction = None
        self.interaction_history = []

        # Start processing threads
        self.speech_thread = threading.Thread(target=self.process_speech_input)
        self.vision_thread = threading.Thread(target=self.process_vision_input)
        self.main_thread = threading.Thread(target=self.main_interaction_loop)

    def process_speech_input(self):
        """Continuously process speech input"""
        while True:
            try:
                # In a real system, this would continuously listen
                speech_text = self.nlp_processor.recognize_speech()
                if speech_text:
                    intent_info = self.nlp_processor.classify_intent(speech_text)
                    self.speech_queue.put({
                        'type': 'speech',
                        'text': speech_text,
                        'intent': intent_info
                    })
                time.sleep(0.1)  # Small delay to prevent busy waiting
            except Exception as e:
                print(f"Speech processing error: {e}")

    def process_vision_input(self):
        """Continuously process vision input"""
        cap = cv2.VideoCapture(0)  # Camera input
        while True:
            ret, frame = cap.read()
            if ret:
                gestures = self.gesture_recognizer.recognize_gestures(frame)
                if gestures:
                    self.vision_queue.put({
                        'type': 'gesture',
                        'gestures': gestures,
                        'timestamp': time.time()
                    })
            time.sleep(0.1)

    def main_interaction_loop(self):
        """Main loop for coordinating multi-modal interaction"""
        while True:
            # Process all available inputs
            self.process_queued_inputs()

            # Generate appropriate response
            response = self.generate_response()

            # Execute response
            self.execute_response(response)

            time.sleep(0.05)  # Main loop rate

    def process_queued_inputs(self):
        """Process all queued interaction inputs"""
        # Process speech inputs
        while not self.speech_queue.empty():
            speech_data = self.speech_queue.get()
            self.handle_speech_input(speech_data)

        # Process vision inputs
        while not self.vision_queue.empty():
            vision_data = self.vision_queue.get()
            self.handle_vision_input(vision_data)

    def handle_speech_input(self, speech_data):
        """Handle speech input and update interaction state"""
        text = speech_data['text']
        intent = speech_data['intent']

        # Update social state based on interaction
        if intent['intent'] == 'greeting':
            self.social_controller.social_state.engagement_level = 0.8
            self.social_controller.social_state.emotional_state = "happy"
        elif intent['intent'] == 'farewell':
            self.social_controller.social_state.engagement_level = 0.2

        # Store in interaction history
        self.interaction_history.append({
            'type': 'speech',
            'content': text,
            'intent': intent,
            'timestamp': time.time()
        })

    def handle_vision_input(self, vision_data):
        """Handle vision input and update interaction state"""
        gestures = vision_data['gestures']

        for gesture in gestures:
            if gesture == Gesture.WAVING:
                # Increase engagement level
                self.social_controller.social_state.engagement_level = min(
                    1.0, self.social_controller.social_state.engagement_level + 0.3
                )
                # Generate waving response
                self.gesture_generator.execute_gesture('waving')

        # Store in interaction history
        self.interaction_history.append({
            'type': 'gesture',
            'content': [g.value for g in gestures],
            'timestamp': time.time()
        })

    def generate_response(self):
        """Generate multimodal response based on current state"""
        # Analyze current context
        context = {
            'social_state': self.social_controller.social_state,
            'recent_interactions': self.interaction_history[-5:],  # Last 5 interactions
            'engagement_level': self.social_controller.social_state.engagement_level
        }

        # Select appropriate behaviors
        behaviors = self.social_controller.select_appropriate_behavior(context)

        # Generate response components
        response = {
            'speech': self.generate_speech_response(context),
            'gesture': behaviors['gesture'],
            'gaze': behaviors['gaze'],
            'emotional_expression': self.generate_emotional_response(context)
        }

        return response

    def generate_speech_response(self, context):
        """Generate appropriate speech response"""
        engagement = context['engagement_level']

        if engagement > 0.7:
            return "I'm happy to help you with that!"
        elif engagement > 0.4:
            return "I can assist you. What would you like to do?"
        else:
            return "Hello there! How can I help you today?"

    def generate_emotional_response(self, context):
        """Generate emotional expression response"""
        engagement = context['engagement_level']

        if engagement > 0.7:
            return EmotionalState.HAPPY
        elif engagement > 0.4:
            return EmotionalState.NEUTRAL
        else:
            return EmotionalState.CONCERNED

    def execute_response(self, response):
        """Execute the multimodal response"""
        # Execute speech
        print(f"Robot says: {response['speech']}")

        # Execute gesture
        if response['gesture']:
            gesture_name = response['gesture'].value
            self.gesture_generator.execute_gesture(gesture_name)

        # Execute emotional expression
        if response['emotional_expression']:
            expr_controller = EmotionalExpressionController()
            emotion_response = expr_controller.generate_emotional_response(
                response['emotional_expression'], {}
            )
            print(f"Robot expresses: {emotion_response}")
```

## ROS 2 Integration for HRI

### Human-Robot Interaction Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Bool, Float32
from sensor_msgs.msg import Image, JointState
from geometry_msgs.msg import PointStamped
from hri_msgs.msg import HumanState, RobotExpression, InteractionEvent

class HRIManager(Node):
    def __init__(self):
        super().__init__('hri_manager')

        # Publishers
        self.speech_pub = self.create_publisher(String, 'robot_speech', 10)
        self.expression_pub = self.create_publisher(RobotExpression, 'robot_expression', 10)
        self.gesture_pub = self.create_publisher(String, 'robot_gesture', 10)
        self.interaction_pub = self.create_publisher(InteractionEvent, 'interaction_events', 10)

        # Subscribers
        self.speech_sub = self.create_subscription(
            String, 'human_speech', self.speech_callback, 10
        )
        self.image_sub = self.create_subscription(
            Image, 'camera/image_raw', self.image_callback, 10
        )
        self.human_state_sub = self.create_subscription(
            HumanState, 'human_state', self.human_state_callback, 10
        )

        # Initialize interaction components
        self.nlp_processor = NaturalLanguageProcessor()
        self.social_controller = SocialBehaviorController(self.get_namespace())
        self.gesture_generator = GestureGenerator([])

        # Timer for periodic interaction updates
        self.interaction_timer = self.create_timer(0.1, self.interaction_step)

        # Internal state
        self.human_states = {}
        self.current_interaction = None

        self.get_logger().info('HRI Manager initialized')

    def speech_callback(self, msg: String):
        """Handle incoming human speech"""
        intent_info = self.nlp_processor.classify_intent(msg.data.lower())

        # Publish interaction event
        event_msg = InteractionEvent()
        event_msg.type = "speech_input"
        event_msg.content = msg.data
        event_msg.intent = intent_info['intent']
        self.interaction_pub.publish(event_msg)

        # Generate and publish response
        response = self.nlp_processor.generate_response(msg.data)
        response_msg = String()
        response_msg.data = response
        self.speech_pub.publish(response_msg)

    def image_callback(self, msg: Image):
        """Process camera image for gesture recognition"""
        # Convert ROS Image to OpenCV format and process
        # This would involve calling gesture recognition algorithms
        pass

    def human_state_callback(self, msg: HumanState):
        """Update with human state information"""
        self.human_states[msg.human_id] = {
            'position': msg.position,
            'gaze_direction': msg.gaze_direction,
            'engagement': msg.engagement_level
        }

        # Update social controller
        self.social_controller.update_human_tracking(
            msg.human_id,
            np.array([msg.position.x, msg.position.y, msg.position.z]),
            msg.is_looking_at_robot
        )

    def interaction_step(self):
        """Main interaction processing step"""
        if self.human_states:
            # Determine primary human for interaction
            primary_human = self.select_primary_human()

            if primary_human:
                context = {
                    'target_human': primary_human,
                    'human_count': len(self.human_states),
                    'interaction_type': 'unknown'  # Would be determined from context
                }

                # Select appropriate behaviors
                behaviors = self.social_controller.select_appropriate_behavior(context)

                # Execute gaze behavior
                gaze_msg = String()
                gaze_msg.data = behaviors['gaze'].value
                self.gesture_pub.publish(gaze_msg)

                # Execute gesture if appropriate
                if behaviors['gesture']:
                    gesture_msg = String()
                    gesture_msg.data = behaviors['gesture'].value
                    self.gesture_pub.publish(gesture_msg)

    def select_primary_human(self):
        """Select the primary human for interaction"""
        if not self.human_states:
            return None

        # Select human with highest engagement level
        primary_human = max(
            self.human_states.items(),
            key=lambda x: x[1].get('engagement', 0)
        )[0]

        return primary_human
```

## Challenges in Human-Robot Interaction

### Social Acceptance

Humanoid robots must be designed to be socially acceptable:

- Appropriate appearance and behavior
- Respect for cultural norms
- Privacy considerations

### Safety and Trust

Ensuring safe and trustworthy interactions:

- Predictable behavior
- Clear communication of robot capabilities
- Safe physical interaction

### Technical Challenges

Various technical challenges in HRI:

- Robust perception in real environments
- Real-time processing requirements
- Multi-modal integration complexity

## Practice Tasks

1. Implement a simple speech recognition and response system
2. Create gesture recognition using computer vision
3. Develop emotional expression capabilities
4. Design a multimodal interaction system
5. Test HRI system with human subjects in simulation

## Summary

Human-Robot Interaction is crucial for humanoid robots to effectively collaborate with humans. By implementing natural communication modalities, social behaviors, and emotional expressions, humanoid robots can create more intuitive and engaging interactions that facilitate human-robot collaboration.
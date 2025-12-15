# Module 4: Vision-Language-Action Systems Code Examples

This directory contains code examples for Module 4 of the Physical AI & Humanoid Robotics book, focusing on Vision-Language-Action (VLA) systems for humanoid robotics.

## Examples Included

### 1. Vision-Language-Action System (`vision_language_action_system.py`)
A complete VLA system that demonstrates:
- Voice command processing and speech recognition
- Natural language understanding for robotics commands
- Computer vision for object detection and localization
- Action planning based on language and vision inputs
- Integration with ROS 2 for robotic control

**Key Components:**
- Speech recognition and NLP processing
- Color-based object detection (for demonstration)
- Command parsing and intent classification
- Action planning and execution
- World modeling and visualization

**Features:**
- Voice command processing ("Pick up the red cup", "Go to the kitchen", etc.)
- Real-time object detection and tracking
- Task planning based on language and vision inputs
- Action execution simulation
- Visualization of detected objects

**Usage:**
```bash
# Make sure you have the required dependencies:
pip install opencv-python speechrecognition transformers torch rospy

# Run the VLA system (make sure ROS is sourced)
python3 vision_language_action_system.py
```

**ROS Dependencies:**
- `/camera/rgb/image_raw`: RGB camera image topic
- `/joint_states`: Robot joint states (optional for this demo)
- Publishers: `/robot/voice_command`, `/robot/action_command`, `/robot/status`, `/detected_objects`

### 2. Component Examples (Conceptual)
The main VLA system includes implementations of:

#### Voice Processing Component
- Speech recognition using Google Speech Recognition
- Natural language parsing for robotics commands
- Intent classification (pickup, navigate, deliver, etc.)
- Entity extraction (object names, locations)

#### Vision Processing Component
- Real-time object detection
- Color-based object recognition (for demonstration)
- 3D position estimation from 2D images
- World model updates

#### Action Planning Component
- Task decomposition based on language commands
- Integration with vision context
- Action sequence generation
- Execution monitoring

## Running the Examples

### Prerequisites
- ROS 2 Humble Hawksbill
- Python 3.8+
- Required Python packages:
  ```bash
  pip install opencv-python speechrecognition transformers torch numpy scipy
  ```
- Microphone for voice input
- Camera publishing images to `/camera/rgb/image_raw`

### Setup
1. Make sure your ROS 2 environment is sourced:
```bash
source /opt/ros/humble/setup.bash
source install/setup.bash  # If using custom workspace
```

2. Ensure camera is publishing images:
```bash
# Check if camera topic exists
ros2 topic list | grep camera
```

3. Run the VLA system:
```bash
python3 vision_language_action_system.py
```

### Testing with Simulation
To test with a simulated robot:

1. **Launch a robot simulation** (e.g., using Gazebo):
```bash
# Launch a robot with camera in Gazebo
ros2 launch my_robot_gazebo my_robot_world.launch.py
```

2. **Run the VLA system**:
```bash
python3 vision_language_action_system.py
```

3. **Use RViz2 for visualization** (optional):
```bash
# In another terminal
rviz2

# Add displays for:
# - Image to see camera feed
# - Markers to see detected objects
# - RobotModel to see robot state
```

## Understanding the VLA Pipeline

### The VLA Architecture
```
Voice Command → Language Understanding → Vision Processing → Action Planning → Action Execution
```

### Processing Flow
1. **Voice Input**: Speech recognition converts speech to text
2. **Language Processing**: NLP parses commands and extracts intent/entities
3. **Vision Processing**: Object detection and scene understanding
4. **Action Planning**: Combines language and vision to plan actions
5. **Action Execution**: Executes planned action sequence

## Key Technologies Demonstrated

- **Speech Recognition**: Converting voice to text
- **Natural Language Processing**: Understanding commands
- **Computer Vision**: Object detection and localization
- **Action Planning**: Task decomposition and sequencing
- **ROS 2 Integration**: Robotics middleware communication
- **Visualization**: Object detection feedback

## Extending the Examples

These examples provide a foundation that can be extended:

1. **Replace Color Detection**: Use YOLO, DETR, or other advanced object detection models
2. **Enhance NLP**: Integrate with large language models for better understanding
3. **Add Manipulation**: Connect to actual robotic manipulation stack
4. **Improve Navigation**: Integrate with ROS 2 navigation stack
5. **Add Conversational AI**: Include dialogue management for complex interactions

## Troubleshooting

- **No Voice Input**: Check microphone permissions and availability
- **No Image Feed**: Ensure camera is publishing to correct topic
- **Poor Detection**: Adjust color ranges in the detector for your environment
- **Recognition Errors**: Speak clearly and in a quiet environment
- **ROS Issues**: Verify ROS 2 installation and workspace setup

## Performance Considerations

- The example uses simple color-based detection; replace with advanced models for production
- Speech recognition requires internet connection for Google API
- The system is designed for real-time operation but performance depends on hardware
- For deployment, consider edge computing options for better performance

## Integration with Isaac

This example can be extended to work with NVIDIA Isaac:
- Replace the simple object detector with Isaac ROS DNN packages
- Use Isaac Sim for training and testing
- Leverage Isaac's hardware acceleration for better performance
- Integrate with Isaac's manipulation and navigation packages
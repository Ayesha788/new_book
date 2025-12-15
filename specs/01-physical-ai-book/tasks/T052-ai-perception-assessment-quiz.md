# AI Perception Assessment Quiz: Module 3 - AI Perception & Navigation

## Quiz: Introduction to NVIDIA Isaac

### Question 1: Multiple Choice
What does NVIDIA Isaac primarily provide for robotics?
A) Only hardware components
B) Only software frameworks
C) A complete platform with hardware acceleration, software frameworks, and simulation tools
D) Only simulation environments

**Correct Answer:** C) A complete platform with hardware acceleration, software frameworks, and simulation tools
**Explanation:** NVIDIA Isaac is a comprehensive robotics platform that includes hardware acceleration (Jetson), software frameworks (Isaac ROS), and simulation tools (Isaac Sim).

### Question 2: Multiple Choice
Which hardware platforms are supported by NVIDIA Isaac?
A) Only x86 systems
B) Only Jetson platforms
C) Jetson platforms, x86 systems with NVIDIA GPUs, and embedded systems
D) Only mobile devices

**Correct Answer:** C) Jetson platforms, x86 systems with NVIDIA GPUs, and embedded systems
**Explanation:** Isaac supports various platforms including Jetson AGX Orin, Jetson Orin NX, Jetson Nano, and x86 systems with NVIDIA GPUs.

### Question 3: Multiple Choice
What is Isaac ROS?
A) A new version of ROS
B) Hardware components for robots
C) GPU-accelerated ROS 2 packages optimized for perception, navigation, and manipulation
D) A simulation environment

**Correct Answer:** C) GPU-accelerated ROS 2 packages optimized for perception, navigation, and manipulation
**Explanation:** Isaac ROS provides GPU-accelerated ROS 2 packages specifically optimized for AI-powered robotics tasks.

### Question 4: True/False
Isaac Sim is based on NVIDIA Omniverse technology.
A) True
B) False

**Correct Answer:** A) True
**Explanation:** Isaac Sim is built on NVIDIA Omniverse platform, providing photorealistic rendering and physics simulation.

### Question 5: Multiple Choice
Which of the following is NOT a component of the Isaac software stack?
A) Isaac ROS
B) Isaac Sim
C) Isaac Apps
D) Isaac Hardware

**Correct Answer:** D) Isaac Hardware
**Explanation:** The Isaac software stack includes Isaac ROS, Isaac Sim, and Isaac Apps. Hardware is a separate layer.

## Quiz: AI Perception Systems

### Question 6: Multiple Choice
What is the primary purpose of computer vision in robotics?
A) To store data
B) To enable robots to interpret visual information from their environment
C) To control motors
D) To communicate with other robots

**Correct Answer:** B) To enable robots to interpret visual information from their environment
**Explanation:** Computer vision allows robots to process and understand visual data from cameras to perceive their environment.

### Question 7: Multiple Choice
Which neural network architecture is commonly used for real-time object detection?
A) ResNet
B) YOLO (You Only Look Once)
C) VGG
D) AlexNet

**Correct Answer:** B) YOLO (You Only Look Once)
**Explanation:** YOLO is specifically designed for real-time object detection, balancing accuracy and speed.

### Question 8: Multiple Choice
What does SLAM stand for?
A) Simultaneous Localization and Mapping
B) Simultaneous Learning and Mapping
C) Systematic Localization and Mapping
D) Simultaneous Localization and Movement

**Correct Answer:** A) Simultaneous Localization and Mapping
**Explanation:** SLAM is the process of building a map of an unknown environment while simultaneously tracking the robot's position within that map.

### Question 9: Multiple Choice
What is sensor fusion in robotics?
A) Combining data from multiple sensors to create a more complete picture
B) Using only one sensor type
C) Fusing sensors with actuators
D) Creating new sensor types

**Correct Answer:** A) Combining data from multiple sensors to create a more complete picture
**Explanation:** Sensor fusion combines data from multiple sensors (cameras, LiDAR, IMU, etc.) to improve perception accuracy.

### Question 10: Multiple Choice
Which Isaac ROS package is used for robust fiducial marker detection?
A) Isaac ROS DNN
B) Isaac ROS Apriltag
C) Isaac ROS Visual SLAM
D) Isaac ROS Stereo DNN

**Correct Answer:** B) Isaac ROS Apriltag
**Explanation:** Isaac ROS Apriltag package provides GPU-accelerated fiducial marker detection.

## Quiz: Navigation and Path Planning

### Question 11: Multiple Choice
What is the main difference between global and local path planning?
A) Global is faster than local
B) Global plans the overall route considering the entire map, local handles immediate obstacles
C) Local is more accurate than global
D) There is no difference

**Correct Answer:** B) Global plans the overall route considering the entire map, local handles immediate obstacles
**Explanation:** Global planners create paths across the entire known map, while local planners handle immediate obstacles and fine-tune the path.

### Question 12: Multiple Choice
Which algorithm is commonly used for optimal path planning?
A) Depth-First Search
B) A* Algorithm
C) Random Walk
D) Greedy Algorithm

**Correct Answer:** B) A* Algorithm
**Explanation:** A* is a popular path planning algorithm that finds optimal paths by balancing path cost and heuristic distance to goal.

### Question 13: Multiple Choice
What is the Dynamic Window Approach (DWA) used for?
A) Map building
B) Object detection
C) Local path planning and obstacle avoidance
D) Sensor fusion

**Correct Answer:** C) Local path planning and obstacle avoidance
**Explanation:** DWA is a local path planning approach that considers robot dynamics and obstacle avoidance in real-time.

### Question 14: Multiple Choice
What does the "V" in VPI (Vision Programming Interface) stand for?
A) Virtual
B) Vision
C) Vector
D) Variable

**Correct Answer:** B) Vision
**Explanation:** VPI stands for Vision Programming Interface, NVIDIA's API for accelerated computer vision operations.

### Question 15: Multiple Choice
In navigation, what is a "frontier"?
A) A type of robot
B) A boundary between known and unknown space in a map
C) A navigation algorithm
D) A sensor type

**Correct Answer:** B) A boundary between known and unknown space in a map
**Explanation:** Frontiers are boundaries between mapped and unmapped areas, used for exploration planning.

## Quiz: Intelligent Decision Making

### Question 16: Multiple Choice
What is a behavior tree in robotics?
A) A type of neural network
B) A hierarchical planning approach that structures robot behaviors
C) A map representation
D) A sensor fusion technique

**Correct Answer:** B) A hierarchical planning approach that structures robot behaviors
**Explanation:** Behavior trees provide a modular and reusable way to structure robot behaviors in a hierarchical manner.

### Question 17: Multiple Choice
In a behavior tree, what does a Sequence node do?
A) Executes all children until one succeeds
B) Executes all children in sequence until one fails
C) Executes only the first child
D) Executes children randomly

**Correct Answer:** B) Executes all children in sequence until one fails
**Explanation:** A Sequence node executes its children in order until one returns FAILURE, otherwise returns SUCCESS if all succeed.

### Question 18: Multiple Choice
What is the purpose of a Selector node in a behavior tree?
A) To execute all children sequentially
B) To execute children until one succeeds
C) To execute the most important child only
D) To select the fastest child

**Correct Answer:** B) To execute children until one succeeds
**Explanation:** A Selector node tries its children in order until one returns SUCCESS, otherwise returns FAILURE if all fail.

### Question 19: Multiple Choice
What is Reinforcement Learning primarily used for in robotics?
A) Map building only
B) Learning optimal behaviors through trial and error
C) Sensor calibration
D) Motor control only

**Correct Answer:** B) Learning optimal behaviors through trial and error
**Explanation:** RL allows robots to learn optimal behaviors by receiving rewards/penalties based on their actions.

### Question 20: Multiple Choice
What does PDDL stand for in task planning?
A) Probabilistic Domain Definition Language
B) Planning Domain Definition Language
C) Perception and Decision Description Language
D) Process and Decision Definition Language

**Correct Answer:** B) Planning Domain Definition Language
**Explanation:** PDDL is the Planning Domain Definition Language, a standard language for describing planning problems in AI.

## Quiz: Isaac ROS Specifics

### Question 21: Multiple Choice
Which Isaac ROS package provides GPU-accelerated visual SLAM?
A) Isaac ROS DNN
B) Isaac ROS Visual SLAM
C) Isaac ROS Stereo DNN
D) Isaac ROS Apriltag

**Correct Answer:** B) Isaac ROS Visual SLAM
**Explanation:** Isaac ROS Visual SLAM provides GPU-accelerated visual SLAM capabilities.

### Question 22: Multiple Choice
What does TensorRT provide for Isaac ROS?
A) Map representation
B) Optimized AI inference
C) Sensor fusion
D) Path planning

**Correct Answer:** B) Optimized AI inference
**Explanation:** TensorRT provides optimized neural network inference, making AI models run faster on NVIDIA GPUs.

### Question 23: Multiple Choice
Which Isaac component is used for synthetic data generation?
A) Isaac ROS
B) Isaac Sim
C) Isaac Apps
D) Isaac Hardware

**Correct Answer:** B) Isaac Sim
**Explanation:** Isaac Sim includes synthetic data generation capabilities for creating labeled training data.

### Question 24: Multiple Choice
What is the main advantage of Isaac Sim for robotics development?
A) Lower cost only
B) Faster development through simulation, synthetic data, and photorealistic environments
C) Better hardware support
D) Simpler programming

**Correct Answer:** B) Faster development through simulation, synthetic data, and photorealistic environments
**Explanation:** Isaac Sim accelerates development by providing realistic simulation, synthetic data generation, and testing capabilities.

### Question 25: Multiple Choice
Which Isaac Apps example focuses on warehouse logistics?
A) AMR Navigation
B) Pick and Place
C) Isaac ROS Warehouse Logistics
D) Stereo DNN

**Correct Answer:** C) Isaac ROS Warehouse Logistics
**Explanation:** Isaac ROS Warehouse Logistics is a reference application for warehouse automation and logistics scenarios.

## Quiz: Perception Techniques

### Question 26: Multiple Choice
What is semantic segmentation?
A) Detecting objects in an image
B) Labeling each pixel in an image with its object class
C) Measuring distances
D) Tracking objects over time

**Correct Answer:** B) Labeling each pixel in an image with its object class
**Explanation:** Semantic segmentation assigns a class label to each pixel in an image, creating a pixel-wise classification map.

### Question 27: Multiple Choice
What is the difference between semantic and instance segmentation?
A) No difference
B) Instance segmentation distinguishes between different instances of the same class
C) Semantic is faster than instance
D) Instance uses more memory

**Correct Answer:** B) Instance segmentation distinguishes between different instances of the same class
**Explanation:** Instance segmentation not only classifies pixels but also identifies separate objects of the same class.

### Question 28: Multiple Choice
What is the purpose of the perception pipeline?
A) To store sensor data
B) To process raw sensor data into meaningful information about the environment
C) To control actuators
D) To communicate with other robots

**Correct Answer:** B) To process raw sensor data into meaningful information about the environment
**Explanation:** The perception pipeline transforms raw sensor data (images, LiDAR, etc.) into understanding of the environment.

### Question 29: Multiple Choice
What does "sim-to-real transfer" refer to?
A) Moving robots to simulation
B) Transferring capabilities learned in simulation to real robots
C) Real robots moving to simulation
D) Comparing simulation to reality

**Correct Answer:** B) Transferring capabilities learned in simulation to real robots
**Explanation:** Sim-to-real transfer is the process of applying behaviors, controllers, or models developed in simulation to physical robots.

### Question 30: Multiple Choice
What is domain randomization used for?
A) Creating random robots
B) Randomizing simulation parameters to improve robustness of learned behaviors
C) Randomizing sensor data
D) Creating random algorithms

**Correct Answer:** B) Randomizing simulation parameters to improve robustness of learned behaviors
**Explanation:** Domain randomization involves varying simulation conditions (lighting, textures, physics) to make learned behaviors more robust to real-world variations.
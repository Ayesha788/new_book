# ROS 2 Assessment Quiz: Module 1 - ROS 2 Fundamentals

## Quiz: Introduction to ROS 2

### Question 1: Multiple Choice
What does ROS stand for?
A) Robot Operating System
B) Robot Operating Software
C) Robotic Open System
D) Robotic Operating System

**Correct Answer:** A) Robot Operating System
**Explanation:** ROS stands for Robot Operating System, though it's technically a middleware framework rather than a full operating system.

### Question 2: Multiple Choice
Which ROS 2 distribution is recommended for long-term support until 2027?
A) Rolling
B) Iron Irwin
C) Humble Hawksbill
D) Galactic

**Correct Answer:** C) Humble Hawksbill
**Explanation:** ROS 2 Humble Hawksbill is an LTS (Long Term Support) version with support until 2027, making it ideal for educational content.

### Question 3: Multiple Choice
What is the primary communication pattern in ROS 2 for continuous data flow?
A) Client/Service
B) Publisher/Subscriber
C) Action
D) Request/Response

**Correct Answer:** B) Publisher/Subscriber
**Explanation:** Publisher/Subscriber is the primary communication pattern for continuous data flow like sensor data, where publishers send data to subscribers asynchronously.

### Question 4: True/False
ROS 2 nodes can communicate across different machines using DDS (Data Distribution Service).
A) True
B) False

**Correct Answer:** A) True
**Explanation:** ROS 2 uses DDS as its underlying communication layer, enabling nodes to communicate across different machines and platforms.

### Question 5: Multiple Choice
Which command is used to list all active ROS 2 nodes?
A) ros2 list nodes
B) ros2 show nodes
C) ros2 node list
D) ros2 get nodes

**Correct Answer:** C) ros2 node list
**Explanation:** The correct command to list all active ROS 2 nodes is 'ros2 node list'.

### Question 6: Multiple Choice
What is the default build system for ROS 2 packages?
A) make
B) cmake
C) colcon
D) catkin

**Correct Answer:** C) colcon
**Explanation:** colcon is the default build system for ROS 2 packages, replacing catkin from ROS 1.

### Question 7: Multiple Choice
Which communication pattern in ROS 2 is best suited for long-running tasks with feedback?
A) Publisher/Subscriber
B) Client/Service
C) Action
D) Topic/Message

**Correct Answer:** C) Action
**Explanation:** Actions are designed for long-running tasks that provide feedback during execution and results at completion, making them ideal for navigation and manipulation tasks.

### Question 8: Short Answer
Explain the difference between a ROS 2 package and a ROS 2 node.

**Correct Answer:** A ROS 2 package is a directory containing source code, configuration files, and build instructions that can contain one or more nodes. A node is a single executable process that performs computation and communicates with other nodes through topics, services, or actions. Packages organize code for distribution, while nodes are the running processes that execute the functionality.

### Question 9: Multiple Choice
Which command creates a new ROS 2 package?
A) ros2 create package
B) ros2 pkg create
C) ros2 new package
D) ros2 make package

**Correct Answer:** B) ros2 pkg create
**Explanation:** The correct command to create a new ROS 2 package is 'ros2 pkg create'.

### Question 10: Multiple Choice
What is the purpose of the ROS 2 daemon?
A) To manage system resources
B) To provide a central logging service
C) To maintain persistent connections between nodes and reduce startup time
D) To compile ROS packages

**Correct Answer:** C) To maintain persistent connections between nodes and reduce startup time
**Explanation:** The ROS 2 daemon runs in the background to maintain persistent connections between nodes, reducing the time it takes for nodes to find each other and communicate.

## Quiz: ROS 2 Nodes and Communication

### Question 11: Multiple Choice
What is the primary purpose of a ROS 2 node?
A) To store data permanently
B) To perform computation and communicate with other nodes
C) To manage system hardware
D) To provide network security

**Correct Answer:** B) To perform computation and communicate with other nodes
**Explanation:** A ROS 2 node is an executable process that performs computation and communicates with other nodes through topics, services, and actions.

### Question 12: Multiple Choice
Which command is used to run a ROS 2 node?
A) ros2 run
B) ros2 execute
C) ros2 start
D) ros2 launch

**Correct Answer:** A) ros2 run
**Explanation:** The 'ros2 run' command is used to run a specific node from a package.

### Question 13: Multiple Choice
What is the difference between 'ros2 run' and 'ros2 launch'?
A) No difference, they are interchangeable
B) 'ros2 run' runs a single node, 'ros2 launch' runs multiple nodes from a launch file
C) 'ros2 run' is for debugging, 'ros2 launch' is for production
D) 'ros2 run' is for services, 'ros2 launch' is for topics

**Correct Answer:** B) 'ros2 run' runs a single node, 'ros2 launch' runs multiple nodes from a launch file
**Explanation:** 'ros2 run' executes a single node directly, while 'ros2 launch' executes multiple nodes defined in a launch file.

### Question 14: True/False
A single ROS 2 node can publish to multiple topics and subscribe to multiple topics simultaneously.
A) True
B) False

**Correct Answer:** A) True
**Explanation:** A single ROS 2 node can indeed publish to multiple topics and subscribe to multiple topics simultaneously, making it a flexible communication hub.

### Question 15: Multiple Choice
Which function is used to create a publisher in a ROS 2 node?
A) create_publisher()
B) new_publisher()
C) add_publisher()
D) init_publisher()

**Correct Answer:** A) create_publisher()
**Explanation:** The create_publisher() function is used to create a publisher in a ROS 2 node.

## Quiz: Topics and Services

### Question 16: Multiple Choice
What is the primary difference between topics and services in ROS 2?
A) Topics are faster than services
B) Topics provide asynchronous communication, services provide synchronous request-response
C) Topics use TCP, services use UDP
D) There is no significant difference

**Correct Answer:** B) Topics provide asynchronous communication, services provide synchronous request-response
**Explanation:** Topics enable asynchronous, continuous data flow, while services provide synchronous request-response communication for specific tasks.

### Question 17: Multiple Choice
Which command is used to view messages on a specific topic?
A) ros2 topic show
B) ros2 topic echo
C) ros2 topic view
D) ros2 topic get

**Correct Answer:** B) ros2 topic echo
**Explanation:** The 'ros2 topic echo' command is used to view messages being published on a specific topic.

### Question 18: Multiple Choice
What type of communication pattern is best for getting the current position of a robot?
A) Publisher/Subscriber
B) Client/Service
C) Action
D) All of the above

**Correct Answer:** B) Client/Service
**Explanation:** A Client/Service pattern is best for getting the current position on demand, as it provides a synchronous request-response mechanism.

### Question 19: Multiple Choice
Which command is used to call a service from the command line?
A) ros2 service call
B) ros2 service request
C) ros2 service invoke
D) ros2 service execute

**Correct Answer:** A) ros2 service call
**Explanation:** The 'ros2 service call' command is used to call a service from the command line.

### Question 20: Multiple Choice
What does DDS stand for in the context of ROS 2?
A) Distributed Data System
B) Data Distribution Service
C) Distributed Development System
D) Dynamic Data Sharing

**Correct Answer:** B) Data Distribution Service
**Explanation:** DDS stands for Data Distribution Service, which is the middleware that ROS 2 uses for communication between nodes.
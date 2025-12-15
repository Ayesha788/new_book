# Simulation Practice Tasks: Module 2 - Simulation Environments

## Task 1: Create a Basic Gazebo World

### Objective
Create a custom Gazebo world with multiple objects and lighting.

### Prerequisites
- ROS 2 Humble Hawksbill installed
- Gazebo installed
- Basic understanding of SDF format

### Steps
1. Create a new directory for your world:
   ```bash
   mkdir -p ~/simulation_ws/src/my_simulation/worlds
   cd ~/simulation_ws/src/my_simulation/worlds
   ```

2. Create a world file named `simple_room.world`:
   ```xml
   <?xml version="1.0" ?>
   <sdf version="1.7">
     <world name="simple_room">
       <!-- Physics Configuration -->
       <physics type="ode">
         <max_step_size>0.001</max_step_size>
         <real_time_factor>1.0</real_time_factor>
         <real_time_update_rate>1000.0</real_time_update_rate>
       </physics>

       <!-- Lighting -->
       <light name="sun" type="directional">
         <cast_shadows>true</cast_shadows>
         <pose>0 0 10 0 0 0</pose>
         <diffuse>0.8 0.8 0.8 1</diffuse>
         <specular>0.2 0.2 0.2 1</specular>
         <direction>-0.3 0.0 -0.9</direction>
       </light>

       <!-- Ground Plane -->
       <model name="ground_plane">
         <static>true</static>
         <link name="link">
           <collision name="collision">
             <geometry>
               <plane>
                 <normal>0 0 1</normal>
                 <size>20 20</size>
               </plane>
             </geometry>
           </collision>
           <visual name="visual">
             <geometry>
               <plane>
                 <normal>0 0 1</normal>
                 <size>20 20</size>
               </plane>
             </geometry>
             <material>
               <ambient>0.7 0.7 0.7 1</ambient>
               <diffuse>0.7 0.7 0.7 1</diffuse>
             </material>
           </visual>
         </link>
       </model>

       <!-- Add a box obstacle -->
       <model name="box_obstacle">
         <pose>2 0 0.5 0 0 0</pose>
         <link name="link">
           <collision name="collision">
             <geometry>
               <box>
                 <size>1 1 1</size>
               </box>
             </geometry>
           </collision>
           <visual name="visual">
             <geometry>
               <box>
                 <size>1 1 1</size>
               </box>
             </geometry>
             <material>
               <ambient>1 0 0 1</ambient>
               <diffuse>1 0 0 1</diffuse>
             </material>
           </visual>
         </link>
       </model>

       <!-- Add a cylinder -->
       <model name="cylinder_obstacle">
         <pose>-2 1 0.5 0 0 0</pose>
         <link name="link">
           <collision name="collision">
             <geometry>
               <cylinder>
                 <radius>0.5</radius>
                 <length>1.0</length>
               </cylinder>
             </geometry>
           </collision>
           <visual name="visual">
             <geometry>
               <cylinder>
                 <radius>0.5</radius>
                 <length>1.0</length>
               </cylinder>
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

3. Launch your custom world:
   ```bash
   gazebo simple_room.world
   ```

### Verification Steps
- [ ] World loads without errors
- [ ] Ground plane is visible
- [ ] Box and cylinder obstacles are visible
- [ ] Lighting appears realistic
- [ ] You can navigate around the scene using Gazebo controls

## Task 2: Create a Robot Model with Sensors in Gazebo

### Objective
Create a simple robot model with a camera sensor in Gazebo.

### Steps
1. Create a robot model file `my_robot.sdf`:
   ```xml
   <?xml version="1.0" ?>
   <sdf version="1.7">
     <model name="my_robot">
       <!-- Robot Body -->
       <link name="chassis">
         <pose>0 0 0.1 0 0 0</pose>
         <collision name="collision">
           <geometry>
             <box>
               <size>0.5 0.3 0.2</size>
             </box>
           </geometry>
         </collision>
         <visual name="visual">
           <geometry>
             <box>
               <size>0.5 0.3 0.2</size>
             </box>
           </geometry>
           <material>
             <ambient>0.8 0.8 0.2 1</ambient>
             <diffuse>0.8 0.8 0.2 1</diffuse>
           </material>
         </visual>
         <inertial>
           <mass>5.0</mass>
           <inertia>
             <ixx>0.1</ixx>
             <ixy>0</ixy>
             <ixz>0</ixz>
             <iyy>0.1</iyy>
             <iyz>0</iyz>
             <izz>0.1</izz>
           </inertia>
         </inertial>
       </link>

       <!-- Camera Sensor -->
       <sensor name="camera" type="camera">
         <pose>0.2 0 0.1 0 0 0</pose>
         <camera name="head">
           <horizontal_fov>1.047</horizontal_fov>
           <image>
             <width>640</width>
             <height>480</height>
             <format>R8G8B8</format>
           </image>
           <clip>
             <near>0.1</near>
             <far>30</far>
           </clip>
         </camera>
         <always_on>true</always_on>
         <update_rate>30</update_rate>
         <visualize>true</visualize>
       </sensor>
     </model>
   </sdf>
   ```

2. Create a complete world file that includes your robot:
   ```xml
   <?xml version="1.0" ?>
   <sdf version="1.7">
     <world name="robot_world">
       <physics type="ode">
         <max_step_size>0.001</max_step_size>
         <real_time_factor>1.0</real_time_factor>
         <real_time_update_rate>1000.0</real_time_update_rate>
       </physics>

       <light name="sun" type="directional">
         <pose>0 0 10 0 0 0</pose>
         <diffuse>0.8 0.8 0.8 1</diffuse>
         <specular>0.2 0.2 0.2 1</specular>
         <direction>-0.3 0.0 -0.9</direction>
       </light>

       <model name="ground_plane">
         <static>true</static>
         <link name="link">
           <collision name="collision">
             <geometry>
               <plane>
                 <normal>0 0 1</normal>
                 <size>20 20</size>
               </plane>
             </geometry>
           </collision>
           <visual name="visual">
             <geometry>
               <plane>
                 <normal>0 0 1</normal>
                 <size>20 20</size>
               </plane>
             </geometry>
             <material>
               <ambient>0.7 0.7 0.7 1</ambient>
               <diffuse>0.7 0.7 0.7 1</diffuse>
             </material>
           </visual>
         </link>
       </model>

       <!-- Include your robot -->
       <include>
         <name>my_robot</name>
         <pose>0 0 0.2 0 0 0</pose>
         <uri>file://path/to/my_robot.sdf</uri>
       </include>
     </world>
   </sdf>
   ```

3. Launch the world and verify the robot and camera:
   ```bash
   gazebo robot_world.sdf
   ```

4. Check that the camera is publishing data:
   ```bash
   ros2 topic list | grep camera
   ros2 topic echo /camera/image_raw
   ```

### Verification Steps
- [ ] Robot model loads in Gazebo
- [ ] Camera sensor is visible on the robot
- [ ] Camera topic is available in ROS 2
- [ ] Camera publishes image data when running

## Task 3: Unity Robotics Setup (Conceptual)

### Objective
Understand the setup process for Unity in robotics applications.

### Steps
1. Research Unity Robotics Hub installation:
   - Visit the Unity website and Unity Robotics Hub page
   - Review the installation requirements and process
   - Note the different packages available (ROS#, Perception, ML-Agents)

2. Understand the Unity-ROS connection:
   - Learn about the TCP/IP bridge between Unity and ROS
   - Understand how topics and services are mapped
   - Review the message types supported

3. Explore Unity robotics examples:
   - Look at the sample scenes provided with Unity Robotics Hub
   - Understand the basic robot models and environments
   - Review the scripts used for ROS communication

### Verification Steps
- [ ] Understand the Unity Robotics Hub components
- [ ] Know how Unity connects to ROS systems
- [ ] Familiar with basic Unity robotics examples
- [ ] Understand the advantages of Unity for robotics simulation

## Task 4: Digital Twin Implementation

### Objective
Implement a basic digital twin synchronization system.

### Prerequisites
- Completed ROS 2 fundamentals
- Understanding of simulation concepts

### Steps
1. Create a simple publisher node that simulates physical robot data:
   ```python
   # physical_robot_sim.py
   import rclpy
   from rclpy.node import Node
   from sensor_msgs.msg import JointState
   from geometry_msgs.msg import Twist
   import math

   class PhysicalRobotSimulator(Node):
       def __init__(self):
           super().__init__('physical_robot_sim')

           self.joint_pub = self.create_publisher(JointState, '/physical_robot/joint_states', 10)
           self.cmd_sub = self.create_subscription(Twist, '/cmd_vel', self.cmd_callback, 10)

           self.timer = self.create_timer(0.05, self.publish_joint_state)  # 20 Hz

           self.x = 0.0
           self.y = 0.0
           self.theta = 0.0
           self.cmd_vel = Twist()

       def cmd_callback(self, msg):
           self.cmd_vel = msg

       def publish_joint_state(self):
           msg = JointState()
           msg.name = ['wheel_left_joint', 'wheel_right_joint']
           msg.position = [self.theta * 10, self.theta * 10]  # Simplified wheel rotation
           msg.velocity = [self.cmd_vel.linear.x, self.cmd_vel.linear.x]
           msg.header.stamp = self.get_clock().now().to_msg()
           msg.header.frame_id = 'base_link'

           self.joint_pub.publish(msg)

           # Update position based on command
           dt = 0.05  # 20 Hz
           self.x += self.cmd_vel.linear.x * math.cos(self.theta) * dt
           self.y += self.cmd_vel.linear.x * math.sin(self.theta) * dt
           self.theta += self.cmd_vel.angular.z * dt

   def main(args=None):
       rclpy.init(args=args)
       simulator = PhysicalRobotSimulator()
       rclpy.spin(simulator)
       simulator.destroy_node()
       rclpy.shutdown()

   if __name__ == '__main__':
       main()
   ```

2. Create a simple digital twin node:
   ```python
   # digital_twin_sim.py
   import rclpy
   from rclpy.node import Node
   from sensor_msgs.msg import JointState
   from geometry_msgs.msg import Twist

   class DigitalTwinSimulator(Node):
       def __init__(self):
           super().__init__('digital_twin_sim')

           self.joint_pub = self.create_publisher(JointState, '/twin_robot/joint_states', 10)
           self.joint_sub = self.create_subscription(
               JointState, '/physical_robot/joint_states', self.joint_callback, 10)
           self.cmd_pub = self.create_publisher(Twist, '/twin_cmd_vel', 10)

           self.timer = self.create_timer(0.05, self.update_twin)  # 20 Hz
           self.physical_joints = None

       def joint_callback(self, msg):
           self.physical_joints = msg

       def update_twin(self):
           if self.physical_joints is not None:
               # Publish synchronized joint states to twin
               twin_msg = JointState()
               twin_msg.name = self.physical_joints.name
               twin_msg.position = self.physical_joints.position
               twin_msg.velocity = self.physical_joints.velocity
               twin_msg.header.stamp = self.get_clock().now().to_msg()
               twin_msg.header.frame_id = 'twin_base_link'

               self.joint_pub.publish(twin_msg)

   def main(args=None):
       rclpy.init(args=args)
       twin_sim = DigitalTwinSimulator()
       rclpy.spin(twin_sim)
       twin_sim.destroy_node()
       rclpy.shutdown()

   if __name__ == '__main__':
       main()
   ```

3. Test the digital twin system:
   ```bash
   # Terminal 1: Start the physical robot simulator
   ros2 run my_package physical_robot_sim.py

   # Terminal 2: Start the digital twin
   ros2 run my_package digital_twin_sim.py

   # Terminal 3: Send commands and monitor
   ros2 topic pub /cmd_vel geometry_msgs/Twist '{linear: {x: 1.0}, angular: {z: 0.5}}'
   ros2 topic echo /physical_robot/joint_states
   ros2 topic echo /twin_robot/joint_states
   ```

### Verification Steps
- [ ] Physical robot simulator runs and publishes joint states
- [ ] Digital twin receives physical data and publishes synchronized data
- [ ] Both physical and twin joint states are visible and similar
- [ ] Commands to physical robot affect both systems

## Assessment Questions

1. What are the main differences between Gazebo and Unity for robotics simulation?
2. What is a Digital Twin and why is it important in robotics?
3. How does sensor simulation differ between Gazebo and Unity?
4. What are the key challenges in maintaining synchronization between physical and digital systems?
5. Explain the concept of "sim-to-real transfer" and its importance.
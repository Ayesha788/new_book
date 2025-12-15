# Chapter 6: Advanced Gazebo Concepts

## Overview

In this chapter, we'll dive deeper into advanced Gazebo simulation techniques. You'll learn how to create custom worlds, configure physics parameters, simulate sensors accurately, and build complex robot models for realistic simulation.

## Creating Custom Worlds

### World File Structure
A complete Gazebo world file includes:
- Environment models and objects
- Lighting configuration
- Physics engine parameters
- Initial conditions
- Plugins for additional functionality

### Example: Custom World with Multiple Objects
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="custom_world">
    <!-- Physics Configuration -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000.0</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>
    </physics>

    <!-- Lighting -->
    <light name="sun" type="directional">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
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
              <size>100 100</size>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.7 0.7 0.7 1</ambient>
            <diffuse>0.7 0.7 0.7 1</diffuse>
            <specular>0.0 0.0 0.0 1</specular>
          </material>
        </visual>
      </link>
    </model>

    <!-- Custom Objects -->
    <model name="table">
      <pose>2 0 0 0 0 0</pose>
      <link name="table_link">
        <collision name="collision">
          <geometry>
            <box>
              <size>1.0 0.8 0.8</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1.0 0.8 0.8</size>
            </box>
          </geometry>
          <material>
            <ambient>0.8 0.6 0.4 1</ambient>
            <diffuse>0.8 0.6 0.4 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Include a model from the database -->
    <include>
      <uri>model://cylinder</uri>
      <pose>0 1 0.5 0 0 0</pose>
    </include>
  </world>
</sdf>
```

## Physics Configuration

### Time Step and Update Rate
The physics simulation parameters significantly affect both accuracy and performance:

```xml
<physics type="ode">
  <!-- Smaller step size = more accurate but slower -->
  <max_step_size>0.001</max_step_size>

  <!-- How often physics is updated per second -->
  <real_time_update_rate>1000.0</real_time_update_rate>

  <!-- Target ratio of simulation time to real time -->
  <real_time_factor>1.0</real_time_factor>
</physics>
```

### Material Properties
Configure friction, restitution, and other physical properties:

```xml
<collision name="collision">
  <surface>
    <friction>
      <ode>
        <mu>1.0</mu>  <!-- Static friction coefficient -->
        <mu2>1.0</mu2>  <!-- Secondary friction coefficient -->
      </ode>
    </friction>
    <bounce>
      <restitution_coefficient>0.1</restitution_coefficient>  <!-- Bounciness -->
      <threshold>100000</threshold>  <!-- Velocity threshold for bouncing -->
    </bounce>
  </surface>
</collision>
```

## Sensor Simulation

### Camera Sensors
Simulate RGB cameras with realistic parameters:

```xml
<sensor name="camera" type="camera">
  <always_on>true</always_on>
  <update_rate>30</update_rate>
  <camera name="camera">
    <horizontal_fov>1.047</horizontal_fov>  <!-- Field of view in radians -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>R8G8B8</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>100</far>
    </clip>
  </camera>
  <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
    <frame_name>camera_frame</frame_name>
    <topic_name>camera/image_raw</topic_name>
  </plugin>
</sensor>
```

### LiDAR Sensors
Simulate 2D or 3D LiDAR with realistic noise models:

```xml
<sensor name="lidar" type="ray">
  <always_on>true</always_on>
  <update_rate>10</update_rate>
  <ray>
    <scan>
      <horizontal>
        <samples>720</samples>
        <resolution>1</resolution>
        <min_angle>-1.570796</min_angle>  <!-- -90 degrees -->
        <max_angle>1.570796</max_angle>   <!-- 90 degrees -->
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>30.0</max>
      <resolution>0.01</resolution>
    </range>
  </ray>
  <plugin name="lidar_controller" filename="libgazebo_ros_laser.so">
    <frame_name>lidar_frame</frame_name>
    <topic_name>scan</topic_name>
  </plugin>
</sensor>
```

### IMU Sensors
Simulate Inertial Measurement Units:

```xml
<sensor name="imu" type="imu">
  <always_on>true</always_on>
  <update_rate>100</update_rate>
  <imu>
    <angular_velocity>
      <x>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>2e-4</stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>2e-4</stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>2e-4</stddev>
        </noise>
      </z>
    </angular_velocity>
    <linear_acceleration>
      <x>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>1.7e-2</stddev>
        </noise>
      </x>
      <y>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>1.7e-2</stddev>
        </noise>
      </y>
      <z>
        <noise type="gaussian">
          <mean>0.0</mean>
          <stddev>1.7e-2</stddev>
        </noise>
      </z>
    </linear_acceleration>
  </imu>
</sensor>
```

## Advanced Robot Modeling

### Multi-Joint Robots
Create complex robots with multiple joints and actuators:

```xml
<?xml version="1.0" ?>
<robot name="advanced_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder length="0.5" radius="0.2"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.5" radius="0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10"/>
      <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0"/>
    </inertial>
  </link>

  <!-- Revolute Joint -->
  <joint name="arm_joint" type="revolute">
    <parent link="base_link"/>
    <child link="arm_link"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
  </joint>

  <!-- Child Link -->
  <link name="arm_link">
    <visual>
      <geometry>
        <box size="0.1 0.1 0.5"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.1 0.1 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Gazebo Plugin for Joint Control -->
  <gazebo>
    <plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
      <joint_name>arm_joint</joint_name>
    </plugin>
  </gazebo>
</robot>
```

## Gazebo Plugins for ROS 2 Integration

### Joint State Publisher
Publish joint states from simulation:

```xml
<gazebo>
  <plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
    <robot_param>robot_description</robot_param>
    <joint_name>arm_joint</joint_name>
    <update_rate>30</update_rate>
    <always_on>true</always_on>
  </plugin>
</gazebo>
```

### Diff Drive Controller
For differential drive robots:

```xml
<gazebo>
  <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
    <update_rate>30</update_rate>
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
    <wheel_separation>0.3</wheel_separation>
    <wheel_diameter>0.15</wheel_diameter>
    <max_wheel_torque>20</max_wheel_torque>
    <max_wheel_acceleration>1.0</max_wheel_acceleration>
    <command_topic>cmd_vel</command_topic>
    <odometry_topic>odom</odometry_topic>
    <odometry_frame>odom</odometry_frame>
    <robot_base_frame>base_link</robot_base_frame>
    <publish_odom>true</publish_odom>
    <publish_wheel_tf>true</publish_wheel_tf>
    <publish_odom_tf>true</publish_odom_tf>
  </plugin>
</gazebo>
```

## Performance Optimization

### Level of Detail (LOD)
Use different models based on distance for performance:

```xml
<visual name="lod_visual">
  <geometry>
    <mesh>
      <uri>model://complex_robot/meshes/complex.dae</uri>
    </mesh>
  </geometry>
  <level_of_detail>
    <range>10</range>
    <geometry>
      <mesh>
        <uri>model://complex_robot/meshes/simple.dae</uri>
      </mesh>
    </geometry>
  </level_of_detail>
</visual>
```

### Disable Unnecessary Features
For performance-critical simulations:

```xml
<world name="fast_world">
  <!-- Disable shadows for better performance -->
  <gui>
    <camera name="user_camera">
      <projection_type>perspective</projection_type>
    </camera>
  </gui>

  <!-- Simplified physics for faster simulation -->
  <physics type="ode">
    <max_step_size>0.01</max_step_size>  <!-- Larger steps = faster but less accurate -->
    <real_time_update_rate>100.0</real_time_update_rate>
  </physics>
</world>
```

## Practical Example: Creating a Warehouse Environment

Let's create a more complex environment for robot navigation:

1. **Create the world file** (`warehouse.world`):
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="warehouse">
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

    <!-- Warehouse floor -->
    <model name="floor">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>20 20 0.1</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>20 20 0.1</size></box>
          </geometry>
          <material><ambient>0.5 0.5 0.5 1</ambient></material>
        </visual>
      </link>
    </model>

    <!-- Warehouse walls -->
    <model name="wall_1">
      <pose>0 10 1 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 2</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 2</size></box></geometry>
          <material><ambient>0.3 0.3 0.3 1</ambient></material>
        </visual>
      </link>
    </model>

    <!-- Add more walls, shelves, and obstacles as needed -->
  </world>
</sdf>
```

2. **Launch with custom world**:
```bash
ros2 launch gazebo_ros empty_world.launch.py world_name:=path/to/warehouse.world
```

## Debugging Simulation Issues

### Common Problems and Solutions
1. **Robot falls through the ground**: Check collision geometry and mass properties
2. **Joints behave erratically**: Verify joint limits and friction parameters
3. **Simulation runs too slow**: Increase time step or simplify models
4. **Sensors don't publish data**: Check plugin configuration and topic names

### Debugging Tools
```bash
# Monitor simulation performance
gz stats

# Check model states
ros2 topic echo /model_states

# Visualize transforms
ros2 run tf2_tools view_frames
```

## Chapter Summary

In this chapter, you learned:
- How to create custom Gazebo world files with complex environments
- Advanced physics configuration for realistic simulation
- How to simulate various sensor types (camera, LiDAR, IMU)
- Techniques for modeling complex robots with multiple joints
- Performance optimization strategies for large simulations
- Best practices for debugging simulation issues

Advanced Gazebo simulation allows you to create highly realistic testing environments for your robots. This is crucial for developing robust robotics applications that can handle real-world conditions before deployment.

## Practice Tasks

1. Create a custom world file with multiple objects and lighting
2. Add a camera sensor to your robot model and verify it publishes images
3. Configure physics parameters to achieve a balance between accuracy and performance
4. Create a simple navigation scenario with obstacles and goals
5. Implement a LiDAR sensor on your robot and test obstacle detection

## Next Steps

In the next chapter, we'll explore Unity as an alternative simulation environment, focusing on its advantages for high-fidelity graphics and physics simulation, particularly for humanoid robotics applications.
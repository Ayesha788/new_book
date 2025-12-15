# Chapter 7: Unity for Robotics Simulation

## Overview

Welcome to the Unity section of our simulation module! Unity is a powerful game engine that has become increasingly popular for robotics simulation, especially for humanoid robots and applications requiring high-fidelity graphics. In this chapter, we'll explore how Unity can be used for robotics simulation and its unique advantages.

## Introduction to Unity for Robotics

Unity is a cross-platform game engine that provides:
- **High-Fidelity Graphics**: Photorealistic rendering capabilities
- **Advanced Physics**: Built-in physics engine with realistic collision detection
- **Extensive Asset Store**: Thousands of pre-built models and environments
- **Cross-Platform Deployment**: Runs on Windows, Mac, Linux, and mobile platforms
- **Large Community**: Extensive documentation and community support

### Why Use Unity for Robotics?

While Gazebo is excellent for physics-based simulation, Unity offers unique advantages:
- **Visual Fidelity**: More realistic rendering for computer vision tasks
- **Game-Like Environments**: Great for training AI in game-like scenarios
- **User Interface**: Intuitive visual editor for scene creation
- **Asset Integration**: Easy import of 3D models and environments
- **Performance**: Optimized for real-time rendering with many objects

## Setting Up Unity for Robotics

### Installing Unity Hub and Unity Editor
1. Download Unity Hub from the Unity website
2. Install Unity Hub and create an account
3. Use Unity Hub to install Unity Editor (2021.3 LTS or newer recommended)
4. Install Unity Robotics Hub package for robotics-specific tools

### Unity Robotics Package
Unity provides the Unity Robotics Hub which includes:
- **ROS#**: Bridge between Unity and ROS/ROS 2
- **Unity Perception**: Tools for generating synthetic training data
- **ML-Agents**: Framework for training AI agents
- **Robotics Examples**: Sample scenes and robots

## Unity Scene Structure

### Basic Components
A Unity robotics scene typically includes:
- **Main Camera**: The robot's perspective or observer view
- **Lighting**: Directional lights to simulate real-world lighting
- **Environment**: Ground planes, walls, obstacles
- **Robot Model**: 3D model of the robot with joints and actuators
- **Sensors**: Camera, LiDAR, and other sensor components

### GameObjects and Components
In Unity, everything is a GameObject with various Components:
- **Transform**: Position, rotation, and scale
- **Mesh Renderer**: Visual representation
- **Collider**: Physics interaction
- **Rigidbody**: Physics simulation properties
- **Scripts**: Custom behavior and ROS communication

## Creating Your First Unity Robotics Scene

### Basic Robot Setup
1. **Create a new 3D project** in Unity
2. **Import robot model** (in FBX, OBJ, or other 3D formats)
3. **Set up the scene hierarchy**:
   ```
   Robot
   ├── BaseLink
   ├── Wheel_Left
   ├── Wheel_Right
   └── Camera
   ```

### Example Robot Controller Script (C#)
```csharp
using UnityEngine;
using System.Collections;

public class RobotController : MonoBehaviour
{
    public float linearVelocity = 1.0f;
    public float angularVelocity = 1.0f;

    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        // Simple differential drive simulation
        float forward = Input.GetAxis("Vertical") * linearVelocity;
        float turn = Input.GetAxis("Horizontal") * angularVelocity;

        // Apply movement (in a real ROS integration, this would come from cmd_vel)
        Vector3 movement = transform.forward * forward * Time.deltaTime;
        transform.position += movement;

        transform.Rotate(Vector3.up, turn * Time.deltaTime);
    }
}
```

## Unity ROS Bridge (ROS#)

### Installing ROS#
ROS# is a Unity package that enables communication between Unity and ROS/ROS 2:
1. Import the ROS# package into your Unity project
2. Add ROSConnection component to your scene
3. Configure IP address and port to match your ROS setup

### Example ROS Communication Script
```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry;

public class UnityRobotController : MonoBehaviour
{
    ROSConnection ros;
    string robotName = "unity_robot";

    void Start()
    {
        ros = ROSConnection.instance;
    }

    void Update()
    {
        // Publish joint states
        if (Time.time % 0.1f < Time.deltaTime) // Publish every 0.1 seconds
        {
            // Example: publish a simple message
            ros.Send<Unity.Robotics.ROSTCPConnector.MessageTypes.Std.StringMsg>(
                "unity_status",
                new Unity.Robotics.ROSTCPConnector.MessageTypes.Std.StringMsg("Robot is running"));
        }
    }

    void OnMessageReceived(Unity.Robotics.ROSTCPConnector.MessageTypes.Geometry.Twist msg)
    {
        // Handle velocity commands from ROS
        Vector3 linear = new Vector3((float)msg.linear.x, (float)msg.linear.y, (float)msg.linear.z);
        Vector3 angular = new Vector3((float)msg.angular.x, (float)msg.angular.y, (float)msg.angular.z);

        // Apply movement to robot
        transform.Translate(linear * Time.deltaTime);
        transform.Rotate(angular * Time.deltaTime);
    }
}
```

## Implementing Sensors in Unity

### Camera Sensor
Unity cameras can simulate RGB, depth, and semantic segmentation:
```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor;

public class UnityCameraSensor : MonoBehaviour
{
    public Camera camera;
    public string topicName = "camera/image_raw";
    public int imageWidth = 640;
    public int imageHeight = 480;

    private ROSConnection ros;
    private RenderTexture renderTexture;

    void Start()
    {
        ros = ROSConnection.instance;
        renderTexture = new RenderTexture(imageWidth, imageHeight, 24);
        camera.targetTexture = renderTexture;
    }

    void Update()
    {
        // Capture and publish image periodically
        if (Time.time % 0.1f < Time.deltaTime) // 10 Hz
        {
            Texture2D image = CaptureImage();
            // Convert and publish to ROS topic
        }
    }

    Texture2D CaptureImage()
    {
        RenderTexture.active = renderTexture;
        Texture2D image = new Texture2D(renderTexture.width, renderTexture.height);
        image.ReadPixels(new Rect(0, 0, renderTexture.width, renderTexture.height), 0, 0);
        image.Apply();
        RenderTexture.active = null;
        return image;
    }
}
```

### LiDAR Simulation
Unity can simulate LiDAR using raycasting:
```csharp
using UnityEngine;
using System.Collections.Generic;

public class UnityLidar : MonoBehaviour
{
    public int rayCount = 720;
    public float maxDistance = 30.0f;
    public float fieldOfView = 360.0f;

    private List<float> ranges;

    void Start()
    {
        ranges = new List<float>(new float[rayCount]);
    }

    void Update()
    {
        SimulateLidar();
    }

    void SimulateLidar()
    {
        float angleStep = fieldOfView / rayCount;

        for (int i = 0; i < rayCount; i++)
        {
            float angle = (i * angleStep) * Mathf.Deg2Rad;
            Vector3 direction = new Vector3(
                Mathf.Cos(angle),
                0,
                Mathf.Sin(angle)
            );

            RaycastHit hit;
            if (Physics.Raycast(transform.position, transform.TransformDirection(direction), out hit, maxDistance))
            {
                ranges[i] = hit.distance;
            }
            else
            {
                ranges[i] = maxDistance;
            }
        }
    }
}
```

## Unity Perception Package

The Unity Perception package enables:
- **Synthetic Data Generation**: Create labeled training data for AI
- **Sensor Simulation**: Accurate simulation of various sensors
- **Annotation Tools**: Automatic generation of ground truth data

### Synthetic Data Generation
```csharp
using UnityEngine;
using Unity.Perception.GroundTruth;

public class PerceptionCameraSetup : MonoBehaviour
{
    void Start()
    {
        // Add perception camera component
        var perceptionCamera = gameObject.AddComponent<PerceptionCamera>();

        // Add segmentation labels
        var labeler = gameObject.AddComponent<BoxLabeler>();
        labeler.label = "robot";
    }
}
```

## ML-Agents Integration

Unity ML-Agents allows training AI agents in simulation:
1. Install ML-Agents package
2. Create an Agent class that inherits from Unity.MLAgents.Agent
3. Define observations, actions, and rewards
4. Train using Python API

### Example Agent Script
```csharp
using Unity.MLAgents;
using Unity.MLAgents.Sensors;
using Unity.MLAgents.Actuators;

public class UnityRobotAgent : Agent
{
    public override void OnEpisodeBegin()
    {
        // Reset environment at start of episode
        transform.position = new Vector3(0, 0, 0);
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Add observations about robot state
        sensor.AddObservation(transform.position);
        sensor.AddObservation(transform.rotation);
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        // Process actions from neural network
        float forward = actions.ContinuousActions[0];
        float turn = actions.ContinuousActions[1];

        transform.Translate(Vector3.forward * forward * Time.deltaTime);
        transform.Rotate(Vector3.up, turn * Time.deltaTime);

        // Add reward for desired behavior
        SetReward(0.1f); // Small positive reward for staying alive
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        // For manual control during testing
        var continuousActionsOut = actionsOut.ContinuousActions;
        continuousActionsOut[0] = Input.GetAxis("Vertical");
        continuousActionsOut[1] = Input.GetAxis("Horizontal");
    }
}
```

## Creating a Unity Robotics Project

### Step-by-Step Setup
1. **Create new Unity 3D project**
2. **Import required packages**:
   - Unity Robotics Hub
   - Unity Perception (optional)
   - ML-Agents (optional)

3. **Set up the scene**:
   - Add a plane for the ground
   - Add lighting (directional light)
   - Import robot model
   - Add sensors (cameras, raycasters)

4. **Configure physics**:
   - Set appropriate mass for robot parts
   - Configure colliders for interaction
   - Adjust physics settings in Project Settings

### Example Scene Setup
```
Scene Hierarchy:
├── Robot
│   ├── Base (Rigidbody, Collider)
│   ├── Wheels (Rigidbody, Collider, Joint)
│   └── Camera (Camera, Sensor Script)
├── Environment
│   ├── Ground (Static Collider)
│   ├── Walls (Static Colliders)
│   └── Obstacles (Colliders)
├── Lighting
│   └── Directional Light
└── ROSConnection (Singleton for ROS communication)
```

## Performance Considerations

### Optimization Tips
1. **Use Occlusion Culling**: Hide objects not in camera view
2. **Level of Detail (LOD)**: Use simpler models when far from camera
3. **Baking Lighting**: Pre-calculate static lighting for better performance
4. **Object Pooling**: Reuse objects instead of instantiating/destroying
5. **Physics Optimization**: Use appropriate fixed timestep (0.02 recommended)

### Unity vs Gazebo Comparison
| Aspect | Unity | Gazebo |
|--------|-------|--------|
| Graphics Quality | Excellent | Good |
| Physics Accuracy | Good | Excellent |
| ROS Integration | Good (ROS#) | Excellent (native) |
| Learning Curve | Moderate | Moderate |
| Performance | High FPS | Variable |
| Asset Availability | Excellent | Good |

## Practical Example: Unity Navigation Environment

Let's create a simple navigation scenario:

1. **Create the scene structure**:
   - Ground plane with textures
   - Random obstacles
   - Start and goal positions
   - Robot with differential drive

2. **Implement navigation logic**:
   - Path planning visualization
   - Obstacle avoidance
   - Goal detection

3. **Connect to ROS**:
   - Subscribe to /cmd_vel
   - Publish /odom and /scan
   - Publish /tf transforms

## Debugging Unity Robotics Projects

### Common Issues
1. **Connection Problems**: Check IP addresses and firewall settings
2. **Performance Issues**: Monitor frame rate and adjust settings
3. **Physics Issues**: Verify mass, friction, and collision settings
4. **Sensor Accuracy**: Validate sensor readings against expected values

### Debugging Tools
- Unity Profiler: Monitor performance
- Scene View: Visualize transforms and colliders
- Console: Check for errors and warnings
- External tools: ROS tools for message inspection

## Chapter Summary

In this chapter, you learned:
- How Unity differs from Gazebo and when to use each
- How to set up Unity for robotics applications
- How to create basic robot models and scenes in Unity
- How to implement sensors (camera, LiDAR) in Unity
- How to connect Unity to ROS using ROS#
- How to use Unity Perception and ML-Agents packages
- Performance optimization techniques for Unity robotics

Unity provides an excellent platform for high-fidelity simulation, especially when visual quality is important for computer vision tasks or when photorealistic environments are needed. Combined with Gazebo, you now have two powerful simulation tools for different aspects of robotics development.

## Practice Tasks

1. Install Unity and create a simple scene with a robot model
2. Add a camera sensor to the robot and verify it captures images
3. Implement basic movement control for the robot
4. Create a simple navigation environment with obstacles
5. Explore the Unity Perception package and generate synthetic data

## Next Steps

In the next chapter, we'll explore the concept of Digital Twins and how they bridge the gap between simulation and reality, providing a framework for continuous learning and improvement in robotics systems.
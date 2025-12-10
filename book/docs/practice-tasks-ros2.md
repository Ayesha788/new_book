# Practice Tasks: ROS 2 Fundamentals

Complete these hands-on exercises to reinforce your understanding of ROS 2 fundamentals.

## Task 1: Custom Message Creation

**Objective**: Create a custom message type for humanoid robot commands.

1. Create a new ROS 2 package called `humanoid_msgs`
2. Define a custom message `HumanoidCommand.msg` with the following fields:
   - `string robot_name`
   - `float64[] joint_positions`
   - `float64[] joint_velocities`
   - `string action` (e.g., "walk", "stand", "sit")
3. Build the package and verify the message is generated correctly
4. Create a publisher and subscriber that use this custom message

**Expected Outcome**: You should be able to send humanoid robot commands using your custom message type.

## Task 2: Action Server Implementation

**Objective**: Implement an action server for humanoid robot walking.

1. Create an action definition `Walk.action` with:
   - Goal: `float64 distance`, `float64 speed`
   - Result: `bool success`, `string message`
   - Feedback: `float64 distance_traveled`, `float64 remaining_distance`
2. Implement an action server that simulates walking behavior
3. Create an action client that sends walking commands
4. Test the action server with different distances

**Expected Outcome**: The action server should provide feedback during execution and return a result when complete.

## Task 3: Parameter Server Usage

**Objective**: Use ROS 2 parameters to configure robot behavior.

1. Create a node that uses parameters for robot configuration:
   - `max_velocity` (double)
   - `robot_name` (string)
   - `joint_limits` (double array)
2. Set parameters at launch time using a YAML file
3. Implement parameter callbacks to handle dynamic reconfiguration
4. Create a launch file that loads parameters from a file

**Expected Outcome**: The node should properly load and respond to parameter changes.

## Task 4: URDF Enhancement

**Objective**: Enhance the basic humanoid URDF model.

1. Add joint limits to all joints in your URDF
2. Include visual and collision properties for each link
3. Add transmission elements for ROS 2 control
4. Include a material definition file for consistent coloring
5. Verify the model in RViz

**Expected Outcome**: A more realistic humanoid robot model with proper joint constraints.

## Task 5: TF Transform Tree

**Objective**: Work with coordinate transforms in ROS 2.

1. Create a node that publishes transforms for your humanoid robot
2. Set up a transform tree with base_link, torso, head, arms, and legs
3. Use tf2 to query transforms between different parts of the robot
4. Visualize the transform tree in RViz

**Expected Outcome**: A complete transform tree that allows for spatial relationships between robot parts.

## Task 6: Service Integration

**Objective**: Create and use ROS 2 services for robot control.

1. Define a service `SetJointPosition.srv` with request/response fields
2. Implement a service server that moves robot joints to specified positions
3. Create a service client that calls the service with different joint positions
4. Add error handling for invalid joint positions

**Expected Outcome**: A service-based interface for precise joint control.

## Task 7: Launch File Complex Setup

**Objective**: Create a complex launch file for multiple robot nodes.

1. Create a launch file that starts:
   - Joint state publisher
   - Robot state publisher
   - Your humanoid controller
   - A simple sensor node
2. Use launch arguments to configure different robot instances
3. Add conditional node launching based on parameters
4. Include parameter loading and remapping

**Expected Outcome**: A complete robot system launched with a single command.

## Verification Checklist

After completing each task, verify:

- [ ] All nodes start without errors
- [ ] Messages/services/actions work as expected
- [ ] Parameters are properly loaded and used
- [ ] URDF model displays correctly in RViz
- [ ] Transform frames are properly published
- [ ] Launch files execute correctly
- [ ] Code follows ROS 2 best practices
- [ ] Proper error handling is implemented

## Solutions

Solutions to these practice tasks can be found in the `solutions/` directory of this repository.
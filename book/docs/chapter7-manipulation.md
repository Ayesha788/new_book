# Chapter 7: Manipulation and Grasping for Humanoid Robots

## Introduction to Manipulation in Humanoid Robots

Manipulation is a fundamental capability for humanoid robots, enabling them to interact with objects in their environment. Unlike specialized manipulators, humanoid robots must coordinate manipulation tasks with balance and locomotion, making it a complex multi-constraint problem.

## Kinematics for Humanoid Arms

### Forward and Inverse Kinematics

Humanoid robots typically have 7-DOF arms similar to human arms, requiring sophisticated kinematic solutions:

```python
import numpy as np
from scipy.spatial.transform import Rotation as R

class HumanoidArmKinematics:
    def __init__(self, joint_limits=None):
        # DH parameters for a typical humanoid arm
        # [a, alpha, d, theta_offset]
        self.dh_params = [
            [0, np.pi/2, 0, 0],           # Shoulder joint 1
            [0, -np.pi/2, 0, np.pi/2],    # Shoulder joint 2
            [0, np.pi/2, 0, 0],           # Shoulder joint 3
            [0, -np.pi/2, 0.3, 0],        # Elbow joint
            [0, np.pi/2, 0, 0],           # Wrist joint 1
            [0, -np.pi/2, 0.25, 0],       # Wrist joint 2
            [0, 0, 0.05, 0]               # Wrist joint 3
        ]

        self.joint_limits = joint_limits or [
            [-2.0, 2.0],    # Shoulder 1
            [-2.0, 1.5],    # Shoulder 2
            [-2.0, 2.0],    # Shoulder 3
            [-3.0, 0.5],    # Elbow
            [-2.0, 2.0],    # Wrist 1
            [-1.0, 1.0],    # Wrist 2
            [-2.0, 2.0]     # Wrist 3
        ]

    def dh_transform(self, a, alpha, d, theta):
        """Compute DH transformation matrix"""
        return np.array([
            [np.cos(theta), -np.sin(theta)*np.cos(alpha), np.sin(theta)*np.sin(alpha), a*np.cos(theta)],
            [np.sin(theta), np.cos(theta)*np.cos(alpha), -np.cos(theta)*np.sin(alpha), a*np.sin(theta)],
            [0, np.sin(alpha), np.cos(alpha), d],
            [0, 0, 0, 1]
        ])

    def forward_kinematics(self, joint_angles):
        """Compute end-effector pose from joint angles"""
        T = np.eye(4)

        for i, (a, alpha, d, theta_offset) in enumerate(self.dh_params):
            theta = joint_angles[i] + theta_offset
            T_link = self.dh_transform(a, alpha, d, theta)
            T = T @ T_link

        return T

    def inverse_kinematics(self, target_pose, current_joints, max_iterations=100, tolerance=1e-4):
        """Solve inverse kinematics using Jacobian transpose method"""
        joints = current_joints.copy()

        for iteration in range(max_iterations):
            # Compute current end-effector pose
            current_pose = self.forward_kinematics(joints)

            # Compute error
            pos_error = target_pose[:3, 3] - current_pose[:3, 3]
            rot_error = R.from_matrix(
                current_pose[:3, :3].T @ target_pose[:3, :3]
            ).as_rotvec()

            error = np.concatenate([pos_error, rot_error])

            if np.linalg.norm(error) < tolerance:
                break

            # Compute Jacobian
            J = self.compute_jacobian(joints)

            # Update joints using Jacobian transpose
            joint_delta = 0.1 * J.T @ error
            joints += joint_delta

            # Apply joint limits
            for i in range(len(joints)):
                joints[i] = np.clip(joints[i], self.joint_limits[i][0], self.joint_limits[i][1])

        return joints

    def compute_jacobian(self, joint_angles):
        """Compute geometric Jacobian"""
        J = np.zeros((6, len(joint_angles)))

        current_transform = np.eye(4)
        end_effector_pose = self.forward_kinematics(joint_angles)

        for i, (a, alpha, d, theta_offset) in enumerate(self.dh_params):
            theta = joint_angles[i] + theta_offset
            T_link = self.dh_transform(a, alpha, d, theta)
            current_transform = current_transform @ T_link

            # Z-axis of current joint
            z_axis = current_transform[:3, 2]
            # Position from current joint to end effector
            r = end_effector_pose[:3, 3] - current_transform[:3, 3]

            # Linear velocity component
            J[:3, i] = np.cross(z_axis, r)
            # Angular velocity component
            J[3:, i] = z_axis

        return J
```

## Grasp Planning and Execution

### Grasp Pose Generation

```python
import open3d as o3d
import numpy as np

class GraspPlanner:
    def __init__(self):
        self.approach_distance = 0.1  # Distance to approach object
        self.grasp_width_range = [0.02, 0.15]  # Min/max grasp width

    def generate_grasp_poses(self, object_mesh, approach_directions=None):
        """Generate potential grasp poses for an object"""
        if approach_directions is None:
            # Default approach directions (front, side, top)
            approach_directions = [
                [1, 0, 0],   # Front approach
                [-1, 0, 0],  # Back approach
                [0, 1, 0],   # Side approach
                [0, -1, 0],  # Opposite side
                [0, 0, 1]    # Top approach
            ]

        grasp_poses = []

        # Sample points on the object surface
        surface_points = self.sample_surface_points(object_mesh)

        for point in surface_points:
            for approach_dir in approach_directions:
                # Generate grasp pose
                grasp_pose = self.create_grasp_pose(point, approach_dir)

                # Check if grasp is feasible
                if self.is_grasp_feasible(grasp_pose, object_mesh):
                    grasp_poses.append(grasp_pose)

        return grasp_poses

    def sample_surface_points(self, mesh, num_points=100):
        """Sample points on the mesh surface"""
        pcd = mesh.sample_points_uniformly(number_of_points=num_points)
        return np.asarray(pcd.points)

    def create_grasp_pose(self, contact_point, approach_direction):
        """Create a grasp pose from contact point and approach direction"""
        # Normalize approach direction
        approach = np.array(approach_direction) / np.linalg.norm(approach_direction)

        # Create orthogonal axes for the grasp frame
        # For now, assume a simple orientation
        z_axis = -approach  # Grasp direction (opposite to approach)

        # Create an arbitrary orthogonal x-axis
        if abs(z_axis[2]) < 0.9:
            x_axis = np.cross(z_axis, [0, 0, 1])
        else:
            x_axis = np.cross(z_axis, [1, 0, 0])
        x_axis = x_axis / np.linalg.norm(x_axis)

        y_axis = np.cross(z_axis, x_axis)

        # Create rotation matrix
        R_grasp = np.column_stack([x_axis, y_axis, z_axis])

        # Position is the contact point moved back by approach distance
        position = contact_point - approach * self.approach_distance

        # Create transformation matrix
        T = np.eye(4)
        T[:3, :3] = R_grasp
        T[:3, 3] = position

        return T

    def is_grasp_feasible(self, grasp_pose, object_mesh):
        """Check if a grasp pose is geometrically feasible"""
        # Check grasp width constraints
        # Check collision with environment
        # Check accessibility of the robot
        return True  # Simplified for example
```

## Multi-Fingered Hand Control

### Grasp Force Optimization

```python
class MultiFingeredHandController:
    def __init__(self, num_fingers=5):
        self.num_fingers = num_fingers
        self.finger_positions = np.zeros(num_fingers)  # Joint positions
        self.finger_forces = np.zeros(num_fingers)     # Applied forces

    def compute_grasp_forces(self, object_weight, object_com, contact_points):
        """
        Compute optimal finger forces to grasp an object
        """
        # Object properties
        gravity_force = np.array([0, 0, -object_weight * 9.81])

        # Set up force equilibrium equations
        # Sum of forces = 0
        # Sum of torques = 0

        # For each contact point, we have friction constraints
        # Force must be within friction cone

        # Simplified: distribute weight equally among contact points
        num_contacts = len(contact_points)
        if num_contacts > 0:
            force_per_contact = object_weight * 9.81 / num_contacts
            return np.full(num_contacts, force_per_contact)
        else:
            return np.array([])

    def grasp_object(self, grasp_pose, object_properties):
        """Execute a grasp with optimal forces"""
        # Move to pre-grasp position
        pre_grasp_pose = grasp_pose.copy()
        pre_grasp_pose[2, 3] += 0.05  # Move 5cm above grasp point

        # Execute pre-grasp motion
        self.move_to_pose(pre_grasp_pose)

        # Move to grasp position
        self.move_to_pose(grasp_pose)

        # Compute and apply grasp forces
        grasp_forces = self.compute_grasp_forces(
            object_properties['weight'],
            object_properties['center_of_mass'],
            object_properties['contact_points']
        )

        self.apply_forces(grasp_forces)

        # Lift object
        lift_pose = grasp_pose.copy()
        lift_pose[2, 3] += 0.1  # Lift 10cm
        self.move_to_pose(lift_pose)

    def move_to_pose(self, pose):
        """Move hand to specified pose"""
        # Implementation depends on robot hardware
        pass

    def apply_forces(self, forces):
        """Apply specified forces to fingers"""
        # Implementation depends on hand design
        pass
```

## Grasp Stability and Learning

### Grasp Quality Metrics

```python
class GraspQualityEvaluator:
    def __init__(self):
        pass

    def evaluate_grasp_quality(self, grasp_pose, object_mesh, contact_points, friction_coeff=0.8):
        """
        Evaluate the quality of a grasp based on multiple metrics
        """
        quality_metrics = {}

        # 1. Force closure (ability to resist arbitrary wrenches)
        quality_metrics['force_closure'] = self.check_force_closure(contact_points, friction_coeff)

        # 2. Grasp isotropy (uniform resistance in all directions)
        quality_metrics['isotropy'] = self.compute_isotropy_index(contact_points)

        # 3. Volume of the grasp wrench space
        quality_metrics['wrench_space_volume'] = self.compute_wrench_space_volume(
            contact_points, friction_coeff
        )

        # 4. Resistance to object weight
        quality_metrics['weight_resistance'] = self.compute_weight_resistance(
            grasp_pose, contact_points
        )

        # Overall quality score (weighted combination)
        weights = {
            'force_closure': 0.3,
            'isotropy': 0.2,
            'wrench_space_volume': 0.3,
            'weight_resistance': 0.2
        }

        overall_quality = sum(
            weights[key] * value for key, value in quality_metrics.items()
        )

        quality_metrics['overall'] = overall_quality

        return quality_metrics

    def check_force_closure(self, contact_points, friction_coeff):
        """
        Check if the grasp provides force closure
        """
        # For 3D grasping, we need at least 7 contact points for force closure
        # Or specific arrangements of fewer points
        if len(contact_points) >= 7:
            return 1.0  # High probability of force closure
        elif len(contact_points) >= 3:
            # Check specific geometric arrangements
            return 0.7
        else:
            return 0.3  # Low probability of force closure

    def compute_isotropy_index(self, contact_points):
        """
        Compute how uniformly the grasp resists forces in different directions
        """
        # Calculate the grasp matrix and its condition number
        # Lower condition number indicates better isotropy
        if len(contact_points) < 3:
            return 0.0

        # Simplified isotropy calculation
        # In practice, this would involve the grasp matrix
        return 0.6  # Placeholder value

    def compute_wrench_space_volume(self, contact_points, friction_coeff):
        """
        Compute the volume of the wrench space that can be resisted
        """
        # This is a complex calculation involving the grasp matrix
        # and friction cones
        return 0.8  # Placeholder value

    def compute_weight_resistance(self, grasp_pose, contact_points):
        """
        Compute how well the grasp resists the object's weight
        """
        # Calculate if the grasp can resist gravitational forces
        # based on contact positions and friction
        return 0.9  # Placeholder value
```

## Integration with Robot Control

### ROS 2 Manipulation Interface

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from sensor_msgs.msg import JointState
from std_msgs.msg import String
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint

class ManipulationController(Node):
    def __init__(self):
        super().__init__('manipulation_controller')

        # Publishers and subscribers
        self.joint_cmd_pub = self.create_publisher(
            JointTrajectory,
            '/arm_controller/joint_trajectory',
            10
        )

        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )

        self.grasp_cmd_sub = self.create_subscription(
            PoseStamped,
            '/grasp_target',
            self.grasp_callback,
            10
        )

        # Internal state
        self.current_joints = None
        self.arm_kinematics = HumanoidArmKinematics()
        self.grasp_planner = GraspPlanner()

        self.get_logger().info('Manipulation controller initialized')

    def joint_state_callback(self, msg):
        """Update current joint positions"""
        self.current_joints = np.array(msg.position[-7:])  # Last 7 joints for arm

    def grasp_callback(self, msg):
        """Handle grasp command"""
        if self.current_joints is None:
            self.get_logger().warn('No joint state available')
            return

        # Convert target pose to transformation matrix
        target_pose = self.pose_to_matrix(msg.pose)

        # Solve inverse kinematics
        joint_goals = self.arm_kinematics.inverse_kinematics(
            target_pose,
            self.current_joints
        )

        # Publish joint trajectory
        self.execute_trajectory(joint_goals)

    def pose_to_matrix(self, pose):
        """Convert ROS Pose to 4x4 transformation matrix"""
        matrix = np.eye(4)

        # Position
        matrix[0, 3] = pose.position.x
        matrix[1, 3] = pose.position.y
        matrix[2, 3] = pose.position.z

        # Orientation (convert quaternion to rotation matrix)
        import tf_transformations as tf
        q = [pose.orientation.x, pose.orientation.y,
             pose.orientation.z, pose.orientation.w]
        matrix[:3, :3] = tf.quaternion_matrix(q)[:3, :3]

        return matrix

    def execute_trajectory(self, joint_goals):
        """Execute joint trajectory to reach target"""
        trajectory = JointTrajectory()
        trajectory.joint_names = [
            'shoulder_pitch', 'shoulder_roll', 'shoulder_yaw',
            'elbow_pitch', 'wrist_pitch', 'wrist_yaw', 'wrist_roll'
        ]

        point = JointTrajectoryPoint()
        point.positions = joint_goals.tolist()
        point.time_from_start.sec = 2  # 2 seconds to reach goal
        point.time_from_start.nanosec = 0

        trajectory.points = [point]

        self.joint_cmd_pub.publish(trajectory)
```

## Grasp Learning and Adaptation

### Reinforcement Learning for Grasp Improvement

```python
import torch
import torch.nn as nn
import numpy as np

class GraspPolicyNetwork(nn.Module):
    def __init__(self, state_dim=20, action_dim=7):
        super(GraspPolicyNetwork, self).__init__()

        self.network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
            nn.Tanh()  # Output actions between -1 and 1
        )

    def forward(self, state):
        return self.network(state)

class GraspLearner:
    def __init__(self):
        self.policy_network = GraspPolicyNetwork()
        self.optimizer = torch.optim.Adam(self.policy_network.parameters(), lr=0.001)
        self.replay_buffer = []

    def get_grasp_action(self, state):
        """Get grasp action from current policy"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action = self.policy_network(state_tensor)
        return action.squeeze(0).detach().numpy()

    def update_policy(self, states, actions, rewards, next_states):
        """Update policy using collected experiences"""
        states = torch.FloatTensor(states)
        actions = torch.FloatTensor(actions)
        rewards = torch.FloatTensor(rewards).unsqueeze(1)

        # Compute predicted Q values
        predicted_actions = self.policy_network(states)

        # Compute loss (negative reward for bad grasps, positive for good)
        loss = -torch.mean(rewards * torch.sum((actions - predicted_actions)**2, dim=1))

        # Update network
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        return loss.item()
```

## Challenges in Humanoid Manipulation

### Balance-Grasp Coordination

Humanoid robots must coordinate manipulation with balance:

- Whole-body control that considers both manipulation and balance
- Dynamic weight shifting during manipulation tasks
- Recovery strategies when manipulation affects balance

### Real-time Grasp Planning

Challenges in real-time grasp planning:

- Fast collision checking
- Efficient grasp quality evaluation
- Handling dynamic environments

### Multi-modal Sensing

Integrating different sensory modalities:

- Vision-based grasp planning
- Tactile feedback during grasp execution
- Force control for safe interaction

## Practice Tasks

1. Implement inverse kinematics for a humanoid arm using multiple methods
2. Create a grasp planner that works with point cloud data
3. Develop a grasp quality evaluator for different object shapes
4. Integrate manipulation with balance control in simulation
5. Test grasping algorithms on various object types and sizes

## Summary

Manipulation and grasping are essential capabilities for humanoid robots to interact with their environment. By combining kinematic solutions, grasp planning algorithms, and learning techniques, humanoid robots can perform complex manipulation tasks while maintaining balance and safety.
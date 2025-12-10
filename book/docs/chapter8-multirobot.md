# Chapter 8: Multi-Robot Coordination for Humanoid Systems

## Introduction to Multi-Robot Systems

Multi-robot coordination involves multiple autonomous robots working together to achieve common goals. In the context of humanoid robotics, this presents unique challenges due to the complexity of individual robots and their anthropomorphic nature, which makes them suitable for human-centered environments.

## Coordination Architectures

### Centralized vs. Decentralized Coordination

Multi-robot systems can be organized using different coordination architectures, each with specific advantages for humanoid robot teams:

```python
import numpy as np
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional

class CoordinationType(Enum):
    CENTRALIZED = "centralized"
    DECENTRALIZED = "decentralized"
    HYBRID = "hybrid"

@dataclass
class RobotState:
    robot_id: str
    position: np.ndarray  # [x, y, z]
    orientation: np.ndarray  # [roll, pitch, yaw]
    status: str  # idle, moving, working, etc.
    battery_level: float
    task_queue: List[str]

class CentralizedCoordinator:
    def __init__(self):
        self.robots: Dict[str, RobotState] = {}
        self.tasks = []
        self.communication_range = 10.0  # meters

    def register_robot(self, robot_state: RobotState):
        """Register a robot with the central coordinator"""
        self.robots[robot_state.robot_id] = robot_state

    def assign_task(self, robot_id: str, task: str):
        """Assign a task to a specific robot"""
        if robot_id in self.robots:
            self.robots[robot_id].task_queue.append(task)
            return True
        return False

    def coordinate_movement(self):
        """Coordinate movement to avoid collisions"""
        robot_positions = [(id, state.position) for id, state in self.robots.items()]

        for i, (id1, pos1) in enumerate(robot_positions):
            for id2, pos2 in robot_positions[i+1:]:
                distance = np.linalg.norm(pos1 - pos2)
                if distance < 1.0:  # Collision threshold
                    # Implement collision avoidance
                    self.resolve_collision(id1, id2, pos1, pos2)

    def resolve_collision(self, id1: str, id2: str, pos1: np.ndarray, pos2: np.ndarray):
        """Resolve collision between two robots"""
        # Simple strategy: move one robot aside
        direction = pos2 - pos1
        direction = direction / np.linalg.norm(direction)

        # Move robot2 to the side
        self.robots[id2].position += direction * 0.5

class DecentralizedCoordinator:
    def __init__(self, robot_id: str):
        self.robot_id = robot_id
        self.neighbors: Dict[str, RobotState] = {}
        self.local_tasks = []
        self.communication_range = 10.0

    def broadcast_state(self, state: RobotState):
        """Broadcast current state to neighbors"""
        # In a real system, this would send messages over network
        pass

    def receive_neighbor_state(self, neighbor_state: RobotState):
        """Receive state from a neighboring robot"""
        self.neighbors[neighbor_state.robot_id] = neighbor_state

    def make_local_decision(self, global_tasks: List[str]):
        """Make coordination decisions based on local information"""
        # Check for potential conflicts with neighbors
        for neighbor_id, neighbor_state in self.neighbors.items():
            if self.would_conflict(neighbor_state):
                # Adjust behavior to avoid conflict
                self.adjust_behavior(neighbor_state)

    def would_conflict(self, neighbor_state: RobotState) -> bool:
        """Check if current plan would conflict with neighbor"""
        # Check if paths intersect or if both heading to same location
        distance = np.linalg.norm(self.robots[self.robot_id].position - neighbor_state.position)
        return distance < 2.0  # Potential conflict threshold

    def adjust_behavior(self, neighbor_state: RobotState):
        """Adjust behavior to avoid conflict"""
        # Implement local coordination strategy
        pass
```

## Communication Protocols for Humanoid Robots

### ROS 2 Multi-Robot Communication

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Float32MultiArray
from geometry_msgs.msg import PoseStamped
from multirobot_msgs.msg import RobotStatus, TaskAssignment

class MultiRobotCommunicator(Node):
    def __init__(self, robot_id: str):
        super().__init__(f'multirobot_comm_{robot_id}')
        self.robot_id = robot_id

        # Publishers
        self.status_pub = self.create_publisher(RobotStatus, 'robot_status', 10)
        self.task_pub = self.create_publisher(TaskAssignment, 'task_assignments', 10)
        self.pose_pub = self.create_publisher(PoseStamped, 'robot_pose', 10)

        # Subscribers
        self.status_sub = self.create_subscription(
            RobotStatus, 'robot_status', self.status_callback, 10
        )
        self.task_sub = self.create_subscription(
            TaskAssignment, 'task_assignments', self.task_callback, 10
        )
        self.coordination_sub = self.create_subscription(
            String, 'coordination_channel', self.coordination_callback, 10
        )

        # Timer for periodic status updates
        self.status_timer = self.create_timer(1.0, self.publish_status)

        # Robot state
        self.current_pose = PoseStamped()
        self.battery_level = 100.0
        self.task_queue = []

    def publish_status(self):
        """Publish current robot status"""
        status_msg = RobotStatus()
        status_msg.robot_id = self.robot_id
        status_msg.pose = self.current_pose.pose
        status_msg.battery_level = self.battery_level
        status_msg.status = "active"  # idle, working, charging, etc.

        self.status_pub.publish(status_msg)

    def status_callback(self, msg: RobotStatus):
        """Handle incoming robot status"""
        if msg.robot_id != self.robot_id:
            # Update neighbor information
            self.update_neighbor_status(msg)

    def task_callback(self, msg: TaskAssignment):
        """Handle incoming task assignment"""
        if msg.target_robot == self.robot_id:
            self.task_queue.append(msg.task)
            self.execute_task(msg.task)

    def coordination_callback(self, msg: String):
        """Handle coordination messages"""
        coordination_data = msg.data.split(':')
        if coordination_data[0] == 'request':
            self.handle_coordination_request(coordination_data[1:])
        elif coordination_data[0] == 'response':
            self.handle_coordination_response(coordination_data[1:])

    def update_neighbor_status(self, status: RobotStatus):
        """Update information about neighboring robots"""
        # Store in local coordination data structure
        pass

    def execute_task(self, task: str):
        """Execute a specific task"""
        # Implementation depends on task type
        pass

    def handle_coordination_request(self, request_data):
        """Handle coordination requests from other robots"""
        # Process request and send response
        pass

    def handle_coordination_response(self, response_data):
        """Handle coordination responses"""
        # Process response and update plans accordingly
        pass
```

## Task Allocation Algorithms

### Market-Based Task Allocation

```python
class TaskAllocator:
    def __init__(self, robots: List[str]):
        self.robots = robots
        self.tasks = []
        self.robot_capabilities = {}  # Robot -> capabilities mapping
        self.task_requirements = {}   # Task -> requirements mapping

    def register_robot_capabilities(self, robot_id: str, capabilities: Dict[str, float]):
        """Register what capabilities a robot has"""
        self.robot_capabilities[robot_id] = capabilities

    def register_task(self, task_id: str, requirements: Dict[str, float], value: float = 1.0):
        """Register a task with its requirements and value"""
        self.tasks.append({
            'id': task_id,
            'requirements': requirements,
            'value': value,
            'assigned_to': None
        })

    def auction_tasks(self) -> Dict[str, List[str]]:
        """Auction tasks to robots using market-based approach"""
        robot_assignments = {robot: [] for robot in self.robots}

        for task in self.tasks:
            if task['assigned_to'] is None:
                # Calculate bids from all robots
                bids = {}
                for robot in self.robots:
                    bid = self.calculate_bid(robot, task)
                    if bid > 0:  # Only robots that can perform the task
                        bids[robot] = bid

                if bids:
                    # Assign to highest bidder
                    winning_robot = max(bids, key=bids.get)
                    robot_assignments[winning_robot].append(task['id'])
                    task['assigned_to'] = winning_robot

        return robot_assignments

    def calculate_bid(self, robot_id: str, task: Dict) -> float:
        """Calculate how much a robot should bid for a task"""
        if robot_id not in self.robot_capabilities:
            return 0

        robot_caps = self.robot_capabilities[robot_id]
        task_reqs = task['requirements']

        # Calculate capability match score
        match_score = 1.0
        for req, req_value in task_reqs.items():
            if req in robot_caps:
                # Higher capability means higher bid
                match_score *= (robot_caps[req] / req_value)
            else:
                # Robot doesn't have required capability
                return 0

        # Higher task value increases bid
        bid = task['value'] * match_score

        # Consider robot's current workload
        current_tasks = len([t for t in self.tasks if t['assigned_to'] == robot_id])
        workload_factor = max(0.5, 1.0 - current_tasks * 0.1)  # Reduce bid with more tasks

        return bid * workload_factor

class ConsensusBasedBundleAlgorithm:
    """Implementation of CBBA (Consensus-Based Bundle Algorithm)"""

    def __init__(self, robots: List[str], tasks: List[Dict]):
        self.robots = robots
        self.tasks = tasks
        self.robot_bundles = {r: [] for r in robots}
        self.robot_paths = {r: [] for r in robots}
        self.time_limit = 10.0  # Consensus time limit

    def run_cbba(self) -> Dict[str, List[str]]:
        """Run the CBBA algorithm to allocate tasks"""
        # Initialize bundles
        for robot in self.robots:
            self.robot_bundles[robot] = []
            self.robot_paths[robot] = []

        # Iterative consensus process
        iteration = 0
        max_iterations = 50
        converged = False

        while not converged and iteration < max_iterations:
            old_assignments = {r: self.robot_bundles[r][:] for r in self.robots}

            # Each robot builds its bundle
            for robot in self.robots:
                self.update_robot_bundle(robot)

            # Check for convergence
            converged = all(
                self.robot_bundles[r] == old_assignments[r] for r in self.robots
            )
            iteration += 1

        return self.robot_bundles

    def update_robot_bundle(self, robot_id: str):
        """Update a robot's task bundle"""
        current_bundle = self.robot_bundles[robot_id]
        available_tasks = [t for t in self.tasks if t['id'] not in
                          [item['id'] for bundle_list in self.robot_bundles.values() for item in bundle_list]]

        # Add best tasks to bundle
        for task in available_tasks:
            if self.is_task_beneficial(robot_id, task, current_bundle):
                current_bundle.append(task)

    def is_task_beneficial(self, robot_id: str, task: Dict, current_bundle: List[Dict]) -> bool:
        """Check if adding a task is beneficial for the robot"""
        # Calculate utility of adding this task to current bundle
        # This would involve path planning and cost calculations
        return True  # Simplified for example
```

## Formation Control for Humanoid Robots

### Virtual Structure Formation

```python
class FormationController:
    def __init__(self, robot_id: str, formation_shape: str = "line"):
        self.robot_id = robot_id
        self.formation_shape = formation_shape
        self.neighbors = []
        self.formation_positions = {}
        self.current_position = np.array([0.0, 0.0, 0.0])
        self.formation_scale = 1.0

    def setup_formation(self, robot_ids: List[str], leader_id: str = None):
        """Set up formation positions for all robots"""
        n_robots = len(robot_ids)

        if self.formation_shape == "line":
            self.calculate_line_formation(robot_ids)
        elif self.formation_shape == "circle":
            self.calculate_circle_formation(robot_ids)
        elif self.formation_shape == "triangle":
            self.calculate_triangle_formation(robot_ids)

    def calculate_line_formation(self, robot_ids: List[str]):
        """Calculate positions for line formation"""
        leader_idx = robot_ids.index(self.robot_id)

        for i, robot_id in enumerate(robot_ids):
            offset = (i - leader_idx) * self.formation_scale
            self.formation_positions[robot_id] = np.array([offset, 0.0, 0.0])

    def calculate_circle_formation(self, robot_ids: List[str]):
        """Calculate positions for circular formation"""
        n_robots = len(robot_ids)
        angle_step = 2 * np.pi / n_robots

        for i, robot_id in enumerate(robot_ids):
            angle = i * angle_step
            x = self.formation_scale * np.cos(angle)
            y = self.formation_scale * np.sin(angle)
            self.formation_positions[robot_id] = np.array([x, y, 0.0])

    def calculate_triangle_formation(self, robot_ids: List[str]):
        """Calculate positions for triangular formation"""
        n_robots = len(robot_ids)

        for i, robot_id in enumerate(robot_ids):
            if n_robots >= 3:
                if i == 0:
                    # Leader at center
                    self.formation_positions[robot_id] = np.array([0.0, 0.0, 0.0])
                elif i == 1:
                    # First follower
                    self.formation_positions[robot_id] = np.array([self.formation_scale, 0.0, 0.0])
                elif i == 2:
                    # Second follower
                    angle = np.pi / 3  # 60 degrees
                    x = self.formation_scale * np.cos(angle)
                    y = self.formation_scale * np.sin(angle)
                    self.formation_positions[robot_id] = np.array([x, y, 0.0])

    def compute_formation_control(self, leader_position: np.ndarray) -> np.ndarray:
        """Compute control input to maintain formation"""
        desired_position = leader_position + self.formation_positions[self.robot_id]

        # Simple proportional controller
        error = desired_position - self.current_position
        control_output = 1.0 * error  # Proportional gain = 1.0

        # Add collision avoidance with other robots
        avoidance_force = self.compute_collision_avoidance()

        return control_output + avoidance_force

    def compute_collision_avoidance(self) -> np.ndarray:
        """Compute collision avoidance forces"""
        avoidance_force = np.zeros(3)

        for neighbor_id, neighbor_pos in self.formation_positions.items():
            if neighbor_id != self.robot_id:
                distance = np.linalg.norm(self.current_position - neighbor_pos)
                if distance < 0.5:  # Collision threshold
                    # Repulsive force
                    direction = self.current_position - neighbor_pos
                    direction = direction / np.linalg.norm(direction)
                    magnitude = max(0, 0.5 - distance) * 10.0
                    avoidance_force += direction * magnitude

        return avoidance_force
```

## Human-Robot Team Coordination

### Socially-Aware Coordination

```python
class SociallyAwareCoordinator:
    def __init__(self, robot_id: str):
        self.robot_id = robot_id
        self.human_positions = {}
        self.social_zones = {}  # Personal, social, public space distances
        self.approach_strategies = {}

    def detect_humans(self, human_detections: List[Dict]):
        """Process human detections and update internal state"""
        for detection in human_detections:
            human_id = detection['id']
            position = detection['position']
            self.human_positions[human_id] = position

    def plan_socially_compliant_path(self, goal, humans_nearby: List[str]):
        """Plan a path that respects human social spaces"""
        # Define social zones
        personal_space = 0.45  # meters
        social_space = 1.2    # meters
        public_space = 3.6    # meters

        # Modify path planning to avoid human personal space
        modified_goal = self.adjust_goal_for_social_compliance(goal, humans_nearby)

        # Return socially compliant path
        return self.compute_path_to_goal(modified_goal)

    def adjust_goal_for_social_compliance(self, goal, humans_nearby: List[str]):
        """Adjust goal to respect human social spaces"""
        adjusted_goal = goal.copy()

        for human_id in humans_nearby:
            if human_id in self.human_positions:
                human_pos = self.human_positions[human_id]

                # Calculate vector from human to goal
                vec_to_goal = adjusted_goal - human_pos[:3]  # Only x,y,z
                distance = np.linalg.norm(vec_to_goal)

                if distance < 1.2:  # Within social space
                    # Adjust goal to maintain minimum distance
                    direction = vec_to_goal / distance if distance > 0 else np.array([1, 0, 0])
                    adjusted_goal = human_pos[:3] + direction * 1.2

        return adjusted_goal

    def compute_path_to_goal(self, goal):
        """Compute path to goal (simplified)"""
        # In practice, this would use a proper path planning algorithm
        return [goal]  # Return the goal as the path

    def select_interaction_strategy(self, human_state: Dict):
        """Select appropriate interaction strategy based on human state"""
        if human_state['is_looking_at_robot']:
            return "direct_interaction"
        elif human_state['is_in_conversation']:
            return "wait_for_turn"
        elif human_state['appears_hurrying']:
            return "minimize_interruption"
        else:
            return "normal_interaction"
```

## Coordination Algorithms Implementation

### ROS 2 Coordination Node

```python
import rclpy
from rclpy.node import Node
from multirobot_msgs.msg import CoordinationCommand, CoordinationStatus
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import String

class MultiRobotCoordinator(Node):
    def __init__(self):
        super().__init__('multirobot_coordinator')

        # Publishers
        self.coord_cmd_pub = self.create_publisher(
            CoordinationCommand, 'coordination_commands', 10
        )
        self.coord_status_pub = self.create_publisher(
            CoordinationStatus, 'coordination_status', 10
        )

        # Subscribers
        self.pose_sub = self.create_subscription(
            PoseStamped, 'robot_pose', self.pose_callback, 10
        )
        self.coord_status_sub = self.create_subscription(
            CoordinationStatus, 'coordination_status', self.coord_status_callback, 10
        )

        # Coordination components
        self.task_allocator = TaskAllocator(robots=[])
        self.formation_controller = FormationController(
            robot_id=self.get_namespace(), formation_shape="line"
        )
        self.social_coordinator = SociallyAwareCoordinator(
            robot_id=self.get_namespace()
        )

        # Timer for coordination updates
        self.coordination_timer = self.create_timer(0.5, self.coordination_step)

        # Robot states
        self.robot_states = {}
        self.human_states = {}

    def pose_callback(self, msg: PoseStamped):
        """Update robot pose in coordination system"""
        robot_id = self.get_namespace()  # Simplified
        self.robot_states[robot_id] = msg.pose

    def coord_status_callback(self, msg: CoordinationStatus):
        """Process coordination status from other robots"""
        self.robot_states[msg.robot_id] = msg.pose
        if msg.robot_id != self.get_namespace():
            # Update formation controller with neighbor positions
            self.formation_controller.current_position = np.array([
                msg.pose.position.x, msg.pose.position.y, msg.pose.position.z
            ])

    def coordination_step(self):
        """Main coordination step"""
        # Update formation
        if len(self.robot_states) > 1:
            leader_id = min(self.robot_states.keys())  # Simple leader selection
            if self.get_namespace() != leader_id:
                leader_pose = self.robot_states[leader_id]
                leader_pos = np.array([
                    leader_pose.position.x,
                    leader_pose.position.y,
                    leader_pose.position.z
                ])

                control_cmd = self.formation_controller.compute_formation_control(leader_pos)

                # Publish coordination command
                cmd_msg = CoordinationCommand()
                cmd_msg.robot_id = self.get_namespace()
                cmd_msg.command = "move_to"
                cmd_msg.target_position = control_cmd.tolist()
                self.coord_cmd_pub.publish(cmd_msg)

        # Update coordination status
        status_msg = CoordinationStatus()
        status_msg.robot_id = self.get_namespace()
        if self.get_namespace() in self.robot_states:
            status_msg.pose = self.robot_states[self.get_namespace()]
        status_msg.status = "coordinating"
        self.coord_status_pub.publish(status_msg)
```

## Challenges in Multi-Robot Coordination

### Communication Constraints

Humanoid robots face specific communication challenges:

- **Bandwidth limitations**: Complex humanoid robots generate large amounts of sensor data
- **Latency requirements**: Real-time coordination needs low-latency communication
- **Reliability**: Coordination failures can lead to safety issues

### Heterogeneous Teams

Coordination becomes more complex with different robot types:

- Different capabilities and limitations
- Varying mobility and manipulation abilities
- Different sensing modalities

### Dynamic Environments

Real-world environments require adaptive coordination:

- Moving obstacles
- Changing task requirements
- Unpredictable human interactions

## Practice Tasks

1. Implement a simple multi-robot communication system using ROS 2
2. Create a task allocation algorithm for a team of humanoid robots
3. Develop a formation control system for coordinated movement
4. Design socially-aware navigation for human-robot teams
5. Test coordination algorithms in simulation with multiple robots

## Summary

Multi-robot coordination for humanoid systems requires sophisticated algorithms that consider the complexity of individual robots, human-aware interactions, and real-time constraints. By implementing proper coordination architectures, communication protocols, and task allocation strategies, teams of humanoid robots can effectively work together to accomplish complex tasks in human-centered environments.
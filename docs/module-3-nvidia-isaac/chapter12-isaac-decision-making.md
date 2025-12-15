# Chapter 12: Intelligent Decision Making

## Overview

In this final chapter of Module 3, we'll explore intelligent decision making in robotics. This is where perception and navigation capabilities come together to enable robots to make complex decisions based on their understanding of the environment and task requirements. We'll cover behavior trees, state machines, reinforcement learning, and how NVIDIA Isaac supports intelligent decision making.

## Introduction to Robot Decision Making

### The Decision Making Problem
Robot decision making involves:
- **Situation Assessment**: Understanding the current state of the world
- **Goal Reasoning**: Determining what needs to be achieved
- **Action Selection**: Choosing the best action given the current situation
- **Plan Execution**: Carrying out the selected action
- **Feedback Processing**: Learning from outcomes to improve future decisions

### Decision Making Hierarchy
```
High-Level Planning → Task Planning → Behavior Selection → Action Execution
```

## Behavior Trees

### What are Behavior Trees?
Behavior trees are a hierarchical planning approach that provides a modular and reusable way to structure robot behaviors. They are widely used in robotics and game AI.

### Behavior Tree Components
- **Root**: The starting point of the tree
- **Composites**: Nodes that have children (Sequences, Selectors, etc.)
- **Decorators**: Modify behavior of child nodes (Inverters, Repeat, etc.)
- **Leaves**: Execute specific actions or conditions

### Behavior Tree Implementation
```python
from enum import Enum
from abc import ABC, abstractmethod

class NodeStatus(Enum):
    SUCCESS = 1
    FAILURE = 2
    RUNNING = 3

class BehaviorNode(ABC):
    def __init__(self, name):
        self.name = name
        self.status = NodeStatus.FAILURE

    @abstractmethod
    def tick(self):
        pass

class SequenceNode(BehaviorNode):
    def __init__(self, name, children):
        super().__init__(name)
        self.children = children
        self.current_child_idx = 0

    def tick(self):
        for i in range(self.current_child_idx, len(self.children)):
            child_status = self.children[i].tick()

            if child_status == NodeStatus.FAILURE:
                self.current_child_idx = 0
                return NodeStatus.FAILURE
            elif child_status == NodeStatus.RUNNING:
                self.current_child_idx = i
                return NodeStatus.RUNNING
            # If SUCCESS, continue to next child

        # All children succeeded
        self.current_child_idx = 0
        return NodeStatus.SUCCESS

class SelectorNode(BehaviorNode):
    def __init__(self, name, children):
        super().__init__(name)
        self.children = children
        self.current_child_idx = 0

    def tick(self):
        for i in range(self.current_child_idx, len(self.children)):
            child_status = self.children[i].tick()

            if child_status == NodeStatus.SUCCESS:
                self.current_child_idx = 0
                return NodeStatus.SUCCESS
            elif child_status == NodeStatus.RUNNING:
                self.current_child_idx = i
                return NodeStatus.RUNNING
            # If FAILURE, continue to next child

        # All children failed
        self.current_child_idx = 0
        return NodeStatus.FAILURE

class ActionNode(BehaviorNode):
    def __init__(self, name, action_func):
        super().__init__(name)
        self.action_func = action_func
        self.is_running = False

    def tick(self):
        return self.action_func()
```

### Example Navigation Behavior Tree
```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped, Twist
from sensor_msgs.msg import LaserScan
import math

class NavigationBehaviorTree(Node):
    def __init__(self):
        super().__init__('navigation_bt')

        # Publishers and subscribers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)

        # Robot state
        self.scan_data = None
        self.obstacle_detected = False
        self.goal_reached = False

        # Create behavior tree
        self.create_behavior_tree()

        # Timer for behavior tree execution
        self.bt_timer = self.create_timer(0.1, self.execute_behavior_tree)

    def scan_callback(self, msg):
        self.scan_data = msg
        if msg.ranges:
            # Check for obstacles in front (simplified)
            front_ranges = msg.ranges[len(msg.ranges)//2-10:len(msg.ranges)//2+10]
            self.obstacle_detected = any(r < 1.0 for r in front_ranges if not math.isinf(r))

    def create_behavior_tree(self):
        """Create the navigation behavior tree"""
        # Root selector: try to reach goal, or avoid obstacles
        self.root = SelectorNode("navigation_root", [
            # Check if goal is reached
            self.create_condition_node("goal_reached", self.check_goal_reached),
            # If not reached, try to navigate
            SequenceNode("navigate_sequence", [
                self.create_condition_node("no_obstacle", lambda: not self.obstacle_detected),
                self.create_action_node("move_to_goal", self.move_to_goal)
            ]),
            # If obstacle detected, avoid it
            SequenceNode("avoid_obstacle_sequence", [
                self.create_condition_node("obstacle_detected", lambda: self.obstacle_detected),
                self.create_action_node("avoid_obstacle", self.avoid_obstacle)
            ])
        ])

    def create_condition_node(self, name, condition_func):
        """Create a condition node that returns SUCCESS if condition is true"""
        def check_condition():
            if condition_func():
                return NodeStatus.SUCCESS
            else:
                return NodeStatus.FAILURE
        return ActionNode(name, check_condition)

    def create_action_node(self, name, action_func):
        """Create an action node"""
        return ActionNode(name, action_func)

    def execute_behavior_tree(self):
        """Execute the behavior tree"""
        if self.root:
            self.root.tick()

    def check_goal_reached(self):
        """Check if goal is reached"""
        # This would check distance to goal
        if self.goal_reached:
            return NodeStatus.SUCCESS
        return NodeStatus.FAILURE

    def move_to_goal(self):
        """Move towards the goal"""
        cmd_vel = Twist()
        cmd_vel.linear.x = 0.5  # Move forward
        self.cmd_vel_pub.publish(cmd_vel)
        return NodeStatus.SUCCESS  # For simplicity, return success immediately

    def avoid_obstacle(self):
        """Avoid detected obstacle"""
        cmd_vel = Twist()
        cmd_vel.angular.z = 0.5  # Turn to avoid
        cmd_vel.linear.x = 0.2   # Move slowly while turning
        self.cmd_vel_pub.publish(cmd_vel)
        return NodeStatus.SUCCESS  # For simplicity, return success immediately

def main(args=None):
    rclpy.init(args=args)
    bt_node = NavigationBehaviorTree()

    try:
        rclpy.spin(bt_node)
    except KeyboardInterrupt:
        bt_node.get_logger().info('Behavior tree node stopped')
    finally:
        bt_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## State Machines

### Finite State Machines (FSM)
State machines provide another approach to decision making:

```python
from enum import Enum

class RobotState(Enum):
    IDLE = 1
    NAVIGATING = 2
    AVOIDING_OBSTACLE = 3
    REACHED_GOAL = 4
    ERROR = 5

class NavigationStateMachine:
    def __init__(self):
        self.state = RobotState.IDLE
        self.previous_state = None

    def update(self, sensor_data, goal_reached):
        """Update state based on current conditions"""
        self.previous_state = self.state

        if self.state == RobotState.IDLE:
            if goal_reached:
                self.state = RobotState.REACHED_GOAL
            elif self.should_navigate(sensor_data):
                self.state = RobotState.NAVIGATING

        elif self.state == RobotState.NAVIGATING:
            if goal_reached:
                self.state = RobotState.REACHED_GOAL
            elif self.detect_obstacle(sensor_data):
                self.state = RobotState.AVOIDING_OBSTACLE
            elif self.should_stop_navigating():
                self.state = RobotState.IDLE

        elif self.state == RobotState.AVOIDING_OBSTACLE:
            if not self.detect_obstacle(sensor_data):
                self.state = RobotState.NAVIGATING
            elif goal_reached:
                self.state = RobotState.REACHED_GOAL

        elif self.state == RobotState.REACHED_GOAL:
            if not goal_reached:  # Goal changed
                self.state = RobotState.NAVIGATING

    def should_navigate(self, sensor_data):
        """Determine if robot should start navigating"""
        return True  # Simplified

    def detect_obstacle(self, sensor_data):
        """Detect if there's an obstacle"""
        # Simplified obstacle detection
        if sensor_data and hasattr(sensor_data, 'ranges'):
            front_ranges = sensor_data.ranges[len(sensor_data.ranges)//2-10:len(sensor_data.ranges)//2+10]
            return any(r < 1.0 for r in front_ranges if not math.isinf(r))
        return False

    def should_stop_navigating(self):
        """Determine if navigation should stop"""
        return False  # Simplified
```

### Hierarchical State Machines
```python
class HierarchicalStateMachine:
    def __init__(self):
        self.high_level_state = 'EXPLORATION'
        self.low_level_state = 'STOPPED'

    def update_high_level(self, world_model):
        """Update high-level state based on world model"""
        if self.high_level_state == 'EXPLORATION':
            if self.should_explore_more(world_model):
                self.low_level_state = 'NAVIGATING'
            else:
                self.high_level_state = 'RETURN_TO_BASE'

        elif self.high_level_state == 'RETURN_TO_BASE':
            if self.at_base():
                self.low_level_state = 'CHARGING'
            else:
                self.low_level_state = 'NAVIGATING_BACK'

    def should_explore_more(self, world_model):
        """Determine if more exploration is needed"""
        # Check if unexplored areas exist
        return len(world_model.unexplored_areas) > 0
```

## Reinforcement Learning for Decision Making

### Introduction to RL in Robotics
Reinforcement Learning (RL) allows robots to learn optimal behaviors through trial and error:

```python
import numpy as np
import random

class QLearningAgent:
    def __init__(self, state_size, action_size, learning_rate=0.1, discount_factor=0.95, epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.01):
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

        # Initialize Q-table (for discrete states) or use function approximation for continuous
        self.q_table = np.zeros((state_size, action_size))

    def act(self, state):
        """Choose action using epsilon-greedy policy"""
        if np.random.random() <= self.epsilon:
            # Explore: random action
            return random.randrange(self.action_size)

        # Exploit: best known action
        q_values = self.q_table[state]
        return np.argmax(q_values)

    def learn(self, state, action, reward, next_state, done):
        """Update Q-value using Q-learning update rule"""
        current_q = self.q_table[state][action]

        if done:
            target_q = reward
        else:
            target_q = reward + self.discount_factor * np.max(self.q_table[next_state])

        # Update Q-value
        self.q_table[state][action] = current_q + self.learning_rate * (target_q - current_q)

        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

class NavigationRLAgent:
    def __init__(self):
        # Discretize continuous state space for Q-learning
        self.agent = QLearningAgent(
            state_size=100,  # Discretized states
            action_size=5    # Different navigation actions
        )
        self.state_bins = self.create_state_bins()

    def create_state_bins(self):
        """Create bins for discretizing continuous state space"""
        # Example: discretize position, obstacle distance, goal direction
        pos_bins = np.linspace(-10, 10, 10)  # Position bins
        dist_bins = np.linspace(0, 5, 5)     # Distance bins
        angle_bins = np.linspace(-np.pi, np.pi, 8)  # Angle bins

        return [pos_bins, dist_bins, angle_bins]

    def discretize_state(self, continuous_state):
        """Convert continuous state to discrete state index"""
        # Simplified discretization
        pos_x, pos_y, obstacle_dist, goal_angle = continuous_state

        # Find bin indices
        pos_idx = np.digitize(pos_x, self.state_bins[0]) * 10 + np.digitize(pos_y, self.state_bins[0])
        dist_idx = np.digitize(obstacle_dist, self.state_bins[1])
        angle_idx = np.digitize(goal_angle, self.state_bins[2])

        # Combine into single state index
        discrete_state = pos_idx * 100 + dist_idx * 10 + angle_idx
        return min(discrete_state, 99)  # Clamp to max state size
```

## Decision Making with World Models

### Creating World Models
```python
class WorldModel:
    def __init__(self):
        self.map = {}  # Occupancy grid or topological map
        self.objects = {}  # Dynamic objects in environment
        self.robot_state = None
        self.goals = []
        self.uncertainty = {}  # Uncertainty in world knowledge

    def update_map(self, sensor_data):
        """Update world map with new sensor data"""
        # Integrate new sensor data into map
        # Handle uncertainty and sensor noise
        pass

    def predict_future_state(self, action):
        """Predict world state after executing action"""
        # Use physics simulation or learned models
        # Consider uncertainty in predictions
        predicted_state = self.simulate_action(action)
        return predicted_state

    def simulate_action(self, action):
        """Simulate the effect of an action on the world"""
        # This could use physics simulation or learned dynamics models
        pass

class DecisionMakerWithWorldModel:
    def __init__(self):
        self.world_model = WorldModel()
        self.planning_horizon = 5  # Plan 5 steps ahead

    def make_decision(self, current_state, goals):
        """Make decision by planning ahead with world model"""
        best_action = None
        best_value = float('-inf')

        # Evaluate different possible actions
        for action in self.get_possible_actions(current_state):
            total_value = 0

            # Simulate action sequence
            simulated_state = self.world_model.predict_future_state(action)

            # Evaluate outcome
            value = self.evaluate_state(simulated_state, goals)
            total_value += value

            # Consider longer-term consequences
            for step in range(1, self.planning_horizon):
                next_action = self.select_action(simulated_state)
                simulated_state = self.world_model.predict_future_state(next_action)
                value = self.evaluate_state(simulated_state, goals)
                total_value += (self.planning_horizon - step) * 0.1 * value

            if total_value > best_value:
                best_value = total_value
                best_action = action

        return best_action

    def evaluate_state(self, state, goals):
        """Evaluate how good a state is with respect to goals"""
        # Calculate reward based on proximity to goals, safety, etc.
        reward = 0

        # Distance to goals
        for goal in goals:
            dist = self.calculate_distance(state.robot_position, goal.position)
            reward -= dist  # Closer is better

        # Safety (avoid obstacles)
        if self.is_safe_state(state):
            reward += 10
        else:
            reward -= 100  # Heavy penalty for unsafe states

        return reward
```

## NVIDIA Isaac Decision Making

### Isaac ROS Behavior Trees
Isaac ROS includes behavior tree capabilities:

```xml
<!-- Example navigation behavior tree using Nav2 -->
<launch>
  <!-- Navigation behavior tree -->
  <node pkg="nav2_bt_navigator" exec="nav2_bt_navigator" name="bt_navigator">
    <param name="default_bt_xml_filename" value="path/to/custom_bt.xml"/>
    <param name="plugin_lib_names" value="[nav2_compute_path_to_pose_action, nav2_follow_path_action, nav2_dwb_controller, nav2_assisted_teleop_action, nav2_back_up_action, nav2_spin_action, nav2_wait_action]"/>
  </node>
</launch>
```

### Custom Behavior Tree Nodes
```cpp
// Example C++ behavior tree node for Isaac ROS
#include "behaviortree_cpp_v3/behavior_tree.h"
#include "behaviortree_cpp_v3/bt_factory.h"
#include "geometry_msgs/msg/pose_stamped.hpp"
#include "rclcpp/rclcpp.hpp"

class CheckObstacles : public BT::SyncActionNode
{
public:
    CheckObstacles(const std::string& name, const BT::NodeConfiguration& config)
        : BT::SyncActionNode(name, config)
    {
        node_ = config.blackboard->get<rclcpp::Node::SharedPtr>("node");
        laser_sub_ = node_->create_subscription<sensor_msgs::msg::LaserScan>(
            "/scan", 10,
            std::bind(&CheckObstacles::laserCallback, this, std::placeholders::_1));
    }

    BT::NodeStatus tick() override
    {
        if (obstacle_detected_) {
            RCLCPP_INFO(node_->get_logger(), "Obstacle detected!");
            return BT::NodeStatus::FAILURE;
        } else {
            RCLCPP_INFO(node_->get_logger(), "No obstacles detected.");
            return BT::NodeStatus::SUCCESS;
        }
    }

    static BT::PortsList providedPorts()
    {
        return {};
    }

private:
    void laserCallback(const sensor_msgs::msg::LaserScan::SharedPtr msg)
    {
        // Check for obstacles in front of robot
        int front_start = msg->ranges.size() / 2 - 10;
        int front_end = msg->ranges.size() / 2 + 10;

        obstacle_detected_ = false;
        for (int i = front_start; i < front_end; ++i) {
            if (i >= 0 && i < msg->ranges.size() &&
                msg->ranges[i] < 1.0 && !std::isinf(msg->ranges[i])) {
                obstacle_detected_ = true;
                break;
            }
        }
    }

    rclcpp::Node::SharedPtr node_;
    rclcpp::Subscription<sensor_msgs::msg::LaserScan>::SharedPtr laser_sub_;
    bool obstacle_detected_ = false;
};

// Register the custom node
BT_REGISTER_NODES(factory)
{
    factory.registerNodeType<CheckObstacles>("CheckObstacles");
}
```

## Task Planning and Reasoning

### PDDL-based Task Planning
```python
class TaskPlanner:
    def __init__(self):
        self.domain = self.define_domain()
        self.problem = None

    def define_domain(self):
        """Define the planning domain using PDDL-like structure"""
        domain = {
            'predicates': [
                'at(robot, location)',
                'connected(location1, location2)',
                'occupied(location)',
                'has_object(robot, object)',
                'at_object(object, location)'
            ],
            'actions': {
                'move': {
                    'preconditions': ['at(robot, ?from)', 'connected(?from, ?to)', 'not occupied(?to)'],
                    'effects': ['not at(robot, ?from)', 'at(robot, ?to)', 'not occupied(?from)', 'occupied(?to)']
                },
                'pickup': {
                    'preconditions': ['at(robot, ?loc)', 'at_object(?obj, ?loc)', 'not has_object(robot, ?obj)'],
                    'effects': ['not at_object(?obj, ?loc)', 'has_object(robot, ?obj)']
                },
                'drop': {
                    'preconditions': ['at(robot, ?loc)', 'has_object(robot, ?obj)'],
                    'effects': ['at_object(?obj, ?loc)', 'not has_object(robot, ?obj)']
                }
            }
        }
        return domain

    def plan_task(self, initial_state, goal_state):
        """Plan a sequence of actions to achieve goal"""
        # This would interface with a PDDL planner
        # For simplicity, returning a basic plan
        plan = self.simple_task_planning(initial_state, goal_state)
        return plan

    def simple_task_planning(self, initial_state, goal_state):
        """Simple task planning algorithm"""
        # Simplified planning - in practice, use a proper planner
        plan = []

        # Example: if goal is to move to location B
        if 'at(robot, B)' in goal_state and 'at(robot, A)' in initial_state:
            plan = ['move A B']

        return plan
```

### Utility-Based Decision Making
```python
class UtilityBasedDecisionMaker:
    def __init__(self):
        self.utilities = {
            'safety': 1.0,
            'efficiency': 0.8,
            'task_completion': 1.2,
            'energy_conservation': 0.5
        }

    def evaluate_action(self, action, state, goals):
        """Evaluate action using utility function"""
        utility = 0.0

        # Safety utility (higher for safer actions)
        safety_utility = self.calculate_safety_utility(action, state)
        utility += self.utilities['safety'] * safety_utility

        # Efficiency utility (higher for faster completion)
        efficiency_utility = self.calculate_efficiency_utility(action, state, goals)
        utility += self.utilities['efficiency'] * efficiency_utility

        # Task completion utility
        task_utility = self.calculate_task_utility(action, state, goals)
        utility += self.utilities['task_completion'] * task_utility

        # Energy conservation utility
        energy_utility = self.calculate_energy_utility(action, state)
        utility += self.utilities['energy_conservation'] * energy_utility

        return utility

    def calculate_safety_utility(self, action, state):
        """Calculate safety utility for action"""
        # Simplified safety calculation
        if self.would_collide(action, state):
            return -1.0
        else:
            return 1.0

    def calculate_efficiency_utility(self, action, state, goals):
        """Calculate efficiency utility for action"""
        # Simplified efficiency calculation
        return 1.0 / (1.0 + self.estimated_time(action, state))

    def would_collide(self, action, state):
        """Check if action would cause collision"""
        # Simplified collision checking
        return False

    def estimated_time(self, action, state):
        """Estimate time to complete action"""
        # Simplified time estimation
        return 1.0
```

## Multi-Robot Decision Making

### Coordination and Communication
```python
class MultiRobotCoordinator:
    def __init__(self, robot_id, total_robots):
        self.robot_id = robot_id
        self.total_robots = total_robots
        self.robot_positions = {}
        self.task_assignments = {}
        self.communication_range = 10.0  # meters

    def coordinate_with_others(self, my_position, my_tasks):
        """Coordinate with other robots to avoid conflicts"""
        # Share position and tasks with nearby robots
        nearby_robots = self.get_nearby_robots(my_position)

        # Negotiate task assignments to avoid conflicts
        new_assignments = self.negotiate_tasks(my_tasks, nearby_robots)

        return new_assignments

    def get_nearby_robots(self, position):
        """Get robots within communication range"""
        nearby = []
        for robot_id, pos in self.robot_positions.items():
            if robot_id != self.robot_id:
                distance = self.calculate_distance(position, pos)
                if distance <= self.communication_range:
                    nearby.append(robot_id)
        return nearby

    def negotiate_tasks(self, my_tasks, nearby_robots):
        """Negotiate task assignments with nearby robots"""
        # Simplified task negotiation
        # In practice, use auction-based or market-based approaches
        return my_tasks
```

## Decision Making Under Uncertainty

### Probabilistic Decision Making
```python
import scipy.stats as stats

class ProbabilisticDecisionMaker:
    def __init__(self):
        self.uncertainty_models = {}

    def make_decision_with_uncertainty(self, state, actions, uncertainty_params):
        """Make decision considering uncertainty in state and action outcomes"""
        best_action = None
        best_expected_utility = float('-inf')

        for action in actions:
            # Calculate expected utility considering uncertainty
            expected_utility = self.calculate_expected_utility(action, state, uncertainty_params)

            if expected_utility > best_expected_utility:
                best_expected_utility = expected_utility
                best_action = action

        return best_action

    def calculate_expected_utility(self, action, state, uncertainty_params):
        """Calculate expected utility by considering possible outcomes"""
        # Sample possible outcomes based on uncertainty model
        n_samples = 100
        utilities = []

        for _ in range(n_samples):
            # Sample possible next state
            sampled_next_state = self.sample_next_state(action, state, uncertainty_params)

            # Calculate utility of sampled outcome
            utility = self.calculate_utility(sampled_next_state)
            utilities.append(utility)

        # Return expected utility (mean of samples)
        return sum(utilities) / len(utilities)

    def sample_next_state(self, action, state, uncertainty_params):
        """Sample possible next state considering action uncertainty"""
        # Add noise to action outcome based on uncertainty model
        noisy_state = self.add_uncertainty_to_state(state, uncertainty_params)
        return noisy_state
```

## Practical Example: Decision Making System

Let's create a complete decision making system:

### 1. Main Decision Making Node
```python
#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image
from geometry_msgs.msg import Twist, PoseStamped
from nav_msgs.msg import Odometry
from std_msgs.msg import String
import math
import numpy as np

class IntelligentDecisionMaker(Node):
    def __init__(self):
        super().__init__('intelligent_decision_maker')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.status_pub = self.create_publisher(String, '/decision_status', 10)

        # Subscribers
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_callback, 10)
        self.goal_sub = self.create_subscription(PoseStamped, '/goal_pose', self.goal_callback, 10)

        # Robot state
        self.current_pose = None
        self.scan_data = None
        self.goal_pose = None
        self.robot_state = 'IDLE'  # IDLE, NAVIGATING, AVOIDING, etc.

        # Decision making components
        self.behavior_tree = self.initialize_behavior_tree()
        self.world_model = WorldModel()
        self.utility_evaluator = UtilityBasedDecisionMaker()

        # Timer for decision making loop
        self.decision_timer = self.create_timer(0.1, self.decision_loop)

    def odom_callback(self, msg):
        """Update robot pose"""
        self.current_pose = msg.pose.pose

    def scan_callback(self, msg):
        """Update laser scan data and world model"""
        self.scan_data = msg
        self.world_model.update_with_scan(msg)

    def goal_callback(self, msg):
        """Update goal pose"""
        self.goal_pose = msg.pose

    def initialize_behavior_tree(self):
        """Initialize the behavior tree for decision making"""
        # Create a simple behavior tree
        root = SelectorNode("main_selector", [
            # Check if we have a goal
            self.create_goal_check_node(),
            # If we have a goal, navigate to it
            self.create_navigation_node(),
            # Default: stop
            self.create_stop_node()
        ])
        return root

    def create_goal_check_node(self):
        """Create node to check if goal is set"""
        def check_goal():
            if self.goal_pose is not None:
                return NodeStatus.SUCCESS
            return NodeStatus.FAILURE
        return ActionNode("check_goal", check_goal)

    def create_navigation_node(self):
        """Create navigation behavior sequence"""
        return SequenceNode("navigate_to_goal", [
            # Check if obstacle ahead
            ActionNode("check_obstacle", self.check_obstacle_ahead),
            # If no obstacle, move toward goal
            ActionNode("move_toward_goal", self.move_toward_goal),
            # If obstacle, avoid it
            ActionNode("avoid_obstacle", self.avoid_obstacle)
        ])

    def create_stop_node(self):
        """Create node to stop the robot"""
        def stop_robot():
            cmd_vel = Twist()
            self.cmd_vel_pub.publish(cmd_vel)
            return NodeStatus.SUCCESS
        return ActionNode("stop_robot", stop_robot)

    def check_obstacle_ahead(self):
        """Check if obstacle is ahead"""
        if self.scan_data is None:
            return NodeStatus.FAILURE

        # Check front 30 degrees
        center_idx = len(self.scan_data.ranges) // 2
        for i in range(center_idx - 15, center_idx + 15):
            if 0 <= i < len(self.scan_data.ranges):
                if self.scan_data.ranges[i] < 1.0 and not math.isinf(self.scan_data.ranges[i]):
                    return NodeStatus.SUCCESS  # Obstacle detected

        return NodeStatus.FAILURE  # No obstacle

    def move_toward_goal(self):
        """Move toward the goal"""
        if self.current_pose is None or self.goal_pose is None:
            return NodeStatus.FAILURE

        # Calculate direction to goal
        dx = self.goal_pose.position.x - self.current_pose.position.x
        dy = self.goal_pose.position.y - self.current_pose.position.y
        distance_to_goal = math.sqrt(dx**2 + dy**2)

        if distance_to_goal < 0.5:  # Close enough to goal
            self.get_logger().info('Reached goal!')
            return NodeStatus.SUCCESS

        # Calculate required rotation
        goal_angle = math.atan2(dy, dx)
        current_yaw = self.get_yaw_from_pose(self.current_pose)
        angle_diff = self.normalize_angle(goal_angle - current_yaw)

        cmd_vel = Twist()
        if abs(angle_diff) > 0.1:  # Need to rotate
            cmd_vel.angular.z = 0.5 if angle_diff > 0 else -0.5
        else:  # Move forward
            cmd_vel.linear.x = min(0.5, distance_to_goal * 0.5)

        self.cmd_vel_pub.publish(cmd_vel)
        return NodeStatus.RUNNING

    def avoid_obstacle(self):
        """Avoid detected obstacle"""
        cmd_vel = Twist()
        cmd_vel.angular.z = 0.5  # Turn right to avoid
        cmd_vel.linear.x = 0.2   # Move slowly
        self.cmd_vel_pub.publish(cmd_vel)
        return NodeStatus.RUNNING

    def get_yaw_from_pose(self, pose):
        """Extract yaw from pose quaternion"""
        siny_cosp = 2 * (pose.orientation.w * pose.orientation.z + pose.orientation.x * pose.orientation.y)
        cosy_cosp = 1 - 2 * (pose.orientation.y * pose.orientation.y + pose.orientation.z * pose.orientation.z)
        return math.atan2(siny_cosp, cosy_cosp)

    def normalize_angle(self, angle):
        """Normalize angle to [-pi, pi]"""
        while angle > math.pi:
            angle -= 2 * math.pi
        while angle < -math.pi:
            angle += 2 * math.pi
        return angle

    def decision_loop(self):
        """Main decision making loop"""
        if self.behavior_tree:
            status = self.behavior_tree.tick()

            # Publish decision status
            status_msg = String()
            status_msg.data = f"State: {self.robot_state}, BT Status: {status}"
            self.status_pub.publish(status_msg)

def main(args=None):
    rclpy.init(args=args)
    decision_maker = IntelligentDecisionMaker()

    try:
        rclpy.spin(decision_maker)
    except KeyboardInterrupt:
        decision_maker.get_logger().info('Decision maker stopped')
    finally:
        # Stop robot before shutdown
        cmd_vel = Twist()
        decision_maker.cmd_vel_pub.publish(cmd_vel)
        decision_maker.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Decision Making Best Practices

### 1. Modular Design
- Separate perception, planning, and control
- Use well-defined interfaces between components
- Make components reusable and testable

### 2. Robustness
- Handle sensor failures gracefully
- Include safety fallback behaviors
- Plan for unexpected situations

### 3. Performance
- Optimize critical decision paths
- Use efficient algorithms
- Consider real-time constraints

### 4. Adaptability
- Learn from experience
- Adapt to changing environments
- Handle dynamic conditions

## Chapter Summary

In this chapter, you learned:
- Behavior trees for structured decision making
- State machines for simple decision logic
- Reinforcement learning for adaptive behavior
- World models for predictive decision making
- NVIDIA Isaac's decision making capabilities
- Task planning and reasoning approaches
- Multi-robot coordination strategies
- Decision making under uncertainty

Intelligent decision making is the brain of autonomous robots, integrating perception, navigation, and task requirements to make smart choices in real-time. With NVIDIA Isaac's acceleration, these complex decision making systems can run efficiently on robotic platforms.

## Practice Tasks

1. Implement a simple behavior tree for navigation
2. Create a state machine for basic robot behaviors
3. Design a utility function for your specific application
4. Test decision making in Isaac Sim with dynamic environments
5. Evaluate different decision making approaches for your use case

## Module 3 Summary

Module 3 has covered essential AI perception and navigation concepts:
- **Chapter 9**: Introduction to NVIDIA Isaac platform
- **Chapter 10**: AI perception systems and computer vision
- **Chapter 11**: Navigation and path planning algorithms
- **Chapter 12**: Intelligent decision making and behavior trees

You now have the knowledge to:
- Set up and use NVIDIA Isaac for AI-powered robotics
- Implement perception systems using deep learning
- Create navigation systems with SLAM and path planning
- Build intelligent decision making systems for robots

These capabilities form the core of modern AI-powered robotics, enabling robots to perceive, navigate, and make intelligent decisions in complex environments.

## Next Steps

In Module 4, we'll bring everything together in a comprehensive humanoid robotics capstone project, implementing Vision-Language-Action systems that integrate all the concepts you've learned. The humanoid robot will listen to voice commands, plan actions, navigate to locations, perceive objects, and manipulate them using AI-powered systems.
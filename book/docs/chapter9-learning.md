# Chapter 9: Learning and Adaptation for Humanoid Robots

## Introduction to Robot Learning

Learning and adaptation are crucial for humanoid robots to operate effectively in dynamic environments. Unlike traditional robots programmed for specific tasks, humanoid robots must continuously adapt to new situations, learn from experience, and improve their performance over time.

## Machine Learning in Robotics

### Supervised Learning for Robot Perception

Supervised learning techniques are commonly used for perception tasks in humanoid robots:

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from torch.utils.data import Dataset, DataLoader

class RobotPerceptionNet(nn.Module):
    def __init__(self, input_channels=3, num_classes=10):
        super(RobotPerceptionNet, self).__init__()

        # Convolutional layers for feature extraction
        self.features = nn.Sequential(
            nn.Conv2d(input_channels, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((4, 4))
        )

        # Classification head
        self.classifier = nn.Sequential(
            nn.Dropout(),
            nn.Linear(128 * 4 * 4, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

class RobotPerceptionLearner:
    def __init__(self, num_classes=10):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = RobotPerceptionNet(num_classes=num_classes).to(self.device)
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        self.scheduler = optim.lr_scheduler.StepLR(self.optimizer, step_size=7, gamma=0.1)

    def train(self, train_loader, epochs=10):
        """Train the perception network"""
        self.model.train()

        for epoch in range(epochs):
            running_loss = 0.0
            correct = 0
            total = 0

            for batch_idx, (data, target) in enumerate(train_loader):
                data, target = data.to(self.device), target.to(self.device)

                self.optimizer.zero_grad()
                output = self.model(data)
                loss = self.criterion(output, target)
                loss.backward()
                self.optimizer.step()

                running_loss += loss.item()
                _, predicted = output.max(1)
                total += target.size(0)
                correct += predicted.eq(target).sum().item()

                if batch_idx % 100 == 0:
                    print(f'Epoch: {epoch}, Batch: {batch_idx}, Loss: {loss.item():.3f}')

            accuracy = 100. * correct / total
            print(f'Epoch {epoch} completed. Accuracy: {accuracy:.2f}%')

            self.scheduler.step()

    def predict(self, image_tensor):
        """Make prediction on a single image"""
        self.model.eval()
        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            output = self.model(image_tensor.unsqueeze(0))
            probabilities = torch.softmax(output, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1)
            confidence = torch.max(probabilities, dim=1)[0]

        return predicted_class.item(), confidence.item()
```

### Reinforcement Learning for Robot Control

Reinforcement learning is particularly powerful for humanoid robot control, allowing robots to learn complex behaviors through trial and error:

```python
import gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from collections import deque
import random

class ActorCritic(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super(ActorCritic, self).__init__()

        # Shared feature extractor
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU()
        )

        # Actor (policy network)
        self.actor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
            nn.Tanh()  # Actions between -1 and 1
        )

        # Critic (value network)
        self.critic = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, state):
        features = self.shared(state)
        action = self.actor(features)
        value = self.critic(features)
        return action, value

class PPOAgent:
    def __init__(self, state_dim, action_dim, lr=3e-4, gamma=0.99, eps_clip=0.2):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        self.actor_critic = ActorCritic(state_dim, action_dim).to(self.device)
        self.optimizer = optim.Adam(self.actor_critic.parameters(), lr=lr)

        self.gamma = gamma
        self.eps_clip = eps_clip
        self.buffer = []

    def select_action(self, state):
        """Select action using current policy"""
        state = torch.FloatTensor(state).to(self.device).unsqueeze(0)

        with torch.no_grad():
            action_mean, _ = self.actor_critic(state)

        # Add noise for exploration
        noise = torch.randn_like(action_mean) * 0.1
        action = torch.clamp(action_mean + noise, -1.0, 1.0)

        return action.cpu().numpy()[0]

    def compute_returns(self, rewards, dones):
        """Compute discounted returns"""
        returns = []
        R = 0

        for i in reversed(range(len(rewards))):
            if dones[i]:
                R = 0
            R = rewards[i] + self.gamma * R
            returns.insert(0, R)

        return returns

    def update(self, states, actions, rewards, dones):
        """Update policy using PPO"""
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.FloatTensor(actions).to(self.device)
        returns = self.compute_returns(rewards, dones)
        returns = torch.FloatTensor(returns).to(self.device).unsqueeze(1)

        # Current policy
        curr_actions, curr_values = self.actor_critic(states)

        # Compute advantages
        advantages = returns - curr_values

        # Compute loss
        ratio = torch.exp(curr_actions - actions)  # Simplified for continuous actions
        surr1 = ratio * advantages
        surr2 = torch.clamp(ratio, 1 - self.eps_clip, 1 + self.eps_clip) * advantages
        actor_loss = -torch.min(surr1, surr2).mean()

        critic_loss = F.mse_loss(curr_values, returns)

        loss = actor_loss + 0.5 * critic_loss

        # Update network
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
```

## Imitation Learning for Humanoid Robots

Imitation learning allows humanoid robots to learn from human demonstrations:

```python
class ImitationLearner:
    def __init__(self, state_dim, action_dim):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Behavior cloning network
        self.network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, action_dim),
            nn.Tanh()
        ).to(self.device)

        self.optimizer = optim.Adam(self.network.parameters(), lr=0.001)
        self.criterion = nn.MSELoss()

        # Storage for demonstration data
        self.demonstration_states = []
        self.demonstration_actions = []

    def add_demonstration(self, states, actions):
        """Add demonstration data"""
        self.demonstration_states.extend(states)
        self.demonstration_actions.extend(actions)

    def behavior_cloning_train(self, epochs=100):
        """Train using behavior cloning"""
        if len(self.demonstration_states) == 0:
            print("No demonstration data available")
            return

        states = torch.FloatTensor(self.demonstration_states).to(self.device)
        actions = torch.FloatTensor(self.demonstration_actions).to(self.device)

        self.network.train()

        for epoch in range(epochs):
            self.optimizer.zero_grad()

            predicted_actions = self.network(states)
            loss = self.criterion(predicted_actions, actions)

            loss.backward()
            self.optimizer.step()

            if epoch % 20 == 0:
                print(f'Epoch {epoch}, Loss: {loss.item():.4f}')

    def predict_action(self, state):
        """Predict action for given state"""
        self.network.eval()
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).to(self.device).unsqueeze(0)
            action = self.network(state_tensor)
        return action.cpu().numpy()[0]

class DAgger(ImitationLearner):
    """Dataset Aggregation algorithm for imitation learning"""

    def __init__(self, state_dim, action_dim, env):
        super().__init__(state_dim, action_dim)
        self.env = env
        self.expert_policy = None  # Function that takes state and returns action

    def set_expert_policy(self, expert_policy):
        """Set the expert policy for data collection"""
        self.expert_policy = expert_policy

    def dagger_train(self, iterations=10, episodes_per_iter=10):
        """Train using DAgger algorithm"""
        for iteration in range(iterations):
            print(f'DAgger iteration {iteration + 1}/{iterations}')

            # Collect data using current policy
            states, actions = self.collect_data(episodes_per_iter)

            # Add expert actions for these states
            expert_actions = [self.expert_policy(s) for s in states]

            # Add to demonstration dataset
            self.demonstration_states.extend(states)
            self.demonstration_actions.extend(expert_actions)

            # Retrain behavior cloning model
            self.behavior_cloning_train(epochs=50)

    def collect_data(self, num_episodes):
        """Collect data using current policy"""
        all_states = []
        all_actions = []

        for _ in range(num_episodes):
            state = self.env.reset()
            done = False

            while not done:
                # Get action from current policy
                action = self.predict_action(state)

                all_states.append(state.copy())
                all_actions.append(action.copy())

                state, reward, done, _ = self.env.step(action)

        return all_states, all_actions
```

## Learning from Human Feedback

Humanoid robots can learn from explicit human feedback to improve their behavior:

```python
class HumanFeedbackLearner:
    def __init__(self, state_dim, action_dim):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Policy network
        self.policy = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, action_dim),
            nn.Tanh()
        ).to(self.device)

        # Preference model for learning from comparisons
        self.preference_model = nn.Sequential(
            nn.Linear(state_dim * 2 + action_dim * 2, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()  # Probability that first trajectory is better
        ).to(self.device)

        self.optimizer_policy = optim.Adam(self.policy.parameters(), lr=0.001)
        self.optimizer_pref = optim.Adam(self.preference_model.parameters(), lr=0.001)

        self.feedback_buffer = []

    def add_preference_feedback(self, traj1_states, traj1_actions, traj2_states, traj2_actions, preferred_traj=1):
        """Add preference feedback where preferred_traj is 1 or 2"""
        if preferred_traj == 1:
            # traj1 is preferred over traj2
            self.feedback_buffer.append((traj1_states, traj1_actions, traj2_states, traj2_actions, 1.0))
        else:
            # traj2 is preferred over traj1
            self.feedback_buffer.append((traj2_states, traj2_actions, traj1_states, traj1_actions, 1.0))

    def train_preference_model(self, epochs=50):
        """Train the preference model"""
        if len(self.feedback_buffer) == 0:
            return

        for epoch in range(epochs):
            total_loss = 0

            for (s1, a1, s2, a2, label) in self.feedback_buffer:
                # Convert to tensors
                s1_tensor = torch.FloatTensor(s1).mean(dim=0)  # Use average state
                a1_tensor = torch.FloatTensor(a1).mean(dim=0)  # Use average action
                s2_tensor = torch.FloatTensor(s2).mean(dim=0)
                a2_tensor = torch.FloatTensor(a2).mean(dim=0)

                # Concatenate state-action pairs
                input_pair = torch.cat([s1_tensor, a1_tensor, s2_tensor, a2_tensor])

                self.optimizer_pref.zero_grad()

                pred_prob = self.preference_model(input_pair.unsqueeze(0))
                true_label = torch.FloatTensor([label]).to(self.device)

                loss = F.binary_cross_entropy(pred_prob, true_label)

                loss.backward()
                self.optimizer_pref.step()

                total_loss += loss.item()

    def get_reward_from_preference(self, state, action):
        """Get reward signal from learned preference model"""
        # This is a simplified version - in practice, you'd need to evaluate
        # the trajectory quality using the preference model
        with torch.no_grad():
            # Placeholder implementation
            return 0.0  # Would use preference model to assign reward
```

## Adaptive Control Systems

Humanoid robots need adaptive control systems that can adjust to changing conditions:

```python
class AdaptiveController:
    def __init__(self, num_joints):
        self.num_joints = num_joints

        # Initial controller parameters
        self.kp = np.array([100.0] * num_joints)  # Proportional gains
        self.ki = np.array([10.0] * num_joints)   # Integral gains
        self.kd = np.array([10.0] * num_joints)   # Derivative gains

        # Adaptive parameters
        self.error_history = deque(maxlen=100)
        self.control_effort_history = deque(maxlen=100)

        # Parameter bounds
        self.kp_min = np.array([10.0] * num_joints)
        self.kp_max = np.array([500.0] * num_joints)
        self.ki_min = np.array([1.0] * num_joints)
        self.ki_max = np.array([100.0] * num_joints)
        self.kd_min = np.array([1.0] * num_joints)
        self.kd_max = np.array([100.0] * num_joints)

    def update_gains(self, current_error, dt):
        """Adaptively update controller gains based on performance"""
        self.error_history.append(np.abs(current_error))

        if len(self.error_history) >= 10:
            # Calculate error statistics
            recent_error = np.mean(list(self.error_history)[-10:])

            # Adjust gains based on error magnitude
            for i in range(self.num_joints):
                if recent_error[i] > 0.1:  # High error - increase gains
                    self.kp[i] = min(self.kp[i] * 1.05, self.kp_max[i])
                    self.ki[i] = min(self.ki[i] * 1.02, self.ki_max[i])
                elif recent_error[i] < 0.01:  # Low error - decrease gains to reduce oscillation
                    self.kp[i] = max(self.kp[i] * 0.95, self.kp_min[i])
                    self.ki[i] = max(self.ki[i] * 0.98, self.ki_min[i])

    def compute_control(self, desired_pos, current_pos, desired_vel, current_vel, dt):
        """Compute adaptive PID control"""
        # Calculate errors
        pos_error = desired_pos - current_pos
        vel_error = desired_vel - current_vel

        # Update adaptive gains
        self.update_gains(pos_error, dt)

        # PID control with adaptive gains
        proportional = self.kp * pos_error
        integral = self.ki * np.array(self.error_history).sum(axis=0) * dt if len(self.error_history) > 0 else np.zeros_like(pos_error)
        derivative = self.kd * vel_error

        control_output = proportional + integral + derivative

        return control_output

class ModelLearningSystem:
    """System for learning and adapting robot dynamics models"""

    def __init__(self, state_dim, action_dim):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Dynamics model: predicts next state given current state and action
        self.dynamics_model = nn.Sequential(
            nn.Linear(state_dim + action_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, state_dim)
        ).to(self.device)

        self.optimizer = optim.Adam(self.dynamics_model.parameters(), lr=0.001)
        self.criterion = nn.MSELoss()

        self.experience_buffer = deque(maxlen=10000)

    def add_experience(self, state, action, next_state):
        """Add experience to buffer"""
        self.experience_buffer.append((state, action, next_state))

    def train_dynamics_model(self, batch_size=32, epochs=10):
        """Train the dynamics model"""
        if len(self.experience_buffer) < batch_size:
            return

        for epoch in range(epochs):
            batch = random.sample(list(self.experience_buffer), batch_size)

            states = torch.FloatTensor([exp[0] for exp in batch]).to(self.device)
            actions = torch.FloatTensor([exp[1] for exp in batch]).to(self.device)
            next_states = torch.FloatTensor([exp[2] for exp in batch]).to(self.device)

            # Concatenate state and action
            state_action = torch.cat([states, actions], dim=1)

            self.optimizer.zero_grad()

            predicted_next_states = self.dynamics_model(state_action)
            loss = self.criterion(predicted_next_states, next_states)

            loss.backward()
            self.optimizer.step()

    def predict_next_state(self, state, action):
        """Predict next state given current state and action"""
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).to(self.device).unsqueeze(0)
            action_tensor = torch.FloatTensor(action).to(self.device).unsqueeze(0)

            state_action = torch.cat([state_tensor, action_tensor], dim=1)
            predicted_state = self.dynamics_model(state_action)

        return predicted_state.cpu().numpy()[0]
```

## Online Learning and Adaptation

Humanoid robots need to learn and adapt in real-time during operation:

```python
class OnlineLearner:
    def __init__(self, num_features=100):
        self.num_features = num_features
        self.learning_rate = 0.01

        # Online learning parameters
        self.weights = np.random.normal(0, 0.1, num_features)
        self.feature_buffer = deque(maxlen=1000)
        self.reward_buffer = deque(maxlen=1000)

        # For incremental updates
        self.feature_mean = np.zeros(num_features)
        self.feature_var = np.ones(num_features)
        self.sample_count = 0

    def extract_features(self, state, action):
        """Extract features from state-action pair"""
        # Simple feature extraction - in practice, this would be more sophisticated
        features = np.concatenate([
            state.flatten(),
            action.flatten(),
            np.sin(state.flatten()),
            np.cos(action.flatten())
        ])

        # Ensure we have the right number of features
        if len(features) > self.num_features:
            features = features[:self.num_features]
        elif len(features) < self.num_features:
            features = np.pad(features, (0, self.num_features - len(features)))

        return features

    def update(self, state, action, reward):
        """Update the learner with new experience"""
        features = self.extract_features(state, action)

        # Normalize features incrementally
        if self.sample_count == 0:
            self.feature_mean = features.copy()
            self.feature_var = np.ones_like(features) * 0.1
        else:
            # Incremental mean and variance update
            self.feature_mean = (self.feature_mean * self.sample_count + features) / (self.sample_count + 1)
            self.feature_var = (self.feature_var * self.sample_count + (features - self.feature_mean)**2) / (self.sample_count + 1)

        self.sample_count += 1

        # Normalize features
        normalized_features = (features - self.feature_mean) / (np.sqrt(self.feature_var) + 1e-8)

        # Store for learning
        self.feature_buffer.append(normalized_features)
        self.reward_buffer.append(reward)

        # Update weights using stochastic gradient descent
        if len(self.feature_buffer) > 1:
            # Use the most recent experience
            recent_features = self.feature_buffer[-1]
            recent_reward = self.reward_buffer[-1]

            # Compute prediction error
            prediction = np.dot(self.weights, recent_features)
            error = recent_reward - prediction

            # Update weights
            self.weights += self.learning_rate * error * recent_features

    def predict_value(self, state, action):
        """Predict the value of a state-action pair"""
        features = self.extract_features(state, action)
        normalized_features = (features - self.feature_mean) / (np.sqrt(self.feature_var) + 1e-8)
        return np.dot(self.weights, normalized_features)
```

## Integration with ROS 2

### Learning Node Implementation

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray
from sensor_msgs.msg import JointState
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import Float32

class LearningNode(Node):
    def __init__(self):
        super().__init__('learning_node')

        # Publishers
        self.performance_pub = self.create_publisher(Float32, 'learning_performance', 10)
        self.adaptation_pub = self.create_publisher(Float32MultiArray, 'adaptation_params', 10)

        # Subscribers
        self.joint_sub = self.create_subscription(
            JointState, 'joint_states', self.joint_callback, 10
        )
        self.task_sub = self.create_subscription(
            Float32MultiArray, 'task_performance', self.task_callback, 10
        )

        # Initialize learning components
        self.imitation_learner = ImitationLearner(state_dim=12, action_dim=6)  # Example dimensions
        self.adaptive_controller = AdaptiveController(num_joints=6)
        self.online_learner = OnlineLearner(num_features=50)

        # Timer for learning updates
        self.learning_timer = self.create_timer(1.0, self.learning_step)

        # Internal state
        self.current_joint_states = None
        self.task_performance = 0.0

        self.get_logger().info('Learning node initialized')

    def joint_callback(self, msg: JointState):
        """Update with current joint states"""
        self.current_joint_states = np.array(msg.position)

    def task_callback(self, msg: Float32MultiArray):
        """Update with task performance feedback"""
        if len(msg.data) > 0:
            self.task_performance = msg.data[0]

    def learning_step(self):
        """Main learning step"""
        if self.current_joint_states is not None:
            # Example: update online learner with current performance
            dummy_action = np.zeros(6)  # Placeholder action
            self.online_learner.update(
                self.current_joint_states,
                dummy_action,
                self.task_performance
            )

            # Publish performance
            perf_msg = Float32()
            perf_msg.data = self.task_performance
            self.performance_pub.publish(perf_msg)
```

## Challenges in Robot Learning

### Sample Efficiency

Robot learning faces significant sample efficiency challenges:

- Physical robots are expensive to operate
- Each learning trial takes time and energy
- Safety constraints limit exploration

### Transfer Learning

Transferring learned behaviors across different robots or environments:

- Domain adaptation techniques
- Sim-to-real transfer
- Multi-task learning

### Safety and Robustness

Ensuring learned behaviors are safe and robust:

- Safe exploration strategies
- Robustness to environmental changes
- Failure detection and recovery

## Practice Tasks

1. Implement a simple imitation learning algorithm for a humanoid robot task
2. Create a reinforcement learning environment for humanoid robot control
3. Develop an adaptive controller that adjusts to changing loads
4. Design a human feedback system for robot learning
5. Test learning algorithms in simulation with humanoid robots

## Summary

Learning and adaptation are essential capabilities for humanoid robots to operate effectively in dynamic environments. By implementing various learning techniques - from supervised learning for perception to reinforcement learning for control, and from imitation learning to human feedback integration - humanoid robots can continuously improve their performance and adapt to new situations.
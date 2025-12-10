# Chapter 11: Safety and Ethics in Humanoid Robotics

## Introduction to Safety and Ethics

As humanoid robots become more prevalent in human environments, ensuring their safe and ethical operation becomes paramount. Unlike industrial robots confined to cages, humanoid robots operate in close proximity to humans, requiring sophisticated safety mechanisms and ethical considerations that address the complex interactions between humans and anthropomorphic machines.

## Safety Standards and Frameworks

### International Safety Standards

Humanoid robots must comply with various international safety standards:

```python
class SafetyStandard:
    def __init__(self, name, description, requirements):
        self.name = name
        self.description = description
        self.requirements = requirements

class SafetyComplianceManager:
    def __init__(self):
        self.standards = {
            'ISO 13482': SafetyStandard(
                'Personal Care Robots',
                'Safety requirements for personal care robots including humanoid service robots',
                [
                    'Emergency stop functionality',
                    'Collision detection and avoidance',
                    'Safe maximum speeds and forces',
                    'Privacy protection measures'
                ]
            ),
            'ISO 12100': SafetyStandard(
                'Machinery Safety',
                'Basic concepts, general principles for risk assessment and risk reduction',
                [
                    'Risk assessment procedures',
                    'Safety-related control systems',
                    'Guarding and protective devices',
                    'Information for use (instructions, warnings)'
                ]
            ),
            'ISO 13482-1': SafetyStandard(
                'Robots and Robotic Devices - Personal Care Robots - Part 1: Safety Requirements',
                'Specific safety requirements for personal care robots',
                [
                    'Physical safety (mechanical, electrical, thermal)',
                    'Functional safety (system failures, error states)',
                    'Information security (data protection, privacy)',
                    'Psychological safety (stress, anxiety reduction)'
                ]
            )
        }
        self.compliance_status = {}

    def assess_compliance(self, robot_specifications):
        """Assess compliance with safety standards"""
        compliance_report = {}

        for standard_name, standard in self.standards.items():
            compliant_requirements = []
            non_compliant_requirements = []

            for requirement in standard.requirements:
                is_compliant = self.check_requirement_compliance(requirement, robot_specifications)
                if is_compliant:
                    compliant_requirements.append(requirement)
                else:
                    non_compliant_requirements.append(requirement)

            compliance_report[standard_name] = {
                'total_requirements': len(standard.requirements),
                'compliant': len(compliant_requirements),
                'non_compliant': len(non_compliant_requirements),
                'compliant_requirements': compliant_requirements,
                'non_compliant_requirements': non_compliant_requirements
            }

        return compliance_report

    def check_requirement_compliance(self, requirement, robot_specifications):
        """Check if a specific requirement is met"""
        # This would contain detailed checks for each requirement
        # For example, checking max force limits, speed limits, etc.
        return True  # Placeholder - actual implementation would be specific to requirement

    def generate_safety_report(self, compliance_report):
        """Generate a comprehensive safety compliance report"""
        report = f"""
# Safety Compliance Report

## Overall Compliance Status

"""
        for standard_name, status in compliance_report.items():
            compliance_percentage = (status['compliant'] / status['total_requirements']) * 100
            report += f"- {standard_name}: {compliance_percentage:.1f}% compliant ({status['compliant']}/{status['total_requirements']} requirements)\n"

        report += f"""

## Detailed Compliance Analysis

"""
        for standard_name, status in compliance_report.items():
            report += f"### {standard_name}\n\n"
            report += f"**Compliant Requirements ({len(status['compliant_requirements'])}):**\n"
            for req in status['compliant_requirements']:
                report += f"- {req}\n"

            if status['non_compliant_requirements']:
                report += f"\n**Non-Compliant Requirements ({len(status['non_compliant_requirements'])}):**\n"
                for req in status['non_compliant_requirements']:
                    report += f"- {req}\n"

            report += "\n"

        return report
```

## Risk Assessment and Management

### Dynamic Risk Assessment System

```python
import numpy as np
from enum import Enum
from typing import Dict, List, Tuple

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskFactor(Enum):
    COLLISION = "collision"
    SPEED = "speed"
    FORCE = "force"
    PROXIMITY = "proximity"
    UNCERTAINTY = "uncertainty"
    ENVIRONMENT = "environment"

class DynamicRiskAssessment:
    def __init__(self):
        self.risk_thresholds = {
            RiskLevel.LOW: 0.2,
            RiskLevel.MEDIUM: 0.5,
            RiskLevel.HIGH: 0.8,
            RiskLevel.CRITICAL: 1.0
        }

        self.factor_weights = {
            RiskFactor.COLLISION: 0.3,
            RiskFactor.SPEED: 0.2,
            RiskFactor.FORCE: 0.25,
            RiskFactor.PROXIMITY: 0.15,
            RiskFactor.UNCERTAINTY: 0.05,
            RiskFactor.ENVIRONMENT: 0.05
        }

    def assess_risk(self, robot_state, environment_state, human_state) -> Tuple[RiskLevel, Dict]:
        """Assess current risk level based on multiple factors"""
        risk_factors = {}

        # Collision risk assessment
        risk_factors[RiskFactor.COLLISION] = self.assess_collision_risk(robot_state, human_state)

        # Speed risk assessment
        risk_factors[RiskFactor.SPEED] = self.assess_speed_risk(robot_state)

        # Force risk assessment
        risk_factors[RiskFactor.FORCE] = self.assess_force_risk(robot_state)

        # Proximity risk assessment
        risk_factors[RiskFactor.PROXIMITY] = self.assess_proximity_risk(robot_state, human_state)

        # Uncertainty risk assessment
        risk_factors[RiskFactor.UNCERTAINTY] = self.assess_uncertainty_risk(robot_state)

        # Environment risk assessment
        risk_factors[RiskFactor.ENVIRONMENT] = self.assess_environment_risk(environment_state)

        # Calculate weighted risk score
        total_risk = 0.0
        for factor, score in risk_factors.items():
            total_risk += score * self.factor_weights[factor]

        # Determine risk level
        risk_level = self.get_risk_level(total_risk)

        return risk_level, risk_factors

    def assess_collision_risk(self, robot_state, human_state) -> float:
        """Assess collision risk based on trajectories and positions"""
        # Calculate minimum distance between robot and humans
        robot_pos = np.array(robot_state['position'])
        min_distance = float('inf')

        for human in human_state:
            human_pos = np.array(human['position'])
            distance = np.linalg.norm(robot_pos - human_pos)
            min_distance = min(min_distance, distance)

        # Risk increases as distance decreases
        # Using inverse relationship with safety margin
        safety_margin = 0.8  # meters
        if min_distance < safety_margin:
            return min(1.0, (safety_margin - min_distance) / safety_margin)
        else:
            return 0.0

    def assess_speed_risk(self, robot_state) -> float:
        """Assess risk based on robot speed"""
        current_speed = np.linalg.norm(robot_state['velocity'])
        max_safe_speed = 1.0  # m/s for safe operation near humans

        if current_speed > max_safe_speed:
            return min(1.0, (current_speed - max_safe_speed) / max_safe_speed)
        else:
            return current_speed / max_safe_speed

    def assess_force_risk(self, robot_state) -> float:
        """Assess risk based on applied forces"""
        # Check joint torques and forces
        max_safe_force = 150.0  # Newtons

        current_force = max(robot_state.get('applied_forces', [0.0]))
        return min(1.0, current_force / max_safe_force)

    def assess_proximity_risk(self, robot_state, human_state) -> float:
        """Assess risk based on proximity to humans"""
        robot_pos = np.array(robot_state['position'])

        for human in human_state:
            human_pos = np.array(human['position'])
            distance = np.linalg.norm(robot_pos - human_pos)

            # Higher risk when in personal space (0.45-1.2m)
            if 0.45 <= distance <= 1.2:
                return 0.7
            elif distance < 0.45:  # In personal space
                return 1.0
            elif distance > 3.6:  # In public space
                return 0.1

        return 0.3  # In social space

    def assess_uncertainty_risk(self, robot_state) -> float:
        """Assess risk based on system uncertainty"""
        # Factors: sensor uncertainty, localization uncertainty, etc.
        localization_uncertainty = robot_state.get('localization_uncertainty', 0.0)
        sensor_uncertainty = robot_state.get('sensor_uncertainty', 0.0)

        avg_uncertainty = (localization_uncertainty + sensor_uncertainty) / 2.0
        return min(1.0, avg_uncertainty * 5.0)  # Scale uncertainty to 0-1 range

    def assess_environment_risk(self, environment_state) -> float:
        """Assess risk based on environmental factors"""
        # Consider obstacles, lighting, noise, etc.
        obstacle_density = environment_state.get('obstacle_density', 0.0)
        visibility = environment_state.get('visibility', 1.0)  # 0-1 scale

        # Higher obstacle density increases risk
        # Lower visibility increases risk
        env_risk = obstacle_density * (1.0 - visibility)
        return min(1.0, env_risk)

    def get_risk_level(self, risk_score: float) -> RiskLevel:
        """Convert risk score to risk level"""
        if risk_score <= self.risk_thresholds[RiskLevel.LOW]:
            return RiskLevel.LOW
        elif risk_score <= self.risk_thresholds[RiskLevel.MEDIUM]:
            return RiskLevel.MEDIUM
        elif risk_score <= self.risk_thresholds[RiskLevel.HIGH]:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL
```

## Safety Control Systems

### Emergency Stop and Safe Motion Control

```python
import numpy as np
import threading
import time

class SafetyController:
    def __init__(self):
        self.emergency_stop_active = False
        self.safety_enabled = True
        self.current_risk_level = RiskLevel.LOW
        self.safety_callbacks = []

        # Safe motion parameters
        self.safe_speed_limits = {
            RiskLevel.LOW: 1.0,      # m/s
            RiskLevel.MEDIUM: 0.5,   # m/s
            RiskLevel.HIGH: 0.2,     # m/s
            RiskLevel.CRITICAL: 0.0  # m/s (stop)
        }

        # Force limits for safe interaction
        self.force_limits = {
            'contact_force': 50.0,   # Newtons
            'impact_force': 100.0,   # Newtons
            'grip_force': 30.0       # Newtons for manipulation
        }

    def enable_safety(self):
        """Enable safety systems"""
        self.safety_enabled = True
        print("Safety systems enabled")

    def disable_safety(self):
        """Disable safety systems (for maintenance only)"""
        self.safety_enabled = False
        print("Safety systems disabled - MAINTENANCE MODE")

    def trigger_emergency_stop(self):
        """Trigger emergency stop"""
        self.emergency_stop_active = True
        self.execute_emergency_stop()
        print("EMERGENCY STOP ACTIVATED")

    def clear_emergency_stop(self):
        """Clear emergency stop condition"""
        self.emergency_stop_active = False
        print("Emergency stop cleared")

    def execute_emergency_stop(self):
        """Execute emergency stop procedures"""
        # Stop all joint motors
        self.stop_all_motors()

        # Disable actuators
        self.disable_actuators()

        # Trigger safety callbacks
        for callback in self.safety_callbacks:
            callback("EMERGENCY_STOP")

    def stop_all_motors(self):
        """Stop all robot motors safely"""
        # Implementation would send stop commands to all joint controllers
        print("All motors stopped")

    def disable_actuators(self):
        """Disable all actuators"""
        # Implementation would disable all actuator power
        print("All actuators disabled")

    def register_safety_callback(self, callback):
        """Register a callback function for safety events"""
        self.safety_callbacks.append(callback)

    def check_and_limit_motion(self, target_velocity, risk_level):
        """Check and limit motion based on risk level"""
        if not self.safety_enabled or self.emergency_stop_active:
            return np.zeros_like(target_velocity)

        max_speed = self.safe_speed_limits[risk_level]
        current_speed = np.linalg.norm(target_velocity)

        if current_speed > max_speed:
            # Scale down velocity to safe limit
            scale_factor = max_speed / current_speed
            limited_velocity = target_velocity * scale_factor
            return limited_velocity
        else:
            return target_velocity

    def check_force_limits(self, applied_forces):
        """Check if applied forces exceed safety limits"""
        violations = []

        for force_type, limit in self.force_limits.items():
            if applied_forces.get(force_type, 0) > limit:
                violations.append(f"{force_type} exceeds limit: {applied_forces[force_type]} > {limit}")

        return len(violations) == 0, violations

class CollisionAvoidanceSystem:
    def __init__(self):
        self.proximity_threshold = 0.5  # meters
        self.collision_buffer = 0.3     # meters
        self.safety_controller = SafetyController()

    def check_collision_risk(self, robot_pose, obstacles, humans):
        """Check for potential collision risks"""
        collision_risk = False
        closest_distance = float('inf')

        # Check against obstacles
        for obstacle in obstacles:
            distance = self.calculate_distance(robot_pose, obstacle)
            if distance < (self.proximity_threshold + self.collision_buffer):
                collision_risk = True
                closest_distance = min(closest_distance, distance)

        # Check against humans
        for human in humans:
            distance = self.calculate_distance(robot_pose, human)
            if distance < (self.proximity_threshold + self.collision_buffer):
                collision_risk = True
                closest_distance = min(closest_distance, distance)

        return collision_risk, closest_distance

    def calculate_distance(self, pose1, pose2):
        """Calculate distance between two poses"""
        pos1 = np.array([pose1['x'], pose1['y'], pose1['z']])
        pos2 = np.array([pose2['x'], pose2['y'], pose2['z']])
        return np.linalg.norm(pos1 - pos2)

    def generate_avoidance_trajectory(self, current_pose, target_pose, obstacles, humans):
        """Generate collision-free trajectory"""
        # Simple potential field approach
        # In practice, this would use more sophisticated path planning

        current_pos = np.array([current_pose['x'], current_pose['y'], current_pose['z']])
        target_pos = np.array([target_pose['x'], target_pose['y'], target_pose['z']])

        # Calculate desired direction
        desired_direction = target_pos - current_pos
        desired_direction = desired_direction / np.linalg.norm(desired_direction)

        # Calculate repulsive forces from obstacles
        repulsive_force = np.zeros(3)

        for obstacle in obstacles:
            obs_pos = np.array([obstacle['x'], obstacle['y'], obstacle['z']])
            direction_to_robot = current_pos - obs_pos
            distance = np.linalg.norm(direction_to_robot)

            if distance < self.proximity_threshold:
                # Normalize direction and apply repulsive force
                direction_to_robot = direction_to_robot / distance
                repulsive_magnitude = (self.proximity_threshold - distance) * 10.0
                repulsive_force += direction_to_robot * repulsive_magnitude

        # Calculate final direction combining desired and repulsive
        final_direction = desired_direction * 5.0 + repulsive_force  # Weighted combination
        final_direction = final_direction / np.linalg.norm(final_direction)

        # Return new target that avoids obstacles
        new_target = current_pos + final_direction * 0.1  # Small step
        return {
            'x': new_target[0],
            'y': new_target[1],
            'z': new_target[2]
        }
```

## Ethical Considerations

### Ethical Decision Making Framework

```python
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Any

class EthicalPrinciple(Enum):
    BENEFICENCE = "beneficence"  # Do good
    NON_MALEFICENCE = "non-maleficence"  # Do no harm
    AUTONOMY = "autonomy"  # Respect human autonomy
    JUSTICE = "justice"  # Fair treatment
    DIGNITY = "dignity"  # Respect human dignity

@dataclass
class EthicalDilemma:
    situation: str
    options: List[str]
    affected_parties: List[str]
    potential_consequences: List[Dict[str, Any]]

class EthicalDecisionEngine:
    def __init__(self):
        self.principles = {
            EthicalPrinciple.BENEFICENCE: 1.0,
            EthicalPrinciple.NON_MALEFICENCE: 1.0,
            EthicalPrinciple.AUTONOMY: 1.0,
            EthicalPrinciple.JUSTICE: 1.0,
            EthicalPrinciple.DIGNITY: 1.0
        }

        self.dilemma_database = []  # Predefined dilemmas for training

    def evaluate_action_ethically(self, action: str, context: Dict) -> Dict:
        """Evaluate an action based on ethical principles"""
        evaluation = {
            'action': action,
            'ethical_score': 0.0,
            'principle_scores': {},
            'risks': [],
            'benefits': []
        }

        # Evaluate against each principle
        for principle in EthicalPrinciple:
            score = self.evaluate_principle(action, context, principle)
            evaluation['principle_scores'][principle.value] = score
            evaluation['ethical_score'] += score * self.principles[principle]

        # Normalize score
        evaluation['ethical_score'] /= len(EthicalPrinciple)

        return evaluation

    def evaluate_principle(self, action: str, context: Dict, principle: EthicalPrinciple) -> float:
        """Evaluate how well an action adheres to a specific principle"""
        if principle == EthicalPrinciple.NON_MALEFICENCE:
            # Check if action causes harm
            potential_harm = self.assess_potential_harm(action, context)
            return 1.0 - min(1.0, potential_harm)  # Lower harm = higher score

        elif principle == EthicalPrinciple.BENEFICENCE:
            # Check if action provides benefit
            potential_benefit = self.assess_potential_benefit(action, context)
            return min(1.0, potential_benefit)

        elif principle == EthicalPrinciple.AUTONOMY:
            # Check if action respects human autonomy
            autonomy_impact = self.assess_autonomy_impact(action, context)
            return autonomy_impact

        elif principle == EthicalPrinciple.JUSTICE:
            # Check if action is fair
            fairness_score = self.assess_fairness(action, context)
            return fairness_score

        elif principle == EthicalPrinciple.DIGNITY:
            # Check if action respects human dignity
            dignity_score = self.assess_dignity_impact(action, context)
            return dignity_score

        return 0.5  # Neutral default

    def assess_potential_harm(self, action: str, context: Dict) -> float:
        """Assess potential harm from an action"""
        # This would involve complex analysis of the action and context
        # For now, using simplified rules
        harm_indicators = [
            'push', 'force', 'compel', 'restrict', 'harm', 'danger'
        ]

        action_lower = action.lower()
        harm_score = 0.0

        for indicator in harm_indicators:
            if indicator in action_lower:
                harm_score += 0.3

        # Consider context
        if context.get('human_proximity', 0) < 1.0:  # Close to human
            harm_score *= 1.5

        return min(1.0, harm_score)

    def assess_potential_benefit(self, action: str, context: Dict) -> float:
        """Assess potential benefit from an action"""
        benefit_indicators = [
            'help', 'assist', 'support', 'aid', 'benefit', 'improve'
        ]

        action_lower = action.lower()
        benefit_score = 0.0

        for indicator in benefit_indicators:
            if indicator in action_lower:
                benefit_score += 0.3

        # Consider context
        if context.get('human_need', False):
            benefit_score *= 1.2

        return min(1.0, benefit_score)

    def assess_autonomy_impact(self, action: str, context: Dict) -> float:
        """Assess impact on human autonomy"""
        autonomy_restrictors = [
            'force', 'compel', 'require', 'obligate', 'command'
        ]

        action_lower = action.lower()
        autonomy_score = 1.0  # Start with full autonomy respect

        for restrictor in autonomy_restrictors:
            if restrictor in action_lower:
                autonomy_score -= 0.4

        # Respect for human decisions
        if context.get('human_preference_respected', True):
            autonomy_score = min(1.0, autonomy_score + 0.2)

        return max(0.0, autonomy_score)

    def assess_fairness(self, action: str, context: Dict) -> float:
        """Assess fairness of an action"""
        # Check if action treats different people equally
        if context.get('discrimination_risk', False):
            return 0.3
        elif context.get('equal_treatment', True):
            return 0.9
        else:
            return 0.6

    def assess_dignity_impact(self, action: str, context: Dict) -> float:
        """Assess impact on human dignity"""
        dignity_violators = [
            'ignore', 'disregard', 'treat_as_object', 'disrespect'
        ]

        action_lower = action.lower()
        dignity_score = 1.0

        for violator in dignity_violators:
            if violator in action_lower:
                dignity_score -= 0.5

        return max(0.0, dignity_score)

    def resolve_ethical_dilemma(self, dilemma: EthicalDilemma) -> str:
        """Resolve an ethical dilemma by evaluating options"""
        best_option = dilemma.options[0]
        best_score = -1.0

        for option in dilemma.options:
            context = {
                'situation': dilemma.situation,
                'affected_parties': dilemma.affected_parties
            }

            evaluation = self.evaluate_action_ethically(option, context)
            score = evaluation['ethical_score']

            if score > best_score:
                best_score = score
                best_option = option

        return best_option
```

## Privacy and Data Protection

### Privacy-Preserving Systems

```python
import hashlib
import json
from datetime import datetime, timedelta
import numpy as np

class PrivacyManager:
    def __init__(self):
        self.data_retention_policies = {
            'face_images': timedelta(days=7),
            'voice_recordings': timedelta(days=30),
            'interaction_logs': timedelta(days=90),
            'location_data': timedelta(days=7),
            'behavioral_data': timedelta(days=180)
        }

        self.privacy_settings = {
            'face_recognition': True,
            'voice_analysis': True,
            'behavior_tracking': True,
            'data_sharing': False,
            'cloud_storage': False
        }

    def anonymize_data(self, data, data_type):
        """Anonymize sensitive data"""
        if data_type == 'face_image':
            return self.anonymize_face(data)
        elif data_type == 'voice':
            return self.anonymize_voice(data)
        elif data_type == 'location':
            return self.anonymize_location(data)
        else:
            return data

    def anonymize_face(self, face_data):
        """Anonymize facial data"""
        # Apply blurring or pixelation
        # In practice, this would use image processing techniques
        return {
            'anonymized': True,
            'original_hash': hashlib.sha256(str(face_data).encode()).hexdigest(),
            'timestamp': datetime.now().isoformat()
        }

    def anonymize_voice(self, voice_data):
        """Anonymize voice data"""
        # Apply voice conversion or remove identifying characteristics
        return {
            'anonymized': True,
            'voice_signature_removed': True,
            'timestamp': datetime.now().isoformat()
        }

    def anonymize_location(self, location_data):
        """Anonymize location data"""
        # Add noise or generalize location
        noise = np.random.normal(0, 0.001, 2)  # ~100m noise
        return {
            'original': location_data,
            'anonymized': [location_data[0] + noise[0], location_data[1] + noise[1]],
            'timestamp': datetime.now().isoformat()
        }

    def enforce_data_retention(self, data_store):
        """Enforce data retention policies"""
        current_time = datetime.now()
        purged_count = 0

        for data_type, retention_period in self.data_retention_policies.items():
            if data_type in data_store:
                cutoff_time = current_time - retention_period

                # Remove old data
                data_store[data_type] = [
                    item for item in data_store[data_type]
                    if datetime.fromisoformat(item.get('timestamp', current_time.isoformat())) >= cutoff_time
                ]

                purged_count += len([item for item in data_store[data_type]
                                   if datetime.fromisoformat(item.get('timestamp', current_time.isoformat())) < cutoff_time])

        return purged_count

    def check_privacy_compliance(self, action, user_data):
        """Check if an action complies with privacy settings"""
        if action == 'face_recognition' and not self.privacy_settings['face_recognition']:
            return False, "Face recognition disabled by user"

        if action == 'voice_analysis' and not self.privacy_settings['voice_analysis']:
            return False, "Voice analysis disabled by user"

        if action == 'behavior_tracking' and not self.privacy_settings['behavior_tracking']:
            return False, "Behavior tracking disabled by user"

        return True, "Action compliant with privacy settings"

    def generate_privacy_report(self, data_store):
        """Generate a privacy compliance report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'data_types_collected': list(data_store.keys()),
            'retention_compliance': {},
            'privacy_violations': []
        }

        for data_type, data_list in data_store.items():
            retention_policy = self.data_retention_policies.get(data_type, timedelta(days=30))
            cutoff = datetime.now() - retention_policy

            non_compliant = [d for d in data_list
                           if datetime.fromisoformat(d.get('timestamp', datetime.now().isoformat())) < cutoff]

            report['retention_compliance'][data_type] = {
                'total_records': len(data_list),
                'non_compliant': len(non_compliant),
                'compliance_rate': (len(data_list) - len(non_compliant)) / len(data_list) if data_list else 1.0
            }

        return report
```

## Safety and Ethics Integration

### ROS 2 Safety Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Bool, String
from sensor_msgs.msg import JointState
from geometry_msgs.msg import PoseStamped
from builtin_interfaces.msg import Time

class SafetyEthicsNode(Node):
    def __init__(self):
        super().__init__('safety_ethics_node')

        # Publishers
        self.emergency_stop_pub = self.create_publisher(Bool, 'emergency_stop', 10)
        self.safety_status_pub = self.create_publisher(String, 'safety_status', 10)
        self.ethics_decision_pub = self.create_publisher(String, 'ethics_decision', 10)

        # Subscribers
        self.joint_state_sub = self.create_subscription(
            JointState, 'joint_states', self.joint_state_callback, 10
        )
        self.pose_sub = self.create_subscription(
            PoseStamped, 'robot_pose', self.pose_callback, 10
        )
        self.human_proximity_sub = self.create_subscription(
            PoseStamped, 'human_proximity', self.human_proximity_callback, 10
        )

        # Initialize safety and ethics systems
        self.risk_assessor = DynamicRiskAssessment()
        self.safety_controller = SafetyController()
        self.ethics_engine = EthicalDecisionEngine()
        self.privacy_manager = PrivacyManager()

        # Timer for continuous safety monitoring
        self.safety_timer = self.create_timer(0.1, self.safety_check)

        # Internal state
        self.current_robot_state = {
            'position': [0.0, 0.0, 0.0],
            'velocity': [0.0, 0.0, 0.0],
            'applied_forces': [0.0],
            'localization_uncertainty': 0.0,
            'sensor_uncertainty': 0.0
        }
        self.human_states = []
        self.environment_state = {
            'obstacle_density': 0.0,
            'visibility': 1.0
        }

        self.get_logger().info('Safety and Ethics node initialized')

    def joint_state_callback(self, msg: JointState):
        """Update robot state from joint information"""
        # Update velocity and other state information from joint states
        if len(msg.velocity) > 0:
            self.current_robot_state['velocity'] = list(msg.velocity)

    def pose_callback(self, msg: PoseStamped):
        """Update robot pose"""
        self.current_robot_state['position'] = [
            msg.pose.position.x,
            msg.pose.position.y,
            msg.pose.position.z
        ]

    def human_proximity_callback(self, msg: PoseStamped):
        """Update human proximity information"""
        human_state = {
            'position': [msg.pose.position.x, msg.pose.position.y, msg.pose.position.z],
            'timestamp': self.get_clock().now().to_msg()
        }
        self.human_states.append(human_state)

        # Keep only recent human states (last 5 seconds)
        current_time = self.get_clock().now().nanoseconds / 1e9
        self.human_states = [
            h for h in self.human_states
            if abs(current_time - h['timestamp'].sec) < 5.0
        ]

    def safety_check(self):
        """Main safety and ethics check loop"""
        # Assess current risk level
        risk_level, risk_factors = self.risk_assessor.assess_risk(
            self.current_robot_state,
            self.environment_state,
            self.human_states
        )

        # Publish safety status
        status_msg = String()
        status_msg.data = f"RISK_LEVEL: {risk_level.value}, FACTORS: {dict(risk_factors)}"
        self.safety_status_pub.publish(status_msg)

        # Take safety actions based on risk level
        if risk_level == RiskLevel.CRITICAL:
            self.safety_controller.trigger_emergency_stop()
        elif risk_level == RiskLevel.HIGH:
            # Limit speeds and forces
            pass
        elif risk_level == RiskLevel.MEDIUM:
            # Increase caution
            pass

        # Perform ethical evaluation for significant actions
        # This would be triggered by specific robot behaviors
        self.check_ethical_compliance()

    def check_ethical_compliance(self):
        """Check if robot actions are ethically compliant"""
        # Example: Check if the robot is about to perform an action
        # that might raise ethical concerns
        context = {
            'human_proximity': len(self.human_states) > 0,
            'robot_state': self.current_robot_state
        }

        # Evaluate potential ethical issues
        for principle in EthicalPrinciple:
            # Check if current robot state might violate ethical principles
            if self.would_violate_principle(principle, context):
                # Log ethical concern
                ethics_msg = String()
                ethics_msg.data = f"ETHICAL_CONCERN: {principle.value} may be violated"
                self.ethics_decision_pub.publish(ethics_msg)

    def would_violate_principle(self, principle: EthicalPrinciple, context: Dict) -> bool:
        """Check if current state would violate an ethical principle"""
        # This would contain specific checks for each principle
        if principle == EthicalPrinciple.NON_MALEFICENCE:
            # Check if robot is in position to cause harm
            if context.get('human_proximity', False):
                risk_score = self.risk_assessor.assess_risk(
                    context['robot_state'],
                    self.environment_state,
                    self.human_states
                )[0].value
                return risk_score in [RiskLevel.HIGH.value, RiskLevel.CRITICAL.value]

        return False
```

## Safety Testing and Validation

### Safety Test Framework

```python
import unittest
import numpy as np
from typing import Dict, List

class SafetyTestFramework:
    def __init__(self):
        self.test_results = []
        self.test_coverage = {
            'collision_avoidance': False,
            'emergency_stop': False,
            'force_limiting': False,
            'ethical_decision': False,
            'privacy_protection': False
        }

    def run_safety_tests(self) -> Dict:
        """Run comprehensive safety tests"""
        test_suite = unittest.TestSuite()

        # Add safety test cases
        test_suite.addTest(unittest.makeSuite(CollisionAvoidanceTests))
        test_suite.addTest(unittest.makeSuite(EmergencyStopTests))
        test_suite.addTest(unittest.makeSuite(ForceLimitingTests))
        test_suite.addTest(unittest.makeSuite(EthicsTests))

        # Run tests
        runner = unittest.TextTestRunner(stream=open('/dev/null', 'w'))
        result = runner.run(test_suite)

        # Compile results
        results = {
            'total_tests': result.testsRun,
            'passed': result.testsRun - len(result.failures) - len(result.errors),
            'failed': len(result.failures) + len(result.errors),
            'failures': [str(f[0]) for f in result.failures],
            'errors': [str(e[0]) for e in result.errors]
        }

        return results

class CollisionAvoidanceTests(unittest.TestCase):
    def setUp(self):
        self.collision_system = CollisionAvoidanceSystem()

    def test_obstacle_detection(self):
        """Test that obstacles are properly detected"""
        robot_pose = {'x': 0.0, 'y': 0.0, 'z': 0.0}
        obstacles = [{'x': 0.4, 'y': 0.0, 'z': 0.0}]  # Within collision buffer
        humans = []

        risk, distance = self.collision_system.check_collision_risk(robot_pose, obstacles, humans)
        self.assertTrue(risk, "Collision risk should be detected")

    def test_safe_navigation(self):
        """Test that safe navigation paths are generated"""
        current_pose = {'x': 0.0, 'y': 0.0, 'z': 0.0}
        target_pose = {'x': 5.0, 'y': 0.0, 'z': 0.0}
        obstacles = [{'x': 2.0, 'y': 0.0, 'z': 0.0}]
        humans = []

        new_target = self.collision_system.generate_avoidance_trajectory(
            current_pose, target_pose, obstacles, humans
        )

        # Check that new target avoids the obstacle
        obstacle_dist = np.sqrt((new_target['x'] - 2.0)**2 + (new_target['y'] - 0.0)**2)
        self.assertGreater(obstacle_dist, 0.5, "Path should avoid obstacle")

class EmergencyStopTests(unittest.TestCase):
    def setUp(self):
        self.safety_controller = SafetyController()

    def test_emergency_stop_activation(self):
        """Test that emergency stop properly stops the robot"""
        self.safety_controller.trigger_emergency_stop()
        self.assertTrue(self.safety_controller.emergency_stop_active,
                       "Emergency stop should be active")

    def test_motion_limiting(self):
        """Test that motion is properly limited based on risk"""
        # Test at different risk levels
        for risk_level in RiskLevel:
            target_vel = np.array([2.0, 0.0, 0.0])
            limited_vel = self.safety_controller.check_and_limit_motion(target_vel, risk_level)

            max_allowed = self.safety_controller.safe_speed_limits[risk_level]
            actual_speed = np.linalg.norm(limited_vel)

            self.assertLessEqual(actual_speed, max_allowed,
                               f"Speed should be limited at {risk_level} risk")

class ForceLimitingTests(unittest.TestCase):
    def setUp(self):
        self.safety_controller = SafetyController()

    def test_force_limiting(self):
        """Test that forces are properly limited"""
        test_forces = {
            'contact_force': 60.0,  # Above limit
            'impact_force': 80.0,   # Below limit
            'grip_force': 40.0      # Above limit
        }

        is_safe, violations = self.safety_controller.check_force_limits(test_forces)
        self.assertFalse(is_safe, "Should detect force limit violations")
        self.assertGreater(len(violations), 0, "Should report violations")

class EthicsTests(unittest.TestCase):
    def setUp(self):
        self.ethics_engine = EthicalDecisionEngine()

    def test_ethical_evaluation(self):
        """Test ethical evaluation of actions"""
        action = "help elderly person"
        context = {
            'human_need': True,
            'human_proximity': True
        }

        evaluation = self.ethics_engine.evaluate_action_ethically(action, context)
        self.assertGreater(evaluation['ethical_score'], 0.5,
                          "Helping action should have positive ethical score")

    def test_harmful_action_detection(self):
        """Test detection of potentially harmful actions"""
        action = "force human to move"
        context = {
            'human_proximity': True
        }

        evaluation = self.ethics_engine.evaluate_action_ethically(action, context)
        self.assertLess(evaluation['ethical_score'], 0.5,
                       "Forcing action should have low ethical score")
```

## Challenges and Future Directions

### Safety Challenges

Humanoid robot safety faces several ongoing challenges:

- **Complex environments**: Dynamic and unpredictable human environments
- **Multi-modal safety**: Coordinating safety across different interaction modalities
- **Real-time requirements**: Safety decisions must be made quickly
- **Uncertainty handling**: Managing sensor and prediction uncertainties

### Ethical Challenges

Ethical considerations continue to evolve:

- **Cultural differences**: Ethical norms vary across cultures
- **Autonomy vs. safety**: Balancing human autonomy with safety requirements
- **Bias and fairness**: Ensuring equitable treatment across different groups
- **Transparency**: Making robot decision-making understandable to humans

## Practice Tasks

1. Implement a risk assessment system for a humanoid robot
2. Create an emergency stop system with multiple activation methods
3. Develop an ethical decision-making framework for robot behavior
4. Design privacy-preserving data collection methods
5. Test safety systems under various simulated scenarios

## Summary

Safety and ethics are fundamental considerations in humanoid robotics. By implementing comprehensive safety systems, ethical decision-making frameworks, and privacy protection measures, we can ensure that humanoid robots operate safely and ethically in human environments. These systems must be continuously tested, validated, and improved as the technology advances.
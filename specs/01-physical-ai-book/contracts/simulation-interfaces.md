# Simulation Interfaces: Physical AI & Humanoid Robotics Book

**Feature**: 01-physical-ai-book | **Date**: 2025-12-12

## Overview

This document describes the conceptual interfaces between the book's educational content and the simulation environments (Gazebo, Unity, NVIDIA Isaac) that students will interact with during their learning journey.

## Interface: ROS 2 Communication Layer

### Purpose
Standardized communication patterns that students will learn and implement in their robotics projects.

### Endpoints/Topics

#### /cmd_vel (geometry_msgs/Twist)
- **Purpose**: Send velocity commands to robot base
- **Publisher**: Student's control node
- **Subscriber**: Robot simulation/real robot
- **Example Usage**: `linear.x` for forward/backward, `angular.z` for rotation

#### /sensor_data (sensor_msgs/LaserScan)
- **Purpose**: Receive laser scan data from robot sensors
- **Publisher**: Robot simulation/real robot
- **Subscriber**: Student's perception node
- **Example Usage**: Obstacle detection and navigation

#### /camera/rgb/image_raw (sensor_msgs/Image)
- **Purpose**: Receive RGB camera images
- **Publisher**: Robot simulation/real robot
- **Subscriber**: Student's computer vision node
- **Example Usage**: Object recognition and scene understanding

#### /joint_states (sensor_msgs/JointState)
- **Purpose**: Receive joint position/velocity/effort data
- **Publisher**: Robot simulation/real robot
- **Subscriber**: Student's control/monitoring node
- **Example Usage**: Manipulator control and feedback

## Interface: Simulation Control API

### Purpose
Commands for controlling simulation environments during learning exercises.

### Actions

#### Simulation Start/Stop
- **Gazebo**: `ros2 launch <world_file>`
- **Unity Isaac**: Isaac Sim launch commands
- **Purpose**: Initialize and terminate simulation environments

#### Reset Simulation
- **Gazebo**: `/gazebo/reset_simulation` service
- **Unity Isaac**: Reset scene functionality
- **Purpose**: Return simulation to initial state for repeated experiments

#### Spawn/Remove Objects
- **Gazebo**: `/spawn_entity` and `/delete_entity` services
- **Unity Isaac**: Object spawning scripts
- **Purpose**: Add/remove objects for manipulation exercises

## Interface: Code Example Standards

### Purpose
Standardized structure for all code examples in the book to ensure consistency and reproducibility.

### Required Components

#### setup.sh
- **Purpose**: Install dependencies for the example
- **Location**: In each code example directory
- **Content**: Package installation commands, environment setup

#### run.sh
- **Purpose**: Execute the example with proper configuration
- **Location**: In each code example directory
- **Content**: Complete execution command with parameters

#### verify.sh
- **Purpose**: Verify that the example executed correctly
- **Location**: In each code example directory
- **Content**: Validation commands and expected output checks

#### README.md
- **Purpose**: Document the example's purpose and usage
- **Location**: In each code example directory
- **Content**: Explanation, prerequisites, execution steps, expected results

## Interface: Assessment API

### Purpose
Standardized format for practice tasks and assessments in each chapter.

### Structure

#### Task Definition
```
{
  "taskId": "string",
  "title": "string",
  "description": "string",
  "difficulty": "enum (beginner|intermediate|advanced)",
  "estimatedTime": "integer (minutes)",
  "objectives": ["string"],
  "requirements": ["string"],
  "expectedOutcome": "string",
  "verificationSteps": ["string"]
}
```

#### Student Submission
```
{
  "submissionId": "string",
  "taskId": "string",
  "solution": "string (code or description)",
  "verificationResults": [
    {
      "step": "string",
      "result": "boolean",
      "details": "string"
    }
  ],
  "completedAt": "datetime"
}
```

## Interface: Content Navigation

### Purpose
Standardized navigation structure for students to move through the book content.

### URL Structure
```
/book/{module}/{chapter}/{section}
```

### Example
- `/book/module1/chapter1/explanation` - Chapter 1 explanation
- `/book/module1/chapter1/example` - Chapter 1 example
- `/book/module1/chapter1/code` - Chapter 1 code examples
- `/book/module1/chapter1/practice` - Chapter 1 practice tasks

## Interface: Progress Tracking

### Purpose
Standardized format for tracking student progress through the book.

### Data Structure
```
{
  "studentId": "string",
  "progress": {
    "modules": [
      {
        "moduleId": "string",
        "completed": "boolean",
        "chapters": [
          {
            "chapterId": "string",
            "status": "enum (not-started|in-progress|completed)",
            "completedAt": "datetime",
            "assessmentScore": "integer (0-100)"
          }
        ]
      }
    ],
    "capstoneProject": {
      "status": "enum (not-started|in-progress|completed)",
      "completedAt": "datetime",
      "finalScore": "integer (0-100)"
    }
  }
}
```

## Validation Rules

1. **Consistency**: All code examples must follow the same structural pattern
2. **Reproducibility**: Examples must run in clean environments
3. **Accessibility**: All interfaces must be usable with assistive technologies
4. **Beginner-friendly**: All interfaces must be approachable for target audience
5. **Technology Accuracy**: Interfaces must reflect actual ROS 2, Gazebo, Isaac practices
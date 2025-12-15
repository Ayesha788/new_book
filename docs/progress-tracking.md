# Progress Tracking Mechanisms for Students

## Overview

This document outlines the progress tracking mechanisms implemented in the Physical AI & Humanoid Robotics course to help students monitor their learning progress, identify areas for improvement, and maintain motivation throughout the course.

## Learning Management System (LMS) Integration

### Course Structure Tracking
The course is organized into 4 modules with specific learning objectives:

#### Module 1: ROS 2 Fundamentals
- **Learning Objectives**:
  - Understand ROS 2 architecture and concepts
  - Create and run ROS 2 nodes and packages
  - Implement communication patterns (topics, services, actions)
  - Debug and troubleshoot ROS 2 applications
- **Progress Milestones**:
  - [ ] Complete Chapter 1-4 readings
  - [ ] Run basic ROS 2 examples
  - [ ] Create custom ROS 2 package
  - [ ] Pass Module 1 quiz (70%+ required)

#### Module 2: Simulation Environments
- **Learning Objectives**:
  - Set up and configure Gazebo simulation
  - Create custom robot models and environments
  - Integrate Unity for advanced simulation
  - Implement Digital Twin concepts
- **Progress Milestones**:
  - [ ] Complete Chapter 5-8 readings
  - [ ] Run Gazebo simulation examples
  - [ ] Create custom Gazebo world
  - [ ] Pass Module 2 quiz (70%+ required)

#### Module 3: AI Perception & Navigation
- **Learning Objectives**:
  - Implement computer vision systems with Isaac ROS
  - Create navigation and path planning algorithms
  - Build intelligent decision-making systems
  - Integrate perception with navigation
- **Progress Milestones**:
  - [ ] Complete Chapter 9-12 readings
  - [ ] Run Isaac ROS perception examples
  - [ ] Implement navigation system
  - [ ] Pass Module 3 quiz (70%+ required)

#### Module 4: Humanoid Robotics Capstone
- **Learning Objectives**:
  - Integrate Vision-Language-Action systems
  - Implement humanoid robot control
  - Create conversational robotics applications
  - Complete end-to-end project
- **Progress Milestones**:
  - [ ] Complete Chapter 13-16 readings
  - [ ] Run VLA system examples
  - [ ] Complete capstone project
  - [ ] Pass Module 4 assessment (75%+ required)

## Progress Tracking Dashboard

### Student Dashboard Components
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Physical AI Course - Progress Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .progress-container { margin: 20px 0; }
        .module { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .module-header { display: flex; justify-content: space-between; align-items: center; }
        .progress-bar { width: 100%; height: 20px; background-color: #e0e0e0; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #4CAF50; transition: width 0.3s ease; }
        .status-badge { padding: 5px 10px; border-radius: 15px; font-size: 12px; }
        .status-completed { background-color: #4CAF50; color: white; }
        .status-in-progress { background-color: #FFC107; color: black; }
        .status-not-started { background-color: #F44336; color: white; }
        .task-list { margin: 10px 0; }
        .task-item { margin: 5px 0; display: flex; align-items: center; }
        .task-checkbox { margin-right: 10px; }
    </style>
</head>
<body>
    <h1>Physical AI & Humanoid Robotics - Progress Dashboard</h1>

    <div class="progress-container">
        <h2>Overall Progress</h2>
        <div class="progress-bar">
            <div class="progress-fill" id="overall-progress" style="width: 25%;"></div>
        </div>
        <p id="overall-text">Module 1: ROS 2 Fundamentals (25% Complete)</p>
    </div>

    <div class="module">
        <div class="module-header">
            <h3>Module 1: ROS 2 Fundamentals</h3>
            <span class="status-badge status-in-progress">In Progress</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 75%;"></div>
        </div>
        <p>Progress: 75% (3 of 4 tasks completed)</p>

        <div class="task-list">
            <div class="task-item">
                <input type="checkbox" class="task-checkbox" checked>
                <label>Read Chapter 1-4</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox" checked>
                <label>Run Basic Examples</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox" checked>
                <label>Create Custom Package</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Pass Module 1 Quiz</label>
            </div>
        </div>
    </div>

    <div class="module">
        <div class="module-header">
            <h3>Module 2: Simulation Environments</h3>
            <span class="status-badge status-not-started">Not Started</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%;"></div>
        </div>
        <p>Progress: 0% (0 of 4 tasks completed)</p>

        <div class="task-list">
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Read Chapter 5-8</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Run Gazebo Examples</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Create Custom World</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Pass Module 2 Quiz</label>
            </div>
        </div>
    </div>

    <div class="module">
        <div class="module-header">
            <h3>Module 3: AI Perception & Navigation</h3>
            <span class="status-badge status-not-started">Not Started</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%;"></div>
        </div>
        <p>Progress: 0% (0 of 4 tasks completed)</p>

        <div class="task-list">
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Read Chapter 9-12</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Run Isaac ROS Examples</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Implement Navigation</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Pass Module 3 Quiz</label>
            </div>
        </div>
    </div>

    <div class="module">
        <div class="module-header">
            <h3>Module 4: Humanoid Robotics Capstone</h3>
            <span class="status-badge status-not-started">Not Started</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%;"></div>
        </div>
        <p>Progress: 0% (0 of 4 tasks completed)</p>

        <div class="task-list">
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Read Chapter 13-16</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Run VLA Examples</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Complete Capstone Project</label>
            </div>
            <div class="task-item">
                <input type="checkbox" class="task-checkbox">
                <label>Pass Final Assessment</label>
            </div>
        </div>
    </div>

    <div class="recommendations">
        <h3>Recommendations</h3>
        <ul>
            <li>Complete Module 1 quiz to unlock Module 2</li>
            <li>Review Chapter 4 if you're struggling with services</li>
            <li>Join the discussion forum for additional support</li>
        </ul>
    </div>
</body>
</html>
```

## Assessment and Quiz System

### Module 1 Quiz: ROS 2 Fundamentals
```python
class Module1Quiz:
    def __init__(self):
        self.questions = [
            {
                "question": "What does ROS stand for?",
                "options": ["Robot Operating System", "Robot Operating Software", "Robotic Open System", "Robotic Operating System"],
                "correct": 0,
                "explanation": "ROS stands for Robot Operating System, though it's technically a middleware framework."
            },
            {
                "question": "Which command is used to run a ROS 2 node?",
                "options": ["ros2 run", "ros2 execute", "ros2 start", "ros2 launch"],
                "correct": 0,
                "explanation": "The 'ros2 run' command is used to run a specific node from a package."
            },
            {
                "question": "What is the purpose of a ROS 2 package?",
                "options": ["To store configuration files only", "To organize code, resources, and dependencies", "To manage system hardware", "To provide network security"],
                "correct": 1,
                "explanation": "A ROS 2 package organizes code, resources, and dependencies for distribution and reuse."
            }
        ]
        self.score = 0
        self.total_questions = len(self.questions)

    def take_quiz(self):
        print("Module 1: ROS 2 Fundamentals Quiz")
        print("=" * 40)

        for i, q in enumerate(self.questions):
            print(f"\nQuestion {i+1}: {q['question']}")
            for j, option in enumerate(q['options']):
                print(f"{j+1}. {option}")

            try:
                answer = int(input("\nYour answer (1-4): ")) - 1
                if answer == q['correct']:
                    self.score += 1
                    print("✓ Correct!")
                else:
                    print(f"✗ Incorrect. Correct answer: {q['options'][q['correct']]}")
                print(f"Explanation: {q['explanation']}")
            except ValueError:
                print("Invalid input. Skipping question.")

        print(f"\nQuiz Complete! Score: {self.score}/{self.total_questions}")
        percentage = (self.score / self.total_questions) * 100
        print(f"Percentage: {percentage:.1f}%")

        if percentage >= 70:
            print("✅ Module 1 completed successfully!")
            return True
        else:
            print("❌ Please review the material and try again.")
            return False
```

### Hands-On Project Tracking

#### Project Submission System
```python
import json
import datetime
from pathlib import Path

class ProjectTracker:
    def __init__(self, student_id):
        self.student_id = student_id
        self.submissions = []
        self.project_dir = Path(f"submissions/{student_id}")
        self.project_dir.mkdir(exist_ok=True)

    def submit_project(self, module, project_name, files, description=""):
        """Submit a project for a specific module"""
        submission = {
            "id": len(self.submissions) + 1,
            "module": module,
            "project_name": project_name,
            "files": files,
            "description": description,
            "timestamp": datetime.datetime.now().isoformat(),
            "status": "pending_review",
            "grade": None,
            "feedback": None
        }

        self.submissions.append(submission)

        # Save submission to file
        with open(self.project_dir / f"submission_{submission['id']}.json", 'w') as f:
            json.dump(submission, f, indent=2)

        print(f"Project '{project_name}' submitted successfully for Module {module}")
        return submission['id']

    def track_project_progress(self, module):
        """Track progress for projects in a specific module"""
        module_submissions = [s for s in self.submissions if s['module'] == module]

        if not module_submissions:
            return {"status": "not_started", "progress": 0}

        completed = sum(1 for s in module_submissions if s['status'] == 'graded')
        total = len(module_submissions)

        return {
            "status": "in_progress" if completed < total else "completed",
            "progress": (completed / total) * 100,
            "completed": completed,
            "total": total
        }

# Example usage
tracker = ProjectTracker("student_001")

# Submit projects
project_id = tracker.submit_project(
    module=1,
    project_name="Custom ROS Package",
    files=["package.xml", "CMakeLists.txt", "src/my_node.py"],
    description="Created a custom ROS 2 package with publisher/subscriber nodes"
)

progress = tracker.track_project_progress(module=1)
print(f"Module 1 Project Progress: {progress}")
```

## Gamification Elements

### Achievement System
```python
class AchievementSystem:
    def __init__(self, student_id):
        self.student_id = student_id
        self.achievements = []
        self.points = 0
        self.badges = {
            "first_steps": {"name": "First Steps", "description": "Complete Module 1", "points": 100},
            "simulator": {"name": "Simulation Master", "description": "Complete Module 2", "points": 150},
            "ai_explorer": {"name": "AI Explorer", "description": "Complete Module 3", "points": 200},
            "roboticist": {"name": "Certified Roboticist", "description": "Complete all modules", "points": 500},
            "debugger": {"name": "Master Debugger", "description": "Fix 10 bugs", "points": 50},
            "innovator": {"name": "Innovator", "description": "Create original project", "points": 75}
        }

    def award_achievement(self, achievement_key):
        """Award an achievement to the student"""
        if achievement_key in self.badges and achievement_key not in self.achievements:
            badge = self.badges[achievement_key]
            self.achievements.append(achievement_key)
            self.points += badge["points"]
            print(f"🎉 Achievement Unlocked: {badge['name']}! +{badge['points']} points")
            return True
        return False

    def check_milestones(self, progress_data):
        """Check if any achievements should be awarded based on progress"""
        # Check for module completion
        if progress_data.get('module_1_completed'):
            self.award_achievement('first_steps')
        if progress_data.get('module_2_completed'):
            self.award_achievement('simulator')
        if progress_data.get('module_3_completed'):
            self.award_achievement('ai_explorer')
        if progress_data.get('all_modules_completed'):
            self.award_achievement('roboticist')

    def get_leaderboard_position(self):
        """Get student's position on the leaderboard"""
        # This would connect to a database of all students
        # For now, return a mock implementation
        return {"position": 42, "total_students": 150, "points": self.points}

# Example usage
achievement_system = AchievementSystem("student_001")
achievement_system.check_milestones({"module_1_completed": True})
```

## Progress Analytics

### Learning Analytics Dashboard
```python
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta

class LearningAnalytics:
    def __init__(self, student_id):
        self.student_id = student_id
        self.activity_log = []
        self.assessment_scores = []

    def log_activity(self, activity_type, duration_minutes, module=None, timestamp=None):
        """Log a learning activity"""
        if timestamp is None:
            timestamp = datetime.now()

        activity = {
            "timestamp": timestamp,
            "type": activity_type,
            "duration": duration_minutes,
            "module": module
        }
        self.activity_log.append(activity)

    def record_assessment(self, module, score, max_score=100):
        """Record an assessment score"""
        assessment = {
            "module": module,
            "score": score,
            "max_score": max_score,
            "percentage": (score / max_score) * 100,
            "date": datetime.now()
        }
        self.assessment_scores.append(assessment)

    def generate_weekly_report(self):
        """Generate a weekly learning report"""
        week_ago = datetime.now() - timedelta(days=7)
        recent_activities = [a for a in self.activity_log if a['timestamp'] > week_ago]

        # Calculate total time spent
        total_time = sum(a['duration'] for a in recent_activities)

        # Time by module
        time_by_module = {}
        for a in recent_activities:
            module = a['module'] or 'general'
            time_by_module[module] = time_by_module.get(module, 0) + a['duration']

        # Assessment performance
        recent_assessments = [a for a in self.assessment_scores if a['date'] > week_ago]

        report = {
            "period": "Last 7 days",
            "total_time_minutes": total_time,
            "total_time_hours": round(total_time / 60, 1),
            "time_by_module": time_by_module,
            "assessments_completed": len(recent_assessments),
            "average_score": np.mean([a['percentage'] for a in recent_assessments]) if recent_assessments else 0
        }

        return report

    def plot_progress(self):
        """Plot learning progress over time"""
        if not self.assessment_scores:
            print("No assessment data to plot")
            return

        dates = [a['date'] for a in self.assessment_scores]
        scores = [a['percentage'] for a in self.assessment_scores]
        modules = [a['module'] for a in self.assessment_scores]

        plt.figure(figsize=(12, 6))
        plt.plot(dates, scores, marker='o', linewidth=2, markersize=8)
        plt.title('Assessment Scores Over Time')
        plt.xlabel('Date')
        plt.ylabel('Score (%)')
        plt.grid(True, alpha=0.3)

        # Add module labels
        for i, (date, score, module) in enumerate(zip(dates, scores, modules)):
            plt.annotate(f'M{module}', (date, score), xytext=(5, 5),
                        textcoords='offset points', fontsize=9)

        plt.tight_layout()
        plt.show()

# Example usage
analytics = LearningAnalytics("student_001")

# Log some activities
analytics.log_activity("reading", 45, module=1)
analytics.log_activity("coding", 90, module=1)
analytics.log_activity("simulation", 60, module=2)

# Record assessments
analytics.record_assessment(1, 85, 100)
analytics.record_assessment(2, 78, 100)

# Generate report
report = analytics.generate_weekly_report()
print("Weekly Learning Report:")
for key, value in report.items():
    print(f"{key}: {value}")
```

## Self-Assessment Tools

### Module Completion Checklist
```python
class ModuleChecklist:
    def __init__(self, module_number):
        self.module_number = module_number
        self.checklist_items = self._get_checklist_items()
        self.completed_items = set()

    def _get_checklist_items(self):
        """Get checklist items for the specified module"""
        checklists = {
            1: [
                "Understand ROS 2 architecture and concepts",
                "Create and run basic ROS 2 nodes",
                "Implement publisher-subscriber communication",
                "Create custom ROS 2 packages",
                "Use services and actions",
                "Debug ROS 2 applications",
                "Run Module 1 quiz and achieve 70%+"
            ],
            2: [
                "Install and configure Gazebo simulation",
                "Create custom robot models",
                "Build custom simulation environments",
                "Integrate with ROS 2 nodes",
                "Run navigation simulations",
                "Understand Digital Twin concepts",
                "Run Module 2 quiz and achieve 70%+"
            ],
            3: [
                "Set up Isaac ROS perception packages",
                "Implement computer vision systems",
                "Create navigation algorithms",
                "Build decision-making systems",
                "Integrate perception with navigation",
                "Optimize for performance",
                "Run Module 3 quiz and achieve 70%+"
            ],
            4: [
                "Integrate Vision-Language-Action systems",
                "Implement humanoid robot control",
                "Create conversational interfaces",
                "Build end-to-end applications",
                "Test in simulation and reality",
                "Document the project",
                "Run Module 4 assessment and achieve 75%+"
            ]
        }
        return checklists.get(self.module_number, [])

    def mark_item_completed(self, item_index):
        """Mark a checklist item as completed"""
        if 0 <= item_index < len(self.checklist_items):
            self.completed_items.add(item_index)
            print(f"✓ Marked '{self.checklist_items[item_index]}' as completed")
        else:
            print("Invalid item index")

    def get_progress(self):
        """Get completion progress"""
        total = len(self.checklist_items)
        completed = len(self.completed_items)
        percentage = (completed / total) * 100

        return {
            "total_items": total,
            "completed_items": completed,
            "pending_items": total - completed,
            "percentage": percentage
        }

    def print_checklist(self):
        """Print the current checklist with status"""
        print(f"\nModule {self.module_number} Checklist:")
        print("=" * 50)

        for i, item in enumerate(self.checklist_items):
            status = "✓" if i in self.completed_items else "○"
            print(f"{status} {i+1}. {item}")

        progress = self.get_progress()
        print(f"\nProgress: {progress['completed_items']}/{progress['total_items']} ({progress['percentage']:.1f}%)")

# Example usage
module1_checklist = ModuleChecklist(1)
module1_checklist.print_checklist()

# Mark some items as completed
module1_checklist.mark_item_completed(0)  # Understand ROS 2 architecture
module1_checklist.mark_item_completed(1)  # Create and run basic nodes
module1_checklist.print_checklist()
```

## Progress Reporting

### Automated Progress Reports
```python
class ProgressReporter:
    def __init__(self, student_id):
        self.student_id = student_id

    def generate_progress_report(self, analytics_data, achievement_data, module_progress):
        """Generate a comprehensive progress report"""
        report = f"""
PHYSICAL AI & HUMANOID ROBOTICS COURSE - PROGRESS REPORT
==========================================================

Student ID: {self.student_id}
Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

OVERALL PROGRESS
----------------
Completion: {module_progress['overall_percentage']:.1f}%
Modules Completed: {module_progress['completed_modules']}/4
Current Module: Module {module_progress['current_module']}

LEARNING ACTIVITY
-----------------
Total Learning Time: {analytics_data['total_time_hours']:.1f} hours
Time This Week: {analytics_data['week_time_hours']:.1f} hours
Average Daily Time: {analytics_data['daily_average_minutes']:.0f} minutes

ASSESSMENT PERFORMANCE
----------------------
Average Score: {analytics_data['average_score']:.1f}%
Highest Score: {analytics_data['highest_score']:.1f}%
Lowest Score: {analytics_data['lowest_score']:.1f}%

ACHIEVEMENTS EARNED
-------------------
Total Points: {achievement_data['total_points']}
Badges Earned: {achievement_data['badges_earned_count']}
Current Rank: {self._calculate_rank(achievement_data['total_points'])}

RECOMMENDATIONS
---------------
{self._generate_recommendations(module_progress, analytics_data)}

Next Steps:
- {self._get_next_steps(module_progress)}

Study Focus:
- {self._get_study_focus(analytics_data)}

Keep up the great work!
        """
        return report

    def _calculate_rank(self, points):
        """Calculate student rank based on points"""
        if points >= 1000:
            return "Expert Roboticist"
        elif points >= 750:
            return "Advanced Roboticist"
        elif points >= 500:
            return "Intermediate Roboticist"
        elif points >= 250:
            return "Beginner Roboticist"
        else:
            return "New Roboticist"

    def _generate_recommendations(self, module_progress, analytics_data):
        """Generate personalized recommendations"""
        recommendations = []

        if module_progress['current_module'] == 1:
            recommendations.append("Focus on understanding ROS 2 concepts thoroughly as they form the foundation for all other modules.")
        elif module_progress['current_module'] == 2:
            recommendations.append("Practice building custom simulation environments to solidify your understanding.")
        elif module_progress['current_module'] == 3:
            recommendations.append("Pay special attention to perception-navigation integration as it's crucial for the capstone.")

        if analytics_data['daily_average_minutes'] < 30:
            recommendations.append("Try to increase daily study time to at least 30 minutes for better retention.")

        return "\n- ".join([""] + recommendations)

    def _get_next_steps(self, module_progress):
        """Get recommendations for next steps"""
        if module_progress['completed_modules'] == 0:
            return "Start with Module 1 readings and basic ROS 2 tutorials"
        elif module_progress['completed_modules'] == 1:
            return "Begin Module 2: Simulation Environments"
        elif module_progress['completed_modules'] == 2:
            return "Start Module 3: AI Perception & Navigation"
        elif module_progress['completed_modules'] == 3:
            return "Begin Module 4 Capstone Project"
        else:
            return "Congratulations! You've completed the course. Consider advanced robotics projects."

    def _get_study_focus(self, analytics_data):
        """Get recommendations for study focus"""
        if analytics_data['average_score'] < 70:
            return "Focus on understanding fundamental concepts before moving forward"
        elif analytics_data['average_score'] < 85:
            return "Continue with current pace but review challenging topics"
        else:
            return "Excellent progress! Consider exploring advanced topics and projects"

# Example usage
reporter = ProgressReporter("student_001")

# Sample data (in real implementation, this would come from actual tracking)
sample_module_progress = {
    'overall_percentage': 25.0,
    'completed_modules': 1,
    'current_module': 2
}

sample_analytics = {
    'total_time_hours': 15.5,
    'week_time_hours': 5.0,
    'daily_average_minutes': 45,
    'average_score': 82.0,
    'highest_score': 95.0,
    'lowest_score': 70.0
}

sample_achievements = {
    'total_points': 100,
    'badges_earned_count': 1
}

report = reporter.generate_progress_report(
    sample_analytics,
    sample_achievements,
    sample_module_progress
)
print(report)
```

## Implementation in Course Platform

### Integration with Docusaurus
To integrate progress tracking with the Docusaurus-based course platform, create a custom React component:

```jsx
// src/components/ProgressTracker.js
import React, { useState, useEffect } from 'react';
import { useDocusaurusContext } from '@docusaurus/core/lib/client/exports/useDocusaurusContext';

const ProgressTracker = () => {
  const [progress, setProgress] = useState({
    overall: 25,
    modules: [
      { id: 1, name: 'ROS 2 Fundamentals', progress: 100, status: 'completed' },
      { id: 2, name: 'Simulation Environments', progress: 25, status: 'in-progress' },
      { id: 3, name: 'AI Perception & Navigation', progress: 0, status: 'not-started' },
      { id: 4, name: 'Humanoid Robotics Capstone', progress: 0, status: 'not-started' }
    ]
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedModule(null);
  };

  return (
    <div className="progress-tracker">
      <h2>Learning Progress</h2>

      <div className="overall-progress">
        <h3>Overall Progress: {progress.overall}%</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.overall}%` }}
          ></div>
        </div>
      </div>

      <div className="module-progress">
        {progress.modules.map((module) => (
          <div
            key={module.id}
            className={`module-card ${module.status}`}
            onClick={() => handleModuleClick(module)}
          >
            <h4>Module {module.id}: {module.name}</h4>
            <div className="module-bar">
              <div
                className="progress-fill"
                style={{ width: `${module.progress}%` }}
              ></div>
            </div>
            <p>{module.progress}% Complete</p>
          </div>
        ))}
      </div>

      {showModal && selectedModule && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Module {selectedModule.id} Progress</h3>
            <p>Details for {selectedModule.name}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .progress-tracker {
          max-width: 800px;
          margin: 2rem auto;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .overall-progress {
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 24px;
          background-color: #f0f0f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #45a049);
          transition: width 0.3s ease;
        }

        .module-progress {
          display: grid;
          gap: 1rem;
        }

        .module-card {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .module-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .module-card.completed {
          border-left: 4px solid #4CAF50;
        }

        .module-card['in-progress'] {
          border-left: 4px solid #FFC107;
        }

        .module-card.not-started {
          border-left: 4px solid #F44336;
        }

        .module-bar {
          width: 100%;
          height: 16px;
          background-color: #f0f0f0;
          border-radius: 8px;
          margin: 0.5rem 0;
          overflow: hidden;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;
```

This comprehensive progress tracking system provides students with multiple ways to monitor their learning journey, stay motivated, and identify areas for improvement throughout the Physical AI & Humanoid Robotics course.
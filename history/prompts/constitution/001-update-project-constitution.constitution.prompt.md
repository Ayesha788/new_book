---
id: 001
title: Update Project Constitution
stage: constitution
date: 2025-12-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: K TECH
command: /sp.constitution
labels: [constitution,physical-ai,book,docusaurus,ros2,gazebo,nvidia-isaac,vla]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```text
Project: 12-Chapter Physical AI Book using Docusaurus (ROS 2, Gazebo, NVIDIA Isaac, VLA)

Core principles:

Beginner-friendly clarity (simple English + easy explanations)

Accuracy (robotics, ROS 2, Gazebo, Isaac, Unity, VLA content must be technically correct)

Reproducibility (all steps, commands, and code examples must work and be testable)

Practical focus (examples, diagrams, and real robot workflows included)

Structured presentation (12 chapters + 4 modules + weekly learning plan)

Key standards:

Every chapter must include:
explanation → example → diagram → code → practice task

All code must be runnable and verified

All diagrams/screenshots must include alt-text

No plagiarism; content must be original

Docusaurus-compatible Markdown formatting for all files

Front page must include a hero section, modules grid, and navigation

Book must be deployable on GitHub Pages and Vercel without build errors

Modules:

Module 1: ROS 2 (robot nervous system)

Module 2: Gazebo & Unity (digital twin simulation)

Module 3: NVIDIA Isaac (AI perception & navigation)

Module 4: Vision-Language-Action (LLM + robotics integration)

Weekly Plan:

Weeks 1–2: Intro to Physical AI

Weeks 3–5: ROS 2 fundamentals

Weeks 6–7: Gazebo simulation

Weeks 8–10: NVIDIA Isaac platform

Weeks 11–12: Humanoid robotics (walking, grasping, interaction)

Week 13: Conversational robotics (GPT + speech + vision)

Constraints:

Book must contain 12 chapters

Writing must be simple and easy for students

Each chapter must include at least one picture or diagram

Code must be explained line-by-line where needed

Docusaurus sidebar automatically generated from folder structure

Repository must remain deployable without errors

Success criteria:

Book builds successfully in Docusaurus

Fully deploys on GitHub Pages and/or Vercel

All chapters easy to understand for beginners

Examples run successfully (ROS 2, Gazebo, Isaac where applicable)

Final capstone project (Autonomous Humanoid) described clearly

Visuals, diagrams, and code examples properly integrated
```

## Response snapshot

Updated the project constitution file to reflect the specific requirements for the 12-Chapter Physical AI Book. The updated constitution now includes:

- Enhanced core principles focusing on beginner-friendly clarity, technical accuracy in robotics topics, reproducibility, practical focus, structured presentation, and originality
- Detailed sections for the four modules (ROS 2, Gazebo & Unity, NVIDIA Isaac, Vision-Language-Action)
- Complete weekly learning plan spanning 13 weeks
- Clear constraints for the book structure
- Comprehensive key standards for content creation
- Success criteria for the project
- Updated version to 1.1.0 with appropriate change log

## Outcome

- ✅ Impact: Major update to project constitution reflecting specific Physical AI book requirements
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: None needed
- 🧠 Reflection: Constitution now properly aligned with project goals

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
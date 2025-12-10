---
title: "Book Platform and Technical Stack"
status: "Proposed"
date: "2025-12-07"
---

## Context

The project requires creating a "Physical AI & Humanoid Robotics Hackathon Book" that will guide university-level students, AI enthusiasts, and educators in applying AI to control humanoid robots. The book needs to integrate multiple complex technologies including ROS 2, Gazebo/Unity, NVIDIA Isaac, and Vision-Language-Action models.

The decision involves selecting the platform for the book content and the technical stack for implementing the examples and integrations. This affects how engineers will structure the content, implement examples, and how students will consume and interact with the material.

## Decision

We will use a Docusaurus-based structure for the book platform, with the following technical stack:

- **Book Platform**: Docusaurus static site generator
- **Content Format**: Markdown files organized in `book/docs/`
- **Primary Languages**: Python 3.x (for ROS 2 rclpy, OpenAI Whisper integration, reinforcement learning)
- **Secondary Languages**: C++ (for high-performance ROS 2 nodes and robotics libraries)
- **Robotics Framework**: ROS 2 (Humble/Iron)
- **Simulation**: Gazebo (physics simulation), Unity (high-fidelity visualization), NVIDIA Isaac Sim (photorealistic simulation)
- **AI Integration**: OpenAI Whisper API/library for voice-to-action, TensorFlow/PyTorch for reinforcement learning
- **Target Platforms**: Ubuntu Linux (primary development), Windows/macOS (Unity development), NVIDIA Jetson/Orin (robot deployment)

## Alternatives

1. **Static Site Generators**:
   - Docusaurus (selected) vs. MkDocs, GitBook, Hugo, or custom solution
2. **Content Formats**:
   - Markdown with Docusaurus vs. Jupyter notebooks, interactive web applications, or traditional PDF
3. **Programming Languages**:
   - Python/C++ (selected) vs. Python only, C++ only, or Rust for robotics
4. **Simulation Platforms**:
   - Gazebo/Unity/NVIDIA Isaac (selected) vs. Webots, PyBullet, or custom simulation
5. **AI Integration**:
   - OpenAI Whisper (selected) vs. Hugging Face Whisper, Azure Speech Services, or custom ASR

## Consequences

**Positive:**
- Docusaurus provides excellent search, navigation, and responsive design for educational content
- Python is the dominant language in robotics and AI education
- ROS 2 is the industry standard for robotics development
- Integration with NVIDIA Isaac provides access to advanced simulation and AI capabilities
- Markdown format is version-controllable and collaborative-friendly

**Negative:**
- Requires students to set up complex development environments
- Multiple platform dependencies (Ubuntu for ROS 2, NVIDIA hardware for Isaac)
- Some tools have licensing costs or restrictions
- High barrier to entry for beginners unfamiliar with these technologies

## References

- `specs/1-physical-ai-robotics/plan.md`
- `specs/1-physical-ai-robotics/spec.md`
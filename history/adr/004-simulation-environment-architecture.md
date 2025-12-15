---
title: "Simulation Environment Architecture"
status: "Proposed"
date: "2025-12-12"
---

## Context

The project requires integrating multiple simulation environments (Gazebo, Unity, NVIDIA Isaac) to provide comprehensive learning experiences for students studying Physical AI and robotics. The simulation architecture must support both theoretical understanding and practical experimentation with different robotics platforms.

The decision involves how to structure and integrate these different simulation environments to provide coherent learning experiences while maintaining technical accuracy and reproducibility. This affects how students will interact with different simulation tools, how code examples will be structured, and how the learning progression will flow between different simulation platforms.

## Decision

We will implement a multi-simulation architecture with:

- **Primary Simulation**: Gazebo for ROS 2 integration and physics-based simulation
- **Advanced Simulation**: Unity with NVIDIA Isaac for high-fidelity visualization and photorealistic simulation
- **AI Integration**: NVIDIA Isaac for AI perception and navigation capabilities
- **ROS 2 Distribution**: ROS 2 Humble Hawksbill (LTS) for long-term support and stability
- **Simulation Access**: Examples and exercises that work across both Gazebo and Unity where applicable
- **Hardware Considerations**: Recommendations for RTX workstation for optimal performance, with fallback options
- **Integration Layer**: Standardized ROS 2 interfaces for consistent interaction across simulation platforms

## Alternatives

1. **Simulation Platforms**:
   - Gazebo + Unity + NVIDIA Isaac (selected) vs. Gazebo only vs. Webots vs. PyBullet vs. Custom simulation
2. **ROS 2 Distribution**:
   - Humble Hawksbill LTS (selected) vs. Iron Irwini vs. Rolling vs. Galactic
3. **Integration Approach**:
   - Standardized ROS 2 interfaces (selected) vs. Platform-specific APIs vs. Abstraction layer
4. **Hardware Strategy**:
   - RTX workstation recommendation with fallbacks (selected) vs. Cloud-based simulation vs. Minimal requirements only
5. **Coverage Strategy**:
   - Cross-platform examples (selected) vs. Platform-specific examples vs. Single-platform focus

## Consequences

**Positive:**
- Students gain exposure to industry-standard simulation tools
- ROS 2 Humble provides long-term stability for educational content
- Cross-platform examples ensure broader applicability of learning
- NVIDIA Isaac integration provides access to advanced AI capabilities
- Standardized interfaces make learning transferable between platforms

**Negative:**
- Multiple simulation platforms increase complexity for students
- High hardware requirements may exclude some learners
- Different platforms have different learning curves and quirks
- Maintenance overhead for examples across multiple platforms
- Potential licensing costs for commercial simulation tools
- Increased testing and validation requirements

## References

- `specs/01-physical-ai-book/plan.md`
- `specs/01-physical-ai-book/research.md`
- `specs/01-physical-ai-book/data-model.md`
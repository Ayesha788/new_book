---
title: "Educational Content Architecture"
status: "Proposed"
date: "2025-12-12"
---

## Context

The project requires creating a comprehensive 12-chapter Physical AI & Humanoid Robotics Book with a structured learning approach. The educational architecture must support beginner-friendly content while covering complex topics like ROS 2, Gazebo, NVIDIA Isaac, and Vision-Language-Action systems. The architecture needs to ensure reproducible learning experiences with clear progression from basic concepts to advanced capstone projects.

The decision involves structuring the content in a way that maintains educational coherence, ensures accessibility compliance, and provides practical, hands-on learning experiences. This affects how educators will organize content, how students will progress through material, and how assessment will be conducted.

## Decision

We will implement a modular educational architecture with the following structure:

- **4 Core Modules**: Module 1 (ROS 2), Module 2 (Gazebo & Unity), Module 3 (NVIDIA Isaac), Module 4 (Vision-Language-Action & Humanoid Capstone)
- **12-Chapter Structure**: Approximately 3 chapters per module following a 13-week learning plan
- **Chapter Format**: Each chapter must include explanation → example → diagram → code → practice task
- **Accessibility Compliance**: WCAG 2.1 AA compliance with alt-text for all diagrams and images
- **Assessment Integration**: Built-in quizzes, exercises, and progress tracking mechanisms
- **Content Validation**: All code examples must be tested and runnable with verification steps

## Alternatives

1. **Content Organization**:
   - Modular structure with 4 modules (selected) vs. Linear progression through topics vs. Skill-based organization
2. **Chapter Structure**:
   - Fixed 5-part structure (explanation → example → diagram → code → practice) (selected) vs. Flexible structure per topic vs. Traditional textbook format
3. **Assessment Approach**:
   - Integrated assessments (selected) vs. End-of-module tests vs. Project-based only vs. No formal assessment
4. **Accessibility Implementation**:
   - WCAG 2.1 AA compliance (selected) vs. Basic accessibility vs. WCAG 2.0 vs. Self-defined standards
5. **Content Validation**:
   - Required runnable code examples with verification (selected) vs. Theoretical examples only vs. Optional examples

## Consequences

**Positive:**
- Modular structure allows focused learning on specific technologies
- Consistent chapter format helps students know what to expect
- Accessibility compliance ensures inclusive learning experience
- Runnable code examples ensure reproducibility and hands-on learning
- Built-in assessments provide progress tracking and validation
- 13-week plan provides clear timeline for completion

**Negative:**
- Rigid chapter structure may not suit all topics equally well
- High bar for content validation increases authoring effort
- Compliance requirements add complexity to content creation
- Multiple technology integrations may overwhelm beginners
- Assessment requirements add overhead to content development

## References

- `specs/01-physical-ai-book/plan.md`
- `specs/01-physical-ai-book/data-model.md`
- `specs/01-physical-ai-book/research.md`
- `.specify/memory/constitution.md`
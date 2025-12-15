# Data Model: 12-Chapter Physical AI & Humanoid Robotics Book

**Feature**: 01-physical-ai-book | **Date**: 2025-12-12

## Overview

This document defines the data model for the 12-chapter Physical AI & Humanoid Robotics Book. It outlines the structure of content entities, their relationships, and validation rules based on the feature requirements.

## Entity: Book
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 200 chars)
  - description: string (required, max 500 chars)
  - author: string (required)
  - version: string (semantic versioning)
  - createdAt: datetime (ISO 8601)
  - updatedAt: datetime (ISO 8601)
  - status: enum (draft, in-progress, completed, published)
  - targetAudience: array of strings
  - modules: array of Module references
  - weeklyPlan: WeeklyPlan object

## Entity: Module
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 100 chars)
  - description: string (required, max 300 chars)
  - order: integer (required, 1-4 for the 4 modules)
  - chapters: array of Chapter references
  - prerequisites: array of strings
  - learningObjectives: array of strings
  - durationWeeks: integer (1-3)

**Validation Rules**:
- Must have exactly 4 modules (Module 1-4 as specified)
- Order must be unique across all modules
- Duration weeks must be between 1 and 3

## Entity: Chapter
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 100 chars)
  - description: string (required, max 200 chars)
  - order: integer (required, sequential within module)
  - module: Module reference (required)
  - contentSections: array of ContentSection objects
  - codeExamples: array of CodeExample objects
  - diagrams: array of Diagram objects
  - practiceTasks: array of PracticeTask objects
  - estimatedReadingTime: integer (minutes)
  - keywords: array of strings

**Validation Rules**:
- Must have exactly 12 chapters (3 per module on average)
- Order must be sequential within module (1-N)
- Each chapter must have at least one content section
- Each chapter must include explanation, example, diagram, code, and practice task

## Entity: ContentSection
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 100 chars)
  - type: enum (explanation, example, diagram, code, practice-task)
  - content: string (required, Markdown format)
  - order: integer (required, sequential within chapter)
  - chapter: Chapter reference (required)
  - altText: string (for diagrams, required)

**Validation Rules**:
- Type must match the required chapter structure (explanation, example, diagram, code, practice-task)
- Alt text required for diagram type sections
- Content must be in valid Markdown format

## Entity: CodeExample
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 100 chars)
  - description: string (required)
  - language: string (required, e.g., python, cpp, bash)
  - code: string (required, code content)
  - fileName: string (suggested file name)
  - chapter: Chapter reference (required)
  - isRunnable: boolean (default: true)
  - dependencies: array of strings
  - verificationSteps: array of strings

**Validation Rules**:
- Code must be syntactically valid for the specified language
- Must include verification steps for runnable examples
- Dependencies must be documented

## Entity: Diagram
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 100 chars)
  - description: string (required)
  - altText: string (required, for accessibility)
  - imageUrl: string (path to image asset)
  - caption: string (optional)
  - chapter: Chapter reference (required)
  - diagramType: enum (architecture, workflow, concept, process)

**Validation Rules**:
- Alt text is required for accessibility (WCAG 2.1 AA)
- Image URL must point to valid asset in assets/ directory
- Diagram type must be one of the defined enum values

## Entity: PracticeTask
- **Fields**:
  - id: string (unique identifier)
  - title: string (required, max 100 chars)
  - description: string (required)
  - difficulty: enum (beginner, intermediate, advanced)
  - estimatedTime: integer (minutes)
  - objectives: array of strings
  - requirements: array of strings
  - expectedOutcome: string
  - verificationSteps: array of strings
  - chapter: Chapter reference (required)

**Validation Rules**:
- Difficulty must be appropriate for target audience
- Verification steps must be clear and testable
- Requirements must be achievable with content covered in the chapter

## Entity: WeeklyPlan
- **Fields**:
  - id: string (unique identifier)
  - weeks: array of Week objects (13 weeks total)
  - totalDuration: integer (13 weeks as specified)

## Entity: Week
- **Fields**:
  - weekNumber: integer (1-13, required)
  - title: string (required)
  - chapters: array of Chapter references
  - objectives: array of strings
  - activities: array of strings
  - assessments: array of Assessment objects

## Entity: Assessment
- **Fields**:
  - id: string (unique identifier)
  - type: enum (quiz, exercise, project, self-assessment)
  - title: string (required)
  - questions: array of Question objects
  - passingScore: integer (percentage, default 70)
  - timeLimit: integer (minutes, optional)

## Entity: Question
- **Fields**:
  - id: string (unique identifier)
  - type: enum (multiple-choice, true-false, short-answer, code-review)
  - questionText: string (required)
  - options: array of strings (for multiple-choice)
  - correctAnswer: string (required)
  - explanation: string (explanation of correct answer)
  - difficulty: enum (beginner, intermediate, advanced)

## Entity: TechnologyStack
- **Fields**:
  - id: string (unique identifier)
  - technologies: array of TechDetail objects

## Entity: TechDetail
- **Fields**:
  - name: string (required, e.g., "ROS 2", "Gazebo", "NVIDIA Isaac")
  - version: string (recommended version)
  - purpose: string (what it's used for in the book)
  - prerequisites: array of strings
  - setupInstructions: string (brief setup guide)

## Relationships

```
Book (1) -----> (Many) Module
Module (1) -----> (Many) Chapter
Chapter (1) -----> (Many) ContentSection
Chapter (1) -----> (Many) CodeExample
Chapter (1) -----> (Many) Diagram
Chapter (1) -----> (Many) PracticeTask
Book (1) -----> (1) WeeklyPlan
WeeklyPlan (1) -----> (Many) Week
Week (1) -----> (Many) Assessment
Assessment (1) -----> (Many) Question
```

## State Transitions

### Book State Transitions
- draft → in-progress (when content creation begins)
- in-progress → completed (when all chapters are written)
- completed → published (when deployed to production)

### Chapter State Transitions
- draft → writing (when author begins writing)
- writing → review (when content is ready for review)
- review → approved (when content passes quality check)
- approved → published (when included in final book)

## Validation Rules Summary

1. **Content Structure**: Each chapter must contain explanation, example, diagram, code, and practice task sections
2. **Accessibility**: All diagrams must have alt-text for WCAG 2.1 AA compliance
3. **Code Quality**: All code examples must be tested and runnable
4. **Target Audience**: Content must be appropriate for beginner to intermediate students
5. **Technology Accuracy**: All technical information must match official documentation
6. **Module Organization**: Must follow the 4-module structure (ROS 2, Gazebo/Unity, NVIDIA Isaac, VLA)
7. **Weekly Plan**: Must follow the 13-week learning plan structure
8. **Originality**: All content must be original with no plagiarism
// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction'
    },
    {
      type: 'doc',
      id: 'environment-setup',
      label: 'Environment Setup'
    },
    {
      type: 'category',
      label: 'ROS 2 Fundamentals',
      items: [
        'chapter1-ros2'
      ],
    },
    {
      type: 'category',
      label: 'Digital Twin & Simulation',
      items: [
        'chapter2-digital-twin'
      ],
    },
    {
      type: 'category',
      label: 'AI-Robot Brain',
      items: [
        'chapter3-isaac'
      ],
    },
    {
      type: 'category',
      label: 'Vision-Language-Action',
      items: [
        'chapter4-vla'
      ],
    },
    {
      type: 'category',
      label: 'Path Planning & Navigation',
      items: [
        'chapter5-path-planning'
      ],
    },
    {
      type: 'category',
      label: 'Computer Vision',
      items: [
        'chapter6-computer-vision'
      ],
    },
    {
      type: 'category',
      label: 'Manipulation & Grasping',
      items: [
        'chapter7-manipulation'
      ],
    },
    {
      type: 'category',
      label: 'Multi-Robot Coordination',
      items: [
        'chapter8-multirobot'
      ],
    },
    {
      type: 'category',
      label: 'Learning & Adaptation',
      items: [
        'chapter9-learning'
      ],
    },
    {
      type: 'category',
      label: 'Human-Robot Interaction',
      items: [
        'chapter10-hri'
      ],
    },
    {
      type: 'category',
      label: 'Safety & Ethics',
      items: [
        'chapter11-safety'
      ],
    },
    {
      type: 'category',
      label: 'Future Trends & Applications',
      items: [
        'chapter12-future'
      ],
    },
    {
      type: 'category',
      label: 'Practice Tasks',
      items: [
        'practice-tasks-ros2',
        'practice-tasks-simulation'
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'glossary',
        'capstone'
      ],
    },
  ],
};

export default sidebars;
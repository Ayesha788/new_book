import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/my_book/docs',
    component: ComponentCreator('/my_book/docs', '540'),
    routes: [
      {
        path: '/my_book/docs',
        component: ComponentCreator('/my_book/docs', '882'),
        routes: [
          {
            path: '/my_book/docs',
            component: ComponentCreator('/my_book/docs', '170'),
            routes: [
              {
                path: '/my_book/docs/capstone',
                component: ComponentCreator('/my_book/docs/capstone', '442'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter1-ros2',
                component: ComponentCreator('/my_book/docs/chapter1-ros2', '2d6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter10-hri',
                component: ComponentCreator('/my_book/docs/chapter10-hri', '7ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter11-safety',
                component: ComponentCreator('/my_book/docs/chapter11-safety', '040'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter12-future',
                component: ComponentCreator('/my_book/docs/chapter12-future', '0df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter2-digital-twin',
                component: ComponentCreator('/my_book/docs/chapter2-digital-twin', '17d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter3-isaac',
                component: ComponentCreator('/my_book/docs/chapter3-isaac', '610'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter4-vla',
                component: ComponentCreator('/my_book/docs/chapter4-vla', '50b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter5-path-planning',
                component: ComponentCreator('/my_book/docs/chapter5-path-planning', '8f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter6-computer-vision',
                component: ComponentCreator('/my_book/docs/chapter6-computer-vision', '986'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter7-manipulation',
                component: ComponentCreator('/my_book/docs/chapter7-manipulation', 'ca4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter8-multirobot',
                component: ComponentCreator('/my_book/docs/chapter8-multirobot', 'bd3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/chapter9-learning',
                component: ComponentCreator('/my_book/docs/chapter9-learning', 'cc2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/environment-setup',
                component: ComponentCreator('/my_book/docs/environment-setup', '303'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/glossary',
                component: ComponentCreator('/my_book/docs/glossary', '972'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/intro',
                component: ComponentCreator('/my_book/docs/intro', '4ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/practice-tasks-ros2',
                component: ComponentCreator('/my_book/docs/practice-tasks-ros2', '5fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/my_book/docs/practice-tasks-simulation',
                component: ComponentCreator('/my_book/docs/practice-tasks-simulation', '814'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/my_book/',
    component: ComponentCreator('/my_book/', '0ae'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];

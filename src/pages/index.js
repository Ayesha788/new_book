import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started">
            View Curriculum
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureSection() {
  const features = [
    {
      title: 'ROS 2 Fundamentals',
      description: 'Learn the robotics middleware that powers autonomous systems worldwide',
      icon: '🤖',
    },
    {
      title: 'Simulation Environments',
      description: 'Master Gazebo and Unity for safe, efficient robot development',
      icon: '🎮',
    },
    {
      title: 'AI Perception & Navigation',
      description: 'Enable robots to see, understand, and navigate real-world environments',
      icon: '👁️',
    },
    {
      title: 'Humanoid Robotics',
      description: 'Build and control bipedal robots with advanced AI capabilities',
      icon: '🦾',
    },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2 className="text--center">What You'll Master</h2>
        <p className="text--center padding-horiz--md">
          A comprehensive curriculum designed to take you from beginner to expert in physical AI and humanoid robotics
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="text--center padding--md">
                <h3>{feature.icon} {feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { number: '4', label: 'Learning Modules' },
    { number: '20+', label: 'Hands-on Projects' },
    { number: '50+', label: 'Practical Exercises' },
    { number: '∞', label: 'Real-world Applications' },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-item" key={index}>
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Bridging Digital AI and Embodied Intelligence in the Physical World">
      <HomepageHeader />
      <main>
        <FeatureSection />
        <StatsSection />
      </main>
    </Layout>
  );
}
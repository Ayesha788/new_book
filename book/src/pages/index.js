import React from 'react';
import Layout from '@theme/Layout';

function Home() {
  return (
    <Layout title="Home" description="Hello Docusaurus!">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '20px',
        }}>
        <p>
          Welcome to the Physical AI & Humanoid Robotics Book!
        </p>
      </div>
    </Layout>
  );
}

export default Home;
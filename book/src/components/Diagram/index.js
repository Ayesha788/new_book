import React from 'react';

export default function Diagram({title, description, children}) {
  return (
    <div className="robotics-diagram">
      <h4>{title}</h4>
      <div>{children}</div>
      <details>
        <summary>Diagram Description (Alt-text)</summary>
        <p>{description}</p>
      </details>
    </div>
  );
}
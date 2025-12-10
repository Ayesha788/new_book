import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

export default function CodeExample({pythonCode, bashCode, title = "Code Example"}) {
  return (
    <div className="robotics-code-block">
      <h4>{title}</h4>
      <Tabs>
        {pythonCode && (
          <TabItem value="python" label="Python">
            <CodeBlock language="python">{pythonCode}</CodeBlock>
          </TabItem>
        )}
        {bashCode && (
          <TabItem value="bash" label="Bash">
            <CodeBlock language="bash">{bashCode}</CodeBlock>
          </TabItem>
        )}
      </Tabs>
    </div>
  );
}
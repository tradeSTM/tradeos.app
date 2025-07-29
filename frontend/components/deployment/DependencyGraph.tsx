import React from 'react';

interface DependencyGraphProps {
  contracts: Array<{
    name: string;
    dependencies: string[];
    status?: 'pending' | 'running' | 'completed' | 'failed';
  }>;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ contracts }) => {
  const [graphInitialized, setGraphInitialized] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!svgRef.current || graphInitialized) return;

    // Calculate graph layout
    const nodes = contracts.map((contract, index) => ({
      id: contract.name,
      level: 0,
      x: 0,
      y: 0,
      status: contract.status
    }));

    // Calculate dependency levels
    let changed = true;
    while (changed) {
      changed = false;
      for (const contract of contracts) {
        const node = nodes.find(n => n.id === contract.name);
        if (!node) continue;

        const depLevels = contract.dependencies.map(dep => {
          const depNode = nodes.find(n => n.id === dep);
          return depNode ? depNode.level : 0;
        });

        const maxDepLevel = Math.max(0, ...depLevels);
        if (node.level <= maxDepLevel) {
          node.level = maxDepLevel + 1;
          changed = true;
        }
      }
    }

    // Layout nodes
    const levelCounts = new Map<number, number>();
    const levelWidths = new Map<number, number>();
    const maxLevel = Math.max(...nodes.map(n => n.level));
    
    // Count nodes per level
    nodes.forEach(node => {
      levelCounts.set(node.level, (levelCounts.get(node.level) || 0) + 1);
    });

    // Calculate x positions
    const svgWidth = svgRef.current.clientWidth;
    const svgHeight = svgRef.current.clientHeight;
    const verticalSpacing = svgHeight / (maxLevel + 1);
    const horizontalPadding = 40;

    nodes.forEach(node => {
      const levelCount = levelCounts.get(node.level) || 1;
      const levelNodes = nodes.filter(n => n.level === node.level);
      const nodeIndex = levelNodes.findIndex(n => n.id === node.id);
      
      const levelWidth = svgWidth - (horizontalPadding * 2);
      const spacing = levelWidth / (levelCount + 1);
      
      node.x = horizontalPadding + (spacing * (nodeIndex + 1));
      node.y = verticalSpacing * node.level;
    });

    // Render graph
    const svg = svgRef.current;
    
    // Clear existing content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw edges
    contracts.forEach(contract => {
      const sourceNode = nodes.find(n => n.id === contract.name);
      if (!sourceNode) return;

      contract.dependencies.forEach(depName => {
        const targetNode = nodes.find(n => n.id === depName);
        if (!targetNode) return;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${sourceNode.x} ${sourceNode.y} C ${sourceNode.x} ${(sourceNode.y + targetNode.y) / 2}, ${targetNode.x} ${(sourceNode.y + targetNode.y) / 2}, ${targetNode.x} ${targetNode.y}`;
        
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#00ff9f33');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x},${node.y})`);

      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', getStatusColor(node.status));
      circle.setAttribute('stroke', '#00ff9f');
      circle.setAttribute('stroke-width', '2');
      group.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = node.id;
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '30');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '12');
      group.appendChild(text);

      svg.appendChild(group);
    });

    setGraphInitialized(true);
  }, [contracts, graphInitialized]);

  // Reset initialization when contracts change
  React.useEffect(() => {
    setGraphInitialized(false);
  }, [contracts]);

  return (
    <div className="dependency-graph">
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid meet"
      />

      <style jsx>{`
        .dependency-graph {
          width: 100%;
          height: 400px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
};

function getStatusColor(status?: string): string {
  switch (status) {
    case 'completed':
      return 'rgba(0, 255, 159, 0.2)';
    case 'running':
      return 'rgba(0, 159, 255, 0.2)';
    case 'failed':
      return 'rgba(255, 68, 68, 0.2)';
    default:
      return 'rgba(255, 255, 255, 0.1)';
  }
}

import React from 'react';
import Node from './Node';
import './Grid.css';

const Grid = ({ grid, onMouseDown, onMouseEnter, onMouseUp, placementMode, isDisabled }) => {
  return (
    <div className="grid">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="row">
          {row.map((node, nodeIdx) => (
            <Node
              key={`${node.row}-${node.col}`}
              node={node}
              onMouseDown={(e) => onMouseDown(node.row, node.col)}
              onMouseEnter={() => onMouseEnter(node.row, node.col)}
              onMouseUp={onMouseUp}
              placementMode={placementMode}
              isDisabled={isDisabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
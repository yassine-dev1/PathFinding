import React from 'react';
import './Node.css';

const Node = ({ node, onMouseDown, onMouseEnter, onMouseUp, placementMode, isDisabled }) => {
  const { isStart, isEnd, isWall, isVisited, isPath } = node;

  const extraClass = isStart
    ? 'node-start'
    : isEnd
    ? 'node-end'
    : isWall
    ? 'node-wall'
    : isPath
    ? 'node-path'
    : isVisited
    ? 'node-visited'
    : '';

  // Ajouter une classe pour le mode de placement
  const placementClass = placementMode === 'start' ? 'placement-start' : 
                        placementMode === 'end' ? 'placement-end' : '';

  return (
    <div
      className={`node ${extraClass} ${placementClass}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      title={`Row: ${node.row}, Col: ${node.col}`}
    >
      {isStart && <span className="node-icon">S</span>}
      {isEnd && <span className="node-icon">E</span>}
    </div>
  );
};

export default Node;
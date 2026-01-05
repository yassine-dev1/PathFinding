import React from 'react';
import './Controls.css';

const Controls = ({
  algorithm,
  setAlgorithm,
  onVisualize,
  onClear,
  onGenerateMaze,
  onResetNodes,
  isVisualizing,
  startPlaced,
  endPlaced,
  placementMode,
  setPlacementMode,
}) => {
  return (
    <div className="controls">
      <h3>Single Algorithm Mode</h3>
      
      <div className="algorithm-section">
        <div className="algorithm-buttons">
          <button
            className={`algo-btn ${algorithm === 'dijkstra' ? 'active' : ''}`}
            onClick={() => setAlgorithm('dijkstra')}
            disabled={isVisualizing}
          >
            Dijkstra's Algorithm
          </button>
          <button
            className={`algo-btn ${algorithm === 'bfs' ? 'active' : ''}`}
            onClick={() => setAlgorithm('bfs')}
            disabled={isVisualizing}
          >
            BFS Algorithm
          </button>
        </div>
      </div>

      <div className="node-controls">
        <h4>Node Placement</h4>
        <div className="node-buttons">
          <button
            className={`node-btn ${placementMode === 'start' ? 'active' : ''}`}
            onClick={() => setPlacementMode('start')}
            disabled={isVisualizing}
          >
            {startPlaced ? '↻ Reset Start' : '📍 Place Start'}
          </button>
          <button
            className={`node-btn ${placementMode === 'end' ? 'active' : ''}`}
            onClick={() => setPlacementMode('end')}
            disabled={isVisualizing}
          >
            {endPlaced ? '↻ Reset End' : '🎯 Place End'}
          </button>
          <button
            className="reset-nodes-btn"
            onClick={onResetNodes}
            disabled={isVisualizing}
          >
            🗑️ Clear Both Nodes
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="visualize-btn"
          onClick={onVisualize}
          disabled={isVisualizing || !startPlaced || !endPlaced}
          title={!startPlaced || !endPlaced ? "Place both start and end nodes first" : ""}
        >
          Visualize {algorithm === 'dijkstra' ? "Dijkstra's" : "BFS"} Algorithm
        </button>
        
        <button
          className="clear-btn"
          onClick={onClear}
          disabled={isVisualizing}
        >
          Clear Grid
        </button>
        
        <button
          className="maze-btn"
          onClick={onGenerateMaze}
          disabled={isVisualizing || !startPlaced || !endPlaced}
          title={!startPlaced || !endPlaced ? "Place both start and end nodes first" : ""}
        >
          Generate Maze
        </button>
      </div>
    </div>
  );
};

export default Controls;
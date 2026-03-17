import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Components
import Grid from './components/Grid/Grid';
import Controls from './components/Controls/Controls';
import Stats from './components/Stats/Stats';

// Hooks
import useGrid from './hooks/useGrid';
import useVisualization from './hooks/useVisualization';
import useMaze from './hooks/useMaze';

// Services - Algorithmes
import { runBFS } from './services/algorithms/bfsService';
import { runDijkstra } from './services/algorithms/DijkstraService';
import { runAStar } from './services/algorithms/AstartService';

// Services - WASM
import { loadDijkstraWasm } from './services/loadWASMModule/loadDijkstra';
import { loadAstartWasm } from './services/loadWASMModule/loadAStart';
import { loadBfsWasm } from './services/loadWASMModule/loadBfs';
import { loadMazeWasm } from './services/loadWASMModule/loadMaze';

// Utils
import { createEmptyGrid, getNewGridWithWallToggled } from './utils/gridUtils';
import { gridToAdjMatrix, gridToMatrix, getRowCol } from './utils/matrixUtils';
import { animatePath, sleep } from './utils/animationUtils';

// Constants
import { ROWS, COLS, ALGORITHM_TYPES, PLACEMENT_MODES } from './constants/gridConstants';

function App() {
  const {
    grid,
    setGrid,
    startNode,
    setStartNode,
    endNode,
    setEndNode,
    placementMode,
    setPlacementMode,
    mouseIsPressed,
    setMouseIsPressed,
    handleNodePlacement,
    resetGrid: resetGridHook
  } = useGrid(ROWS, COLS);

  const {
    isVisualizing,
    setIsVisualizing,
    stats,
    setStats,
    animateAlgorithm
  } = useVisualization(grid, startNode, endNode, ROWS, COLS);

  const {
    isGeneratingMaze,
    setIsGeneratingMaze,
    generateMaze
  } = useMaze();

  const [algorithm, setAlgorithm] = useState('bfs');
  const [showStatusOverlay, setShowStatusOverlay] = useState(true);

  useEffect(() => {
    const initialGrid = createEmptyGrid(ROWS, COLS);
    setGrid(initialGrid);
  }, [setGrid]);

  const handleMouseDown = useCallback((row, col) => {
    if (isVisualizing || isGeneratingMaze) return;

    const node = grid[row][col];

    const result = handleNodePlacement(row, col, node);

    if (result) {
      setGrid(result.newGrid);
      if (result.newStartNode !== undefined) setStartNode(result.newStartNode);
      if (result.newEndNode !== undefined) setEndNode(result.newEndNode);
      if (result.newPlacementMode) setPlacementMode(result.newPlacementMode);
    } else if (placementMode === PLACEMENT_MODES.WALL && !node.isStart && !node.isEnd) {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
    }

    setMouseIsPressed(true);
  }, [grid, isVisualizing, isGeneratingMaze, handleNodePlacement, placementMode, setStartNode, setEndNode, setPlacementMode, setMouseIsPressed]);

  const handleMouseEnter = useCallback((row, col) => {
    if (!mouseIsPressed || isVisualizing || isGeneratingMaze) return;

    if (placementMode === PLACEMENT_MODES.WALL) {
      const node = grid[row][col];
      if (!node.isStart && !node.isEnd) {
        const newGrid = getNewGridWithWallToggled(grid, row, col);
        setGrid(newGrid);
      }
    }
  }, [grid, mouseIsPressed, isVisualizing, isGeneratingMaze, placementMode, setGrid]);

  const handleMouseUp = useCallback(() => {
    setMouseIsPressed(false);
  }, [setMouseIsPressed]);

  const handleHideOverlay = useCallback(() => {
    setShowStatusOverlay(false);
  }, []);

  const resetGrid = useCallback(() => {
    setIsVisualizing(false);
    setIsGeneratingMaze(false);
    const newGrid = createEmptyGrid(ROWS, COLS);
    setGrid(newGrid);
    setStartNode(null);
    setEndNode(null);
    setPlacementMode(PLACEMENT_MODES.START);
    setStats({ visited: 0, pathLength: 0, time: 0 });
    setShowStatusOverlay(true);
  }, [setIsVisualizing, setIsGeneratingMaze, setGrid, setStartNode, setEndNode, setPlacementMode, setStats]);

  const handleGenerateMaze = useCallback(async () => {
    if (isVisualizing || isGeneratingMaze) return;

    if (!startNode || !endNode) {
      alert('Please place both start and end nodes before generating maze.');
      if (!startNode) setPlacementMode(PLACEMENT_MODES.START);
      else if (!endNode) setPlacementMode(PLACEMENT_MODES.END);
      return;
    }

    setIsGeneratingMaze(true);
    setShowStatusOverlay(true);

    try {
      await generateMaze(
        ROWS, COLS, startNode, endNode,
        loadMazeWasm, createEmptyGrid, setGrid
      );

      setStats({ visited: 0, pathLength: 0, time: 0 });

    } catch (error) {
      console.error('Error generating maze with WASM:', error);
      alert('Failed to generate maze with WebAssembly.');
    } finally {
      setIsGeneratingMaze(false);
    }
  }, [startNode, endNode, isVisualizing, isGeneratingMaze, generateMaze, setPlacementMode, setIsGeneratingMaze, setStats]);

  // Dans App.js - Correction du switch case pour les algorithmes

  const visualizeAlgorithm = useCallback(async () => {
    if (isVisualizing || isGeneratingMaze) return;

    if (!startNode || !endNode) {
      alert('Please place both start and end nodes before visualizing.');
      if (!startNode) setPlacementMode(PLACEMENT_MODES.START);
      else if (!endNode) setPlacementMode(PLACEMENT_MODES.END);
      return;
    }

    setIsVisualizing(true);
    setShowStatusOverlay(true);

    try {
      let wasmLoader;
      let service;
      let data;

      // CORRECTION: Utiliser des valeurs cohérentes
      const algorithmLower = algorithm.toLowerCase();

      if (algorithmLower === 'bfs') {
        wasmLoader = loadBfsWasm;
        service = runBFS;
      } else if (algorithmLower === 'dijkstra') {
        wasmLoader = loadDijkstraWasm;
        service = runDijkstra;
      } else if (algorithmLower === 'astar' || algorithmLower === 'a*' || algorithmLower === 'astart') {
        wasmLoader = loadAstartWasm;
        service = runAStar;
      } else {
        throw new Error(`Unknown algorithm: ${algorithm}`);
      }

      const mod = await wasmLoader();

      if (algorithmLower === 'bfs') {
        data = await service(mod, grid, ROWS, COLS, startNode, endNode);
      } else if (algorithmLower === 'dijkstra') {
        const matrix = gridToAdjMatrix(grid, ROWS, COLS);
        data = await service(mod, matrix, ROWS, COLS, startNode, endNode);
      } else {
        const matrix = gridToMatrix(grid, ROWS, COLS);
        data = await service(mod, matrix, ROWS, COLS, startNode, endNode);
      }

      setStats({
        visited: data.visitedNodes ? data.visitedNodes.length : 0,
        pathLength: data.shortestPath ? data.shortestPath.length : 0,
        time: data.time || 0
      });

      // CORRECTION: Passer le bon algorithme à animatePath
      await animatePath(
        grid,
        data.visitedNodes || [],
        data.shortestPath || [],
        startNode,
        endNode,
        setGrid,
        algorithmLower,  // Utiliser algorithmLower au lieu de algorithm
        COLS
      );

    } catch (error) {
      console.error(`Error visualizing ${algorithm}:`, error);
      alert(`Failed to run ${algorithm}.`);
    } finally {
      setIsVisualizing(false);
    }
  }, [algorithm, grid, startNode, endNode, isVisualizing, isGeneratingMaze, animatePath, setPlacementMode, setIsVisualizing, setStats, setGrid, COLS, ROWS]);

  const resetNodes = useCallback(() => {
    if (isVisualizing || isGeneratingMaze) return;

    const newGrid = grid.map(r => r.map(node => ({ ...node })));

    if (startNode) {
      newGrid[startNode.row][startNode.col].isStart = false;
      newGrid[startNode.row][startNode.col].isVisited = false;
      newGrid[startNode.row][startNode.col].isPath = false;
    }
    if (endNode) {
      newGrid[endNode.row][endNode.col].isEnd = false;
      newGrid[endNode.row][endNode.col].isVisited = false;
      newGrid[endNode.row][endNode.col].isPath = false;
    }

    setGrid(newGrid);
    setStartNode(null);
    setEndNode(null);
    setPlacementMode(PLACEMENT_MODES.START);
    setStats({ visited: 0, pathLength: 0, time: 0 });
  }, [grid, startNode, endNode, isVisualizing, isGeneratingMaze, setGrid, setStartNode, setEndNode, setPlacementMode, setStats]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header">
          <h1>PathFinding Visualizer</h1>
          <p className="header-subtitle">Interactive Algorithm Visualization</p>
        </div>

        <div className="main-container">
          {/* LEFT: Stats */}
          <div className="left-panel">
            <div className="panel-content">
              <Stats stats={stats} />
              <div className="status-info">
                <h4>Current Status</h4>
                <p>Start: {startNode ? `(${startNode.row}, ${startNode.col})` : 'Not placed'}</p>
                <p>End: {endNode ? `(${endNode.row}, ${endNode.col})` : 'Not placed'}</p>
                <p>Mode: {
                  placementMode === PLACEMENT_MODES.START ? 'Placing Start' :
                    placementMode === PLACEMENT_MODES.END ? 'Placing End' : 'Adding Walls'
                }</p>
              </div>
            </div>
          </div>

          {/* CENTER: Grid */}
          <div className="center-panel">
            <div className="grid-container">
              <div className="grid-header">
                <h3>Grid Visualization</h3>
                <div className="legend">
                  <div className="legend-item">
                    <div className="legend-color start"></div>
                    <span>Start</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color end"></div>
                    <span>End</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color wall"></div>
                    <span>Wall</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color visited"></div>
                    <span>Visited</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color path"></div>
                    <span>Path</span>
                  </div>
                </div>
              </div>

              <div className="grid-wrapper">
                <Grid
                  grid={grid}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onMouseUp={handleMouseUp}
                  placementMode={placementMode}
                  isDisabled={isVisualizing || isGeneratingMaze}
                />

                {(isVisualizing || isGeneratingMaze) && showStatusOverlay && (
                  <div className="status-indicator-overlay" onClick={handleHideOverlay}>
                    <div className="status-indicator">
                      <div className="spinner"></div>
                      <div className="status-text">
                        <div>{isGeneratingMaze ? 'Generating maze...' : `Running ${algorithm.toUpperCase()}...`}</div>
                        <div className="status-subtext">
                          Click to hide • Visualization in progress
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid-instructions">
                <p>
                  {!startNode ? 'Click to place START node (green)' :
                    !endNode ? 'Click to place END node (red)' :
                      'Click & drag to create walls • Use buttons to move nodes'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="right-panel">
            <div className="panel-content">
              <Controls
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                onVisualize={visualizeAlgorithm}
                onClear={resetGrid}
                onGenerateMaze={handleGenerateMaze}
                onResetNodes={resetNodes}
                isVisualizing={isVisualizing || isGeneratingMaze}
                startPlaced={!!startNode}
                endPlaced={!!endNode}
                placementMode={placementMode}
                setPlacementMode={setPlacementMode}
              />
            </div>
          </div>
        </div>

        <div className="footer"></div>
      </header>
    </div>
  );
}

export default App;
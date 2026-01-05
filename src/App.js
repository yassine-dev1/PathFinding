import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Grid from './components/Grid';
import Controls from './components/Controls';
import Stats from './components/Stats';

const ROWS = 15;
const COLS = 40;
// Pas de position par défaut - grille vide
const BACKEND_URL = 'http://localhost:8080';

// Grille complètement vide au départ
const createEmptyGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push({
        row,
        col,
        isStart: false, // Tous false au départ
        isEnd: false,   // Tous false au départ
        isWall: false,
        isVisited: false,
        isPath: false,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

function App() {
  const [grid, setGrid] = useState([]);
  const [startNode, setStartNode] = useState(null); // Pas de start par défaut
  const [endNode, setEndNode] = useState(null);     // Pas de end par défaut
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 });
  const [isGeneratingMaze, setIsGeneratingMaze] = useState(false);
  const [placementMode, setPlacementMode] = useState('start'); // 'start', 'end', 'wall'

  useEffect(() => {
    const initialGrid = createEmptyGrid();
    setGrid(initialGrid);
  }, []);

  const handleMouseDown = useCallback((row, col) => {
    if (isVisualizing || isGeneratingMaze) return;
    
    const node = grid[row][col];
    
    // Mode placement des nœuds
    if (placementMode === 'start') {
      // Si on clique sur le end existant, on le supprime d'abord
      if (node.isEnd) {
        const newGrid = grid.map(r => r.map(n => ({ ...n })));
        newGrid[row][col].isEnd = false;
        setEndNode(null);
        setGrid(newGrid);
      }
      
      // Supprimer l'ancien start s'il existe
      if (startNode) {
        const newGrid = grid.map(r => r.map(n => ({ ...n })));
        newGrid[startNode.row][startNode.col].isStart = false;
        setGrid(newGrid);
      }
      
      // Placer le nouveau start
      const newGrid = grid.map(r => r.map(n => ({ ...n })));
      newGrid[row][col].isStart = true;
      newGrid[row][col].isWall = false;
      setStartNode({ row, col });
      setGrid(newGrid);
      
      // Passer au mode end
      setPlacementMode('end');
      return;
    }
    
    if (placementMode === 'end') {
      // Si on clique sur le start existant, on le supprime d'abord
      if (node.isStart) {
        const newGrid = grid.map(r => r.map(n => ({ ...n })));
        newGrid[row][col].isStart = false;
        setStartNode(null);
        setGrid(newGrid);
      }
      
      // Supprimer l'ancien end s'il existe
      if (endNode) {
        const newGrid = grid.map(r => r.map(n => ({ ...n })));
        newGrid[endNode.row][endNode.col].isEnd = false;
        setGrid(newGrid);
      }
      
      // Placer le nouveau end
      const newGrid = grid.map(r => r.map(n => ({ ...n })));
      newGrid[row][col].isEnd = true;
      newGrid[row][col].isWall = false;
      setEndNode({ row, col });
      setGrid(newGrid);
      
      // Passer au mode wall (normal)
      setPlacementMode('wall');
      return;
    }
    
    // Mode normal (walls)
    if (placementMode === 'wall') {
      // Ne pas permettre de mettre un mur sur start ou end
      if (!node.isStart && !node.isEnd) {
        const newGrid = getNewGridWithWallToggled(grid, row, col);
        setGrid(newGrid);
        setMouseIsPressed(true);
      }
    }
  }, [grid, isVisualizing, isGeneratingMaze, placementMode, startNode, endNode]);

  const handleMouseEnter = useCallback((row, col) => {
    if (!mouseIsPressed || isVisualizing || isGeneratingMaze) return;
    
    // En mode wall, on peut continuer à dessiner
    if (placementMode === 'wall') {
      const node = grid[row][col];
      if (!node.isStart && !node.isEnd) {
        const newGrid = getNewGridWithWallToggled(grid, row, col);
        setGrid(newGrid);
      }
    }
  }, [grid, mouseIsPressed, isVisualizing, isGeneratingMaze, placementMode]);

  const handleMouseUp = useCallback(() => {
    setMouseIsPressed(false);
  }, []);

  const resetGrid = useCallback(() => {
    setIsVisualizing(false);
    setIsGeneratingMaze(false);
    const newGrid = createEmptyGrid();
    setGrid(newGrid);
    setStartNode(null);
    setEndNode(null);
    setPlacementMode('start'); // Retour au mode placement start
    setStats({ visited: 0, pathLength: 0, time: 0 });
  }, []);

  const handleGenerateMaze = useCallback(async () => {
    if (isVisualizing || isGeneratingMaze) return;
    
    // Vérifier que start et end sont placés
    if (!startNode || !endNode) {
      alert('Please place both start and end nodes before generating maze.');
      if (!startNode) setPlacementMode('start');
      else if (!endNode) setPlacementMode('end');
      return;
    }
    
    setIsGeneratingMaze(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/maze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rows: ROWS,
          cols: COLS,
          start: startNode,
          end: endNode
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.grid) {
        const newGrid = createEmptyGrid();
        
        // Remettre les nœuds start et end
        newGrid[startNode.row][startNode.col].isStart = true;
        newGrid[endNode.row][endNode.col].isEnd = true;
        
        // Ajouter les murs
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            if (data.grid[row] && data.grid[row][col] !== undefined) {
              const cellValue = data.grid[row][col];
              const isWall = cellValue === 1 || cellValue === true || cellValue === '1';
              
              if (isWall && 
                  !(row === startNode.row && col === startNode.col) &&
                  !(row === endNode.row && col === endNode.col)) {
                newGrid[row][col].isWall = true;
              }
            }
          }
        }
        
        setGrid(newGrid);
        setStats({ visited: 0, pathLength: 0, time: 0 });
        
        setTimeout(() => {
          alert('✅ Maze generated by C++ backend!');
        }, 100);
        
      }
    } catch (error) {
      console.error('Error generating maze:', error);
      alert('Failed to generate maze. Make sure C++ server is running.');
    } finally {
      setIsGeneratingMaze(false);
    }
  }, [startNode, endNode, isVisualizing, isGeneratingMaze]);

  const visualizeAlgorithm = useCallback(() => {
    if (isVisualizing || isGeneratingMaze) return;
    
    // Vérifier que start et end sont placés
    if (!startNode || !endNode) {
      alert('Please place both start and end nodes before visualizing.');
      if (!startNode) setPlacementMode('start');
      else if (!endNode) setPlacementMode('end');
      return;
    }
    
    setIsVisualizing(true);
    
    if (algorithm === 'dijkstra') {
      setTimeout(() => {
        alert('Dijkstra Algorithm selected!');
        setIsVisualizing(false);
      }, 100);
    } else if (algorithm === 'bfs') {
      setTimeout(() => {
        alert('BFS Algorithm selected!');
        setIsVisualizing(false);
      }, 100);
    }
  }, [algorithm, isVisualizing, isGeneratingMaze, startNode, endNode]);

  // Fonction pour réinitialiser les nœuds
  const resetNodes = useCallback(() => {
    if (isVisualizing || isGeneratingMaze) return;
    
    const newGrid = grid.map(r => r.map(node => ({ ...node })));
    
    if (startNode) {
      newGrid[startNode.row][startNode.col].isStart = false;
    }
    if (endNode) {
      newGrid[endNode.row][endNode.col].isEnd = false;
    }
    
    setGrid(newGrid);
    setStartNode(null);
    setEndNode(null);
    setPlacementMode('start');
  }, [grid, startNode, endNode, isVisualizing, isGeneratingMaze]);

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
                
                {(isVisualizing || isGeneratingMaze) && (
                  <div className="overlay-message">
                    <div className="spinner"></div>
                    <span>{isGeneratingMaze ? 'Generating maze...' : 'Visualizing...'}</span>
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
      </header>
    </div>
  );
}

function getNewGridWithWallToggled(grid, row, col) {
  const newGrid = grid.map(r => r.map(node => ({ ...node })));
  const node = newGrid[row][col];
  
  if (!node.isStart && !node.isEnd) {
    node.isWall = !node.isWall;
  }
  
  return newGrid;
}

export default App;
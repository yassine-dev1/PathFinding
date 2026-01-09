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

// Fonction utilitaire pour les délais
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function App() {
  const [grid, setGrid] = useState([]);
  const [startNode, setStartNode] = useState(null); // Pas de start par défaut
  const [endNode, setEndNode] = useState(null);     // Pas de end par défaut
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [algorithm, setAlgorithm] = useState('bfs'); // Changé à 'bfs' par défaut
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 });
  const [isGeneratingMaze, setIsGeneratingMaze] = useState(false);
  const [placementMode, setPlacementMode] = useState('start'); // 'start', 'end', 'wall'
  const [showStatusOverlay, setShowStatusOverlay] = useState(true); // Nouvel état

  useEffect(() => {
    const initialGrid = createEmptyGrid();
    setGrid(initialGrid);
  }, []);

  // Fonction pour animer les résultats du backend EN TEMPS RÉEL
  const animateAlgorithm = useCallback(async (data) => {
    const { visitedNodes, shortestPath, pathFound } = data;
    
    // Créer une copie de la grille actuelle
    const newGrid = grid.map(r => r.map(node => ({
      ...node,
      isVisited: false,
      isPath: false
    })));
    
    // Réinitialiser la grille d'abord
    setGrid([...newGrid]);
    await sleep(50); // Réduit de 100 à 50
    
    // Animer les nœuds visités EN TEMPS RÉEL
    if (visitedNodes && visitedNodes.length > 0) {
      for (let i = 0; i < visitedNodes.length; i++) {
        const [row, col] = visitedNodes[i];
        
        // Ne pas colorier start et end
        if (!(row === startNode.row && col === startNode.col) &&
            !(row === endNode.row && col === endNode.col)) {
          newGrid[row][col].isVisited = true;
        }
        
        // Mettre à jour la grille plus fréquemment pour une animation fluide
        if (i % 2 === 0 || i === visitedNodes.length - 1) {
          setGrid([...newGrid]);
          await sleep(1); // Réduit de 10 à 1 pour plus de fluidité
        }
      }
    }
    
    // Si un chemin a été trouvé, l'animer
    if (pathFound && shortestPath && shortestPath.length > 0) {
      await sleep(50); // Pause courte avant de montrer le chemin
      
      for (let i = 0; i < shortestPath.length; i++) {
        const [row, col] = shortestPath[i];
        
        // Ne pas colorier start et end
        if (!(row === startNode.row && col === startNode.col) &&
            !(row === endNode.row && col === endNode.col)) {
          newGrid[row][col].isPath = true;
          newGrid[row][col].isVisited = false; // Enlever la couleur visited pour le chemin
        }
        
        // Mettre à jour la grille
        if (i % 1 === 0 || i === shortestPath.length - 1) {
          setGrid([...newGrid]);
          await sleep(10); // Réduit de 30 à 10
        }
      }
    }
    
    // Dernière mise à jour
    setGrid(newGrid);
    await sleep(20);
  }, [grid, startNode, endNode]);

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
      newGrid[row][col].isVisited = false;
      newGrid[row][col].isPath = false;
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
      newGrid[row][col].isVisited = false;
      newGrid[row][col].isPath = false;
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

  const handleHideOverlay = useCallback(() => {
    setShowStatusOverlay(false);
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
    setShowStatusOverlay(true); // Réafficher l'overlay
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
  setShowStatusOverlay(true);
  
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
      // CRITIQUE: Utiliser les positions start/end du backend
      const backendStart = data.start || startNode;
      const backendEnd = data.end || endNode;
      
      // Mettre à jour les états start/end avec les valeurs du backend
      setStartNode(backendStart);
      setEndNode(backendEnd);
      
      const newGrid = createEmptyGrid();
      
      // Utiliser les positions du backend
      newGrid[backendStart.row][backendStart.col].isStart = true;
      newGrid[backendEnd.row][backendEnd.col].isEnd = true;
      
      // Ajouter les murs
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (data.grid[row] && data.grid[row][col] !== undefined) {
            const cellValue = data.grid[row][col];
            const isWall = cellValue === 1 || cellValue === true || cellValue === '1';
            
            if (isWall && 
                !(row === backendStart.row && col === backendStart.col) &&
                !(row === backendEnd.row && col === backendEnd.col)) {
              newGrid[row][col].isWall = true;
            }
          }
        }
      }
      
      setGrid(newGrid);
      setStats({ visited: 0, pathLength: 0, time: 0 });
      
      // DEBUG: Afficher les positions utilisées
      console.log('Maze generated with:', {
        backendStart,
        backendEnd,
        frontendStart: startNode,
        frontendEnd: endNode
      });
      
      setTimeout(() => {
        alert(`✅ Maze generated by C++ backend!\nStart: (${backendStart.row}, ${backendStart.col})\nEnd: (${backendEnd.row}, ${backendEnd.col})`);
      }, 100);
    }
  } catch (error) {
    console.error('Error generating maze:', error);
    alert('Failed to generate maze. Make sure C++ server is running.');
  } finally {
    setIsGeneratingMaze(false);
  }
}, [startNode, endNode, isVisualizing, isGeneratingMaze]);

  const visualizeAlgorithm = useCallback(async () => {
    if (isVisualizing || isGeneratingMaze) return;
    
    // Vérifier que start et end sont placés
    if (!startNode || !endNode) {
      alert('Please place both start and end nodes before visualizing.');
      if (!startNode) setPlacementMode('start');
      else if (!endNode) setPlacementMode('end');
      return;
    }
    
    setIsVisualizing(true);
    setShowStatusOverlay(true);
    
    try {
      // Préparer la grille pour l'envoi au backend
      const gridForBackend = grid.map(row => 
        row.map(node => 
          node.isWall ? 1 : 0  // 1 pour mur, 0 pour passage
        )
      );
      
      // Appeler le backend C++
      console.log('Sending request to backend:', {
        algorithm,
        start: startNode,
        end: endNode,
        rows: ROWS,
        cols: COLS
      });
      
      const response = await fetch(`${BACKEND_URL}/api/visualize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          algorithm: algorithm, // 'bfs' ou 'dijkstra'
          grid: gridForBackend,
          start: startNode,
          end: endNode,
          rows: ROWS,
          cols: COLS
        })
      });
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        // Mettre à jour les statistiques
        setStats({
          visited: data.visitedCount,
          pathLength: data.pathLength,
          time: data.executionTime
        });
        
        // Animer les résultats
        await animateAlgorithm(data);
        
        // Afficher les résultats
        const message = data.pathFound 
          ? `✅ ${algorithm.toUpperCase()} completed!\n` +
            `Visited: ${data.visitedCount} cells\n` +
            `Path length: ${data.pathLength} steps\n` +
            `Time: ${data.executionTime.toFixed(2)} ms`
          : `❌ ${algorithm.toUpperCase()} completed!\n` +
            `No path found between start and end.\n` +
            `Visited: ${data.visitedCount} cells\n` +
            `Time: ${data.executionTime.toFixed(2)} ms`;
        
        alert(message);
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error visualizing algorithm:', error);
      alert(`Failed to run ${algorithm}. Make sure C++ server is running at ${BACKEND_URL}`);
    } finally {
      setIsVisualizing(false);
    }
  }, [algorithm, grid, startNode, endNode, isVisualizing, isGeneratingMaze, animateAlgorithm]);

  // Fonction pour réinitialiser les nœuds
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
    setPlacementMode('start');
    setStats({ visited: 0, pathLength: 0, time: 0 });
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
              <div className="status-info">
                <h4>Current Status</h4>
                <p>Start: {startNode ? `(${startNode.row}, ${startNode.col})` : 'Not placed'}</p>
                <p>End: {endNode ? `(${endNode.row}, ${endNode.col})` : 'Not placed'}</p>
                <p>Mode: {placementMode === 'start' ? 'Placing Start' : 
                         placementMode === 'end' ? 'Placing End' : 'Adding Walls'}</p>
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
                
                {/* Overlay non-bloquant pour afficher le statut */}
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
                <p className="backend-status">
                  
                  
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
        
        <div className="footer">
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
    // Réinitialiser les états de visualisation si on modifie un mur
    node.isVisited = false;
    node.isPath = false;
  }
  
  return newGrid;
}

export default App;
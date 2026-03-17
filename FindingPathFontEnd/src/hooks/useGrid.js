import { useState, useCallback } from 'react';
import { PLACEMENT_MODES } from '../constants/gridConstants';
import { createEmptyGrid } from '../utils/gridUtils';

const useGrid = (ROWS, COLS) => {
    const [grid, setGrid] = useState([]);
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [placementMode, setPlacementMode] = useState(PLACEMENT_MODES.START);
    const [mouseIsPressed, setMouseIsPressed] = useState(false);

    const handleNodePlacement = useCallback((row, col, node) => {
        let newGrid;
        let newStartNode = startNode;
        let newEndNode = endNode;
        let newPlacementMode = placementMode;

        if (placementMode === PLACEMENT_MODES.START) {
            // Supprimer l'ancien start s'il existe
            if (startNode) {
                newGrid = grid.map(r => r.map(n => ({ ...n })));
                newGrid[startNode.row][startNode.col].isStart = false;
            } else {
                newGrid = grid.map(r => r.map(n => ({ ...n })));
            }

            // Si on clique sur le end existant, le supprimer
            if (node.isEnd) {
                newGrid[row][col].isEnd = false;
                newEndNode = null;
            }

            // Placer le nouveau start
            newGrid[row][col].isStart = true;
            newGrid[row][col].isWall = false;
            newGrid[row][col].isVisited = false;
            newGrid[row][col].isPath = false;
            newStartNode = { row, col };
            newPlacementMode = PLACEMENT_MODES.END;

            return { newGrid, newStartNode, newEndNode, newPlacementMode };
        }

        if (placementMode === PLACEMENT_MODES.END) {
            // Supprimer l'ancien end s'il existe
            if (endNode) {
                newGrid = grid.map(r => r.map(n => ({ ...n })));
                newGrid[endNode.row][endNode.col].isEnd = false;
            } else {
                newGrid = grid.map(r => r.map(n => ({ ...n })));
            }

            // Si on clique sur le start existant, le supprimer
            if (node.isStart) {
                newGrid[row][col].isStart = false;
                newStartNode = null;
            }

            // Placer le nouveau end
            newGrid[row][col].isEnd = true;
            newGrid[row][col].isWall = false;
            newGrid[row][col].isVisited = false;
            newGrid[row][col].isPath = false;
            newEndNode = { row, col };
            newPlacementMode = PLACEMENT_MODES.WALL;

            return { newGrid, newStartNode, newEndNode, newPlacementMode };
        }

        return null;
    }, [grid, startNode, endNode, placementMode]);

    const resetGrid = useCallback(() => {
        const newGrid = createEmptyGrid(ROWS, COLS);
        setGrid(newGrid);
        return newGrid;
    }, [ROWS, COLS]);

    return {
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
        resetGrid
    };
};

export default useGrid;
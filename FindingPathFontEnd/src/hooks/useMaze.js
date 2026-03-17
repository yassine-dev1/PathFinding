import { useState, useCallback } from 'react';

const useMaze = () => {
    const [isGeneratingMaze, setIsGeneratingMaze] = useState(false);

    const generateMaze = useCallback(async (ROWS, COLS, startNode, endNode, loadMazeWasm, createEmptyGrid, setGrid) => {
        try {
            const mod = await loadMazeWasm();

            if (!mod.HEAP32) {
                alert('Erreur : module WASM de génération de labyrinthe invalide');
                return null;
            }

            const generateMaze = mod.cwrap('generateMaze', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
            const freeMaze = mod.cwrap('freeMaze', 'void', ['number']);

            const resultPtr = generateMaze(
                ROWS,
                COLS,
                startNode.row,
                startNode.col,
                endNode.row,
                endNode.col
            );

            if (resultPtr === 0) {
                alert('Erreur d\'allocation mémoire dans le module WASM');
                return null;
            }

            const mazeArray = [];
            for (let i = 0; i < ROWS * COLS; i++) {
                mazeArray.push(mod.HEAP32[resultPtr / 4 + i]);
            }

            const newGrid = createEmptyGrid(ROWS, COLS);
            newGrid[startNode.row][startNode.col].isStart = true;
            newGrid[endNode.row][endNode.col].isEnd = true;

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (mazeArray[r * COLS + c] === 1) {
                        newGrid[r][c].isWall = true;
                    }
                }
            }

            setGrid(newGrid);
            freeMaze(resultPtr);

            return newGrid;
        } catch (error) {
            console.error('Error generating maze:', error);
            throw error;
        }
    }, []);

    return {
        isGeneratingMaze,
        setIsGeneratingMaze,
        generateMaze
    };
};

export default useMaze;
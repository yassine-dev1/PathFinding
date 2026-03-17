// src/services/algorithms/bfsService.js
export const runBFS = async (mod, grid, ROWS, COLS, startNode, endNode) => {
    try {
        const bfsFunc = mod.cwrap('bfs', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
        const malloc = mod.cwrap('malloc', 'number', ['number']);
        const free = mod.cwrap('free', 'void', ['number']);

        const linearGrid = new Int32Array(ROWS * COLS);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                linearGrid[r * COLS + c] = grid[r][c].isWall ? 1 : 0;
            }
        }

        const gridPtr = malloc(linearGrid.length * 4);
        mod.HEAP32.set(linearGrid, gridPtr / 4);

        const resultPtr = bfsFunc(ROWS, COLS, gridPtr, startNode.row, startNode.col, endNode.row, endNode.col);

        if (resultPtr === 0) {
            free(gridPtr);
            throw new Error('Erreur allocation');
        }

        const pathSize = mod.HEAP32[resultPtr / 4] || 0;
        const visitedSize = mod.HEAP32[resultPtr / 4 + 1] || 0;
        const timeInt = mod.HEAP32[resultPtr / 4 + 2] || 0;
        const timeDec = mod.HEAP32[resultPtr / 4 + 3] || 0;

        const path = [];
        for (let i = 0; i < pathSize; i++) {
            const index = mod.HEAP32[resultPtr / 4 + 4 + i];
            // Convertir l'index en [row, col] pour BFS
            const row = Math.floor(index / COLS);
            const col = index % COLS;
            path.push([row, col]);  // Format [row, col] pour BFS
        }

        const visitedNodes = [];
        for (let i = 0; i < visitedSize; i++) {
            const index = mod.HEAP32[resultPtr / 4 + 4 + pathSize + i];
            const row = Math.floor(index / COLS);
            const col = index % COLS;
            visitedNodes.push([row, col]);  // Format [row, col] pour BFS
        }

        free(gridPtr);
        free(resultPtr);

        return {
            pathFound: pathSize > 0,
            visitedNodes: visitedNodes || [],
            shortestPath: path || [],
            time: timeInt + timeDec / 100
        };
    } catch (error) {
        console.error('Error in BFS service:', error);
        return {
            pathFound: false,
            visitedNodes: [],
            shortestPath: [],
            time: 0
        };
    }
};
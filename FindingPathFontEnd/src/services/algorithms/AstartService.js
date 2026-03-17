// src/services/algorithms/aStarService.js
export const runAStar = async (mod, matrix, ROWS, COLS, startNode, endNode) => {
    try {
        const start = startNode.row * COLS + startNode.col;
        const end = endNode.row * COLS + endNode.col;

        const AStart = mod.cwrap("AStart", "number", ["number", "number", "number", "number", "number"]);

        const matrixPtr = mod._malloc(matrix.length * 4);
        mod.HEAP32.set(matrix, matrixPtr / 4);

        const resultPtr = AStart(start, end, COLS, ROWS, matrixPtr);

        if (resultPtr === 0) {
            throw new Error('Erreur allocation');
        }

        const size = mod.HEAP32[resultPtr / 4] || 0;
        const sizeVisited = mod.HEAP32[resultPtr / 4 + 1] || 0;
        const time_entier = mod.HEAP32[resultPtr / 4 + 2] || 0;
        const time_decimal = mod.HEAP32[resultPtr / 4 + 3] || 0;

        const path = [];
        const visitedNodes = [];

        for (let i = 0; i < size; i++) {
            path.push(mod.HEAP32[resultPtr / 4 + (i + 4)]);
        }

        for (let i = 0; i < sizeVisited; i++) {
            visitedNodes.push(mod.HEAP32[resultPtr / 4 + (i + 4 + size)]);
        }

        return {
            pathFound: size > 0,
            visitedNodes: visitedNodes || [],
            shortestPath: path || [],
            time: time_entier + time_decimal / 100
        };
    } catch (error) {
        console.error('Error in A* service:', error);
        return {
            pathFound: false,
            visitedNodes: [],
            shortestPath: [],
            time: 0
        };
    }
};
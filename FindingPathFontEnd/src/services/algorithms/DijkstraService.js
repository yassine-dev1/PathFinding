export const runDijkstra = async (mod, matrix, ROWS, COLS, startNode, endNode) => {
    const start = startNode.row * COLS + startNode.col;
    const end = endNode.row * COLS + endNode.col;

    const dijkstra = mod.cwrap("dijkstra", "number", ["number", "number", "number", "number"]);
    const n = ROWS * COLS;

    const matrixPtr = mod._malloc(matrix.length * 4);
    mod.HEAP32.set(matrix, matrixPtr / 4);

    const resultPtr = dijkstra(n, matrixPtr, start, end);

    const size = mod.HEAP32[resultPtr / 4];
    const sizeVisited = mod.HEAP32[resultPtr / 4 + 1];
    const time_entier = mod.HEAP32[resultPtr / 4 + 2];
    const time_decimal = mod.HEAP32[resultPtr / 4 + 3];

    const path = [];
    const visitedNodes = [];

    for (let i = 0; i < size; i++)
        path.push(mod.HEAP32[resultPtr / 4 + (i + 4)]);

    for (let i = 0; i < sizeVisited; i++)
        visitedNodes.push(mod.HEAP32[resultPtr / 4 + (i + 4 + size)]);

    return {
        pathFound: size > 0,
        visitedNodes,
        shortestPath: path,
        time: time_entier + time_decimal / 100
    };
};
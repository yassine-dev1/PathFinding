import { ROWS, COLS } from '../constants/gridConstants';

export const createEmptyGrid = (rows = ROWS, cols = COLS) => {
    const grid = [];
    for (let row = 0; row < rows; row++) {
        const currentRow = [];
        for (let col = 0; col < cols; col++) {
            currentRow.push({
                row,
                col,
                isStart: false,
                isEnd: false,
                isWall: false,
                isVisited: false,
                isPath: false,
            });
        }
        grid.push(currentRow);
    }
    return grid;
};

export const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.map(r => r.map(node => ({ ...node })));
    const node = newGrid[row][col];

    if (!node.isStart && !node.isEnd) {
        node.isWall = !node.isWall;
        node.isVisited = false;
        node.isPath = false;
    }

    return newGrid;
};

export const resetVisualizationState = (grid) => {
    return grid.map(row =>
        row.map(node => ({
            ...node,
            isVisited: false,
            isPath: false
        }))
    );
};
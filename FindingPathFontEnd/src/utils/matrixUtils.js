export const gridToAdjMatrix = (grid, ROWS, COLS) => {
    const n = ROWS * COLS;
    const matrix = new Int32Array(n * n).fill(0);
    const index = (r, c) => r * COLS + c;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].isWall) continue;

            const from = index(r, c);

            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;

                if (
                    nr >= 0 && nr < ROWS &&
                    nc >= 0 && nc < COLS &&
                    grid[nr][nc].isWall === false
                ) {
                    const to = index(nr, nc);
                    matrix[from * n + to] = 1;
                }
            }
        }
    }

    return matrix;
};

export const gridToMatrix = (grid, ROWS, COLS) => {
    const n = ROWS * COLS;
    const matrix = new Int32Array(n).fill(0);
    const index = (r, c) => r * COLS + c;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].isWall) continue;
            const from = index(r, c);
            matrix[from] = 1;
        }
    }

    return matrix;
};

export const getRowCol = (index, COLS) => {
    return {
        row: Math.floor(index / COLS),
        col: index % COLS
    };
};
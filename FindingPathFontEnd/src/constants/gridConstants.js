export const ROWS = 20;
export const COLS = 40;

export const NODE_STATES = {
    EMPTY: 'empty',
    START: 'start',
    END: 'end',
    WALL: 'wall',
    VISITED: 'visited',
    PATH: 'path'
};

export const ALGORITHM_TYPES = {
    BFS: 'bfs',
    DIJKSTRA: 'dijkstra',
    ASTAR: 'astar'
};

export const PLACEMENT_MODES = {
    START: 'start',
    END: 'end',
    WALL: 'wall'
};

export const ANIMATION_SPEED = {
    VISITED_DELAY: 1,
    PATH_DELAY: 10,
    RESET_DELAY: 50
};
import { useState, useCallback } from 'react';
import { animatePath } from '../utils/animationUtils';
import { getRowCol } from '../utils/matrixUtils';

const useVisualization = (grid, startNode, endNode, ROWS, COLS) => {
    const [isVisualizing, setIsVisualizing] = useState(false);
    const [stats, setStats] = useState({ visited: 0, pathLength: 0, time: 0 });

    const animateAlgorithm = useCallback(async (data, type) => {
        const { visitedNodes, shortestPath } = data;

        await animatePath(
            grid,
            visitedNodes,
            shortestPath,
            startNode,
            endNode,
            (newGrid) => {
                // Cette fonction sera passée à animatePath pour mettre à jour la grille
                // La logique est gérée dans animationUtils
            },
            type,
            COLS
        );
    }, [grid, startNode, endNode, COLS]);

    const visualizeAlgorithm = useCallback(async (algorithm, serviceFunction) => {
        // Logique de visualisation
    }, []);

    return {
        isVisualizing,
        setIsVisualizing,
        stats,
        setStats,
        animateAlgorithm,
        visualizeAlgorithm
    };
};

export default useVisualization;
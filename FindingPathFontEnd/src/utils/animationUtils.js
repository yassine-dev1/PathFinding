// src/utils/animationUtils.js
import { ANIMATION_SPEED } from '../constants/gridConstants';

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const animatePath = async (
    grid,
    visitedNodes,
    shortestPath,
    startNode,
    endNode,
    setGrid,
    algorithm = "bfs",
    COLS = 40
) => {
    // Fonction utilitaire pour obtenir row/col selon le type d'algorithme
    const getNodePosition = (node, algorithm, COLS) => {
        if (algorithm === "bfs") {
            // Pour BFS, les noeuds sont des tableaux [row, col]
            if (Array.isArray(node)) {
                return { row: node[0], col: node[1] };
            }
            // Si c'est un index
            return {
                row: Math.floor(node / COLS),
                col: node % COLS
            };
        } else {
            // Pour Dijkstra et A*, les noeuds sont des index
            return {
                row: Math.floor(node / COLS),
                col: node % COLS
            };
        }
    };

    // Créer une copie de la grille actuelle
    const newGrid = grid.map(r => r.map(node => ({
        ...node,
        isVisited: false,
        isPath: false
    })));

    // Réinitialiser la grille d'abord
    setGrid([...newGrid]);
    await sleep(ANIMATION_SPEED.RESET_DELAY);

    // Animer les nœuds visités
    if (visitedNodes && visitedNodes.length > 0) {
        for (let i = 0; i < visitedNodes.length; i++) {
            const { row, col } = getNodePosition(visitedNodes[i], algorithm, COLS);

            // Vérifier que row et col sont valides
            if (row !== undefined && col !== undefined) {
                // Ne pas colorier start et end
                if (startNode && endNode) {
                    if (!(row === startNode.row && col === startNode.col) &&
                        !(row === endNode.row && col === endNode.col)) {
                        if (newGrid[row] && newGrid[row][col]) {
                            newGrid[row][col].isVisited = true;
                        }
                    }
                }
            }

            // Mettre à jour la grille plus fréquemment
            if (i % 2 === 0 || i === visitedNodes.length - 1) {
                setGrid([...newGrid]);
                await sleep(ANIMATION_SPEED.VISITED_DELAY);
            }
        }
    }

    // Animer le chemin le plus court
    if (shortestPath && shortestPath.length > 0) {
        await sleep(50);

        for (let i = 0; i < shortestPath.length; i++) {
            const { row, col } = getNodePosition(shortestPath[i], algorithm, COLS);

            if (row !== undefined && col !== undefined) {
                if (startNode && endNode) {
                    if (!(row === startNode.row && col === startNode.col) &&
                        !(row === endNode.row && col === endNode.col)) {
                        if (newGrid[row] && newGrid[row][col]) {
                            newGrid[row][col].isPath = true;
                            newGrid[row][col].isVisited = false;
                        }
                    }
                }
            }

            // Mettre à jour la grille
            if (i % 1 === 0 || i === shortestPath.length - 1) {
                setGrid([...newGrid]);
                await sleep(ANIMATION_SPEED.PATH_DELAY);
            }
        }
    }

    // Dernière mise à jour
    setGrid(newGrid);
    await sleep(20);
};
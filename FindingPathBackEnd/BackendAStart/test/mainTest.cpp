#include <iostream>
#include <vector>
#include "Headers/AstarSolver.h"
#include "Headers/Node.h"

int main() {
    // 1. Définir les dimensions
    int rows = 5;
    int cols = 5;

    // 2. Créer une grille (0 = mur, 1 = libre)
    // S = Start, T = Target, # = Mur
    // S  1  0  1  1
    // 1  #  0  1  1
    // 1  1  1  #  1
    // 0  0  1  1  1
    // 1  1  1  1  T
    int grid[] = {
        1, 1, 0, 1, 1,
        1, 0, 0, 1, 1,
        1, 1, 1, 0, 1,
        0, 0, 1, 1, 1,
        1, 1, 1, 1, 1
    };

    // 3. Définir départ (0,0) et arrivée (4,4)
    int startId = 0;      // Index de (0,0)
    int targetId = 24;    // Index de (4,4) -> 4 * 5 + 4

    // 4. Instancier le Solver
    AstarSolver solver(startId, targetId, rows, cols, grid);

    // 5. Résoudre
    std::cout << "Calcul du chemin en cours..." << std::endl;
    PathResult result = solver.solve();

    // 6. Afficher les résultats
    if (result.path.empty()) {
        std::cout << "Aucun chemin trouve !" << std::endl;
    } else {
        std::cout << "Chemin trouve ! Longueur : " << result.path.size() << " noeuds." << std::endl;
        
        std::cout << "Etapes du chemin (ID) : ";
        for (int id : result.path) {
            int r = id / cols;
            int c = id % cols;
            std::cout << "(" << r << "," << c << ") ";
        }
        std::cout << std::endl;

        std::cout << "Nombre de noeuds explores au total : " << result.visitedNodes.size() << std::endl;
    }

    return 0;
}
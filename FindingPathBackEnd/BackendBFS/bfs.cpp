#include <emscripten.h>
#include <vector>
#include <queue>
#include <chrono>
#include <algorithm>
#include <cstdlib>
#include <cmath>
using namespace std;

extern "C" {

// Fonction utilitaire pour extraire la partie décimale * 100 (comme dans Dijkstra)
int getDecimalPart(double number) {
    if (number < 0) number = -number;
    double intPart;
    double fract = modf(number, &intPart);
    return static_cast<int>(fract * 100);
}

EMSCRIPTEN_KEEPALIVE
int* bfs(int rows, int cols, int* grid, int startRow, int startCol, int endRow, int endCol) {
    auto start_time = chrono::high_resolution_clock::now();

    int startIdx = startRow * cols + startCol;
    int endIdx   = endRow * cols + endCol;

    vector<bool> visited(rows * cols, false);
    vector<int> parent(rows * cols, -1);
    queue<int> q;

    visited[startIdx] = true;
    q.push(startIdx);
    vector<int> visitedOrder;
    visitedOrder.push_back(startIdx);

    bool found = false;

    // Directions : haut, bas, gauche, droite
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};

    while (!q.empty()) {
        int u = q.front(); q.pop();
        int r = u / cols;
        int c = u % cols;

        if (u == endIdx) {
            found = true;
            break;
        }

        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                int v = nr * cols + nc;
                if (!visited[v] && grid[v] == 0) { // 0 = libre
                    visited[v] = true;
                    parent[v] = u;
                    q.push(v);
                    visitedOrder.push_back(v);
                }
            }
        }
    }

    auto end_time = chrono::high_resolution_clock::now();
    chrono::duration<double, milli> duration_ms = end_time - start_time;
    double execTime = duration_ms.count();
    int time_int = static_cast<int>(execTime);
    int time_dec = getDecimalPart(execTime);

    // Reconstruction du chemin
    vector<int> path;
    if (found) {
        for (int v = endIdx; v != -1; v = parent[v]) {
            path.push_back(v);
        }
        reverse(path.begin(), path.end());
    }

    int pathSize = path.size();
    int visitedSize = visitedOrder.size();

    // Allocation du buffer de résultat
    int* buffer = (int*)malloc((pathSize + visitedSize + 4) * sizeof(int));
    if (!buffer) return nullptr;

    buffer[0] = pathSize;
    buffer[1] = visitedSize;
    buffer[2] = time_int;
    buffer[3] = time_dec;

    for (int i = 0; i < pathSize; i++) {
        buffer[4 + i] = path[i];
    }
    for (int i = 0; i < visitedSize; i++) {
        buffer[4 + pathSize + i] = visitedOrder[i];
    }

    return buffer;
}

} // extern "C"
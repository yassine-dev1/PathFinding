#include <cstdlib>
#include <emscripten.h>
#include "DijkstraSolver.h" 
#include <chrono>
#include <iostream>
#include <iomanip>

using namespace std;

extern "C" {

/**
 * @brief Utility to extract the two-digit decimal part of a duration.
 * Used for memory-efficient transmission of float values through an int* buffer.
 */
int ReteiveDecimalPart(float nombre) {
    if (nombre < 0) nombre = -nombre;
    float partieDecimale = nombre - (int)nombre;
    return (int)(partieDecimale * 100);
}

/**
 * @brief Exposes the Dijkstra solver to JavaScript via Emscripten.
 * * The buffer serialization format is:
 * [0]: Path size | [1]: Visited nodes count | [2]: Time (ms) | [3]: Time decimal part |
 * [4...size+3]: Path indices | [size+4...end]: Visited nodes indices
 * * @param n Grid dimension.
 * @param matrix Adjacency matrix pointer.
 * @param start Start node ID.
 * @param end Target node ID.
 * @return int* A pointer to the allocated memory buffer containing results.
 */
EMSCRIPTEN_KEEPALIVE
int* dijkstra(int n, int* matrix, int start, int end) {
    DijkstraSolver solver(n, matrix);
    
    // Performance timing: high_resolution_clock provides sub-millisecond precision
    auto start_time = chrono::high_resolution_clock::now();
    PathResult result = solver.solve(start, end);
    auto end_time = chrono::high_resolution_clock::now();

    chrono::duration<double, std::milli> duration_ms = end_time - start_time;
    double convertDuration = duration_ms.count();

    int sizePath = result.path.size();
    int sizeVisitedNodes = result.visitedNodes.size();

    // Allocate buffer: metadata(4) + path + visited_nodes
    int* buffer = (int*)malloc((sizePath + sizeVisitedNodes + 4) * sizeof(int));
    
    if (buffer == nullptr) return nullptr;

    // Serialize metadata
    buffer[0] = sizePath;
    buffer[1] = sizeVisitedNodes;
    buffer[2] = (int)convertDuration;
    buffer[3] = ReteiveDecimalPart((float)convertDuration);

    // Serialize path data
    for (int i = 0; i < sizePath; i++) {
        buffer[i + 4] = result.path[i];
    }
 
    // Serialize visited nodes data
    int indexVisited = sizePath + 4;
    for(int i = 0; i < sizeVisitedNodes; i++) {
        buffer[i + indexVisited] = result.visitedNodes[i];
    }
        
    return buffer;
}

}
#include "../headers/AstarSolver.h"
#include <queue>
#include <cmath>
#include <unordered_map>
#include <algorithm>

/**
 * @brief Constructs the A* solver instance.
 * @param start Starting node ID.
 * @param target Target node ID.
 * @param cols Grid width.
 * @param rows Grid height.
 * @param matrix Pointer to the flat grid representation (1D array).
 */
AstarSolver::AstarSolver(int start, int target, int cols, int rows, int* matrix) 
    : _start(start), _target(target), _Cols(cols), _Rows(rows), _matrix(matrix) {}

/**
 * @brief Maps 2D grid coordinates to a 1D linear matrix index.
 */
int AstarSolver::findIndexPosition(int row, int col) const {
    return (row * _Cols) + col;
}

/**
 * @brief Executes the A* pathfinding algorithm.
 * Implements the core "Evaluate - Extract - Explore" cycle to find the shortest path.
 * @return PathResult containing the sequence of nodes and exploration order.
 */
PathResult AstarSolver::solve() const {
    PathResult result;
    
    // Min-Heap priority queue to always expand the node with the lowest fScore (f = g + h)
    priority_queue<Node, vector<Node>, std::greater<Node>> openSet;
    
    // Map to track the optimal predecessor for path reconstruction
    unordered_map<int, int> cameFrom;
    
    // Map to track the shortest cost (g) from the start to each node
    unordered_map<int, int> gScore;
    
    Node start(_start, 0);
    openSet.push(start);
    gScore[_start] = 0;
    
    while (!openSet.empty()) {
        Node current = openSet.top();
        openSet.pop();
        
        // Track node in exploration order
        result.visitedNodes.push_back(current.getIdNode());
        
        // Target found: exit the loop
        if (current.getIdNode() == _target) break;
        
        // Cardinal direction vectors: Up, Down, Right, Left
        int dx[] = {0, 0, 1, -1};
        int dy[] = {1, -1, 0, 0};
        
        for (int i = 0; i < 4; ++i) {
            // Calculate neighbor coordinates
            int neighborCol = (current.getIdNode() % _Cols) + dx[i];
            int neighborRow = (current.getIdNode() / _Cols) + dy[i];
            
            // Validate boundaries
            if (neighborCol >= 0 && neighborCol < _Cols && neighborRow >= 0 && neighborRow < _Rows) {
                int neighborId = findIndexPosition(neighborRow, neighborCol);
                
                // Skip obstacles (assuming 0 represents a wall/blocked node)
                if (_matrix[neighborId] == 0) continue; 
                
                // Tentative gScore: distance from start to neighbor through current
                int tentative_gScore = gScore[current.getIdNode()] + 1;
                
                // Path relaxation: update if neighbor is unvisited or a shorter path is found
                if (gScore.find(neighborId) == gScore.end() || tentative_gScore < gScore[neighborId]) {
                    cameFrom[neighborId] = current.getIdNode();
                    gScore[neighborId] = tentative_gScore;
                    
                    Node neighbor(neighborId, 0);
                    // fScore = g(cost) + h(heuristic distance)
                    int fScore = tentative_gScore + neighbor.calculerHeuristic(_target, _Cols);
                    neighbor.setScore(fScore);
                    openSet.push(neighbor);
                }
            }
        }
    }
    
    // Path reconstruction: backtrack from target to start
    int curr = _target;
    while (curr != _start && cameFrom.count(curr)) {
        result.path.push_back(curr);
        curr = cameFrom[curr];
    }
    result.path.push_back(_start);

    // Finalize path: reverse order from start to target
    reverse(result.path.begin(), result.path.end());
    
    return result;
}
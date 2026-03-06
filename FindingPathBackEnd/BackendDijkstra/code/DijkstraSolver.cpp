#include "headers/DijkstraSolver.h"
#include <queue>
#include <algorithm>
#include <functional>
#include <vector>

using namespace std;

/**
 * @brief Constructs the Dijkstra solver instance.
 * @param n Number of vertices in the graph.
 * @param matrix Adjacency matrix representing edge weights (0  implies no edge).
 */
DijkstraSolver::DijkstraSolver(int n, int* matrix)
    : n(n), matrix(matrix) {}

/**
 * @brief Reconstructs the shortest path from the predecessor array.
 * @param prev The array mapping each node to its optimal predecessor.
 * @param end The target node.
 * @return A PathResult containing the sequence of nodes from start to target.
 */
PathResult DijkstraSolver::buildPath(const vector<Node>& prev, Node end) {
    PathResult result;
    // Backtrack from target to start using the predecessor map
    for (Node at = end; at != -1; at = prev[at]) {
        result.path.push_back(at);
    }
    // Reverse to get the path in correct chronological order
    reverse(result.path.begin(), result.path.end());
    return result;
}

/**
 * @brief Executes Dijkstra's algorithm to find the shortest path in a weighted graph.
 * This implementation uses a Min-Heap priority queue for O(E log V) efficiency.
 * @param start The starting node index.
 * @param end The target node index.
 * @return PathResult containing both the shortest path and the order of node exploration.
 */
PathResult DijkstraSolver::solve(Node start, Node end) {
    vector<Weight> dist(n, INF);
    vector<Node> prev(n, -1);
    vector<Node> visitedOrder;

    // Min-Priority queue storing {distance, node_index}
    using State = pair<Weight, Node>;
    priority_queue<State, vector<State>, greater<State>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto top = pq.top();
        Weight d = top.first;
        Node u = top.second;
        pq.pop();

        // Skip if a shorter path to 'u' was already processed
        if (d > dist[u]) continue;
        
        visitedOrder.push_back(u);

        // Early exit: target reached
        if (u == end) break; 

        // Relaxation step: evaluate all neighbors of the current node
        for (Node v = 0; v < n; v++) {
            Weight w = matrix[u * n + v];
            // Ignore non-existent edges (w <= 0)
            if (w <= 0) continue;

            // If a shorter path to 'v' is discovered, update and push to priority queue
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    // Assemble results
    PathResult result = buildPath(prev, end);
    result.visitedNodes = visitedOrder; 
    return result;
}
#include "../headers/Node.h"
#include <cmath>

/**
 * @brief Constructs a new Node object.
 * @param id The unique identifier of the node within the grid.
 * @param score The total estimated cost (f = g + h) for this node.
 */
Node::Node(int id, int score) : _idNode(id), _score(score) {}

/**
 * @brief Overloads the '>' operator for priority queue management.
 * Enables the std::priority_queue to function as a Min-Heap, 
 * ensuring nodes with the lowest score are prioritized for exploration.
 */
bool Node::operator>(const Node& other) const {
    return this->_score > other._score;
}

/**
 * @brief Compares two nodes for equality based on their unique identifiers.
 * Essential for lookups within associative containers such as std::unordered_map.
 */
bool Node::operator==(const Node& other) const {
    return this->_idNode == other._idNode;
}

/**
 * @brief Calculates the Manhattan distance to a target node.
 * This heuristic is optimal for grid-based pathfinding where movement 
 * is restricted to four cardinal directions (up, down, left, right).
 * * @param idNoeud2 The unique identifier of the target node.
 * @param numCols The number of columns in the grid, used to map 1D IDs to 2D coordinates.
 * @return The calculated heuristic distance (h).
 */
int Node::calculerHeuristic(int idNoeud2, int numCols) const {
    // Convert 1D grid index to 2D cartesian coordinates (x, y)
    int x1 = this->_idNode / numCols;
    int y1 = this->_idNode % numCols;
    int x2 = idNoeud2 / numCols;
    int y2 = idNoeud2 % numCols;
    
    // Manhattan distance: |x1 - x2| + |y1 - y2|
    return std::abs(x1 - x2) + std::abs(y1 - y2);
}
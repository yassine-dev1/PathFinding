#ifndef DIJKSTRA_SOLVER_H
#define DIJKSTRA_SOLVER_H

#include <vector> 
#include <limits> 
using namespace std ;


// specification
using Node      = int ;
using Weight    = int ;
constexpr Weight INF = numeric_limits<int>::max();

struct PathResult {
    std::vector<Node> path;
    std::vector<Node> visitedNodes;  // L'ordre d'exploration
};

class DijkstraSolver
{
    private :
        int n ;
        int *matrix ;

        PathResult buildPath(
            const std::vector<Node>& prev,
            Node end
        );

public:
    DijkstraSolver(int n, int* matrix);

    PathResult solve(Node start, Node end);
};

#endif
#ifndef ASTAR_SOLVER_H
#define ASTAR_SOLVER_H

#include "Node.h"
#include <vector>
using namespace std ;
using NodeId = int ;

struct PathResult {
    std::vector<NodeId> path;
    std::vector<NodeId> visitedNodes;  // L'ordre d'exploration
};

// Hash pour unordered_map basé uniquement sur l'ID
struct NodeHash {
    size_t operator()(const Node& n) const {
        return hash<int>()(n.getIdNode());
    }
};

class AstarSolver 
{
    private :
       int *_matrix ;
       int _start ;
       int _target ;
       int _Cols ;
       int _Rows ;
       
    //    int calculerSizeMatrix() const;
       int findIndexPosition(int x , int y) const ;

    public :

    AstarSolver (int , int , int , int ,  int*) ;
    PathResult solve() const ; 
};

#endif


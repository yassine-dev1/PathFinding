#ifndef NODE_H
#define NODE_H

#include <cmath> // Pour abs()

class Node {
private:
    int _idNode;
    int _score;

public:
    // Ajouter des valeurs par défaut ici
    Node(int id = 0, int score = 0); 
    
    // Les opérateurs de comparaison
    bool operator>(const Node& other) const;
    bool operator==(const Node& other) const;
    
    // Calcul de distance de Manhattan
    int calculerHeuristic(int idNoeud2, int numCols) const;
    
    // Getters / Setters (const pour les getters)
    int getIdNode() const { return _idNode; }
    int getScore() const { return _score; }
    void setScore(int newScore) { _score = newScore; }
};

#endif
#ifndef PATHFINDING_SERVER_H
#define PATHFINDING_SERVER_H

#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <stack>
#include <chrono>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
// Déplacer le pragma dans le .cpp pour MinGW
#ifndef __MINGW32__
#pragma comment(lib, "ws2_32.lib")
#endif
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <arpa/inet.h>
#endif

// Structure pour les résultats de pathfinding
struct PathfindingResult {
    std::vector<std::pair<int, int>> visitedNodes;
    std::vector<std::pair<int, int>> shortestPath;
    int visitedCount;
    int pathLength;
    double executionTime;
    bool pathFound;
};

// Structure pour les nœuds BFS
struct BFSNode {
    int row;
    int col;
    int distance;
    BFSNode* parent;
    
    BFSNode(int r, int c, int d, BFSNode* p = nullptr) 
        : row(r), col(c), distance(d), parent(p) {}
};

class PathfindingServer {
private:
#ifdef _WIN32
    SOCKET serverSocket;
    SOCKET clientSocket;
    WSADATA wsaData;
#else
    int serverSocket;
    int clientSocket;
#endif
    
    int port;
    
    // Méthodes privées
    std::vector<std::vector<int>> generateMaze(int rows, int cols, 
                                               int startRow, int startCol,
                                               int endRow, int endCol);
    
    PathfindingResult bfsSearch(const std::vector<std::vector<int>>& grid,
                                int startRow, int startCol,
                                int endRow, int endCol);
    
    bool extractIntFromJson(const std::string& json, const std::string& key, int& value);
    
    bool extractStartEnd(const std::string& json, const std::string& key, int& row, int& col);
    
    std::string handleMazeRequest(const std::string& requestBody);
    
    std::string handleVisualizeRequest(const std::string& requestBody);
    
    void parseHttpRequest(const std::string& request, 
                          std::string& method, 
                          std::string& path,
                          std::string& body);
    
    void sendHttpResponse(int clientSocket, const std::string& content, 
                         const std::string& contentType = "application/json",
                         int statusCode = 200);
    
public:
    static const int ROWS = 15;
    static const int COLS = 30;
    static const int START_ROW = 7;
    static const int START_COL = 5;
    static const int END_ROW = 7;
    static const int END_COL = 25;
    
    PathfindingServer(int port = 8080);
    ~PathfindingServer();
    
    bool initialize();
    void start();
};

#endif // PATHFINDING_SERVER_H
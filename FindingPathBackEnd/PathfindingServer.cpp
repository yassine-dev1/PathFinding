#include "PathfindingServer.h"
#include <cstdlib>
#include <ctime>
#include <sstream>
#include <algorithm>
#include <cassert>
#include <iterator>

// Pour MinGW sous Windows
#ifdef _WIN32
#ifdef __MINGW32__
// Lien explicite pour MinGW
#pragma comment(lib, "ws2_32")
#endif
#endif

// Définir les constantes statiques
const int PathfindingServer::ROWS;
const int PathfindingServer::COLS;
const int PathfindingServer::START_ROW;
const int PathfindingServer::START_COL;
const int PathfindingServer::END_ROW;
const int PathfindingServer::END_COL;

// Constructeur
PathfindingServer::PathfindingServer(int port) : port(port) {
#ifdef _WIN32
    serverSocket = INVALID_SOCKET;
    clientSocket = INVALID_SOCKET;
#else
    serverSocket = -1;
    clientSocket = -1;
#endif
}

// Destructeur
PathfindingServer::~PathfindingServer() {
#ifdef _WIN32
    if (serverSocket != INVALID_SOCKET) {
        closesocket(serverSocket);
    }
    WSACleanup();
#else
    if (serverSocket >= 0) {
        close(serverSocket);
    }
#endif
    std::cout << "Server shutdown complete" << std::endl;
}

// Générer un labyrinthe
std::vector<std::vector<int>> PathfindingServer::generateMaze(int rows, int cols, 
                                                              int startRow, int startCol,
                                                              int endRow, int endCol) {
    // Limiter les dimensions
    rows = std::max(5, std::min(rows, 50));
    cols = std::max(5, std::min(cols, 50));
    
    std::vector<std::vector<int>> maze(rows, std::vector<int>(cols, 0));
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
    
    // Pourcentage de murs : 20-30%
    int wallPercentage = 20 + (std::rand() % 11);
    
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            // Ne pas mettre de mur sur start ou end
            if ((i == startRow && j == startCol) || 
                (i == endRow && j == endCol)) {
                maze[i][j] = 0;
                continue;
            }
            
            // Ajouter des murs sur les bords
            if (i == 0 || i == rows-1 || j == 0 || j == cols-1) {
                maze[i][j] = 1; // Murs sur les bords
                continue;
            }
            
            // Éviter les murs trop près du départ/arrivée
            int distToStart = abs(i - startRow) + abs(j - startCol);
            int distToEnd = abs(i - endRow) + abs(j - endCol);
            
            if (distToStart <= 2 || distToEnd <= 2) {
                maze[i][j] = 0; // Zone libre autour du départ/arrivée
                continue;
            }
            
            // Chance d'avoir un mur
            if (std::rand() % 100 < wallPercentage) {
                maze[i][j] = 1;
            }
        }
    }
    
    // Assurer que start et end sont accessibles
    maze[startRow][startCol] = 0;
    maze[endRow][endCol] = 0;
    
    // S'assurer qu'il y a au moins un chemin (simplifié)
    if (startRow > 0) maze[startRow-1][startCol] = 0;
    if (startRow < rows-1) maze[startRow+1][startCol] = 0;
    if (startCol > 0) maze[startRow][startCol-1] = 0;
    if (startCol < cols-1) maze[startRow][startCol+1] = 0;
    
    if (endRow > 0) maze[endRow-1][endCol] = 0;
    if (endRow < rows-1) maze[endRow+1][endCol] = 0;
    if (endCol > 0) maze[endRow][endCol-1] = 0;
    if (endCol < cols-1) maze[endRow][endCol+1] = 0;
    
    return maze;
}

// Algorithme BFS
PathfindingResult PathfindingServer::bfsSearch(const std::vector<std::vector<int>>& grid,
                                               int startRow, int startCol,
                                               int endRow, int endCol) {
    PathfindingResult result;
    result.pathFound = false;
    result.visitedCount = 0;
    result.pathLength = 0;
    
    auto startTime = std::chrono::high_resolution_clock::now();
    
    int rows = static_cast<int>(grid.size());
    if (rows == 0) {
        result.executionTime = 0;
        return result;
    }
    
    int cols = static_cast<int>(grid[0].size());
    
    // Vérifier les limites
    if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols ||
        endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) {
        result.executionTime = 0;
        return result;
    }
    
    // Vérifier si start ou end sont sur un mur
    if (grid[startRow][startCol] == 1 || grid[endRow][endCol] == 1) {
        result.executionTime = 0;
        return result;
    }
    
    // Matrice pour suivre les nœuds visités
    std::vector<std::vector<bool>> visited(rows, std::vector<bool>(cols, false));
    // Matrice pour stocker les parents (pour reconstruire le chemin)
    std::vector<std::vector<BFSNode*>> parent(rows, std::vector<BFSNode*>(cols, nullptr));
    
    // File pour BFS (utilise une queue standard)
    std::queue<BFSNode*> bfsQueue;
    
    // Démarrer avec le nœud de départ
    BFSNode* startNode = new BFSNode(startRow, startCol, 0);
    bfsQueue.push(startNode);
    visited[startRow][startCol] = true;
    result.visitedNodes.push_back(std::make_pair(startRow, startCol));
    result.visitedCount++;
    
    // Directions : haut, droite, bas, gauche
    int dr[] = {-1, 0, 1, 0};
    int dc[] = {0, 1, 0, -1};
    
    BFSNode* endNode = nullptr;
    
    while (!bfsQueue.empty()) {
        BFSNode* current = bfsQueue.front();
        bfsQueue.pop();
        
        // Si on a atteint la destination
        if (current->row == endRow && current->col == endCol) {
            endNode = current;
            result.pathFound = true;
            break;
        }
        
        // Explorer les voisins
        for (int i = 0; i < 4; i++) {
            int newRow = current->row + dr[i];
            int newCol = current->col + dc[i];
            
            // Vérifier les limites et les murs
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
                !visited[newRow][newCol] && grid[newRow][newCol] == 0) {
                
                visited[newRow][newCol] = true;
                BFSNode* neighbor = new BFSNode(newRow, newCol, current->distance + 1, current);
                bfsQueue.push(neighbor);
                parent[newRow][newCol] = current;
                
                result.visitedNodes.push_back(std::make_pair(newRow, newCol));
                result.visitedCount++;
            }
        }
    }
    
    auto endTime = std::chrono::high_resolution_clock::now();
    result.executionTime = std::chrono::duration<double, std::milli>(endTime - startTime).count();
    
    // Reconstruire le chemin si trouvé
    if (result.pathFound && endNode) {
        std::stack<std::pair<int, int>> pathStack;
        BFSNode* current = endNode;
        
        while (current != nullptr) {
            pathStack.push(std::make_pair(current->row, current->col));
            current = current->parent;
        }
        
        while (!pathStack.empty()) {
            result.shortestPath.push_back(pathStack.top());
            pathStack.pop();
        }
        
        result.pathLength = static_cast<int>(result.shortestPath.size()) - 1; // Exclure le nœud de départ
        
        // Nettoyer la mémoire
        while (!bfsQueue.empty()) {
            delete bfsQueue.front();
            bfsQueue.pop();
        }
        
        // Nettoyer les nœuds restants
        delete startNode;
        if (endNode != startNode) {
            delete endNode;
        }
    } else {
        // Nettoyer la mémoire
        while (!bfsQueue.empty()) {
            delete bfsQueue.front();
            bfsQueue.pop();
        }
        delete startNode;
    }
    
    return result;
}

// Fonction utilitaire pour extraire une valeur du JSON
int extractJsonValue(const std::string& json, const std::string& key, int defaultValue = 0) {
    std::string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == std::string::npos) return defaultValue;
    
    pos += searchKey.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == ':')) pos++;
    
    size_t end = pos;
    while (end < json.length() && json[end] != ',' && json[end] != '}') end++;
    
    try {
        return std::stoi(json.substr(pos, end - pos));
    } catch (...) {
        return defaultValue;
    }
}

// Extraire un objet {row:X, col:Y}
bool extractPosition(const std::string& json, const std::string& key, int& row, int& col) {
    std::string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == std::string::npos) return false;
    
    // Trouver l'objet {row:X, col:Y}
    pos = json.find('{', pos);
    if (pos == std::string::npos) return false;
    
    size_t end = json.find('}', pos);
    if (end == std::string::npos) return false;
    
    std::string obj = json.substr(pos, end - pos + 1);
    
    row = extractJsonValue(obj, "row", 0);
    col = extractJsonValue(obj, "col", 0);
    
    return true;
}

// Traiter une requête de labyrinthe
std::string PathfindingServer::handleMazeRequest(const std::string& requestBody) {
    std::cout << "\n=== Handling maze request ===" << std::endl;
    
    int rows = extractJsonValue(requestBody, "rows", ROWS);
    int cols = extractJsonValue(requestBody, "cols", COLS);
    int startRow, startCol, endRow, endCol;
    
    // Extraire positions
    if (!extractPosition(requestBody, "start", startRow, startCol)) {
        startRow = START_ROW;
        startCol = START_COL;
    }
    
    if (!extractPosition(requestBody, "end", endRow, endCol)) {
        endRow = END_ROW;
        endCol = END_COL;
    }
    
    // Valider
    rows = std::max(5, std::min(rows, 50));
    cols = std::max(5, std::min(cols, 50));
    startRow = std::max(0, std::min(startRow, rows - 1));
    startCol = std::max(0, std::min(startCol, cols - 1));
    endRow = std::max(0, std::min(endRow, rows - 1));
    endCol = std::max(0, std::min(endCol, cols - 1));
    
    std::cout << "Generating maze " << rows << "x" << cols 
              << " start:(" << startRow << "," << startCol 
              << ") end:(" << endRow << "," << endCol << ")" << std::endl;
    
    auto maze = generateMaze(rows, cols, startRow, startCol, endRow, endCol);
    
    // Construire réponse
    std::ostringstream response;
    response << "{\"success\":true,\"message\":\"Maze generated by C++ backend\",\"grid\":[";
    
    for (size_t i = 0; i < maze.size(); i++) {
        response << "[";
        for (size_t j = 0; j < maze[i].size(); j++) {
            response << maze[i][j];
            if (j < maze[i].size() - 1) response << ",";
        }
        response << "]";
        if (i < maze.size() - 1) response << ",";
    }
    response << "],\"start\":{\"row\":" << startRow << ",\"col\":" << startCol 
             << "},\"end\":{\"row\":" << endRow << ",\"col\":" << endCol << "}}";
    
    return response.str();
}

// Parser la grille du JSON - VERSION SIMPLIFIÉE
std::vector<std::vector<int>> parseGridFromJson(const std::string& json, int rows, int cols) {
    std::vector<std::vector<int>> grid(rows, std::vector<int>(cols, 0));
    
    // Trouver le tableau grid
    size_t gridStart = json.find("\"grid\":[");
    if (gridStart == std::string::npos) {
        return grid; // Retourner grille vide
    }
    
    gridStart += 8; // Passer "\"grid\":["
    
    for (int i = 0; i < rows; i++) {
        // Trouver le début de la ligne
        size_t lineStart = json.find('[', gridStart);
        if (lineStart == std::string::npos) break;
        
        lineStart++; // Passer '['
        
        for (int j = 0; j < cols; j++) {
            // Trouver le nombre
            size_t numStart = lineStart;
            while (lineStart < json.length() && 
                   json[lineStart] != ',' && 
                   json[lineStart] != ']') {
                lineStart++;
            }
            
            if (numStart < lineStart) {
                std::string numStr = json.substr(numStart, lineStart - numStart);
                // Nettoyer
                numStr.erase(std::remove_if(numStr.begin(), numStr.end(), 
                             [](char c) { return !isdigit(c) && c != '-'; }), numStr.end());
                if (!numStr.empty()) {
                    try {
                        grid[i][j] = std::stoi(numStr);
                    } catch (...) {
                        grid[i][j] = 0;
                    }
                }
            }
            
            // Passer la virgule
            if (lineStart < json.length() && json[lineStart] == ',') {
                lineStart++;
            }
        }
        
        // Trouver la prochaine ligne
        gridStart = json.find(']', lineStart);
        if (gridStart == std::string::npos) break;
        gridStart++; // Passer ']'
        
        // Passer la virgule entre les lignes
        if (gridStart < json.length() && json[gridStart] == ',') {
            gridStart++;
        }
    }
    
    return grid;
}

// Traiter une requête de visualisation - VERSION SIMPLE ET FONCTIONNELLE
std::string PathfindingServer::handleVisualizeRequest(const std::string& requestBody) {
    std::cout << "\n=== Handling visualize request ===" << std::endl;
    
    // DEBUG: Afficher le JSON reçu
    std::cout << "JSON received (first 300 chars): " 
              << requestBody.substr(0, std::min(requestBody.length(), size_t(300))) 
              << std::endl;
    
    // Extraire les valeurs de base
    int rows = extractJsonValue(requestBody, "rows", ROWS);
    int cols = extractJsonValue(requestBody, "cols", COLS);
    
    std::cout << "Rows: " << rows << ", Cols: " << cols << std::endl;
    
    // Extraire les positions
    int startRow, startCol, endRow, endCol;
    if (!extractPosition(requestBody, "start", startRow, startCol)) {
        std::cerr << "ERROR: Could not extract start position" << std::endl;
        return "{\"success\":false,\"error\":\"Could not extract start position\"}";
    }
    
    if (!extractPosition(requestBody, "end", endRow, endCol)) {
        std::cerr << "ERROR: Could not extract end position" << std::endl;
        return "{\"success\":false,\"error\":\"Could not extract end position\"}";
    }
    
    std::cout << "Start: (" << startRow << "," << startCol << ")" << std::endl;
    std::cout << "End: (" << endRow << "," << endCol << ")" << std::endl;
    
    // Parser la grille
    std::vector<std::vector<int>> grid = parseGridFromJson(requestBody, rows, cols);
    
    std::cout << "Grid parsed. Size: " << grid.size() << "x" 
              << (grid.empty() ? 0 : grid[0].size()) << std::endl;
    
    // Afficher un aperçu de la grille
    std::cout << "Grid preview (first 3x3):" << std::endl;
    for (int i = 0; i < std::min(3, rows); i++) {
        for (int j = 0; j < std::min(3, cols); j++) {
            std::cout << grid[i][j] << " ";
        }
        std::cout << std::endl;
    }
    
    // Exécuter BFS
    PathfindingResult result = bfsSearch(grid, startRow, startCol, endRow, endCol);
    
    std::cout << "\nBFS result:" << std::endl;
    std::cout << "Path found: " << (result.pathFound ? "YES" : "NO") << std::endl;
    std::cout << "Visited nodes: " << result.visitedCount << std::endl;
    std::cout << "Path length: " << result.pathLength << std::endl;
    std::cout << "Execution time: " << result.executionTime << " ms" << std::endl;
    
    // Construire la réponse
    std::ostringstream response;
    response << "{\"success\":true,\"algorithm\":\"bfs\",";
    response << "\"pathFound\":" << (result.pathFound ? "true" : "false") << ",";
    response << "\"visitedCount\":" << result.visitedCount << ",";
    response << "\"pathLength\":" << result.pathLength << ",";
    response << "\"executionTime\":" << result.executionTime << ",";
    
    // Nœuds visités
    response << "\"visitedNodes\":[";
    for (size_t i = 0; i < result.visitedNodes.size(); i++) {
        response << "[" << result.visitedNodes[i].first << "," << result.visitedNodes[i].second << "]";
        if (i < result.visitedNodes.size() - 1) response << ",";
    }
    response << "],";
    
    // Chemin le plus court
    response << "\"shortestPath\":[";
    for (size_t i = 0; i < result.shortestPath.size(); i++) {
        response << "[" << result.shortestPath[i].first << "," << result.shortestPath[i].second << "]";
        if (i < result.shortestPath.size() - 1) response << ",";
    }
    response << "]}";
    
    std::cout << "\nResponse sent successfully" << std::endl;
    
    return response.str();
}

// Parser une requête HTTP
void PathfindingServer::parseHttpRequest(const std::string& request, 
                                         std::string& method, 
                                         std::string& path,
                                         std::string& body) {
    std::istringstream requestStream(request);
    std::string line;
    
    // Lire la première ligne
    if (std::getline(requestStream, line)) {
        std::istringstream lineStream(line);
        lineStream >> method >> path;
    }
    
    int contentLength = 0;
    body.clear();
    
    while (std::getline(requestStream, line)) {
        // Nettoyer le \r
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }
        
        if (line.find("Content-Length:") == 0) {
            try {
                contentLength = std::stoi(line.substr(15));
            } catch (...) {
                contentLength = 0;
            }
        }
        
        if (line.empty()) {
            // Lire le body
            if (contentLength > 0) {
                std::vector<char> buffer(contentLength + 1);
                requestStream.read(buffer.data(), contentLength);
                buffer[contentLength] = '\0';
                body = buffer.data();
            }
            break;
        }
    }
}

// Envoyer une réponse HTTP
void PathfindingServer::sendHttpResponse(int clientSocket, const std::string& content, 
                                        const std::string& contentType,
                                        int statusCode) {
    std::string statusText;
    switch (statusCode) {
        case 200: statusText = "OK"; break;
        case 400: statusText = "Bad Request"; break;
        case 404: statusText = "Not Found"; break;
        case 500: statusText = "Internal Server Error"; break;
        default: statusText = " ok";
    }
    
    std::string response = 
        "HTTP/1.1 " + std::to_string(statusCode) + " " + statusText + "\r\n" +
        "Content-Type: " + contentType + "\r\n" +
        "Access-Control-Allow-Origin: *\r\n" +
        "Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE\r\n" +
        "Access-Control-Allow-Headers: Content-Type, Authorization\r\n" +
        "Access-Control-Max-Age: 86400\r\n" +
        "Content-Length: " + std::to_string(content.length()) + "\r\n" +
        "Connection: close\r\n" +
        "\r\n" + 
        content;
    
#ifdef _WIN32
    send(clientSocket, response.c_str(), static_cast<int>(response.length()), 0);
#else
    send(clientSocket, response.c_str(), response.length(), 0);
#endif
}

// Initialiser le serveur
bool PathfindingServer::initialize() {
#ifdef _WIN32
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed" << std::endl;
        return false;
    }
#endif
    
#ifdef _WIN32
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        std::cerr << "Socket creation failed" << std::endl;
#ifdef _WIN32
        WSACleanup();
#endif
        return false;
    }
#else
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) {
        std::cerr << "Socket creation failed" << std::endl;
        return false;
    }
#endif
    
    // Configurer le socket pour réutiliser l'adresse
    int opt = 1;
#ifdef _WIN32
    if (setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, 
                  reinterpret_cast<char*>(&opt), sizeof(opt)) < 0) {
        std::cerr << "setsockopt failed" << std::endl;
        closesocket(serverSocket);
        WSACleanup();
        return false;
    }
#else
    if (setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        std::cerr << "setsockopt failed" << std::endl;
        close(serverSocket);
        return false;
    }
#endif
    
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);
    
    if (bind(serverSocket, reinterpret_cast<struct sockaddr*>(&address), sizeof(address)) < 0) {
        std::cerr << "Bind failed on port " << port << std::endl;
#ifdef _WIN32
        closesocket(serverSocket);
        WSACleanup();
#else
        close(serverSocket);
#endif
        return false;
    }
    
    if (listen(serverSocket, 10) < 0) {
        std::cerr << "Listen failed" << std::endl;
#ifdef _WIN32
        closesocket(serverSocket);
        WSACleanup();
#else
        close(serverSocket);
#endif
        return false;
    }
    
    std::cout << "========================================" << std::endl;
    std::cout << "  PATHFINDING SERVER v1.3 - C++" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Listening on port " << port << std::endl;
    std::cout << "BFS algorithm with maze support" << std::endl;
    std::cout << "Ready for React frontend connections" << std::endl;
    std::cout << "========================================" << std::endl;
    
    return true;
}

// Démarrer le serveur
void PathfindingServer::start() {
    struct sockaddr_in clientAddress;
#ifdef _WIN32
    int clientAddrLen = sizeof(clientAddress);
#else
    socklen_t clientAddrLen = sizeof(clientAddress);
#endif
    
    std::cout << "\nServer is running. Press Ctrl+C to stop." << std::endl;
    
    while (true) {
        std::cout << "\nWaiting for connection..." << std::endl;
        
#ifdef _WIN32
        clientSocket = accept(serverSocket, reinterpret_cast<struct sockaddr*>(&clientAddress), &clientAddrLen);
        if (clientSocket == INVALID_SOCKET) {
            std::cerr << " Accept failed" << std::endl;
            continue;
        }
#else
        clientSocket = accept(serverSocket, reinterpret_cast<struct sockaddr*>(&clientAddress), &clientAddrLen);
        if (clientSocket < 0) {
            std::cerr << " Accept failed" << std::endl;
            continue;
        }
#endif
        
        char clientIP[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &(clientAddress.sin_addr), clientIP, INET_ADDRSTRLEN);
        std::cout << " Client connected from: " << clientIP << std::endl;
        
        // Lire la requête
        std::vector<char> buffer(8192);
#ifdef _WIN32
        int bytesRead = recv(clientSocket, buffer.data(), static_cast<int>(buffer.size() - 1), 0);
#else
        int bytesRead = read(clientSocket, buffer.data(), buffer.size() - 1);
#endif
        
        if (bytesRead > 0) {
            buffer[bytesRead] = '\0';
            std::string request(buffer.data(), bytesRead);
            
            std::cout << " Request received (" << bytesRead << " bytes)" << std::endl;
            
            // Parser la requête
            std::string method, path, body;
            parseHttpRequest(request, method, path, body);
            
            std::cout << " Parsed: " << method << " " << path << std::endl;
            
            // Gérer CORS preflight
            if (method == "OPTIONS") {
                std::cout << " Handling CORS preflight request" << std::endl;
                sendHttpResponse(clientSocket, "");
            }
            // Routes principales
            else if (path == "/" && method == "GET") {
                std::string welcome = " Pathfinding Server v1.3\n"
                                    "Endpoints:\n"
                                    "- GET  /           - Server status\n"
                                    "- POST /api/maze   - Generate maze (black = walls)\n"
                                    "- POST /api/visualize - Run BFS algorithm\n"
                                    "\nAlgorithms:\n"
                                    "- BFS (Breadth-First Search) - Implemented\n"
                                    "- Finds path avoiding black walls\n"
                                    "- 0 = empty, 1 = wall";
                sendHttpResponse(clientSocket, welcome, "text/plain", 200);
            }
            else if (path == "/api/maze" && method == "POST") {
                std::cout << " Generating maze..." << std::endl;
                try {
                    std::string mazeResponse = handleMazeRequest(body);
                    sendHttpResponse(clientSocket, mazeResponse);
                    std::cout << " Maze with black walls sent to client" << std::endl;
                } catch (const std::exception& e) {
                    std::cerr << " Error generating maze: " << e.what() << std::endl;
                    std::string error = "{\"success\":false,\"error\":\"Internal server error: " + 
                                       std::string(e.what()) + "\"}";
                    sendHttpResponse(clientSocket, error, "application/json", 500);
                }
            }
            else if (path == "/api/visualize" && method == "POST") {
                std::cout << " Processing visualize request..." << std::endl;
                try {
                    std::string algoResponse = handleVisualizeRequest(body);
                    sendHttpResponse(clientSocket, algoResponse);
                    std::cout << " BFS algorithm result sent to client" << std::endl;
                } catch (const std::exception& e) {
                    std::cerr << " Error in algorithm: " << e.what() << std::endl;
                    std::string error = "{\"success\":false,\"error\":\"Algorithm error: " + 
                                       std::string(e.what()) + "\"}";
                    sendHttpResponse(clientSocket, error, "application/json", 500);
                }
            }
            else {
                std::string notFound = "{\"error\":\"Endpoint not found\",\"path\":\"" + path + "\"}";
                sendHttpResponse(clientSocket, notFound, "application/json", 404);
                std::cout << " Endpoint not found: " << path << std::endl;
            }
        } else if (bytesRead == 0) {
            std::cout << " Client disconnected" << std::endl;
        } else {
            std::cerr << " Error reading from client" << std::endl;
        }
        
        // Fermer la connexion
#ifdef _WIN32
        closesocket(clientSocket);
        clientSocket = INVALID_SOCKET;
#else
        close(clientSocket);
        clientSocket = -1;
#endif
        
        std::cout << " Connection closed" << std::endl;
    }
}
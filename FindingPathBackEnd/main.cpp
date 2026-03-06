#include "PathfindingServer.h"

int main() {
    std::cout << "=========================================" << std::endl;
    std::cout << "     PATHFINDING SERVER v1.1 - C++" << std::endl;
    std::cout << "=========================================" << std::endl;
    std::cout << "Maze generation with BFS algorithm" << std::endl;
    std::cout << "=========================================" << std::endl;
    
    PathfindingServer server(8080);
    
    if (server.initialize()) {
        std::cout << "\nServer initialized successfully!" << std::endl;
        std::cout << " Features:" << std::endl;
        std::cout << "   ✓ Maze generation" << std::endl << std::endl ;
        std::cout << "   ✓ BFS pathfinding algorithm" << std::endl;
        std::cout << "   ✓ Real-time visualization support" << std::endl;
        std::cout << "\n Access URLs:" << std::endl;
        std::cout << "   - Backend: http://localhost:8084" << std::endl;
        std::cout << "   - Frontend: http://localhost:3000" << std::endl;
        std::cout << "\n Waiting for React frontend to connect..." << std::endl;
        
        try {
            server.start();
        } catch (const std::exception& e) {
            std::cerr << "Server error: " << e.what() << std::endl;
            return 1;
        }
    } else {
        std::cerr << " Server initialization failed!" << std::endl;
        return 1;
    }
    
    return 0;
}
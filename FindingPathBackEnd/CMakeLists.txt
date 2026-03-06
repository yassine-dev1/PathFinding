cmake_minimum_required(VERSION 3.10)
project(PathfindingServer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Pour Windows, lier les bibliothèques nécessaires
if(WIN32)
    add_definitions(-D_WIN32_WINNT=0x0601)
endif()

add_executable(pathfinding_server
    main.cpp
    PathfindingServer.cpp
)

if(WIN32)
    target_link_libraries(pathfinding_server ws2_32)
endif()
# 🚀 Pathfinding Algorithm Visualizer

A **high-performance web application** for visualizing and comparing
classical pathfinding algorithms in real time.

The project combines **C++ for high-performance algorithm execution**
with **WebAssembly (WASM)** and a **React-based interface** to provide a
fast and interactive visualization directly in the browser.

Users can build grids, place obstacles, and observe how different
algorithms explore the graph to find the shortest path.

------------------------------------------------------------------------

# ✨ Features

-   🔍 **Real-time visualization** of pathfinding algorithms\
-   ⚡ **High performance** using C++ compiled to WebAssembly\
-   🧠 Implementation of multiple algorithms:
    -   **Dijkstra**
    -   **Breadth-First Search (BFS)**
    -   **A**\*
-   🎯 Interactive grid:
    -   Add/remove obstacles
    -   Set start and target nodes
-   📊 Compare algorithm behavior and efficiency

------------------------------------------------------------------------

# 🛠 Technical Architecture

## 1️⃣ Core Engine (C++)

The computational engine responsible for pathfinding algorithms.

Features: - Optimized implementations of **Dijkstra**, **BFS**, and
**A**\* - Efficient **Min-Heap priority queue** - Custom memory handling
for better performance - Designed for compilation to **WebAssembly**

## 2️⃣ WebAssembly Layer

The C++ code is compiled to **WebAssembly** using **Emscripten**.

Benefits: - Near-native execution speed - Direct interaction between
JavaScript and C++ - Efficient memory access through the WASM heap

## 3️⃣ Frontend (React)

A modern **React interface** allows users to interact with the grid and
visualize algorithm execution.

Main functionalities: - Dynamic grid generation - Obstacle placement -
Start/target node selection - Real-time algorithm visualization -
Performance comparison

------------------------------------------------------------------------

# 📁 Project Structure

    Pathfinding-Visualizer/
    │
    ├── FindingPathBackEnd/
    │   ├── algorithms
    │   ├── data_structures
    │   └── C++ source files
    │
    ├── FindingPathFontEnd/
    │   ├── public/
    │   │   └── wasm/            
    │   │       ├── AstartCompilationFiles  |___ __ AStart.js
    |   |       |                               |__ Astar.wasm
    |   |       |
    │   │       └── DijkstraCompilationFiles |___ __ dijkstra.js
    |   |                                        |__ dijkstra.wasm
    │   └── src/
    │       └── React components
    |       |__ App.js 
    │
    ├── emsdk/
    │   └── Emscripten SDK environment
    │
    └── README.md

------------------------------------------------------------------------

# ⚙️ Prerequisites

Before running the project, make sure the following tools are installed:

-   **Node.js**
-   **npm**
-   **Activate the Emscripten SDK (emsdk) environment to recompile C++ files if necessary**
-   **C++ compiler (included in emsdk)**

------------------------------------------------------------------------

# 🚀 Installation & Running

## 1️⃣ Clone the repository

``` bash
git clone https://github.com/yassine-dev1/PathFinding.git
cd PathFinding
```

## 2️⃣ Start the React Frontend

``` bash
cd FindingPathFontEnd
npm install
npm run start
```

The application will start at:

    http://localhost:3000

------------------------------------------------------------------------

# 🔧 Recompiling C++ to WebAssembly

If you modify the C++ algorithms, you must recompile them using
**Emscripten**.

``` bash
cd FindingPathBackEnd
```

Example compilation command for **A**\*:

``` bash
cd FindingPathBackEnd/AStart ;
emcc AstartLogique.cpp Node.cpp AstarSolver.cpp -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME="AStartModule" -s ENVIRONMENT=web -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_AStart','_malloc','_free']" -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','HEAP32']" -o ../FindingPathFontEnd/public/wasm/AstartCompilationFiles/AStart.js
```

The generated files will be placed in:

    FindingPathFontEnd/public/wasm/<Algorithm>CompilationFiles

------------------------------------------------------------------------

# 🧠 Implemented Algorithms

  ----------------------------------------------------------------------------
  Algorithm            Type              Recommended Usage
  -------------------- ----------------- -------------------------------------
  **Dijkstra**         Weighted graph    Best for graphs with varying edge
                       algorithm         weights

  **BFS**              Unweighted graph  Efficient for uniform grids
                       algorithm         

  **A**\*              Heuristic-based   Fastest for real-time pathfinding
                       algorithm         
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

# 📊 Why WebAssembly?

Using **WebAssembly** allows heavy algorithm computations to run at
near-native speed while keeping the flexibility of a **JavaScript
frontend**.

Advantages:

-   ⚡ Faster execution than pure JavaScript
-   🔗 Direct integration with React
-   🧠 Efficient memory management

------------------------------------------------------------------------

💡 **Educational Goal:**\
This project demonstrates how **C++, WebAssembly, and React** can work
together to build **high-performance web applications**.

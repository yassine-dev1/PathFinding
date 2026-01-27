import { useEffect, useState } from "react";
import { loadDijkstraWasm } from "./loadwasm";

export default function App() {
  const ROWS = 6;
  const COLS = 6;
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ".")
    )
  );
  const [path, setPath] = useState([]);


  const handleClick = (r, c) => {
    setGrid((prev) => {
      const copy = prev.map(row => [...row]);

      if (!start) {
        copy[r][c] = "S";
        setStart(r * COLS + c);
      } else if (!end) {
        copy[r][c] = "E";
        setEnd(r * COLS + c);
      } else {
        copy[r][c] = copy[r][c] === "#" ? "." : "#";
      }
      return copy;
    });
  };

  const gridToAdjMatrix = (grid) => {
    const rows = grid.length;
    const cols = grid[0].length;
    const n = rows * cols;

    const matrix = new Int32Array(n * n).fill(0);

    const index = (r, c) => r * cols + c;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === "#") continue;

        const from = index(r, c);

        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;

          if (
            nr >= 0 && nr < rows &&
            nc >= 0 && nc < cols &&
            grid[nr][nc] !== "#"
          ) {
            const to = index(nr, nc);
            matrix[from * n + to] = 1; // coût
          }
        }
      }
    }

    return matrix;
  };


  const runDijkstra = async () => {
    if (start === null || end === null) {
      alert("Choisis Start et End");
      return;
    }

    const mod = await loadDijkstraWasm();
    const dijkstra = mod.cwrap("dijkstra", "number", ["number", "number", "number", "number"]);

    const matrix = gridToAdjMatrix(grid);
    const n = ROWS * COLS;

    const matrixPtr = mod._malloc(matrix.length * 4);
    mod.HEAP32.set(matrix, matrixPtr / 4);

    const resultPtr = dijkstra(n, matrixPtr, start, end);

    const size = mod.HEAP32[resultPtr / 4];
    const path = [];

    for (let i = 1; i <= size; i++) {
      path.push(mod.HEAP32[resultPtr / 4 + i]);
    }
    setPath([]);
    animatePath(path);

    console.log("Chemin :", path);

    mod._free(matrixPtr);
    mod._free(resultPtr);
  };

  const isInPath = (r, c) => {
    const idx = r * COLS + c;
    return path.includes(idx);
  };

  const animatePath = (p) => {
    p.forEach((idx, i) => {
      setTimeout(() => {
        setPath(prev => [...prev, idx]);
      }, i * 200);
    });
  };



  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 40px)` }}>
    {grid.map((row, r) =>
      row.map((cell, c) => (
        <div
          key={`${r}-${c}`}
          onClick={() => handleClick(r, c)}
          style={{
            width: 40,
            height: 40,
            border: "1px solid #444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background:
              cell === "S" ? "green" :
                cell === "E" ? "red" :
                  isInPath(r, c) ? "#4f46e5" :   // 🔵 chemin
                    cell === "#" ? "#333" :
                      "#eee",

            color: "white",
            fontWeight: "bold"
          }}
        >
          {cell !== "." ? cell : ""}
        </div>

      ))
    )}
    <button onClick={runDijkstra}>Lancer Dijkstra</button>

  </div>
}
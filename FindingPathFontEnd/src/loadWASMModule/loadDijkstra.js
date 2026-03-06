export function loadDijkstraWasm() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "/wasm/DijkstraCompilationFiles/dijkstra.js";
    script.onload = () => {
      window.DijkstraModule().then((Module) => {
        resolve(Module);
      });
    };
    document.body.appendChild(script);
  });
}

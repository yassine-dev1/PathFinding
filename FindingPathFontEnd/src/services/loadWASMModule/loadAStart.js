export function loadAstartWasm() {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "/wasm/AstartCompilationFiles/AStart.js";
        script.onload = () => {
            window.AStartModule().then((Module) => {
                resolve(Module);
            });
        };
        document.body.appendChild(script);
    });
}

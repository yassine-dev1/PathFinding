// src/loadBfs.js
export const loadBfsWasm = () => {
    return new Promise((resolve, reject) => {
        if (window.BfsModule) {
            resolve(window.BfsModule);
            return;
        }
        const script = document.createElement('script');
        script.src = '/wasm/BfsCompilationFiles/bfs.js'; // adapte si besoin
        script.onload = () => {
            if (window.BFSModule) {
                window.BFSModule().then(module => {
                    window.BfsModule = module;
                    resolve(module);
                }).catch(reject);
            } else {
                reject(new Error('BFSModule not found after loading script'));
            }
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};
export const loadMazeWasm = () => {
    return new Promise((resolve, reject) => {
        if (window.MazeModuleInstance) {
            resolve(window.MazeModuleInstance);
            return;
        }
        const script = document.createElement('script');
        script.src = '/wasm/MazeCompilationFiles/maze.js'; // adaptez si nécessaire
        script.onload = () => {
            if (window.MazeModule) {
                window.MazeModule().then(module => {
                    window.MazeModuleInstance = module;
                    resolve(module);
                }).catch(reject);
            } else {
                reject(new Error('MazeModule not found'));
            }
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};
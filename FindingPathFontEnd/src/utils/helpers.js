// Fonctions utilitaires générales
export const formatTime = (time) => {
    return time.toFixed(2);
};

export const validateCoordinates = (row, col, maxRows, maxCols) => {
    return row >= 0 && row < maxRows && col >= 0 && col < maxCols;
};
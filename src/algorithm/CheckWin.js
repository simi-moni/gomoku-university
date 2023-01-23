
const requiredLineLength = 5;

const lineDirections = [
  [0, 1], //horizontal
  [1, 0], //vertical
  [1, -1], //diagonal 1
  [1, 1], //diagonal 2
];

export function checkWin(player, lastMove, stateBoard) {
    let boolWon = false;
    for (let i = 0; i < lineDirections.length && !boolWon; i++) {
        let shift = lineDirections[i];
        let currentSquare = [lastMove[0] + shift[0], lastMove[1] + shift[1]];
        let lineLength = 1;

        while (
            lineLength < requiredLineLength &&
            legalSquare(currentSquare) &&
            stateBoard[currentSquare[0]][currentSquare[1]] === player
        ) {
            lineLength++;
            currentSquare[0] += shift[0];
            currentSquare[1] += shift[1];
        }

        currentSquare = [lastMove[0] - shift[0], lastMove[1] - shift[1]];
        while (
            lineLength < requiredLineLength &&
            legalSquare(currentSquare) &&
            stateBoard[currentSquare[0]][currentSquare[1]] === player
        ) {
            lineLength++;
            currentSquare[0] -= shift[0];
            currentSquare[1] -= shift[1];
        }
        if (lineLength >= requiredLineLength) boolWon = true;
    }
    return boolWon;
}


function legalSquare(square) {
    return square[0] < 9 && square[1] < 9 && square[0] >= 0 && square[1] >= 0;
}
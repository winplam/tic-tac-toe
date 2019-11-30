/* TODO
- Create AI with easy/med/hard mode
*/

'use strict';
// Players
let player1;
let player2;

// ---------- Game board module
const gameBoard = (() => {
    let grid = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];
    const updateSquare = (rowIndex, columnIndex, piece) => {
        grid[rowIndex][columnIndex] = piece;
    };
    let currentTurn = "X";
    return {
        grid,
        updateSquare,
        currentTurn
    }
})();

// ---------- Display games pieces module
const displayController = ((grid) => {
    function rows(row, rowIndex) {
        for (let [columnIndex, squareContent] of row.entries()) {
            document.getElementById(`square${rowIndex}${columnIndex}`).innerText = squareContent;
        }
    }

    return {
        refresh() {
            grid.forEach(rows);
        }
    };
})(gameBoard.grid);
displayController.refresh();

// ---------- Add event listeners module
const controlPanel = (() => {
    document.querySelector(".settings-core").addEventListener("click", (e) => {
        const id = e.target.id;
        listenToGameBoard(id);
    });

    function listenToGameBoard(id) {
        switch (id) {
            case "start-btn":
                startGame(document.getElementById("player-1-input").value
                    , document.getElementById("player-2-input").value);
                break;
            case "reset-btn":
                resetGame();
                break;
            default:
                console.log("uncaught settings event: " + id);
        }
    }
})();

const playRound = (() => {
    function listenToGameBoard(e) {
        const id = e.target.id;
        switch (id) {
            case "square00":
            case "square01":
            case "square02":
            case "square10":
            case "square11":
            case "square12":
            case "square20":
            case "square21":
            case "square22":
                markSquare(id);
                break;
            default:
                console.log("uncaught game board event: " + id);
        }
    }

    return {
        startListening() {
            document.querySelector(".game-board").addEventListener("click", listenToGameBoard);
        },
        stopListening() {
            document.querySelector(".game-board").removeEventListener("click", listenToGameBoard);
        }
    }
})();

// ---------- Mark a square function
function markSquare(id) {
    const piece = gameBoard.currentTurn;
    const rowIndex = id.substr(6, 1);
    const columnIndex = id.substr(7, 1);
    if (gameBoard.grid[rowIndex][columnIndex] === "") {
        gameBoard.updateSquare(rowIndex, columnIndex, piece);
        gameBoard.currentTurn === "X" ? player2sTurn() : player1sTurn();
        document.getElementById(`square${rowIndex}${columnIndex}`).style.cssText = "cursor: default";
    }

    function player1sTurn() {
        gameBoard.currentTurn = "X";
        player1.showMyTurn();
    }

    function player2sTurn() {
        gameBoard.currentTurn = "O";
        player2.showMyTurn();
    }

    displayController.refresh();
    determineWinner();
}

// ---------- Check for winner or tie
function determineWinner() {
    const checkPattern = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ];

    function checkForWinner() {
        for (const item of checkPattern) {
            const lineToCheck = gameBoard.grid[item[0][0]][item[0][1]]
                + gameBoard.grid[item[1][0]][item[1][1]]
                + gameBoard.grid[item[2][0]][item[2][1]];
            if (lineToCheck === "XXX") {
                return "X";
            } else if (lineToCheck === "OOO") {
                return "O";
            }
        }
    }

    switch (checkForWinner()) {
        case "X":
            displayMessages.playerWins(player1.name);
            playRound.stopListening();
            break;
        case "O":
            displayMessages.playerWins(player1.name);
            playRound.stopListening();
            break;
        default:
            console.log("No winner yet or a tie.");
    }
};

// ---------- Settings
// Game controller
function startGame(name1, name2) {
    if (name1 === undefined || name1 === null || name1 === "") {
        name1 = "Player 1";
    }
    if (name2 === undefined || name2 === null || name2 === "") {
        name2 = "Player 2";
    }
    player1 = createPlayer(name1);
    player2 = createPlayer(name2);
    const startButton = document.getElementById("start-btn");
    startButton.disabled = true;
    startButton.className = "button-disabled";
    const player1Input = document.getElementById("player-1-input");
    player1Input.disabled = true;
    const player2Input = document.getElementById("player-2-input");
    player2Input.disabled = true;
    const aiCheckBox1 = document.getElementById("ai-checkbox-1");
    aiCheckBox1.disabled = true;
    const aiCheckBox2 = document.getElementById("ai-checkbox-2");
    aiCheckBox2.disabled = true;
    player1.showMyTurn();
    playRound.startListening();
}

// Player factory
const createPlayer = (name) => {
    const sayName = () => console.log("Hello, my name is " + name + ".");
    const showMyTurn = () => displayMessages.playersTurn(name);
    return {name, sayName, showMyTurn};
};

// Display messages
const displayMessages = (() => {
    const messageBox = document.getElementById("message-box");
    messageBox.innerHTML = "Enter names of players<br>Press start to begin";

    function playersTurn(name) {
        messageBox.innerText = `It's ${name}'s turn`;
    }

    function playerWins(name) {
        messageBox.innerText = `Congratulations! ${name} won!`;
        messageBox.classList.add("messageBoxHighlight");
    }

    return {
        playersTurn,
        playerWins
    }
})();

function resetGame() {
    location.reload();
}

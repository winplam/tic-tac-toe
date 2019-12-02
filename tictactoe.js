'use strict';

// Display messages
const displayMessages = (() => {
    const messageBox = document.querySelector(".message-box");

    const welcomeMessage = () => {
        messageBox.classList.remove("message-box-highlight");
        messageBox.innerHTML = "Enter names of players<br>Press start to begin";
    };

    const playersTurn = (name) => {
        if (name === "AI") {
            messageBox.innerText = `It's the ${name}'s turn (${gameBoard.currentTurn})`;
        } else {
            messageBox.innerText = `It's ${name}'s turn (${gameBoard.currentTurn})`;
        }
    };

    const playerWins = (name) => {
        if (name === players.ai1.playerName || name === players.ai2.playerName) {
            messageBox.innerText = `${name} has won`;
        } else {
            messageBox.innerText = `Congratulations! ${name} won!`;
        }
        messageBox.classList.add("message-box-highlight");
    };

    const itsATie = () => {
        messageBox.innerText = "It's a tie!";
        messageBox.classList.add("message-box-highlight");
    };

    return {
        welcomeMessage,
        playersTurn,
        playerWins,
        itsATie
    }
})();

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
        displayMessages.welcomeMessage();
        const resetGridValues = () => {
            for (let [rowIndex, rowContent] of grid.entries()) {
                for (let [columnIndex, columnContent] of rowContent.entries()) {
                    grid[rowIndex][columnIndex] = "";
                }
            }
        };
        return {
            grid,
            updateSquare,
            currentTurn,
            resetGridValues
        }
    }
)();

// ---------- Display games pieces module
const displayController = (() => {
    const rows = (row, rowIndex) => {
        for (let [columnIndex, squareContent] of row.entries()) {
            document.getElementById(`square${rowIndex}${columnIndex}`).innerText = squareContent;
        }
    };
    return {
        refresh() {
            gameBoard.grid.forEach(rows);
        }
    };
})();

// ---------- Add event listeners module
const controlPanel = (() => {
    document.querySelector(".settings-core").addEventListener("click", (e) => {
        const id = e.target.id;
        listenToGameBoard(id);
    });
    const listenToGameBoard = (id) => {
        switch (id) {
            case "ai-checkbox-1":
                aiDisplayControls.toggleAIBox(1);
                break;
            case "ai-checkbox-2":
                aiDisplayControls.toggleAIBox(2);
                break;
            case "easy-button-1":
                setDifficultyLevel.makeEasy(1);
                break;
            case "easy-button-2":
                setDifficultyLevel.makeEasy(2);
                break;
            case "medium-button-1":
                setDifficultyLevel.makeMedium(1);
                break;
            case "medium-button-2":
                setDifficultyLevel.makeMedium(2);
                break;
            case "impossible-button-1":
                setDifficultyLevel.makeImpossible(1);
                break;
            case "impossible-button-2":
                setDifficultyLevel.makeImpossible(2);
                break;
            case "start-btn":
                startGame(document.getElementById("player-1-input").value
                    , document.getElementById("player-2-input").value);
                document.getElementById("start-btn").style.display = "none";
                document.getElementById("reset-btn").style.display = "inline";
                break;
            case "reset-btn":
                resetGame();
                break;
            default:
            // console.log("uncaught settings event: " + id);
        }
    }
})();

// ---------- Process mouse clients
const playRound = (() => {
    const listenToGameBoard = (e) => {
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
        }
    };

    return {
        startListening() {
            document.querySelector(".game-board").addEventListener("click", listenToGameBoard);
            document.querySelector(".game-board").style.cursor = "pointer";
        },
        stopListening() {
            document.querySelector(".game-board").removeEventListener("click", listenToGameBoard);
            document.querySelector(".game-board").style.cursor = "default";
            gameBoard.currentTurn = "";
        }
    }
})();

// ---------- Mark a square function
const markSquare = (id) => {
    const piece = gameBoard.currentTurn;
    const rowIndex = id.substr(6, 1);
    const columnIndex = id.substr(7, 1);
    const player1sTurn = () => {
        gameBoard.currentTurn = "X";
        players.player1.showMyTurn();
    };
    const player2sTurn = () => {
        gameBoard.currentTurn = "O";
        players.player2.showMyTurn();
    };
    if (gameBoard.grid[rowIndex][columnIndex] === "") {
        gameBoard.updateSquare(rowIndex, columnIndex, piece);
        gameBoard.currentTurn === "X" ? player2sTurn() : player1sTurn();
        document.getElementById(`square${rowIndex}${columnIndex}`).style.cssText = "cursor: default";
    }
    displayController.refresh();
    determineWinner();
};

// ---------- Check for winner or tie
const determineWinner = () => {
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

    const checkForWinner = () => {
        for (const item of checkPattern) {
            // Highlight winning row or column of squares
            const highlightWinningSquares = (color) => {
                item.forEach(element => {
                    document.getElementById(`square${element[0]}${element[1]}`).style.background = color;
                })
            };

            // Compare board pattern to list of winning patters
            const lineToCheck = gameBoard.grid[item[0][0]][item[0][1]]
                + gameBoard.grid[item[1][0]][item[1][1]]
                + gameBoard.grid[item[2][0]][item[2][1]];
            if (lineToCheck === "XXX") {
                highlightWinningSquares("#96f321");
                return "X";
            } else if (lineToCheck === "OOO") {
                highlightWinningSquares("#96f321");
                return "O";
            }

        }
    };

    // Determine when grid is full
    const gridIsFull = () => {
        for (const outerItem of gameBoard.grid) {
            for (const innerItem of outerItem) {
                if (innerItem === "") {
                    return false;
                }
            }
        }
        const squares = document.querySelectorAll(".squares");
        squares.forEach((element) => {
            element.style.background = "#bbb";
        });
        return true;
    };

    switch (checkForWinner()) {
        case "X":
            displayMessages.playerWins(players.player1.playerName);
            playRound.stopListening();
            break;
        case "O":
            displayMessages.playerWins(players.player2.playerName);
            playRound.stopListening();
            break;
        default:
            if (gridIsFull()) {
                displayMessages.itsATie();
                playRound.stopListening();
            }
    }

    if (players.player1.playerName === players.ai1.playerName && gameBoard.currentTurn === "X") {
        aisTurn(1)
    } else if (players.player2.playerName === players.ai2.playerName && gameBoard.currentTurn === "O") {
        aisTurn(2)
    }
};

// ---------- Settings
// Create players
const players = (() => {
    let player1;
    let player2;
    const playerFactory = (name) => {
        let playerName = name;
        const sayName = () => console.log("Hello, my name is " + playerName + ".");
        const showMyTurn = () => displayMessages.playersTurn(playerName);
        return {playerName, sayName, showMyTurn};
    };
    const ai1 = playerFactory("Hal 9000");
    const ai2 = playerFactory("Skynet");
    return {player1, player2, ai1, ai2, playerFactory}
})();

// Game controller
const startGame = (name1, name2) => {
    // Set default player name if none is entered
    const aiCheckbox1 = document.getElementById("ai-checkbox-1").checked;
    const aiCheckbox2 = document.getElementById("ai-checkbox-2").checked;
    if (aiCheckbox1) {
        try {
            players.player1.name ? document.getElementById("player-1-input").value = players.player1.name
                : document.getElementById("player-1-input").value = "Player 1";
        } catch (e) {
        }
        name1 = players.ai1.playerName;
    } else if (name1 === undefined || name1 === null || name1 === "") {
        document.getElementById("player-1-input").value = "Player 1";
        name1 = "Player 1";
    }
    if (aiCheckbox2) {
        try {
            players.player2.name ? document.getElementById("player-2-input").value = players.player2.name
                : document.getElementById("player-2-input").value = "Player 2";
        } catch (e) {
        }
        name2 = players.ai2.playerName;
    } else if (name2 === undefined || name2 === null || name2 === "") {
        document.getElementById("player-2-input").value = "Player 2";
        name2 = "Player 2";
    }
    players.player1 = players.playerFactory(name1);
    players.player2 = players.playerFactory(name2);
    if (aiDisplayControls.difficultyLevel1 === undefined || aiDisplayControls.difficultyLevel1 === null
        || aiDisplayControls.difficultyLevel1 === "") {
        document.getElementById("medium-button-1").click();
    }
    if (aiDisplayControls.difficultyLevel2 === undefined || aiDisplayControls.difficultyLevel2 === null
        || aiDisplayControls.difficultyLevel2 === "") {
        document.getElementById("medium-button-2").click();
    }
    disableSettingsInput();
    playRound.startListening();
    document.querySelector(".game-board").style.cursor = "pointer";
    players.player1.showMyTurn();

    if (players.player1.playerName === players.ai1.playerName && gameBoard.currentTurn === "X") {
        aisTurn(1)
    }
};

/* ---------- Disable settings panel */
const disableSettingsInput = () => {
    const elementsToDisable = ["player-1-input", "player-2-input", "ai-checkbox-1", "ai-checkbox-2", "easy-button-1"
        , "easy-button-2", "medium-button-1", "medium-button-2", "impossible-button-1", "impossible-button-2"
        , "start-btn"];
    elementsToDisable.forEach(element => {
        document.getElementById(element).disabled = true;
    });
    document.getElementById("ai-slider-1").classList.add("cursor-default");
    document.getElementById("ai-slider-2").classList.add("cursor-default");
};

const enableSettingsInput = () => {
    const elementsToEnable = ["player-1-input", "player-2-input", "ai-checkbox-1", "ai-checkbox-2", "easy-button-1"
        , "easy-button-2", "medium-button-1", "medium-button-2", "impossible-button-1", "impossible-button-2"
        , "start-btn"];
    elementsToEnable.forEach(element => {
        document.getElementById(element).disabled = false;
    });
    document.getElementById("ai-slider-1").classList.remove("cursor-default");
    document.getElementById("ai-slider-2").classList.remove("cursor-default");
};

// Reset game
const resetGame = () => {
    gameBoard.resetGridValues();
    const squares = document.querySelectorAll(".squares");
    squares.forEach((element) => {
        element.style.background = "#fff";
    });
    displayController.refresh();
    document.getElementById("start-btn").disabled = false;
    document.getElementById("reset-btn").style.display = "none";
    document.getElementById("start-btn").style.display = "inline";
    gameBoard.currentTurn = "X";
    enableSettingsInput();
    displayMessages.welcomeMessage();
};

/* ---------- AI controls */
const aiDisplayControls = (() => {
    const DifficultyLevels = {
        EASY: "Easy",
        MEDIUM: "Medium",
        IMPOSSIBLE: "Impossible"
    };
    let difficultyLevel1;
    let difficultyLevel2;

    const toggleAIBox = (playerNumber) => {
        const aiCheckBox = document.getElementById(`ai-checkbox-${playerNumber}`);
        const playerInput = document.getElementById(`player-${playerNumber}-input`);
        const aiButtonGroup = document.getElementById(`ai-btn-grp-${playerNumber}`);
        if (aiCheckBox.checked === true) {
            playerInput.style.display = "none";
            aiButtonGroup.style.display = "inline";
        } else {
            playerInput.style.display = "inline";
            aiButtonGroup.style.display = "none";
        }
    };

    function showDifficultyLevel() {
        console.log("Difficulty level AI-1: " + aiDisplayControls.difficultyLevel1
            + " AI-2: " + aiDisplayControls.difficultyLevel2);
    }

    return {DifficultyLevels, difficultyLevel1, difficultyLevel2, toggleAIBox, showDifficultyLevel}
})();

/* ---------- Set difficulty level of AI and handle button clicks */
const setDifficultyLevel = (() => {
    const makeEasy = (playerNumber) => {
        aiDisplayControls[`difficultyLevel${playerNumber}`] = aiDisplayControls.DifficultyLevels.EASY;
        const easyButton = document.getElementById(`easy-button-${playerNumber}`);
        const mediumButton = document.getElementById(`medium-button-${playerNumber}`);
        const impossibleButton = document.getElementById(`impossible-button-${playerNumber}`);
        easyButton.disabled = true;
        easyButton.className = "ai-button-disabled";
        mediumButton.disabled = false;
        mediumButton.className = "ai-button";
        impossibleButton.disabled = false;
        impossibleButton.className = "ai-button";
    };
    const makeMedium = (playerNumber) => {
        aiDisplayControls[`difficultyLevel${playerNumber}`] = aiDisplayControls.DifficultyLevels.MEDIUM;
        const easyButton = document.getElementById(`easy-button-${playerNumber}`);
        const mediumButton = document.getElementById(`medium-button-${playerNumber}`);
        const impossibleButton = document.getElementById(`impossible-button-${playerNumber}`);
        easyButton.disabled = false;
        easyButton.className = "ai-button";
        mediumButton.disabled = true;
        mediumButton.className = "ai-button-disabled";
        impossibleButton.disabled = false;
        impossibleButton.className = "ai-button";
    };
    const makeImpossible = (playerNumber) => {
        aiDisplayControls[`difficultyLevel${playerNumber}`] = aiDisplayControls.DifficultyLevels.IMPOSSIBLE;
        const easyButton = document.getElementById(`easy-button-${playerNumber}`);
        const mediumButton = document.getElementById(`medium-button-${playerNumber}`);
        const impossibleButton = document.getElementById(`impossible-button-${playerNumber}`);
        easyButton.disabled = false;
        easyButton.className = "ai-button";
        mediumButton.disabled = false;
        mediumButton.className = "ai-button";
        impossibleButton.disabled = true;
        impossibleButton.className = "ai-button-disabled";
    };
    return {makeEasy, makeMedium, makeImpossible}
})();

/* ---------- AI's Turn */
const easyAIStrategy = (maxDepth) => {
    let xCoordinate = Math.round(0.5 + (Math.random() * 3)) - 1;
    let yCoordinate = Math.round(0.5 + (Math.random() * 3)) - 1;
    if (gameBoard.grid[xCoordinate][yCoordinate] != "X" && gameBoard.grid[xCoordinate][yCoordinate] != "O") {
        setTimeout(function () {
            markSquare(`square${xCoordinate}${yCoordinate}`)
        }, 100);
    } else if (maxDepth > 0) {
        maxDepth--;
        easyAIStrategy(maxDepth);
    } else {
        console.log("easyAIStrategy recursion limit reached");
    }
};

const mediumAIStrategy = () => {
    // Alternate between easy and impossible strategy
    Math.random() < 0.4 ? easyAIStrategy(100) : impossibleAIStrategy();
};

const impossibleAIStrategy = () => {
    // Flatten 2D grid array
    const flatten2DGrid = (grid) => {
        let accumulator = [];
        for (let i = 0; i < grid.length * grid[0].length; i++) {
            const currentValue = grid[i % grid[0].length][Math.floor(i / grid[0].length)];
            if (currentValue === 'X' || currentValue === 'O') {
                accumulator[i] = currentValue;
            } else {
                accumulator[i] = i;
            }
        }
        return accumulator;
    };
    const newBoard = flatten2DGrid(gameBoard.grid);
    const winCombos = [
        [0, 1, 2], // 0
        [3, 4, 5], // 1
        [6, 7, 8], // 2
        [0, 3, 6], // 3
        [1, 4, 7], // 4
        [2, 5, 8], // 5
        [0, 4, 8], // 6
        [6, 4, 2], // 7
    ];
    const checkWin = (board, player) => {
        let plays = board.reduce((a, e, i) =>
            (e === player) ? a.concat(i) : a, []);
        let gameWon = null;
        for (let [index, win] of winCombos.entries()) {
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {index: index, player: player};
                break;
            }
        }
        return gameWon;
    };

    let otherPlayer;
    gameBoard.currentTurn === "X" ? otherPlayer = 'O' : otherPlayer = 'X';
    const currentPlayer = gameBoard.currentTurn;

    const miniMax = (newBoard, player, debug = false) => {
        const availableSpots = newBoard.filter(s => typeof s === 'number');
        if (checkWin(newBoard, otherPlayer)) {
            return {score: -10};
        } else if (checkWin(newBoard, currentPlayer)) {
            return {score: 10};
        } else if (availableSpots.length === 0) {
            return {score: 0};
        }
        let moves = [];
        for (let i = 0; i < availableSpots.length; i++) {
            let move = {};
            move.index = newBoard[availableSpots[i]];
            newBoard[availableSpots[i]] = player;

            if (player == currentPlayer) {
                let result = miniMax(newBoard, otherPlayer);
                move.score = result.score;
            } else {
                let result = miniMax(newBoard, currentPlayer);
                move.score = result.score;
            }

            newBoard[availableSpots[i]] = move.index;
            moves.push(move);
        }
        let bestMove;
        if (player === currentPlayer) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    };
    let miniMaxResults = miniMax(newBoard, gameBoard.currentTurn, true);
    const xCoordinate = miniMaxResults.index % 3;
    const yCoordinate = Math.floor(miniMaxResults.index / 3);
    if (gameBoard.grid[xCoordinate][yCoordinate] != "X" && gameBoard.grid[xCoordinate][yCoordinate] != "O") {
        setTimeout(function () {
            markSquare(`square${xCoordinate}${yCoordinate}`)
        }, 100);
    }
};


const aisTurn = (playerNumber) => {
    switch (aiDisplayControls[`difficultyLevel${playerNumber}`]) {
        case aiDisplayControls.DifficultyLevels.EASY:
            easyAIStrategy(100);
            break;
        case aiDisplayControls.DifficultyLevels.MEDIUM:
            mediumAIStrategy();
            break;
        case aiDisplayControls.DifficultyLevels.IMPOSSIBLE:
            impossibleAIStrategy(true);
            break;
    }
};

/* Uncomment to auto start game with AI bots */
// document.getElementById("ai-checkbox-1").click();
// document.getElementById("impossible-button-2").click();
// document.getElementById("start-btn").click();

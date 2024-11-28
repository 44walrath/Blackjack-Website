let dealerSum = 0;
let yourSum = 0;
let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;
let balance = 1000;  // Initial balance
let betValue = 0;
let betPlaced = false;  // Flag to track if the bet has been placed
let blackjack = false; // Flag to track if the player gets Blackjack

let canHit = true; // Allows the player (you) to draw while yourSum <= 21

window.onload = function () {
    buildDeck();
    shuffleDeck();
    startGame();
};

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); // A-C -> K-C, A-D -> K-D
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function startGame() {
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    // Deal cards to the player
    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    // Check if player gets Blackjack right after the first 2 cards
    if (yourSum === 21 && yourAceCount === 1 && (yourSum === 11 + 10 || yourSum === 10 + 11)) {
        blackjack = true;
    }

    // Deal cards to the dealer until they reach 17
    while (dealerSum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("your-sum").innerText = yourSum;
}

document.addEventListener("DOMContentLoaded", function () {
    const betForm = document.getElementById("bet-form");

    betForm.addEventListener("submit", function (event) {
        event.preventDefault();
        betValue = parseInt(document.getElementById("bet").value);
        if (betValue > 0 && betValue <= balance && !betPlaced) {
            balance -= betValue;  // Deduct bet when it's first placed
            document.getElementById("balance").innerText = balance;
            betPlaced = true; // Mark that the bet has been placed
            console.log(`Bet placed: ${betValue}`);
        } else if (betPlaced) {
            alert("You can only place the bet once per round.");
        } else {
            alert("Invalid bet amount or insufficient balance.");
        }
    });
});

function hit() {
    if (!canHit || yourSum > 21) {
        return;
    }

    // If the bet hasn't been placed yet, place the bet when hitting
    if (!betPlaced) {
        alert("You need to place a bet first!");
        return; // Prevent hitting if the bet has not been placed
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
    }
    document.getElementById("your-sum").innerText = yourSum;
}

function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    let message = "";

    // Handle Blackjack payout (2.5x)
    if (blackjack) {
        message = "Blackjack! You Win 2.5x your bet!";
        balance += betValue * 2.5;  // Add 2.5 times the bet to balance
    } else {
        if (yourSum > 21) {
            message = "You Lose!";
            balance -= betValue;  // Deduct bet from balance
        } else if (dealerSum > 21) {
            message = "You Win!";
            balance += betValue * 2;  // Add double the bet to balance
        } else if (yourSum == dealerSum) {
            message = "Push!";  // It's a tie, no one wins
        } else if (yourSum > dealerSum) {
            message = "You Win!";
            balance += betValue * 2;  // Add double the bet to balance
        } else {
            message = "You Lose!";
            balance -= betValue;  // Deduct bet from balance
        }
    }

    // Update UI with results
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("results").innerText = message;
    document.getElementById("balance").innerText = balance;  // Update the balance UI
    document.getElementById("replay").style.visibility = "visible";
    document.getElementById("replay").addEventListener("click", replay);

    function replay() {
        // Reset game state for a new round
        dealerSum = 0;
        yourSum = 0;
        dealerAceCount = 0;
        yourAceCount = 0;
        canHit = true;
        betPlaced = false; // Reset the bet flag for the next round
        blackjack = false; // Reset the Blackjack flag

        // Clear the displayed cards
        document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
        document.getElementById("your-cards").innerHTML = "";

        // Reset UI elements
        document.getElementById("dealer-sum").innerText = "0";
        document.getElementById("your-sum").innerText = "0";
        document.getElementById("results").innerText = "";

        // Rebuild and shuffle the deck
        buildDeck();
        shuffleDeck();
        startGame();
        document.getElementById("replay").style.visibility = "hidden";
    }
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { // A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}
document.addEventListener("DOMContentLoaded", function () {
    // This is the secret code you're looking for
    const secretCode = "million";  // Change this to whatever you like

    // Ask the user for the code when the page loads or trigger via a button click
    const secretButton = document.createElement("button");
    secretButton.innerText = "Enter Secret Code";
    document.body.appendChild(secretButton);

    secretButton.addEventListener("click", function () {
        // Prompt for the secret code
        const userCode = prompt("Enter secret code:");

        if (userCode && userCode.toLowerCase() === secretCode.toLowerCase()) {
            alert("Success! You've received 1 million!");

            // Update balance
            balance = 1000000;
            document.getElementById("balance").innerText = balance; // Assuming you have an element with ID "balance" to show the balance
        } else {
            alert("Incorrect code! Try again.");
        }
    });
});

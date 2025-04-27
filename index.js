import * as readline from "node:readline/promises"; // This uses the promise-based APIs
import { stdin as input, stdout as output } from "node:process";

function DisplayCard(card) {
    return card.display;
}

function DisplayHand(deck) {
    let log_deck = [];
    deck.forEach((card) => log_deck.push(DisplayCard(card)));
    return log_deck.join(", ");
}

function BuildDeck() {
    const suits = ["♠️", "♥️", "♦️", "♣️"];
    const possible_card_values = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A",
    ];
    const card_to_value = {
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        J: 10,
        Q: 10,
        K: 10,
        A: 11,
    };

    let deck = [];
    for (let i = 0; i < possible_card_values.length; i++) {
        const corner_thing = possible_card_values[i];
        for (let j = 0; j < suits.length; j++) {
            deck.push({
                value: card_to_value[corner_thing],
                display: `${corner_thing}-${suits[j]}`,
            });
        }
    }
    return deck;
}
function FindAces(hand) {
    let aces = [];
    hand.forEach((card) => {
        if (card.value === 11 || card.value === 1) {
            aces.push(card);
        }
    });
    return aces;
}

function ConvertAce(player_hand) {
    const aces = FindAces(player_hand);
    let hand_total = 0;
    player_hand.forEach((card) => {
        hand_total += card.value;
    });
    if (aces.length === 0) {
        return player_hand;
    }
    aces.forEach((ace) => {
        if (hand_total > 21 && ace.value !== 1) {
            hand_total -= 10;
            player_hand[player_hand.indexOf(ace)].value -= 10;
        }
    });
    return player_hand;
}

function ShuffleDeck(deck) {
    let shuffled = deck;
    for (let i = 0; i < 1000; i++) {
        const shuffle_number1 = Math.floor(Math.random() * shuffled.length);
        const shuffle_number2 = Math.floor(Math.random() * shuffled.length);
        const deck_element1 = deck[shuffle_number1];
        const deck_element2 = deck[shuffle_number2];
        deck[shuffle_number1] = deck_element2;
        deck[shuffle_number2] = deck_element1;
    }
    return deck;
}

function GetPlayerHands(deck) {
    return [
        [deck.pop(), deck.pop()],
        [deck.pop(), deck.pop()],
    ];
}

function PlayDealerTurns(hand, deck) {
    let play = DealersPlay(hand, deck);
    hand = play[0];
    let answer = play[1];
    deck = play[2];
    let total = play[3];
    while (total < 21 && answer !== "Pass") {
        play = DealersPlay(hand, deck);
        hand = play[0];
        answer = play[1];
        deck = play[2];
        total = play[3];
    }
    if (total > 21) {
        console.log(`With a total of ${total}, the Dealer busted. Too bad!`);
    } else if (total === 21) {
        console.log("The Dealer hit 21 exactly! Wowza!");
    }
    return [hand, deck];
}

async function PlayPlayerTurns(hand, deck) {
    let play = await PlayersPlay(hand, deck);
    hand = play[0];
    let answer = play[1];
    deck = play[2];
    let total = play[3];
    while (total < 21 && answer !== "Pass" && answer !== "pass") {
        play = await PlayersPlay(hand, deck);
        hand = play[0];
        answer = play[1];
        deck = play[2];
        total = play[3];
    }
    if (total > 21) {
        console.log(`With a total of ${total}, the Player busted. Too bad!`);
    } else if (total === 21) {
        console.log("The Player hit 21 exactly! Wowza!");
    }
    return [hand, deck];
}

async function PlayersPlay(hand, deck) {
    let player_total = 0;
    console.log(`The Player's cards are ${DisplayHand(hand)}!`);
    hand.forEach((card) => {
        player_total += card.value;
    });
    const rl = readline.createInterface({ input, output });

    let answer = await rl.question(
        `The Player's total of all of their card values is ${player_total}. Would you like to hit or pass? (Please enter either "Hit" or "Pass")  `
    );

    rl.close();
    if (answer === "Hit" || answer === "hit") {
        hand.push(deck.pop());
        hand = ConvertAce(hand);
        player_total = 0;
        hand.forEach((card) => {
            player_total += card.value;
        });
        console.log(
            `The Player chose to Hit, got a ${
                hand[hand.length - 1].display
            }, and now their total is ${player_total}!`
        );
    } else if (answer === "Pass" || answer === "pass") {
        console.log(
            `The Player chose to Pass and their total is still ${player_total}!`
        );
    } else {
        console.error("Please enter a valid input.");
    }

    while (
        answer !== "Hit" &&
        answer !== "hit" &&
        answer !== "Pass" &&
        answer !== "pass"
    ) {
        const rl2 = readline.createInterface({ input, output });

        answer = await rl2.question(
            `The Player's total of all of their card values is ${player_total}. Would you like to hit or pass? (Please enter either "Hit" or "Pass")  `
        );

        rl2.close();
        if (answer === "Hit" || answer === "hit") {
            hand.push(deck.pop());
            hand = ConvertAce(hand);
            player_total = 0;
            hand.forEach((card) => {
                player_total += card.value;
            });
            console.log(
                `The Player chose to Hit, got a ${
                    hand[hand.length - 1].display
                }, and now their total is ${player_total}!`
            );
        } else if (answer === "Pass" || answer === "pass") {
            console.log(
                `The Player chose to Pass and their total is still ${player_total}!`
            );
        } else {
            console.error("Please enter a valid input.");
        }
    }

    // Make a loop that re-prompts the hit or pass propmt if the answer is invalid.

    return [hand, answer, deck, player_total];
}

function DealersPlay(hand, deck) {
    let dealer_total = 0;
    console.log(`The Dealer's cards are ${DisplayHand(hand)}!`);
    let answer = undefined;
    hand.forEach((card) => {
        dealer_total += card.value;
    });
    if (dealer_total >= 17) {
        console.log(
            `The Dealer was forced to pass because their total was ${dealer_total}! Their total is still ${dealer_total}!`
        );
        answer = "Pass";
    } else {
        const old_total = dealer_total;
        dealer_total = 0;
        hand.push(deck.pop());
        hand = ConvertAce(hand);
        hand.forEach((card) => {
            dealer_total += card.value;
        });
        answer = "Hit";
        console.log(
            `The Dealer was forced to hit because their total was ${old_total}! They got a ${
                hand[hand.length - 1].display
            }, and their total is now ${dealer_total}!`
        );
    }
    return [hand, answer, deck, dealer_total];
}

const PlayBlackjack = async () => {
    console.log(
        `Welcome to Blackjack, where the Player and the Dealer compete to see who can get closest to 21 without going over!`
    );
    let deck = ShuffleDeck(BuildDeck());
    let hands = GetPlayerHands(deck);
    let player_hand = ConvertAce(hands[0]);
    let dealer_hand = ConvertAce(hands[1]);
    console.log(
        `The Player has ${DisplayHand(
            player_hand
        )} in their possession, and the Dealer has ${DisplayCard(
            dealer_hand[0]
        )} and another face-down card!`
    );
    const player_turns = await PlayPlayerTurns(player_hand, deck);
    player_hand = player_turns[0];
    deck = player_turns[1];
    console.log(`Now, we move on to the Dealer's turns!`);
    const dealer_turns = PlayDealerTurns(dealer_hand, deck);
    dealer_hand = dealer_turns[0];
    deck = dealer_turns[1];
    let player_total = 0;
    player_hand.forEach((card) => (player_total += card.value));
    let dealer_total = 0;
    dealer_hand.forEach((card) => (dealer_total += card.value));
    if (dealer_total > 21) {
        if (player_total <= 21) {
            console.log(`Because the Dealer busted, the Player won!`);
        } else {
            console.log(
                `Because both the Dealer and the Player busted, it was a tie!`
            );
        }
    } else if (player_total > 21) {
        if (dealer_total <= 21) {
            console.log(`Because the Player busted, the Dealer won!`);
        } else {
            console.log(
                `Because both the Dealer and the Player busted, it was a tie!`
            );
        }
    } else {
        if (21 - player_total < 21 - dealer_total) {
            console.log(
                `With a total of ${player_total} and cards of ${DisplayHand(
                    player_hand
                )}, the Player won because they were closest to 21!`
            );
        } else if (21 - player_total > 21 - dealer_total) {
            console.log(
                `With a total of ${dealer_total} and cards of ${DisplayHand(
                    dealer_hand
                )}, the Dealer won because they were closest to 21!`
            );
        } else {
            console.log(
                `Because the Player and the Dealer were both equally distanced from 21, the game was a tie!`
            );
        }
    }
};
PlayBlackjack();

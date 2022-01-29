const socket = io("https://yaniv-server-yuval.herokuapp.com/", {
    autoConnect: false,
});

// const socket = io("http://127.0.0.1:3000/", {
//     autoConnect: false,
// });

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    history.replaceState({}, null, "/Yaniv-client/game.html");

    document.getElementById("my-name").innerHTML = urlParams.get("name");

    socket.connect();

    socket.emit("onJoinRoom", urlParams.get("code"));
    socket.emit("onGetPlayerName", urlParams.get("name"));

    document.getElementById("deck").addEventListener("click", takeCardFromDeck);

    socket.on("onClientDisconnect", () =>
        alert("Sorry, the game is over.\nthe other player has left the game.")
    );

    socket.on("onGameStart", (cards) => {
        const myCards = document.getElementById("my-cards");

        cards.forEach((card) => {
            const myCard = createCard(card);
            myCard.classList.add("my-card");
            myCard.addEventListener("click", cardPressed);
            myCards.appendChild(myCard);
        });
    });

    socket.on("onPlayersStateChange", (playersState) => {
        const rivalCards = document.getElementById("rival-cards");

        playersState.forEach((player) => {
            if (player.id !== socket.id) {
                document.getElementById("rival-name").innerHTML = player.name;

                document.querySelectorAll(".rival-card").forEach((card) => {
                    card.remove();
                });

                for (let card = 0; card < player.cardsAmount; card++) {
                    const rivalCard = createCard("gray_back");
                    rivalCard.classList.add("rival-card");
                    rivalCards.appendChild(rivalCard);
                }
            }
        });
    });

    socket.on("onCardTaken", (hand) => {
        const myOldCards = document.querySelectorAll(".my-card");
        myOldCards.forEach((card) => {
            card.remove();
        });

        const myCards = document.getElementById("my-cards");

        hand.forEach((card) => {
            const myCard = createCard(card);
            myCard.classList.add("my-card");
            myCard.addEventListener("click", cardPressed);
            myCards.appendChild(myCard);
        });
    });

    socket.on("onPileUpdate", ({ pile: updatedPile, topPile: cardsId }) => {
        const pile = document.getElementById("pile");
        const randomRotation = (Math.random() - 0.5) * 90;

        const cardToRemove = Array.from(
            document.querySelectorAll(".pile-card")
        ).filter((card) => !updatedPile.includes(card.id));

        if (cardToRemove.length > 0) {
            cardToRemove[0].remove();
        }

        removeTopPileCards();

        cardsId.forEach((cardId, index) => {
            const newCard = createCard(cardId);

            if (index === 0 || index === cardsId.length - 1) {
                newCard.classList.add("top-pile");
                newCard.classList.add("pile-card");
                newCard.addEventListener("click", takeCardFromPile);
            }

            newCard.style.transform = `rotate(${randomRotation}deg)`;
            newCard.style.position = "absolute";

            if (cardsId.length > 2) {
                newCard.style.left = `${80 * (index - 1)}px`;
                newCard.style.top = `${30 * (index - 1)}px`;
            } else {
                newCard.style.left = `${80 * index}px`;
                newCard.style.top = `${30 * index}px`;
            }

            const card = document.querySelector(`#my-cards [id='${cardId}']`);

            if (card) {
                card.remove();
            }

            pile.appendChild(newCard);
        });
    });

    socket.on("onTurnChanged", (currentPlayerTrun) => {
        if (socket.id !== currentPlayerTrun) {
            document.getElementById("main").classList.add("disable-screen");
        } else {
            document.getElementById("main").classList.remove("disable-screen");
        }
    });

    socket.on("onPlayerWin", ({ winner, state }) => {
        finishGame(state);
        const winnerBanner = document.createElement("p");
        document.getElementById("control-center").appendChild(winnerBanner);
        winnerBanner.innerText = `the winner is ${winner.name}`;
        winnerBanner.classList.add("yaniv-win");
    });

    socket.on("onAsaf", ({ winner, state }) => {
        finishGame(state);
        const winnerBanner = document.createElement("p");
        document.getElementById("control-center").appendChild(winnerBanner);
        winnerBanner.innerText = `asaf! the winner is ${winner.name}`;
        winnerBanner.classList.add("yaniv-win");
    });
};

const takeCardFromPile = (event) => {
    if (document.querySelector(".selected-card")) {
        const thrownCards = Array.from(
            document.querySelectorAll(".selected-card")
        ).map((card) => card.id);

        if (isStepValid(thrownCards)) {
            socket.emit("onCardTakenFromPile", {
                thrownCards,
                cardFromPile: event.target.id,
            });
        } else {
            document.querySelectorAll(".selected-card").forEach((card) => {
                card.classList.add("selected-cards-error");
                setTimeout(() => {
                    card.classList.remove("selected-cards-error");
                }, 500);
            });
        }
    }
};

const takeCardFromDeck = () => {
    if (document.querySelector(".selected-card")) {
        const thrownCards = Array.from(
            document.querySelectorAll(".selected-card")
        ).map((card) => card.id);

        if (isStepValid(thrownCards)) {
            socket.emit("onCardTakeFromDeck", thrownCards);
        } else {
            document.querySelectorAll(".selected-card").forEach((card) => {
                card.classList.add("selected-cards-error");
                setTimeout(() => {
                    card.classList.remove("selected-cards-error");
                }, 500);
            });
        }
    }
};

const createCard = (name) => {
    const card = document.createElement("img");

    card.src = `./assets/cards/${name}.png`;
    card.classList.add("card");
    card.setAttribute("id", name);

    return card;
};

const cardPressed = (event) => {
    event.target.classList.toggle("my-card");
    event.target.classList.toggle("selected-card");
};

const removeTopPileCards = () => {
    document.querySelectorAll(".top-pile").forEach((card) => {
        card.classList.remove("top-pile");
        card.classList.remove("top-pile-active");

        card.removeEventListener("click", takeCardFromPile);
    });
};

const calcHandSum = () => {
    const myHand = Array.from(document.getElementsByClassName("my-card"));
    return myHand.reduce((total, { id }) => total + cardsToNumber.get(id), 0);
};

const yanivPressed = () => {
    const yaniv = document.getElementById("yaniv");

    if (calcHandSum() <= 7) {
        socket.emit("onYaniv", socket.id);
    } else {
        yaniv.classList.add("yaniv-error");

        setTimeout(() => {
            yaniv.classList.remove("yaniv-error");
        }, 3000);
    }
};

const isStepValid = (cards) => {
    if (cards.length === 1) {
        return true;
    }

    cards = cards.sort(
        (currentCard, nexrCard) =>
        cardsToNumber.get(currentCard) - cardsToNumber.get(nexrCard)
    );

    let isNumbersFollowing = true;

    for (let index = 0; index < cards.length - 1; index++) {
        if (
            cardsToNumber.get(cards[index]) ===
            cardsToNumber.get(cards[index + 1]) - 1
        ) {
            isNumbersFollowing = isNumbersFollowing && true;
        } else {
            isNumbersFollowing = isNumbersFollowing && false;
        }
    }

    if (
        cards.length > 1 &&
        cards.every(
            (card) => cardsToNumber.get(card) === cardsToNumber.get(cards[0])
        )
    ) {
        return true;
    } else if (
        cards.length > 2 &&
        isNumbersFollowing &&
        cards.every((card) => card.slice(-1) === cards[0].slice(-1))
    ) {
        return true;
    }

    return false;
};

const finishGame = (playersState) => {
    const rivalCards = document.getElementById("rival-cards");
    console.log(playersState);
    playersState.forEach((player) => {
        if (player.id !== socket.id) {
            document.getElementById("rival-name").innerHTML = player.name;

            document.querySelectorAll(".rival-card").forEach((card) => {
                card.remove();
            });

            player.hand.forEach((card) => {
                const rivalCard = createCard(card);
                rivalCard.classList.add("rival-card");
                rivalCards.appendChild(rivalCard);
            });
        }
    });

    document.getElementById("main").classList.add("disable-screen");
};

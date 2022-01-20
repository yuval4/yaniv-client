const socket = io("http://127.0.0.1:3000");

const createCard = (name) => {
    const card = document.createElement("img");

    card.src = `/assets/cards/${name}.png`;
    card.classList.add("card");
    card.setAttribute("id", name);

    return card;
};

const hand = ["3H", "10D", "8C", "7H", "AC"];
socket.on("startGame", (cards) => {
    console.log(cards);
    const myCards = document.getElementById("my-cards");

    cards.forEach((card) => {
        const myCard = createCard(card);
        myCard.classList.add("my-card");
        myCard.addEventListener("click", cardPressed);
        myCards.appendChild(myCard);
    });
});

socket.on("topPile", (cardsId) => {
    const pile = document.getElementById("pile");
    const randomRotation = (Math.random() - 0.5) * 90;
    removeTopPileCards();

    cardsId.forEach((cardId, index) => {
        const newCard = createCard(cardId);

        if (index === 0 || index === cardsId.length - 1) {
            newCard.classList.add("top-pile");
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

socket.on("removeFromPile", (cardId) => {
    document.querySelector(`#pile [id='${cardId}']`);
});

window.onload = () => {
    const rivalCards = document.getElementById("rival-cards");

    hand.forEach((card) => {
        const rivalCard = createCard("gray_back");
        rivalCard.classList.add("rival-card");
        rivalCards.appendChild(rivalCard);
    });

    document.getElementById("deck").addEventListener("click", takeCardFromDeck);

    setInterval(() => {
        const pile = document.querySelectorAll(".top-pile");

        if (document.querySelector(".selected-card")) {
            pile.forEach((card) => card.classList.add("top-pile-active"));
        } else {
            pile.forEach((card) => card.classList.remove("top-pile-active"));
        }
    }, 100);

    // document.addEventListener("click", (event) => {
    //     console.log(event.x, event.y);
    // });
};

const cardPressed = (event) => {
    event.target.classList.toggle("my-card");
    event.target.classList.toggle("selected-card");
};

const changeTopCard = (newCard) => {
    document.getElementById("top-card").innerHTML = newCard;
};

const takeCardFromDeck = () => {
    if (document.querySelector(".selected-card")) {
        const newCard = createCard("QS");
        newCard.classList.add("my-card");
        newCard.addEventListener("click", cardPressed);
        document.getElementById("my-cards").appendChild(newCard);

        moveCardsToPile(document.querySelectorAll(".selected-card"));
    }
};

const takeCardFromPile = (event) => {
    if (document.querySelector(".selected-card")) {
        const newCard = createCard(event.target.id);
        // event.target.remove();
        newCard.classList.add("my-card");
        newCard.addEventListener("click", cardPressed);
        document.getElementById("my-cards").appendChild(newCard);

        moveCardsToPile(document.querySelectorAll(".selected-card"));

        socket.emit("tookCardFromPile", event.target.id);
    }
};

const removeTopPileCards = () => {
    document.querySelectorAll(".top-pile").forEach((card) => {
        card.classList.remove("top-pile");
        card.classList.remove("top-pile-active");

        card.removeEventListener("click", takeCardFromPile);
    });
};

const moveCardsToPile = (cards) => {
    socket.emit(
        "putCardsOnPile",
        Array.from(cards).map((card) => card.id)
    );

    // removeTopPileCards();

    // cards.forEach((card, index) => {
    //     const newCard = createCard(card.id);

    //     if (index === 0 || index === cards.length - 1) {
    //         newCard.classList.add("top-pile");
    //         newCard.addEventListener("click", takeCardFromPile);
    //     }

    //     newCard.style.transform = `rotate(${randomRotation}deg)`;
    //     newCard.style.position = "absolute";

    //     if (cards.length > 2) {
    //         newCard.style.left = `${80 * (index - 1)}px`;
    //         newCard.style.top = `${30 * (index - 1)}px`;
    //     } else {
    //         newCard.style.left = `${80 * index}px`;
    //         newCard.style.top = `${30 * index}px`;
    //     }

    //     card.remove();
    //     pile.appendChild(newCard);
    // });

    // const cardTopPos = card.getBoundingClientRect().top;
    // const cardLeftPos = card.getBoundingClientRect().left;

    // newCard.style.position = "fixed";
    // // newCard.style.top = `${cardTopPos}px`;
    // // newCard.style.left = `${cardLeftPos}px`;
    // // newCard.style.top = `${0}px`;
    // // newCard.style.left = `${0}px`;

    // // const newTopPos = pile.getBoundingClientRect().top - cardTopPos;
    // // const newLeftPos = pile.getBoundingClientRect().left - cardLeftPos;

    // // const newTopPos = pile.getBoundingClientRect().y - cardTopPos;
    // // const newLeftPos = pile.getBoundingClientRect().x - cardLeftPos;

    // console.log("card", cardLeftPos, cardTopPos);
    // // console.log(
    // //     "pile ",
    // //     pile.getBoundingClientRect().y,
    // //     pile.getBoundingClientRect().x
    // // );
    // // console.log("differance", newTopPos, newLeftPos);

    // // newCard.style.transitionDuration = "2s";
    // // newCard.style.transform = `translate(-${newLeftPos}px, -${newTopPos}px)`;
};

const calcHandSum = () => {
    const myHand = Array.from(document.getElementsByClassName("my-card"));
    return myHand.reduce((total, { id }) => total + cardsToNumber.get(id), 0);
};

const yanivPressed = () => {
    const yaniv = document.getElementById("yaniv");

    if (calcHandSum() < 7) {
        yaniv.classList.add("yaniv-win");
    } else {
        yaniv.classList.add("yaniv-error");

        setTimeout(() => {
            yaniv.classList.remove("yaniv-error");
        }, 3000);
    }
    console.log(calcHandSum());
};

const isStepValid = (cards) => {
    if (cards.length === 1) {
        return true;
    }

    cards = cards.sort(
        (currentCard, nexrCard) =>
        cardsToNumber.get(currentCard) - cardsToNumber.get(nexrCard)
    );

    if (
        cards.length > 1 &&
        cards.every(
            (card) => cardsToNumber.get(card) === cardsToNumber.get(cards[0])
        )
    ) {
        return true;
    } else if (
        cards.length > 2 &&
        cards.every(
            (a, b) => cardsToNumber.get(a) === cardsToNumber.get(b) + 1
        ) &&
        cards.every((card) => card.at(-1) === cards[0].at(-1))
    ) {
        return true;
    }

    return false;
};
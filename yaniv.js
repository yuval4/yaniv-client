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

  disableActions(document.getElementById("control-center"), true);
  disableActions(document.getElementById("my-table"), true);
  document.getElementById("restart-button").style.display = "block";
};

const restartGame = () => {
  socket.emit("onRestartGame");
};

const disableActions = (element, isAble) => {
  if (isAble) {
    element.classList.add("disable");
  } else {
    element.classList.remove("disable");
  }
};

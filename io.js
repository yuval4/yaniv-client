const socket = io("https://yaniv-server-yuval.herokuapp.com/", {
    autoConnect: false,
});

// const socket = io("http://127.0.0.1:3000/", {
//   autoConnect: false,
// });

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  history.replaceState({}, null, "/yaniv-client/game.html");

  document.getElementById("my-name").innerHTML = urlParams.get("name");
  document.getElementById("game-over").style.display = "none";
  disableActions(document.getElementById("control-action"), true);
  disableActions(document.getElementById("my-table"), true);

  socket.connect();

  socket.emit("onJoinRoom", urlParams.get("code"));
  socket.emit("onGetPlayerName", urlParams.get("name"));

  document.getElementById("deck").addEventListener("click", takeCardFromDeck);

  socket.on("onClientDisconnect", () =>
    alert("Sorry, the game is over.\nthe other player has left the game.")
  );

  socket.on("onRoomFull", (roomName) =>
    alert(`Room ${roomName} is full, client - disconnected`)
  );

  socket.on("onGameStart", (cards) => {
    const myCards = document.getElementById("my-cards");

    // reseting board
    Array.from(myCards.children).forEach((card) => {
      card.remove();
    });

    document.getElementById("game-over").style.display = "none";

    const pile = document.getElementById("pile");
    Array.from(pile.children).forEach((card) => {
      card.remove();
    });

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
        document.getElementById("rival-total-score").textContent =
          player.totalScore;

        document.querySelectorAll(".rival-card").forEach((card) => {
          card.remove();
        });

        for (let card = 0; card < player.cardsAmount; card++) {
          const rivalCard = createCard("gray_back");
          rivalCard.classList.add("rival-card");
          rivalCards.appendChild(rivalCard);
        }
      } else {
        document.getElementById("my-total-score").textContent =
          player.totalScore;
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
      disableActions(document.getElementById("control-action"), true);
      disableActions(document.getElementById("my-table"), true);
    } else {
      disableActions(document.getElementById("control-action"), false);
      disableActions(document.getElementById("my-table"), false);
    }
  });

  socket.on("onPlayerWin", ({ winner, state }) => {
    finishGame(state);
    document.getElementById("game-over").style.display = "block";
    const winnerBanner = document.getElementById("winner-banner");
    winnerBanner.innerText = `the winner is ${winner.name}`;
    winnerBanner.classList.remove("yaniv-win");
    winnerBanner.classList.add("yaniv-win");
  });

  socket.on("onAssaf", ({ winner, state }) => {
    finishGame(state);
    document.getElementById("game-over").style.display = "block";
    const winnerBanner = document.getElementById("winner-banner");
    winnerBanner.innerText = `assaf! the winner is ${winner.name}`;
    winnerBanner.classList.remove("yaniv-win");
    winnerBanner.classList.add("yaniv-win");
  });
};

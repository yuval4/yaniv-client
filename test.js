const cardsToNumber = new Map();

for (let cardIndex = 1; cardIndex <= 13; cardIndex++) {
    switch (cardIndex) {
        case 1:
            cardsToNumber.set(`AC`, cardIndex);
            cardsToNumber.set(`AD`, cardIndex);
            cardsToNumber.set(`AH`, cardIndex);
            cardsToNumber.set(`AS`, cardIndex);
            break;
        case 11:
            cardsToNumber.set(`JC`, cardIndex);
            cardsToNumber.set(`JD`, cardIndex);
            cardsToNumber.set(`JH`, cardIndex);
            cardsToNumber.set(`JS`, cardIndex);
            break;
        case 12:
            cardsToNumber.set(`QC`, cardIndex);
            cardsToNumber.set(`QD`, cardIndex);
            cardsToNumber.set(`QH`, cardIndex);
            cardsToNumber.set(`QS`, cardIndex);
            break;
        case 13:
            cardsToNumber.set(`KC`, cardIndex);
            cardsToNumber.set(`KD`, cardIndex);
            cardsToNumber.set(`KH`, cardIndex);
            cardsToNumber.set(`KS`, cardIndex);
            break;
        default:
            cardsToNumber.set(`${cardIndex}C`, cardIndex);
            cardsToNumber.set(`${cardIndex}D`, cardIndex);
            cardsToNumber.set(`${cardIndex}H`, cardIndex);
            cardsToNumber.set(`${cardIndex}S`, cardIndex);
            break;
    }
}

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

console.log(isStepValid(["8H", "7H", "9H"]));
console.log(isStepValid(["6H", "7H", "8H"]));
console.log(isStepValid(["6H", "7D", "8H"]));
console.log(isStepValid(["6H", "2H", "8H"]));
const joinRoom = (event) => {
    const form = document.forms["login"];
    console.log(event);
    event.preventDefault();
    window.location = `/yaniv-client/game.html?name=${form["name"].value}&code=${form[
        "code"
    ].value.toUpperCase()}`;
};

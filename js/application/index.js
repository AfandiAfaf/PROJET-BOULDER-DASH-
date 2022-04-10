if(window.localStorage.getItem('backup') !== null && JSON.parse(window.localStorage.getItem('backup')) != null) {
    document.getElementById("loadSavedGameB").style.display = "block";
}

function newGame() {
    if(window.localStorage.getItem('backup') !== null && JSON.parse(window.localStorage.getItem('backup')) != null) {
        let bool =confirm("DISMISS THE LAST LEVEL AND START A NEW ONE");
        if (bool == true) { 
            window.localStorage.setItem('loadSavedGame', 'false');
            window.location.href='html/game.html';
        }
    }
    else {
        window.localStorage.setItem('loadSavedGame', 'false');
        window.location.href='html/game.html';
    }
}

function loadSavedGame() {
    if(window.localStorage.getItem('backup') !== null && JSON.parse(window.localStorage.getItem('backup')) != null) 
    {
        window.localStorage.setItem('loadSavedGame', 'true');
        window.location.href='html/game.html';    
    }
    else { alert("FIRST START A NEW GAME"); }
}

document.getElementById("newGameB").addEventListener("click", newGame);
document.getElementById("loadSavedGameB").addEventListener("click", loadSavedGame);



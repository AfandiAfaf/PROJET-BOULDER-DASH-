import { PlayableMaps } from "../model/playable_maps.js";
import { MapController } from "../controller/map_controller.js";

export class Game {
    #controller;
    #loadSavedGame;
    #loadMapsList;

    constructor() {
        window.sessionStorage.setItem('win', 'false');
        this.#loadMapsList = (window.localStorage.getItem('mapsList') !== null || window.localStorage.getItem('mapsList') != null);
        this.#loadSavedGame = window.localStorage.getItem('loadSavedGame');
        this.#controller = new MapController();  
        this.#makeGame();
    }

    #makeGame() {
        if(this.#loadMapsList) { 
            this.#controller.mapsList.maps = JSON.parse(window.localStorage.getItem('mapsList'));
        }
        if(this.#loadSavedGame == 'true') { 
            this.#controller.mapsList.currentMapIndex = JSON.parse(window.localStorage.getItem('currentMapIndex'));
            this.#controller.loadGame(JSON.parse(window.localStorage.getItem('backup'))); 
        } else { 
            this.#controller.newGame(); 
            window.localStorage.setItem('loadSavedGame', 'true');
        }
    }

    saveGameInWeb() {
        if(window.sessionStorage.getItem('win') == 'true') { 
            this.#controller.mapsList.currentMapIndex = 0;
            window.localStorage.setItem('currentMapIndex', JSON.stringify(this.#controller.mapsList.currentMapIndex));
            window.localStorage.setItem('mapsList', JSON.stringify(this.#controller.mapsList.maps));
            window.localStorage.setItem('loadSavedGame', 'false');
            window.localStorage.removeItem('backup');
            return; 
        }
        window.localStorage.setItem('backup', JSON.stringify(this.#controller.map.saveGame()));
        window.localStorage.setItem('mapsList', JSON.stringify(this.#controller.mapsList.maps));
        window.localStorage.setItem('currentMapIndex', JSON.stringify(this.#controller.mapsList.currentMapIndex));
    }
    
    retry() {
        let bool =confirm("REPLAY THIS LEVEL?");
        if (bool == true) { this.#controller.retryLevel(); }
    }
}




function return_menu() {
    let bool =confirm("SAVE LEVEL AND GO BACK TO HOME PAGE?");
    if (bool == true) { window.location.href='../index.html'; }
}

 document.querySelector("#home").addEventListener("click", return_menu);

/**
 * when the page is completely loaded
 */
window.addEventListener("load", () => {
    const game = new Game();
    window.addEventListener('beforeunload', () => { game.saveGameInWeb(); });
    document.querySelector("#retry").addEventListener("click", () => { game.retry(); });
    
});

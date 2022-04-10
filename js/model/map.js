import { MapController } from "../controller/map_controller.js";
import { Coordinates } from "./coordinates.js";
import { Diamond } from "./diamond.js";
import { Dirt } from "./dirt.js";
import { DIRT, ROCK, DIAMOND, WALL, ROCKFORD } from "./generic_item.js";
import { Rock } from "./rock.js";
import { Rockford } from "./rockford.js";
import { Wall } from "./wall.js";
/*import { s_move, s_diamond } from "../view/soundPlayer.js";*/


export const MOVEUP = "move_up";
export const MOVEDOWN = "move_down";
export const MOVELEFT = "move_left";
export const MOVERIGHT = "move_right";
export const NOMOVE = "no_move";

export const T = 'T'; // Dirt
export const V = 'V'; // Void
export const R = 'R'; // Rock
export const RP = 'RP' // Rock with dead player 
export const BR = 'BR'; // Bloody Rock
export const BRP = 'BRP'; // Bloody Rock with dead player 
export const M = 'M'; // Wall
export const P = 'P'; // Player
export const PR = 'PR'; // Player moving Right
export const PL = 'PL'; // Player moving left
export const DP = 'DP'; // Dead Player (not under a rock)
export const D = 'D'; // Diamond



const refreshTime = 150;

export class Map {
    #controller;
    #name;
    #grid;
    #playerLoc;
    #update;
    #notReupdate;
    #nextUpdate;
    #updatePlanned;

    // remaining diamonds
    #rdiamond;
    // diamond collected
    #cdiamond;
    // movement counter
    #moveCount;

    #gameOver;
    #playerDead;
    #nextMove;

    #lastOrderNotNull;

    /**
     * Constructor
     * @param {any} mapController associated with the map
     */
    constructor(mapController) {
        this.#controller = mapController;
        Window.map = this;

        this.initiateMap();
    }


    get nextMove() { return this.#nextMove; }

    get lastOrderNotNull() { return this.#lastOrderNotNull; }

    get gameOver() { return this.#gameOver; }

    get controller() { return this.#controller;}
        

    initiateMap() {
        this.#update = [];
        this.#nextUpdate = [];
        this.#notReupdate = [];

        this.#updatePlanned = false;

        this.#name = "";
        this.#rdiamond = 0;
        this.#cdiamond = 0;
        this.#moveCount = 0;

        this.#gameOver = false;
        this.#playerDead = false;
        this.#nextMove = NOMOVE;
        this.#lastOrderNotNull = null;

        this.#initiateGrid();
    }

    #initiateGrid() {
        this.#grid = [];

        for (let y = 0; y < 16; ++y) {

            let line = [];

            for (let x = 0; x < 32; ++x) {
                line.push(null);
            }

            this.#grid.push(line);
        }
    }


    /**
     * Loads a game
     * @param {Dictionnary} data : data from a saved game, including layout of the map, gameOver, cDiamond and moveCount
     */
    loadGame(data) {
        this.#name = data.name;
        this.#gameOver = data.gameOver;
        this.#playerDead = data.playerDead;

        this.#cdiamond = data.cDiamond;
        this.#moveCount = data.moveCount;

        this.#placeItems(data.layout);

        if (this.#playerDead) this.#controller.gameOver();

        this.#updateController();
        setTimeout(() => { this.triggerUpdate() }, refreshTime * 4);
    }

    /**
     * Returns the current disposition and data
     * @return a dictionnary containing data from the game, including layout of the map, gameOver, cDiamond and moveCount
     */
    saveGame() {
        let data = {};

        data.gameOver = this.#gameOver;
        data.playerDead = this.#playerDead;

        data.cDiamond = this.#cdiamond;
        data.moveCount = this.#moveCount;

        data.name = this.#name;
        data.layout = this.#exportLayout();
        return data;
    }

    /**
     * Returns the current disposition
     * @return an array containing the current disposition of the map
     */
    #exportLayout() {
        let layout = [];

        for (let y = 0; y < 16; ++y) {
            let line = [];

            for (let x = 0; x < 32; ++x) {
                const VOID = "void";

                const item = this.#grid[y][x];
                let itemType = "";
                if (item == null) {
                    itemType = VOID;
                } else {
                    itemType = item.type;
                }

                switch (itemType) {
                    case WALL:
                        line.push(M);
                        break;
                    case DIAMOND:
                        line.push(D);
                        break;
                    case DIRT:
                        line.push(T);
                        break;
                    case ROCK:
                        if (this.#playerLoc.x == x && this.#playerLoc.y == y) {
                            if(item.bloody) { line.push(BRP); break; }
                            line.push(RP); break;
                        }
                        if (item.bloody) { line.push(BR); break; }
                        line.push(R);
                        break;
                    case VOID:
                        if (this.#playerDead && (this.#playerLoc.x == x) && (this.#playerLoc.y == y)) line.push(DP);
                        else line.push(V);
                        break;
                    case ROCKFORD:
                        if (this.#nextMove == NOMOVE) { line.push(P); break; }
                        if (this.#nextMove == MOVELEFT) { line.push(PL); break; }
                        line.push(PR);
                        break;
                }
            }
            layout.push(line);
        }
        return layout;
    }

    /**
     * Places the items on the map according to the given layout
     * @param {Array} layout : disposition of the items on the map
     */
    #placeItems(layout) {
        for (let y = 0; y < 16; ++y) {
            for (let x = 0; x < 32; ++x) {
                let itemType = layout[y][x];
                switch (itemType) {
                    case M:
                        this.#grid[y][x] = new Wall(this, new Coordinates({ x: x, y: y }));
                        break;
                    case D:
                        this.#grid[y][x] = new Diamond(this, new Coordinates({ x: x, y: y }));
                        ++this.#rdiamond;
                        break;
                    case T:
                        this.#grid[y][x] = new Dirt(this, new Coordinates({ x: x, y: y }));
                        break;
                    case R:
                        this.#grid[y][x] = new Rock(this, new Coordinates({ x: x, y: y }));
                        break;
                    case RP:
                        this.#grid[y][x] = new Rock(this, new Coordinates({ x: x, y: y }));
                        this.#playerLoc = new Coordinates({ x: x, y: y });
                        break;
                    case BR:
                        this.#grid[y][x] = new Rock(this, new Coordinates({ x: x, y: y }), true);
                        break;
                    case BRP:
                        this.#grid[y][x] = new Rock(this, new Coordinates({ x: x, y: y }), true);
                        this.#playerLoc = new Coordinates({ x: x, y: y });
                        break;
                    case V:
                        this.#grid[y][x] = null;
                        break;
                    case DP:
                        this.#grid[y][x] = null;
                        this.#playerLoc = new Coordinates({ x: x, y: y });
                        break;
                    case PR:
                    case PL:
                    case P:
                        this.#playerLoc = new Coordinates({ x: x, y: y });
                        this.#grid[y][x] = new Rockford(this, new Coordinates({ x: x, y: y }));
                        break;

                }
                let coord = new Coordinates({ x: x, y: y });
                if (!this.#includesCoordinates(this.#nextUpdate, coord)) this.#nextUpdate.push(coord);
            }
        }
    }

    /**
     * Modify the next move of Rockford according to player's order
     * @param {string} order : order given by player
     */
    playerOrder(order) {
        if (this.#gameOver) return;

        if (order == this.#nextMove) return;

        if (order != NOMOVE) {
            this.#nextMove = order;
            this.#lastOrderNotNull = order;
            this.triggerUpdate();
            return;
        }

        this.#nextMove = order;
        return;
    }

    #updateController() {
        let data = {};
        data.layout = this.#exportLayout();
        data.gameOver = this.#gameOver;
        data.cDiamond = this.#cdiamond;
        data.rDiamond = this.#rdiamond;
        data.moveCount = this.#moveCount;
        data.name = this.#name;
        this.#controller.notify(data);
    }

    #runUpdate() {
        let map = document.controller.map;
        if (!map.#updatePlanned) return;
        map.#updatePlanned = false;

        map.#update = map.#nextUpdate.map((x) => x);
        map.#nextUpdate = [];
        map.#notReupdate = [];

        // actual update

        if (map.lastOrderNotNull != null) {
            if (!map.#includesCoordinates(map.#update, map.#playerLoc)) map.#update.push(map.#playerLoc);
            map.#updatePlanned = true;
        }

        if (map.nextMove != NOMOVE) {
            if (!map.#includesCoordinates(map.#update, map.#playerLoc)) map.#update.push(map.#playerLoc);
            map.#updatePlanned = true;
        }

        for (let coord of map.#update) if (!(map.#grid[coord.y][coord.x] == null)) if (!map.#includesCoordinates(map.#notReupdate, coord)) map.#grid[coord.y][coord.x].update();

        // warns the controller of the update
        map.#updateController();

        map.#lastOrderNotNull = null;
        if (map.#updatePlanned) setTimeout(map.#runUpdate, refreshTime);
    }

    triggerUpdate() {
        if (!this.#updatePlanned) {
            this.#updatePlanned = true;
            this.#runUpdate();
        }
        else this.#updatePlanned = true;
    }

    /**
     * adds an item to nextUpdate
     * @param {Coordinates} coord : coordinates of the item to update
     */
    addToUpdate(coord) {
        if (!this.#includesCoordinates(this.#nextUpdate, coord)) this.#nextUpdate.push(coord);
        this.#updatePlanned = true;
    }


    /**
     * Checks if the given list includes the given coordinates
     * @param {any} list
     * @param {any} coorda
     */
    #includesCoordinates(list, coorda) {
        for (let coordb of list) if (coorda.x == coordb.x && coorda.y == coordb.y) return true;
        return false;
    }

    /**
     * adds neighbors of an item to nextUpdate
     * @param {Coordinates} coord : coordinates of the item to update
     */
    addNeighborsToUpdate(coord) {
        const coord_x = coord.x;
        const coord_y = coord.y;

        const lx = [1, 0, -1, 0];
        const ly = [0, 1, 0, -1];

        for (let n = 0; n < 4; ++n) {
            const neighbor = new Coordinates({ x: coord_x + lx[n], y: coord_y + ly[n] });
            if (this.isOnMap(neighbor)) this.addToUpdate(neighbor);
        }

    }

    /**
     * States weather or not a given coordinate is on the map
     * @param {Coordinates} coord coordinates to check
     * @returns true if coord is on the map, otherwise false
     */
    isOnMap(coord) { return coord.x >= 0 && coord.x < 32 && coord.y >= 0 && coord.y < 16; }

    /**
     * Returns the item type at the given coordinates
     * @param {Coordinates} coord coordinates to check
     * @returns item type
     */
    getItemType(coord) {
        if (this.#grid[coord.y][coord.x] == null) return null;
        return this.#grid[coord.y][coord.x].type;
    }

    /**
     * Moves an item from coordA to coordB
     * @param {Coordinates} coordA coordinates where is the item
     * @param {Coordinates} coordB coordinates where to move the item
     */
    moveItem(coordA, coordB) {
        coordA = new Coordinates({ x: coordA.x, y: coordA.y });

        this.#grid[coordB.y][coordB.x] = this.#grid[coordA.y][coordA.x];
        this.#grid[coordA.y][coordA.x] = null;
        this.#grid[coordB.y][coordB.x].coordinates = coordB;

        if (this.#includesCoordinates(this.#update, coordB)) {
            this.#notReupdate.push(coordB);
        }

        if (coordA.x == this.#playerLoc.x && coordA.y == this.#playerLoc.y && !this.#playerDead) {
            /*this.#controller.soundPlayer.playSound(s_move);*/
            this.#playerLoc = coordB;
            this.#addMovement();
        }
    }

    collectDiamond() {
        ++this.#cdiamond;
        --this.#rdiamond;

        /*this.#controller;*/
        
        if (this.#rdiamond == 0) {
            this.#gameOver = true;
            this.#controller.nextLevel()
        }
    }

    #addMovement() {
        ++this.#moveCount;
    }

   
    death() {
        this.#playerDead = true;
        this.#gameOver = true;
        this.#controller.gameOver();
    }

}

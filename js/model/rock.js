import { Coordinates } from "./coordinates.js";
import { Generic_item, ROCK, ROCKFORD } from "./generic_item.js";

export class Rock extends Generic_item {

    // is the item falling ?
    #falling = false;

    // is the rock bloody ?
    #bloody;

    /**
     * Constructor
     * @param {Map} map : map on which is placed the item
     * @param {Coordinates} coordinates : coordinates of the item on the map
     */
    constructor(map, coordinates, bloody=false) {
        super(ROCK, map, coordinates);

        this.#falling = false;
        this.#bloody = bloody;
    }

    get bloody() { return this.#bloody; };

    update() {
        const coordDown = this.coordinates.down();


        const downNeighbor = this.map.getItemType(coordDown);

        if (downNeighbor == null) {
            this.#falling = true;
            this.map.addNeighborsToUpdate(this.coordinates);
            this.map.moveItem(this.coordinates, coordDown);
            return
        }

        if (downNeighbor == ROCKFORD && this.#falling) {
            this.map.addNeighborsToUpdate(this.coordinates);
            this.map.moveItem(this.coordinates, coordDown);
            this.#bloody = true;
            this.map.death();
            return
        }


    }

}

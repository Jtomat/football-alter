import BasicController from "../../core/controllers/basic-controller";
import {Connection} from "typeorm";
import {PlayerInGridRepository} from "../../repositories/player-in-grid-repository";

export class PlayerInGridController extends BasicController<PlayerInGridRepository> {

    constructor(connection: Connection) {
        super(connection, PlayerInGridRepository, false);
        this.initDefault()
    }
}
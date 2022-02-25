import BasicController from "../../core/controllers/basic-controller";
import {PlayerRepository} from "../../repositories/player-repository";
import {Connection} from "typeorm";

export class PlayerController extends BasicController<PlayerRepository> {
    constructor(connection: Connection) {
        super(connection, PlayerRepository);
    }
}

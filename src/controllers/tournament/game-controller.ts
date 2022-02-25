import BasicController from "../../core/controllers/basic-controller";
import {GameRepository} from "../../repositories/game-repository";
import {Connection} from "typeorm";

export class GameController extends BasicController<GameRepository> {
    constructor(connection: Connection) {
        super(connection, GameRepository);
    }
}

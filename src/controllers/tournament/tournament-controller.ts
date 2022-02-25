import BasicController from "../../core/controllers/basic-controller";
import {TournamentRepository} from "../../repositories/tournament-repository";
import {Connection} from "typeorm";

export class TournamentController extends BasicController<TournamentRepository> {
    constructor(connection:Connection) {
        super(connection, TournamentRepository);
    }
}

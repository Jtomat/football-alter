import BasicController from "../../core/controllers/basic-controller";
import {TeamRepository} from "../../repositories/team-repository";
import {Connection} from "typeorm";

export class TeamController extends BasicController<TeamRepository> {
    constructor(connection:Connection) {
        super(connection, TeamRepository);
    }
}

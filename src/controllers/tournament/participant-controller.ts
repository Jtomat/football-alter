import BasicController from "../../core/controllers/basic-controller";
import {ParticipantRepository} from "../../repositories/participant-repository";
import {Connection} from "typeorm";

export class ParticipantController extends BasicController<ParticipantRepository> {
    constructor(connection: Connection) {
        super(connection, ParticipantRepository);
    }
}

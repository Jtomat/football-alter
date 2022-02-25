import BasicRepository from "../core/repositories/basic-repository";
import {Participant} from "../entities/participant";
import {EntityRepository} from "typeorm";

@EntityRepository(Participant)
export class ParticipantRepository extends BasicRepository<Participant> {
    _tableName = 'participant'
    _urlSegment = '/participant'
}

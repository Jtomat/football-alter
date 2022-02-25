import BasicRepository from "../core/repositories/basic-repository";
import {Tournament} from "../entities/tournament";
import {EntityRepository} from "typeorm";

@EntityRepository(Tournament)
export class TournamentRepository extends BasicRepository<Tournament> {
    _tableName = 'tournament'
    _urlSegment = '/tournaments'
}

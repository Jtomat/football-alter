import BasicRepository from "../core/repositories/basic-repository";
import {Team} from "../entities/team";
import {EntityRepository} from "typeorm";

@EntityRepository(Team)
export class TeamRepository extends BasicRepository<Team>{
    _tableName = 'team'
    _urlSegment = '/teams'
}

import BasicRepository from "../core/repositories/basic-repository";
import {PlayerInGrid} from "../entities/player-in-grid";
import {EntityRepository} from "typeorm";

@EntityRepository(PlayerInGrid)
export class PlayerInGridRepository extends BasicRepository<PlayerInGrid> {
    _tableName = 'ingame'
    _urlSegment = '/ingame'
}

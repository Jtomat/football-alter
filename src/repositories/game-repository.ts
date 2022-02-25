import BasicRepository from "../core/repositories/basic-repository";
import {Game} from "../entities/game";
import {EntityRepository} from "typeorm";

@EntityRepository(Game)
export class GameRepository extends BasicRepository<Game> {
    _tableName = 'game'
    _urlSegment = '/games'
}

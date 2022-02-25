import BasicRepository from "../core/repositories/basic-repository";
import {Player} from "../entities/player";
import {EntityRepository} from "typeorm";

@EntityRepository(Player)
export class PlayerRepository extends BasicRepository<Player> {
    _tableName = 'player'
    _urlSegment = '/player'
}

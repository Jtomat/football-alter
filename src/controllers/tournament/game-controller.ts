import BasicController from "../../core/controllers/basic-controller";
import {GameRepository} from "../../repositories/game-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {STAGE} from "../../entities/enums";
import {GET_ALL_PREFIX} from "../../core/shared/constants";
import BasicRepository from "../../core/repositories/basic-repository";
import {Participant} from "../../entities/participant";
import {Game} from "../../entities/game";

export class GameController extends BasicController<GameRepository> {
    constructor(connection: Connection) {
        super(connection, GameRepository, false);
        this.stagesGetAll = this.stagesGetAll.bind(this);
        this.router.get('/stages', this.stagesGetAll)
        this.initDefault()
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX) {
            entities = await (this._repository as BasicRepository<Game>)
                .find({where: {team: {id: req.params.keytournament}}})
        }
        else{
            entities = await (this._repository as BasicRepository<Game>).getAllEntities()
        }
        return res.json(entities);
    }

    async stagesGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(STAGE)
    }
}

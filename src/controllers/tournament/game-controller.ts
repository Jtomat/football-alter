import BasicController from "../../core/controllers/basic-controller";
import {GameRepository} from "../../repositories/game-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {STAGE} from "../../entities/enums";

export class GameController extends BasicController<GameRepository> {
    constructor(connection: Connection) {
        super(connection, GameRepository, false);
        this.stagesGetAll = this.stagesGetAll.bind(this);
        this.router.get('/stages', this.stagesGetAll)
        this.initDefault()
    }

    async stagesGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(STAGE)
    }
}

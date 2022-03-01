import BasicController from "../../core/controllers/basic-controller";
import {PlayerRepository} from "../../repositories/player-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import * as _ from "lodash";

// TODO: See example
export class PlayerController extends BasicController<PlayerRepository> {
    constructor(connection: Connection) {
        super(connection, PlayerRepository);
        // init custom method
        this.methodCustom = this.methodCustom.bind(this);
        this.router.get('/a/b', this.methodCustom)
    }

    // override example
    async methodGet(req: Request, res: Response, next: any): Promise<Response> {
        return res.json('1');
    }
    // custom method example
    async methodCustom(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json('Custom')
    }
}

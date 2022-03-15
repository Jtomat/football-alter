import BasicController from "../../core/controllers/basic-controller";
import {TournamentRepository} from "../../repositories/tournament-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import _ from "lodash";

export class TournamentController extends BasicController<TournamentRepository> {
    _repository: TournamentRepository;

    constructor(connection:Connection) {
        super(connection, TournamentRepository);
        this.methodGetCurrentStage = this.methodGetCurrentStage.bind(this);
        this.router.get(`/:${this.repositoryKey}/stage`, this.methodGetCurrentStage);
    }

    async methodGetCurrentStage(req: Request, res: Response, next: any): Promise<Response> {
        const id = Number(req.params[this.repositoryKey]);
        if(_.isNaN(id))
            res.status(500).send({message: "Invalid entity id."});
        return res.json(await this._repository.getCurrentStage(id));
    }

}

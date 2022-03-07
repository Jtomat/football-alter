import BasicController from "../../core/controllers/basic-controller";
import {TournamentRepository} from "../../repositories/tournament-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {GROUP, STAGE} from "../../entities/enums";
import {Game} from "../../entities/game";
import _ from "lodash";

export class TournamentController extends BasicController<TournamentRepository> {

    constructor(connection:Connection) {
        super(connection, TournamentRepository);
        this.methodGetCurrentStage = this.methodGetCurrentStage.bind(this);
        this.router.get(`/:${this.repositoryKey}/stage`, this.methodGetCurrentStage);
    } 

    async methodGetCurrentStage(req: Request, res: Response, next: any): Promise<Response> {
        const id = Number(req.params[this.repositoryKey]);
        if(_.isNaN(id))
            res.status(500).send({message: "Invalid entity id."});
        const tournament = await this._repository.getEntityWithRelations(id);
        const stageStatus = {};
        Object.keys(STAGE).forEach(stage=> {
            let source: Array<Game> = [];
            if (stage != 'GROUP_STAGE')
                source = tournament['games'][stage] as Game[];
            else
                Object.keys(GROUP).forEach(group => {
                    source = source.concat(tournament['games'][stage][group] as Game[]);
                })
            stageStatus[STAGE[stage]] = _.isEmpty(source.filter(i => !i.finished)) && !_.isEmpty(source)
        });
        return res.json(stageStatus);
    }

}

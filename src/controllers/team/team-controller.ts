import BasicController from "../../core/controllers/basic-controller";
import {TeamRepository} from "../../repositories/team-repository";
import {Connection, Like} from "typeorm";
import {Request, Response} from "express";
import {REGION} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Team} from "../../entities/team";

export class TeamController extends BasicController<TeamRepository> {
    constructor(connection:Connection) {
        super(connection, TeamRepository, false);

        this.regionsGetAll = this.regionsGetAll.bind(this);
        this.getTeamByRegion = this.getTeamByRegion.bind(this);
        this.getTeamByName = this.getTeamByName.bind(this);
        this.router.get('/regions', this.regionsGetAll)
        this.router.get('/regions/:key', this.getTeamByRegion)
        this.router.get('/names/:key', this.getTeamByName)
        this.initDefault()
    }

    async regionsGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(REGION)
    }

    async getTeamByRegion(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }
        const entity = await (this._repository as BasicRepository<Team>).find({where: {region: key},
            order:{name: "ASC"}});
        if(!entity) {
            res.status(404).send({message:"Entity with such region doesn't found."});
        }
        return  res.json(entity)
    }

    async getTeamByName(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }
        let entity = await (this._repository as BasicRepository<Team>).find({where:
                {name: Like("%"+key+"%")}, order:{name: "ASC"}});

        if(!entity) {
            res.status(404).send({message:"Entity with such name doesn't found."});
        }
        return  res.json(entity)
    }
}

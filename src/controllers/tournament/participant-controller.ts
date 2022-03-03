import BasicController from "../../core/controllers/basic-controller";
import {ParticipantRepository} from "../../repositories/participant-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {GROUP} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Participant} from "../../entities/participant";
import {Player} from "../../entities/player";
import {GET_ALL_PREFIX} from "../../core/shared/constants";

export class ParticipantController extends BasicController<ParticipantRepository> {
    constructor(connection: Connection) {
        super(connection, ParticipantRepository, false);
        this.groupsGetAll = this.groupsGetAll.bind(this);
        this.participantByGroup = this.participantByGroup.bind(this)
        this.getParticipantShortname = this.getParticipantShortname.bind(this)
        this.router.get('/groups', this.groupsGetAll)
        this.router.get('/groups/:key', this.participantByGroup)
        this.router.get(`/:${this.repositoryKey}/shortname/`, this.getParticipantShortname)
        this.initDefault()
    }

    async groupsGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(GROUP)
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX) {
            entities = await (this._repository as BasicRepository<Participant>)
                .find({where: {team: {id: req.params.keytournament}}})
        }
        else{
            entities = await (this._repository as BasicRepository<Participant>).getAllEntities()
        }

        return res.json(entities);
    }

    // Надо будет проверить, как работает
    async participantByGroup(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }
        const entity = await (this._repository as BasicRepository<Participant>).find({where: {group: key},
            order:{id: "ASC"}});

        if(!entity) {
            res.status(404).send({message:"Entity with such region doesn't found."});
        }

        let result = []
        let i = 1
        entity.forEach(value => {
            result.push({
                id: value.id,
                shortname: String(value.group) +  String(i),
                tournament: value.tournament,
                team: value.team,
                group: value.group,
                asGuest: value.asGuest,
                asHome: value.asHome});
            i++
        })

        return  res.json(result)
    }

    async getParticipantShortname(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params[this.repositoryKey]);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }

        const entity = await (this._repository as BasicRepository<Participant>).findOne({where: {id: key}});

        const entities = await (this._repository as BasicRepository<Participant>).find(
            {where: {group: entity.group}});

        const num = entities.findIndex((value, index) => {if (value === entity) {return index + 1}});

        const result = {shortname: String(entity.group) + String(num), participant: entity};

        return  res.json(result)
    }

    // на фронте?
    // async participantsChangePlaceWithinGroup(req: Request, res: Response, next: any): Promise<Response> {
    //    return
    // }
}

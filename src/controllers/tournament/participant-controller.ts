import BasicController from "../../core/controllers/basic-controller";
import {ParticipantRepository} from "../../repositories/participant-repository";
import {Connection} from "typeorm";
import { Request, Response} from "express";
import {GROUP} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Participant} from "../../entities/participant";
import { GET_ALL_PREFIX, shuffleArray} from "../../core/shared/constants";
import {GameController} from "./game-controller"
import _ from "lodash";
import {Team} from "../../entities/team";
import {Tournament} from "../../entities/tournament";

export class ParticipantController extends BasicController<ParticipantRepository> {
    _repository: ParticipantRepository;

    constructor(connection: Connection) {
        super(connection, ParticipantRepository, false);
        this.groupsGetAll = this.groupsGetAll.bind(this);
        this.participantByGroup = this.participantByGroup.bind(this)
        this.getParticipantShortname = this.getParticipantShortname.bind(this)
        this.getTeamsAllocated = this.getTeamsAllocated.bind(this)
        this.getRandomAllocation = this.getRandomAllocation.bind(this)
        this.getParticipantPoints = this.getParticipantPoints.bind(this)
        this.getParticipantsComparison = this.getParticipantsComparison.bind(this)
        this.getParticipantsInGroupComparison = this.getParticipantsInGroupComparison.bind(this)
        this.router.get('/groups', this.groupsGetAll)
        this.router.get('/groups/:key', this.participantByGroup)
        this.router.get(`/:${this.repositoryKey}/shortname/`, this.getParticipantShortname)
        this.router.get('/allocated', this.getTeamsAllocated)
        this.router.get('/randomAllocation', this.getRandomAllocation)
        this.router.get('/comparison', this.getParticipantsComparison) // Проверить // JTomat - Заменил с ключей на query params
        this.router.get('/inGroupComparison/:key', this.getParticipantsInGroupComparison) // Проверить
        this.initDefault()
    }

    async groupsGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return res.json(GROUP)
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX) {
            entities = await this._repository
                .find({where: {tournament: {id: req.params.keytournament}}})
        } else {
            entities = await this._repository.getAllEntities()
        }
        return res.json(entities);
    }

    async participantByGroup(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }
        let entity = []
        if (req.params.keytournament != GET_ALL_PREFIX)
            entity = await this._repository.find({
                where: {
                    group: key,
                    tournament: {id: req.params.keytournament}
                },
                order: {id: "ASC"}
            });
        else {
            entity = await this._repository.find({
                where: {
                    group: key,
                },
                order: {id: "ASC"}
            });
        }
        if (!entity) {
            res.status(404).send({message: "Entity with such group doesn't found."});
        }

        let result = []
        entity.forEach((value, index) => {
            result.push({
                id: value.id,
                shortname: String(value.group) + String(index + 1),
                tournament: value.tournament,
                team: value.team,
                group: value.group,
                asGuest: value.asGuest,
                asHome: value.asHome
            });
        })

        return res.json(result)
    }

    async getParticipantShortname(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params[this.repositoryKey]);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }

        const entity = await this._repository.findOne({where: {id: key}});
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX)
            entities = await this._repository.find(
                {where: {group: entity.group, tournament: {id: req.params.keytournament}}});
        else {
            res.status(500).send({message: "Invalid tournament id."});
            return
        }
        const num = entities.findIndex((value, index) => {
            if (value === entity) {
                return index + 1
            }
        });

        const result = {shortname: String(entity.group) + String(num), participant: entity};

        return res.json(result)
    }


    async getTeamsAllocated(req: Request, res: Response, next: any): Promise<Response> {
        if (req.params.keytournament != GET_ALL_PREFIX) {
            let allocCount = 0
            for (let i in GROUP) {
                const entity = await (this._repository as BasicRepository<Participant>).find({
                    where:
                        {
                            group: i,
                            tournament: {id: req.params.keytournament}
                        },
                    order: {id: "ASC"}
                });
                if (entity?.length === 4) {
                    allocCount += 1
                }
            }
            if (allocCount === 6) //- в каждой группе есть 4 команды, все заполнено.
            {
                await (new GameController(this._repository.manager.connection)).createGroupGames(req)
                return res.json({message: "Yes"});
            }
        } else {
            return res.status(404).send({message: "Entity with such tournamentId doesn't found."});
        }

        return res.json({message: "No"});
    }

    async getRandomAllocation(req: Request, res: Response, next: any): Promise<Response> {
        if (req.params.keytournament != GET_ALL_PREFIX) {
            let entities = await this._repository
                .find({where: {tournament: {id: req.params.keytournament}}})
            let indexes = []
            entities.forEach(val => {
                indexes.push(val.id)
            })
            indexes = shuffleArray(indexes)
            let k = 0;
            for (let i in GROUP) {
                let g = k;
                while (g < k + 4) {
                    entities.find(val => val.id === indexes[g]).group = GROUP[i];
                    g++
                }
                k = k + 4;
            }
            return res.json(entities)
        } else {
            return res.status(404).send({message: "Неверный запрос"});
        }
    }

    // функция подсчета очков участника за игры в турнире
    async getParticipantPoints(req: Request, res: Response, next: any): Promise<Response> {
        const key = Number(req.params.key);
        if (!key || req.params.keytournament == GET_ALL_PREFIX) {
            return res.status(500).send({message: "Invalid entity id."});
        }
        let entity = await this._repository
            .findOne({where: {id: key}})
        const points = await this._repository.calculateScore(entity)
        return res.json(points)
    }

    async getParticipantsComparison(req: Request, res: Response, next: any): Promise<Response> {
        const key1 = Number(req.query.key1);
        const key2 = Number(req.query.key2);
        if (!key1 || !key2 || req.params.keytournament == GET_ALL_PREFIX) {
            return res.status(500).send({message: "Invalid entity id."});
        }
        let participant1 = await this._repository
            .findOne({where: {id: key1}})
        let participant2 = await this._repository
            .findOne({where: {id: key2}})
        return res.json(await this._repository.participantsComparison(participant1, participant2))
    }

    async methodPost(req:Request, res:Response, next:any): Promise<Response>{
        req.body.tournament = await this._repository.manager.findOne(Tournament,{where:{id:req.params.keytournament}})
        if(!req.body.team)
            req.body.team = await this._repository.manager.findOne(Team,{where:{id:req.body.teamId}})
        return super.methodPost(req, res, next)
    }

    async getParticipantsInGroupComparison(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        if (!key || req.params.keytournament == GET_ALL_PREFIX) {
            return res.status(500).send({message: "Invalid entity id."});
        }
        let participants = await this._repository.find({
            relations:['asGuest','asHome'],
            where: {
                group: key,
                tournament: {id: req.params.keytournament}
            }
        })
        return res.json(_.sortedUniq(participants, async (a,b)=> await this._repository.participantsComparison(a,b)));
    }
}

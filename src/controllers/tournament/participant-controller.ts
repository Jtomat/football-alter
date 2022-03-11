import BasicController from "../../core/controllers/basic-controller";
import {ParticipantRepository} from "../../repositories/participant-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {GROUP} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Participant} from "../../entities/participant";
import {GET_ALL_PREFIX} from "../../core/shared/constants";
import {GameController} from "./game-controller";
import {randomInt} from "crypto";

export class ParticipantController extends BasicController<ParticipantRepository> {
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
        this.router.get('/randomAllocation',this.getRandomAllocation)
        this.router.get('/participantsComparison/:key1,key2',this.getParticipantsComparison) // Проверить
        this.router.get('/participantsInGroupComparison/:key',this.getParticipantsInGroupComparison) // Проверить
        this.initDefault()
    }

    async groupsGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(GROUP)
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX) {
            entities = await (this._repository as BasicRepository<Participant>)
                .find({where: {tournament: {id: req.params.keytournament}}})
        }
        else{
            entities = await (this._repository as BasicRepository<Participant>).getAllEntities()
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
         entity = await (this._repository as BasicRepository<Participant>).find({where: {group: key,
                tournament: {id: req.params.keytournament}},
            order:{id: "ASC"}});
        else
        {
            entity = await (this._repository as BasicRepository<Participant>).find({where: {group: key,
                    },
                order:{id: "ASC"}});
        }
        if(!entity) {
            res.status(404).send({message:"Entity with such group doesn't found."});
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
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX)
            entities = await (this._repository as BasicRepository<Participant>).find(
            {where: {group: entity.group, tournament: {id: req.params.keytournament}}});
        else
        {
            res.status(500).send({message: "Invalid tournament id."});
            return
        }
        const num = entities.findIndex((value, index) => {if (value === entity) {return index + 1}});

        const result = {shortname: String(entity.group) + String(num), participant: entity};

        return  res.json(result)
    }


    async getTeamsAllocated(req: Request, res: Response, next: any): Promise<Response> {
        if (req.params.keytournament != GET_ALL_PREFIX) {
            let allocCount = 0
            for(let i in GROUP)
            {
                const entity = await (this._repository as BasicRepository<Participant>).find({where:
                        {group: i,
                        tournament: {id: req.params.keytournament}},
                    order:{id: "ASC"}});
            if(entity?.length === 4)
                {
                    allocCount += 1
                }
            }
            if(allocCount === 6) //- в каждой группе есть 4 команды, все заполнено.
            {
                await (new GameController(this._repository.manager.connection)).createGroupGames(req)
                return res.json({message:"Yes"});
            }
        }
        else{
            return res.status(404).send({message:"Entity with such tournamentId doesn't found."});
        }

        return res.status(404).send({message:"No"});
    }

    shuffle(array){
        let i = array.length,
            j = 0,
            temp;
        while (i--){
            j = Math.floor(Math.random() * (i+1));

            // swap randomly chosen element with current element
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    async getRandomAllocation(req: Request, res: Response, next: any): Promise<Response> {
        if (req.params.keytournament != GET_ALL_PREFIX) {
            let entities = await (this._repository as BasicRepository<Participant>)
                .find({where: {tournament: {id: req.params.keytournament}}})
            let indexes = []
            entities.forEach(val => {
                indexes.push(val.id)
            })
            indexes = this.shuffle(indexes)
            let k = 0;
            for(let i in GROUP)
            {
                let g = k;
                while(g < k + 4){
                    entities.find(val => val.id === indexes[g]).group = GROUP[i];
                    g++
                }
                k = k+4;
            }
            return res.json(entities)
        }
        else
        {
            return res.status(404).send({message:"Неверный запрос"});
        }
    }

    async participantPoints(participant: Participant) : Promise<number>
    {
        let points = 0
        participant.asHome.forEach(val => {
            if(val.homeTeam == val.guestTeam){
                points += 1
            }
            if(val.homeTeam > val.guestTeam){
                points += 3
            }
        })
        participant.asGuest.forEach(val => {
            if(val.homeTeam == val.guestTeam){
                points += 1
            }
            if(val.homeTeam < val.guestTeam){
                points += 3
            }
        })
        return points
    }

    // функция подсчета очков участника за игры в турнире
    async getParticipantPoints(req: Request, res: Response, next: any): Promise<Response> {
        const key = Number(req.params.key);
        if (!key || req.params.keytournament == GET_ALL_PREFIX) {
            return res.status(500).send({message: "Invalid entity id."});
        }
        let entity = await (this._repository as BasicRepository<Participant>)
            .findOne({where: {id: key}})
        const points = this.participantPoints(entity)
        return res.json(points)
    }

    async getParticipantsComparison(req: Request, res: Response, next: any): Promise<Response> {
        const key1 = Number(req.params.key1);
        const key2 = Number(req.params.key2);
        if (!key1 ||!key2 || req.params.keytournament == GET_ALL_PREFIX) {
            return res.status(500).send({message: "Invalid entity id."});
        }
        let participant1 = await (this._repository as BasicRepository<Participant>)
            .findOne({where: {id: key1}})
        let participant2 = await (this._repository as BasicRepository<Participant>)
            .findOne({where: {id: key1}})
        return res.json(await this.participantsComparison(participant1, participant2))
    }

    async getParticipantsInGroupComparison(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        if (!key || req.params.keytournament == GET_ALL_PREFIX) {
            return res.status(500).send({message: "Invalid entity id."});
        }
        let participants = await (this._repository as BasicRepository<Participant>)
            .find({where: {group: key, tournament: {id: req.params.keytournament}}})
        return res.json(participants.sort((a, b) =>this.participantsComparison(a, b)))
    }

    // функция сравнения счета двух участников, для ранжирования
    participantsComparison(participant1: Participant, participant2: Participant): number
    {
        console.log(this.participantPoints(participant1), " : ", this.participantPoints(participant2)) // проверить и убрать

        if(this.participantPoints(participant1) == this.participantPoints(participant2)){
            let goalsScored1 = 0
            let goalsScored2 = 0
            let goalsConceded1 = 0
            let goalsConceded2 = 0
            participant1.asGuest.forEach(value => {
                goalsScored1 += value.guestTeamResult
                goalsConceded1 += value.homeTeamResult
            })
            participant1.asHome.forEach(value => {
                goalsScored1 += value.homeTeamResult
                goalsConceded1 += value.guestTeamResult
            })
            participant2.asGuest.forEach(value => {
                goalsScored2 += value.guestTeamResult
                goalsConceded2 += value.homeTeamResult
            })
            participant2.asHome.forEach(value => {
                goalsScored2 += value.homeTeamResult
                goalsConceded2 += value.guestTeamResult
            })
            if(goalsScored1 - goalsConceded1 == goalsScored2 - goalsConceded2){
                if(goalsScored1 == goalsScored2){
                    let rnd = randomInt(100)
                    if(rnd % 2 == 0){
                        return 1
                    }
                    else{
                        return -1
                    }
                }
                else if(goalsScored1 > goalsScored2){
                    return 1
                }
                else{
                    return -1
                }
            }
            else if(goalsScored1 - goalsConceded1 > goalsScored2 - goalsConceded2){
                return 1
            }
            else{
                return -1
            }
        }
        else if(this.participantPoints(participant1) > this.participantPoints(participant2)){
            return 1
        }
        else{
            return -1
        }
    }
}

import BasicController from "../../core/controllers/basic-controller";
import {GameRepository} from "../../repositories/game-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {EVENT, GROUP, STAGE} from "../../entities/enums";
import {GET_ALL_PREFIX} from "../../core/shared/constants";
import BasicRepository from "../../core/repositories/basic-repository";
import {Game} from "../../entities/game";
import {Participant} from "../../entities/participant";

export class GameController extends BasicController<GameRepository> {
    _repository:GameRepository;
    constructor(connection: Connection) {
        super(connection, GameRepository, false);
        this.stagesGetAll = this.stagesGetAll.bind(this);
        this.getAllOfStage = this.getAllOfStage.bind(this);
        this.createGroupGames = this.createGroupGames.bind(this)
        this.eventsTypes = this.eventsTypes.bind(this)
        this.router.get('/stages', this.stagesGetAll);
        this.router.get('/stages/:stage', this.getAllOfStage);
        this.router.get('/eventsTypes', this.eventsTypes)
        this.initDefault()
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX) {
            entities = await (this._repository as BasicRepository<Game>)
                .find({
                    relations: ['guestTeam', 'guestTeam.tournament'],
                    where: {guestTeam: {tournament: {id: req.params.keytournament}}}
                })
        } else {

            entities = await (this._repository as BasicRepository<Game>).getAllEntities()
        }
        return res.json(entities);
    }

    async createGroupGames(req: Request,) {
        const games = await (this._repository as BasicRepository<Game>)
            .find({
                relations: ['guestTeam', 'guestTeam.tournament'],
                where: {guestTeam: {tournament: {id: req.params.keytournament}}}
            })
        if (games.length !== 36)
            for (let i in GROUP) {
                let participants = await this._repository.manager.find(Participant,{
                    where: {
                        tournament:
                            {id: req.params.keytournament}, group: i
                    }
                })
                let entity1 = new Game();
                entity1.homeTeam = participants[0]
                entity1.guestTeam = participants[1]
                entity1.stage = STAGE.GROUP_STAGE
                await this._repository.assignPlayers(entity1);
                await this._repository.saveEntity(entity1)

                let entity2 = new Game();
                entity2.homeTeam = participants[2]
                entity2.guestTeam = participants[3]
                entity2.stage = STAGE.GROUP_STAGE
                await this._repository.assignPlayers(entity2);
                await this._repository.saveEntity(entity2)

                let entity3 = new Game();
                entity3.homeTeam = participants[1]
                entity3.guestTeam = participants[3]
                entity3.stage = STAGE.GROUP_STAGE
                await this._repository.assignPlayers(entity3);
                await this._repository.saveEntity(entity3)

                let entity4 = new Game();
                entity4.homeTeam = participants[0]
                entity4.guestTeam = participants[2]
                entity4.stage = STAGE.GROUP_STAGE
                await this._repository.assignPlayers(entity4);
                await this._repository.saveEntity(entity4)

                let entity5 = new Game();
                entity5.homeTeam = participants[3]
                entity5.guestTeam = participants[0]
                entity5.stage = STAGE.GROUP_STAGE
                await this._repository.assignPlayers(entity5);
                await this._repository.saveEntity(entity5)

                let entity6 = new Game();
                entity6.homeTeam = participants[1]
                entity6.guestTeam = participants[2]
                entity6.stage = STAGE.GROUP_STAGE
                await this._repository.assignPlayers(entity6);
                await this._repository.saveEntity(entity6)
            }
    }

    async getAllOfStage(req: Request, res: Response, next: any): Promise<Response> {
        const currentStage = req.params.stage;
        const tournament = req.params.keytournament;
        const games = await this._repository.find({relations:['homeTeam','homeTeam.tournament',
                'guestTeam','guestTeam.tournament','events'], where: {homeTeam:{tournament:{id:tournament}}, stage:currentStage}})
        return res.json(games);
    }

    async methodPost(req:Request, res:Response, next:any): Promise<Response>{
        req.body.homeTeam = await this._repository.manager.findOne(Participant,{where:{id:req.body.homeTeamId}})
        req.body.guestTeam = await this._repository.manager.findOne(Participant,{where:{id:req.body.guestTeamId}})
        return super.methodPost(req, res, next)
    }

    async stagesGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return res.json(STAGE)
    }

    async eventsTypes(req: Request, res: Response, next: any): Promise<Response> {
        return res.json(EVENT)
    }
}


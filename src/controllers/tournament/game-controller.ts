import BasicController from "../../core/controllers/basic-controller";
import {GameRepository} from "../../repositories/game-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {GROUP, STAGE} from "../../entities/enums";
import {GET_ALL_PREFIX} from "../../core/shared/constants";
import BasicRepository from "../../core/repositories/basic-repository";
import {Participant} from "../../entities/participant";
import {Game} from "../../entities/game";
import {TeamRepository} from "../../repositories/team-repository";
import {ParticipantRepository} from "../../repositories/participant-repository";

export class GameController extends BasicController<GameRepository> {
    protected participantRepository: ParticipantRepository;
    constructor(connection: Connection) {
        super(connection, GameRepository, false);
        this.participantRepository = connection.getCustomRepository(ParticipantRepository);
        this.stagesGetAll = this.stagesGetAll.bind(this);
        this.createGroupGames = this.createGroupGames.bind(this)
        this.router.get('/stages', this.stagesGetAll)
        this.initDefault()
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX) {
            entities = await (this._repository as BasicRepository<Game>)
                .find({relations:['guestTeam', 'guestTeam.tournament'], where: {tournament: {id: req.params.keytournament}}})
        }
        else{

            entities = await (this._repository as BasicRepository<Game>).getAllEntities()
        }
        return res.json(entities);
    }

    async createGroupGames(req: Request,) {
        const games = await (this._repository as BasicRepository<Game>)
            .find({relations:['guestTeam', 'guestTeam.tournament'],where: {guestTeam: { tournament: {id: req.params.keytournament}}}})
        if(games.length !== 36)
        for(let i in GROUP)
        {
            let participants = await this.participantRepository.find({where: {tournament:
                        {id: req.params.keytournament}, group:i}})
            let entity1 = new Game();
            entity1.homeTeam = participants[0]
            entity1.guestTeam = participants[1]
            entity1.stage = STAGE.GROUP_STAGE
            await this._repository.saveEntity(entity1)

            let entity2 = new Game();
            entity2.homeTeam = participants[2]
            entity2.guestTeam = participants[3]
            entity2.stage = STAGE.GROUP_STAGE
            await this._repository.saveEntity(entity2)

            let entity3 = new Game();
            entity3.homeTeam = participants[1]
            entity3.guestTeam = participants[3]
            entity3.stage = STAGE.GROUP_STAGE
            await this._repository.saveEntity(entity3)

            let entity4 = new Game();
            entity4.homeTeam = participants[0]
            entity4.guestTeam = participants[2]
            entity4.stage = STAGE.GROUP_STAGE
            await this._repository.saveEntity(entity4)

            let entity5 = new Game();
           entity5.homeTeam = participants[3]
            entity5.guestTeam = participants[0]
            entity5.stage = STAGE.GROUP_STAGE
            await this._repository.saveEntity(entity5)

            let entity6 = new Game();
            entity6.homeTeam = participants[1]
            entity6.guestTeam = participants[2]
            entity6.stage = STAGE.GROUP_STAGE
            await this._repository.saveEntity(entity6)
        }
    }

    async stagesGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(STAGE)
    }

    // Функция на нахождение кто победил в игре

}

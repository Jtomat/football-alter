import BasicController from "../../core/controllers/basic-controller";
import {EventRepository} from "../../repositories/event-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {GET_ALL_PREFIX} from "../../core/shared/constants";
import BasicRepository from "../../core/repositories/basic-repository";
import {GameRepository} from "../../repositories/game-repository";
import {Event} from "../../entities/event";
import {Game} from "../../entities/game";

export class EventController extends BasicController<EventRepository> {
    protected gameRepository: GameRepository;
    constructor(connection: Connection) {
        super(connection, EventRepository, false);
        this.gameRepository = connection.getCustomRepository(GameRepository);
        this.methodGetByGame = this.methodGetByGame.bind(this)
        this.router.get('/byGame/:key', this.methodGetByGame)
        this.initDefault()
    }

    async methodGetByGame(req: Request, res: Response, next: any): Promise<Response> {
        const key = String(req.params.key);
        let entities = []
        if (req.params.keytournament != GET_ALL_PREFIX && key != '') {
            let entity = await (this.gameRepository as BasicRepository<Game>).findOne({relations:['guestTeam',
                    'guestTeam.tournament'], where: {guestTeam: { tournament: {id: req.params.keytournament}}, id:key}})
            if(entity) {
                entities = await (this._repository as BasicRepository<Event>)
                    .find({where: {game: {id: key}}})
            }
            else{
                return res.status(404).send({message: "В этом соревновании нет игры с таким ID"});
            }
        }
        else if(key != ''){
            entities = await (this._repository as BasicRepository<Event>).find({where: {game: {id:key}}})
        }
        else{
            entities = await (this._repository as BasicRepository<Event>).getAllEntities()
        }
        return res.json(entities);
    }

    async methodPost(req:Request, res:Response, next:any): Promise<Response>{
        req.body.game = await this._repository.manager.findOne(Game,{where:{id:req.params.keygame}})
        return super.methodPost(req, res, next)
    }
}

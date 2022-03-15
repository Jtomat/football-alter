import BasicController from "../../core/controllers/basic-controller";
import {PlayerRepository} from "../../repositories/player-repository";
import {Connection} from "typeorm";
import {Request, Response} from "express";
import {TeamRepository} from "../../repositories/team-repository";
import {POSITION} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Player} from "../../entities/player";
import {GET_ALL_PREFIX} from "../../core/shared/constants";
import {Team} from "../../entities/team";

// TODO: See example
export class PlayerController extends BasicController<PlayerRepository> {
    protected teamRepository: TeamRepository;
    constructor(connection: Connection) {
        super(connection, PlayerRepository, false);
        this.teamRepository = connection.getCustomRepository(TeamRepository);

        this.positionsGetAll = this.positionsGetAll.bind(this);
        this.getAllSorted = this.getAllSorted.bind(this);
        this.router.get('/positions', this.positionsGetAll)
        this.router.get('/sorted', this.getAllSorted)
        this.initDefault()
    }


    async positionsGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(POSITION)
    }

    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let entities = []
        if (req.params.keyteam != GET_ALL_PREFIX) {
            entities = await (this._repository as BasicRepository<Player>)
                .find({where: {team: {id: req.params.keyteam}}})
        }
        else{
            entities = await (this._repository as BasicRepository<Player>).getAllEntities()
        }

        return res.json(entities);
    }

    async getAllSorted(req: Request, res: Response, next: any): Promise<Response> {
        const entity = await (this._repository as BasicRepository<Player>).find({
            order:{number: "ASC"}});
        if(!entity) {
            res.status(404).send({message:"Entity with such region doesn't found."});
        }
        return  res.json(entity)
    }

    async methodPost(req:Request, res:Response, next:any): Promise<Response>{
        req.body.team = await this._repository.manager.findOne(Team,{where:{id:req.params.keyteam}})
        return super.methodPost(req, res, next)
    }


    // override example
    // async methodGet(req: Request, res: Response, next: any): Promise<Response> {
    //     return res.json('1');
    // }

    // custom method example
    // async methodCustom(req: Request, res: Response, next: any): Promise<Response> {
    //     return  res.json('Custom')
    // }
}

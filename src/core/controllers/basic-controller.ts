import {Request, Response, Router} from "express";
import BasicRepository from "../repositories/basic-repository";
import * as _ from "lodash";
import {DTO} from "../models/dto";
import {Filter, Pager} from "../shared/constants";
import {Connection, ObjectType} from "typeorm";

/** Basic controller class to use BasicRepository */
export default class BasicController<T extends BasicRepository<DTO>> {

    /** BasicRepository to execute DB commands */
    protected _repository: BasicRepository<DTO>;
    /** Special url path to use instead repositories's one */
    protected _path: string;
    /** Router which contains all routes of controller */
    protected _router = Router({mergeParams: true});
    /** Getter for router which contains all routes of controller */
    get router() {
        return this._router;
    }
    /** Actual url path for controller */
    get path(): string {
        return this._path ?? this._repository.urlSegment;
    }
    /** Controller key name in router */
    get repositoryKey() {
        return 'key'+this._repository.tableName;
    }

    /**
     * @param connection - current {@link Connection connection} to database
     * @param repository - ObjectType of selected {@link BasicRepository}
     * @param initDefault - flag, when true, initialize register default methods in router
     * */
    constructor(connection: Connection, repository: ObjectType<BasicRepository<DTO>>, initDefault: boolean = true) {
        this._repository = connection.getCustomRepository(repository);
        if(initDefault){
            this.initDefault();
        }
    }

    /** Initial default methods in router */
    protected initDefault(): void{
        this.methodPost = this.methodPost.bind(this);
        this.methodGetAll = this.methodGetAll.bind(this);
        this.methodGet = this.methodGet.bind(this);
        this.methodPost = this.methodPost.bind(this);
        this.methodPut = this.methodPut.bind(this);
        this.methodDelete = this.methodDelete.bind(this);

        this._router.get('/', this.methodGetAll);
        this._router.post('/', this.methodPost);
        this._router.get('/:'+this.repositoryKey, this.methodGet);
        this._router.put('/:'+this.repositoryKey, this.methodPut);
        this._router.delete('/:'+this.repositoryKey, this.methodDelete);
    }

    /** Basic method of get by id */
    async methodGet(req: Request, res: Response, next: any): Promise<Response> {
        const id = Number(req.params[this.repositoryKey]);
        if (_.isNaN(id)) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }
        const entity = await this._repository.getEntityWithRelations(id) //getEntity(id);
        if(!entity) {
            res.status(404).send({message:"Entity with such id doesn't found."});
        }
        return res.json(entity);
    }
    /** Basic method of get all */
    async methodGetAll(req: Request, res: Response, next: any): Promise<Response> {
        let filter:Filter = req.query.filter ? JSON.parse(req.query.filter?.toString()) : null;
        let pageFilter: Pager = null;
        if (req.query.page && req.query.size) {
            const pager:Pager = {page: Number(req.query.page), size: Number(req.query.size)}
            if(!_.isNaN(pager.page)&&!_.isNaN(pager.size))
                pageFilter = pager;
        }
        const entity = await this._repository.getAllEntities(filter, pageFilter);
        return res.json(entity);
    }
    /** Basic method of delete by id */
    async methodDelete(req: Request, res: Response, next: any): Promise<Response> {
        const id = Number(req.params[this.repositoryKey]);
        if (_.isNaN(id)) {
            res.sendStatus(500);
            return;
        }
        const entity = await this._repository.deleteEntity(id);
        if (entity)
        return res.json(entity);
    }
    /** Basic method of put by id */
    async methodPut(req: Request, res: Response, next: any): Promise<Response> {
        const entity =  req.body;
        entity.id = Number(req.params[this.repositoryKey]);
        if(_.isNaN(entity.id)) {
            res.sendStatus(500);
            return;
        }
        return res.json(await this._repository.saveEntity(entity));
    }
    /** Basic method of post */
    async methodPost(req: Request, res: Response, next: any): Promise<Response> {
        const entity =  req.body;
        return res.json(await this._repository.saveEntity(entity));
    }

}

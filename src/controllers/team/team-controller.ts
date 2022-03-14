import BasicController from "../../core/controllers/basic-controller";
import {TeamRepository} from "../../repositories/team-repository";
import {Connection, Like} from "typeorm";
import {Request, Response} from "express";
import {REGION} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Team} from "../../entities/team";
import { TeamDto } from "./dtos/team-dto";
import {validateRequestSchema} from "../../middleware/validate-request-schema";
import {teamValidationSchema} from "./validation/team-schema";

export class TeamController extends BasicController<TeamRepository> {
    constructor(connection:Connection) {
        super(connection, TeamRepository, false);

        this.regionsGetAll = this.regionsGetAll.bind(this);
        this.getTeamByRegion = this.getTeamByRegion.bind(this);
        this.getTeamByName = this.getTeamByName.bind(this);
        this.createTeam = this.createTeam.bind(this);
        this.deleteTeam = this.deleteTeam.bind(this);
        this.updateTeam = this.updateTeam.bind(this);
        this.getTeamById = this.getTeamById.bind(this);
        this.getTeams = this.getTeams.bind(this);
        this.router.get('/regions', this.regionsGetAll)
        this.router.get('/regions/:key', this.getTeamByRegion)
        this.router.get('/names/:key', this.getTeamByName)
        this.router.post('/', teamValidationSchema, validateRequestSchema, this.createTeam)
        this.router.delete('/:id', this.deleteTeam)
        this.router.put('/:id', teamValidationSchema, validateRequestSchema, this.updateTeam)
        this.router.get('/', this.getTeams)
        this.router.get('/:id', this.getTeamById)
        this.initDefault()
    }

    async regionsGetAll(req: Request, res: Response, next: any): Promise<Response> {
        return  res.json(REGION)
    }

    async getTeamByRegion(req: Request, res: Response, next: any): Promise<Response> {
        let key = String(req.params.key);
        if (!key) {
            res.status(500).send({message: "Invalid entity id."});
            return;
        }
        key = key[0].toLocaleUpperCase() + key.slice(1)
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

    async createTeam(req: Request<{}, {}, TeamDto>, res: Response, next: any): Promise<Response> {
        try{
            const createTeamData = req.body;

            const existTeam = await (this._repository as BasicRepository<Team>).findOne({where:
                    {name: Like("%"+createTeamData.name+"%")}});
            if(existTeam){
                return res.status(400).send({message:"Entity already exist."})
            }

            const team = await (this._repository as BasicRepository<Team>).save({
                name: createTeamData.name,
                countryCode: createTeamData.countryCode,
                flag: createTeamData.flag,
                region: createTeamData.region
            })

            return res.status(201).send({message:"Entity created."})
        }catch (e) {
            console.log(e)
        }
    }

    async deleteTeam(req: Request, res: Response, next: any) {
        try{
            const teamId = req.params.id;
            const team = await (this._repository as BasicRepository<Team>).findOne(teamId);
            if(!team){
                return res.status(404).send({message:"Entity does not exist."})
            }
            await (this._repository as BasicRepository<Team>).remove(team)
            return res.status(200).send({message:"Entity delete."})
        }catch (e) {
            console.log(e)
        }
    }

    async updateTeam(req: Request<any, any, TeamDto>, res: Response, next: any) {
        try{
            const createTeamData = req.body;
            const teamId = req.params.id;
            const team = await (this._repository as BasicRepository<Team>).findOne(teamId);
            if(!team){
                return res.status(404).send({message:"Entity does not exist."})
            }

            const newTeam = await (this._repository as BasicRepository<Team>).update(teamId, {
                name: createTeamData.name,
                countryCode: createTeamData.countryCode,
                flag: createTeamData.flag,
                region: createTeamData.region
            })

            return res.status(200).send({message:"Entity updated."})
        }catch (e) {
            console.log(e)
        }
    }

    async getTeams(req: Request, res: Response, next: any){
        const teams = await (this._repository as BasicRepository<Team>).find()
        return res.status(200).json(teams)
    }

    async getTeamById(req: Request, res: Response, next: any){
        const teamId = req.params.id;
        const team = await (this._repository as BasicRepository<Team>).findOne(teamId)
        return res.status(200).json(team)
    }
}

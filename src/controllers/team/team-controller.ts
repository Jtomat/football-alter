import BasicController from "../../core/controllers/basic-controller";
import {TeamRepository} from "../../repositories/team-repository";
import {Connection, Like} from "typeorm";
import express, {Request, Response} from "express";
import {REGION} from "../../entities/enums";
import BasicRepository from "../../core/repositories/basic-repository";
import {Team} from "../../entities/team";
import path from "path";
import * as os from "os";
import * as fs from "fs";

export class TeamController extends BasicController<TeamRepository> {
    constructor(connection:Connection) {
        super(connection, TeamRepository, false);

        this.regionsGetAll = this.regionsGetAll.bind(this);
        this.getTeamByRegion = this.getTeamByRegion.bind(this);
        this.getTeamByName = this.getTeamByName.bind(this);
        this.getFlags = this.getFlags.bind(this)
        this.router.get('/regions', this.regionsGetAll)
        this.router.get('/regions/:key', this.getTeamByRegion)
        this.router.get('/names/:key', this.getTeamByName)
        this.router.get('/flags', this.getFlags)
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

    async getFlags (req: Request, res: Response, next: any): Promise<Response> {
        const directoryPath = path.join(__dirname, '../../static/flags');
        const flags = fs.readdirSync(directoryPath)
            .map(flag => `/static/flags/${flag}`)

        if(!flags.length){
            res.status(404).send({message:"Flags not found."});
        }
        return res.send(flags)
    }
}

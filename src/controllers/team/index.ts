import {Connection} from "typeorm";
import {Router} from "express";
import {TeamController} from "./team-controller";
import {PlayerController} from "./player-controller";
import {RouterBuilder} from "../../core/controllers/router-builder";

const loadTeam = (connection: Connection): Router => {
    const team = new TeamController(connection);
    const player = new PlayerController(connection);
    const router = RouterBuilder.build([{
        controller: team,
        children:[{controller:player}]
    }])
    return  router;
}
export {PlayerController, TeamController, loadTeam}

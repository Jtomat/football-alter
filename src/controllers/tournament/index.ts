import {GameController} from "./game-controller";
import {Connection} from "typeorm";
import {TournamentController} from "./tournament-controller";
import {ParticipantController} from "./participant-controller";
import {EventController} from "./event-controller";
import {RouterBuilder} from "../../core/controllers/router-builder";
import {Router} from "express";
import {PlayerInGridController} from "./player-in-grid-controller";


const loadTournament = (connection: Connection): Router => {
    const games = new GameController(connection);
    const tournaments = new TournamentController(connection);
    const part = new ParticipantController(connection);
    const event = new EventController(connection);
    const playerInGrid = new PlayerInGridController(connection);
    const router = RouterBuilder.build([{
        controller: tournaments,
        children: [{controller:part}, {controller:games, children:[{controller:event}, {controller: playerInGrid}]},  ]
    }])
    return router;
}
export {GameController, TournamentController, ParticipantController, EventController, loadTournament}

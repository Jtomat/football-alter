import {GameController} from "./game-controller";
import {Connection} from "typeorm";
import {TournamentController} from "./tournament-controller";
import {ParticipantController} from "./participant-controller";
import {EventController} from "./event-controller";
import {RouterBuilder} from "../../core/controllers/router-builder";
import {Router} from "express";


const loadTournament = (connection: Connection): Router => {
    const games = new GameController(connection);
    const tournaments = new TournamentController(connection);
    const part = new ParticipantController(connection);
    const event = new EventController(connection);
    const router = RouterBuilder.build([{
        controller: tournaments,
        children: [{controller:games, children:[{controller:event}]}, {controller:part}, ]
    }])
    return router;
}
export {GameController, TournamentController, ParticipantController, EventController, loadTournament}

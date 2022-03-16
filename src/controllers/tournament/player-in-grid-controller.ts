import BasicController from "../../core/controllers/basic-controller";
import {Connection} from "typeorm";
import {PlayerInGridRepository} from "../../repositories/player-in-grid-repository";
import {Request, Response} from "express";
import {Game} from "../../entities/game";
import {PlayerInGrid} from "../../entities/player-in-grid";
import {Player} from "../../entities/player";
import {POSITION} from "../../entities/enums";

export class PlayerInGridController extends BasicController<PlayerInGridRepository> {

    constructor(connection: Connection) {
        super(connection, PlayerInGridRepository, false);
        this.get = this.get.bind(this);
        this.put = this.put.bind(this);
        this.router.get('/', this.get);
        this.router.put('/', this.put);
    }

    async get(req: Request, res: Response) {
        const gameId: string = req.params['keygame'];
        const players = await this._repository.find({
            where: {game: {id: gameId}},
            relations: ['player']
        }) as PlayerInGrid[];
        res.json({
            homeTeam: players.filter(p => p.isHomeTeam),
            guestTeam: players.filter(p => !p.isHomeTeam)
        });
    }

    async put(req: Request, res: Response) {
        const gameId: number = parseInt(req.params['keygame']);
        const startingGrids: StartingGrids = req.body;

        if (PlayerInGridController.getPlayerIds(startingGrids).size != 22) {
            res.status(400).send('Сюда суй ровно 22 игрока');
            return;
        }
        if (startingGrids.homeTeam.length != 11 || startingGrids.guestTeam.length != 11) {
            res.status(400).send('Суй в каждую команду по 11 игроков');
            return;
        }
        const homeGoalkeepers = startingGrids.homeTeam.filter(p => p.currentPosition == POSITION.GOALKEEPER);
        const guestGoalkeepers = startingGrids.homeTeam.filter(p => p.currentPosition == POSITION.GOALKEEPER);
        if (homeGoalkeepers.length != 1 || guestGoalkeepers.length != 1) {
            res.status(400).send('Суй в каждую команду по 1 вратарю');
            return;
        }

        startingGrids.homeTeam.forEach(p => p.isHomeTeam = true);
        startingGrids.guestTeam.forEach(p => p.isHomeTeam = false);

        const manager = this._repository.manager;
        const game = await manager.findOne(Game, gameId, {
            relations: ['teamGrids', 'homeTeam', 'guestTeam', 'homeTeam.team', 'guestTeam.team']
        });
        await this.hydrate(startingGrids, game);

        for (const gridPlayer of startingGrids.homeTeam.concat(startingGrids.guestTeam)) {
            const team = gridPlayer.isHomeTeam ? gridPlayer.game.homeTeam : gridPlayer.game.guestTeam;
            if (gridPlayer.player.team.id != team?.id) {
                res.status(400).send('Суй игроков на правильную сторону');
                return;
            }
        }

        if (game.teamGrids.length != 0) {
            await this._repository.delete(game.teamGrids.map(p => p.id));
        }
        await this._repository.save(startingGrids.homeTeam.concat(startingGrids.guestTeam));

        res.status(200).send("Хорошо сделал классно у тебя получилось");
    }

    static getPlayerIds(startingGrids: StartingGrids): Set<number> {
        const ids = new Set<number>();
        startingGrids.homeTeam.concat(startingGrids.guestTeam).forEach(p => ids.add(p.player.id))
        return ids;
    }

    async hydrate(startingGrids: StartingGrids, game: Game): Promise<void> {
        const manager = this._repository.manager;
        const playerIds = PlayerInGridController.getPlayerIds(startingGrids);
        const players = await manager.findByIds(Player, Array.from(playerIds), {
            relations: ['team']
        });
        const playersMap = new Map();
        players.forEach(p => playersMap.set(p.id, p));
        startingGrids.homeTeam.concat(startingGrids.guestTeam)
            .forEach(p => p.player = playersMap.get(p.player.id));


        startingGrids.homeTeam.concat(startingGrids.guestTeam).forEach(p => p.game = game);
    }
}

interface StartingGrids {
    homeTeam: PlayerInGrid[],
    guestTeam: PlayerInGrid[]
}
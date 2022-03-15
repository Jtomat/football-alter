import BasicRepository from "../core/repositories/basic-repository";
import {Game} from "../entities/game";
import {EntityRepository} from "typeorm";
import {TournamentRepository} from "./tournament-repository";
import {GROUP, STAGE, POSITION} from "../entities/enums";
import {Tournament} from "../entities/tournament";
import {Participant} from "../entities/participant";
import {ParticipantRepository} from "./participant-repository";
import {EntityKey} from "../core/models/dto"
import {asyncSort} from "../core/shared/constants";
import {Player} from "../entities/player";
import {PlayerInGrid} from "../entities/player-in-grid";

@EntityRepository(Game)
export class GameRepository extends BasicRepository<Game> {
    _tableName = 'game'
    _urlSegment = '/games'

    async getEntityWithRelations(key: EntityKey): Promise<Game> {
        return this.findOne({
            relations: ['homeTeam', 'guestTeam', 'events', 'homeTeam.tournament',
                'guestTeam.tournament', 'teamGrids'], where: {id: this.getEntityID(key)}
        })
    }

    async saveEntity(entity: Game): Promise<Game> {
        let saveResult = (await this.save([entity], {}))[0];
        if (saveResult.finished) {
            saveResult = await this.findOne({
                relations: ['homeTeam', 'homeTeam.tournament'],
                where: {id: saveResult.id}
            });
            const tournament = saveResult.homeTeam.tournament;
            const tRep = this.manager.connection.getCustomRepository(TournamentRepository);
            const stages = await tRep.getCurrentStage(tournament);
            if (stages[saveResult.stage]) {
                await this.createGamesFrom(saveResult.stage, tournament);
            }
        }
        return saveResult;
    }

    /**
     * Создать для игры стартовую сетку
     * @param game
     */
    async assignPlayers(game: Game): Promise<void> {
        const getPlayersInGrid = async (isHomeTeam: boolean): Promise<PlayerInGrid[]> => {
            const teamId = isHomeTeam ? game.homeTeam.id : game.guestTeam.id;
            const players = await this.manager.find(Player, {
                relations: [],
                where: {team: {id: teamId}}
            });
            const goalkeepers = players.filter(p => p.position == POSITION.GOALKEEPER);
            const nonGoalkeepers = players.filter(p => p.position != POSITION.GOALKEEPER);
            return goalkeepers.slice(0, 1).concat(nonGoalkeepers.slice(0, 10)).map(p => {
                const playerInGrid = new PlayerInGrid();
                playerInGrid.game = game;
                playerInGrid.player = p;
                playerInGrid.currentPosition = p.position
                playerInGrid.isHomeTeam = isHomeTeam;
                return playerInGrid;
            });
        }
        game.teamGrids = (await getPlayersInGrid(true)).concat(await getPlayersInGrid(false));
    }

    async createGamesFrom(stage: STAGE, tournament: Tournament): Promise<boolean> {
        switch (stage) {
            case STAGE.ROUND_OF_16:
                return this.createQuarterFinal(tournament.id);
            case STAGE.QUARTER_FINAL:
                return this.createSemiFinal(tournament.id);
            case STAGE.SEMI_FINAL:
                return this.createFinal(tournament.id);
            case STAGE.FINAL:
                return true;
            case STAGE.GROUP_STAGE:
                return this.createRoundOf16(tournament.id);
            default:
                throw new Error('Unexpected stage token');
        }
    }

    private async createFinal(tournamentID: number): Promise<boolean> {
        const roundQuarter = await this.find({
            relations: ['homeTeam', 'guestTeam', 'homeTeam.tournament'],
            where: {stage: STAGE.SEMI_FINAL, homeTeam: {tournament: {id: tournamentID}}}
        });

        const game = new Game();
        game.homeTeam = await this.getWinner(roundQuarter[0]);
        game.guestTeam = await this.getWinner(roundQuarter[1]);
        await this.assignPlayers(game);
        game.stage = STAGE.FINAL;

        await this.save([game]);

        return true;
    }

    private async createQuarterFinal(tournamentID: number): Promise<boolean> {
        const roundOF16 = await this.find({
            relations: ['homeTeam', 'guestTeam', 'homeTeam.tournament'],
            where: {stage: STAGE.ROUND_OF_16, homeTeam: {tournament: {id: tournamentID}}}
        });

        const gameQF1 = new Game();
        gameQF1.homeTeam = await this.getWinner(roundOF16[0])
        gameQF1.guestTeam = await this.getWinner(roundOF16[2]);
        gameQF1.stage = STAGE.QUARTER_FINAL;
        await this.assignPlayers(gameQF1);

        const gameQF2 = new Game();
        gameQF2.homeTeam = await this.getWinner(roundOF16[1]);
        gameQF2.guestTeam = await this.getWinner(roundOF16[5]);
        gameQF2.stage = STAGE.QUARTER_FINAL;
        await this.assignPlayers(gameQF2);

        const gameQF3 = new Game();
        gameQF3.homeTeam = await this.getWinner(roundOF16[4]);
        gameQF3.guestTeam = await this.getWinner(roundOF16[6]);
        gameQF3.stage = STAGE.QUARTER_FINAL;
        await this.assignPlayers(gameQF3);

        const gameQF4 = new Game();
        gameQF4.homeTeam = await this.getWinner(roundOF16[3]);
        gameQF4.guestTeam = await this.getWinner(roundOF16[7]);
        gameQF4.stage = STAGE.QUARTER_FINAL;
        await this.assignPlayers(gameQF4);

        await this.save([gameQF1, gameQF2, gameQF3, gameQF4]);

        return true;
    }

    private async createSemiFinal(tournamentID: number): Promise<boolean> {
        const roundSemi = await this.find({
            relations: ['homeTeam', 'guestTeam', 'homeTeam.tournament'],
            where: {stage: STAGE.QUARTER_FINAL, homeTeam: {tournament: {id: tournamentID}}}
        });

        const gameQF1 = new Game();
        gameQF1.homeTeam = await this.getWinner(roundSemi[0]);
        gameQF1.guestTeam = await this.getWinner(roundSemi[1]);
        gameQF1.stage = STAGE.SEMI_FINAL;
        await this.assignPlayers(gameQF1);

        const gameQF2 = new Game();
        gameQF2.homeTeam = await this.getWinner(roundSemi[2]);
        gameQF2.guestTeam = await this.getWinner(roundSemi[3]);
        gameQF2.stage = STAGE.SEMI_FINAL;
        await this.assignPlayers(gameQF2);

        await this.save([gameQF1, gameQF2]);

        return true;
    }

    private async createRoundOf16(tournamentID: number): Promise<boolean> {
        const teams = await this.manager.find(Participant, {
            relations: ['asHome', 'asGuest', 'tournament'],
            where: {tournament: {id: tournamentID}}
        });
        const partRep = this.manager.connection.getCustomRepository(ParticipantRepository);
        const groupA = await asyncSort(teams.filter(i => i.group == GROUP.A), partRep.participantsComparison);
        const groupB = await asyncSort(teams.filter(i => i.group == GROUP.B), partRep.participantsComparison);
        const groupC = await asyncSort(teams.filter(i => i.group == GROUP.C), partRep.participantsComparison);
        const groupD = await asyncSort(teams.filter(i => i.group == GROUP.D), partRep.participantsComparison);
        const groupE = await asyncSort(teams.filter(i => i.group == GROUP.E), partRep.participantsComparison);
        const groupF = await asyncSort(teams.filter(i => i.group == GROUP.F), partRep.participantsComparison);

        const bestOf3 = await asyncSort([
                groupA[2],
                groupB[2],
                groupC[2],
                groupD[2],
                groupE[2],
                groupF[2]],
            partRep.participantsComparison)

        const guests = this.getSelectForGroups(bestOf3)

        const getGroupGuest = (group: GROUP) => {
            switch (group) {
                case GROUP.A:
                    return groupA[2];
                case GROUP.B:
                    return groupB[2];
                case GROUP.C:
                    return groupC[2];
                case GROUP.D:
                    return groupD[2];
                case GROUP.E:
                    return groupE[2];
                case GROUP.F:
                    return groupF[2];
            }
        }

        const gameAF1 = new Game();
        gameAF1.homeTeam = groupA[1];
        gameAF1.guestTeam = groupC[1];
        gameAF1.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF1);

        const gameAF2 = new Game();
        gameAF2.homeTeam = groupB[0];
        gameAF2.guestTeam = getGroupGuest(guests[1])
        gameAF2.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF2);

        const gameAF3 = new Game();
        gameAF3.homeTeam = groupD[0];
        gameAF3.guestTeam = getGroupGuest(guests[3])
        gameAF3.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF3);

        const gameAF4 = new Game();
        gameAF4.homeTeam = groupA[0];
        gameAF4.guestTeam = getGroupGuest(guests[0])
        gameAF4.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF4);

        const gameAF5 = new Game();
        gameAF5.homeTeam = groupC[0];
        gameAF5.guestTeam = getGroupGuest(guests[2]);
        gameAF5.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF5);

        const gameAF6 = new Game();
        gameAF6.homeTeam = groupF[0];
        gameAF6.guestTeam = groupE[1];
        gameAF6.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF6);

        const gameAF7 = new Game();
        gameAF7.homeTeam = groupE[0];
        gameAF7.guestTeam = groupD[1];
        gameAF7.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF7);

        const gameAF8 = new Game();
        gameAF8.homeTeam = groupB[1];
        gameAF8.guestTeam = groupF[1];
        gameAF8.stage = STAGE.ROUND_OF_16;
        await this.assignPlayers(gameAF8);

        await this.save([gameAF1, gameAF2, gameAF3, gameAF4, gameAF5, gameAF6, gameAF7, gameAF8]);
        return true;
    }

    private getSelectForGroups(array: Array<Participant>): Array<GROUP> {
        const groupSort = array.slice(0, 4).map(i => i.group).sort().join('');
        if ('ABCD' == groupSort)
            return [GROUP.C, GROUP.D, GROUP.A, GROUP.B];
        if ('ABCE' == groupSort)
            return [GROUP.C, GROUP.A, GROUP.B, GROUP.E]
        if ('ABCF' == groupSort)
            return [GROUP.C, GROUP.A, GROUP.B, GROUP.F];
        if ('ABDE' == groupSort)
            return [GROUP.D, GROUP.A, GROUP.B, GROUP.E];
        if ('ABDF' == groupSort)
            return [GROUP.D, GROUP.A, GROUP.B, GROUP.F];
        if ('ABEF' == groupSort)
            return [GROUP.E, GROUP.A, GROUP.B, GROUP.F];
        if ('ACDE' == groupSort)
            return [GROUP.C, GROUP.D, GROUP.A, GROUP.E];
        if ('ACDF' == groupSort)
            return [GROUP.C, GROUP.D, GROUP.A, GROUP.F];
        if ('ACEF' == groupSort)
            return [GROUP.C, GROUP.A, GROUP.F, GROUP.E];
        if ('ADEF' == groupSort)
            return [GROUP.D, GROUP.A, GROUP.F, GROUP.E];
        if ('BCDE' == groupSort)
            return [GROUP.C, GROUP.D, GROUP.B, GROUP.E];
        if ('BCDF' == groupSort)
            return [GROUP.C, GROUP.D, GROUP.B, GROUP.F];
        if ('BCEF' == groupSort)
            return [GROUP.E, GROUP.C, GROUP.B, GROUP.F];
        if ('BDEF' == groupSort)
            return [GROUP.E, GROUP.D, GROUP.B, GROUP.F];
        if ('CDEF' == groupSort)
            return [GROUP.C, GROUP.D, GROUP.F, GROUP.E];
        throw new Error('Unexpected input combination');
    }

    async getWinner(key: EntityKey | Game): Promise<Participant> {
        let game: Game;
        if (key as Game != null)
            game = key as Game;
        else
            game = await this.getEntityWithRelations(key);
        if (game.homeTeamResult > game.guestTeamResult)
            return game.homeTeam;
        else return game.guestTeam;
    }
}

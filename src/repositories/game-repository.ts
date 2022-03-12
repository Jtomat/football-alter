import BasicRepository from "../core/repositories/basic-repository";
import {Game} from "../entities/game";
import {EntityRepository} from "typeorm";
import {TournamentRepository} from "./tournament-repository";
import {GROUP, STAGE} from "../entities/enums";
import {Tournament} from "../entities/tournament";
import {Participant} from "../entities/participant";
import _ from "lodash";
import {ParticipantRepository} from "./participant-repository";

@EntityRepository(Game)
export class GameRepository extends BasicRepository<Game> {
    _tableName = 'game'
    _urlSegment = '/games'

    async saveEntity(entity: Game): Promise<Game>  {
        let saveResult = (await this.save([entity], {}))[0];
        if (saveResult.finished) {
            saveResult = await this.findOne({relations:['homeTeam','homeTeam.tournament'], where:{id:saveResult.id}});
            const tournament= saveResult.homeTeam.tournament;
            const tRep = new TournamentRepository();
            const stages = tRep.getCurrentStage(tournament);
            if (stages[saveResult.stage]) {
                await this.createGamesFrom(saveResult.stage, tournament);
            }
        }
        return saveResult;
    }

    async createGamesFrom(stage: STAGE, tournament: Tournament): Promise<boolean> {
        switch (stage){
            case STAGE.ROUND_OF_16:
                return this.createRoundOf16(tournament.id)
                break;
            case STAGE.QUARTER_FINAL:
                break;
            case STAGE.SEMI_FINAL:
                break;
            case STAGE.FINAL:
                break;
            case STAGE.GROUP_STAGE:
                break;
            default:
                throw new Error('Unexpected stage token');
        }
        return false;
    }

    private async createRoundOf16(tournamentID: number): Promise<boolean> {
        const teams = await this.manager.find(Participant,{relations:['asHome', 'asGuest', 'tournament'], where:{tournament:{id:tournamentID}}});
        const partRep = this.manager.connection.getCustomRepository(ParticipantRepository);
        const groupA = _.sortUniqued(teams.filter(i=>i.group == GROUP.A),  partRep.participantsComparison);
        const groupB = _.sortUniqued(teams.filter(i=>i.group == GROUP.B),  partRep.participantsComparison);
        const groupC = _.sortUniqued(teams.filter(i=>i.group == GROUP.C),  partRep.participantsComparison);
        const groupD = _.sortUniqued(teams.filter(i=>i.group == GROUP.D),  partRep.participantsComparison);
        const groupE = _.sortUniqued(teams.filter(i=>i.group == GROUP.E),  partRep.participantsComparison);
        const groupF = _.sortUniqued(teams.filter(i=>i.group == GROUP.F),  partRep.participantsComparison);

        const bestOf3 = _.sortUniqued([
            groupA[2],
            groupB[2],
            groupC[2],
            groupD[2],
            groupE[2],
            groupF[2]],
            partRep.participantsComparison)

        const guests = this.getSelectForGroups(bestOf3)

        const getGroupGuest = (group:GROUP) => {
            switch (group){
                case GROUP.A: return groupA[2];
                case GROUP.B: return groupB[2];
                case GROUP.C: return groupC[2];
                case GROUP.D: return groupD[2];
                case GROUP.E: return groupE[2];
                case GROUP.F: return groupF[2];
            }
        }

        const gameAF1 = new Game();
        gameAF1.homeTeam = groupA[1];
        gameAF1.guestTeam = groupC[1];

        const gameAF2 = new Game();
        gameAF2.homeTeam = groupB[0];
        gameAF2.guestTeam = getGroupGuest(guests[1]);

        const gameAF3 = new Game();
        gameAF3.homeTeam = groupD[0];
        gameAF3.guestTeam = getGroupGuest(guests[3]);

        const gameAF4 = new Game();
        gameAF4.homeTeam = groupA[0];
        gameAF4.guestTeam = getGroupGuest(guests[0]);

        const gameAF5 = new Game();
        gameAF5.homeTeam = groupC[0];
        gameAF5.guestTeam = getGroupGuest(guests[2]);

        const gameAF6 = new Game();
        gameAF6.homeTeam = groupF[0];
        gameAF6.guestTeam = groupE[1];

        const gameAF7 = new Game();
        gameAF7.homeTeam = groupD[1];

        const gameAF8 = new Game();
        gameAF8.homeTeam = groupB[1];
        gameAF8.guestTeam = groupF[1];

        await this.save([gameAF1, gameAF2, gameAF3, gameAF3, gameAF4, gameAF5, gameAF6, gameAF7, gameAF8]);
        return true;
    }

    private getSelectForGroups(array: Array<Participant>): Array<GROUP> {
        const groupSort = array.slice(0,4).map(i=>i.group);
        if ([GROUP.A, GROUP.B, GROUP.C, GROUP.D] == groupSort)
            return [GROUP.C,GROUP.D, GROUP.A, GROUP.B];
        if ([GROUP.A, GROUP.B,GROUP.C, GROUP.E] == groupSort)
            return  [GROUP.C, GROUP.A, GROUP.B, GROUP.E]
        if ([GROUP.A, GROUP.B,GROUP.C, GROUP.F] == groupSort)
            return  [GROUP.C, GROUP.A, GROUP.B, GROUP.F];
        if ([GROUP.A, GROUP.B,GROUP.D, GROUP.E] == groupSort)
            return  [GROUP.D, GROUP.A, GROUP.B, GROUP.E];
        if ([GROUP.A, GROUP.B,GROUP.D, GROUP.F] == groupSort)
            return  [GROUP.D, GROUP.A, GROUP.B, GROUP.F];
        if ([GROUP.A, GROUP.B,GROUP.E, GROUP.F] == groupSort)
            return  [GROUP.E, GROUP.A, GROUP.B, GROUP.F];
        if ([GROUP.A, GROUP.C,GROUP.D, GROUP.E] == groupSort)
            return  [GROUP.C, GROUP.D, GROUP.A, GROUP.E];
        if ([GROUP.A, GROUP.C,GROUP.D, GROUP.F] == groupSort)
            return  [GROUP.C, GROUP.D, GROUP.A, GROUP.F];
        if ([GROUP.A, GROUP.C,GROUP.E, GROUP.F] == groupSort)
            return  [GROUP.C, GROUP.A, GROUP.F, GROUP.E];
        if ([GROUP.A, GROUP.D,GROUP.E, GROUP.F] == groupSort)
            return  [GROUP.D, GROUP.A, GROUP.F, GROUP.E];
        if ([GROUP.B, GROUP.C,GROUP.D, GROUP.E] == groupSort)
            return  [GROUP.C, GROUP.D, GROUP.B, GROUP.E];
        if ([GROUP.B, GROUP.C,GROUP.D, GROUP.F] == groupSort)
            return  [GROUP.C, GROUP.D, GROUP.B, GROUP.F];
        if ([GROUP.B, GROUP.C,GROUP.E, GROUP.F] == groupSort)
            return  [GROUP.E, GROUP.C, GROUP.B, GROUP.F];
        if ([GROUP.B, GROUP.D,GROUP.E, GROUP.F] == groupSort)
            return  [GROUP.E, GROUP.D, GROUP.B, GROUP.F];
        if ([GROUP.C, GROUP.D,GROUP.E, GROUP.F] == groupSort)
            return  [GROUP.C, GROUP.D, GROUP.F, GROUP.E];
        throw new Error('Unexpected input combination');
    }
}

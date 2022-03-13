import BasicRepository from "../core/repositories/basic-repository";
import {Tournament} from "../entities/tournament";
import {EntityRepository} from "typeorm";
import {EntityKey} from "../core/models/dto";
import {GROUP, STAGE} from "../entities/enums";
import {Game} from "../entities/game";
import _ from "lodash";

@EntityRepository(Tournament)
export class TournamentRepository extends BasicRepository<Tournament> {
    _tableName = 'tournament'
    _urlSegment = '/tournaments'

    constructor() {
        super();
    }

    async getEntityWithRelations(key: EntityKey): Promise<Tournament> {
        const tournament = (await this.findOne(this.getEntityID(key), {relations:['participants']})) as Tournament;
        tournament['games'] = {};
        let games = []
        for (const parts of tournament.participants) {
            const game = (await this.manager.find(Game,
                {
                    relations:['guestTeam','homeTeam','guestTeam.team','homeTeam.team'],
                    where: {guestTeam:parts.id}
                }));
            if(game)
                games = games.concat(game);
        }
        Object.keys(STAGE).forEach(stage=> {
            if (stage != 'GROUP_STAGE') {
                tournament['games'][stage] = games.filter((i: Game) => i.stage == STAGE[stage]);
            } else
                Object.keys(GROUP).forEach(group => {
                    tournament['games'][stage] = {
                        ...tournament['games'][stage],
                        [group]: games.filter((i: Game) => i.stage == STAGE.GROUP_STAGE)
                            .filter((i: Game) => i.guestTeam.group == GROUP[group])
                    }
                });
        });
        return tournament;
    }


    async getCurrentStage(key: EntityKey): Promise<{[p:string]:boolean|{}}> {
        const tournament = await this.getEntityWithRelations(key);
        const stageStatus = {};
        Object.keys(STAGE).forEach(stage=> {
            let source: Array<Game> = [];
            if (stage != 'GROUP_STAGE')
                source = tournament['games'][stage] as Game[];
            else
                Object.keys(GROUP).forEach(group => {
                    source = source.concat(tournament['games'][stage][group] as Game[]);
                })
            stageStatus[STAGE[stage]] = _.isEmpty(source.filter(i => !i.finished)) && !_.isEmpty(source)
        });
        return stageStatus;
    }
}

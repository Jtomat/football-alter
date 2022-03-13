import BasicRepository from "../core/repositories/basic-repository";
import {Participant} from "../entities/participant";
import {EntityRepository} from "typeorm";
import {EntityKey} from "../core/models/dto";
import {defaultCompare} from "../core/shared/constants";
import {randomInt} from "crypto";

@EntityRepository(Participant)
export class ParticipantRepository extends BasicRepository<Participant> {
    _tableName = 'participant'
    _urlSegment = '/participant'

    constructor() {
        super();
        this.participantsComparison = this.participantsComparison.bind(this);
    }

    async calculateScore(key: EntityKey): Promise<number> {
        const participant = await this.getEntityWithRelations(key);
        let points = 0
        participant.asHome.forEach(val => {
            if(val.homeTeam == val.guestTeam){
                points += 1
            }
            if(val.homeTeam > val.guestTeam){
                points += 3
            }
        })
        participant.asGuest.forEach(val => {
            if(val.homeTeam == val.guestTeam){
                points += 1
            }
            if(val.homeTeam < val.guestTeam){
                points += 3
            }
        })
        return points
    }



    async participantsComparison(participant1: EntityKey, participant2: EntityKey): Promise<-1|0|1> {
        const part1 = await this.findOne({relations:['asHome','asGuest'], where: {id:this.getEntityID(participant1)}});
        const part2 = await this.findOne({relations:['asHome','asGuest'], where: {id:this.getEntityID(participant2)}});
        const part1Score = await this.calculateScore(participant1);
        const part2Score = await this.calculateScore(participant2);
        const scoreCompare = defaultCompare(part1Score, part2Score);
        if (scoreCompare === 0) {
            let goalsScored1 = 0
            let goalsScored2 = 0
            let goalsConceded1 = 0
            let goalsConceded2 = 0
            part1.asGuest.forEach(value => {
                goalsScored1 += value.guestTeamResult
                goalsConceded1 += value.homeTeamResult
            })
            part1.asHome.forEach(value => {
                goalsScored1 += value.homeTeamResult
                goalsConceded1 += value.guestTeamResult
            })
            part2.asGuest.forEach(value => {
                goalsScored2 += value.guestTeamResult
                goalsConceded2 += value.homeTeamResult
            })
            part2.asHome.forEach(value => {
                goalsScored2 += value.homeTeamResult
                goalsConceded2 += value.guestTeamResult
            })
            const compareResult = defaultCompare(goalsScored1 - goalsConceded1, goalsScored2 - goalsConceded2);
            if (compareResult === 0) {
                if (goalsScored1 == goalsScored2) {
                    let rnd = randomInt(100)
                    if (rnd % 2 == 0) {
                        return 1
                    } else {
                        return -1
                    }
                } else return defaultCompare(goalsScored1, goalsScored2);
            } else return compareResult;
        } else return scoreCompare;
    }
}

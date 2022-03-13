import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Participant} from "./participant";
import {STAGE} from "./enums";
import {Event} from "./event";
import {PlayerInGrid} from "./player-in-grid";

@Entity()
export class Game extends DTO {

    @ManyToOne(type => Participant, part=>part.asHome)
    homeTeam:Participant;
    @ManyToOne(type => Participant, part=>part.asGuest)
    guestTeam:Participant;
    @Column({default:0}) // ГОЛЫ, а не очки
    homeTeamResult: number;
    @Column({default:0}) // ГОЛЫ, а не очки
    guestTeamResult: number;
    @Column({type:"enum",enum:STAGE, default:STAGE.GROUP_STAGE})
    stage:STAGE;
    @OneToMany(type => Event, event=>event.game)
    events: Event[]
    @Column({default:false})
    started:boolean;
    @Column({default:false})
    finished:boolean;
    @OneToMany(type=>PlayerInGrid, grid=>grid.game)
    teamGrids: PlayerInGrid[];
}

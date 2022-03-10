import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {Participant} from "./participant";
import {STAGE} from "./enums";
import {Event} from "./event";

@Entity()
export class Game extends DTO {

    @ManyToOne(type => Participant, part=>part.asHome)
    homeTeam:Participant;
    @ManyToOne(type => Participant, part=>part.asGuest)
    guestTeam:Participant;
    @Column({default:0})
    homeTeamResult: number;
    @Column({default:0})
    guestTeamResult: number;
    @Column({type:"enum",enum:STAGE, default:STAGE.GROUP_STAGE})
    stage:STAGE;
    @OneToMany(type => Event, event=>event.game)
    events: Event[]
    @Column({default:false})
    started:boolean;
    @Column({default:false})
    finished:boolean;
}

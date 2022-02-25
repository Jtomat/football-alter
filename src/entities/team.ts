import {DTO} from "../core/models/dto";
import {Column, Entity, OneToMany} from "typeorm";
import {Participant} from "./participant";
import { REGION } from "./enums";
import {Player} from "./player";

@Entity()
export class Team extends DTO {
    @Column()
    name: string;
    @Column()
    countryCode:string
    @Column()
    flag: string;
    @Column({type:"enum", enum: REGION, default:REGION.OTHERS})
    region: REGION;
    @OneToMany(type=>Participant, participant=>participant.team)
    participants: Participant[];
    @OneToMany(type=> Player, player=>player.team)
    players: Player[]

}

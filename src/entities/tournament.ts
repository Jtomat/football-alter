import {DTO} from "../core/models/dto";
import {Column, Entity, OneToMany} from "typeorm";
import {Participant} from "./participant";

@Entity()
export class Tournament extends DTO {
    @Column()
    name: string;
    @Column({nullable:true})
    startDate: Date;
    @Column({nullable:true})
    endDate: Date;
    @OneToMany(type=>Participant, participant=>participant.tournament)
    participants: Participant[]
}

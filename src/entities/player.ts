import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {POSITION} from "./enums";
import {Team} from "./team";
import {PlayerInGrid} from "./player-in-grid";

@Entity()
export class Player extends DTO {
    @Column()
    firstName: string;
    @Column()
    lastName: string;
    @Column()
    number: number;
    @Column({nullable:true})
    birthDay:Date;
    @Column({type:'enum', enum:POSITION, default:POSITION.DEFENDER})
    position: POSITION;
    @ManyToOne(type=>Team, team=>team.players)
    team: Team;
    @OneToMany(type=>PlayerInGrid, starting=>starting.player)
    playerInGrids:PlayerInGrid[];
}

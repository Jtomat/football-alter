import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne} from "typeorm";
import {POSITION} from "./enums";
import {Player} from "./player";

@Entity()
export class PlayerInGrid extends DTO {

    @Column({type: "enum", enum: POSITION})
    currentPosition:POSITION;
    @ManyToOne(type=>Player, player=>player.playerInGrids)
    player:Player
    @Column()
    isHomeTeam:boolean;
}

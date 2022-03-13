import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne, OneToOne} from "typeorm";
import {POSITION} from "./enums";
import {Player} from "./player";
import {Game} from "./game";

@Entity()
export class PlayerInGrid extends DTO {

    @Column({type: "enum", enum: POSITION})
    currentPosition:POSITION;
    @ManyToOne(type=>Player, player=>player.playerInGrids)
    player:Player
    @ManyToOne(type=> Game, game=>game.teamGrids)
    game: Game
    @Column()
    isHomeTeam:boolean;
}

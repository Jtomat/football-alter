import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne} from "typeorm";
import {EVENT} from "./enums";
import {Game} from "./game";

@Entity()
export class Event extends DTO {
    @Column()
    min:number;
    @Column({type:"enum",enum:EVENT, default:EVENT.GOAL})
    eventType:EVENT;
    @ManyToOne(type=>Game, game=>game.events)
    game: Game;
    @Column({type:"bool", default:false})
    byHomeTeam:boolean;
    @Column()
    info:string;
}

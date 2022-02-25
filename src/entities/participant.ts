import {DTO} from "../core/models/dto";
import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {Tournament} from "./tournament";
import {Team} from "./team";
import {GROUP} from "./enums";
import {Game} from "./game";

@Entity()
export class Participant extends DTO {
    @ManyToOne(type => Tournament, tournament=>tournament.participants)
    tournament: Tournament;
    @ManyToOne(type=>Team, team=>team.participants)
    team: Team
    @Column({type:"enum", enum:GROUP})
    group: GROUP;
    @OneToMany(type => Game, game=>game.guestTeam)
    asGuest: Game[];
    @OneToMany(type => Game, game=>game.homeTeam)
    asHome: Game[];
}

import {DTO} from "../core/models/dto";
import {AfterLoad, Column, Entity, ManyToOne, OneToMany} from "typeorm";
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
    @Column({type:"enum", enum:GROUP, nullable:true})
    group: GROUP;
    @OneToMany(type => Game, game=>game.guestTeam)
    asGuest: Game[];
    @OneToMany(type => Game, game=>game.homeTeam)
    asHome: Game[];
    // Кастомное поле в сущности, пример:
    // customField: string;
    // @AfterLoad()
    // custom() {
    //     this.customField = `${this.team?.name} ${this.team?.id} !!! ${this.group}`
    // }
}

import {DTO} from "../../core/models/dto";
import {Column, Entity, ManyToOne} from "typeorm";
import {User} from "./User";

@Entity()
export class Child extends DTO {
    @Column()
    name: string;
    @ManyToOne(type=>User,user=>user.children) parent: User;
}

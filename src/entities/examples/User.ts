import {Entity, Column, OneToMany} from "typeorm";
import {DTO} from "../../core/models/dto";
import {Child} from "./Child";

@Entity()
export class User extends DTO{

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

    @OneToMany(type=>Child, child=>child.parent)
    children: Child[];

}

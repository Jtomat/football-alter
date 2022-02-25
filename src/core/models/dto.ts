import {BaseEntity, Entity, PrimaryGeneratedColumn} from "typeorm";

/** Basic entity class with PrimaryKey id auto increment */
@Entity()
export class DTO extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;
}
/** Key type for access {@link DTO entity} */
export type EntityKey = number | {id: number};

// import {Model, ModelAttributes, ModelCtor, where,} from "sequelize";
// const sequelize = require("../db");
// import {Observable, of} from "rxjs";
// import * as _ from "lodash";
//
// /** Интерфейс базовой сущности */
// export interface DTOInterface extends Model{
//     /** Индетификатор сущности, если строка, то считается новой */
//     id: number | string;
// }
//
// export type EntityKey = number | { id: number };
//
// export class Entity {
//
//     private endInit = false;
//
//     protected _value: DTOInterface;
//
//     private static _instance: Entity;
//     protected _urlSegment: string;
//     protected _repository:  ModelCtor<Model>;
//     protected static _tableName: string;
//     protected static _scheme:  ModelAttributes<Model<any, any>, any>;
//     protected relationShip: {hasMany?: Array<Entity>, hasOne?: Array<Entity>}
//
//     static get urlSegment() {
//         return Entity.instance._urlSegment;
//     }
//
//     get urlSegment() {
//         return Entity.urlSegment;
//     }
//
//     get repositories():  ModelCtor<Model> {
//         return Entity.instance._repository;
//     }
//
//     get value() {
//         return this._value;
//     }
//
//     get id() {
//         return this.value.id;
//     }
//
//     get isNew() {
//         return typeof(this.value.id) === 'string';
//     }
//
//     private static get instance() {
//         if(!Entity._instance)
//             Entity._instance = new Entity();
//         return Entity._instance;
//     }
//
//     protected constructor(value: DTOInterface = null) {
//         if (!Entity.instance.endInit) {
//             Entity.instance._repository = sequelize.define(Entity._tableName, Entity._scheme);
//             Entity.setUpRelationShip();
//             Entity.instance.endInit = true;
//         }
//         if (value) {
//             this._value = value;
//         }
//     }
//
//     static async save(entities: Entity): Promise<Entity> {
//         if (entities.isNew) {
//             entities.value.id = null;
//         }
//         const inRepository = await Entity.instance._repository.findOne({where:{id:entities.id}});
//         await inRepository.update(entities);
//         const actual = await Entity.instance._repository.findOne({where:{id:entities.id}}) as DTOInterface;
//         entities._value = actual;
//         return new Promise(()=>entities);
//     }
//
//     static async delete(entities: Entity): Promise<Entity> {
//         const inRepository = await Entity.instance._repository.findOne({where:{id:entities.id}});
//         await inRepository.destroy();
//         return new Promise(()=>entities);
//     }
//
//     async save(): Promise<Entity> {
//        return await Entity.save(this);
//     }
//
//     async delete(): Promise<Entity> {
//         return await Entity.delete(this);
//     }
//
//
//     static async getEntity(key: EntityKey): Promise<Entity> {
//         const id = typeof(key) === 'number' ? key : key.id;
//         const entities = await Entity.instance._repository.findOne({where:{id}})
//         return new Promise(()=> entities);
//     }
//
//     private static setUpRelationShip() {
//         Entity.instance.relationShip?.hasMany.forEach(entities=>{
//             Entity.instance._repository.hasMany(entities.repositories);
//             entities.repositories.belongsTo(Entity.instance._repository);
//         })
//         this.instance.relationShip?.hasOne.forEach(entities=>{
//             Entity.instance._repository.hasOne(entities.repositories);
//             entities.repositories.belongsTo(Entity.instance._repository);
//         })
//     }
// }
//

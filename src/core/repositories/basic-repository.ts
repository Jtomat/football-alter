import {EntityRepository, FindManyOptions, Repository, SelectQueryBuilder} from "typeorm";
import {Filter, Pager} from "../shared/constants";
import {DTO, EntityKey} from "../models/dto";
/** Basic class of controller's repositories for {@link DTO entity} */
@EntityRepository()
export default class BasicRepository<T extends DTO> extends Repository<T>{

    /** Name of DB table */
    protected _tableName: string;
    /** Segment of URL for route of {@link BasicController controller} */
    protected _urlSegment: string;
    /** Segment of URL for route of {@link BasicController controller} */
    get urlSegment(): string {
        return this._urlSegment;
    }

    get tableName(){
        return this._tableName;
    }

    constructor() {
        super();
    }
    /** Save (update\insert) {@link DTO entity}
     * @param entity - entity witch must be saved
     */
    async saveEntity(entity: T): Promise<T> {
        return (await this.save([entity as any], {}))[0];
    }
    /** Delete {@link DTO entity} by {@link EntityKey}
     * @param key - {@link EntityKey} of selected {@link DTO entity}
     * @return deleted {@link DTO entity}
     */
    async deleteEntity(key: EntityKey): Promise<T> {
        const entityRequest = this.getSelectEntityRequest(key);
        const entity = await entityRequest.getOne();
        if (entity) {
            await entityRequest.delete().execute();
            return entity;
        }else return null;
    }
    /** Get {@link DTO entity} by {@link EntityKey}
     * @param key - {@link EntityKey} of selected {@link DTO entity}
     */
    async getEntity(key: EntityKey): Promise<T> {
        return await this.getSelectEntityRequest(key).getOne();
    }
    /** Get all {@link DTO entities} with selected {@link Filter filter} and {@link Pager pagination}
     * @param filter - data filter (!Appears in new version)
     * @param pager - data pagination after filtering
     */
    async getAllEntities(filter: Filter = null, pager: Pager = null): Promise<Array<T>> {
        let request = super.createQueryBuilder(this._tableName);
        if (pager) {
            request = request.offset(pager.page*pager.size).limit(pager.size);
        }
        return await request.getMany();
    }
    /** Get {@link DTO entity}  by {@link EntityKey} with 1 layer of children
     * @param key - {@link EntityKey} of selected {@link DTO entity}
     */
    async getEntityWithRelations(key: EntityKey) {
        let relations = []
        // collect relation properties
        this.metadata.relations.forEach(rel=>{
            if (rel.entityMetadata.tableName === this._tableName) {
                rel.entityMetadata.relations.forEach(relMeta=>{
                    if (!relations.includes(relMeta.propertyPath))
                        relations.push(relMeta.propertyPath)
                })
            }
        })
        return (await this.find({relations, where: {id: this.getEntityID(key)}} as FindManyOptions))[0];
    }

    /** Appears in new version */
    protected parseFilter() {

    }
    /**
     * Get request of entity select by {@link EntityKey key}
     * @param key - {@link EntityKey} of selected {@link DTO entity}
     */
    protected getSelectEntityRequest(key: EntityKey): SelectQueryBuilder<T> {
       return super.createQueryBuilder(this._tableName).where({id: this.getEntityID(key)})
    }
    /** Get id value from {@link EntityKey}
     * @param key - {@link EntityKey} of selected {@link DTO entity}
     * @return id of {@link DTO entity} as number
     */
    protected getEntityID(key: EntityKey): number{
        return typeof(key) === 'number' ? key : key.id;
    }

}

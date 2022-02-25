import BasicRepository from "../core/repositories/basic-repository";
import {Event} from "../entities/event";
import {EntityRepository} from "typeorm";

@EntityRepository(Event)
export class EventRepository extends BasicRepository<Event> {
    _tableName='event'
    _urlSegment='/event'
}

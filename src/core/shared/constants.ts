import * as dotenv from "dotenv";
import BasicController from "../controllers/basic-controller";
import {DTO} from "../models/dto";
import BasicRepository from "../repositories/basic-repository";
import {ObjectType} from "typeorm";
dotenv.config();

export enum FILTER_OPERATORS {
    EQUAL = "eq",
    NOT_EQUAL = "neq",
    IS_NULL = "isnull",
    IS_NOT_NULL = "isnotnull",
    LESS_THAN = "lt",
    LESS_THAN_OR_EQUAL = "lte",
    GREATER_THAN = "gt",
    GREATER_THAN_OR_EQUAL = "gte",
}

export enum FILTER_STRING_OPERATORS {
    START_WITH = "startswith",
    END_WITH = "endswith",
    CONTAINS = "contains",
    NOT_CONTAINS = "doesnotcontain",
    IS_EMPTY = "isempty",
    IS_NOT_EMPTY = "isnotempty",
}
export type Filter = Array<{field: string, operator: FILTER_OPERATORS | FILTER_STRING_OPERATORS, value: any}>

/** Type pagination config */
export type Pager = {page: number, size: number}

/** Default DB connection settings */
export const TYPE_ORM_OPTIONS = {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: ['src/entities/index.ts'] as any,
}
/** Routing config type */
export type RouteConfig = {controller: BasicController<BasicRepository<DTO>>, children?: Array<RouteConfig>}

export const GET_ALL_PREFIX = 'all'

export function shuffleArray (array: Array<any>): Array<any> {
    let i = array.length,
        j = 0,
        temp;
    while (i--){
        j = Math.floor(Math.random() * (i+1));
        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

export function defaultCompare(first: any, second: any): -1|0|1 {
    if(first==second)
        return 0;
    return first>second ? 1 : -1;
}

export async function asyncSort(array: Array<any>, func:(a,b)=>Promise<-1|0|1>) {
    for (let i = 1; i < array.length; i++) {
        let current = array[i];
        let j = i -1;
        let compRes = await func(current, array[j]);
        while ( j>=0 && compRes < 0) {
            array[j+1] = array[j]
            j--;
        }
        array[j+1] = current;
    }
    return array;
}


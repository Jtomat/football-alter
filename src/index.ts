/**
 * Required External Modules
 */
import * as dotenv from "dotenv";
import express, {Router} from "express";
import cors from "cors";
import helmet from "helmet";
import "reflect-metadata";
import {Connection, createConnection, EntityRepository} from "typeorm";
import BasicController from "./core/controllers/basic-controller";
import {TYPE_ORM_OPTIONS} from "./core/shared/constants";
import BasicRepository from "./core/repositories/basic-repository";
import {RouterBuilder} from "./core/controllers/router-builder";
import {User} from "./entities/examples/User";
import {Child} from "./entities/examples/Child";
import {loadTeam} from "./controllers/team";
import {loadTournament} from "./controllers/tournament";
/**
 * Example classes
 */
@EntityRepository(User)
export default class UserRepository extends BasicRepository<User> {
    _urlSegment = '/users'
    _tableName = 'user'
}
class UserController extends BasicController<UserRepository> {
    constructor(connection) {
        super(connection, UserRepository);
    }
}
@EntityRepository(Child)
class ChildRepository extends BasicRepository<Child>{
    _tableName = 'child'
    _urlSegment = '/childs'
}
class ChildController extends BasicController<ChildRepository> {
    constructor(connection) {
        super(connection, ChildRepository);
    }
}
/**
 * App Variables
 */
dotenv.config();
if (!process.env.PORT) {
    process.exit(1);
}

export let GLOBAL_DB_CONNECTION: Connection;

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
/**
 * DB connection and route configuration
 */
createConnection(TYPE_ORM_OPTIONS).then((con)=> {
    GLOBAL_DB_CONNECTION = con;

    const router = Router({mergeParams: true});
    router.use(loadTeam(con));
    router.use(loadTournament(con))
    app.use('/api', router);
    console.log(`DB connected: `, GLOBAL_DB_CONNECTION.isConnected)

}).catch((e)=>{console.log(e); GLOBAL_DB_CONNECTION.close()})
/**
 *  App Configuration
 */
app.use('/static', express.static(__dirname+'/static'))
app.use(helmet());
app.use(cors())

app.use(express.json());
/**
 * Server Activation
 */
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

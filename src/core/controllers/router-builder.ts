import {Router} from "express";
import {RouteConfig} from "../shared/constants";

export class RouterBuilder {

    static build(config: Array<RouteConfig>): Router {
        const router = Router()
        config.forEach((route: RouteConfig)=>{
            router.use(route.controller.path, RouterBuilder.resolveRoute(route))
        });
        return router;
    }

    private static resolveRoute(route: RouteConfig): Router {
        const parentRouter = route.controller.router;
        if (route.children) {
            route.children.forEach((childRoute: RouteConfig) => {
                parentRouter.use(`/:key${childRoute.controller.path}`, RouterBuilder.resolveRoute(childRoute));
            });
        }
        return parentRouter;
    }
}

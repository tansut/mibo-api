import { sync } from "glob";
import { union } from "lodash";

export default class Config {
    public static port: number = 3000;
    public static apiRoutes: string = "./src/routes/api/**/*.ts";
    public static models: string = "./src/models/**/*.ts";
    public static middlewares: string = "./src/middlewares/**/*.ts";

    public static globFiles(location: string): Array<string> {
        return union([], sync(location));
    }
}
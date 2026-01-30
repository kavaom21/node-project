import routes from "./admin.routes.js";
import commonUtils from "../utils/commonUtils.js";

export default (router) => {
  return commonUtils.routeArray(routes, router);
};

import routes from "./route.js";
import commonUtils from "../utils/commonUtils.js";

export default (router) => {
  return commonUtils.routeArray(routes, router);
};

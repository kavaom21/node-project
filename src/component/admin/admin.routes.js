import * as adminController from "./controller/index.js";

export default [
  {
    path: "/admin/register",
    method: "post",
    controller: adminController.registerAdmin,
    isPublic: true
  },
  {
    path: "/admin/login",
    method: "post",
    controller: adminController.loginAdmin,
    isPublic: true
  },
  {
    path: "/admin/users",
    method: "get",
    controller: adminController.getUsersList,
    isPublic: false
  }
];

import * as adminController from "./controller/index.js";
import { adminRegisterValidation, loginValidation } from "../middelwares/validation.js";

export default [
  {
    path: "/admin/register",
    method: "post",
    controller: adminController.registerAdmin,
    validation: adminRegisterValidation,
    isPublic: true
  },
  {
    path: "/admin/login",
    method: "post",
    controller: adminController.loginAdmin,
    validation: loginValidation,
    isPublic: true
  },
  {
    path: "/admin/users",
    method: "get",
    controller: adminController.getUsersList,
    isPublic: false
  }
];

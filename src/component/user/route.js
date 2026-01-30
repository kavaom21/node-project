

import * as userController from "./controller/index.js";
import { registerValidation, loginValidation, addressValidation } from "../middelwares/validation.js";
import upload from "../middelwares/upload.middleware.js";

export default [
  {
    path: "/register",
    method: "post",
    controller: userController.register,
    validation: registerValidation,
    isPublic: true
  },

  {
    path: "/login",
    method: "post",
    controller: userController.login,
    validation: loginValidation,
    isPublic: true
  },

  {
    path: "/profile",
    method: "get",
    controller: userController.getProfile,
    isPublic: false
  },

  {
    path: "/logout",
    method: "post",
    controller: userController.logout,
    isPublic: false
  },


{
  path: "/address",
  method: "post",
  controller: userController.addAddress,
  validation: addressValidation,
  isPublic: false
},
{
  path: "/address",
  method: "get",
  controller: userController.getAddresses,
  isPublic: false
},
{
  path: "/address/primary",
  method: "put",
  controller: userController.setPrimaryAddress,
  isPublic: false
},


  {
    path: "/upload-profile",
    method: "post",
    controller: userController.uploadProfileImage,
    isPublic: false,
    middleware: [
      (req, res, next) => {
        req.moduleName = "profile";
        next();
      },
      upload.single("image")
    ]
  }
];


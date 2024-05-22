import * as aController from "./controller/registeration.js";
import { Router } from "express";
import { auth } from "../../middlewear/auth.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middlewear/validation.js";
const router = Router();
router.post("/signUp", validation(validators.signUp), aController.signUp);
router.get("/confirmEmail/:token", aController.confirmEmail);
router.get("/requestRfToken/:token", aController.requestRefToken);

router.post("/signIn",validation(validators.signIn) ,aController.signIn);
router.post("/requestCode", aController.sendCode)
router.post("/forgetPassword" ,aController.forgetPassword)
router.patch('/logout',validation(validators.logOut),auth(),aController.logOut)
router.delete('/delete', auth(),aController.deleteUser);


export default router;

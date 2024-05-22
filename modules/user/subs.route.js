import { Router } from "express";;
import * as aController from "./controller/subs.js";
import { auth } from "../../middlewear/auth.js";
// import expess from 'express'

const router = Router();



router.get("/prices",auth(),aController. prices);

router.post("/create-subscription", auth(),aController.createSubscription);

router.get("/subscription-status",auth() ,aController.subscriptionStatus);


export default router

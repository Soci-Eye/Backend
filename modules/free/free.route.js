import  {Router}  from "express";;

import * as acontroller from './controller/free.js'

const router = Router();

router.post('/searchTweets',acontroller.searchTweets )
router.get("/high",acontroller.getfreeAllHigh)
router.get("/aioutput",acontroller.getfreeAiOutput)
router.get("/preces",acontroller.getfreePrces)
// router.get('/positive_wordcloud',acontroller.getAllPictures)
router.get('/get-image/:type',acontroller.freeword)
router.get("/plot",acontroller.getAllfreePlotting)


export default router
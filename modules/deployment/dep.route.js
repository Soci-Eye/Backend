import  {Router}  from "express";;

import * as acontroller from '../../dep.js'

const router = Router();

router.post("/scrape",acontroller.scraping)
router.get("/high",acontroller.getAllHigh)
router.get("/aioutput",acontroller.getAiOutput)
router.get("/preces",acontroller.getPrces)
// router.get('/positive_wordcloud',acontroller.getAllPictures)
router.get('/get-image/:type',acontroller.word)
router.get("/plot",acontroller.getAllPlotting )


export default router
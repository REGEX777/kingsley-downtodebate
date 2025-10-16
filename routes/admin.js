import express from 'express';

// create route import
import motionControl from './control/motion.js'
import transcript from './control/transcript.js'
import news from './control/news.js'

const router = express.Router();


router.get('/', (req, res)=>{
    res.render('admin')
})

router.use('/motion', motionControl)
router.use('/transcripts', transcript)
router.use('/news', news)


export default router;
import express from 'express';

// create route import
import motionControl from './control/motion.js'
import transcript from './control/transcript.js'
import news from './control/news.js'
import users from './control/users.js'
import applications from './control/applications.js'
import debate from './control/debate.js'

const router = express.Router();


router.get('/', (req, res)=>{
    res.render('admin')
})

router.use('/motion', motionControl)
router.use('/transcripts', transcript)
router.use('/news', news)
router.use('/users', users)
router.use('/applications', applications)
router.use('/debate', debate)


export default router;
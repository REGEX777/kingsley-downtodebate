import express from 'express';

import Icon from '../models/Icon.js';

// create route import
import motionControl from './control/motion.js'
import transcript from './control/transcript.js'
import news from './control/news.js'
import users from './control/users.js'
import applications from './control/applications.js'
import debate from './control/debate.js'
import about from './control/about.js'
import graphics from './control/graphics.js'

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    let icon = await Icon.findOne({});
    if (!icon) {
      icon = new Icon({ icon: '✱' });
      await icon.save();
    }
    res.render('admin', { icon });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/icon', async(req, res)=>{
    try {
        const icon = await Icon.findOne({})
        if (!icon) {
            icon = new Icon({ icon: req.body.icon });
            await icon.save();
        }
        icon.icon = req.body.icon;

        await icon.save();
        req.flash('success', 'Successfully updated the icon.')
        res.redirect('/admin')
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');   
    }
})

router.use('/motion', motionControl)
router.use('/transcripts', transcript)
router.use('/news', news)
router.use('/users', users)
router.use('/applications', applications)
router.use('/debate', debate)
router.use('/about', about)
router.use('/graphics', graphics)


export default router;
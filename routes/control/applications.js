import express from 'express';
import Application from '../../models/Applications.js';

const router = express.Router();


router.get('/', async (req, res)=>{
    try {
        const applications = await Application.find({});
        res.render('admin/applications', {applications})
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})


export default router;
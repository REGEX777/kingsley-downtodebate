import express from 'express';
import Application from '../../models/Applications.js';

const router = express.Router();


router.get('/', async (req, res)=>{
    try {
        const applications = await Application.find({archived:false});
        const archivePage = false
        res.render('admin/applications', {applications, archivePage})
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})


router.get('/archive', async (req, res)=>{
    try {
        const applications = await Application.find({archived:true});
        const archivePage = true
        res.render('admin/applications', {applications, archivePage})
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})


router.post('/delete', async (req, res)=>{
    try {
        const deleted = await Application.findOneAndDelete({_id: req.body.id})

        req.flash('success', 'Deleted Successfully!')
        res.redirect('/admin/applications')
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})


router.post('/archive', async (req, res)=>{
    try {
        const archived = await Application.findByIdAndUpdate({_id: req.body.id}, {archived: true})

        req.flash('success', 'Archived Successfully!')
        res.redirect('/admin/applications')
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/unarchive', async (req, res)=>{
    try {
        const unarchived = await Application.findByIdAndUpdate({_id: req.body.id}, {archived: false})

        req.flash('success', 'Unarchived Successfully!')
        res.redirect('/admin/applications')
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})


export default router;
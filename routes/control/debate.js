import express from 'express'

import DebateFormat from '../../models/DebateFormats.js';
import TopicArea from '../../models/TopicArea.js';

const router = express.Router();

router.get('/', async (req, res)=>{
    try{
        const formats = await DebateFormat.find().lean();
        const topics = await TopicArea.find().lean();

        res.render('admin/debateSettings', {formats, topics})

    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/formats/delete', async (req, res)=>{
    try {
        const id = req.body.id;

        const format = await DebateFormat.findOneAndDelete({_id: id});

        if(!format){
            req.flash('error', 'Debate Format Not Found')
            return res.redirect('/admin/debate')
        }

        req.flash('success', 'Format Deleted Successfully!')
        return res.redirect('/admin/debate')
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/topics/delete', async (req, res)=>{
    try {
        const id = req.body.id;

        const topic = await TopicArea.findOneAndDelete({_id: id});

        if(!topic){
            req.flash('error', 'Topic Not Found')
            return res.redirect('/admin/debate')
        }

        req.flash('success', 'Topic Deleted Successfully!')
        return res.redirect('/admin/debate')
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/settings/debateFormat', async (req, res)=>{
    try{
        const newDebateFormat = new DebateFormat({
            name: req.body.name
        })

        await newDebateFormat.save()

        req.flash('success', 'New Debate Format Added!')
        res.redirect('/admin/debate')
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/settings/topicArea', async (req, res)=>{
    try{
        const newTopicArea = new TopicArea({
            name: req.body.name
        })

        await newTopicArea.save()

        req.flash('success', 'New Topic Area Added!')
        res.redirect('/admin/debate')
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})


export default router;
import express from 'express'
import News from '../../models/News.js';

const router = express.Router();


router.get('/', async (req, res)=>{
    try {
        const news = await News.find({})
        res.render('admin/news', {news})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/new', async(req, res)=>{
    try {
        const newNews = new News({
            title: req.body.title,
            body: req.body.body
        })

        await newNews.save();

        req.flash('success', 'News Saved Successfully!')
        res.redirect('/admin/news')
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/edit/:id', async (req, res)=>{
    try {
        const news = await News.findOne({_id: req.params.id});

        res.render('admin/edit_news', {news})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/edit', async (req, res)=>{
    try {
        const id = req.body.id;
        const news = await News.findOne({_id: id});

        let changes = false

        if(req.body.title !== news.title ){
            news.title = req.body.title
            changes = true
        }

        if(req.body.body !== news.body ){
            news.body = req.body.body
            changes = true
            
        }
        
        if (changes) {
            await news.save();
            req.flash('success', 'Changes Saved!');
        } else {
            req.flash('info', 'No changes to save.');
        }

        
        await news.save()

        req.flash('success', 'Changes Saved!')
        res.redirect(`/admin/news/edit/${id}`)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')  
    }
})

router.post('/delete', async (req, res)=>{
    try {
        const id = req.body.id;

        const deletedNews = await News.findOneAndDelete({_id: id});

        if(!deletedNews){
            req.flash('error', 'Something Went Wrong')
            res.redirect(`/admin/news`)
        }

        req.flash('success', 'News Deleted Successfully!')
        res.redirect(`/admin/news`)

        
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

export default router;
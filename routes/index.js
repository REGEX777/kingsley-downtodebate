import 'dotenv/config'
import express from 'express';
import striptags from 'striptags';
import he from 'he';

import Motion from '../models/Motion.js';
import Transcript from '../models/Transcriptions.js';
import News from '../models/News.js';
import Application from '../models/Applications.js';

const router = express.Router();


router.get('/', (req, res)=>{
    try{
      const meta = {
        title: "Elevate Your Discourse - Down To Debate",
        description: "A platform for thoughtful debate, motion generation, and intellectual exchange. Join a community dedicated to civil discourse.",
        url: `${process.env.URL}`,
      }
      res.render('index', {meta})
    }catch(err){
      console.log(err)
      res.status(500).send('Internal Server Error')
    }
})

router.get('/join-us', (req, res)=>{
  try {
      const meta = {
        title: "Join Us - Down To Debate",
        description: "Join Down To Debate Today!",
        url: `${process.env.URL}/join-us`,
      }
      res.render('joinus', {meta})
  } catch (err) {
      console.log(err)
      res.status(500).send('Internal Server Error')
  }
})

function normalizeIp(ip) {
  if (!ip) return ip;
  ip = ip.split('%')[0];
  const v4match = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4match) return v4match[1];
  return ip;
}

router.get('/about-us', (req, res)=>{
  try {
      const meta = {
        title: "About Us - Down To Debate",
        description: "Welcome to DownToDebate – your go-to platform for all things debate! Whether you're a seasoned debater looking to sharpen your skills or someone curious about starting your journey in debate, we’re here to support you every step of the way.",
        url: `${process.env.URL}/about-us`,
      }
      res.render('about', {meta})
  } catch (err) {
      console.log(err)
      res.status(500).send('Internal Server Error')
  }
})

router.post('/join-us', async (req, res) => {
  try {
    const rawIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const ip = normalizeIp(Array.isArray(rawIp) ? rawIp[0] : rawIp);

    const now = new Date();
    const THREE_MINUTES_MS = 3 * 60 * 1000;
    const cutoff = new Date(now.getTime() - THREE_MINUTES_MS);

    const recent = await Application.findOne({
      ip,
      time: { $gte: cutoff }
    }).lean();

    if (recent) {
      const retryAfterSeconds = Math.ceil((recent.time.getTime() + THREE_MINUTES_MS - now.getTime()) / 1000);
      
      req.flash('error', `Oh No, Looks like you just submitted an application try again in a few minutes!`)
      return res.redirect('/join-us');
    }

    const newApplication = new Application({
      email: req.body.email,
      message: req.body.message,
      ip,
      time: now
    });


    await newApplication.save();
    req.flash('success', `Success! Your application has been recieved, our team will reach out to you.`)
    return res.redirect('/join-us');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/motion', async (req, res)=>{
    try {
        const meta = {
          title: "About Us - Down To Debate",
          description: "Browse categories to find concise motion briefs and curated resources for each topic area.",
          url: `${process.env.URL}/motion`,
        }
        const motions = await Motion.find({});

        res.render('motion', {motions, meta})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/motions/:slug', async (req, res)=>{
    try {
        const motion = await Motion.findOne({slug: req.params.slug})
        const meta = {
          title: `${motion.title} - Down To Debate`,
          description: motion.description,
          url: `${process.env.URL}/motions/${req.params.slug}`,
        }
        res.render('category', {motion, meta})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/motions/view/i/:categorySlug/:motionSlug', async (req, res) => {
  try {
    const { categorySlug, motionSlug } = req.params;
    const category = await Motion.findOne({ slug: categorySlug }).lean();
    if (!category) return res.status(404).send('Category not found');

    const motion = (category.motions || []).find(m =>
      String(m.slug) === String(motionSlug) || String(m._id) === String(motionSlug)
    );

    if (!motion) return res.status(404).send('Motion not found');

    const meta = {
        title: `${category.title} - Down To Debate`,
        description: category.description,
        url: `${process.env.URL}/motions/${req.params.slug}`,
    }
    res.render('individual_motion', { motion, category, meta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/news', async (req, res)=>{
  try{
    const news = await News.find();
    const meta = {
        title: `News - Down To Debate`,
        description: 'News Updates By Down To Debate',
        url: `${process.env.URL}/news`,
    }
    res.render('news', {news, meta})
  }catch(err){
    console.log(error)
    res.status(500).send('Internal Server Error')
  }
})



router.get('/transcript', async (req, res) => {
  try {
    const transcripts = await Transcript.find({}).lean();
    const transcriptsWithPreview = transcripts.map(t => {
      let text = striptags(t.body || '');
      text = he.decode(text);
      text = text.replace(/\s+/g, ' ').trim();
      const max = 150;
      if (text.length <= max) return { ...t, preview: text };
      let snippet = text.slice(0, max);
      if (text[max] && !/\s/.test(text[max])) {
        const lastSpace = snippet.lastIndexOf(' ');
        if (lastSpace > 0) snippet = snippet.slice(0, lastSpace);
      }
      snippet = snippet.trim() + '...';
      return { ...t, preview: snippet };
    });
    const meta = {
        title: `Transcripts - Down To Debate`,
        description: 'Annotated, flowed transcripts for practice and study.',
        url: `${process.env.URL}/transcript`,
    }
    res.render('debate_transcripts', { transcripts: transcriptsWithPreview, meta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/transcript/:slug', async (req, res) => {
    try {
        const transcript = await Transcript.findOne({slug: req.params.slug})
        const meta = {
            title: `${transcript.title} - Down To Debate`,
            description: `Transcript Of ${transcript.title}`,
            url: `${process.env.URL}/transcript/${req.params.slug}`,
        }
        res.render('transcript', {transcript, meta})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/gen', (req, res)=>{
    try {
        const meta = {
            title: `Generate A Motion  - Down To Debate`,
            description: `Denerate A Motion`,
            url: `${process.env.URL}/gen`,
        }
        res.render('generate', {meta})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/generate-motion', async (req, res) => {
  try {
    const { format, difficulty, topic } = req.body;

    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You generate concise, smart debate motions." },
          { role: "user", content: `Generate only a motion for a ${difficulty} level ${format} debate on: ${topic}. NOTHING ELSE. Only provide plain text, avoid extra Markdown, HTML or <think> tags.` }
        ]
      })
    });

    const data = await response.json();
    let text = data?.choices?.[0]?.message?.content || "Something went wrong, try again later.";

    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    res.json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
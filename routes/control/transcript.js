import express from 'express';
import Transcript from '../../models/Transcriptions.js';
const router = express.Router();


function deltaToHtml(ops) {
  let html = '';
  let currentLine = '';
  function wrapInline(text, attrs = {}) {
    if (!text) return '';
    let out = text;
    out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (attrs.bold && attrs.italic) {
      out = `<strong><em>${out}</em></strong>`;
    } else if (attrs.bold) {
      out = `<strong>${out}</strong>`;
    } else if (attrs.italic) {
      out = `<em>${out}</em>`;
    }
    if (attrs.link) {
      const href = String(attrs.link).replace(/"/g, '&quot;');
      out = `<a href="${href}" target="_blank" rel="noopener noreferrer">${out}</a>`;
    }
    return out;
  }
  for (const op of ops) {
    const insert = op.insert;
    const attrs = op.attributes || {};
    if (typeof insert === 'string') {
      const parts = insert.split('\n');
      for (let i = 0; i < parts.length; i++) {
        const segment = parts[i];
        if (segment.length > 0) {
          currentLine += wrapInline(segment, attrs);
        }
        if (i < parts.length - 1) {
          if (attrs.blockquote) {
            html += `<blockquote>${currentLine}</blockquote>`;
          } else {
            html += `<p>${currentLine}</p>`;
          }
          currentLine = '';
        }
      }
    } else {
    }
  }
  if (currentLine.length > 0) {
    html += `<p>${currentLine}</p>`;
  }
  return html;
}



router.get('/', async (req, res)=>{
    try{
        const transcripts = await Transcript.find({});
        res.render('admin/transcript/transcripts', {transcripts})
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/edit/:id', async (req, res)=>{
    try{
        const id = req.params.id;
        const transcript = await Transcript.findOne({_id: id}).lean();
        res.render('admin/transcript/edit_transcript', {transcript})
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/edit', async (req, res)=>{
    try {
        const transcript = await Transcript.findOne({_id: req.body.id})
        
        if(transcript.original!==req.body.original){
            transcript.original = req.body.original
        }

        const ops = JSON.parse(req.body.original)

        const html = deltaToHtml(ops);
        if(transcript.body!==html){
            transcript.body = html
        }

        if(transcript.title!==req.body.title){
            transcript.title = req.body.title;
        }

        await transcript.save()

        req.flash('success', 'Changes Made Successfully!')

        res.redirect(`/admin/transcripts/edit/${transcript._id}`)
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.get('/new', (req, res)=>[
    res.render('admin/transcript/new_transcript')
])

router.post('/delete', async (req, res)=>{
  try {
    const id = req.body.id;
    console.log(id)
    const deletedTranscript = await Transcript.findOneAndDelete({_id: id})
    if(!deletedTranscript){
      req.flash('error', "Not Found")
      res.redirect('/admin/transcripts')
    }
    req.flash('success', "Successfully Deleted")
    res.redirect('/admin/transcripts')
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/new', async (req, res)=>{
    try{
        const { title, body } = req.body;
        const ops = JSON.parse(body);
        const html = deltaToHtml(ops)
        
        const transcript = new Transcript({
            title: title,
            original: body,
            body: html
        })

        await transcript.save()
        req.flash('success', 'Successfully added a transcript.')
        res.redirect('/admin/transcripts')
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }

})


export default router;
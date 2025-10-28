import express from 'express'
import About from '../../models/About.js';

const router = express.Router()

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
    try {
        const about = await About.findOne({});
        res.render('admin/about', {about})

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body.original;
    console.log(req.body)
    const ops = JSON.parse(body);
    const html = deltaToHtml(ops);

    const result = await About.findOneAndUpdate(
      {},                       
      { about: html, original: body },        
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.flash('success', 'Success');
    return res.redirect('/admin/about');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
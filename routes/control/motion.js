import express from 'express';
import Motion from '../../models/Motion.js';
import slugify from 'slugify';

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
    const motions = await Motion.find({}).lean();

    res.render('admin/manipulate/motions', {motions})
})

router.get('/view/:id', async (req, res)=>{
    try {
        const motion = await Motion.findOne({_id: req.params.id}).lean();
        res.render('admin/manipulate/view_motions', {motion})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})


router.get('/category/add/:id', async (req, res)=>{
    try {
        const motion = await Motion.findOne({_id: req.params.id}).lean();

        res.render('admin/manipulate/_motion', {motion})
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})





router.post('/category/:id/create', async (req, res)=>{
    try {

        const id = req.params.id;
        const { title, body } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ ok: false, error: 'Missing title' });
        }


        const ops = JSON.parse(body)

        const html = deltaToHtml(ops)

        const newMotion = {
            name: title.trim(),
            slug: slugify(title.trim(), { lower: true, strict: true }),
            body: html
        };

        const updated = await Motion.findByIdAndUpdate(
            id,
            { $push: { motions: newMotion } },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ ok: false, error: 'Motion category not found' });
        }

        req.flash('success', 'Motion added');
        return res.redirect(`/admin/motion/view/${id}`);
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/edit', async (req, res)=>{
    try{
        console.log(req.body)
        const { id, title } = req.body;
        let { description } = req.body;

        if (!id) {
            req.flash('error', 'Missing id.');
            return res.redirect('/admin/motion');
        }

        const newTitle = (title || '').trim();
        if (!newTitle) {
            req.flash('error', 'Title cannot be empty.');
            return res.redirect(`/admin/motion/${id}/edit`);
        }

        const updated = await Motion.findByIdAndUpdate(
            id,
            { $set: { title: newTitle, description } },
            { new: true, runValidators: true }
        );

        if (!updated) {
            req.flash('error', 'Motion category not found.');
            return res.redirect('/admin/motion');
        }

        req.flash('success', 'Updated title and description.');
        return res.redirect(`/admin/motion/view/${id}`);
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/create', async (req, res)=>{
    try{
        const newMotion = new Motion({
            title: req.body.title,
            description: req.body.description
        })

        await newMotion.save().then(err=>console.log(err))

        req.flash('success', "New motion category created.")
        res.redirect('/admin/motion')
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error')
    }
})

router.post('/delete', async (req, res)=>{
    try{
        const deletedMotion = await Motion.findOneAndDelete({_id: req.body.id})

        if(!deletedMotion){
            req.flash('error', 'Motion not found.')
            res.redirect('/admin/motion')
        }

        req.flash('success', 'Motion deleted successfully!')
        res.redirect('/admin/motion')
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/category/delete', async (req, res) => {
  try {
    const { motionCategoryId, motionId } = req.body;
    const result = await Motion.updateOne(
      { _id: motionCategoryId },
      { $pull: { motions: { _id: motionId } } }
    );
    if (result.modifiedCount && result.modifiedCount > 0) {
        req.flash('error', 'Deleted Succesfully')
        res.redirect(`/admin/motion/view/${motionCategoryId}`)
    }
    return res.status(404).json({ success: false, message: 'Motion or category not found' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// motion category edit
router.get('/edit/:categoryId/:motionId', async (req, res) => {
  try {
    const { categoryId, motionId } = req.params;
    const motionCategory = await Motion.findById(categoryId);
    if (!motionCategory) return res.status(404).send('Category not found');

    const motion = motionCategory.motions.id(motionId) || motionCategory.motions.find(m => String(m._id) === String(motionId));
    if (!motion) return res.status(404).send('Motion not found');

    res.render('admin/manipulate/edit_motions', {
      motion: motion.toObject ? motion.toObject() : motion,
      category: motionCategory.toObject ? motionCategory.toObject() : motionCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/edit/individual', async (req, res) => {
  try {
    const { title, original, htmlBody, categoryId, motionId  } = req.body;

    const category = await Motion.findById(categoryId);
    if (!category) return res.status(404).send('Category not found');

    const motion = category.motions.id(motionId) || category.motions.find(m => String(m._id) === String(motionId));
    if (!motion) return res.status(404).send('Motion not found');

    if (typeof title === 'string' && title.trim().length) {
      motion.name = title.trim();
      motion.slug = slugify(motion.name, { lower: true, strict: true });
    }

    if (typeof original === 'string' && original.trim().length) {
      try {
        JSON.parse(original);
        motion.original = original;
      } catch (err) {
        return res.status(400).send('Invalid original JSON');
      }
    }

    if (typeof htmlBody === 'string') {
      motion.body = htmlBody;
    }

    await category.save();

    if (req.flash) req.flash('success', 'Motion updated');
    return res.redirect(`/admin/motion/edit/${categoryId}/${motionId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});



router.post('/', (req, res)=>{
    console.log('/')
})

export default router;
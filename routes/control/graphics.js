import express from 'express'
import path from 'path';
import fs from 'fs';

import Graphic from '../../models/Graphics.js';
import upload from '../../middleware/multerUpload.js';

const router = express.Router();

async function deleteIfExists(publicPath) {
    if (!publicPath) return;
    const fp = path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
    try {
        await fs.access(fp);
        await fs.unlink(fp);
    } catch (e) {}
}

router.get('/', async (req, res) => {
    try {
        const banner = await Graphic.findOne({
            type: 'banner'
        }).sort({
            uploadedAt: -1
        });
        const logo = await Graphic.findOne({
            type: 'logo'
        }).sort({
            uploadedAt: -1
        });

        res.render('admin/graphics', {
            banner,
            logo
        })
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/banner', upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error', 'No file uploaded')
            return res.redirect('/admin/graphics')
        }
        const publicPath = `/uploads/${req.file.filename}`;
        const existing = await Graphic.findOne({
            type: 'banner'
        }).sort({
            uploadedAt: -1
        });
        if (existing) {
            if (existing.path !== publicPath) {
                await deleteIfExists(existing.path);
            }
            existing.filename = req.file.filename;
            existing.originalName = req.file.originalname;
            existing.path = publicPath;
            existing.mimeType = req.file.mimetype;
            existing.size = req.file.size;
            existing.uploadedAt = new Date();
            await existing.save();
            req.flash('success', `Uploaded Successfully`)
            return res.redirect('/admin/graphics')
        } else {
            const g = await Graphic.create({
                type: 'banner',
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: publicPath,
                mimeType: req.file.mimetype,
                size: req.file.size
            });
            req.flash('success', `Uploaded Successfully`)
            return res.redirect('/admin/graphics')
        }
    } catch (err) {
        req.flash('error', `${err.message} - Upload Failed`)
        res.redirect('/admin/graphics')
    }
});

router.post('/logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error', 'No file uploaded')
            return res.redirect('/admin/graphics')
        }
        const publicPath = `/uploads/${req.file.filename}`;
        const existing = await Graphic.findOne({
            type: 'logo'
        }).sort({
            uploadedAt: -1
        });
        if (existing) {
            if (existing.path !== publicPath) {
                await deleteIfExists(existing.path);
            }
            existing.filename = req.file.filename;
            existing.originalName = req.file.originalname;
            existing.path = publicPath;
            existing.mimeType = req.file.mimetype;
            existing.size = req.file.size;
            existing.uploadedAt = new Date();
            await existing.save();
            req.flash('success', `Uploaded Successfully`)
            return res.redirect('/admin/graphics')
        } else {
            const g = await Graphic.create({
                type: 'logo',
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: publicPath,
                mimeType: req.file.mimetype,
                size: req.file.size
            });
            req.flash('success', `Uploaded Successfully`)
            return res.redirect('/admin/graphics')
        }
    } catch (err) {
        req.flash('error', `${err.message} - Upload Failed`)
        res.redirect('/admin/graphics')
    }
});


export default router;
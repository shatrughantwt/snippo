const express = require('express');
const Snippet = require('../models/Snippet');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, code, lang, ext, color, lines, preview } = req.body;

    const snippet = new Snippet({
      title,
      code,
      lang,
      ext,
      color,
      lines,
      preview,
      user: req.user.userId
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user.userId });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    await Snippet.deleteOne({ _id: req.params.id });
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

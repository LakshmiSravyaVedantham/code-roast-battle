const express = require('express');
const router = express.Router();
const { roastCode } = require('../services/ai');

router.post('/', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });
    const result = await roastCode(code, language);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const roastRoutes = require('./routes/roast');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/roast', roastRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'code-roast-battle' });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Code Roast Battle API running on port ${PORT}`);
});

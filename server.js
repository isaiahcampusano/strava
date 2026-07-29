const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

app.get('/api/clubs', async (req, res) => {
    try {
        const { data, error } = await supabase.from('clubs').select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clubs', async (req, res) => {
    try {
        const { name, description, logo_url, location } = req.body;
        const { data, error } = await supabase
            .from('clubs')
            .insert([{ name, description, logo_url, location }]);

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});

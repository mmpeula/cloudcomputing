const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const USER_API_BASE = 'http://localhost:5000';


app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.get(`${USER_API_BASE}/users`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});


app.post('/api/users', async (req, res) => {
    try {
        const response = await axios.post(`${USER_API_BASE}/users`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const response = await axios.get(`${USER_API_BASE}/users/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ error: 'User not found' });
    }
});


app.put('/api/users/:id', async (req, res) => {
    try {
        const response = await axios.put(`${USER_API_BASE}/users/${req.params.id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ error: 'Error updating user' });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        await axios.delete(`${USER_API_BASE}/users/${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: 'Error deleting user' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend proxy running at http://localhost:${PORT}`);
});

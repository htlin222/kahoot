import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Game state
let currentPin = null;
let players = [];

app.get('/api/teacher/pin', (req, res) => {
    if (!currentPin) {
        currentPin = Math.floor(1000 + Math.random() * 9000).toString();
        console.log('Generated new PIN:', currentPin);
    }
    console.log('Sending PIN:', currentPin);
    res.json({ pin: currentPin });
});

app.post('/api/play/join', (req, res) => {
    const { pin, name } = req.body;
    console.log('Join attempt:', { pin, name, currentPin });
    
    if (pin !== currentPin) {
        console.log('PIN mismatch');
        return res.status(400).json({ error: 'Incorrect PIN' });
    }

    if (players.includes(name)) {
        console.log('Duplicate name');
        return res.status(400).json({ error: 'Name already taken' });
    }

    players.push(name);
    console.log('Player joined:', name);
    console.log('Current players:', players);
    res.json({ success: true });
});

app.get('/api/teacher/players', (req, res) => {
    res.json({ players });
});

app.post('/api/teacher/reset', (req, res) => {
    currentPin = Math.floor(1000 + Math.random() * 9000).toString();
    players = [];
    console.log('Game reset. New PIN:', currentPin);
    res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Current game state:', { currentPin, players });
});

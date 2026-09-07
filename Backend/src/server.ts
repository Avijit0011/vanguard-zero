import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { AuthService } from './auth/authService.js';
import { Matchmaker } from './matchmaking/matchmaker.js';
import { MMRService } from './ranking/mmrService.js';
import { ValidationService } from './anticheat/validationService.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());
app.use(cors());
app.use(helmet());

const authService = new AuthService();
const matchmaker = new Matchmaker();
const mmrService = new MMRService();
const anticheat = new ValidationService();

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'VANGUARD: ZERO Backend Server', timestamp: new Date() });
});

// Auth Routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await authService.register(username, email, password);
        res.json({ success: true, user });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const session = await authService.login(email, password);
        res.json({ success: true, session });
    } catch (err: any) {
        res.status(401).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/guest', async (req: Request, res: Response) => {
    const session = await authService.createGuestSession();
    res.json({ success: true, session });
});

// Matchmaking Queue Route
app.post('/api/matchmaking/queue', (req: Request, res: Response) => {
    const { playerId, mode, mmr, partySize } = req.body;
    const ticket = matchmaker.enqueuePlayer({ playerId, mode, mmr, partySize });
    res.json({ success: true, ticket });
});

// Player Stats & Ranking
app.get('/api/player/:id/profile', (req: Request, res: Response) => {
    const playerId = req.params.id;
    const rankInfo = mmrService.getRankDetails(1250); // Sample MMR
    res.json({
        playerId,
        level: 42,
        rank: rankInfo,
        stats: {
            matchesPlayed: 120,
            winRate: 58.3,
            kdRatio: 1.35,
            headshotPercentage: 44.2,
            favoriteCharacter: 'Nyx',
            favoriteWeapon: 'Assault Rifle (Aether V)'
        }
    });
});

// WebSockets for Real-Time Party & Lobby
io.on('connection', (socket) => {
    console.log(`[Vanguard WS] Client connected: ${socket.id}`);

    socket.on('join_queue', (data) => {
        const ticket = matchmaker.enqueuePlayer({ playerId: data.playerId, mode: data.mode, mmr: data.mmr || 1000, partySize: 1 });
        socket.emit('queue_joined', ticket);
    });

    socket.on('submit_hit_validation', (data) => {
        const isValid = anticheat.validateHitscanShot(data.shooterPos, data.targetPos, data.weaponId, data.timestamp);
        socket.emit('validation_result', { isValid });
    });

    socket.on('disconnect', () => {
        console.log(`[Vanguard WS] Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  VANGUARD: ZERO Authoritative Backend Active`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`====================================================`);
});

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'vanguard_zero_secret_key_2026';

export interface UserSession {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
        isGuest: boolean;
    };
}

export class AuthService {
    private users: Map<string, any> = new Map();

    async register(username: string, email: string, password: string) {
        if (this.users.has(email)) {
            throw new Error('User email already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = {
            id: `user_${Math.random().toString(36).substring(2, 9)}`,
            username,
            email,
            passwordHash,
            createdAt: new Date()
        };

        this.users.set(email, user);
        return { id: user.id, username: user.username, email: user.email };
    }

    async login(email: string, password: string): Promise<UserSession> {
        const user = this.users.get(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        return {
            token,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email, isGuest: false }
        };
    }

    async createGuestSession(): Promise<UserSession> {
        const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
        const username = `Agent_${Math.floor(1000 + Math.random() * 9000)}`;
        const token = jwt.sign({ id: guestId, isGuest: true }, JWT_SECRET, { expiresIn: '12h' });

        return {
            token,
            refreshToken: '',
            user: { id: guestId, username, email: `${guestId}@vanguard.local`, isGuest: true }
        };
    }
}

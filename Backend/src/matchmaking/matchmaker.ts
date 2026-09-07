export interface QueueTicket {
    ticketId: string;
    playerId: string;
    mode: 'Competitive' | 'Unrated' | 'Deathmatch';
    mmr: number;
    partySize: number;
    enqueuedAt: number;
}

export interface MatchAllocation {
    matchId: string;
    serverIp: string;
    port: number;
    teamA: string[];
    teamB: string[];
    map: string;
}

export class Matchmaker {
    private queues: Map<string, QueueTicket[]> = new Map([
        ['Competitive', []],
        ['Unrated', []],
        ['Deathmatch', []]
    ]);

    enqueuePlayer(params: { playerId: string; mode: 'Competitive' | 'Unrated' | 'Deathmatch'; mmr: number; partySize: number }): QueueTicket {
        const ticket: QueueTicket = {
            ticketId: `tkt_${Math.random().toString(36).substring(2, 9)}`,
            playerId: params.playerId,
            mode: params.mode,
            mmr: params.mmr,
            partySize: params.partySize,
            enqueuedAt: Date.now()
        };

        const list = this.queues.get(params.mode) || [];
        list.push(ticket);
        this.queues.set(params.mode, list);

        this.processQueue(params.mode);
        return ticket;
    }

    private processQueue(mode: string) {
        const list = this.queues.get(mode);
        if (!list || list.length < 10 && mode !== 'Deathmatch') return;

        // ELO proximity pairing algorithm
        list.sort((a, b) => a.mmr - b.mmr);

        const teamA = list.slice(0, 5).map(t => t.playerId);
        const teamB = list.slice(5, 10).map(t => t.playerId);

        // Remove matched players from queue
        this.queues.set(mode, list.slice(10));

        const match: MatchAllocation = {
            matchId: `match_${Math.random().toString(36).substring(2, 9)}`,
            serverIp: '18.216.45.102',
            port: 7777,
            teamA,
            teamB,
            map: 'Nexus Prime'
        };

        console.log(`[Matchmaker] Match allocated: ${match.matchId} on map ${match.map}`);
        return match;
    }
}

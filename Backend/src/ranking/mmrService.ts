export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Elite';

export interface RankDetails {
    tier: RankTier;
    subDivision: 1 | 2 | 3;
    rankRating: number; // 0 to 100 RR
    totalMMR: number;
}

export class MMRService {
    calculateMMRChange(params: {
        playerMMR: number;
        teamAvgMMR: number;
        enemyAvgMMR: number;
        isWinner: boolean;
        kills: number;
        deaths: number;
        assists: number;
        roundDifference: number;
    }): number {
        const baseChange = params.isWinner ? 20 : -18;
        const mmrDiffFactor = (params.enemyAvgMMR - params.playerMMR) * 0.02;
        const KDA = (params.kills + (params.assists * 0.5)) / Math.max(1, params.deaths);
        const performanceBonus = Math.floor((KDA - 1.0) * 4);
        const marginBonus = Math.floor(params.roundDifference * 0.8);

        let totalChange = baseChange + mmrDiffFactor + performanceBonus + marginBonus;

        // Clamp change between -35 and +35 RR per match
        return Math.max(-35, Math.min(35, Math.round(totalChange)));
    }

    getRankDetails(mmr: number): RankDetails {
        const tiers: RankTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Elite'];
        const tierIndex = Math.min(7, Math.floor(mmr / 300));
        const remaining = mmr % 300;
        const subDivision = (Math.min(3, Math.floor(remaining / 100) + 1)) as (1 | 2 | 3);
        const rankRating = remaining % 100;

        return {
            tier: tiers[tierIndex],
            subDivision,
            rankRating,
            totalMMR: mmr
        };
    }
}

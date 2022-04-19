import { Game, LearnsetType } from '../types';
import { LearnsetRow } from './LearnsetRow';

export class LearnsetTable {
    private readonly game: Game;
    private readonly learnsetType: LearnsetType;
    private readonly pkmnName: string;
    private readonly rows: LearnsetRow[];

    public constructor(pkmnName: string, learnsetType: LearnsetType, game: Game, rows: LearnsetRow[]) {
        this.pkmnName = pkmnName;
        this.learnsetType = learnsetType;
        this.game = game;
        this.rows = rows;
    }

    public getLearnsetType(): LearnsetType {
        return this.learnsetType;
    }

    public getGame(): Game {
        return this.game;
    }

    public getPkmnName(): string {
        return this.pkmnName;
    }

    public getMoveNames(): string[] {
        return this.rows.map((move) => move.moveName);
    }
}

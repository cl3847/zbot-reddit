import {CustomSong, SearchedLevel, User} from "gd.js";
import {gd} from "../index";

export async function searchLevelInfo(query: string, creator?: string): Promise<QueryResult | null> {
    const levelResult = await gd.levels.search({query}, 1);
    if (!levelResult) return null;

    const result = new QueryResult(levelResult[0])//await levelResult[0].resolve());
    if (!result || !result.level) return null
    result.creator = result.level?.creator.accountID ? await gd.users.getByAccountID(result.level.creator.accountID) : null;

    return result;
}

export class QueryResult {
    public creator?: User | null;
    public level: SearchedLevel;

    constructor(level: SearchedLevel) {
        this.level = level;
    }

    getCreatorUsername(): string {
        return this.creator ? this.creator.username : "-";
    }

    toString(): string {
        return `**Level:** *${this.level.name}* by ${this.getCreatorUsername()} (${this.level.id})  \n` +
            `**Description:**  \n` +
            `> ${this.level.description}\n\n` +
            `**Difficulty:** ${this.level.difficulty.stars}* (${this.level.difficulty.level.pretty})  \n` +
            `**Stats:** ${this.level.stats.downloads} downloads | ${this.level.stats.likes} likes | ${this.level.stats.length.pretty}  \n` +
            `**Song:** *${this.level.song.name}* by ${this.level.song instanceof CustomSong ? this.level.song.author.name : this.level.song.authorName} (${this.level.song.id})  \n`;
    }
}
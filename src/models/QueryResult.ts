import type {SearchedLevel} from "gd.js/esm/entities/level.d.ts";
import type { User } from "gd.js/esm/entities/user.d.ts";
import {gd} from "../utils/gd.ts";

export async function searchLevelInfo(query: string): Promise<QueryResult | null> {
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
        // song may be a custom song or a default song
        const song = this.level.song;
        const songAuthor = 'author' in song ? song.author.name : song.authorName;

        // level may not have a description in which case skip the field entirely
        const description = this.level.description ? `**Description:**  \n> ${this.level.description}\n\n` : "";

        return `**Level:** *${this.level.name}* by ${this.getCreatorUsername()} (${this.level.id})  \n` +
            description +
            `**Difficulty:** ${this.level.difficulty.stars}* (${this.level.difficulty.level.pretty})  \n` +
            `**Stats:** ${this.level.stats.downloads} downloads | ${this.level.stats.likes} likes | ${this.level.stats.length.pretty}  \n` +
            `**Song:** *${this.level.song.name}* by ${songAuthor} (${this.level.song.id})  \n`;
    }
}
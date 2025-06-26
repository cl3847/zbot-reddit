import type {Submission, VoteableContent} from "snoowrap";
import {searchLevelInfo} from "../models/QueryResult.ts";
import log from "../utils/logger.ts";

async function handleSearch(query: string): Promise<string | null> {
    let replyTexts: string[] = [];
    try {
        const searchResult = await searchLevelInfo(query);
        if (searchResult) replyTexts.push(searchResult.toString());
        else return null;
    } catch(e) {
        log.error(e);
    }

    return replyTexts.join("\n\n___\n\n") + "\n\n___\n\n" + "^This ^is ^an ^automated ^message. ^| ^by ^[sayajiaji](https://www.reddit.com/user/Sayajiaji) ^| ^[instructions](https://www.reddit.com/r/geometrydash/wiki/bot)";
}

/**
 * Finds the level ID in a given string.
 * @param s The string to search for the level ID.
 */
function findId(s: string): string | null {
    const patterns = [
        { regex: /(?:^|(?<= )|[.?!-\(\[])id(?: is|[:=])? ?([0-9]{6,10})(?=$| |[.?!-)\]\)])/i, groupIndex: 1 },
        { regex: /(?:^|(?<= ))\\?(\[|\()([0-9]{6,10})\\?(\]|\))(?=$| )/, groupIndex: 2 }
    ];

    for (const pattern of patterns) {
        const matches = s.match(pattern.regex);
        if (matches) {
            return matches[pattern.groupIndex]!;
        }
    }
    return null;
}

export const execute = async (submission: Submission) => {
    if (submission.author.name === process.env.REDDIT_USERNAME) return; // return if the submission is made by the bot itself, probably never a concern but just in case
    if (new Date().getTime() - 30000 > submission.created_utc * 1000) return; // make sure the submission is recent (within 30 seconds)

    log.info(`New submission detected: [${submission.id}] | title: ${submission.title}`);

    const id = findId(submission.title);
    if (id) {
        log.success(`Found ID (${id}) in submission [${submission.id}]`);
        const replyText = await handleSearch(id);

        try {
            const reply: VoteableContent = await submission.reply(replyText);
            const comment: VoteableContent = reply.fetch();
            comment.distinguish({sticky: true}).catch(() => log.warn(`Failed to distinguish comment on [${submission.id}] (may lack permissions)`));
            log.success(`Sent a reply to submission [${submission.id}]`);
        } catch (err: any) {
            log.error(`Failed to reply to submission [${submission.id}]: ${err.message}`);
        }
    }
}

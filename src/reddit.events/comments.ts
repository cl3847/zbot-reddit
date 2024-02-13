import {Comment} from "snoowrap";
import {searchLevelInfo} from "../classes/QueryResult";

async function handleSearch(queries: string[]): Promise<string> {
    let replyTexts: string[] = [];
    let i = 0;
    const filteredQueries = Array.from(new Set(queries)).slice(0, 5);
    for (const query of filteredQueries) {
        console.log("New Query: " + query)
        i++;
        try {
            const searchResult = await searchLevelInfo(query);
            if (searchResult) replyTexts.push(searchResult.toString());
        } catch(e) {
            console.error(e);
        }
    }
    return replyTexts.join("\n\n___\n\n") + "\n\n___\n\n" + "^This ^is ^an ^automated ^message. | ^by ^sayajiaji";
}
export const execute = async (comment: Comment) => {
    if (comment.author.name === "zbot-gd") return;
    const universalBracketRegex = /(?:^|(?<= ))\\?\[([a-zA-Z0-9 \-]{1,20})\\?\](?=$| )/gm;
    const matches = comment.body?.match(universalBracketRegex)
    if (matches !== null) {
        const cleanMatches: string[] = []
        matches.forEach(item => {
            const match = item.match(/\[([^\][]*?)\\?\]/);
            if (match) {
                cleanMatches.push(match[1].trim());
            }
        })
        const replyText = await handleSearch(cleanMatches.slice(0,3));
        comment.reply(replyText);
        console.log("Sent a comment!")
    }
}

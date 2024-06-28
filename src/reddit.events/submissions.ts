import {ReplyableContent, Submission, Listing} from "snoowrap";
import {searchLevelInfo} from "../classes/QueryResult";
import {client, reddit} from "../index";
import {TextChannel} from "discord.js";

function equals(word1: string, word2: string, mistakesAllowed: number): boolean {
    if(word1 === word2) // if word1 equals word2, we can always return true
        return true;

    if(word1.length === word2.length) { // if word1 is as long as word 2
        for(let i = 0; i < word1.length; i++) { // go from first to last character index the words
            if(word1.charAt(i) != word2.charAt(i)) { // if this character from word 1 does not equal the character from word 2
                mistakesAllowed--; // reduce one mistake allowed
                if(mistakesAllowed < 0) { // and if you have more mistakes than allowed
                    return false; // return false
                }
            }
        }
        return true;
    }

    return false;
}

async function handleSearch(query: string): Promise<string | null> {
    let replyTexts: string[] = [];

    console.log("New Query: " + query)
    try {
        const searchResult = await searchLevelInfo(query);
        if (searchResult) replyTexts.push(searchResult.toString());
        else return null;
    } catch(e) {
        console.error(e);
    }

    return replyTexts.join("\n\n___\n\n") + "\n\n___\n\n" + "^This ^is ^an ^automated ^message. ^| ^by ^[sayajiaji](https://www.reddit.com/user/Sayajiaji) ^| ^[instructions](https://www.reddit.com/r/geometrydash/wiki/bot)";
}

async function checkIfRepost(submission: Submission) {
    const results: Listing<Submission> = await reddit.getSubreddit("geometrydash").search({query: submission.title.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")});
    const match = results.find(post =>
        equals(post.title.replace(/[.,\/#!$%\^&\*;:{}=\-_`~() ]/g,""),submission.title.replace(/[.,\/#!$%\^&\*;:{}=\-_`~() ]/g,""), 1)
        && post.id !== submission.id && !post.is_self
        && post.author.name !== submission.author.name
    );
    if (match) {
        console.log("Suspected repost found!");
        (client.channels.cache.get("1114271325784113172") as TextChannel)
            .send(`**Suspected Repost:**\nRepost: [${submission.title}](https://www.reddit.com${submission.permalink})\nOriginal: [${match.title}](https://www.reddit.com${match.permalink})`)
    }
}

export const execute = async (submission: Submission) => {
    if (submission.author.name === "zbot-gd") return;
    if (new Date().getTime() - 30000 > submission.created_utc * 1000) return; // 30 secs

    // Check if post is a repost bot
    if (!submission.is_self) checkIfRepost(submission)

    const idRegex = /(?:^|(?<= )|[.?!-\(\[])id(?: is|[:=])? ?([0-9]{6,10})(?=$| |[.?!-)\]\)])/i; // id is ..., id: ...
    const bpRegex = /(?:^|(?<= ))\\?(\[|\()([0-9]{6,10})\\?(\]|\))(?=$| )/; // bracket and parens
    const idMatches = submission.title?.match(idRegex);
    const bpMatches = submission.title?.match(bpRegex);

    // only one match
    let replyText: string | null = null;
    if (idMatches !== null) replyText = await handleSearch(idMatches[1]);
    else if (bpMatches !== null) replyText = await handleSearch(bpMatches[2]);

    if (replyText) {
        submission.reply(replyText).then(async reply => {
            reply.fetch().then(comment => {
                comment.distinguish({sticky: true})
                console.log("Sent a comment!")
            })
        })
    }
}

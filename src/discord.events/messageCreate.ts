import {Events, Message} from 'discord.js';
import {gd, reddit} from '../index';
import {searchLevelInfo} from "../models/QueryResult";
import log from "../utils/logger";

async function handleDailyWeeklyLevel(msg: Message) {
    const embed = msg.embeds[0];

    const type = embed.author?.name.includes("Daily level") ? "Daily" :
        embed.author?.name.includes("Weekly demon") ? "Weekly Demon" : null;
    const numberMatch = embed.author?.name.match(/#(\d+)/);
    const number = numberMatch ? numberMatch[0] : null;
    const idMatch = embed.footer?.text.match(/Level ID: (\d+)/);
    const id = idMatch ? idMatch[1] : null;

    if (!type || !number || !id) {
        log.error("Failed to parse daily/weekly level embed.");
        return;
    }

    const searchResult = await searchLevelInfo(id);

    if (!searchResult) {
        log.error("Failed to search for level information from GD servers.");
        return;
    }

    const level = searchResult.level;
    const creator = searchResult.creator;
    const flairID = type === "Daily" ? "b891d7a0-c89d-11ee-8a06-fad7ba041385" : "b891d7a0-c89d-11ee-8a06-fad7ba041385";

    log.info(`Type: ${type}, Number: ${number}, ID: ${id}`);

    reddit.submitSelfpost({
        title: `[${level.award.pretty.toUpperCase()}] ${type} ${number} - ${level.name} by ${creator?.username} (${level.id}) Discussion Thread`,
        text: searchResult.toString() + `  \nUse this thread for discussion about the level!` + "\n\n___\n\n" +
            "^This ^is ^an ^automated ^message. ^| ^by ^[sayajiaji](https://www.reddit.com/user/Sayajiaji) ^| ^[instructions](https://www.reddit.com/r/geometrydash/wiki/bot)\n\n",
        subredditName: "geometrydash",
        flairId: flairID
    }).then((post: any) => {
        log.success("POSTED TO REDDIT: " + post.url);
    }).catch((err: any) => {
        log.error(err);
    });
}

module.exports = {
    name: Events.MessageCreate,
    once: true,
    async execute(msg: Message) {
        //msg = await msg.channel.messages.fetch("1208931805177057331");
        if (msg.embeds.length > 0) {
            try {
                if (msg.channel.id === "1205999484056633354") await handleDailyWeeklyLevel(msg); // daily or weekly level
            } catch (err) {
                log.error(err.message)
            }
        }
    },
};

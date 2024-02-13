import {Events, Message} from 'discord.js';
import {gd, reddit} from '../index';
import {CustomSong, SearchedLevel} from "gd.js";

async function handleDailyWeeklyLevel(msg: Message) {
    const embed = msg.embeds[0];

    const type = embed.author?.name.includes("Daily level") ? "Daily" :
        embed.author?.name.includes("Weekly demon") ? "Weekly Demon" : null;
    const numberMatch = embed.author?.name.match(/#(\d+)/);
    const number = numberMatch ? numberMatch[0] : null;
    const idMatch = embed.footer?.text.match(/Level ID: (\d+)/);
    const id = idMatch ? idMatch[0] : null;

    if (!type || !number || !id) {
        console.error("Failed to parse daily/weekly level embed.");
        return;
    }

    const levelSearch = await gd.levels.search({ query: id }, 1);

    if (!levelSearch) {
        console.error("Failed to search for level information from GD servers.");
        return;
    }

    const level: SearchedLevel = levelSearch[0];
    const creator = level.creator.accountID ? await gd.users.getByAccountID(level.creator.accountID) : null;
    const flairID = type === "Daily" ? "b891d7a0-c89d-11ee-8a06-fad7ba041385" : "b891d7a0-c89d-11ee-8a06-fad7ba041385";

    console.log(`Type: ${type}, Number: ${number}, ID: ${id}`);
    console.log(level)

    reddit.submitSelfpost({
        title: `[${level.award.pretty.toUpperCase()}] ${type} ${number} - ${level.name} by ${creator?.username} (${level.id}) Discussion Thread`,
        text: `**Level:** *${level.name}* by ${creator?.username}\n\n` +
            `**ID:** ${level.id}\n\n` +
            `**Description:**\n` +
            `> ${level.description}\n\n` +
            `**Difficulty:** ${level.difficulty.stars}* (${level.difficulty.level.pretty})\n\n` +
            `**Song:** ${level.song.name} by ${level.song instanceof CustomSong ? level.song.author.name : level.song.authorName} (${level.song.id})\n` +
            `___\n` +
            `*This is an automated post which may be incorrect*. Use this thread for discussion about the level!`,
        subredditName: "geometrydash",
        flairId: flairID
    }).then((post: any) => {
        console.log("POSTED TO REDDIT: " + post.url);
    }).catch((err: any) => {
        console.error(err);
    });
}

module.exports = {
    name: Events.MessageCreate,
    once: true,
    execute(msg: Message) {
        if (msg.embeds.length > 0) {
            if (msg.channel.id === "1205999484056633354") handleDailyWeeklyLevel(msg); // daily or weekly level
        }
    },
};

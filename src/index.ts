import {Client, Collection, GatewayIntentBits} from 'discord.js';
import * as fs from "fs";
import * as path from "path";
const snoowrap = require('snoowrap');
import GD from "gd.js";
import {CommentStream, SubmissionStream} from "snoostorm";
import * as commentHandler from "./reddit.events/comments";
import * as submissionHandler from "./reddit.events/submissions";
import log from "./utils/logger";
require('dotenv').config();

export const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildWebhooks
    ]
});

export const reddit = new snoowrap({
    userAgent: 'nodejs:zbot-gd:v1.0.0 (by /u/Sayajiaji)',
    clientId: 'k8ZS3NlH8g374qy3kqYnyw',
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: 'zbot-gd',
    password: process.env.REDDIT_PASSWORD
});

export const gd = new GD({
    logLevel: 0
});

(async () => {
    let discordCommands = new Collection();
    const discordCommandsFoldersPath = path.join(__dirname, 'discord.commands');
    const discordCommandFolders = fs.readdirSync(discordCommandsFoldersPath);

    for (const folder of discordCommandFolders) {
        const commandsPath = path.join(discordCommandsFoldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                discordCommands.set(command.data.name, command);
            } else {
                log.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const discordEventsPath = path.join(__dirname, 'discord.events');
    const discordEventFiles = fs.readdirSync(discordEventsPath).filter(file => file.endsWith('.ts'));

    for (const file of discordEventFiles) {
        const filePath = path.join(discordEventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    // Log in to Discord with your client's token
    await client.login(process.env.TOKEN);

    try {
        /*const comments = new CommentStream(reddit, {
            subreddit: "geometrydash",
            limit: 5,
            pollTime: 2000,
        });*/

        const submissions = new SubmissionStream(reddit, {
            subreddit: "geometrydash",
            limit: 5,
            pollTime: 4000,
        })

        const commentsTest = new CommentStream(reddit, {
            subreddit: "Sayajiaji",
            limit: 10,
            pollTime: 4000,
        });

        /*const submissionsTest = new SubmissionStream(reddit, {
            subreddit: "Sayajiaji",
            limit: 10,
            pollTime: 2000,
        })*/

        //comments.on("item", commentHandler.execute);
        submissions.on("item", submissionHandler.execute);
        //commentsTest.on("item", commentHandler.execute);
        //submissionsTest.on("item", submissionHandler.execute);
    } catch (e) {
        console.error(e);
    }
})();

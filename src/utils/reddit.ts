import snoowrap from "snoowrap";
import "dotenv/config"

export const reddit = new snoowrap({
    userAgent: 'nodejs:gdinfo-reddit:v1.0.0 (by /u/Sayajiaji)',
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
});
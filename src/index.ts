import {SubmissionStream} from "snoostorm";
import * as submissionHandler from "./events/submissions.ts";
import {reddit} from "./utils/reddit.ts";
import "dotenv/config"
import logger from "./utils/logger.js";

// list of subreddits to monitor for new submissions
const SUBREDDITS_MONITOR_POSTS: string[] = ["geometrydash"]

function main() {
    try {
        for (const subreddit of SUBREDDITS_MONITOR_POSTS) {
            const submissions = new SubmissionStream(reddit, {
                subreddit: subreddit,
                // @ts-ignore
                limit: 5,
                pollTime: 4000,
            });

            // @ts-ignore
            submissions.on("item", submissionHandler.execute);
            logger.info(`Monitoring subreddit: ${subreddit}`);
        }
    } catch (e) {
        console.error(e);
    }
}

main();

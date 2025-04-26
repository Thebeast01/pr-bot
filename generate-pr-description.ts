import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import { summarizeDiff } from "./ai_pr_summerizer";
dotenv.config();
const octokit = new Octokit({ auth: process.env.TOKEN });
const generatePrDescription = async (owner: string, repo: string, prNumber: number) => {
  try {
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    })
    let description = `## Changes\n\n`;
    for (const file of files) {
      if (file.status === "added") {
        description += `- Added ${file.filename}\n`;

      } else if (file.status === "modified") {
        description += `✏️ - Modified ${file.filename}\n`;
      }
      else if (file.status === "removed") {
        description += `🗑️ - Removed ${file.filename}\n`;
      }
    }

    const response = await summarizeDiff(description)
    await octokit.pulls.update({
      owner,
      repo,
      pull_number: prNumber,
      body: response,
    })
    console.log("PR description updated successfully!");
  } catch (e) {
    console.error("Error generating PR description:", e);
    return;
  }
}
const main = async () => {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  const pull_number = parseInt(process.env.PR_NUMBER || "0", 10);
  if (!owner || !repo || !pull_number) {
    throw new Error("Missing owner, repo, or pull_number!");
  }
  await generatePrDescription(owner, repo, pull_number);
}
main().catch((e) => {
  console.error("Error in main function:", e);
});

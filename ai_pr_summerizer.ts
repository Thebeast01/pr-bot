import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
console.log("Hello WOrld")
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
export const summarizeDiff = async (diff: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `You are a helpful assistant that writes clean PR descriptions based on git diffs.Here is the diff:\`\`\`diff${diff}\`\`\`Write a summary of the changes in bullet points like a pull request description.
Only include what the changes do (not the raw code).
Also try to keep it short and concise.
`;

  const result = await model.generateContent(prompt)
  const response = result.response
  const summary = response.text();
  console.log("Summary of changes:", summary);
  return summary || 'No Summary generated';
}


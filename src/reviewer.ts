import { GitClient } from "./git.js";
import { OllamaClient } from "./ollama.js";
import { ConfigLoader } from "./config.js";
import type { ReviewResult } from "./types.js";

export class CodeReviewer {
  private git: GitClient;
  private ollama: OllamaClient;
  private config: ConfigLoader;

  constructor(projectPath: string) {
    this.git = new GitClient(projectPath);
    this.ollama = new OllamaClient();
    this.config = new ConfigLoader(projectPath);
  }

  private generatePrompt(
    diff: string,
    config: ReturnType<ConfigLoader["load"]>
  ): string {
    let prompt = `You are performing a code review of the following changes. Focus on concrete, actionable feedback in these key areas:

      1. Code Issues:
        - Unused variables, imports, or dead code
        - Missing error handling
        - Improper logging practices
        - Performance concerns
        - Security vulnerabilities
        - TypeScript/JavaScript best practices

      2. For each issue found:
        - Identify the specific file and line
        - Explain why it's a concern
        - Provide a code example showing how to fix it

      3. Format your response exactly like this:

      SUMMARY
      Brief overview of the changes and their impact

      ISSUES
      [file.ts:line] Issue description
      Impact: Why this is important
      Fix: Code example or specific steps to resolve

      Keep the review focused and specific to the actual code changes shown in the diff. 
      Be concise and to the point.
      Be pessimistic but fair, only evaluate the code that is there, don't make assumptions.
`;

    if (config.standards) {
      prompt += `\nProject Standards:\n${config.standards}\n`;
    }

    if (config.patterns) {
      prompt += `\nPreferred Patterns:\n${config.patterns}\n`;
    }

    prompt += `\nCode Changes to Review:\n\`\`\`\n${diff}\n\`\`\`\n`;

    return prompt;
  }

  async review(): Promise<ReviewResult> {
    await this.git.validateRepository();

    const [diff, config] = await Promise.all([
      this.git.getDiff(),
      this.config.load(),
    ]);

    const prompt = this.generatePrompt(diff, config);
    return await this.ollama.generateReview(prompt);
  }
}

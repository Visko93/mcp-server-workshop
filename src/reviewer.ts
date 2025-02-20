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
    let prompt = `You are performing a code review of the following changes. For each issue, use EXACTLY this format:

    Output Format:
      SUMMARY
      (A single paragraph summarizing the changes)

      ISSUES
      a) [filename:line] Brief issue title
      Impact: Explain why this is important (1-2 sentences)
      Fix: Specific code example or steps to resolve

      Rules:
      - Each issue MUST start with [filename:line]
      - Always include both Impact and Fix sections
      - Be specific and actionable
      - Focus on:
        • Bugs and errors
        • Security issues
        • Performance problems
        • Code quality concerns
        • Missing error handling
        • TypeScript/JavaScript best practices
    ---
      If no issues found, still provide SUMMARY but skip ISSUES section.
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

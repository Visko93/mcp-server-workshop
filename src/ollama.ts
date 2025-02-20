import fetch from 'node-fetch';
import type { ReviewResult } from './types.js';
import chalk from 'chalk';

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://127.0.0.1:11434', model = 'deepseek-r1:8b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  private parseReview(text: string): ReviewResult {
    // Remove thinking tags and their content
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '');

    let summary = '';
    const suggestions: ReviewResult['suggestions'] = [];

    // Find content between SUMMARY and ISSUES or end of text
    const summaryMatch = text.match(/SUMMARY\s*([\s\S]*?)(?=ISSUES|---|\n\s*$)/);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }

    // Find content between ISSUES and --- or end of text
    const issuesMatch = text.match(/ISSUES\s*([\s\S]*?)(?=---|done!|$)/);
    if (issuesMatch) {
      const issuesText = issuesMatch[1];
      // Split on lettered markers followed by [
      const issues = issuesText.split(/\n(?=[a-z]\)|\[)/);

      for (const issue of issues) {
        // Remove the letter marker if present
        const cleanIssue = issue.replace(/^[a-z]\)\s*/, '').trim();
        if (!cleanIssue) continue;

        const fileLineMatch = cleanIssue.match(/\[([^:]+):(\d+|[a-zA-Z]+[^\]]*)\]/);
        if (!fileLineMatch) continue;

        const [, file, lineOrFunc] = fileLineMatch;
        const parts = cleanIssue.split(/\n(?:Impact:|Fix:)/g).map(p => p.trim());
        
        if (parts.length >= 3) {
          const description = parts[0].replace(/\[[^\]]+\]/, '').trim();
          const impact = parts[1];
          const fix = parts[2];

          suggestions.push({
            file,
            line: /^\d+$/.test(lineOrFunc) ? parseInt(lineOrFunc, 10) : 1,
            message: `${description}\n\nImpact: ${impact}\n\nFix:\n${fix}`,
            severity: 
              description.toLowerCase().includes('error') || 
              description.toLowerCase().includes('critical') ? 'error' :
              description.toLowerCase().includes('warning') ? 'warning' : 'info'
          });
        }
      }
    }

    return { summary, suggestions };
  }

  async generateReview(prompt: string): Promise<ReviewResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          context: []
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json() as {response: string};
      console.log(chalk.green(data.response));
      return this.parseReview(data.response);
    } catch (error) {
      console.error(chalk.red('Error generating review:'), error);
      throw error;
    }
  }
}
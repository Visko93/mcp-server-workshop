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
    const sections = text.split(/\n(?=SUMMARY|ISSUES)/);
    let summary = '';
    const suggestions: ReviewResult['suggestions'] = [];

    for (const section of sections) {
      const trimmed = section.trim();
      
      if (trimmed.startsWith('SUMMARY')) {
        summary = trimmed.replace('SUMMARY', '').trim();
      } 
      else if (trimmed.startsWith('ISSUES')) {
        const issues = trimmed.replace('ISSUES', '').trim().split('\n\n');
        
        for (const issue of issues) {
          if (!issue.trim()) continue;

          const fileLineMatch = issue.match(/\[([^\]]+):(\d+)\]/);
          
          if (fileLineMatch) {
            const [, file, line] = fileLineMatch;
            const lines = issue.split('\n');
            
            const description = lines[0].replace(/\[([^\]]+):(\d+)\]/, '').trim();
            
            let impact = '';
            let fix = '';
            let currentSection = '';
            
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.startsWith('Impact:')) {
                currentSection = 'impact';
                continue;
              } else if (line.startsWith('Fix:')) {
                currentSection = 'fix';
                continue;
              }
              
              if (currentSection === 'impact') {
                impact += line + ' ';
              } else if (currentSection === 'fix') {
                fix += line + '\n';
              }
            }

            const message = `${description}\n\nImpact: ${impact.trim()}\n\nFix:\n${fix.trim()}`;
            
            suggestions.push({
              file,
              line: parseInt(line, 10),
              message,
              severity: 
                description.toLowerCase().includes('error') || 
                description.toLowerCase().includes('critical') || 
                description.toLowerCase().includes('vulnerability') ? 'error' :
                description.toLowerCase().includes('warning') ? 'warning' : 'info'
            });
          }
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
      return this.parseReview(data.response);
    } catch (error) {
      console.error(chalk.red('Error generating review:'), error);
      throw error;
    }
  }
}
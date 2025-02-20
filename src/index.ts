#!/usr/bin/env node
import { CodeReviewer } from './reviewer.js';
import chalk from 'chalk';

async function main() {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log('\n' + chalk.bold.cyan('🔍 Code Review Assistant'));
  console.log(chalk.dim('─'.repeat(50)));
  
  try {
    console.log(chalk.white(`Reviewing project: ${chalk.cyan(projectPath)}\n`));

    const reviewer = new CodeReviewer(projectPath);
    
    process.stdout.write(chalk.yellow('⚡ Analyzing changes... '));
    const result = await reviewer.review();
    process.stdout.write(chalk.green('done!\n\n'));

    console.log(chalk.bold.white('📋 Summary'));
    console.log(result.summary ? chalk.white(result.summary) : chalk.yellow('No summary provided'));
    console.log();

    if (result.suggestions.length > 0) {
      console.log(chalk.bold.white('🎯 Found Issues'));

      const groupedSuggestions = result.suggestions.reduce((acc, suggestion) => {
        const file = suggestion.file || 'General';
        if (!acc[file]) acc[file] = [];
        acc[file].push(suggestion);
        return acc;
      }, {} as Record<string, typeof result.suggestions>);

      for (const [file, suggestions] of Object.entries(groupedSuggestions)) {
        console.log(chalk.bold.cyan(`\n📄 ${file}`));

        for (const suggestion of suggestions) {
          const icon = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
          }[suggestion.severity];

          const severityColor = {
            error: chalk.red,
            warning: chalk.yellow,
            info: chalk.blue
          }[suggestion.severity];

          console.log(
            `\n${icon} ` +
            severityColor.bold(suggestion.severity.toUpperCase()) +
            (suggestion.line ? chalk.dim(` (line ${suggestion.line})`) : '')
          );

          const parts = suggestion.message.split('\n\n');
          parts.forEach(part => {
            if (part.startsWith('Impact:')) {
              console.log(chalk.yellow('\n→ Impact:'));
              console.log(chalk.dim(part.replace('Impact:', '').trim()));
            } else if (part.startsWith('Fix:')) {
              console.log(chalk.green('\n→ Fix:'));
              console.log(chalk.white(part.replace('Fix:', '').trim()));
            } else {
              console.log(chalk.white(part.trim()));
            }
          });
        }
      }
    } else {
      console.log(chalk.green('✨ No issues found!'));
    }

    console.log(chalk.green.bold('✅ Review completed successfully!\n'));

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Review process failed'));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    console.log();
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});

export default CodeReviewer;
# Local AI Code Reviewer 🔍

A lightweight, local-first code review tool that uses AI to provide quick feedback on your code changes. Built with TypeScript and powered by Ollama, it analyzes git diffs and offers actionable suggestions to improve your code.

## Features ✨

- 🚀 **Local-First**: Runs entirely on your machine - no API keys or internet required
- 📝 **Git Integration**: Automatically analyzes your uncommitted changes
- 🤖 **AI-Powered**: Uses the deepseek-coder model for intelligent code review
- 🎨 **Rich Output**: Clear, colorized terminal output with actionable suggestions
- ⚡ **Fast**: Quick setup and instant feedback
- 🔒 **Private**: Your code never leaves your machine

## Prerequisites 📋

Before you begin, ensure you have:

- Windows 11
- Node.js v22.0.0 or higher
- npm v11.0.0 or higher
- [Ollama](https://ollama.ai) installed

## Installation 🛠️

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd code-reviewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Pull the required model:
   ```bash
   ollama pull deepseek-coder:latest
   ```

4. Verify the installation:
   ```bash
   ollama list   # Should show deepseek-coder
   ```

## Usage 💻

1. Make some changes in your project

2. Run the review tool:
   ```bash
   npx tsx src/index.ts /path/to/your/project
   ```

3. Review the suggestions in your terminal

Example output:
```plaintext
🔍 Code Review Assistant
─────────────────────
Reviewing project: /path/to/your/project

📋 Summary
Found 3 issues in your changes...

🎯 Detailed Analysis
[app.ts]
❌ ERROR (line 15)
   Unused variable 'config'
   → Impact: Increases code size and reduces maintainability
   → Fix: Remove unused variable or implement intended usage

...
```

## Project Structure 🏗️

```plaintext
src/
  ├── index.ts      # CLI entry point
  ├── reviewer.ts   # Core review logic
  ├── git.ts        # Git operations
  ├── ollama.ts     # Model interface
  └── types.ts      # TypeScript types
```

## Configuration 🔧

You can customize the review process by adding a `.reviewconfig` folder in your project:

```plaintext
your-project/
  ├── .reviewconfig/
  │   ├── standards.md    # Project coding standards
  │   └── patterns.md     # Preferred patterns
  └── ...
```

## Troubleshooting 🔍

Common issues and solutions:

1. **Ollama not responding**
   - Check if Ollama is running in your system tray
   - Verify with `ollama list`
   - Restart Ollama if needed

2. **Model issues**
   - Ensure deepseek-coder is installed: `ollama pull deepseek-coder:latest`
   - Check available memory (8GB minimum recommended)
   - Close unnecessary applications

3. **Node version errors**
   - Update Node.js to v22+: `node -v`
   - Update npm to v11+: `npm -v`

## Limitations 🚧

While powerful for quick code reviews, be aware that:

- Local models have limited capabilities compared to cloud alternatives
- Resource usage depends on your hardware
- Complex analyses might require cloud-based solutions
- Model responses can vary in quality

## Best Practices 🌟

1. Use for:
   - Quick feedback on code changes
   - Personal projects
   - Learning and experimentation

2. Consider cloud alternatives for:
   - Team-wide code review
   - Production deployment
   - Complex analysis needs


## License 📄

[MIT License](LICENSE)
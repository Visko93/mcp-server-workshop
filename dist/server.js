"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = require("simple-git");
const fs_1 = require("fs");
const path_1 = require("path");
const fetch = require('node-fetch');
class CodeReviewer {
    git;
    projectPath;
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.git = (0, simple_git_1.simpleGit)(projectPath);
    }
    async getCustomInstructions() {
        const configPath = (0, path_1.join)(this.projectPath, '.reviewconfig');
        if (!(0, fs_1.existsSync)(configPath))
            return '';
        try {
            const standards = (0, fs_1.existsSync)((0, path_1.join)(configPath, 'standards.md'))
                ? (0, fs_1.readFileSync)((0, path_1.join)(configPath, 'standards.md'), 'utf-8')
                : '';
            const patterns = (0, fs_1.existsSync)((0, path_1.join)(configPath, 'patterns.md'))
                ? (0, fs_1.readFileSync)((0, path_1.join)(configPath, 'patterns.md'), 'utf-8')
                : '';
            return `
Project-specific guidelines:
${standards}
${patterns}
`;
        }
        catch (error) {
            console.warn('Warning: Could not read custom instructions:', error);
            return '';
        }
    }
    async getDiff() {
        // Get uncommitted changes
        const status = await this.git.status();
        if (status.files.length === 0) {
            throw new Error('No changes detected');
        }
        // Get the diff for all modified files
        const diff = await this.git.diff(['HEAD']);
        return diff;
    }
    async reviewWithOllama(diff, instructions) {
        const prompt = `
You are an experienced code reviewer. Please review the following code changes:

${instructions}

Diff:
${diff}

Please provide a concise but thorough review focusing on:
1. Potential bugs or issues
2. Code quality and best practices
3. Performance considerations
4. Security implications

Format your response in a clear, actionable way.
`;
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-coder',
                prompt,
                stream: false
            })
        });
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.response;
    }
    async review() {
        try {
            const [diff, instructions] = await Promise.all([
                this.getDiff(),
                this.getCustomInstructions()
            ]);
            return await this.reviewWithOllama(diff, instructions);
        }
        catch (error) {
            if (error instanceof Error) {
                return `Error during review: ${error.message}`;
            }
            return 'An unknown error occurred';
        }
    }
}

import {readFileSync, existsSync} from 'fs';
import {join} from 'path';
import type {ReviewConfig} from './types.js';

export class ConfigLoader {
    private projectPath: string;

    constructor(projectPath: string) {
        this.projectPath = projectPath;
    }

    load(): ReviewConfig {
        const configPath = join(this.projectPath, '.reviewconfig');
        if (!existsSync(configPath)) {
            return {}
        }

        try {
            const standards = existsSync(join(configPath, 'standards.md'))
                ? readFileSync(join(configPath, 'standards.md'), 'utf-8')
                : '';
            const patterns = existsSync(join(configPath, 'patterns.md'))
                ? readFileSync(join(configPath, 'patterns.md'), 'utf-8')
                : '';

            return {standards, patterns};
        } catch (error) {
            console.error('Error loading config:', error);
            return {};
        }
    }
}

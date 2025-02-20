export interface ReviewConfig {
    standards?: string;
    patterns?: string;
  }
  
  export interface ReviewResult {
    summary: string;
    suggestions: Array<{
      file: string;
      line?: number;
      message: string;
      severity: 'info' | 'warning' | 'error';
    }>;
  }
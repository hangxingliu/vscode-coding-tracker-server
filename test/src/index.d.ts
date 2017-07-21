type ESLintResultItem = {
	filePath: string;
	messages: ESLintResultItemMessage[];
	errorCount: number;
	warningCount: number;
	fixableErrorCount: number;
	fixableWarningCount: number;
};
type ESLintResultItemMessage = {
	ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
}

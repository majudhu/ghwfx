import { ESLint } from "eslint";
import overrideConfig from "./.eslintrc.json" with { type: "json" };

async function main({ core, context, github }) {
	const eslint = new ESLint({ overrideConfig });
	const results = await eslint.lintFiles(".");

	let body = "";
	let lintFiles = 0;
	let lintErrors = 0;
	let lintWarnings = 0;
	const severityIcons = ["ℹ️", "⚠️", "‼️"];

	let eslintBody = "";

	for (const result of results) {
		if (result.errorCount || result.warningCount) {
			lintFiles += 1;
			lintErrors += result.errorCount;
			lintWarnings += result.warningCount;
			eslintBody += `* ${result.filePath}\n\n`;
			for (const { line, column, severity, ruleId, message } of result.messages) eslintBody += `  * ${line}:${column} ${severityIcons[severity]} ${ruleId || ""} ${message}\n`;
		}
	}

	if (lintFiles === 0) body += "## ✅ ESLint\n\nNo problems found.";
	else body += `## ⚠️ ESLint Issues\n\nFound **${lintErrors}** error${lintErrors !== 1 ? "s" : ""} and **${lintWarnings}** warning${lintWarnings !== 1 ? "s" : ""} across **${lintFiles}** file${lintFiles !== 1 ? "s" : ""}.\n\n${eslintBody}\n---\n*Run \`pnpm lint --fix\` to attempt automatic fixes or review issues manually.*`;

}

await main({});

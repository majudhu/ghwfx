import { ESLint } from "eslint";
import overrideConfig from "./.eslintrc.json" with { type: "json" };
import results from "./asdf.json" with { type: "json" };

async function main({ core, context, github }) {
	console.log(ESLint.version);

	const eslint = new ESLint({ overrideConfig });
	// const results = await eslint.lintFiles(".");
	const issues = results.flatMap(result => result.messages);

	if (issues.length === 0) {
		const cleanBody = "## ✅ ESLint\n\nNo problems found.";
		console.log(cleanBody);
		if (core?.summary) await core.summary.addRaw(cleanBody).write();
		return;
	}

	const affectedFiles = results.filter(result => result.messages.length > 0).length;
	const escapeMarkdown = value =>
		String(value ?? "-")
			.replace(/\|/g, "\\|")
			.replace(/\r?\n/g, " ");
	const formatSeverity = severity => {
		if (severity === 2) return "error";
		if (severity === 1) return "warning";
		return "info";
	};

	const severity = ["ℹ️", "⚠️", "‼️"];

	let body = "## ⚠️ ESLint Issues\n\n";
	body += `Found **${issues.length}** issue${issues.length > 1 ? "s" : ""} across **${affectedFiles}** file${affectedFiles > 1 ? "s" : ""}.\n\n`;
	body += "| File | Line | Column | Rule | Severity | Message |\n";
	body += "|------|------|--------|------|----------|---------|\n";

	for (const issue of issues) {
		const file = escapeMarkdown(issue.filePath || "-");
		const line = issue.line ?? "-";
		const column = issue.column ?? "-";
		const rule = escapeMarkdown(issue.ruleId || "—");
		const severity = formatSeverity(issue.severity);
		const message = escapeMarkdown(issue.message);

		body += `| ${file} | ${line} | ${column} | ${rule} | ${severity} | ${message} |\n`;
	}

	body += "\n---\n*Run `pnpm lint --fix` to attempt automatic fixes or review issues manually.*";

	console.log(body);
	if (core?.summary) await core.summary.addRaw(body).write();

	if (github && context) {
		await github.rest.issues.createComment({
			owner: context.repo.owner,
			repo: context.repo.repo,
			issue_number: context.issue.number,
			body
		});
	}
}

await main({});

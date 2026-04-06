import { ESLint } from "eslint";
import overrideConfig from "./.eslintrc.json" with { type: "json" };

async function main({ core, context, github }) {
  let body = "";

  const execOut = await exec.getExecOutput("pnpm", ["outdated", "--json"], { ignoreReturnCode: true });
  if (!execOut.exitCode || !execOut.stdout || execOut.stdout === '{}') {
    body = "## ✅ Dependencies\n\nAll dependencies are up to date.";
  } else {
    const packages = Object.entries(JSON.parse(execOut.stdout));
    if (packages.length === 0) {
      body = "## ✅ Dependencies\n\nAll dependencies are up to date.";
    } else {
      body = `## ⚠️ Outdated Dependencies Detected\n<details>
  <summary>Found **${packages.length}** outdated package${packages.length > 1 ? 's' : ''}</summary>
                | Package | Current | Wanted | Latest | Type |
                |---------|---------|--------|--------|------|\n`

      for (const [pkg, info] of packages)
        body += `| ${pkg} | ${info.current || '-'} | ${info.wanted || '-'} | ${info.latest || '-'} | ${info.dependencyType || '-'} |\n`;

      body += "</details>\n---\n*Run `pnpm outdated` locally for more details or `pnpm update` to update dependencies.*";
    }
  }

  const results = await (new (require("eslint")).ESLint()).lintFiles(".");
  let lintFiles = 0;
  let lintErrors = 0;
  let lintWarnings = 0;
  let eslintBody = "";
  const severityIcons = ["ℹ️", "⚠️", "‼️"];

  for (const result of results) {
    if (result.errorCount || result.warningCount) {
      lintFiles += 1;
      lintErrors += result.errorCount;
      lintWarnings += result.warningCount;
      eslintBody += `* ${result.filePath}\n\n`;
      for (const m of result.messages) eslintBody += `  * ${m.line}:${m.column} ${severityIcons[m.severity]} ${m.ruleId || ""} ${m.message}\n`;
    }
  }

  if (lintFiles === 0) body += "## ✅ ESLint\n\nNo problems found.";
  else body += `## ⚠️ ESLint Issues\n
            <details><summary>Found **${lintErrors}** error${lintErrors !== 1 ? "s" : ""} \
            and **${lintWarnings}** warning${lintWarnings !== 1 ? "s" : ""} \
            across **${lintFiles}** file${lintFiles !== 1 ? "s" : ""}.</summary>\n
            ${eslintBody}</details>\n---\n*Run \`pnpm lint --fix\` to attempt automatic fixes or review issues manually.*`;

  await core.summary.addRaw(body).write();

  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body
  });
}

await main({});

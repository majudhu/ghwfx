import { ESLint } from "eslint";



// @ts-check
/** @param {import('@actions/github-script').AsyncFunctionArguments} AsyncFunctionArguments */
async function main({ core, context, github }) {
    const eslintConfig = 
    const eslint = new (require("eslint").ESLint)(eslintConfig);
)

    const results = await eslint.lintFiles("");

    console.log(results);

    if (results.length === 0) return;

    let body = `## ⚠️ Outdated Dependencies Detected\n
Found **${results.length}** outdated package${results.length > 1 ? 's' : ''}:\n
| Package | Current | Wanted | Latest | Type |
|---------|---------|--------|--------|------|\n`;

    // for (const err of results)
    //     body += `| ${err.errorCount} | ${info.current || '-'} | ${info.wanted || '-'} | ${info.latest || '-'} | ${info.dependencyType || '-'} |\n`;

    body += "\n---\n*Run `pnpm outdated` locally for more details or `pnpm update` to update dependencies.*";

    // await core.summary.addRaw(body).write();

    // await github.rest.issues.createComment({
    //     owner: context.repo.owner,
    //     repo: context.repo.repo,
    //     issue_number: context.issue.number,
    //     body
    // });
}

main({});
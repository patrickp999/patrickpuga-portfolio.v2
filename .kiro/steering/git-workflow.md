# Git Workflow Rules

## Committing
- Committing is NEVER allowed without explicit user confirmation.
- Always ask the user before running any `git add` or `git commit` command.
- Show the user what will be committed and wait for approval before proceeding.
- Always use conventional commit style messages: `type(scope): description`
- Common types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`
- Examples: `feat(nav): add mobile menu`, `fix(hero): correct animation timing`, `chore: update gitignore`
- A preToolUse hook enforces this gate on all shell commands.

## Pushing
- Pushing to remote is NEVER allowed without explicit user confirmation.
- Always ask the user before running any `git push` command.
- A preToolUse hook enforces this gate on all shell commands.

## GitHub API Rules
- Before making any GitHub API calls, always run `git remote -v` and `git branch` to resolve the correct owner, repo, and branch.
- Never assume or guess the owner, repo, or branch.
- A preToolUse hook enforces this gate automatically.

## GitHub PR Tool Gate
- Always resolve owner, repo, and branch before making any GitHub API calls.
- Never make parallel GitHub API calls before context (owner, repo, branch) is fully resolved.
- Confirm all details with the user before opening or modifying a PR.

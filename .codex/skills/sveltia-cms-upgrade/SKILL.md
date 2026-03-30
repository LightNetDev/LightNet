---
name: sveltia-cms-upgrade
description: Use when the user wants to check for a newer @sveltia/cms release for this repository, assess breaking changes, update the pinned version in packages/sveltia-admin/package.json, run the Sveltia admin test suite, and investigate unexpected regressions without auto-fixing them.
---

# Sveltia CMS Upgrade

Use this skill when the user wants help intentionally upgrading the pinned `@sveltia/cms` version in this repo.

The pinned dependency lives in [packages/sveltia-admin/package.json](packages/sveltia-admin/package.json).

## Goals

- Check whether a newer `@sveltia/cms` version exists.
- Inspect upstream release notes or changelog entries before changing anything.
- Update the pinned version intentionally, not loosely.
- Run the Sveltia admin validation steps after the bump.
- If the upgrade causes unexpected regressions, investigate and summarize instead of auto-fixing.
- If the regression appears to be an upstream Sveltia bug, help the user draft a minimal upstream issue without LightNet-specific details.

## Workflow

1. Inspect the current pinned version in `packages/sveltia-admin/package.json`.
2. Check the latest published `@sveltia/cms` version with `pnpm view @sveltia/cms version`.
   - Treat this as the primary source of truth for the latest stable npm release.
   - Use web browsing only if the registry query fails or if you need release-note context after confirming a newer version exists.
3. Compare the pinned version with the newest release.
4. If there is no newer release, tell the user and stop unless they asked for a different target version.
5. If there is a newer release:
   - inspect upstream release notes, changelog entries, or GitHub releases only after confirming the newer version number
   - inspect upstream notes for breaking changes, behavior changes, or migration notes
   - summarize only the changes that look relevant to this repo's Sveltia admin usage
6. Update the fixed version in `packages/sveltia-admin/package.json` to the chosen exact release.
7. Refresh the lockfile as needed.
8. Run the Sveltia-focused validation commands:
   - `pnpm fmt`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm --filter @lightnet/sveltia-admin e2e`
9. If the tests pass, report the upgrade clearly and mention any upstream changes worth watching.
10. If something unexpected fails:

- do a short investigation
- identify the failing tests, error messages, and likely regression area
- check whether the failure lines up with upstream release notes or looks like a new upstream regression
- do not silently rewrite tests or behavior to make the upgrade pass
- ask the user whether they want to investigate a local compatibility fix next

## Investigation Guidance

Keep the investigation short and practical. Focus on:

- which tests failed
- whether the failures are new after the version bump
- whether the failure points to a selector or UI change, a data model change, a validation change, or a runtime exception
- whether the behavior looks intentional upstream or like a regression

Do not automatically patch tests or product code unless the user explicitly asks for that follow-up.

If you need more context, inspect:

- `packages/sveltia-admin/__tests__/`
- `packages/sveltia-admin/__e2e__/`
- `packages/sveltia-admin/src/`

## Upstream Regression Handling

If the upgrade appears to expose an upstream `@sveltia/cms` bug:

1. Confirm the failing behavior as narrowly as possible.
2. Strip out LightNet-specific framing.
3. Reduce the report to a minimal Sveltia-oriented reproduction.
4. Draft an issue for the user instead of posting it automatically.

Use [references/github-issue-template.md](references/github-issue-template.md) for the output structure.

The issue draft should:

- avoid mentioning LightNet unless absolutely required for factual accuracy
- describe the problem in generic Sveltia terms
- include a minimal reproduction flow
- separate expected outcome from actual outcome

## Reporting Back

When you finish, give the user:

- the old and new `@sveltia/cms` versions
- a short note on relevant upstream changes
- the validation results
- any failures or regressions found
- whether you think the problem is local compatibility work or an upstream Sveltia bug
- if relevant, a ready-to-post issue draft using the required template

## Efficiency Notes

- For the simple question "what is the latest version?", prefer `pnpm view @sveltia/cms version` over web search.
- Do not browse release pages until you know there is actually a newer version worth inspecting.
- If `pnpm view` already shows the pinned version is current, stop early and avoid extra network lookups.

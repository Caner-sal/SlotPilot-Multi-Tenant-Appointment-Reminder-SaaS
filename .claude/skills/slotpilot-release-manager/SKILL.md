# randevo-release-manager

## name
randevo-release-manager

## description
Coordinate full release workflow: run all tests, build, validate data, check secrets, update CHANGELOG, create git tag, and push.

## When to use
- When preparing a new version release (v1.x.y)
- After completing a major phase or feature set
- Before pushing a stable tag to GitHub

## Workflow
1. Run all tests: node "node_modules/vitest/vitest.mjs" run
2. Run build: node "node_modules/next/dist/bin/next" build
3. Run district audit: node "node_modules/tsx/dist/cli.mjs" scripts/audit-turkey-districts.ts
4. Run skill validator: node scripts/validate-skills.js
5. Run secret scan: node scripts/check-no-secrets.js
6. Update CHANGELOG.md with new version section
7. Commit: git commit -m "chore: release vX.Y.Z"
8. Tag: git tag vX.Y.Z
9. Push: git push && git push origin vX.Y.Z

## Expected Output
- All tests PASS
- Build: 0 errors
- District audit: PASS
- Skill validator: PASS
- Secret scan: PASS
- CHANGELOG updated
- Tag created and pushed

## Forbidden Actions
- Do not tag a release with failing tests
- Do not force push to main
- Do not skip the secret scan
- Do not release without updating CHANGELOG

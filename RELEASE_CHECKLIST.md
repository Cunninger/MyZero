# Release Checklist

## Before Release

1. [ ] Ensure all changes for this release are merged into `develop`.
2. [ ] From `develop`, cut a release branch: `git checkout -b release/vX.Y.Z`
3. [ ] Update version numbers:
   - [ ] `VERSION`
   - [ ] `frontend/package.json` version
   - [ ] `backend/app/paths.py` `MYZERO_VERSION`
   - [ ] `installer.iss` version
4. [ ] Update `CHANGELOG.md` (move items from `[Unreleased]` to new version section).
5. [ ] Commit version bumps: `git commit -am "chore(release): prepare vX.Y.Z"`
6. [ ] Push release branch: `git push origin release/vX.Y.Z`
7. [ ] Open a Pull Request from `release/vX.Y.Z` to `main`.
8. [ ] Ensure CI passes.
9. [ ] Merge the PR into `main`.

## Tag and Release

10. [ ] After merge, checkout `main` locally and pull latest.
11. [ ] Create and push tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
12. [ ] Verify the `Auto Release` GitHub Action triggers and succeeds.
13. [ ] Verify the GitHub Release is created with the installer `.exe`.

## After Release

14. [ ] Merge `main` back into `develop` to keep branches in sync.

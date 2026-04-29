# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CI workflow for PR quality checks.
- Manual version control via git tags.

## [1.0.10] - 2026-04-29

### Fixed
- Sync VERSION file to match existing v1.0.10 tag.

## [1.0.9] - 2026-04-29

### Added
- Expose processing parameters (`segment_max_length`, `segment_skip_threshold`, `api_timeout`) to settings panel.
- Add concurrency control and tag collision check in release workflow.

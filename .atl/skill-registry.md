# Skill Registry

## Project
- Name: findexa
- Generated: 2026-04-28
- Source: AGENTS.md instructions + local project scan

## Compact Rules
- Use TypeScript strict mode. Never use `any` or `@ts-ignore`.
- Never run a build after making changes.
- Verify technical claims against code or docs before stating them.
- If a claim is uncertain, say `dejame verificar` and inspect first.
- Use conventional commits only. Never add AI or Co-Authored-By attribution.
- User-facing text must be Spanish (Latin American). Code comments must be English.
- Prefer minimal, concrete implementations that match existing project structure.

## Project Conventions
- Stack: Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS 4.
- Source root: `src/`
- Path alias: `@/*` -> `src/*`
- Lint config: `next/core-web-vitals`, `next/typescript`
- Existing architecture: single Next.js full-stack app; minimal scaffold still in place.

## User Skills Trigger Table
| Trigger | Skill | Notes |
| --- | --- | --- |
| Go tests, Bubbletea TUI testing | go-testing | Auto-load before writing Go tests |
| Creating new AI skills | skill-creator | Auto-load before creating skills |
| SDD initialization | sdd-init | Detect stack, testing, persistence |
| SDD implementation | sdd-apply | Read specs/design/tasks before coding |

## Detected Skills
- go-testing
- skill-creator
- sdd-init
- sdd-apply

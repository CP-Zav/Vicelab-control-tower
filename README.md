# ViceLab Control Tower

**ViceLab Control Tower — the command center powering execution, automation, and real-time decision systems across the ViceLab ecosystem.**

---

## 🚀 Overview

The Control Tower is a centralized operational dashboard designed to coordinate and execute across the ViceLab ecosystem.

It acts as the **execution layer** between strategy and action — turning plans into real-world outputs.

---

## ⚡ Core Functions

- **Execution Layer**
  - Task queue
  - One-click execution actions
  - Priority + revenue tracking

- **Approvals System**
  - Review flows (content, designs, decisions)
  - Accept / reject pipelines
  - Risk-level tagging

- **Automation Control**
  - Email outreach triggers
  - Content distribution (LinkedIn, Substack, etc.)
  - Backend workflow execution

- **Pipeline Visibility**
  - Outreach tracking
  - Lead progression
  - Operational status monitoring

---

## 🧠 Purpose

This system exists to:

- Reduce overwhelm in a solo-operated ecosystem
- Create clarity between planning and execution
- Enable scalable, repeatable workflows
- Act as the operational brain of ViceLab

---

## 🧱 Tech Stack

- Next.js (App Router)
- React 18
- Vercel (deployment)

---

## 🌐 Deployment

This project is designed for seamless deployment via Vercel.

Any push to the main branch will trigger an automatic deployment.

---

## 🔮 Roadmap

- [ ] Full execution engine (click → action)
- [ ] Git + deployment automation
- [ ] Integration with Claude / AI agents
- [ ] Real-time data + analytics layer
- [ ] Mobile-optimized command interface

---

## 🔧 Part of the ViceLab Ecosystem

Control Tower sits at the center of:

- ViceLab (research + intelligence)
- Cooked Pilot (festival-facing platform)
- VibeGuard (compliance + safety systems)

---

## ⚠️ Status

Early-stage build — actively being developed and expanded.

---

## ✧ Philosophy

**Execution over intention.
Clarity over chaos.
Systems over stress.**

---

## 🔗 Codex Workflow

Codex tasks are tracked as GitHub Issues (label: `codex`) and defined as markdown files in `/tasks/`.

### Creating a task

1. Open a GitHub Issue with the `codex` label. Note the issue number.
2. Create `/tasks/<ID>-<slug>.md` with frontmatter:

```yaml
---
issue: <number>
title: <task title>
status: todo
priority: high | medium | low
owner: codex
---
```

3. The Control Centre picks up the file on the next build.

### Opening a PR

- Branch: `codex/<ID>-<slug>`
- Template: `/.github/PULL_REQUEST_TEMPLATE/codex_task.md`
- PR body must include: `Closes #<issue-number>`

### Execution order (current cycle)

```
C1 → W2 → C2 → C3 → W4 → C4 → C5
```

See `docs/runbooks/current-cycle.md` for details.

### /tasks ingestion

The Control Centre reads `/tasks/*.md` at build time and renders tasks in the Execution Layer board.
Falls back to seeded data (`app/lib/tasks/seed.js`) if the directory is unavailable.
Each task card shows its source path for traceability.

See `docs/CONTRIBUTING.md` for the full workflow guide.

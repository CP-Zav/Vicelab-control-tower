Read AGENTS.md and follow it strictly.

Plan first, then implement.

GOAL:
Replace the current homepage ecosystem card implementation with a stable, production-ready component where logos are clearly visible, correctly sized, and render reliably in all environments.

CONTEXT:

* Next.js App Router project
* TailwindCSS + TypeScript
* Current issue: logos previously rendered too small or inconsistently
* A working solution has been designed using inline SVG logos

---

## TASKS

1. Replace the current ecosystem card/grid implementation with a new `EcosystemCards.tsx` component.

2. Implement logos as **inline SVG React components**:

   * No `next/image`
   * No external file dependency
   * No path-based loading
   * SVG must render immediately

3. Logo rendering rules:

   * Visual size: ~64px (`h-14` to `h-16`)
   * Use `w-auto object-contain`
   * Must be clearly visible at a glance
   * Ensure all logos appear visually balanced despite different aspect ratios

4. Enforce strict visual hierarchy inside each card:
   Status badge → Logo → Title → Tagline → Description

5. Fix any parent layout issues that could shrink or hide logos:

   * remove `w-4 h-4`, `max-h-*`, or restrictive wrappers
   * prevent flex shrink issues
   * ensure logo container has enough space (e.g. `min-h-[56px] flex items-center justify-center`)

6. Apply visual polish:

   * subtle hover glow on logos: `group-hover:drop-shadow`
   * optional slight brightness increase
   * keep effects minimal and consistent with AGENTS.md

7. Prevent SVG issues:

   * scope gradient IDs per logo (no collisions)
   * ensure `mixBlendMode: normal` on logo wrapper if needed

8. Ensure responsiveness:

   * mobile: stacked layout
   * desktop: grid layout
   * logos must remain clearly visible on all breakpoints

---

## CONSTRAINTS

* Do NOT redesign the page
* Do NOT change overall layout structure
* Do NOT introduce new dependencies
* Keep changes minimal and production-safe
* Follow AGENTS.md rules strictly

---

## DONE WHEN

* Logos are clearly visible (no “grain of sand” issue)
* All three cards feel visually balanced
* No build or TypeScript errors
* Layout works on mobile and desktop
* No regressions introduced

---

## OUTPUT

1. Brief plan
2. Root cause identified (if any remaining)
3. Files changed
4. Full updated `EcosystemCards.tsx`
5. Any other required file updates
6. Short changelog

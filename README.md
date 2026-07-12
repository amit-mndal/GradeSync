# GradeSync — CGPA ↔ Percentage Conversion Registry

Different Indian universities convert CGPA to percentage using different
formulas — a flat ×10, a ×9.5, or an offset subtracted before multiplying.
GradeSync is a small, dependency-free web app that converts both directions
using the specific formula recorded for the selected institution, shows the
working, and rates each formula's confidence so you know whether it's an
institute-issued rule or a widely reported one.



<img width="1518" height="887" alt="image" src="https://github.com/user-attachments/assets/77438e58-6d6b-4e3a-ac10-ef8e7d084ba0" />


**Live demo:**[ mygradesync.vercel.app
](https://mygradesync.vercel.app/)
## Features

- **Bidirectional converter** — CGPA → percentage and percentage → CGPA, for 27 institutions across IITs, NITs, state universities, and private universities.
- **Searchable institution picker** — grouped, filterable combobox instead of a long flat dropdown.
- **Working shown, not just the answer** — every result displays the exact arithmetic used.
- **Confidence tiers** — each formula is marked *Official* (institute-issued) or *Widely reported* (consistent but not sourced from a single circular), with a stamp-style badge.
- **Verification checklist** — a "Verify a formula" section explaining how to confirm the rule that applies to you, with a pre-filled email link to report a correction.
- **Cross-institution comparison** — enter one CGPA and see the resulting percentage across every institution on record, sortable by column.
- **Grade scale reference** — the absolute 10-point letter grade table used as a baseline.
- **No build step** — plain HTML/CSS/JS, deployable to any static host (Netlify, Vercel, GitHub Pages).

## Project structure

```
index.html   — markup for all sections
style.css    — design system (tokens, layout, components)
script.js    — converter logic, combobox, compare table, verification UI
data.js      — institution formula registry + grade scale reference
```

## Data accuracy

Formulas are collected from institutional documentation where available and
from consistent student/college reporting elsewhere — see the confidence
tier on each entry. Conversion rules can change between academic
regulations, batches, and departments, so always confirm against your own
transcript before relying on a result for something high-stakes (admissions,
job applications, scholarships). Found a mismatch? Use the "Report an
incorrect formula" link in the app.

## Running locally

No build tools required — just open `index.html` in a browser, or serve the
folder:

```bash
python3 -m http.server 8000
```

---
Built by [Amit Mandal]

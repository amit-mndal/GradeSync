(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function byId(id) {
    return INSTITUTIONS.find((u) => u.id === id) || null;
  }

  function computePercentage(cgpa, f) {
    if (f.type === "mult") return cgpa * f.a;
    if (f.type === "sub-mult") return (cgpa - f.a) * f.b;
    if (f.type === "mult-add") return cgpa * f.a + f.b;
    return cgpa * 10;
  }

  function computeCgpa(pct, f) {
    if (f.type === "mult") return pct / f.a;
    if (f.type === "sub-mult") return pct / f.b + f.a;
    if (f.type === "mult-add") return (pct - f.b) / f.a;
    return pct / 10;
  }

  function formulaText(f, cgpaVal) {
    const c = cgpaVal !== undefined ? cgpaVal.toFixed(2) : "CGPA";
    if (f.type === "mult") return `${c} × ${f.a} = ${(cgpaVal !== undefined ? computePercentage(cgpaVal, f).toFixed(2) : "?")}%`;
    if (f.type === "sub-mult") return `(${c} − ${f.a}) × ${f.b} = ${(cgpaVal !== undefined ? computePercentage(cgpaVal, f).toFixed(2) : "?")}%`;
    if (f.type === "mult-add") return `${c} × ${f.a} + ${f.b} = ${(cgpaVal !== undefined ? computePercentage(cgpaVal, f).toFixed(2) : "?")}%`;
    return "";
  }

  function formulaShort(f) {
    if (f.type === "mult") return `CGPA × ${f.a}`;
    if (f.type === "sub-mult") return `(CGPA − ${f.a}) × ${f.b}`;
    if (f.type === "mult-add") return `CGPA × ${f.a} + ${f.b}`;
    return "";
  }

  /* ---------------------------------------------------------------------
     Certificate number (cosmetic, deterministic per session)
     --------------------------------------------------------------------- */
  $("#certNumber").textContent =
    "No. " + String(Math.floor(100000 + Math.random() * 899999));
  $("#year").textContent =  new Date().getFullYear() + " © " ;

  /* ---------------------------------------------------------------------
     Combobox — searchable institution picker
     --------------------------------------------------------------------- */
  const searchInput = $("#uniSearch");
  const hiddenId = $("#uniId");
  const list = $("#uniList");
  const hint = $("#uniHint");

  const grouped = INSTITUTIONS.reduce((acc, u) => {
    (acc[u.group] = acc[u.group] || []).push(u);
    return acc;
  }, {});

  function renderList(filter) {
    const q = (filter || "").trim().toLowerCase();
    list.innerHTML = "";
    let any = false;

    Object.keys(grouped).forEach((group) => {
      const items = grouped[group].filter((u) =>
        u.name.toLowerCase().includes(q)
      );
      if (!items.length) return;
      any = true;
      const groupEl = document.createElement("li");
      groupEl.className = "combobox-group";
      groupEl.textContent = group;
      groupEl.setAttribute("role", "presentation");
      list.appendChild(groupEl);

      items.forEach((u) => {
        const li = document.createElement("li");
        li.className = "combobox-option";
        li.setAttribute("role", "option");
        li.dataset.id = u.id;
        li.innerHTML = `<span>${u.name}</span><small>${u.confidence === "official" ? "Official" : "Reported"}</small>`;
        list.appendChild(li);
      });
    });

    if (!any) {
      const li = document.createElement("li");
      li.className = "combobox-empty";
      li.textContent = "No institution matches — try a shorter search, or report it below.";
      list.appendChild(li);
    }
    list.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function selectInstitution(u) {
    hiddenId.value = u.id;
    searchInput.value = u.name;
    hint.textContent = `${u.confidence === "official" ? "Official" : "Widely reported"} formula: ${formulaShort(u.formula)}`;
    hint.classList.add("is-set");
    closeList();
  }

  function closeList() {
    list.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
  }

  searchInput.addEventListener("focus", () => renderList(searchInput.value));
  searchInput.addEventListener("input", () => {
    hiddenId.value = "";
    hint.classList.remove("is-set");
    hint.textContent = "No institution selected yet.";
    renderList(searchInput.value);
  });
  list.addEventListener("click", (e) => {
    const opt = e.target.closest(".combobox-option");
    if (!opt) return;
    const u = byId(opt.dataset.id);
    if (u) selectInstitution(u);
  });
  document.addEventListener("click", (e) => {
    if (!$("#combobox").contains(e.target)) closeList();
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeList();
    if (e.key === "Enter") {
      e.preventDefault();
      const first = list.querySelector(".combobox-option");
      if (first) selectInstitution(byId(first.dataset.id));
    }
  });

  /* ---------------------------------------------------------------------
     Direction toggle
     --------------------------------------------------------------------- */
  let direction = "toPercent";
  const segments = $$(".segment");
  const inputValueLabel = $("#inputValueLabel");
  const inputValue = $("#inputValue");

  segments.forEach((btn) => {
    btn.addEventListener("click", () => {
      segments.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      direction = btn.dataset.direction;

      if (direction === "toPercent") {
        inputValueLabel.textContent = "CGPA (0 – 10)";
        inputValue.max = "10";
        inputValue.placeholder = "e.g. 8.20";
      } else {
        inputValueLabel.textContent = "Percentage (0 – 100)";
        inputValue.max = "100";
        inputValue.placeholder = "e.g. 82.00";
      }
      $("#result").hidden = true;
      $("#formError").hidden = true;
    });
  });

  /* ---------------------------------------------------------------------
     Convert
     --------------------------------------------------------------------- */
  const form = $("#converterForm");
  const errorEl = $("#formError");
  const resultEl = $("#result");

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    resultEl.hidden = true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const u = byId(hiddenId.value);
    if (!u) {
      showError("Select an institution from the list before converting.");
      return;
    }

    const raw = parseFloat(inputValue.value);
    if (isNaN(raw)) {
      showError("Enter a numeric value to convert.");
      return;
    }
    if (direction === "toPercent" && (raw < 0 || raw > 10)) {
      showError("CGPA must be between 0 and 10.");
      return;
    }
    if (direction === "toCgpa" && (raw < 0 || raw > 100)) {
      showError("Percentage must be between 0 and 100.");
      return;
    }

    let resultValue, resultLabel, formulaLine;

    if (direction === "toPercent") {
      resultValue = computePercentage(raw, u.formula);
      resultLabel = "Percentage";
      formulaLine = formulaText(u.formula, raw);
    } else {
      resultValue = computeCgpa(raw, u.formula);
      resultLabel = "CGPA";
      formulaLine = `${raw.toFixed(2)}% → ${resultValue.toFixed(2)} CGPA · using ${formulaShort(u.formula)}`;
    }

    $("#resultLabel").textContent = `${resultLabel} · ${u.name}`;
    $("#resultValue").textContent =
      resultLabel === "Percentage" ? `${resultValue.toFixed(2)}%` : resultValue.toFixed(2);
    $("#resultFormula").textContent = formulaLine;
    $("#resultNote").textContent = u.note;

    const stamp = $("#confidenceStamp");
    stamp.dataset.tier = u.confidence;
    $("#stampWord1").textContent = u.confidence === "official" ? "VERIFIED" : "WIDELY";
    $("#stampWord2").textContent = u.confidence === "official" ? "OFFICIAL" : "REPORTED";

    $("#verifySource").textContent =
      (u.confidence === "official"
        ? "Recorded as an official formula — issued in writing by the institution. "
        : "Recorded as a widely reported formula — consistent across the institution's own students and colleges, not sourced from a single circular here. ") +
      u.note;

    resultEl.hidden = false;
    $("#verifyPanel").hidden = true;
    $("#verifyToggle").setAttribute("aria-expanded", "false");
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // keep report link + compare box aware of the last institution used
    lastInstitution = u;
    updateReportLink();
  });

  $("#clearBtn").addEventListener("click", () => {
    form.reset();
    hiddenId.value = "";
    hint.textContent = "No institution selected yet.";
    hint.classList.remove("is-set");
    resultEl.hidden = true;
    errorEl.hidden = true;
  });

  /* ---------------------------------------------------------------------
     Copy result / verification toggle
     --------------------------------------------------------------------- */
  $("#copyBtn").addEventListener("click", async () => {
    const text = `${$("#resultLabel").textContent}: ${$("#resultValue").textContent} (${$("#resultFormula").textContent})`;
    try {
      await navigator.clipboard.writeText(text);
      const original = $("#copyBtn").textContent;
      $("#copyBtn").textContent = "Copied";
      setTimeout(() => ($("#copyBtn").textContent = original), 1600);
    } catch (err) {
      showError("Couldn't copy automatically — select the result text manually.");
    }
  });

  $("#verifyToggle").addEventListener("click", () => {
    const panel = $("#verifyPanel");
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    $("#verifyToggle").setAttribute("aria-expanded", String(isHidden));
    $("#verifyToggle").textContent = isHidden
      ? "Hide verification details"
      : "View verification details";
  });

  /* ---------------------------------------------------------------------
     Report an incorrect formula (mailto)
     --------------------------------------------------------------------- */
  let lastInstitution = null;
  function updateReportLink() {
    const subject = lastInstitution
      ? `Formula correction — ${lastInstitution.name}`
      : "Formula correction for GradeSync";
    const body = lastInstitution
      ? `Institution: ${lastInstitution.name}\nCurrent formula on file: ${formulaShort(lastInstitution.formula)}\nWhat I believe is correct: \nSource / how I know: \n`
      : `Institution: \nFormula I believe is correct: \nSource / how I know: \n`;
    $("#reportLink").href =
      `mailto:marchamit07@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  updateReportLink();

  /* ---------------------------------------------------------------------
     Reference grade scale table
     --------------------------------------------------------------------- */
  const gradeBody = $("#gradeTable tbody");
  GRADE_SCALE.forEach((g) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${g.letter}</td><td class="num">${g.points}</td><td>${g.band}</td><td>${g.desc}</td>`;
    gradeBody.appendChild(tr);
  });

  /* ---------------------------------------------------------------------
     Compare table
     --------------------------------------------------------------------- */
  const compareCgpaInput = $("#compareCgpa");
  const compareBody = $("#compareBody");
  let sortKey = "name";
  let sortDir = 1;

  function renderCompare() {
    const raw = parseFloat(compareCgpaInput.value);
    const cgpa = isNaN(raw) ? null : Math.min(Math.max(raw, 0), 10);

    const rows = INSTITUTIONS.map((u) => ({
      u,
      pct: cgpa === null ? null : computePercentage(cgpa, u.formula),
    }));

    rows.sort((a, b) => {
      let av, bv;
      if (sortKey === "name") { av = a.u.name; bv = b.u.name; }
      else if (sortKey === "formula") { av = formulaShort(a.u.formula); bv = formulaShort(b.u.formula); }
      else { av = a.pct ?? -1; bv = b.pct ?? -1; }
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });

    compareBody.innerHTML = "";
    rows.forEach(({ u, pct }) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.name}</td>
        <td class="formula-cell">${formulaShort(u.formula)}</td>
        <td class="num">${pct === null ? "—" : pct.toFixed(2) + "%"}</td>
        <td><span class="tier-pill ${u.confidence}">${u.confidence === "official" ? "Official" : "Reported"}</span></td>
      `;
      compareBody.appendChild(tr);
    });
  }

  compareCgpaInput.addEventListener("input", renderCompare);
  $$("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      sortDir = sortKey === key ? sortDir * -1 : 1;
      sortKey = key;
      renderCompare();
    });
  });

  renderCompare();
})();

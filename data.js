/* ==========================================================================
   GradeSync — Institution formula registry
   --------------------------------------------------------------------------
   formula.type
     "mult"          → % = cgpa * a
     "sub-mult"      → % = (cgpa - a) * b
     "mult-add"      → % = cgpa * a + b

   confidence
     "official"  → institute has issued a written circular / transcript
                   remark stating this exact formula
     "reported"  → formula is consistently reported by the institute's own
                   students and affiliated colleges, but no single public
                   circular was used as the source here — confirm locally
   ========================================================================== */

const INSTITUTIONS = [
  // ---- IITs -------------------------------------------------------------
  { id: "IITB",  name: "IIT Bombay",        group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "All IITs adopted a uniform CGPA×10 convention alongside the 10-point scale, IIT Madras being the published exception." },
  { id: "IITD",  name: "IIT Delhi",         group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "Percentage = CGPA × 10 on the institute's 10-point scale." },
  { id: "IITK",  name: "IIT Kanpur",        group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "Percentage = CGPA × 10 on the institute's 10-point scale." },
  { id: "IITKGP",name: "IIT Kharagpur",     group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "sub-mult", a: 0.5, b: 10 }, confidence: "official",
    note: "Institute transcripts and completion certificates carry the (CGPA − 0.5) × 10 conversion." },
  { id: "IITM",  name: "IIT Madras",        group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "official",
    note: "The sole IIT using a 9.5 multiplier rather than the common ×10 convention." },
  { id: "IITR",  name: "IIT Roorkee",       group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "Widely reported as CGPA × 10; confirm the current wording on your grade card." },
  { id: "IITG",  name: "IIT Guwahati",      group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "Widely reported as CGPA × 10; confirm the current wording on your grade card." },
  { id: "IITH",  name: "IIT Hyderabad",     group: "Indian Institutes of Technology", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "Confirmed by the institute's own CGPA-to-percentage conversion certificate: percentage = CGPA × 10." },

  // ---- NITs / IIITs ------------------------------------------------------
  { id: "NITDGP",name: "NIT Durgapur",      group: "NITs & IIITs", scale: 10,
    formula: { type: "sub-mult", a: 0.5, b: 10 }, confidence: "official",
    note: "Examination branch circular: percentage = (CGPA − 0.5) × 10." },
  { id: "NITK",  name: "NIT Surathkal (NITK)", group: "NITs & IIITs", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "official",
    note: "NITK's academic manual departs from the standard NIT ×10 rule and specifies a 9.5 multiplier." },
  { id: "NITT",  name: "NIT Tiruchirappalli",  group: "NITs & IIITs", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "reported",
    note: "Most NITs, apart from NITK, follow CGPA × 10 — verify against your semester grade card." },
  { id: "IIITH", name: "IIIT Hyderabad",    group: "NITs & IIITs", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "IIITs consistently report a direct CGPA × 10 conversion." },

  // ---- State & affiliating universities -----------------------------------
  { id: "ANNA",  name: "Anna University",   group: "State & Affiliating Universities", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "Anna University and its affiliated colleges apply CGPA × 10." },
  { id: "VTU",   name: "VTU (Visvesvaraya Technological University)", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.75, b: 10 }, confidence: "reported",
    note: "VTU's affiliated colleges commonly use (CGPA − 0.75) × 10." },
  { id: "SPPU",  name: "Savitribai Phule Pune University", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.75, b: 10 }, confidence: "reported",
    note: "Reported by SPPU-affiliated colleges as (CGPA − 0.75) × 10 — some departments quote a linear ×7.25+11 scale instead, so check your convocation transcript." },
  { id: "MU",    name: "University of Mumbai", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.75, b: 10 }, confidence: "reported",
    note: "Commonly reported alongside SPPU as (CGPA − 0.75) × 10 for affiliated engineering colleges." },
  { id: "GTU",   name: "Gujarat Technological University", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.5, b: 10 }, confidence: "reported",
    note: "GTU affiliated colleges report (CGPA − 0.5) × 10." },
  { id: "AKTU",  name: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.5, b: 10 }, confidence: "reported",
    note: "AKTU affiliated colleges report (CGPA − 0.5) × 10." },
  { id: "MAKAUT",name: "MAKAUT (formerly WBUT)", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.75, b: 10 }, confidence: "official",
    //note: "Most recent batches report a direct CGPA × 10; some older WBUT batches used (CGPA − 0.75) × 10 — check the year printed on your marksheet." },
     note: "MAKAUT's official conversion, as issued by the university, is (CGPA − 0.75) × 10." },
  { id: "GU",    name: "Gujarat University", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "reported",
    note: "Affiliated colleges commonly report CGPA × 9.5." },
  { id: "DU",    name: "University of Delhi", group: "State & Affiliating Universities", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "official",
    note: "Delhi University colleges commonly report CGPA × 9.5." },

  // ---- West Bengal universities (kept from the original build) ----------
  { id: "CUUG",  name: "Calcutta University — Undergraduate", group: "West Bengal Universities", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "official",
    note: "UG examination branch commonly reports CGPA × 10." },
  { id: "CUPG",  name: "Calcutta University — Postgraduate", group: "West Bengal Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.5, b: 10 }, confidence: "official",
    note: "PG departments commonly report (CGPA − 0.5) × 10." },
  { id: "JU",    name: "Jadavpur University", group: "West Bengal Universities", scale: 10,
    formula: { type: "sub-mult", a: 0.75, b: 10 }, confidence: "official",
    note: "Commonly reported by the examination controller's office as (CGPA − 0.75) × 10." },
  { id: "KALYANI", name: "University of Kalyani", group: "West Bengal Universities", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "official",
    note: "Affiliated colleges commonly report CGPA × 9.5." },
  { id: "UGB",   name: "University of Gour Banga", group: "West Bengal Universities", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "official",
    note: "Commonly reported as CGPA × 9.5." },

  // ---- Private / deemed universities -------------------------------------
  { id: "BITS",  name: "BITS Pilani",       group: "Private & Deemed Universities", scale: 10,
    formula: { type: "mult", a: 9.5 }, confidence: "reported",
    note: "BITS does not publish a fixed conversion; ×9.5 is the figure most graduates cite on transcripts requests." },
  { id: "VIT",   name: "VIT Vellore",       group: "Private & Deemed Universities", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "reported",
    note: "VIT's grading handbook is commonly cited as a direct CGPA × 10 conversion." },
  { id: "AMITY", name: "Amity University",  group: "Private & Deemed Universities", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "reported",
    note: "Commonly reported as a direct CGPA × 10 conversion." },
  { id: "ISI",   name: "Indian Statistical Institute", group: "Private & Deemed Universities", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "reported",
    note: "ISI does not publish a standing conversion table; ×10 is the most commonly used estimate for external forms." },
  { id: "Imps", name: "IMPS College",  group: "Private & Deemed Universities", scale: 10,
    formula: { type: "mult", a: 10 }, confidence: "reported",
    note: "Commonly reported as a direct CGPA × 10 conversion." },

  // ---- 4.0 scale (kept separate from the 10-point converter below) -------
];

/* Grade point reference — common UGC absolute 10-point scale.
   Shown in the reference table; several institutes use their own
   relative variant, noted inline where relevant. */
const GRADE_SCALE = [
  { letter: "O",  points: 10, band: "91 – 100", desc: "Outstanding" },
  { letter: "A+", points: 9,  band: "81 – 90",  desc: "Excellent" },
  { letter: "A",  points: 8,  band: "71 – 80",  desc: "Very Good" },
  { letter: "B+", points: 7,  band: "61 – 70",  desc: "Good" },
  { letter: "B",  points: 6,  band: "51 – 60",  desc: "Above Average" },
  { letter: "C",  points: 5,  band: "41 – 50",  desc: "Average" },
  { letter: "P",  points: 4,  band: "35 – 40",  desc: "Pass" },
  { letter: "F",  points: 0,  band: "Below 35", desc: "Fail" },
];

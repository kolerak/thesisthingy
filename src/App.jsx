import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════
const PFX = "tp:";
const saveP = (p) => {
  try { localStorage.setItem(`${PFX}${p._id}`, JSON.stringify(p)); }
  catch (e) { console.error("Save error", e); }
};
const loadAll = () => {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PFX)) {
      try { out.push(JSON.parse(localStorage.getItem(k))); } catch {}
    }
  }
  return out.sort((a, b) => a._num - b._num);
};

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════
const MAI_ITEMS = [
  "I ask myself periodically if I am meeting my goals.",
  "I consider several alternatives to a problem before I answer.",
  "I try to use strategies that have worked in the past.",
  "I pace myself while learning in order to have enough time.",
  "I understand my intellectual strengths and weaknesses.",
  "I think about what I really need to learn before I begin a task.",
  "I know how well I did once I finish a test.",
  "I set specific goals before I begin a task.",
  "I slow down when I encounter important information.",
  "I know what kind of information is most important to learn.",
  "I ask myself if I have considered all options when solving a problem.",
  "I am good at organizing information.",
  "I consciously focus my attention on important information.",
  "I have a specific purpose for each strategy I use.",
  "I learn best when I know something about the topic.",
  "I know what the teacher expects me to learn.",
  "I am good at remembering information.",
  "I use different learning strategies depending on the situation.",
  "I ask myself if there was an easier way to do things after I finish a task.",
  "I have control over how well I learn.",
  "I periodically review to help me understand important relationships.",
  "I ask myself questions about the material before I begin.",
  "I think of several ways to solve a problem and choose the best one.",
  "I summarize what I've learned after I finish.",
  "I ask others for help when I don't understand something.",
  "I can motivate myself to learn when I need to.",
  "I am aware of what strategies I use when I study.",
  "I find myself analyzing the usefulness of strategies while I study.",
  "I use my intellectual strengths to compensate for my weaknesses.",
  "I focus on the meaning and significance of new information.",
  "I create my own examples to make information more meaningful.",
  "I am a good judge of how well I understand something.",
  "I find myself using helpful learning strategies automatically.",
  "I find myself pausing regularly to check my comprehension.",
  "I know when each strategy I use will be most effective.",
  "I ask myself how well I accomplish my goals once I am finished.",
  "I draw pictures or diagrams to help me understand while learning.",
  "I ask myself if I have considered all options after I solve a problem.",
  "I try to translate new information into my own words.",
  "I change strategies when I fail to understand.",
  "I use the organizational structure of the text to help me learn.",
  "I read instructions carefully before I begin a task.",
  "I ask myself if what I am reading is related to what I already know.",
  "I reevaluate my assumptions when I get confused.",
  "I organize my time to best accomplish my goals.",
  "I learn more when I am interested in the topic.",
  "I try to break studying down into smaller steps.",
  "I focus on overall meaning rather than specifics.",
  "I ask myself questions about how well I am doing while I am learning something new.",
  "I ask myself if I learned as much as I could have once I finish a task.",
  "I stop and go back over new information that is not clear.",
  "I stop and reread when I get confused.",
];

const MAI_SS = {
  "Declarative K.":     { items:[5,10,12,16,17,20,32,46], max:8  },
  "Procedural K.":      { items:[3,14,27,33,35],           max:5  },
  "Conditional K.":     { items:[15,18,26,29],             max:4  },
  "Planning":           { items:[4,6,8,22,23,42,45],       max:7  },
  "Info Management":    { items:[9,13,30,31,37,39,41,43,47,48], max:10 },
  "Comprehension Mon.": { items:[1,2,11,21,28,34,49],      max:7  },
  "Debugging Strats":   { items:[25,40,44,51,52],          max:5  },
  "Evaluation":         { items:[7,19,24,36,38,50],        max:6  },
};

const S1 = [
  {id:"s1_q01",stage:"S1",text:"If the school finds out they lied, how much trouble will Arda's family get into?"},
  {id:"s1_q02",stage:"S2",text:"Would Arda enjoy school more if his best friend Cem were there too?"},
  {id:"s1_q03",stage:"S3",text:"By helping with this plan, would Arda prove himself to be a good and loyal friend to Cem?"},
  {id:"s1_q04",stage:"S3",text:"What would other parents at North Middle School think if they learned that a student from another district had taken their spot?"},
  {id:"s1_q05",stage:"S4",text:"What exactly does the school registration rule say?"},
  {id:"s1_q06",stage:"S4",text:"If everyone broke a rule they believed was unfair, what would happen to the school system?"},
  {id:"s1_q07",stage:"S5",text:"If some children receive a worse education simply because of where they live, is the school registration rule itself fair?"},
  {id:"s1_q08",stage:"S5",text:"Is it a fundamental duty of society to ensure that every child has equal educational opportunities, regardless of their income?"},
  {id:"s1_q09",stage:"S6",text:"Is a child's right to a good education more important, or is the school's right to enforce its own rules more important?"},
  {id:"s1_q10",stage:"S6",text:"In this case, what does it mean to be honest? Is honesty simply writing accurate information on a form, or acting in a way that protects a child's well-being?"},
  {id:"s1_m11",stage:"M", text:"How many meters long is the street that separates the North and South school zones?"},
  {id:"s1_m12",stage:"M", text:"What year was North Middle School's library building renovated?"},
];
const S2 = [
  {id:"s2_q01",stage:"S1",text:"If Elif writes this article, could she get in trouble with the principal or be punished for criticizing the system?"},
  {id:"s2_q02",stage:"S2",text:"If Elif writes this essay, is there a chance her teachers may treat her differently and her grades might drop?"},
  {id:"s2_q03",stage:"S2",text:"Would writing this article reduce Elif's chances of being chosen for special opportunities offered only to Section A students?"},
  {id:"s2_q04",stage:"S3",text:"If her friends in Section A accuse her of betraying successful students, should Elif avoid writing the article to stay accepted in her group?"},
  {id:"s2_q05",stage:"S3",text:"How much should the fact that Mert is her closest friend influence Elif's decision? Would she still care if her friend were not affected?"},
  {id:"s2_q06",stage:"S3",text:"What would her classmates think of her if she publicly criticized the class system? Would she be seen as jealous or a troublemaker?"},
  {id:"s2_q07",stage:"S4",text:"Does the school principal have the legal authority to implement this A-B-C placement system, or is it against existing school regulations?"},
  {id:"s2_q08",stage:"S4",text:"If the school keeps this system, could it improve the school's overall exam performance such as average LGS scores?"},
  {id:"s2_q09",stage:"S4",text:"If students start publicly criticizing school decisions like this, would it undermine the teachers' authority and disrupt school order?"},
  {id:"s2_q10",stage:"S5",text:"Does every student have the right to equal access to high-quality learning resources, regardless of which section they were placed in?"},
  {id:"s2_q11",stage:"S6",text:"Is the moral principle of fairness more important than protecting a system that benefits only the top-performing students?"},
  {id:"s2_m12",stage:"M", text:"How many minutes does it take to walk from Section A's classroom to Section C's classroom?"},
  {id:"s2_m13",stage:"M", text:"What brand of lab equipment was delivered to Section A this year?"},
];
const S3 = [
  {id:"s3_q01",stage:"S1",text:"Could Mr. Beck get in trouble or lose his job if he breaks the foundation's rule about keeping the scholarship confidential?"},
  {id:"s3_q02",stage:"S2",text:"Would selecting Maya make Mr. Beck feel good about helping a struggling student he personally likes?"},
  {id:"s3_q03",stage:"S2",text:"If Maya finds out he hid the opportunity from her, would this damage Mr. Beck's comfortable relationship with her?"},
  {id:"s3_q04",stage:"S3",text:"Would other teachers think Mr. Beck is unfair if he secretly chooses Maya without considering Daniel equally?"},
  {id:"s3_q05",stage:"S3",text:"Would Maya or Daniel see him as dishonest or biased depending on whom he secretly selects?"},
  {id:"s3_q06",stage:"S4",text:"Should Mr. Beck obey the foundation's rule strictly because institutions must follow procedures for fairness?"},
  {id:"s3_q07",stage:"S4",text:"Would telling the entire class violate school policy and undermine the trust between the foundation and the school?"},
  {id:"s3_q08",stage:"S5",text:"Should opportunities like scholarships be allocated based on who would benefit most rather than who has the highest grades?"},
  {id:"s3_q09",stage:"S5",text:"Does every student have the right to know about opportunities that may affect their future, even when an institution prefers secrecy?"},
  {id:"s3_q10",stage:"S6",text:"Is it morally more important to follow transparency and truth-telling even when a rule instructs the teacher to keep information hidden?"},
  {id:"s3_q11",stage:"S6",text:"Does justice require prioritizing the student whose life would be most transformed, regardless of academic rank?"},
  {id:"s3_m12",stage:"M", text:"What color folder does Mr. Beck use to store his scholarship recommendation letters?"},
];

const STORIES = [
  {id:1, title:"Story 1 — School Enrollment", questions:S1, orderKey:"s1_order", rankPrefix:"s1_rank_", rankCount:12},
  {id:2, title:"Story 2 — Ability Grouping",  questions:S2, orderKey:"s2_order", rankPrefix:"s2_rank_", rankCount:13},
  {id:3, title:"Story 3 — Scholarship",       questions:S3, orderKey:"s3_order", rankPrefix:"s3_rank_", rankCount:12},
];
const ALL_D = [...S1,...S2,...S3];
const mk = n => `mai_${String(n).padStart(2,"0")}`;
const rk = (prefix, pos) => `${prefix}p${String(pos).padStart(2,"0")}`;
const pad2 = n => String(n).padStart(2,"0");
const SC = {S1:"#64748b",S2:"#6366f1",S3:"#10b981",S4:"#f59e0b",S5:"#3b82f6",S6:"#8b5cf6",M:"#ef4444"};
const TABS = ["Demographics","Story 1","Story 2","Story 3","MAI 1–26","MAI 27–52","Review"];

// ═══════════════════════════════════════════════════════════════
// ORDER STRING PARSER
// Splits "9,10,8,7" → { s1_rank_p01:9, s1_rank_p02:10, ... }
// Unprovided positions are set to null
// ═══════════════════════════════════════════════════════════════
const parseOrderStr = (str, prefix, maxCount) => {
  const parts = str.split(",")
    .map(s => parseInt(s.trim()))
    .filter(v => !isNaN(v));
  const result = {};
  for (let i = 1; i <= maxCount; i++) {
    result[rk(prefix, i)] = parts[i-1] !== undefined ? parts[i-1] : null;
  }
  return result;
};

// ═══════════════════════════════════════════════════════════════
// VARIABLE DESCRIPTIONS
// ═══════════════════════════════════════════════════════════════
const VDESC = {
  _num:     "Participant number sequential",
  age:      "Age of participant in years",
  gender:   "Gender 1=Male 2=Female 3=Other 4=Not Specified",
  grade:    "Grade or year level",
  email:    "Email address optional",
  ...Object.fromEntries(MAI_ITEMS.map((t,i)=>[mk(i+1),`MAI item ${i+1} 1=True 2=False: ${t}`])),
  ...Object.fromEntries(ALL_D.map(q=>[q.id,`Stage ${q.stage} rated 1-7: ${q.text.substring(0,80)}`])),
  // Order raw strings
  s1_order: "Story 1 raw order string as written by participant",
  s2_order: "Story 2 raw order string as written by participant",
  s3_order: "Story 3 raw order string as written by participant",
  // Rank positions — Story 1 (12 items)
  ...Object.fromEntries(Array.from({length:12},(_,i)=>[
    rk("s1_rank_",i+1),
    `Story 1: Item placed at rank position ${i+1} by participant (1=most important)`
  ])),
  // Rank positions — Story 2 (13 items)
  ...Object.fromEntries(Array.from({length:13},(_,i)=>[
    rk("s2_rank_",i+1),
    `Story 2: Item placed at rank position ${i+1} by participant (1=most important)`
  ])),
  // Rank positions — Story 3 (12 items)
  ...Object.fromEntries(Array.from({length:12},(_,i)=>[
    rk("s3_rank_",i+1),
    `Story 3: Item placed at rank position ${i+1} by participant (1=most important)`
  ])),
};

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT FACTORY
// ═══════════════════════════════════════════════════════════════
const emptyP = (num) => {
  const p = {
    _id:`${Date.now()}${Math.random()}`.replace(".",""),
    _num:num,
    age:"", gender:null, grade:"", email:"",
    s1_order:"", s2_order:"", s3_order:"",
  };
  MAI_ITEMS.forEach((_,i)=>{ p[mk(i+1)] = null; });
  ALL_D.forEach(q=>{ p[q.id] = null; });
  // Rank position variables
  STORIES.forEach(s=>{
    for(let i=1;i<=s.rankCount;i++) p[rk(s.rankPrefix,i)] = null;
  });
  return p;
};

// ═══════════════════════════════════════════════════════════════
// COLUMN KEY ORDER (deterministic for CSV / PSPP)
// ═══════════════════════════════════════════════════════════════
const buildKeyOrder = () => {
  const ref = emptyP(1);
  // desired order: demo → stories (ratings + order raw + ranks) → MAI
  const demo = ["_num","age","gender","grade","email"];
  const storyKeys = STORIES.flatMap(s=>[
    ...s.questions.map(q=>q.id),
    s.orderKey,
    ...Array.from({length:s.rankCount},(_,i)=>rk(s.rankPrefix,i+1)),
  ]);
  const maiKeys = MAI_ITEMS.map((_,i)=>mk(i+1));
  return [...demo, ...storyKeys, ...maiKeys].filter(k=>k in ref);
};
const KEY_ORDER = buildKeyOrder();

// ═══════════════════════════════════════════════════════════════
// FILE DOWNLOAD HELPER
// ═══════════════════════════════════════════════════════════════
const dlFile = (content,name,mime)=>{
  const u=URL.createObjectURL(new Blob([content],{type:mime}));
  Object.assign(document.createElement("a"),{href:u,download:name}).click();
  URL.revokeObjectURL(u);
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 1 — CSV with header (for SPSS GET DATA, FIRSTCASE=2)
// ═══════════════════════════════════════════════════════════════
const buildCSV = (ps) => {
  if(!ps.length) return "";
  const row = p => KEY_ORDER.map(k=>{
    const v = p[k]??"-9", s = String(v);
    return (s.includes(",")||s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(",");
  return [KEY_ORDER.join(","), ...ps.map(row)].join("\n");
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 2 — Data-only CSV (NO header row, FIRSTCASE=1 in PSPP)
// ═══════════════════════════════════════════════════════════════
const buildDataOnlyCSV = (ps) => {
  if(!ps.length) return "";
  return ps.map(p=>KEY_ORDER.map(k=>{
    const v = p[k]??"-9", s = String(v);
    return (s.includes(",")||s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(",")).join("\n");
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 3 — PSPP STRUCTURE FILE
// Defines variables, labels, value labels, missing values.
// Points to thesis_data_rows.csv (no header, FIRSTCASE=1).
// Run this ONCE to load variable structure + all data.
// ═══════════════════════════════════════════════════════════════
const buildPSPPStructure = (ps) => {
  const isNum = k => ["_num","age","gender"].includes(k)
    || k.startsWith("mai_")
    || /^s[123]_[qm]/.test(k)
    || /^s[123]_rank_/.test(k);

  const varBlock = KEY_ORDER.map(k =>
    `    ${k.padEnd(14)} ${isNum(k)?"F8.0":"A100"}`
  ).join("\n");

  const lblBlock = KEY_ORDER
    .filter(k=>VDESC[k])
    .map(k=>`  ${k} '${VDESC[k].replace(/'/g,"''").replace(/[^\x00-\x7F]/g,"").substring(0,119)}'`)
    .join("\n");

  const maiVars  = MAI_ITEMS.map((_,i)=>mk(i+1)).join("\n    ");
  const dilVars  = ALL_D.map(q=>q.id).join("\n    ");
  const rankVars = STORIES.flatMap(s=>
    Array.from({length:s.rankCount},(_,i)=>rk(s.rankPrefix,i+1))
  ).join("\n    ");

  const subCalc = Object.entries(MAI_SS).map(([nm,{items,max}])=>{
    const vn="MAI_"+nm.replace(/[^A-Za-z]/g,"").substring(0,8).toUpperCase();
    return `COMPUTE ${vn.padEnd(18)}= ${items.map(n=>`(${mk(n)}=1)`).join(" + ")}.\nVARIABLE LABELS ${vn.padEnd(18)}'${nm} max ${max}'.`;
  }).join("\n");

  const s1pc  = "s1_q07+s1_q08+s1_q09+s1_q10";
  const s2pc  = "s2_q10+s2_q11";
  const s3pc  = "s3_q08+s3_q09+s3_q10+s3_q11";
  const s1all = S1.filter(q=>q.stage!=="M").map(q=>q.id).join("+");
  const s2all = S2.filter(q=>q.stage!=="M").map(q=>q.id).join("+");
  const s3all = S3.filter(q=>q.stage!=="M").map(q=>q.id).join("+");

  return `* ================================================================
* PSPP / SPSS — STRUCTURE + DATA IMPORT FILE
* Thesis: Metacognitive Awareness and Moral Judgment
* N = ${ps.length} participants | Generated: ${new Date().toLocaleString()}
* ----------------------------------------------------------------
* HOW TO USE:
*   1. Save this file as thesis_pspp_structure.sps
*   2. Save thesis_data_rows.csv (no-header export) in SAME folder
*   3. In PSPP: File > Run Syntax  (or: pspp thesis_pspp_structure.sps)
*   4. To add new participants: re-export thesis_data_rows.csv, re-run.
* ----------------------------------------------------------------
* CODING GUIDE:
*   Missing        : -9
*   Gender         : 1=Male 2=Female 3=Other 4=Not Specified
*   MAI items      : 1=True  2=False
*   Dilemma items  : 1=Not Important  ...  7=Very Important
*   Rank positions : Item number placed at that rank (1=most important)
*                    e.g. s1_rank_p01=9 means Q9 was ranked 1st
* ================================================================

* STEP 1 - IMPORT DATA ROWS (no header in this CSV)
GET DATA
  /TYPE=TXT
  /FILE='thesis_data_rows.csv'
  /ENCODING='UTF8'
  /DELIMITERS=","
  /QUALIFIER='"'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=1
  /VARIABLES=
${varBlock}.
EXECUTE.

* STEP 2 - VARIABLE LABELS
VARIABLE LABELS
${lblBlock}.

* STEP 3 - VALUE LABELS
VALUE LABELS
  gender
    -9 'Missing'
    1 'Male'
    2 'Female'
    3 'Other'
    4 'Not Specified'.
VALUE LABELS
    ${maiVars}
    -9 'Missing'
    1 'True'
    2 'False'.
VALUE LABELS
    ${dilVars}
    -9 'Missing'
    1 '1 Not Important at All'
    2 '2'
    3 '3'
    4 '4 Moderately Important'
    5 '5'
    6 '6'
    7 '7 Very Important'.
VALUE LABELS
    ${rankVars}
    -9 'Not ranked / missing'.

* STEP 4 - MISSING VALUES
MISSING VALUES _num age gender (-9).
MISSING VALUES
    ${maiVars} (-9).
MISSING VALUES
    ${dilVars} (-9).
MISSING VALUES
    ${rankVars} (-9).
EXECUTE.

* STEP 5 - MAI SUBSCALE SCORES (True=1, False=2 stored; (x=1) gives 1 for True)
${subCalc}

COMPUTE MAI_KnowTotal = MAI_DECLARAT + MAI_PROCEDUR + MAI_CONDITIO.
COMPUTE MAI_RegTotal  = MAI_PLANNING + MAI_INFOMANA + MAI_COMPREHE + MAI_DEBUGGIN + MAI_EVALUATI.
COMPUTE MAI_TOTAL     = MAI_KnowTotal + MAI_RegTotal.
VARIABLE LABELS
  MAI_KnowTotal 'MAI Knowledge of Cognition Total max 17'
  MAI_RegTotal  'MAI Regulation of Cognition Total max 35'
  MAI_TOTAL     'MAI Grand Total Score max 52'.
EXECUTE.

* STEP 6 - N2-EQUIVALENT MORAL JUDGMENT SCORES
COMPUTE S1_PostConv = ${s1pc}.
COMPUTE S1_MeanSum  = ${s1all}.
IF (S1_MeanSum > 0) S1_N2 = S1_PostConv / S1_MeanSum.
COMPUTE S2_PostConv = ${s2pc}.
COMPUTE S2_MeanSum  = ${s2all}.
IF (S2_MeanSum > 0) S2_N2 = S2_PostConv / S2_MeanSum.
COMPUTE S3_PostConv = ${s3pc}.
COMPUTE S3_MeanSum  = ${s3all}.
IF (S3_MeanSum > 0) S3_N2 = S3_PostConv / S3_MeanSum.
COMPUTE OVERALL_N2  = (S1_PostConv+S2_PostConv+S3_PostConv) /
                      (S1_MeanSum+S2_MeanSum+S3_MeanSum).
VARIABLE LABELS
  S1_N2      'Story 1 N2-Equivalent Score 0.00 to 1.00'
  S2_N2      'Story 2 N2-Equivalent Score 0.00 to 1.00'
  S3_N2      'Story 3 N2-Equivalent Score 0.00 to 1.00'
  OVERALL_N2 'Overall N2-Equivalent Moral Judgment Score 0.00 to 1.00'.
EXECUTE.

* STEP 7 - MEANINGLESS ITEM VALIDITY CHECK
COMPUTE S1_M_Sum = s1_m11 + s1_m12.
COMPUTE S2_M_Sum = s2_m12 + s2_m13.
COMPUTE S3_M_Sum = s3_m12.
VARIABLE LABELS
  S1_M_Sum 'Story 1 Meaningless item sum high score means suspect data'
  S2_M_Sum 'Story 2 Meaningless item sum'
  S3_M_Sum 'Story 3 Meaningless item sum'.
EXECUTE.

* ================================================================
* RANK POSITION ANALYSES (uncomment to run)
* These answer: which item was ranked most important most often?
* ================================================================
* -- Frequency of first-ranked item per story:
* FREQUENCIES VARIABLES = s1_rank_p01 s2_rank_p01 s3_rank_p01.

* -- Frequency across all rank positions Story 1:
* FREQUENCIES VARIABLES = ${Array.from({length:12},(_,i)=>rk("s1_rank_",i+1)).join(" ")}.

* -- Frequency across all rank positions Story 2:
* FREQUENCIES VARIABLES = ${Array.from({length:13},(_,i)=>rk("s2_rank_",i+1)).join(" ")}.

* -- Frequency across all rank positions Story 3:
* FREQUENCIES VARIABLES = ${Array.from({length:12},(_,i)=>rk("s3_rank_",i+1)).join(" ")}.

* ================================================================
* OPTIONAL ANALYSES (uncomment to run)
* ================================================================
* RELIABILITY /VARIABLES=${MAI_ITEMS.map((_,i)=>mk(i+1)).join(" ")} /MODEL=ALPHA /SUMMARY=TOTAL.
* DESCRIPTIVES VARIABLES=MAI_TOTAL MAI_KnowTotal MAI_RegTotal OVERALL_N2 S1_N2 S2_N2 S3_N2 /STATISTICS=MEAN STDDEV MIN MAX.
* CORRELATIONS /VARIABLES=MAI_TOTAL OVERALL_N2 S1_N2 S2_N2 S3_N2 /PRINT=TWOTAIL SIG.
* ONEWAY MAI_TOTAL OVERALL_N2 BY gender /STATISTICS DESCRIPTIVES.
`;
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 4 — SPSS full syntax (CSV with header, FIRSTCASE=2)
// ═══════════════════════════════════════════════════════════════
const buildSPSSFull = (ps) => {
  const isNum = k => ["_num","age","gender"].includes(k)
    || k.startsWith("mai_")
    || /^s[123]_[qm]/.test(k)
    || /^s[123]_rank_/.test(k);

  const varBlock = KEY_ORDER.map(k =>
    `    ${k.padEnd(14)} ${isNum(k)?"F8.0":"A100"}`
  ).join("\n");

  const lblBlock = KEY_ORDER
    .filter(k=>VDESC[k])
    .map(k=>`  ${k} '${VDESC[k].replace(/'/g,"''").replace(/[^\x00-\x7F]/g,"").substring(0,119)}'`)
    .join("\n");

  return `* SPSS Full Import Syntax (header CSV, FIRSTCASE=2)
* Use thesis_data.csv (with header) + this file
* Generated: ${new Date().toLocaleString()}

GET DATA
  /TYPE=TXT
  /FILE='thesis_data.csv'
  /ENCODING='UTF8'
  /DELIMITERS=","
  /QUALIFIER='"'
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=2
  /VARIABLES=
${varBlock}.
EXECUTE.

VARIABLE LABELS
${lblBlock}.
EXECUTE.
`;
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 5 — SQL
// ═══════════════════════════════════════════════════════════════
const buildSQL = (ps) => {
  if(!ps.length) return "";
  const isNum = k => ["_num","age","gender"].includes(k)
    || k.startsWith("mai_")
    || /^s[123]_[qm]/.test(k)
    || /^s[123]_rank_/.test(k);

  const colDefs = KEY_ORDER.map(k =>
    `  ${k.padEnd(14)} ${isNum(k)?"INTEGER":"TEXT"}    -- ${(VDESC[k]||k).substring(0,90)}`
  ).join(",\n");

  const inserts = ps.map(p=>{
    const vals = KEY_ORDER.map(k=>{
      const v = p[k];
      if(v===null||v===undefined||v==="") return "-9";
      if(isNum(k)) return String(isNaN(Number(v))?"-9":Number(v));
      return `'${String(v).replace(/'/g,"''")}'`;
    }).join(", ");
    return `INSERT INTO participants (${KEY_ORDER.join(", ")}) VALUES (${vals});`;
  }).join("\n");

  const subViews = Object.entries(MAI_SS).map(([nm,{items}])=>{
    const vn=nm.replace(/[^A-Za-z]/g,"_").toLowerCase();
    return `  (${items.map(n=>`(${mk(n)}=1)`).join("+")}) AS mai_${vn}`;
  }).join(",\n");

  return `-- ================================================================
-- Thesis Database | Generated: ${new Date().toLocaleString()}
-- N = ${ps.length} participants
-- SQLite / PostgreSQL / MySQL compatible
-- ================================================================

DROP TABLE IF EXISTS participants;

CREATE TABLE participants (
${colDefs}
);

-- MAI subscale scores view
CREATE VIEW IF NOT EXISTS mai_scores AS
SELECT _num, age, gender, grade,
${subViews},
  ((mai_05=1)+(mai_10=1)+(mai_12=1)+(mai_16=1)+(mai_17=1)+(mai_20=1)+(mai_32=1)+(mai_46=1)+
   (mai_03=1)+(mai_14=1)+(mai_27=1)+(mai_33=1)+(mai_35=1)+
   (mai_15=1)+(mai_18=1)+(mai_26=1)+(mai_29=1)) AS mai_know_total,
  ((mai_04=1)+(mai_06=1)+(mai_08=1)+(mai_22=1)+(mai_23=1)+(mai_42=1)+(mai_45=1)+
   (mai_09=1)+(mai_13=1)+(mai_30=1)+(mai_31=1)+(mai_37=1)+(mai_39=1)+(mai_41=1)+(mai_43=1)+(mai_47=1)+(mai_48=1)+
   (mai_01=1)+(mai_02=1)+(mai_11=1)+(mai_21=1)+(mai_28=1)+(mai_34=1)+(mai_49=1)+
   (mai_25=1)+(mai_40=1)+(mai_44=1)+(mai_51=1)+(mai_52=1)+
   (mai_07=1)+(mai_19=1)+(mai_24=1)+(mai_36=1)+(mai_38=1)+(mai_50=1)) AS mai_reg_total
FROM participants;

-- Moral judgment N2 scores view
CREATE VIEW IF NOT EXISTS moral_scores AS
SELECT _num,
  CAST((s1_q07+s1_q08+s1_q09+s1_q10) AS REAL)/
    NULLIF(CAST((s1_q01+s1_q02+s1_q03+s1_q04+s1_q05+s1_q06+s1_q07+s1_q08+s1_q09+s1_q10) AS REAL),0) AS s1_n2,
  CAST((s2_q10+s2_q11) AS REAL)/
    NULLIF(CAST((s2_q01+s2_q02+s2_q03+s2_q04+s2_q05+s2_q06+s2_q07+s2_q08+s2_q09+s2_q10+s2_q11) AS REAL),0) AS s2_n2,
  CAST((s3_q08+s3_q09+s3_q10+s3_q11) AS REAL)/
    NULLIF(CAST((s3_q01+s3_q02+s3_q03+s3_q04+s3_q05+s3_q06+s3_q07+s3_q08+s3_q09+s3_q10+s3_q11) AS REAL),0) AS s3_n2
FROM participants;

-- Rank frequency view: which item was ranked 1st most often per story
CREATE VIEW IF NOT EXISTS rank_frequencies AS
SELECT
  s1_rank_p01 AS s1_first_choice,
  s2_rank_p01 AS s2_first_choice,
  s3_rank_p01 AS s3_first_choice,
  COUNT(*) AS freq
FROM participants
GROUP BY s1_rank_p01, s2_rank_p01, s3_rank_p01;

-- INSERT DATA
${inserts}

-- Useful queries:
-- SELECT * FROM mai_scores;
-- SELECT * FROM moral_scores;
-- SELECT s1_rank_p01, COUNT(*) as freq FROM participants GROUP BY s1_rank_p01 ORDER BY freq DESC;
-- SELECT s1_rank_p01, AVG(CAST(s1_q01+s1_q02+s1_q03+s1_q04+s1_q05+s1_q06+s1_q07+s1_q08+s1_q09+s1_q10 AS REAL)) FROM participants GROUP BY s1_rank_p01;
`;
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [parts, setParts]   = useState(null);
  const [pIdx, setPIdx]     = useState(0);
  const [tab, setTab]       = useState(0);
  const [focRow, setFocRow] = useState(0);
  const [status, setStatus] = useState("");
  const rowRefs  = useRef({});
  const autoSave = useRef(null);

  useEffect(()=>{
    const loaded = loadAll();
    if(loaded.length>0){ setParts(loaded); setPIdx(loaded.length-1); }
    else { const f=emptyP(1); saveP(f); setParts([f]); }
  },[]);

  useEffect(()=>{
    if(!parts) return;
    clearTimeout(autoSave.current);
    autoSave.current = setTimeout(()=>saveP(parts[pIdx]),400);
  },[parts,pIdx]);

  const cur = parts?.[pIdx];

  // Plain field update
  const upd = useCallback((k,v)=>{
    setParts(prev=>prev.map((p,i)=>i===pIdx?{...p,[k]:v}:p));
  },[pIdx]);

  // Order string update — also parses into rank positions
  const updOrder = useCallback((story, rawStr)=>{
    const ranked = parseOrderStr(rawStr, story.rankPrefix, story.rankCount);
    setParts(prev=>prev.map((p,i)=>{
      if(i!==pIdx) return p;
      return {...p, [story.orderKey]:rawStr, ...ranked};
    }));
  },[pIdx]);

  const saveNext = ()=>{
    saveP(parts[pIdx]);
    const ni=parts.length, next=emptyP(ni+1);
    saveP(next);
    setParts(prev=>[...prev,next]);
    setPIdx(ni); setTab(0); setFocRow(0);
    setStatus(`✓ P${pIdx+1} saved!`);
    setTimeout(()=>setStatus(""),2000);
  };

  const flash = (msg)=>{ setStatus(msg); setTimeout(()=>setStatus(""),2500); };

  const doExport = (type)=>{
    const all = loadAll();
    if(!all.length){ flash("No data yet!"); return; }
    switch(type){
      case "csv":       dlFile(buildCSV(all),         "thesis_data.csv",             "text/csv");  break;
      case "datarows":  dlFile(buildDataOnlyCSV(all),  "thesis_data_rows.csv",        "text/csv");  break;
      case "pspp":      dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps",   "text/plain"); break;
      case "spss":      dlFile(buildSPSSFull(all),     "thesis_spss_full.sps",        "text/plain"); break;
      case "sql":       dlFile(buildSQL(all),          "thesis_data.sql",             "text/plain"); break;
      case "pspp_both":
        dlFile(buildDataOnlyCSV(all),  "thesis_data_rows.csv",      "text/csv");
        dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps", "text/plain");
        break;
      case "all":
        dlFile(buildCSV(all),          "thesis_data.csv",            "text/csv");
        dlFile(buildDataOnlyCSV(all),  "thesis_data_rows.csv",       "text/csv");
        dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps",  "text/plain");
        dlFile(buildSPSSFull(all),     "thesis_spss_full.sps",       "text/plain");
        dlFile(buildSQL(all),          "thesis_data.sql",            "text/plain");
        break;
      default: break;
    }
    flash(`✓ ${all.length} participants exported`);
  };

  const tabItems = useCallback(()=>{
    if(tab===1) return S1.map(q=>q.id);
    if(tab===2) return S2.map(q=>q.id);
    if(tab===3) return S3.map(q=>q.id);
    if(tab===4) return MAI_ITEMS.slice(0,26).map((_,i)=>mk(i+1));
    if(tab===5) return MAI_ITEMS.slice(26).map((_,i)=>mk(i+27));
    return [];
  },[tab]);

  useEffect(()=>{
    const items=tabItems();
    const h=(e)=>{
      const tag=e.target.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA") return;
      const k=e.key;
      if(k==="Tab"){e.preventDefault();setTab(t=>e.shiftKey?Math.max(t-1,0):Math.min(t+1,TABS.length-1));return;}
      if(k==="ArrowDown"||k==="j"){e.preventDefault();setFocRow(r=>Math.min(r+1,items.length-1));return;}
      if(k==="ArrowUp"  ||k==="k"){e.preventDefault();setFocRow(r=>Math.max(r-1,0));return;}
      if(k==="Backspace"||k==="Delete"){if(items[focRow])upd(items[focRow],null);return;}
      if((tab===4||tab===5)&&items[focRow]){
        if(k.toLowerCase()==="t"){upd(items[focRow],1);setFocRow(r=>Math.min(r+1,items.length-1));}
        if(k.toLowerCase()==="r"){upd(items[focRow],2);setFocRow(r=>Math.min(r+1,items.length-1));}
        return;
      }
      if([1,2,3].includes(tab)&&items[focRow]){
        const n=parseInt(k);
        if(n>=1&&n<=7){upd(items[focRow],n);setFocRow(r=>Math.min(r+1,items.length-1));}
        return;
      }
      if(tab===6&&k==="Enter") saveNext();
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[tab,focRow,tabItems,upd,parts,pIdx]);

  useEffect(()=>{setFocRow(0);},[tab]);
  useEffect(()=>{
    rowRefs.current[focRow]?.scrollIntoView({block:"nearest",behavior:"smooth"});
  },[focRow,tab]);

  if(!parts) return(
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",
      justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,border:"3px solid #334155",borderTop:"3px solid #a78bfa",
        borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{color:"#a78bfa",fontSize:16,fontWeight:700}}>Loading saved data…</div>
    </div>
  );
  if(!cur) return null;

  const pct=(()=>{
    const keys=Object.keys(cur).filter(k=>
      !["_id","_num","email"].includes(k)&&
      !k.endsWith("_order")&&
      !/^s[123]_rank_/.test(k)
    );
    return Math.round(keys.filter(k=>cur[k]!==null&&cur[k]!=="").length/keys.length*100);
  })();
  const items=tabItems();
  const filled=items.filter(k=>cur[k]!==null).length;

  // ── Sub-components ─────────────────────────────────────────────
  const MAIRow=({idx,gIdx})=>{
    const key=mk(gIdx),val=cur[key],foc=focRow===idx;
    return(
      <div ref={el=>rowRefs.current[idx]=el} onClick={()=>setFocRow(idx)}
        style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:3,
          background:val===1?"#052e16":val===2?"#1c0a09":"#1e293b",
          borderRadius:8,cursor:"pointer",transition:"all 0.1s",
          border:`2px solid ${foc?"#a78bfa":val===1?"#10b981":val===2?"#ef4444":"#2d3f55"}`,
          boxShadow:foc?"0 0 0 3px rgba(124,58,237,0.2)":"none"}}>
        <div style={{fontSize:11,color:"#475569",minWidth:24,fontWeight:700,textAlign:"right"}}>{gIdx}</div>
        <div style={{flex:1,fontSize:13,color:"#cbd5e1",lineHeight:1.5}}>{MAI_ITEMS[gIdx-1]}</div>
        <div style={{display:"flex",gap:5}}>
          {[["T",1,"#10b981"],["R",2,"#ef4444"]].map(([l,v,c])=>(
            <button key={l} onMouseDown={e=>{e.preventDefault();upd(key,cur[key]===v?null:v);}}
              style={{width:32,height:30,borderRadius:6,border:"none",cursor:"pointer",
                fontWeight:800,fontSize:12,transition:"all 0.1s",
                background:cur[key]===v?c:"#334155",color:cur[key]===v?"#fff":"#64748b"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:12,minWidth:16,textAlign:"center",fontWeight:800,
          color:val===1?"#10b981":val===2?"#ef4444":"#334155"}}>
          {val===null?"·":val===1?"T":"F"}
        </div>
      </div>
    );
  };

  const DRow=({q,idx})=>{
    const val=cur[q.id],foc=focRow===idx,c=SC[q.stage];
    return(
      <div ref={el=>rowRefs.current[idx]=el} onClick={()=>setFocRow(idx)}
        style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",marginBottom:3,
          background:foc?"#1a2744":"#1e293b",
          border:`2px solid ${foc?"#a78bfa":"#2d3f55"}`,
          borderRadius:8,cursor:"pointer",transition:"all 0.1s",
          boxShadow:foc?"0 0 0 3px rgba(124,58,237,0.2)":"none"}}>
        <div style={{fontSize:10,fontWeight:900,color:"#0f172a",background:c,borderRadius:5,
          padding:"3px 6px",minWidth:30,textAlign:"center",flexShrink:0}}>{q.stage}</div>
        <div style={{fontSize:11,color:"#475569",minWidth:42,flexShrink:0,fontFamily:"monospace"}}>
          {q.id.split("_")[1].toUpperCase()}
        </div>
        <div style={{flex:1,fontSize:13,color:"#94a3b8",lineHeight:1.45}}>{q.text}</div>
        <div style={{display:"flex",gap:3,flexShrink:0}}>
          {[1,2,3,4,5,6,7].map(n=>(
            <button key={n} onMouseDown={e=>{e.preventDefault();upd(q.id,cur[q.id]===n?null:n);}}
              style={{width:28,height:28,borderRadius:5,border:"none",cursor:"pointer",
                fontWeight:800,fontSize:12,transition:"all 0.1s",
                background:cur[q.id]===n?c:"#334155",color:cur[q.id]===n?"#fff":"#64748b"}}>{n}</button>
          ))}
        </div>
        <div style={{fontSize:13,minWidth:14,fontWeight:800,color:val?c:"#334155"}}>{val||""}</div>
      </div>
    );
  };

  // ── RENDER ──────────────────────────────────────────────────────
  return(
    <div style={{height:"100vh",background:"#0f172a",color:"#e2e8f0",display:"flex",
      flexDirection:"column",overflow:"hidden"}}>

      {/* HEADER */}
      <div style={{background:"#1e293b",borderBottom:"2px solid #334155",padding:"8px 20px",
        display:"flex",alignItems:"center",gap:12,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{fontWeight:900,fontSize:14,color:"#a78bfa",flexShrink:0}}>📋 THESIS ENTRY</div>
        <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap",maxHeight:60,overflowY:"auto"}}>
          {parts.map((_,i)=>(
            <button key={i} onClick={()=>{setPIdx(i);setTab(0);}}
              style={{width:26,height:26,borderRadius:"50%",border:"none",cursor:"pointer",
                fontSize:9,fontWeight:800,transition:"all 0.1s",
                background:i===pIdx?"#7c3aed":"#334155",
                color:i===pIdx?"#fff":"#94a3b8",
                boxShadow:i===pIdx?"0 0 0 2px rgba(124,58,237,0.4)":"none"}}>
              {i+1}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
          {status&&<span style={{color:"#10b981",fontWeight:600,fontSize:11}}>{status}</span>}
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:55,height:6,background:"#334155",borderRadius:3,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",
                background:pct===100?"#10b981":"#7c3aed",transition:"width 0.3s"}}/>
            </div>
            <span style={{fontSize:10,color:pct===100?"#10b981":"#64748b",fontWeight:600}}>{pct}%</span>
          </div>
          {/* Export buttons */}
          {[
            ["CSV",       "csv",      "#334155"],
            ["Data Rows", "datarows", "#0f4c75"],
            ["PSPP+Data", "pspp_both","#7c3aed"],
            ["SPSS",      "spss",     "#9333ea"],
            ["SQL",       "sql",      "#0369a1"],
            ["All ↓",     "all",      "#10b981"],
          ].map(([lbl,type,bg])=>(
            <button key={type} onClick={()=>doExport(type)}
              style={{padding:"5px 10px",background:bg,color:"#fff",border:"none",
                borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,
                whiteSpace:"nowrap",transition:"opacity 0.1s"}}>
              ⬇ {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* KEYBOARD LEGEND */}
      <div style={{background:"#0d1b2e",borderBottom:"1px solid #1e293b",padding:"4px 20px",
        display:"flex",gap:14,fontSize:10,color:"#334155",flexWrap:"wrap",flexShrink:0,alignItems:"center"}}>
        {(tab===4||tab===5)&&<>
          <span><kbd style={{color:"#10b981"}}>T</kbd> True (1)</span>
          <span><kbd style={{color:"#ef4444"}}>R</kbd> False (2)</span>
        </>}
        {[1,2,3].includes(tab)&&<span><kbd style={{color:"#a78bfa"}}>1–7</kbd> Rate</span>}
        <span><kbd>↑↓</kbd> Navigate</span>
        <span><kbd>Tab</kbd> Next section</span>
        <span><kbd>⇧Tab</kbd> Prev</span>
        <span><kbd>Bksp</kbd> Clear</span>
        {tab===6&&<span><kbd style={{color:"#10b981"}}>Enter</kbd> Save &amp; Next</span>}
        <span style={{marginLeft:"auto",color:"#475569",fontWeight:600}}>
          {items.length?`${filled}/${items.length} filled`:""} &nbsp; P{pIdx+1}/{parts.length}
        </span>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#1e293b",padding:"6px 20px",
        borderBottom:"1px solid #334155",gap:2,overflowX:"auto",flexShrink:0}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)}
            style={{padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",
              fontWeight:700,fontSize:11,whiteSpace:"nowrap",transition:"all 0.1s",
              background:tab===i?"#7c3aed":"transparent",
              color:tab===i?"#fff":"#64748b"}}>
            {t}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>

          {/* DEMOGRAPHICS */}
          {tab===0&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:20,fontSize:16,fontWeight:800}}>
                Participant {pIdx+1} — Demographics
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}}>
                {[["age","Age","number"],["grade","Grade / Year","text"],["email","Email (optional)","email"]].map(([k,l,tp])=>(
                  <div key={k}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:5,fontWeight:600}}>{l}</div>
                    <input type={tp} value={cur[k]} onChange={e=>upd(k,e.target.value)}
                      style={{width:"100%",padding:"10px 12px",background:"#1e293b",
                        border:"1px solid #334155",borderRadius:8,color:"#e2e8f0",
                        fontSize:13,outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="#7c3aed"}
                      onBlur={e=>e.target.style.borderColor="#334155"}/>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontWeight:600}}>
                  Gender <span style={{color:"#334155",fontWeight:400}}>(stored as integer)</span>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[[1,"Male","♂"],[2,"Female","♀"],[3,"Other","⚧"],[4,"Not Specified","—"]].map(([v,l,ic])=>(
                    <button key={v} onClick={()=>upd("gender",cur.gender===v?null:v)}
                      style={{padding:"10px 18px",borderRadius:8,cursor:"pointer",fontWeight:700,
                        fontSize:12,transition:"all 0.15s",
                        border:`2px solid ${cur.gender===v?"#7c3aed":"#334155"}`,
                        background:cur.gender===v?"#7c3aed":"#1e293b",
                        color:cur.gender===v?"#fff":"#64748b"}}>
                      <span style={{marginRight:6}}>{ic}</span>{v}={l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{padding:14,background:"#1e293b",borderRadius:10,fontSize:12,
                color:"#64748b",lineHeight:2,border:"1px solid #334155"}}>
                <div><span style={{color:"#94a3b8",fontWeight:700}}>Instruments:</span> Story 1: 12 | Story 2: 13 | Story 3: 12 | MAI: 52 items</div>
                <div><span style={{color:"#94a3b8",fontWeight:700}}>Total variables:</span> 98 core + 37 rank positions = 135 per participant</div>
                <div><span style={{color:"#10b981",fontWeight:700}}>Auto-save:</span> Every keystroke saved. All exports pull from full localStorage.</div>
                <div style={{marginTop:8,padding:"8px 12px",background:"#0f172a",borderRadius:7,lineHeight:1.8}}>
                  <span style={{color:"#7c3aed",fontWeight:700}}>PSPP workflow:</span> Click <strong style={{color:"#fff"}}>⬇ PSPP+Data</strong> → downloads both files → place in same folder → run <code style={{color:"#a78bfa"}}>thesis_pspp_structure.sps</code> in PSPP
                </div>
              </div>
            </div>
          )}

          {/* STORIES */}
          {[1,2,3].includes(tab)&&(()=>{
            const s=STORIES[tab-1];
            // Parse current rank positions for preview
            const rankPreview = Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]);
            const filledRanks = rankPreview.filter(v=>v!==null).length;
            return(
              <div>
                <h2 style={{color:"#a78bfa",marginBottom:6,fontSize:16,fontWeight:800}}>{s.title}</h2>
                <div style={{fontSize:11,color:"#64748b",marginBottom:14,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  Press 1–7 to rate the highlighted row.
                  {Object.entries(SC).map(([sg,c])=>(
                    <span key={sg} style={{background:c,color:"#0f172a",borderRadius:4,
                      padding:"2px 6px",fontSize:10,fontWeight:800}}>{sg}</span>
                  ))}
                </div>
                {s.questions.map((q,i)=><DRow key={q.id} q={q} idx={i}/>)}

                {/* Order input with rank preview */}
                <div style={{marginTop:14,padding:"14px 16px",background:"#1e293b",
                  borderRadius:10,border:"1px solid #334155"}}>
                  <div style={{fontSize:11,color:"#94a3b8",marginBottom:6,fontWeight:600}}>
                    Participant's written order of importance
                    <span style={{color:"#475569",fontWeight:"400",marginLeft:6}}>
                      — type exactly as written, comma-separated (e.g. 9,10,8,7...)
                    </span>
                  </div>
                  <input
                    value={cur[s.orderKey]}
                    onChange={e=>updOrder(s,e.target.value)}
                    placeholder={`e.g. 9,10,8,7,6... (${s.rankCount} items total)`}
                    style={{width:"100%",padding:"9px 12px",background:"#0f172a",
                      border:"1px solid #334155",borderRadius:7,color:"#e2e8f0",
                      fontSize:13,outline:"none",marginBottom:10}}
                    onFocus={e=>e.target.style.borderColor="#7c3aed"}
                    onBlur={e=>e.target.style.borderColor="#334155"}/>

                  {/* Rank position preview grid */}
                  {filledRanks>0&&(
                    <div>
                      <div style={{fontSize:10,color:"#475569",marginBottom:6,fontWeight:600}}>
                        Saved rank positions ({filledRanks}/{s.rankCount} parsed):
                      </div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {rankPreview.map((v,i)=>(
                          <div key={i} style={{
                            padding:"4px 8px",borderRadius:5,fontSize:11,fontWeight:700,
                            background:v!==null?"#1e3a5f":"#1e293b",
                            border:`1px solid ${v!==null?"#3b82f6":"#334155"}`,
                            color:v!==null?"#93c5fd":"#334155",
                            minWidth:44,textAlign:"center"}}>
                            <div style={{fontSize:8,color:"#475569",fontWeight:400}}>Rank {i+1}</div>
                            <div>Q{v!==null?pad2(v):"·"}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:10,color:"#475569",marginTop:8}}>
                        💡 Saved as separate variables: <code style={{color:"#a78bfa"}}>{s.rankPrefix}p01</code> = Q{rankPreview[0]??'?'} (most important), <code style={{color:"#a78bfa"}}>{s.rankPrefix}p02</code> = Q{rankPreview[1]??'?'}, …
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* MAI 1-26 */}
          {tab===4&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:16,fontWeight:800}}>
                MAI — Items 1–26 &nbsp;
                <span style={{fontSize:11,color:"#64748b",fontWeight:400}}>Schraw &amp; Dennison (1994)</span>
              </h2>
              <div style={{fontSize:11,color:"#64748b",marginBottom:14}}>
                <kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> = True → saves as <strong style={{color:"#10b981"}}>1</strong> &nbsp;&nbsp;
                <kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> = False → saves as <strong style={{color:"#ef4444"}}>2</strong> &nbsp;&nbsp;
                Missing → <strong>−9</strong>
              </div>
              {MAI_ITEMS.slice(0,26).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+1}/>)}
            </div>
          )}

          {/* MAI 27-52 */}
          {tab===5&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:16,fontWeight:800}}>MAI — Items 27–52</h2>
              <div style={{fontSize:11,color:"#64748b",marginBottom:14}}>
                <kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> = True → saves as <strong style={{color:"#10b981"}}>1</strong> &nbsp;&nbsp;
                <kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> = False → saves as <strong style={{color:"#ef4444"}}>2</strong>
              </div>
              {MAI_ITEMS.slice(26).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+27}/>)}
            </div>
          )}

          {/* REVIEW */}
          {tab===6&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:18,fontSize:16,fontWeight:800}}>
                Review — Participant {pIdx+1}
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                {[["P#",cur._num],["Age",cur.age||"—"],["Gender",["—","Male","Female","Other","N/S"][cur.gender||0]],["Grade",cur.grade||"—"]].map(([l,v])=>(
                  <div key={l} style={{background:"#1e293b",borderRadius:9,padding:"11px 14px",border:"1px solid #334155"}}>
                    <div style={{fontSize:10,color:"#64748b",marginBottom:4,fontWeight:600}}>{l}</div>
                    <div style={{fontSize:14,color:"#e2e8f0",fontWeight:800}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Rank summary */}
              <div style={{background:"#1e293b",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #334155"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#a78bfa",marginBottom:10}}>Order of Importance — Rank Positions</div>
                {STORIES.map(s=>{
                  const ranks=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]);
                  const filled=ranks.filter(v=>v!==null).length;
                  return(
                    <div key={s.id} style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:"#94a3b8",marginBottom:5,fontWeight:600}}>
                        {s.title} &nbsp;
                        <span style={{color:filled===s.rankCount?"#10b981":"#f59e0b",fontSize:10}}>
                          {filled}/{s.rankCount} ranked
                        </span>
                        {cur[s.orderKey]&&<span style={{color:"#475569",fontWeight:"400",marginLeft:8,fontSize:10}}>raw: "{cur[s.orderKey]}"</span>}
                      </div>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        {ranks.map((v,i)=>(
                          <div key={i} style={{padding:"3px 7px",borderRadius:5,fontSize:10,fontWeight:700,
                            background:v!==null?"#1e3a5f":"#0f172a",
                            border:`1px solid ${v!==null?"#3b82f6":"#1e293b"}`,
                            color:v!==null?"#93c5fd":"#334155",textAlign:"center",minWidth:36}}>
                            <div style={{fontSize:8,color:"#334155"}}>#{i+1}</div>
                            Q{v!==null?pad2(v):"·"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MAI subscales */}
              <div style={{background:"#1e293b",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #334155"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#a78bfa",marginBottom:10}}>MAI Subscale Scores</div>
                {Object.entries(MAI_SS).map(([nm,{items,max}])=>{
                  const miss=items.filter(n=>cur[mk(n)]===null).length;
                  const score=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  return(
                    <div key={nm} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <div style={{fontSize:12,color:"#94a3b8",minWidth:155,fontWeight:500}}>{nm}</div>
                      <div style={{flex:1,height:6,background:"#334155",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${(score/max)*100}%`,height:"100%",background:"#7c3aed",transition:"width 0.3s"}}/>
                      </div>
                      <div style={{fontSize:11,minWidth:65,textAlign:"right",fontWeight:700,
                        color:miss>0?"#f59e0b":"#10b981"}}>
                        {miss>0?`⚠ ${miss} missing`:`${score} / ${max}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Missing check */}
              <div style={{background:"#1e293b",borderRadius:10,padding:14,marginBottom:16,border:"1px solid #334155"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#a78bfa",marginBottom:10}}>Missing Values</div>
                {STORIES.map(s=>{
                  const m=s.questions.filter(q=>cur[q.id]===null);
                  return(
                    <div key={s.id} style={{fontSize:12,marginBottom:4,display:"flex",gap:8}}>
                      <span style={{color:"#64748b",minWidth:140}}>{s.title}:</span>
                      {m.length===0
                        ?<span style={{color:"#10b981",fontWeight:700}}>✓ Complete</span>
                        :<span style={{color:"#f59e0b"}}>⚠ {m.map(q=>q.id.split("_")[1].toUpperCase()).join(", ")}</span>}
                    </div>
                  );
                })}
                {(()=>{
                  const mm=MAI_ITEMS.map((_,i)=>mk(i+1)).filter(k=>cur[k]===null).length;
                  return(
                    <div style={{fontSize:12,display:"flex",gap:8}}>
                      <span style={{color:"#64748b",minWidth:140}}>MAI (52 items):</span>
                      {mm===0?<span style={{color:"#10b981",fontWeight:700}}>✓ Complete</span>
                        :<span style={{color:"#f59e0b"}}>⚠ {mm} missing</span>}
                    </div>
                  );
                })()}
              </div>

              <div style={{display:"flex",gap:10}}>
                <button onClick={saveNext}
                  style={{flex:1,padding:"14px",background:"#7c3aed",color:"#fff",border:"none",
                    borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14}}>
                  ✓ Save &amp; Enter Next Participant (P{pIdx+2})
                  <span style={{opacity:0.5,fontSize:10,marginLeft:8}}>[Enter]</span>
                </button>
                <button onClick={()=>doExport("all")}
                  style={{padding:"14px 20px",background:"#10b981",color:"#fff",border:"none",
                    borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>
                  ⬇ Export All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:"#1e293b",borderTop:"2px solid #334155",padding:"8px 20px",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <button onClick={()=>setTab(t=>Math.max(t-1,0))}
          style={{padding:"7px 20px",background:"#334155",color:"#e2e8f0",border:"none",
            borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12}}>
          ← Prev
        </button>
        <span style={{fontSize:11,color:"#475569",fontWeight:500}}>
          {TABS[tab]} &nbsp;|&nbsp; P{pIdx+1}/{parts.length}
        </span>
        <button onClick={()=>setTab(t=>Math.min(t+1,TABS.length-1))}
          style={{padding:"7px 20px",background:"#7c3aed",color:"#fff",border:"none",
            borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12}}>
          Next →
        </button>
      </div>
    </div>
  );
}
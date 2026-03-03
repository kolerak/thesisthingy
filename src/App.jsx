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
// MAI DATA — 52 items, Schraw & Dennison (1994)
// Split matches PDF pages exactly:
//   Page 1: items  1–17  → tab "MAI 1–17"
//   Page 2: items 18–35  → tab "MAI 18–35"
//   Page 3: items 36–52  → tab "MAI 36–52"
// ═══════════════════════════════════════════════════════════════
const MAI_ITEMS = [
  /* 1  */ "I ask myself periodically if I am meeting my goals.",
  /* 2  */ "I consider several alternatives to a problem before I answer.",
  /* 3  */ "I try to use strategies that have worked in the past.",
  /* 4  */ "I pace myself while learning in order to have enough time.",
  /* 5  */ "I understand my intellectual strengths and weaknesses.",
  /* 6  */ "I think about what I really need to learn before I begin a task.",
  /* 7  */ "I know how well I did once I finish a test.",
  /* 8  */ "I set specific goals before I begin a task.",
  /* 9  */ "I slow down when I encounter important information.",
  /* 10 */ "I know what kind of information is most important to learn.",
  /* 11 */ "I ask myself if I have considered all options when solving a problem.",
  /* 12 */ "I am good at organizing information.",
  /* 13 */ "I consciously focus my attention on important information.",
  /* 14 */ "I have a specific purpose for each strategy I use.",
  /* 15 */ "I learn best when I know something about the topic.",
  /* 16 */ "I know what the teacher expects me to learn.",
  /* 17 */ "I am good at remembering information.",
  // ── PDF page 2 ──────────────────────────────────────────────
  /* 18 */ "I use different learning strategies depending on the situation.",
  /* 19 */ "I ask myself if there was an easier way to do things after I finish a task.",
  /* 20 */ "I have control over how well I learn.",
  /* 21 */ "I periodically review to help me understand important relationships.",
  /* 22 */ "I ask myself questions about the material before I begin.",
  /* 23 */ "I think of several ways to solve a problem and choose the best one.",
  /* 24 */ "I summarize what I've learned after I finish.",
  /* 25 */ "I ask others for help when I don't understand something.",
  /* 26 */ "I can motivate myself to learn when I need to.",
  /* 27 */ "I am aware of what strategies I use when I study.",
  /* 28 */ "I find myself analyzing the usefulness of strategies while I study.",
  /* 29 */ "I use my intellectual strengths to compensate for my weaknesses.",
  /* 30 */ "I focus on the meaning and significance of new information.",
  /* 31 */ "I create my own examples to make information more meaningful.",
  /* 32 */ "I am a good judge of how well I understand something.",
  /* 33 */ "I find myself using helpful learning strategies automatically.",
  /* 34 */ "I find myself pausing regularly to check my comprehension.",
  /* 35 */ "I know when each strategy I use will be most effective.",
  // ── PDF page 3 ──────────────────────────────────────────────
  /* 36 */ "I ask myself how well I accomplish my goals once I'm finished.",
  /* 37 */ "I draw pictures or diagrams to help me understand while learning.",
  /* 38 */ "I ask myself if I have considered all options after I solve a problem.",
  /* 39 */ "I try to translate new information into my own words.",
  /* 40 */ "I change strategies when I fail to understand.",
  /* 41 */ "I use the organizational structure of the text to help me learn.",
  /* 42 */ "I read instructions carefully before I begin a task.",
  /* 43 */ "I ask myself if what I'm reading is related to what I already know.",
  /* 44 */ "I reevaluate my assumptions when I get confused.",
  /* 45 */ "I organize my time to best accomplish my goals.",
  /* 46 */ "I learn more when I am interested in the topic.",
  /* 47 */ "I try to break studying down into smaller steps.",
  /* 48 */ "I focus on overall meaning rather than specifics.",
  /* 49 */ "I ask myself questions about how well I am doing while I am learning something new.",
  /* 50 */ "I ask myself if I learned as much as I could have once I finish a task.",
  /* 51 */ "I stop and go back over new information that is not clear.",
  /* 52 */ "I stop and reread when I get confused.",
];

// ── MAI Subscales (Schraw & Dennison 1994) ─────────────────────
const MAI_SS = {
  "Declarative K.": {
    items: [5,10,12,16,17,20,32,46], max: 8, color: "#6366f1", category: "Knowledge",
    description: "Knowing about, what, or that. Knowledge of one's skills, intellectual resources, and abilities as a learner.",
  },
  "Procedural K.": {
    items: [3,14,27,33,35], max: 5, color: "#8b5cf6", category: "Knowledge",
    description: "Knowledge about how to implement learning procedures (e.g. strategies). Requires knowing the process and when to apply it.",
  },
  "Conditional K.": {
    items: [15,18,26,29], max: 4, color: "#a78bfa", category: "Knowledge",
    description: "Knowledge about when and why to use learning procedures. Application of declarative and procedural knowledge under specific conditions.",
  },
  "Planning": {
    items: [4,6,8,22,23,42,45], max: 7, color: "#10b981", category: "Regulation",
    description: "Planning, goal setting, and allocating resources prior to learning.",
  },
  "Info Management": {
    items: [9,13,30,31,37,39,41,43,47,48], max: 10, color: "#0ea5e9", category: "Regulation",
    description: "Skills and strategy sequences used to process information more efficiently (organizing, elaborating, summarizing, selective focusing).",
  },
  "Comprehension Mon.": {
    items: [1,2,11,21,28,34,49], max: 7, color: "#f59e0b", category: "Regulation",
    description: "Assessment of one's learning or strategy use.",
  },
  "Debugging Strats": {
    items: [25,40,44,51,52], max: 5, color: "#ef4444", category: "Regulation",
    description: "Strategies to correct comprehension and performance errors.",
  },
  "Evaluation": {
    items: [7,19,24,36,38,50], max: 6, color: "#ec4899", category: "Regulation",
    description: "Analysis of performance and strategy effectiveness after a learning episode.",
  },
};

// Reverse lookup: item number → { subscale name, color }
const MAI_ITEM_SS = {};
Object.entries(MAI_SS).forEach(([nm, {items, color}]) => {
  items.forEach(n => { MAI_ITEM_SS[n] = { name: nm, color }; });
});

// ── Dilemma Stories — texts match PDF verbatim ─────────────────
const S1 = [
  {id:"s1_q01",stage:"S1",text:"If the school finds out they lied, how much trouble will Arda's family get into?"},
  {id:"s1_q02",stage:"S2",text:"Would Arda enjoy school more if his best friend Cem were there too?"},
  {id:"s1_q03",stage:"S3",text:'By helping with this plan, would Arda prove himself to be a "good" and loyal friend to Cem?'},
  {id:"s1_q04",stage:"S3",text:"What would other parents at North Middle School think if they learned that a student from another district had taken their spot?"},
  {id:"s1_q05",stage:"S4",text:"What exactly does the school registration rule say?"},
  {id:"s1_q06",stage:"S4",text:"If everyone broke a rule they believed was unfair, what would happen to the school system?"},
  {id:"s1_q07",stage:"S5",text:"If some children receive a worse education simply because of where they live, is the school registration rule itself fair?"},
  {id:"s1_q08",stage:"S5",text:"Is it a fundamental duty of society to ensure that every child has equal educational opportunities, regardless of their income?"},
  {id:"s1_q09",stage:"S6",text:"Is a child's right to a good education more important, or is the school's right to enforce its own rules more important?"},
  {id:"s1_q10",stage:"S6",text:'In this case, what does it mean to be "honest"? Is honesty simply writing accurate information on a form, or acting in a way that protects a child\'s well-being?'},
  {id:"s1_m11",stage:"M", text:"How many meters long is the street that separates the North and South school zones?"},
  {id:"s1_m12",stage:"M", text:"What year was North Middle School's library building renovated?"},
];
const S2 = [
  {id:"s2_q01",stage:"S1",text:"If Elif writes this article, could she get in trouble with the principal or be punished for criticizing the system?"},
  {id:"s2_q02",stage:"S2",text:"If Elif writes this essay, is there a chance her teachers may treat her differently and her grades might drop?"},
  {id:"s2_q03",stage:"S2",text:"Would writing this article reduce Elif's chances of being chosen for special opportunities (like competitions or projects) offered only to Section A students?"},
  {id:"s2_q04",stage:"S3",text:'If her friends in Section A accuse her of "betraying successful students," should Elif avoid writing the article to stay accepted in her group?'},
  {id:"s2_q05",stage:"S3",text:"How much should the fact that Mert is her closest friend influence Elif's decision? Would she still care if her friend weren't affected?"},
  {id:"s2_q06",stage:"S3",text:'What would her classmates think of her if she publicly criticized the class system? Would she be seen as "jealous" or "a troublemaker"?'},
  {id:"s2_q07",stage:"S4",text:"Does the school principal have the legal authority to implement this A-B-C placement system, or is it against existing school regulations?"},
  {id:"s2_q08",stage:"S4",text:"If the school keeps this system, could it improve the school's overall exam performance (e.g., average LGS scores)?"},
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
  {id:1,title:"Story 1 — School Enrollment",questions:S1,orderKey:"s1_order",rankPrefix:"s1_rank_"},
  {id:2,title:"Story 2 — Ability Grouping", questions:S2,orderKey:"s2_order",rankPrefix:"s2_rank_"},
  {id:3,title:"Story 3 — Scholarship",      questions:S3,orderKey:"s3_order",rankPrefix:"s3_rank_"},
].map(s => ({...s, rankCount: s.questions.length}));

const ALL_D = [...S1,...S2,...S3];
const mk   = n   => `mai_${String(n).padStart(2,"0")}`;
const rk   = (prefix, pos) => `${prefix}p${String(pos).padStart(2,"0")}`;
const pad2 = n => String(n).padStart(2,"0");

const SC = {S1:"#64748b",S2:"#6366f1",S3:"#10b981",S4:"#f59e0b",S5:"#3b82f6",S6:"#8b5cf6",M:"#ef4444"};

// Tab indices: Demo=0 S1=1 S2=2 S3=3 MAI-p1=4 MAI-p2=5 MAI-p3=6 Guide=7 Self-Score=8 Review=9
const TABS = ["Demographics","Story 1","Story 2","Story 3","MAI 1–17","MAI 18–35","MAI 36–52","MAI Guide","MAI Self-Score","Review"];

// ═══════════════════════════════════════════════════════════════
// ORDER STRING PARSER
// ═══════════════════════════════════════════════════════════════
const parseOrderStr = (str, prefix, maxCount) => {
  const parts = str.split(",").map(s => parseInt(s.trim())).filter(v => !isNaN(v));
  const result = {};
  for (let i = 1; i <= maxCount; i++) {
    result[rk(prefix,i)] = parts[i-1] !== undefined ? parts[i-1] : null;
  }
  return result;
};

const rankToWeight = (rankPos, totalRanked) =>
  rankPos != null ? Math.max(totalRanked + 1 - rankPos, 1) : 0;

// Auto-compute MAI subscale + totals from raw T/F responses
const computeMAIScores = (p) => {
  const scores = {};
  let knowTotal = 0, regTotal = 0;
  Object.entries(MAI_SS).forEach(([nm, {items, max, category}]) => {
    const s       = items.reduce((a, n) => a + (p[mk(n)] === 1 ? 1 : 0), 0);
    const missing = items.filter(n => p[mk(n)] === null).length;
    scores[nm] = { score: s, max, missing, category };
    if (category === "Knowledge") knowTotal += s;
    else regTotal += s;
  });
  scores._know = knowTotal;
  scores._reg  = regTotal;
  scores._tot  = knowTotal + regTotal;
  return scores;
};

// ═══════════════════════════════════════════════════════════════
// VARIABLE DESCRIPTIONS
// ═══════════════════════════════════════════════════════════════
const VDESC = {
  _num:       "Participant number sequential",
  age:        "Age of participant in years",
  gender:     "Gender 1=Male 2=Female 3=Other 4=Not Specified",
  grade:      "Grade or year level",
  email:      "Email address optional",
  order_only: "Data collection mode: 0=Rated 1-7, 1=Order only no ratings given",
  mai_self_decl: "Participant self-reported Declarative K. score (scoring guide p.4, max 8)",
  mai_self_proc: "Participant self-reported Procedural K. score (scoring guide p.4-5, max 5)",
  mai_self_cond: "Participant self-reported Conditional K. score (scoring guide p.4-5, max 4)",
  mai_self_plan: "Participant self-reported Planning score (scoring guide p.5, max 7)",
  mai_self_info: "Participant self-reported Info Management score (scoring guide p.5-6, max 10)",
  mai_self_comp: "Participant self-reported Comprehension Monitoring score (scoring guide p.5-6, max 7)",
  mai_self_debu: "Participant self-reported Debugging Strategies score (scoring guide p.6, max 5)",
  mai_self_eval: "Participant self-reported Evaluation score (scoring guide p.6, max 6)",
  ...Object.fromEntries(MAI_ITEMS.map((t,i) => [mk(i+1),
    `MAI${i+1} [${MAI_ITEM_SS[i+1]?.name||"?"}] 1=True 2=False: ${t.substring(0,70)}`])),
  ...Object.fromEntries(ALL_D.map(q => [q.id,
    `[Stage:${q.stage}] Rated 1-7 -9=missing: ${q.text.substring(0,70)}`])),
  s1_order:"Story 1 raw order string as written by participant",
  s2_order:"Story 2 raw order string as written by participant",
  s3_order:"Story 3 raw order string as written by participant",
  ...Object.fromEntries(Array.from({length:12},(_,i) => [rk("s1_rank_",i+1),
    `Story 1 rank position ${i+1}: item number participant placed here`])),
  ...Object.fromEntries(Array.from({length:13},(_,i) => [rk("s2_rank_",i+1),
    `Story 2 rank position ${i+1}: item number participant placed here`])),
  ...Object.fromEntries(Array.from({length:12},(_,i) => [rk("s3_rank_",i+1),
    `Story 3 rank position ${i+1}: item number participant placed here`])),
};

// ═══════════════════════════════════════════════════════════════
// KEY ORDER
// ═══════════════════════════════════════════════════════════════
const buildKeyOrder = () => {
  const ref = { _num:0, age:"", gender:null, grade:"", email:"", order_only:0,
    s1_order:"", s2_order:"", s3_order:"",
    mai_self_decl:null, mai_self_proc:null, mai_self_cond:null,
    mai_self_plan:null, mai_self_info:null, mai_self_comp:null,
    mai_self_debu:null, mai_self_eval:null,
  };
  MAI_ITEMS.forEach((_,i) => { ref[mk(i+1)] = null; });
  ALL_D.forEach(q => { ref[q.id] = null; });
  STORIES.forEach(s => {
    for (let i = 1; i <= s.rankCount; i++) ref[rk(s.rankPrefix,i)] = null;
  });
  const demo = ["_num","age","gender","grade","email","order_only",
    "mai_self_decl","mai_self_proc","mai_self_cond",
    "mai_self_plan","mai_self_info","mai_self_comp","mai_self_debu","mai_self_eval"];
  const storyKeys = STORIES.flatMap(s => [
    ...s.questions.map(q => q.id), s.orderKey,
    ...Array.from({length:s.rankCount},(_,i) => rk(s.rankPrefix,i+1)),
  ]);
  return [...demo,...storyKeys,...MAI_ITEMS.map((_,i) => mk(i+1))].filter(k => k in ref);
};
const KEY_ORDER = buildKeyOrder();

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT FACTORY
// ═══════════════════════════════════════════════════════════════
const emptyP = (num) => {
  const p = {
    _id: `${Date.now()}${Math.random()}`.replace(".",""),
    _num: num, age:"", gender:null, grade:"", email:"", order_only: 0,
    s1_order:"", s2_order:"", s3_order:"",
    // Participant self-reported subscale totals (from scoring guide pages 4-6)
    mai_self_decl:null, mai_self_proc:null, mai_self_cond:null,
    mai_self_plan:null, mai_self_info:null, mai_self_comp:null,
    mai_self_debu:null, mai_self_eval:null,
  };
  MAI_ITEMS.forEach((_,i) => { p[mk(i+1)] = null; });
  ALL_D.forEach(q => { p[q.id] = null; });
  STORIES.forEach(s => {
    for (let i = 1; i <= s.rankCount; i++) p[rk(s.rankPrefix,i)] = null;
  });
  return p;
};

// ═══════════════════════════════════════════════════════════════
// FILE DOWNLOAD
// ═══════════════════════════════════════════════════════════════
const dlFile = (content, name, mime) => {
  const u = URL.createObjectURL(new Blob([content], {type: mime}));
  Object.assign(document.createElement("a"), {href:u, download:name}).click();
  URL.revokeObjectURL(u);
};

// isNum used by CSV, SQL, SPSS — any field that should be numeric in PSPP
const isNumKey = k => ["_num","age","gender","order_only"].includes(k)
  || k.startsWith("mai_") || /^s[123]_[qm]/.test(k) || /^s[123]_rank_/.test(k);

// esc: null OR empty-string on a numeric field → "-9"  |  text fields keep ""
const escVal = (k, v) => {
  const missing = v === null || v === undefined || (v === "" && isNumKey(k));
  const s = missing ? "-9" : String(v);
  return (s.includes(",") || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : s;
};

const buildCSV = (ps) => {
  if (!ps.length) return "";
  return [KEY_ORDER.join(","), ...ps.map(p => KEY_ORDER.map(k => escVal(k, p[k])).join(","))].join("\n");
};
const buildDataOnlyCSV = (ps) => {
  if (!ps.length) return "";
  return ps.map(p => KEY_ORDER.map(k => escVal(k, p[k])).join(",")).join("\n");
};

const buildPSPPStructure = (ps) => {
  const varBlock = KEY_ORDER.map(k => `    ${k.padEnd(14)} ${isNumKey(k)?"F8.0":"A100"}`).join("\n");
  const lblBlock = KEY_ORDER.filter(k=>VDESC[k]).map(k =>
    `  ${k} '${VDESC[k].replace(/'/g,"''").replace(/[^\x00-\x7F]/g,"").substring(0,119)}'`).join("\n");
  const maiVars  = MAI_ITEMS.map((_,i)=>mk(i+1)).join("\n    ");
  const dilVars  = ALL_D.map(q=>q.id).join("\n    ");
  const rankVars = STORIES.flatMap(s=>Array.from({length:s.rankCount},(_,i)=>rk(s.rankPrefix,i+1))).join("\n    ");
  const subCalc  = Object.entries(MAI_SS).map(([nm,{items,max}])=>{
    const vn="MAI_"+nm.replace(/[^A-Za-z]/g,"").substring(0,8).toUpperCase();
    return `COMPUTE ${vn.padEnd(18)}= ${items.map(n=>`(${mk(n)}=1)`).join(" + ")}.\nVARIABLE LABELS ${vn.padEnd(18)}'${nm} max ${max}'.`;
  }).join("\n");
  const s1M=S1.filter(q=>q.stage!=="M"), s2M=S2.filter(q=>q.stage!=="M"), s3M=S3.filter(q=>q.stage!=="M");
  const rwBlock = (meanItems, rankCount, prefix) => meanItems.map((q,qi)=>{
    const qNum=parseInt(q.id.replace(/[^0-9]/g,"").replace(/^0+/,""))||qi+1;
    const expr=Array.from({length:rankCount},(_,i)=>`(${rk(prefix,i+1)}=${qNum}) * ${rankCount-i}`).join(" + ");
    return `COMPUTE ${(q.id+"_rw").padEnd(18)}= ${expr}.\nVARIABLE LABELS ${(q.id+"_rw").padEnd(18)}'Rank weight ${q.id}'.`;
  }).join("\n");
  const s1pc="s1_q07+s1_q08+s1_q09+s1_q10", s2pc="s2_q10+s2_q11", s3pc="s3_q08+s3_q09+s3_q10+s3_q11";
  const s1a=s1M.map(q=>q.id).join("+"), s2a=s2M.map(q=>q.id).join("+"), s3a=s3M.map(q=>q.id).join("+");
  const s1pr="s1_q07_rw+s1_q08_rw+s1_q09_rw+s1_q10_rw",s2pr="s2_q10_rw+s2_q11_rw",s3pr="s3_q08_rw+s3_q09_rw+s3_q10_rw+s3_q11_rw";
  const s1ar=s1M.map(q=>q.id+"_rw").join("+"),s2ar=s2M.map(q=>q.id+"_rw").join("+"),s3ar=s3M.map(q=>q.id+"_rw").join("+");
  return `* ================================================================
* PSPP/SPSS STRUCTURE FILE | Thesis: Metacognitive Awareness & Moral Judgment
* N=${ps.length} | Generated: ${new Date().toLocaleString()}
* HOW TO USE: save as thesis_pspp_structure.sps alongside thesis_data_rows.csv
* CODING: Missing=-9 | gender 1=M 2=F 3=O 4=NS | MAI 1=True 2=False
*         dilemma 1=Not Important ... 7=Very Important | rank: item# at position
* ================================================================
GET DATA /TYPE=TXT /FILE='thesis_data_rows.csv' /ENCODING='UTF8'
  /DELIMITERS="," /QUALIFIER='"' /ARRANGEMENT=DELIMITED /FIRSTCASE=1
  /VARIABLES=\n${varBlock}.
EXECUTE.
VARIABLE LABELS\n${lblBlock}.
VALUE LABELS order_only 0 'Rated 1-7' 1 'Order only'.
VALUE LABELS gender -9 'Missing' 1 'Male' 2 'Female' 3 'Other' 4 'Not Specified'.
VALUE LABELS\n    ${maiVars}\n    -9 'Missing' 1 'True' 2 'False'.
VALUE LABELS\n    ${dilVars}\n    -9 'Missing' 1 '1 Not Important' 4 '4 Moderate' 7 '7 Very Important'.
VALUE LABELS\n    ${rankVars}\n    -9 'Not ranked'.
MISSING VALUES _num age gender order_only (-9).
MISSING VALUES
    mai_self_decl mai_self_proc mai_self_cond
    mai_self_plan mai_self_info mai_self_comp mai_self_debu mai_self_eval (-9).
MISSING VALUES\n    ${maiVars} (-9).
MISSING VALUES\n    ${dilVars} (-9).
MISSING VALUES\n    ${rankVars} (-9).
EXECUTE.
VARIABLE LABELS
  mai_self_decl 'Participant self-reported Declarative K. score (max 8)'
  mai_self_proc 'Participant self-reported Procedural K. score (max 5)'
  mai_self_cond 'Participant self-reported Conditional K. score (max 4)'
  mai_self_plan 'Participant self-reported Planning score (max 7)'
  mai_self_info 'Participant self-reported Info Management score (max 10)'
  mai_self_comp 'Participant self-reported Comprehension Monitoring score (max 7)'
  mai_self_debu 'Participant self-reported Debugging Strategies score (max 5)'
  mai_self_eval 'Participant self-reported Evaluation score (max 6)'.
EXECUTE.
* === MAI SUBSCALES ===
${subCalc}
COMPUTE MAI_KnowTotal = MAI_DECLARAT + MAI_PROCEDUR + MAI_CONDITIO.
COMPUTE MAI_RegTotal  = MAI_PLANNING + MAI_INFOMANA + MAI_COMPREHE + MAI_DEBUGGIN + MAI_EVALUATI.
COMPUTE MAI_TOTAL     = MAI_KnowTotal + MAI_RegTotal.
VARIABLE LABELS MAI_KnowTotal 'MAI Knowledge max 17' MAI_RegTotal 'MAI Regulation max 35' MAI_TOTAL 'MAI Total max 52'.
EXECUTE.
* === RANK WEIGHTS ===
${rwBlock(s1M,12,"s1_rank_")}
${rwBlock(s2M,13,"s2_rank_")}
${rwBlock(s3M,12,"s3_rank_")}
EXECUTE.
* === N2 MORAL JUDGMENT ===
COMPUTE S1_PostConv=${s1pc}. COMPUTE S1_MeanSum=${s1a}. IF(S1_MeanSum>0) S1_N2_rated=S1_PostConv/S1_MeanSum.
COMPUTE S2_PostConv=${s2pc}. COMPUTE S2_MeanSum=${s2a}. IF(S2_MeanSum>0) S2_N2_rated=S2_PostConv/S2_MeanSum.
COMPUTE S3_PostConv=${s3pc}. COMPUTE S3_MeanSum=${s3a}. IF(S3_MeanSum>0) S3_N2_rated=S3_PostConv/S3_MeanSum.
COMPUTE S1_PC_rw=${s1pr}. COMPUTE S1_All_rw=${s1ar}. IF(S1_All_rw>0) S1_N2_rank=S1_PC_rw/S1_All_rw.
COMPUTE S2_PC_rw=${s2pr}. COMPUTE S2_All_rw=${s2ar}. IF(S2_All_rw>0) S2_N2_rank=S2_PC_rw/S2_All_rw.
COMPUTE S3_PC_rw=${s3pr}. COMPUTE S3_All_rw=${s3ar}. IF(S3_All_rw>0) S3_N2_rank=S3_PC_rw/S3_All_rw.
IF(order_only=0) S1_N2=S1_N2_rated. IF(order_only=1) S1_N2=S1_N2_rank.
IF(order_only=0) S2_N2=S2_N2_rated. IF(order_only=1) S2_N2=S2_N2_rank.
IF(order_only=0) S3_N2=S3_N2_rated. IF(order_only=1) S3_N2=S3_N2_rank.
COMPUTE OVERALL_N2=(S1_N2+S2_N2+S3_N2)/3.
VARIABLE LABELS S1_N2 'Story 1 N2 Unified' S2_N2 'Story 2 N2 Unified' S3_N2 'Story 3 N2 Unified' OVERALL_N2 'Overall N2 0-1'.
EXECUTE.
* === VALIDITY (meaningless items) ===
COMPUTE S1_M_Sum=s1_m11+s1_m12. COMPUTE S2_M_Sum=s2_m12+s2_m13. COMPUTE S3_M_Sum=s3_m12.
VARIABLE LABELS S1_M_Sum 'S1 meaningless sum' S2_M_Sum 'S2 meaningless sum' S3_M_Sum 'S3 meaningless sum'.
EXECUTE.
* === OPTIONAL (uncomment) ===
* RELIABILITY /VARIABLES=${MAI_ITEMS.map((_,i)=>mk(i+1)).join(" ")} /MODEL=ALPHA /SUMMARY=TOTAL.
* DESCRIPTIVES VARIABLES=MAI_TOTAL MAI_KnowTotal MAI_RegTotal OVERALL_N2 /STATISTICS=MEAN STDDEV MIN MAX.
* CORRELATIONS /VARIABLES=MAI_TOTAL OVERALL_N2 S1_N2 S2_N2 S3_N2 /PRINT=TWOTAIL SIG.
`;
};

const buildSPSSFull = (ps) => {
  return `* SPSS Full Syntax (thesis_data.csv with header)\nGET DATA /TYPE=TXT /FILE='thesis_data.csv' /ENCODING='UTF8'\n  /DELIMITERS="," /QUALIFIER='"' /ARRANGEMENT=DELIMITED /FIRSTCASE=2\n  /VARIABLES=\n${KEY_ORDER.map(k=>`    ${k.padEnd(14)} ${isNumKey(k)?"F8.0":"A100"}`).join("\n")}.\nEXECUTE.\n`;
};

const buildSQL = (ps) => {
  if (!ps.length) return "";
  const cols = KEY_ORDER.map(k=>`  ${k.padEnd(14)} ${isNumKey(k)?"INTEGER":"TEXT"}`).join(",\n");
  const rows = ps.map(p=>`INSERT INTO participants (${KEY_ORDER.join(",")}) VALUES (${
    KEY_ORDER.map(k=>{
      const v = p[k];
      const missing = v === null || v === undefined || (v === "" && isNumKey(k));
      if (missing) return isNumKey(k) ? "-9" : "NULL";
      if (isNumKey(k)) return String(isNaN(+v) ? "-9" : +v);
      return `'${String(v).replace(/'/g,"''")}'`;
    }).join(",")
  });`).join("\n");
  return `-- Thesis DB | N=${ps.length} | ${new Date().toLocaleString()}\nDROP TABLE IF EXISTS participants;\nCREATE TABLE participants (\n${cols}\n);\n${rows}\n`;
};

const buildJSON = (ps) => {
  // Export a clean array — only KEY_ORDER fields, -9 for missing numerics, null for missing text
  const clean = ps.map(p => {
    const obj = {};
    KEY_ORDER.forEach(k => {
      const v = p[k];
      const missing = v === null || v === undefined || (v === "" && isNumKey(k));
      if (missing) { obj[k] = isNumKey(k) ? -9 : null; }
      else { obj[k] = isNumKey(k) ? (isNaN(+v) ? -9 : +v) : String(v); }
    });
    return obj;
  });
  return JSON.stringify({ 
    meta: {
      generated: new Date().toISOString(),
      n_participants: ps.length,
      n_variables: KEY_ORDER.length,
      coding: {
        missing_numeric: -9,
        missing_text: null,
        gender: "1=Male 2=Female 3=Other 4=Not Specified",
        mai_items: "1=True 2=False",
        dilemma_ratings: "1=Not Important ... 7=Very Important",
        rank_positions: "item number placed at that rank position",
        mai_self_scores: "participant hand-tallied subscale totals",
        order_only: "0=gave 1-7 ratings 1=gave rank order only",
      },
      variables: KEY_ORDER,
    },
    data: clean,
  }, null, 2);
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [parts, setParts]    = useState(null);
  const [pIdx,  setPIdx]     = useState(0);
  const [tab,   setTab]      = useState(0);
  const [focRow, setFocRow]  = useState(0);
  const [status, setStatus]  = useState("");
  const rowRefs  = useRef({});
  const autoSave = useRef(null);

  useEffect(() => {
    const loaded = loadAll();
    if (loaded.length > 0) { setParts(loaded); setPIdx(loaded.length-1); }
    else { const f = emptyP(1); saveP(f); setParts([f]); }
  }, []);

  useEffect(() => {
    if (!parts) return;
    clearTimeout(autoSave.current);
    autoSave.current = setTimeout(() => saveP(parts[pIdx]), 400);
  }, [parts, pIdx]);

  const cur = parts?.[pIdx];

  const upd = useCallback((k, v) => {
    setParts(prev => prev.map((p, i) => i === pIdx ? {...p, [k]: v} : p));
  }, [pIdx]);

  const updOrder = useCallback((story, rawStr) => {
    const ranked = parseOrderStr(rawStr, story.rankPrefix, story.rankCount);
    setParts(prev => prev.map((p, i) => i !== pIdx ? p : {...p, [story.orderKey]: rawStr, ...ranked}));
  }, [pIdx]);

  const saveNext = () => {
    saveP(parts[pIdx]);
    const next = emptyP(parts.length+1);
    saveP(next);
    setParts(prev => [...prev, next]);
    setPIdx(parts.length); setTab(0); setFocRow(0);
    setStatus(`✓ P${pIdx+1} saved!`);
    setTimeout(() => setStatus(""), 2000);
  };

  const flash = msg => { setStatus(msg); setTimeout(() => setStatus(""), 2500); };

  const doExport = type => {
    const all = loadAll();
    if (!all.length) { flash("No data yet!"); return; }
    if (type==="csv")       dlFile(buildCSV(all),"thesis_data.csv","text/csv");
    else if (type==="datarows") dlFile(buildDataOnlyCSV(all),"thesis_data_rows.csv","text/csv");
    else if (type==="pspp") dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps","text/plain");
    else if (type==="spss") dlFile(buildSPSSFull(all),"thesis_spss_full.sps","text/plain");
    else if (type==="sql")  dlFile(buildSQL(all),"thesis_data.sql","text/plain");
    else if (type==="json") dlFile(buildJSON(all),"thesis_data.json","application/json");
    else if (type==="pspp_both") {
      dlFile(buildDataOnlyCSV(all),"thesis_data_rows.csv","text/csv");
      dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps","text/plain");
    } else if (type==="all") {
      dlFile(buildCSV(all),"thesis_data.csv","text/csv");
      dlFile(buildDataOnlyCSV(all),"thesis_data_rows.csv","text/csv");
      dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps","text/plain");
      dlFile(buildSPSSFull(all),"thesis_spss_full.sps","text/plain");
      dlFile(buildSQL(all),"thesis_data.sql","text/plain");
      dlFile(buildJSON(all),"thesis_data.json","application/json");
    }
    flash(`✓ ${all.length} participants exported`);
  };

  const tabItems = useCallback(() => {
    if (tab===1) return S1.map(q=>q.id);
    if (tab===2) return S2.map(q=>q.id);
    if (tab===3) return S3.map(q=>q.id);
    if (tab===4) return MAI_ITEMS.slice(0,17).map((_,i)=>mk(i+1));
    if (tab===5) return MAI_ITEMS.slice(17,35).map((_,i)=>mk(i+18));
    if (tab===6) return MAI_ITEMS.slice(35).map((_,i)=>mk(i+36));
    return [];
  }, [tab]);

  const isMaiTab = tab===4||tab===5||tab===6;

  useEffect(() => {
    const items = tabItems();
    const h = e => {
      const tag = e.target.tagName;
      if (tag==="INPUT"||tag==="TEXTAREA") return;
      const k = e.key;
      if (k==="Tab") { e.preventDefault(); setTab(t=>e.shiftKey?Math.max(t-1,0):Math.min(t+1,TABS.length-1)); return; }
      if (k==="ArrowDown"||k==="j") { e.preventDefault(); setFocRow(r=>Math.min(r+1,items.length-1)); return; }
      if (k==="ArrowUp"  ||k==="k") { e.preventDefault(); setFocRow(r=>Math.max(r-1,0)); return; }
      if (k==="Backspace"||k==="Delete") { if(items[focRow]) upd(items[focRow],null); return; }
      if (isMaiTab&&items[focRow]) {
        if (k.toLowerCase()==="t") { upd(items[focRow],1); setFocRow(r=>Math.min(r+1,items.length-1)); }
        if (k.toLowerCase()==="r") { upd(items[focRow],2); setFocRow(r=>Math.min(r+1,items.length-1)); }
        return;
      }
      if ([1,2,3].includes(tab)&&items[focRow]&&!cur?.order_only) {
        const n=parseInt(k);
        if (n>=1&&n<=7) { upd(items[focRow],n); setFocRow(r=>Math.min(r+1,items.length-1)); }
        return;
      }
      if (tab===9&&k==="Enter") saveNext();
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  }, [tab,focRow,tabItems,upd,parts,pIdx,cur,isMaiTab]);

  useEffect(()=>{ setFocRow(0); },[tab]);
  useEffect(()=>{ rowRefs.current[focRow]?.scrollIntoView({block:"nearest",behavior:"smooth"}); },[focRow,tab]);

  if (!parts) return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,border:"3px solid #334155",borderTop:"3px solid #a78bfa",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{color:"#a78bfa",fontSize:16,fontWeight:700}}>Loading…</div>
    </div>
  );
  if (!cur) return null;

  const isOrderOnly = !!cur.order_only;
  const maiScores   = computeMAIScores(cur);

  const pct = (() => {
    const keys = Object.keys(cur).filter(k=>!["_id","_num","email","order_only"].includes(k)&&!k.endsWith("_order")&&!/^s[123]_rank_/.test(k));
    const relevant = isOrderOnly ? keys.filter(k=>!(/^s[123]_[qm]/.test(k))) : keys;
    return Math.round(relevant.filter(k=>cur[k]!==null&&cur[k]!=="").length/relevant.length*100);
  })();

  const items  = tabItems();
  const filled = items.filter(k=>cur[k]!==null).length;

  // ── Sub-components ─────────────────────────────────────────────
  const MAIRow = ({idx, gIdx}) => {
    const key=mk(gIdx), val=cur[key], foc=focRow===idx, ss=MAI_ITEM_SS[gIdx];
    return (
      <div ref={el=>rowRefs.current[idx]=el} onClick={()=>setFocRow(idx)}
        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,
          background:val===1?"#052e16":val===2?"#1c0a09":"#1e293b",borderRadius:8,cursor:"pointer",
          border:`2px solid ${foc?"#a78bfa":val===1?"#10b981":val===2?"#ef4444":"#2d3f55"}`,
          boxShadow:foc?"0 0 0 3px rgba(124,58,237,0.2)":"none"}}>
        <div style={{fontSize:10,color:"#475569",minWidth:22,fontWeight:700,textAlign:"right"}}>{gIdx}</div>
        {ss&&<div style={{fontSize:8,fontWeight:800,color:"#0f172a",background:ss.color,borderRadius:4,padding:"2px 5px",flexShrink:0,minWidth:64,textAlign:"center",whiteSpace:"nowrap"}}>{ss.name}</div>}
        <div style={{flex:1,fontSize:12.5,color:"#cbd5e1",lineHeight:1.45}}>{MAI_ITEMS[gIdx-1]}</div>
        <div style={{display:"flex",gap:4}}>
          {[["T",1,"#10b981"],["R",2,"#ef4444"]].map(([l,v,c])=>(
            <button key={l} onMouseDown={e=>{e.preventDefault();upd(key,cur[key]===v?null:v);}}
              style={{width:30,height:28,borderRadius:6,border:"none",cursor:"pointer",fontWeight:800,fontSize:11,
                background:cur[key]===v?c:"#334155",color:cur[key]===v?"#fff":"#64748b"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:11,minWidth:14,textAlign:"center",fontWeight:800,color:val===1?"#10b981":val===2?"#ef4444":"#334155"}}>
          {val===null?"·":val===1?"T":"F"}
        </div>
      </div>
    );
  };

  const DRow = ({q, idx}) => {
    const val=cur[q.id], foc=focRow===idx, c=SC[q.stage];
    return (
      <div ref={el=>rowRefs.current[idx]=el} onClick={()=>setFocRow(idx)}
        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,
          background:foc?"#1a2744":"#1e293b",border:`2px solid ${foc?"#a78bfa":"#2d3f55"}`,borderRadius:8,cursor:"pointer",
          boxShadow:foc?"0 0 0 3px rgba(124,58,237,0.2)":"none",opacity:isOrderOnly?0.7:1}}>
        <div style={{fontSize:10,fontWeight:900,color:"#0f172a",background:c,borderRadius:5,padding:"3px 5px",minWidth:28,textAlign:"center",flexShrink:0}}>{q.stage}</div>
        <div style={{fontSize:10,color:"#475569",minWidth:38,flexShrink:0,fontFamily:"monospace"}}>{q.id.split("_")[1].toUpperCase()}</div>
        <div style={{flex:1,fontSize:12.5,color:"#94a3b8",lineHeight:1.4}}>{q.text}</div>
        {!isOrderOnly?(
          <div style={{display:"flex",gap:2,flexShrink:0}}>
            {[1,2,3,4,5,6,7].map(n=>(
              <button key={n} onMouseDown={e=>{e.preventDefault();upd(q.id,cur[q.id]===n?null:n);}}
                style={{width:26,height:26,borderRadius:5,border:"none",cursor:"pointer",fontWeight:800,fontSize:11,
                  background:cur[q.id]===n?c:"#334155",color:cur[q.id]===n?"#fff":"#64748b"}}>{n}</button>
            ))}
            <div style={{fontSize:12,minWidth:12,fontWeight:800,color:val?c:"#334155",marginLeft:2}}>{val||""}</div>
          </div>
        ):<div style={{fontSize:10,color:"#334155",fontStyle:"italic",flexShrink:0}}>order only</div>}
      </div>
    );
  };

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",background:"#0f172a",color:"#e2e8f0",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* HEADER */}
      <div style={{background:"#1e293b",borderBottom:"2px solid #334155",padding:"7px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{fontWeight:900,fontSize:13,color:"#a78bfa",flexShrink:0}}>📋 THESIS</div>
        <div style={{display:"flex",gap:3,flex:1,flexWrap:"wrap",maxHeight:56,overflowY:"auto"}}>
          {parts.map((_,i)=>(
            <button key={i} onClick={()=>{setPIdx(i);setTab(0);}}
              style={{width:24,height:24,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:8,fontWeight:800,
                background:i===pIdx?"#7c3aed":"#334155",color:i===pIdx?"#fff":"#94a3b8"}}>{i+1}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
          {status&&<span style={{color:"#10b981",fontWeight:600,fontSize:10}}>{status}</span>}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:50,height:5,background:"#334155",borderRadius:3,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:pct===100?"#10b981":"#7c3aed",transition:"width 0.3s"}}/>
            </div>
            <span style={{fontSize:9,color:pct===100?"#10b981":"#64748b",fontWeight:600}}>{pct}%</span>
          </div>
          {[["CSV","csv","#334155"],["Rows","datarows","#0f4c75"],["PSPP+Data","pspp_both","#7c3aed"],["SPSS","spss","#9333ea"],["SQL","sql","#0369a1"],["JSON","json","#065f46"],["All ↓","all","#10b981"]].map(([l,t,bg])=>(
            <button key={t} onClick={()=>doExport(t)}
              style={{padding:"4px 8px",background:bg,color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>⬇{l}</button>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div style={{background:"#0d1b2e",borderBottom:"1px solid #1e293b",padding:"3px 16px",display:"flex",gap:12,fontSize:9,color:"#334155",flexWrap:"wrap",flexShrink:0,alignItems:"center"}}>
        {isMaiTab&&<><span><kbd style={{color:"#10b981"}}>T</kbd> True(1)</span><span><kbd style={{color:"#ef4444"}}>R</kbd> False(2)</span></>}
        {[1,2,3].includes(tab)&&!isOrderOnly&&<span><kbd style={{color:"#a78bfa"}}>1–7</kbd> Rate</span>}
        {[1,2,3].includes(tab)&&isOrderOnly&&<span style={{color:"#f59e0b",fontWeight:700}}>⚡ Order-only — use rank field</span>}
        <span><kbd>↑↓</kbd> Nav</span><span><kbd>Tab</kbd> Next</span><span><kbd>⇧Tab</kbd> Prev</span><span><kbd>Bksp</kbd> Clear</span>
        {tab===9&&<span><kbd style={{color:"#10b981"}}>Enter</kbd> Save&amp;Next</span>}
        <span style={{marginLeft:"auto",color:"#475569"}}>{items.length?`${filled}/${items.length} filled`:""} P{pIdx+1}/{parts.length}</span>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#1e293b",padding:"5px 16px",borderBottom:"1px solid #334155",gap:2,overflowX:"auto",flexShrink:0}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)}
            style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:10,whiteSpace:"nowrap",
              background:tab===i?"#7c3aed":"transparent",color:tab===i?"#fff":"#64748b"}}>{t}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>

          {/* ── DEMOGRAPHICS ── */}
          {tab===0&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:18,fontSize:15,fontWeight:800}}>Participant {pIdx+1} — Demographics</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
                {[["age","Age","number"],["grade","Grade / Year","text"],["email","Email (optional)","email"]].map(([k,l,tp])=>(
                  <div key={k}>
                    <div style={{fontSize:10,color:"#64748b",marginBottom:4,fontWeight:600}}>{l}</div>
                    <input type={tp} value={cur[k]} onChange={e=>upd(k,e.target.value)}
                      style={{width:"100%",padding:"9px 11px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#e2e8f0",fontSize:12,outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#334155"}/>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:"#64748b",marginBottom:7,fontWeight:600}}>Gender</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {[[1,"Male","♂"],[2,"Female","♀"],[3,"Other","⚧"],[4,"Not Specified","—"]].map(([v,l,ic])=>(
                    <button key={v} onClick={()=>upd("gender",cur.gender===v?null:v)}
                      style={{padding:"9px 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,
                        border:`2px solid ${cur.gender===v?"#7c3aed":"#334155"}`,
                        background:cur.gender===v?"#7c3aed":"#1e293b",color:cur.gender===v?"#fff":"#64748b"}}>
                      {ic} {v}={l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14,padding:"12px 14px",background:"#1e293b",borderRadius:10,border:`2px solid ${isOrderOnly?"#f59e0b":"#334155"}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:isOrderOnly?"#f59e0b":"#94a3b8",marginBottom:3}}>
                      {isOrderOnly?"⚡ Order-only mode":"📊 Standard mode (1–7 ratings)"}
                    </div>
                    <div style={{fontSize:10,color:"#475569",lineHeight:1.6}}>
                      {isOrderOnly?"Rank-derived weights used for N2-equivalent analysis in PSPP.":"Standard 1–7 importance ratings. Standard N2 scoring applies."}
                    </div>
                  </div>
                  <button onClick={()=>upd("order_only",isOrderOnly?0:1)}
                    style={{padding:"9px 16px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:800,fontSize:11,flexShrink:0,
                      background:isOrderOnly?"#f59e0b":"#334155",color:isOrderOnly?"#0f172a":"#94a3b8"}}>
                    {isOrderOnly?"Switch to Standard":"Switch to Order-only"}
                  </button>
                </div>
              </div>
              <div style={{padding:12,background:"#1e293b",borderRadius:9,fontSize:10,color:"#64748b",lineHeight:1.9,border:"1px solid #334155"}}>
                <div><span style={{color:"#94a3b8",fontWeight:700}}>Variables per participant:</span> 135 (9 demo + 37 dilemma + 37 rank positions + 52 MAI)</div>
                <div style={{marginTop:6,padding:"6px 10px",background:"#0f172a",borderRadius:6}}>
                  <span style={{color:"#7c3aed",fontWeight:700}}>PSPP workflow:</span> ⬇PSPP+Data → put both files in same folder → run <code style={{color:"#a78bfa"}}>thesis_pspp_structure.sps</code>
                </div>
              </div>
            </div>
          )}

          {/* ── STORIES ── */}
          {[1,2,3].includes(tab)&&(()=>{
            const s=STORIES[tab-1];
            const rankPreview=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]);
            const filledRanks=rankPreview.filter(v=>v!==null).length;
            return (
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <h2 style={{color:"#a78bfa",fontSize:15,fontWeight:800}}>{s.title}</h2>
                  <div style={{padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:700,
                    background:isOrderOnly?"#422006":"#1e293b",border:`1px solid ${isOrderOnly?"#f59e0b":"#334155"}`,color:isOrderOnly?"#f59e0b":"#475569"}}>
                    {isOrderOnly?"⚡ Order-only":"📊 Rating mode"}
                  </div>
                </div>
                {!isOrderOnly&&(
                  <div style={{fontSize:10,color:"#64748b",marginBottom:12,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                    Press 1–7 to rate importance.
                    {Object.entries(SC).map(([sg,c])=>(
                      <span key={sg} style={{background:c,color:"#0f172a",borderRadius:3,padding:"1px 5px",fontSize:9,fontWeight:800}}>{sg}</span>
                    ))}
                  </div>
                )}
                {isOrderOnly&&(
                  <div style={{marginBottom:12,padding:"8px 12px",background:"#1c1100",border:"1px solid #78350f",borderRadius:7,fontSize:11,color:"#fcd34d",lineHeight:1.6}}>
                    Rating buttons hidden. Enter the order string below — rank-derived weights computed automatically.
                  </div>
                )}
                {s.questions.map((q,i)=><DRow key={q.id} q={q} idx={i}/>)}
                <div style={{marginTop:12,padding:"14px",background:"#1e293b",borderRadius:10,border:`2px solid ${isOrderOnly?"#f59e0b":"#334155"}`}}>
                  <div style={{fontSize:11,color:isOrderOnly?"#fbbf24":"#94a3b8",marginBottom:6,fontWeight:700}}>
                    {isOrderOnly?"⚡ Order of Importance":"Order of Importance"}
                    <span style={{color:"#475569",fontWeight:400,marginLeft:6,fontSize:10}}>— type as written, e.g. 9,10,8,7... ({s.rankCount} items)</span>
                  </div>
                  <input value={cur[s.orderKey]} onChange={e=>updOrder(s,e.target.value)}
                    placeholder={`e.g. 9,10,8... (${s.rankCount} positions)`}
                    style={{width:"100%",padding:"9px 11px",background:"#0f172a",border:`1px solid ${isOrderOnly?"#78350f":"#334155"}`,borderRadius:7,color:"#e2e8f0",fontSize:13,outline:"none",marginBottom:filledRanks>0?10:0}}
                    onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor=isOrderOnly?"#78350f":"#334155"}/>
                  {filledRanks>0&&(
                    <div>
                      <div style={{fontSize:9,color:"#475569",marginBottom:5,fontWeight:600}}>Parsed ({filledRanks}/{s.rankCount}):</div>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        {rankPreview.map((v,i)=>{
                          const w=v!=null?rankToWeight(i+1,filledRanks):null;
                          return (
                            <div key={i} style={{padding:"3px 6px",borderRadius:5,fontSize:10,fontWeight:700,textAlign:"center",minWidth:40,
                              background:v!=null?"#1e3a5f":"#0f172a",border:`1px solid ${v!=null?"#3b82f6":"#1e293b"}`,color:v!=null?"#93c5fd":"#334155"}}>
                              <div style={{fontSize:7,color:"#334155"}}>Rank {i+1}</div>
                              <div>Q{v!=null?pad2(v):"·"}</div>
                              {isOrderOnly&&v!=null&&<div style={{fontSize:7,color:"#f59e0b"}}>w={w}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── MAI 1–17 ── */}
          {tab===4&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI — Items 1–17 <span style={{fontSize:10,color:"#64748b",fontWeight:400,marginLeft:8}}>PDF page 1</span></h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:12}}><kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> True → 1 &nbsp;&nbsp;<kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> False → 2 &nbsp;&nbsp;Coloured badge = subscale</div>
              {MAI_ITEMS.slice(0,17).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+1}/>)}
            </div>
          )}

          {/* ── MAI 18–35 ── */}
          {tab===5&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI — Items 18–35 <span style={{fontSize:10,color:"#64748b",fontWeight:400,marginLeft:8}}>PDF page 2</span></h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:12}}><kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> True → 1 &nbsp;&nbsp;<kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> False → 2 &nbsp;&nbsp;Coloured badge = subscale</div>
              {MAI_ITEMS.slice(17,35).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+18}/>)}
            </div>
          )}

          {/* ── MAI 36–52 ── */}
          {tab===6&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI — Items 36–52 <span style={{fontSize:10,color:"#64748b",fontWeight:400,marginLeft:8}}>PDF page 3</span></h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:12}}><kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> True → 1 &nbsp;&nbsp;<kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> False → 2 &nbsp;&nbsp;Coloured badge = subscale</div>
              {MAI_ITEMS.slice(35).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+36}/>)}
            </div>
          )}

          {/* ── MAI SCORING GUIDE ── */}
          {tab===7&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI Scoring Guide</h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:16,lineHeight:1.7}}>
                Schraw &amp; Dennison (1994) — Contemporary Educational Psychology, 19, 460–475<br/>
                Scores are <strong style={{color:"#10b981"}}>auto-computed</strong> live from T/F answers. Items match the PDF scoring guide exactly.
              </div>

              {/* KNOWLEDGE */}
              <div style={{marginBottom:16,padding:14,background:"#1e293b",borderRadius:10,border:"2px solid #6366f133"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#6366f1",marginBottom:4}}>KNOWLEDGE OF COGNITION <span style={{fontSize:10,fontWeight:400,color:"#475569"}}>(max 17)</span></div>
                <div style={{fontSize:10,color:"#475569",marginBottom:12}}>Factual knowledge the learner needs before being able to process or use critical thinking.</div>
                {[
                  {label:"Declarative Knowledge",  color:"#6366f1",desc:"Knowing about, what, or that. Knowledge of one's skills, intellectual resources, and abilities as a learner.",ssItems:[5,10,12,16,17,20,32,46],max:8},
                  {label:"Procedural Knowledge",   color:"#8b5cf6",desc:"Knowledge about how to implement learning procedures (e.g. strategies). Requires knowing the process and when to apply it.",ssItems:[3,14,27,33,35],max:5},
                  {label:"Conditional Knowledge",  color:"#a78bfa",desc:"Knowledge about when and why to use learning procedures. Application of declarative and procedural knowledge under specific conditions.",ssItems:[15,18,26,29],max:4},
                ].map(({label,color,desc,ssItems,max})=>{
                  const auto=ssItems.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  const missing=ssItems.filter(n=>cur[mk(n)]===null).length;
                  return (
                    <div key={label} style={{marginBottom:14,padding:12,background:"#0f172a",borderRadius:9,border:`1px solid ${color}33`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{background:color,color:"#0f172a",borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:800,flexShrink:0,minWidth:140}}>{label}</div>
                        <div style={{flex:1,fontSize:9,color:"#475569",lineHeight:1.5}}>{desc}</div>
                        <div style={{flexShrink:0,textAlign:"center"}}>
                          <div style={{fontSize:18,fontWeight:900,color:missing>0?"#f59e0b":color,lineHeight:1}}>{auto}</div>
                          <div style={{fontSize:8,color:"#475569"}}>/ {max}</div>
                          {missing>0&&<div style={{fontSize:8,color:"#f59e0b"}}>⚠ {missing} blank</div>}
                        </div>
                      </div>
                      <div style={{height:4,background:"#1e293b",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                        <div style={{width:`${(auto/max)*100}%`,height:"100%",background:color,transition:"width 0.3s"}}/>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {ssItems.map(n=>{
                          const v=cur[mk(n)];
                          return (
                            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 8px",borderRadius:6,
                              background:v===1?"#052e16":v===2?"#1c0a09":"#1e293b",border:`1px solid ${v===1?"#10b98144":v===2?"#ef444433":"#2d3f55"}`}}>
                              <span style={{fontSize:10,fontWeight:800,color:color,minWidth:18,flexShrink:0}}>{n}.</span>
                              <span style={{fontSize:11,color:"#94a3b8",flex:1,lineHeight:1.4}}>{MAI_ITEMS[n-1]}</span>
                              <span style={{fontSize:11,fontWeight:800,flexShrink:0,minWidth:16,color:v===1?"#10b981":v===2?"#ef4444":"#334155"}}>{v===null?"·":v===1?"T":"F"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#1a1040",borderRadius:8,border:"1px solid #6366f166"}}>
                  <div style={{flex:1,fontSize:12,fontWeight:700,color:"#a78bfa"}}>Knowledge of Cognition TOTAL</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:24,fontWeight:900,color:"#6366f1",lineHeight:1}}>{maiScores._know}</div>
                    <div style={{fontSize:10,color:"#475569"}}>/ 17 (auto)</div>
                  </div>
                </div>
              </div>

              {/* REGULATION */}
              <div style={{marginBottom:16,padding:14,background:"#1e293b",borderRadius:10,border:"2px solid #10b98133"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#10b981",marginBottom:4}}>REGULATION OF COGNITION <span style={{fontSize:10,fontWeight:400,color:"#475569"}}>(max 35)</span></div>
                <div style={{fontSize:10,color:"#475569",marginBottom:12}}>Skills and strategies used to control and monitor the learning process.</div>
                {[
                  {label:"Planning",                color:"#10b981",desc:"Planning, goal setting, and allocating resources prior to learning.",ssItems:[4,6,8,22,23,42,45],max:7},
                  {label:"Info Management",         color:"#0ea5e9",desc:"Skills and strategy sequences used to process information more efficiently (organizing, elaborating, summarizing, selective focusing).",ssItems:[9,13,30,31,37,39,41,43,47,48],max:10},
                  {label:"Comprehension Monitoring",color:"#f59e0b",desc:"Assessment of one's learning or strategy use.",ssItems:[1,2,11,21,28,34,49],max:7},
                  {label:"Debugging Strategies",    color:"#ef4444",desc:"Strategies to correct comprehension and performance errors.",ssItems:[25,40,44,51,52],max:5},
                  {label:"Evaluation",              color:"#ec4899",desc:"Analysis of performance and strategy effectiveness after a learning episode.",ssItems:[7,19,24,36,38,50],max:6},
                ].map(({label,color,desc,ssItems,max})=>{
                  const auto=ssItems.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  const missing=ssItems.filter(n=>cur[mk(n)]===null).length;
                  return (
                    <div key={label} style={{marginBottom:14,padding:12,background:"#0f172a",borderRadius:9,border:`1px solid ${color}33`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{background:color,color:"#0f172a",borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:800,flexShrink:0,minWidth:140}}>{label}</div>
                        <div style={{flex:1,fontSize:9,color:"#475569",lineHeight:1.5}}>{desc}</div>
                        <div style={{flexShrink:0,textAlign:"center"}}>
                          <div style={{fontSize:18,fontWeight:900,color:missing>0?"#f59e0b":color,lineHeight:1}}>{auto}</div>
                          <div style={{fontSize:8,color:"#475569"}}>/ {max}</div>
                          {missing>0&&<div style={{fontSize:8,color:"#f59e0b"}}>⚠ {missing} blank</div>}
                        </div>
                      </div>
                      <div style={{height:4,background:"#1e293b",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                        <div style={{width:`${(auto/max)*100}%`,height:"100%",background:color,transition:"width 0.3s"}}/>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {ssItems.map(n=>{
                          const v=cur[mk(n)];
                          return (
                            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 8px",borderRadius:6,
                              background:v===1?"#052e16":v===2?"#1c0a09":"#1e293b",border:`1px solid ${v===1?"#10b98144":v===2?"#ef444433":"#2d3f55"}`}}>
                              <span style={{fontSize:10,fontWeight:800,color:color,minWidth:18,flexShrink:0}}>{n}.</span>
                              <span style={{fontSize:11,color:"#94a3b8",flex:1,lineHeight:1.4}}>{MAI_ITEMS[n-1]}</span>
                              <span style={{fontSize:11,fontWeight:800,flexShrink:0,minWidth:16,color:v===1?"#10b981":v===2?"#ef4444":"#334155"}}>{v===null?"·":v===1?"T":"F"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#031a10",borderRadius:8,border:"1px solid #10b98166"}}>
                  <div style={{flex:1,fontSize:12,fontWeight:700,color:"#10b981"}}>Regulation of Cognition TOTAL</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:24,fontWeight:900,color:"#10b981",lineHeight:1}}>{maiScores._reg}</div>
                    <div style={{fontSize:10,color:"#475569"}}>/ 35 (auto)</div>
                  </div>
                </div>
              </div>

              {/* GRAND TOTAL */}
              <div style={{padding:"16px 20px",background:"#1e293b",borderRadius:10,border:"2px solid #a78bfa66",display:"flex",alignItems:"center",gap:20,marginBottom:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#a78bfa"}}>MAI GRAND TOTAL</div>
                  <div style={{fontSize:10,color:"#475569",marginTop:4,lineHeight:1.7}}>Knowledge ({maiScores._know}/17) + Regulation ({maiScores._reg}/35) — auto-computed</div>
                  <div style={{marginTop:8,height:6,background:"#334155",borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${(maiScores._tot/52)*100}%`,height:"100%",background:maiScores._tot>=40?"#10b981":maiScores._tot>=26?"#f59e0b":"#ef4444",transition:"width 0.3s"}}/>
                  </div>
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:42,fontWeight:900,color:"#a78bfa",lineHeight:1}}>{maiScores._tot}</div>
                  <div style={{fontSize:11,color:"#475569",marginTop:2}}>/ 52</div>
                </div>
              </div>
              <div style={{padding:"10px 14px",background:"#0f172a",borderRadius:8,border:"1px solid #1e293b",fontSize:10,color:"#475569",lineHeight:1.8}}>
                <span style={{color:"#a78bfa",fontWeight:700}}>Reference: </span>Schraw, G. &amp; Dennison, R.S. (1994). Assessing metacognitive awareness. <em>Contemporary Educational Psychology</em>, 19, 460–475.
              </div>
            </div>
          )}

          {/* ── MAI SELF-SCORE (tab 8) — participant's own scoring guide totals ── */}
          {tab===8&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI Self-Score Entry</h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:10,lineHeight:1.7}}>
                Enter the totals the participant wrote on their own <strong style={{color:"#e2e8f0"}}>Scoring Guide (PDF pages 4–6)</strong>.<br/>
                Each True = 1 point, each False = 0. These are the participant's hand-tallied subscale scores.<br/>
                <span style={{color:"#f59e0b"}}>⚠ Recorded separately from auto-computed scores so you can spot discrepancies.</span>
              </div>

              {/* Discrepancy banner */}
              {(()=>{
                const pairs=[
                  ["mai_self_decl",[5,10,12,16,17,20,32,46],"Declarative K."],
                  ["mai_self_proc",[3,14,27,33,35],"Procedural K."],
                  ["mai_self_cond",[15,18,26,29],"Conditional K."],
                  ["mai_self_plan",[4,6,8,22,23,42,45],"Planning"],
                  ["mai_self_info",[9,13,30,31,37,39,41,43,47,48],"Info Management"],
                  ["mai_self_comp",[1,2,11,21,28,34,49],"Comprehension Mon."],
                  ["mai_self_debu",[25,40,44,51,52],"Debugging Strats"],
                  ["mai_self_eval",[7,19,24,36,38,50],"Evaluation"],
                ];
                const mm=pairs.filter(([sk,items])=>{
                  const sv=cur[sk]; if(sv===null) return false;
                  const auto=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  return !items.some(n=>cur[mk(n)]===null) && sv!==auto;
                });
                if(!mm.length) return null;
                return (
                  <div style={{marginBottom:14,padding:"10px 14px",background:"#1c0a00",border:"2px solid #f59e0b",borderRadius:9}}>
                    <div style={{fontSize:11,fontWeight:800,color:"#f59e0b",marginBottom:6}}>⚠ Discrepancies — participant's self-score ≠ auto-computed:</div>
                    {mm.map(([sk,items,label])=>{
                      const auto=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                      return(<div key={sk} style={{fontSize:10,color:"#fcd34d",marginBottom:2}}><strong>{label}:</strong> wrote <strong style={{color:"#ef4444"}}>{cur[sk]}</strong>, auto = <strong style={{color:"#10b981"}}>{auto}</strong></div>);
                    })}
                    <div style={{fontSize:9,color:"#92400e",marginTop:6}}>Check whether the participant miscounted, or whether T/F items were entered incorrectly in the MAI tabs.</div>
                  </div>
                );
              })()}

              {/* KNOWLEDGE */}
              <div style={{marginBottom:16,padding:14,background:"#1e293b",borderRadius:10,border:"2px solid #6366f133"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#6366f1",marginBottom:12}}>KNOWLEDGE OF COGNITION <span style={{fontSize:10,fontWeight:400,color:"#475569"}}>(max 17)</span></div>
                {[
                  {sk:"mai_self_decl",label:"Declarative Knowledge",  color:"#6366f1",items:[5,10,12,16,17,20,32,46],max:8},
                  {sk:"mai_self_proc",label:"Procedural Knowledge",   color:"#8b5cf6",items:[3,14,27,33,35],max:5},
                  {sk:"mai_self_cond",label:"Conditional Knowledge",  color:"#a78bfa",items:[15,18,26,29],max:4},
                ].map(({sk,label,color,items,max})=>{
                  const auto=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  const anyBlank=items.some(n=>cur[mk(n)]===null);
                  const sv=cur[sk];
                  const mismatch=sv!==null&&!anyBlank&&sv!==auto;
                  return (
                    <div key={sk} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"12px 14px",background:"#0f172a",borderRadius:9,border:`2px solid ${mismatch?"#f59e0b":sv!==null?color:"#2d3f55"}`}}>
                      <div style={{background:color,color:"#0f172a",borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:800,flexShrink:0,minWidth:150}}>{label}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#475569",marginBottom:4}}>Items: {items.join(", ")}</div>
                        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                          {items.map(n=>{const v=cur[mk(n)];return(<span key={n} style={{fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:4,background:v===1?"#052e16":v===2?"#1c0a09":"#1e293b",border:`1px solid ${v===1?"#10b981":v===2?"#ef4444":"#334155"}`,color:v===1?"#10b981":v===2?"#ef4444":"#475569"}}>{n}{v===1?"T":v===2?"F":"·"}</span>);})}
                        </div>
                      </div>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:8,color:"#475569"}}>auto</div>
                        <div style={{fontSize:18,fontWeight:900,color:anyBlank?"#475569":color,lineHeight:1.1}}>{anyBlank?"?":auto}</div>
                        <div style={{fontSize:8,color:"#475569"}}>/{max}</div>
                      </div>
                      <div style={{fontSize:11,color:"#334155"}}>vs</div>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:8,color:"#475569"}}>self</div>
                        <input type="number" min="0" max={max} value={sv??""} placeholder="—"
                          onChange={e=>{const v=e.target.value===""?null:Math.min(max,Math.max(0,parseInt(e.target.value)||0));upd(sk,v);}}
                          style={{width:48,padding:"4px 6px",background:"#1e293b",textAlign:"center",outline:"none",borderRadius:7,fontWeight:900,fontSize:16,border:`2px solid ${mismatch?"#f59e0b":sv!==null?color:"#334155"}`,color:mismatch?"#f59e0b":sv!==null?color:"#64748b"}}/>
                        <div style={{fontSize:8,color:"#475569"}}>/{max}</div>
                      </div>
                      <div style={{fontSize:16,minWidth:18}}>{mismatch?"⚠️":sv!==null?"✅":""}</div>
                    </div>
                  );
                })}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#1a1040",borderRadius:8,border:"1px solid #6366f166"}}>
                  <div style={{flex:1,fontSize:12,fontWeight:700,color:"#a78bfa"}}>Knowledge TOTAL</div>
                  <span style={{fontSize:10,color:"#475569"}}>auto: <strong style={{color:"#6366f1"}}>{maiScores._know}/17</strong></span>
                  <span style={{fontSize:10,color:"#475569",marginLeft:12}}>self: <strong style={{color:"#a78bfa"}}>
                    {[cur.mai_self_decl,cur.mai_self_proc,cur.mai_self_cond].every(v=>v!==null)?(cur.mai_self_decl+cur.mai_self_proc+cur.mai_self_cond)+"/17":"—"}
                  </strong></span>
                </div>
              </div>

              {/* REGULATION */}
              <div style={{marginBottom:16,padding:14,background:"#1e293b",borderRadius:10,border:"2px solid #10b98133"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#10b981",marginBottom:12}}>REGULATION OF COGNITION <span style={{fontSize:10,fontWeight:400,color:"#475569"}}>(max 35)</span></div>
                {[
                  {sk:"mai_self_plan",label:"Planning",                color:"#10b981",items:[4,6,8,22,23,42,45],max:7},
                  {sk:"mai_self_info",label:"Info Management",         color:"#0ea5e9",items:[9,13,30,31,37,39,41,43,47,48],max:10},
                  {sk:"mai_self_comp",label:"Comprehension Monitoring",color:"#f59e0b",items:[1,2,11,21,28,34,49],max:7},
                  {sk:"mai_self_debu",label:"Debugging Strategies",    color:"#ef4444",items:[25,40,44,51,52],max:5},
                  {sk:"mai_self_eval",label:"Evaluation",              color:"#ec4899",items:[7,19,24,36,38,50],max:6},
                ].map(({sk,label,color,items,max})=>{
                  const auto=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  const anyBlank=items.some(n=>cur[mk(n)]===null);
                  const sv=cur[sk];
                  const mismatch=sv!==null&&!anyBlank&&sv!==auto;
                  return (
                    <div key={sk} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"12px 14px",background:"#0f172a",borderRadius:9,border:`2px solid ${mismatch?"#f59e0b":sv!==null?color:"#2d3f55"}`}}>
                      <div style={{background:color,color:"#0f172a",borderRadius:5,padding:"4px 10px",fontSize:10,fontWeight:800,flexShrink:0,minWidth:150}}>{label}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#475569",marginBottom:4}}>Items: {items.join(", ")}</div>
                        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                          {items.map(n=>{const v=cur[mk(n)];return(<span key={n} style={{fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:4,background:v===1?"#052e16":v===2?"#1c0a09":"#1e293b",border:`1px solid ${v===1?"#10b981":v===2?"#ef4444":"#334155"}`,color:v===1?"#10b981":v===2?"#ef4444":"#475569"}}>{n}{v===1?"T":v===2?"F":"·"}</span>);})}
                        </div>
                      </div>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:8,color:"#475569"}}>auto</div>
                        <div style={{fontSize:18,fontWeight:900,color:anyBlank?"#475569":color,lineHeight:1.1}}>{anyBlank?"?":auto}</div>
                        <div style={{fontSize:8,color:"#475569"}}>/{max}</div>
                      </div>
                      <div style={{fontSize:11,color:"#334155"}}>vs</div>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:8,color:"#475569"}}>self</div>
                        <input type="number" min="0" max={max} value={sv??""} placeholder="—"
                          onChange={e=>{const v=e.target.value===""?null:Math.min(max,Math.max(0,parseInt(e.target.value)||0));upd(sk,v);}}
                          style={{width:48,padding:"4px 6px",background:"#1e293b",textAlign:"center",outline:"none",borderRadius:7,fontWeight:900,fontSize:16,border:`2px solid ${mismatch?"#f59e0b":sv!==null?color:"#334155"}`,color:mismatch?"#f59e0b":sv!==null?color:"#64748b"}}/>
                        <div style={{fontSize:8,color:"#475569"}}>/{max}</div>
                      </div>
                      <div style={{fontSize:16,minWidth:18}}>{mismatch?"⚠️":sv!==null?"✅":""}</div>
                    </div>
                  );
                })}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#031a10",borderRadius:8,border:"1px solid #10b98166"}}>
                  <div style={{flex:1,fontSize:12,fontWeight:700,color:"#10b981"}}>Regulation TOTAL</div>
                  <span style={{fontSize:10,color:"#475569"}}>auto: <strong style={{color:"#10b981"}}>{maiScores._reg}/35</strong></span>
                  <span style={{fontSize:10,color:"#475569",marginLeft:12}}>self: <strong style={{color:"#10b981"}}>
                    {[cur.mai_self_plan,cur.mai_self_info,cur.mai_self_comp,cur.mai_self_debu,cur.mai_self_eval].every(v=>v!==null)?(cur.mai_self_plan+cur.mai_self_info+cur.mai_self_comp+cur.mai_self_debu+cur.mai_self_eval)+"/35":"—"}
                  </strong></span>
                </div>
              </div>

              {/* Grand total comparison */}
              {(()=>{
                const allFilled=[cur.mai_self_decl,cur.mai_self_proc,cur.mai_self_cond,cur.mai_self_plan,cur.mai_self_info,cur.mai_self_comp,cur.mai_self_debu,cur.mai_self_eval].every(v=>v!==null);
                const selfTot=allFilled?cur.mai_self_decl+cur.mai_self_proc+cur.mai_self_cond+cur.mai_self_plan+cur.mai_self_info+cur.mai_self_comp+cur.mai_self_debu+cur.mai_self_eval:null;
                const gm=selfTot!==null&&selfTot!==maiScores._tot;
                return (
                  <div style={{padding:"14px 20px",background:"#1e293b",borderRadius:10,border:`2px solid ${gm?"#f59e0b":"#a78bfa66"}`,display:"flex",alignItems:"center",gap:20,marginBottom:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:800,color:"#a78bfa"}}>MAI GRAND TOTAL</div>
                      <div style={{fontSize:10,color:"#475569",marginTop:3}}>Auto-computed (T/F items) vs participant's hand-tally.</div>
                      {gm&&<div style={{fontSize:10,color:"#f59e0b",marginTop:4,fontWeight:700}}>⚠ Totals don't match — check for miscounting or entry errors.</div>}
                      {selfTot!==null&&!gm&&<div style={{fontSize:10,color:"#10b981",marginTop:4,fontWeight:700}}>✅ Self-score matches auto-computed total.</div>}
                    </div>
                    <div style={{display:"flex",gap:16,flexShrink:0}}>
                      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#475569"}}>Auto</div><div style={{fontSize:32,fontWeight:900,color:"#a78bfa",lineHeight:1}}>{maiScores._tot}</div><div style={{fontSize:9,color:"#475569"}}>/52</div></div>
                      <div style={{fontSize:20,color:"#334155",alignSelf:"center"}}>vs</div>
                      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#475569"}}>Self</div><div style={{fontSize:32,fontWeight:900,color:gm?"#f59e0b":selfTot!==null?"#10b981":"#334155",lineHeight:1}}>{selfTot??"-"}</div><div style={{fontSize:9,color:"#475569"}}>/52</div></div>
                    </div>
                  </div>
                );
              })()}
              <div style={{padding:"8px 12px",background:"#0f172a",borderRadius:8,fontSize:9,color:"#475569",lineHeight:1.8,border:"1px solid #1e293b"}}>
                <strong style={{color:"#94a3b8"}}>PSPP variables exported:</strong>{" "}
                <code style={{color:"#a78bfa"}}>mai_self_decl, mai_self_proc, mai_self_cond, mai_self_plan, mai_self_info, mai_self_comp, mai_self_debu, mai_self_eval</code>
                {" "}(−9 if not entered). Use these alongside auto-computed scores to verify participant accuracy.
              </div>
            </div>
          )}

          {/* ── REVIEW (tab 9) ── */}
          {tab===9&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:16,fontSize:15,fontWeight:800}}>
                Review — Participant {pIdx+1}
                {isOrderOnly&&<span style={{marginLeft:10,fontSize:10,color:"#f59e0b",fontWeight:600}}>⚡ Order-only</span>}
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                {[["P#",cur._num],["Age",cur.age||"—"],["Gender",["—","Male","Female","Other","N/S"][cur.gender||0]],["Grade",cur.grade||"—"]].map(([l,v])=>(
                  <div key={l} style={{background:"#1e293b",borderRadius:8,padding:"10px 12px",border:"1px solid #334155"}}>
                    <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>{l}</div>
                    <div style={{fontSize:13,color:"#e2e8f0",fontWeight:800}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"10px 14px",background:isOrderOnly?"#1c1100":"#1e293b",borderRadius:8,border:`1px solid ${isOrderOnly?"#78350f":"#334155"}`,marginBottom:14,fontSize:11}}>
                <span style={{color:isOrderOnly?"#f59e0b":"#10b981",fontWeight:700}}>{isOrderOnly?"⚡ Order-only":"📊 Standard"}</span>
                <span style={{color:"#475569",marginLeft:8}}>{isOrderOnly?"— N2 via rank weights":"— N2 via 1-7 ratings"}</span>
              </div>

              {/* Rank summary */}
              <div style={{background:"#1e293b",borderRadius:9,padding:12,marginBottom:12,border:"1px solid #334155"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:10}}>Rank Positions</div>
                {STORIES.map(s=>{
                  const ranks=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]);
                  const filledR=ranks.filter(v=>v!==null).length;
                  return (
                    <div key={s.id} style={{marginBottom:10}}>
                      <div style={{fontSize:10,color:"#94a3b8",marginBottom:4,fontWeight:600}}>
                        {s.title}&nbsp;<span style={{color:filledR>0?"#10b981":"#f59e0b"}}>({filledR}/{s.rankCount})</span>
                        {cur[s.orderKey]&&<span style={{color:"#334155",marginLeft:8}}>"{cur[s.orderKey]}"</span>}
                      </div>
                      <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                        {ranks.map((v,i)=>(
                          <div key={i} style={{padding:"2px 5px",borderRadius:4,fontSize:9,fontWeight:700,textAlign:"center",minWidth:34,
                            background:v!=null?"#1e3a5f":"#0f172a",border:`1px solid ${v!=null?"#3b82f6":"#1e293b"}`,color:v!=null?"#93c5fd":"#334155"}}>
                            <div style={{fontSize:7,color:"#334155"}}>#{i+1}</div>Q{v!=null?pad2(v):"·"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MAI summary */}
              <div style={{background:"#1e293b",borderRadius:9,padding:12,marginBottom:12,border:"1px solid #334155"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:10}}>MAI Scores <span style={{fontSize:9,color:"#475569",fontWeight:400}}>auto-computed</span></div>
                {Object.entries(MAI_SS).map(([nm,{items,max,color}])=>{
                  const miss=items.filter(n=>cur[mk(n)]===null).length;
                  const score=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  return (
                    <div key={nm} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <div style={{fontSize:9,fontWeight:800,color:"#0f172a",background:color,borderRadius:4,padding:"1px 5px",minWidth:80,textAlign:"center",flexShrink:0}}>{nm}</div>
                      <div style={{flex:1,height:5,background:"#334155",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${(score/max)*100}%`,height:"100%",background:color}}/>
                      </div>
                      <div style={{fontSize:10,minWidth:55,textAlign:"right",fontWeight:700,color:miss>0?"#f59e0b":"#10b981"}}>{miss>0?`⚠ ${miss} miss`:`${score}/${max}`}</div>
                    </div>
                  );
                })}
                <div style={{marginTop:10,display:"flex",gap:8}}>
                  {[["Knowledge",maiScores._know,17,"#6366f1"],["Regulation",maiScores._reg,35,"#10b981"],["Total",maiScores._tot,52,"#a78bfa"]].map(([l,v,m,c])=>(
                    <div key={l} style={{flex:1,background:"#0f172a",borderRadius:7,padding:"8px 10px",border:`1px solid ${c}44`,textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#475569",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:20,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
                      <div style={{fontSize:9,color:"#334155"}}>/{m}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div style={{background:"#1e293b",borderRadius:9,padding:12,marginBottom:14,border:"1px solid #334155"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:8}}>Missing Values</div>
                {STORIES.map(s=>{
                  const m=s.questions.filter(q=>cur[q.id]===null&&!isOrderOnly);
                  const rankFilled=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]).filter(v=>v!=null).length;
                  return (
                    <div key={s.id} style={{fontSize:11,marginBottom:4,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{color:"#64748b",minWidth:130}}>{s.title}:</span>
                      {isOrderOnly
                        ?<span style={{color:rankFilled>0?"#10b981":"#f59e0b"}}>{rankFilled>0?`✓ ${rankFilled}/${s.rankCount} ranked`:"⚠ No ranks"}</span>
                        :(m.length===0?<span style={{color:"#10b981",fontWeight:700}}>✓ Complete</span>:<span style={{color:"#f59e0b"}}>⚠ {m.map(q=>q.id.split("_")[1].toUpperCase()).join(", ")}</span>)}
                    </div>
                  );
                })}
                {(()=>{const mm=MAI_ITEMS.map((_,i)=>mk(i+1)).filter(k=>cur[k]===null).length;return(
                  <div style={{fontSize:11,display:"flex",gap:8}}>
                    <span style={{color:"#64748b",minWidth:130}}>MAI (52 items):</span>
                    {mm===0?<span style={{color:"#10b981",fontWeight:700}}>✓ Complete</span>:<span style={{color:"#f59e0b"}}>⚠ {mm} missing</span>}
                  </div>
                );})()}
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={saveNext}
                  style={{flex:1,padding:"13px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13}}>
                  ✓ Save &amp; Next (P{pIdx+2}) <span style={{opacity:0.4,fontSize:10}}>[Enter]</span>
                </button>
                <button onClick={()=>doExport("all")}
                  style={{padding:"13px 18px",background:"#10b981",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>
                  ⬇ Export All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:"#1e293b",borderTop:"2px solid #334155",padding:"7px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <button onClick={()=>setTab(t=>Math.max(t-1,0))} style={{padding:"6px 18px",background:"#334155",color:"#e2e8f0",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11}}>← Prev</button>
        <span style={{fontSize:10,color:"#475569"}}>{TABS[tab]} | P{pIdx+1}/{parts.length}</span>
        <button onClick={()=>setTab(t=>Math.min(t+1,TABS.length-1))} style={{padding:"6px 18px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11}}>Next →</button>
      </div>
    </div>
  );
}
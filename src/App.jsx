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
  "I ask myself how well I accomplish my goals once I'm finished.",
  "I draw pictures or diagrams to help me understand while learning.",
  "I ask myself if I have considered all options after I solve a problem.",
  "I try to translate new information into my own words.",
  "I change strategies when I fail to understand.",
  "I use the organizational structure of the text to help me learn.",
  "I read instructions carefully before I begin a task.",
  "I ask myself if what I'm reading is related to what I already know.",
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

// ── MAI Subscales (Schraw & Dennison 1994) ─────────────────────
const MAI_SS = {
  "Declarative K.":     { items:[5,10,12,16,17,20,32,46], max:8,  color:"#6366f1", category:"Knowledge" },
  "Procedural K.":      { items:[3,14,27,33],              max:4,  color:"#8b5cf6", category:"Knowledge" },
  "Conditional K.":     { items:[15,18,26,29,35],          max:5,  color:"#a78bfa", category:"Knowledge" },
  "Planning":           { items:[4,6,8,22,23,42,45],       max:7,  color:"#10b981", category:"Regulation" },
  "Info Management":    { items:[9,13,30,31,37,39,41,43,47,48], max:10, color:"#0ea5e9", category:"Regulation" },
  "Comprehension Mon.": { items:[1,2,11,21,28,34,49],      max:7,  color:"#f59e0b", category:"Regulation" },
  "Debugging Strats":   { items:[25,40,44,51,52],          max:5,  color:"#ef4444", category:"Regulation" },
  "Evaluation":         { items:[7,19,24,36,38,50],        max:6,  color:"#ec4899", category:"Regulation" },
};

// Reverse lookup: item number → { subscale name, color }
const MAI_ITEM_SS = {};
Object.entries(MAI_SS).forEach(([nm,{items,color}])=>{
  items.forEach(n=>{ MAI_ITEM_SS[n] = { name:nm, color }; });
});

// ── Dilemma Stories ────────────────────────────────────────────
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
  {id:"s2_q09",stage:"S4",text:"If students start publicly criticizing school decisions like this, would it undermine the teachers authority and disrupt school order?"},
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
  {id:1,title:"Story 1 — School Enrollment",questions:S1,orderKey:"s1_order",rankPrefix:"s1_rank_",rankCount:12},
  {id:2,title:"Story 2 — Ability Grouping", questions:S2,orderKey:"s2_order",rankPrefix:"s2_rank_",rankCount:13},
  {id:3,title:"Story 3 — Scholarship",      questions:S3,orderKey:"s3_order",rankPrefix:"s3_rank_",rankCount:12},
];
const ALL_D = [...S1,...S2,...S3];
const mk  = n  => `mai_${String(n).padStart(2,"0")}`;
const rk  = (prefix,pos) => `${prefix}p${String(pos).padStart(2,"0")}`;
const pad2 = n => String(n).padStart(2,"0");

const SC = {S1:"#64748b",S2:"#6366f1",S3:"#10b981",S4:"#f59e0b",S5:"#3b82f6",S6:"#8b5cf6",M:"#ef4444"};
// Tab order: Demo → S1 → S2 → S3 → MAI1 → MAI2 → MAI Guide → Review
const TABS = ["Demographics","Story 1","Story 2","Story 3","MAI 1–26","MAI 27–52","MAI Guide","Review"];

// ═══════════════════════════════════════════════════════════════
// ORDER STRING PARSER
// "9,10,8" → { s1_rank_p01:9, s1_rank_p02:10, s1_rank_p03:8, rest:null }
// ═══════════════════════════════════════════════════════════════
const parseOrderStr = (str, prefix, maxCount) => {
  const parts = str.split(",").map(s=>parseInt(s.trim())).filter(v=>!isNaN(v));
  const result = {};
  for(let i=1;i<=maxCount;i++){
    result[rk(prefix,i)] = parts[i-1]!==undefined ? parts[i-1] : null;
  }
  return result;
};

// Rank → derived weight score
// Position 1 = weight N, position N = weight 1, unranked = 0
// Used for order-only participants as substitute for 1-7 ratings
const rankToWeight = (rankPos, totalRanked) =>
  rankPos != null ? Math.max(totalRanked + 1 - rankPos, 1) : 0;

// Build item→rankPosition lookup from a participant for a given story
const buildRankLookup = (p, story) => {
  const lookup = {}; // qNum → rankPosition
  for(let i=1;i<=story.rankCount;i++){
    const v = p[rk(story.rankPrefix,i)];
    if(v!=null) lookup[v] = i;
  }
  return lookup;
};

// ═══════════════════════════════════════════════════════════════
// VARIABLE DESCRIPTIONS
// ═══════════════════════════════════════════════════════════════
const VDESC = {
  _num:      "Participant number sequential",
  age:       "Age of participant in years",
  gender:    "Gender 1=Male 2=Female 3=Other 4=Not Specified",
  grade:     "Grade or year level",
  email:     "Email address optional",
  order_only:"Data collection mode: 0=Rated 1-7, 1=Order only no ratings given",
  ...Object.fromEntries(MAI_ITEMS.map((t,i)=>[mk(i+1),
    `MAI${i+1} [${MAI_ITEM_SS[i+1]?.name||"?"}] 1=True 2=False: ${t.substring(0,70)}`])),
  ...Object.fromEntries(ALL_D.map(q=>[q.id,
    `[Stage:${q.stage}] Rated 1-7 -9=missing: ${q.text.substring(0,70)}`])),
  s1_order:"Story 1 raw order string as written by participant",
  s2_order:"Story 2 raw order string as written by participant",
  s3_order:"Story 3 raw order string as written by participant",
  ...Object.fromEntries(Array.from({length:12},(_,i)=>[rk("s1_rank_",i+1),
    `Story 1 rank position ${i+1}: item number participant placed here`])),
  ...Object.fromEntries(Array.from({length:13},(_,i)=>[rk("s2_rank_",i+1),
    `Story 2 rank position ${i+1}: item number participant placed here`])),
  ...Object.fromEntries(Array.from({length:12},(_,i)=>[rk("s3_rank_",i+1),
    `Story 3 rank position ${i+1}: item number participant placed here`])),
};

// ═══════════════════════════════════════════════════════════════
// KEY ORDER (deterministic column sequence)
// ═══════════════════════════════════════════════════════════════
const buildKeyOrder = () => {
  const ref = {
    _num:0, age:"", gender:null, grade:"", email:"", order_only:0,
    s1_order:"", s2_order:"", s3_order:"",
  };
  MAI_ITEMS.forEach((_,i)=>{ref[mk(i+1)]=null;});
  ALL_D.forEach(q=>{ref[q.id]=null;});
  STORIES.forEach(s=>{
    for(let i=1;i<=s.rankCount;i++) ref[rk(s.rankPrefix,i)]=null;
  });
  const demo = ["_num","age","gender","grade","email","order_only"];
  const storyKeys = STORIES.flatMap(s=>[
    ...s.questions.map(q=>q.id),
    s.orderKey,
    ...Array.from({length:s.rankCount},(_,i)=>rk(s.rankPrefix,i+1)),
  ]);
  const maiKeys = MAI_ITEMS.map((_,i)=>mk(i+1));
  return [...demo,...storyKeys,...maiKeys].filter(k=>k in ref);
};
const KEY_ORDER = buildKeyOrder();

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT FACTORY
// ═══════════════════════════════════════════════════════════════
const emptyP = (num) => {
  const p = {
    _id:`${Date.now()}${Math.random()}`.replace(".",""),
    _num:num, age:"", gender:null, grade:"", email:"",
    order_only:0,
    s1_order:"", s2_order:"", s3_order:"",
    mai_s_decl:null, mai_s_proc:null, mai_s_cond:null,
    mai_s_plan:null, mai_s_info:null, mai_s_comp:null,
    mai_s_debu:null, mai_s_eval:null,
    mai_s_know:null, mai_s_reg:null,  mai_s_tot:null,
  };
  MAI_ITEMS.forEach((_,i)=>{p[mk(i+1)]=null;});
  ALL_D.forEach(q=>{p[q.id]=null;});
  STORIES.forEach(s=>{
    for(let i=1;i<=s.rankCount;i++) p[rk(s.rankPrefix,i)]=null;
  });
  return p;
};

// ═══════════════════════════════════════════════════════════════
// FILE DOWNLOAD
// ═══════════════════════════════════════════════════════════════
const dlFile = (content,name,mime)=>{
  const u=URL.createObjectURL(new Blob([content],{type:mime}));
  Object.assign(document.createElement("a"),{href:u,download:name}).click();
  URL.revokeObjectURL(u);
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 1 — CSV with header (FIRSTCASE=2)
// ═══════════════════════════════════════════════════════════════
const buildCSV = (ps) => {
  if(!ps.length) return "";
  const row = p => KEY_ORDER.map(k=>{
    const v=p[k]??"-9", s=String(v);
    return (s.includes(",")||s.includes('"'))?`"${s.replace(/"/g,'""')}"`:`${s}`;
  }).join(",");
  return [KEY_ORDER.join(","),...ps.map(row)].join("\n");
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 2 — Data-only CSV (no header, FIRSTCASE=1)
// ═══════════════════════════════════════════════════════════════
const buildDataOnlyCSV = (ps) => {
  if(!ps.length) return "";
  return ps.map(p=>KEY_ORDER.map(k=>{
    const v=p[k]??"-9", s=String(v);
    return (s.includes(",")||s.includes('"'))?`"${s.replace(/"/g,'""')}"`:`${s}`;
  }).join(",")).join("\n");
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 3 — PSPP STRUCTURE FILE
// ═══════════════════════════════════════════════════════════════
const buildPSPPStructure = (ps) => {
  const isNum = k=>["_num","age","gender","order_only"].includes(k)
    ||k.startsWith("mai_")||/^s[123]_[qm]/.test(k)||/^s[123]_rank_/.test(k);

  const varBlock = KEY_ORDER.map(k=>
    `    ${k.padEnd(14)} ${isNum(k)?"F8.0":"A100"}`
  ).join("\n");

  const lblBlock = KEY_ORDER.filter(k=>VDESC[k]).map(k=>
    `  ${k} '${VDESC[k].replace(/'/g,"''").replace(/[^\x00-\x7F]/g,"").substring(0,119)}'`
  ).join("\n");

  const maiVars  = MAI_ITEMS.map((_,i)=>mk(i+1)).join("\n    ");
  const dilVars  = ALL_D.map(q=>q.id).join("\n    ");
  const rankVars = STORIES.flatMap(s=>
    Array.from({length:s.rankCount},(_,i)=>rk(s.rankPrefix,i+1))
  ).join("\n    ");

  // MAI subscale scoring using (x=1) boolean — works in both PSPP and SPSS
  const subCalc = Object.entries(MAI_SS).map(([nm,{items,max}])=>{
    const vn="MAI_"+nm.replace(/[^A-Za-z]/g,"").substring(0,8).toUpperCase();
    return `COMPUTE ${vn.padEnd(18)}= ${items.map(n=>`(${mk(n)}=1)`).join(" + ")}.\nVARIABLE LABELS ${vn.padEnd(18)}'${nm} max ${max}'.`;
  }).join("\n");

  // Rank-derived weights for order-only participants
  // For each story, compute rank-weight for every meaningful item
  // Weight = (total_ranked + 1 - rank_position) if ranked, else 0
  const s1MeanItems = S1.filter(q=>q.stage!=="M");
  const s2MeanItems = S2.filter(q=>q.stage!=="M");
  const s3MeanItems = S3.filter(q=>q.stage!=="M");

  const rankWeightBlock = (story, meanItems, rankCount, prefix) => {
    // For each meaningful question, find which rank position it got
    return meanItems.map((q,qi)=>{
      const qNum = parseInt(q.id.replace(/[^0-9]/g,"").replace(/^0+/,"")) ||
                   qi+1; // fallback to sequential
      // Read from rank positions: find which p0X equals this item number
      const findRank = Array.from({length:rankCount},(_,i)=>{
        const pos=i+1;
        return `(${rk(prefix,pos)}=${qNum}) * ${rankCount+1-pos}`;
      }).join(" + ");
      return `COMPUTE ${(q.id+"_rw").padEnd(18)}= ${findRank}.\nVARIABLE LABELS ${(q.id+"_rw").padEnd(18)}'Rank-derived weight for ${q.id} (0=unranked, ${rankCount}=top)'.`;
    }).join("\n");
  };

  const s1pc  = "s1_q07+s1_q08+s1_q09+s1_q10";
  const s2pc  = "s2_q10+s2_q11";
  const s3pc  = "s3_q08+s3_q09+s3_q10+s3_q11";
  const s1all = s1MeanItems.map(q=>q.id).join("+");
  const s2all = s2MeanItems.map(q=>q.id).join("+");
  const s3all = s3MeanItems.map(q=>q.id).join("+");

  // Rank-weight N2 equivalents
  const s1pc_rw  = "s1_q07_rw+s1_q08_rw+s1_q09_rw+s1_q10_rw";
  const s2pc_rw  = "s2_q10_rw+s2_q11_rw";
  const s3pc_rw  = "s3_q08_rw+s3_q09_rw+s3_q10_rw+s3_q11_rw";
  const s1all_rw = s1MeanItems.map(q=>q.id+"_rw").join("+");
  const s2all_rw = s2MeanItems.map(q=>q.id+"_rw").join("+");
  const s3all_rw = s3MeanItems.map(q=>q.id+"_rw").join("+");

  return `* ================================================================
* PSPP / SPSS STRUCTURE + DATA IMPORT FILE
* Thesis: Metacognitive Awareness and Moral Judgment
* N = ${ps.length} participants | Generated: ${new Date().toLocaleString()}
* ----------------------------------------------------------------
* HOW TO USE:
*   1. Save this file as:        thesis_pspp_structure.sps
*   2. Save data export as:      thesis_data_rows.csv  (same folder)
*   3. In PSPP: File > Run Syntax > select thesis_pspp_structure.sps
* ----------------------------------------------------------------
* CODING:
*   Missing         : -9
*   order_only      : 0 = participant gave 1-7 ratings
*                     1 = participant gave rank order only
*   Gender          : 1=Male 2=Female 3=Other 4=Not Specified
*   MAI items       : 1=True  2=False
*   Dilemma ratings : 1=Not Important ... 7=Very Important
*   Rank positions  : item number placed at that rank position
*   Rank weights    : computed importance weight from rank order
* ================================================================

* STEP 1 - IMPORT
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
  order_only
    0 'Rated 1-7 (standard mode)'
    1 'Order only (rank-derived scores used)'.
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
    2 '2'  3 '3'
    4 '4 Moderately Important'
    5 '5'  6 '6'
    7 '7 Very Important'.
VALUE LABELS
    ${rankVars}
    -9 'Not ranked or missing'.

* STEP 4 - MISSING VALUES
MISSING VALUES _num age gender order_only (-9).
MISSING VALUES
    ${maiVars} (-9).
MISSING VALUES
    ${dilVars} (-9).
MISSING VALUES
    ${rankVars} (-9).
EXECUTE.

* ================================================================
* STEP 5 - MAI SUBSCALE SCORES
* Scoring guide: Schraw & Dennison (1994)
* (mai_xx=1) evaluates to 1 when True, 0 when False — no recode needed
* ----------------------------------------------------------------
* KNOWLEDGE OF COGNITION (max 17):
*   Declarative K.     items: 5 10 12 16 17 20 32 46  (max 8)
*   Procedural K.      items: 3 14 27 33              (max 4)
*   Conditional K.     items: 15 18 26 29 35          (max 5)
* REGULATION OF COGNITION (max 35):
*   Planning           items: 4 6 8 22 23 42 45        (max 7)
*   Info Management    items: 9 13 30 31 37 39 41 43 47 48 (max 10)
*   Comprehension Mon. items: 1 2 11 21 28 34 49       (max 7)
*   Debugging Strats   items: 25 40 44 51 52           (max 5)
*   Evaluation         items: 7 19 24 36 38 50         (max 6)
* ================================================================
${subCalc}

COMPUTE MAI_KnowTotal = MAI_DECLARAT + MAI_PROCEDUR + MAI_CONDITIO.
COMPUTE MAI_RegTotal  = MAI_PLANNING + MAI_INFOMANA + MAI_COMPREHE + MAI_DEBUGGIN + MAI_EVALUATI.
COMPUTE MAI_TOTAL     = MAI_KnowTotal + MAI_RegTotal.
VARIABLE LABELS
  MAI_KnowTotal 'MAI Knowledge of Cognition Total max 17'
  MAI_RegTotal  'MAI Regulation of Cognition Total max 35'
  MAI_TOTAL     'MAI Grand Total Score max 52'.
EXECUTE.

* ================================================================
* STEP 6 - RANK-DERIVED WEIGHTS (for order-only participants)
* Formula: weight = (total_positions + 1 - rank_position)
* Ranked 1st out of 12 = weight 12, ranked last = weight 1, unranked = 0
* These allow N2-equivalent analysis when no 1-7 ratings were given
* ================================================================
${rankWeightBlock(STORIES[0], s1MeanItems, 12, "s1_rank_")}
${rankWeightBlock(STORIES[1], s2MeanItems, 13, "s2_rank_")}
${rankWeightBlock(STORIES[2], s3MeanItems, 12, "s3_rank_")}
EXECUTE.

* ================================================================
* STEP 7 - N2-EQUIVALENT MORAL JUDGMENT SCORES
* For rated participants  (order_only=0): uses 1-7 ratings
* For order-only participants (order_only=1): uses rank-derived weights
* UNIFIED_N2 automatically selects the right method per participant
* ================================================================

* --- Rating-based N2 (for participants who rated 1-7) ---
COMPUTE S1_PostConv = ${s1pc}.
COMPUTE S1_MeanSum  = ${s1all}.
IF (S1_MeanSum > 0) S1_N2_rated = S1_PostConv / S1_MeanSum.

COMPUTE S2_PostConv = ${s2pc}.
COMPUTE S2_MeanSum  = ${s2all}.
IF (S2_MeanSum > 0) S2_N2_rated = S2_PostConv / S2_MeanSum.

COMPUTE S3_PostConv = ${s3pc}.
COMPUTE S3_MeanSum  = ${s3all}.
IF (S3_MeanSum > 0) S3_N2_rated = S3_PostConv / S3_MeanSum.

* --- Rank-weight-based N2 (for order-only participants) ---
COMPUTE S1_PC_rw  = ${s1pc_rw}.
COMPUTE S1_All_rw = ${s1all_rw}.
IF (S1_All_rw > 0) S1_N2_rank = S1_PC_rw / S1_All_rw.

COMPUTE S2_PC_rw  = ${s2pc_rw}.
COMPUTE S2_All_rw = ${s2all_rw}.
IF (S2_All_rw > 0) S2_N2_rank = S2_PC_rw / S2_All_rw.

COMPUTE S3_PC_rw  = ${s3pc_rw}.
COMPUTE S3_All_rw = ${s3all_rw}.
IF (S3_All_rw > 0) S3_N2_rank = S3_PC_rw / S3_All_rw.

* --- Unified N2: selects method automatically ---
IF (order_only = 0) S1_N2 = S1_N2_rated.
IF (order_only = 1) S1_N2 = S1_N2_rank.
IF (order_only = 0) S2_N2 = S2_N2_rated.
IF (order_only = 1) S2_N2 = S2_N2_rank.
IF (order_only = 0) S3_N2 = S3_N2_rated.
IF (order_only = 1) S3_N2 = S3_N2_rank.

COMPUTE OVERALL_N2 = (S1_N2 + S2_N2 + S3_N2) / 3.

VARIABLE LABELS
  S1_N2_rated  'Story 1 N2 from 1-7 ratings (rated participants only)'
  S1_N2_rank   'Story 1 N2 from rank-derived weights (order-only participants)'
  S1_N2        'Story 1 N2 Unified (auto-selects method by order_only flag)'
  S2_N2_rated  'Story 2 N2 from 1-7 ratings'
  S2_N2_rank   'Story 2 N2 from rank-derived weights'
  S2_N2        'Story 2 N2 Unified'
  S3_N2_rated  'Story 3 N2 from 1-7 ratings'
  S3_N2_rank   'Story 3 N2 from rank-derived weights'
  S3_N2        'Story 3 N2 Unified'
  OVERALL_N2   'Overall N2 Moral Judgment Score 0.00 to 1.00'.
EXECUTE.

* STEP 8 - MEANINGLESS ITEM VALIDITY CHECK
COMPUTE S1_M_Sum = s1_m11 + s1_m12.
COMPUTE S2_M_Sum = s2_m12 + s2_m13.
COMPUTE S3_M_Sum = s3_m12.
VARIABLE LABELS
  S1_M_Sum 'Story 1 Meaningless item sum high score means suspect data'
  S2_M_Sum 'Story 2 Meaningless item sum'
  S3_M_Sum 'Story 3 Meaningless item sum'.
EXECUTE.

* ================================================================
* RANK ANALYSES (uncomment to run)
* ================================================================
* FREQUENCIES VARIABLES = s1_rank_p01 s2_rank_p01 s3_rank_p01.
* FREQUENCIES VARIABLES = ${Array.from({length:12},(_,i)=>rk("s1_rank_",i+1)).join(" ")}.
* FREQUENCIES VARIABLES = ${Array.from({length:13},(_,i)=>rk("s2_rank_",i+1)).join(" ")}.
* FREQUENCIES VARIABLES = ${Array.from({length:12},(_,i)=>rk("s3_rank_",i+1)).join(" ")}.

* ================================================================
* OPTIONAL ANALYSES (uncomment to run)
* ================================================================
* RELIABILITY /VARIABLES=${MAI_ITEMS.map((_,i)=>mk(i+1)).join(" ")} /MODEL=ALPHA /SUMMARY=TOTAL.
* DESCRIPTIVES VARIABLES=MAI_TOTAL MAI_KnowTotal MAI_RegTotal OVERALL_N2 S1_N2 S2_N2 S3_N2 /STATISTICS=MEAN STDDEV MIN MAX.
* CORRELATIONS /VARIABLES=MAI_TOTAL OVERALL_N2 S1_N2 S2_N2 S3_N2 /PRINT=TWOTAIL SIG.
* ONEWAY MAI_TOTAL OVERALL_N2 BY gender /STATISTICS DESCRIPTIVES.
* COMPARE MEANS: T-TEST GROUPS=order_only(0 1) /VARIABLES=OVERALL_N2.
`;
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 4 — SPSS (header CSV, FIRSTCASE=2)
// ═══════════════════════════════════════════════════════════════
const buildSPSSFull = (ps) => {
  const isNum = k=>["_num","age","gender","order_only"].includes(k)
    ||k.startsWith("mai_")||/^s[123]_[qm]/.test(k)||/^s[123]_rank_/.test(k);
  const varBlock=KEY_ORDER.map(k=>`    ${k.padEnd(14)} ${isNum(k)?"F8.0":"A100"}`).join("\n");
  return `* SPSS Full Syntax (use thesis_data.csv with header)\n* Generated: ${new Date().toLocaleString()}\nGET DATA\n  /TYPE=TXT\n  /FILE='thesis_data.csv'\n  /ENCODING='UTF8'\n  /DELIMITERS=","\n  /QUALIFIER='"'\n  /ARRANGEMENT=DELIMITED\n  /FIRSTCASE=2\n  /VARIABLES=\n${varBlock}.\nEXECUTE.\n`;
};

// ═══════════════════════════════════════════════════════════════
// EXPORT 5 — SQL
// ═══════════════════════════════════════════════════════════════
const buildSQL = (ps) => {
  if(!ps.length) return "";
  const isNum = k=>["_num","age","gender","order_only"].includes(k)
    ||k.startsWith("mai_")||/^s[123]_[qm]/.test(k)||/^s[123]_rank_/.test(k);
  const colDefs=KEY_ORDER.map(k=>
    `  ${k.padEnd(14)} ${isNum(k)?"INTEGER":"TEXT"}  -- ${(VDESC[k]||k).substring(0,80)}`
  ).join(",\n");
  const inserts=ps.map(p=>{
    const vals=KEY_ORDER.map(k=>{
      const v=p[k]; if(v===null||v===undefined||v==="") return "-9";
      if(isNum(k)) return String(isNaN(Number(v))?"-9":Number(v));
      return `'${String(v).replace(/'/g,"''")}'`;
    }).join(", ");
    return `INSERT INTO participants (${KEY_ORDER.join(", ")}) VALUES (${vals});`;
  }).join("\n");
  return `-- Thesis Database | N=${ps.length} | ${new Date().toLocaleString()}\nDROP TABLE IF EXISTS participants;\nCREATE TABLE participants (\n${colDefs}\n);\n${inserts}\n`;
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
    const loaded=loadAll();
    if(loaded.length>0){setParts(loaded);setPIdx(loaded.length-1);}
    else{const f=emptyP(1);saveP(f);setParts([f]);}
  },[]);

  useEffect(()=>{
    if(!parts) return;
    clearTimeout(autoSave.current);
    autoSave.current=setTimeout(()=>saveP(parts[pIdx]),400);
  },[parts,pIdx]);

  const cur=parts?.[pIdx];

  const upd=useCallback((k,v)=>{
    setParts(prev=>prev.map((p,i)=>i===pIdx?{...p,[k]:v}:p));
  },[pIdx]);

  const updOrder=useCallback((story,rawStr)=>{
    const ranked=parseOrderStr(rawStr,story.rankPrefix,story.rankCount);
    setParts(prev=>prev.map((p,i)=>{
      if(i!==pIdx) return p;
      return{...p,[story.orderKey]:rawStr,...ranked};
    }));
  },[pIdx]);

  const saveNext=()=>{
    saveP(parts[pIdx]);
    const ni=parts.length,next=emptyP(ni+1);
    saveP(next);
    setParts(prev=>[...prev,next]);
    setPIdx(ni);setTab(0);setFocRow(0);
    setStatus(`✓ P${pIdx+1} saved!`);
    setTimeout(()=>setStatus(""),2000);
  };

  const flash=msg=>{setStatus(msg);setTimeout(()=>setStatus(""),2500);};

  const doExport=type=>{
    const all=loadAll();
    if(!all.length){flash("No data yet!");return;}
    switch(type){
      case "csv":       dlFile(buildCSV(all),         "thesis_data.csv",            "text/csv"); break;
      case "datarows":  dlFile(buildDataOnlyCSV(all),  "thesis_data_rows.csv",       "text/csv"); break;
      case "pspp":      dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps",  "text/plain"); break;
      case "spss":      dlFile(buildSPSSFull(all),     "thesis_spss_full.sps",       "text/plain"); break;
      case "sql":       dlFile(buildSQL(all),          "thesis_data.sql",            "text/plain"); break;
      case "pspp_both":
        dlFile(buildDataOnlyCSV(all), "thesis_data_rows.csv",     "text/csv");
        dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps","text/plain");
        break;
      case "all":
        dlFile(buildCSV(all),          "thesis_data.csv",           "text/csv");
        dlFile(buildDataOnlyCSV(all),  "thesis_data_rows.csv",      "text/csv");
        dlFile(buildPSPPStructure(all),"thesis_pspp_structure.sps", "text/plain");
        dlFile(buildSPSSFull(all),     "thesis_spss_full.sps",      "text/plain");
        dlFile(buildSQL(all),          "thesis_data.sql",           "text/plain");
        break;
      default:break;
    }
    flash(`✓ ${all.length} participants exported`);
  };

  const tabItems=useCallback(()=>{
    if(tab===1) return S1.map(q=>q.id);
    if(tab===2) return S2.map(q=>q.id);
    if(tab===3) return S3.map(q=>q.id);
    if(tab===4) return MAI_ITEMS.slice(0,26).map((_,i)=>mk(i+1));
    if(tab===5) return MAI_ITEMS.slice(26).map((_,i)=>mk(i+27));
    return [];
  },[tab]);

  useEffect(()=>{
    const items=tabItems();
    const h=e=>{
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
      if([1,2,3].includes(tab)&&items[focRow]&&!cur?.order_only){
        const n=parseInt(k);
        if(n>=1&&n<=7){upd(items[focRow],n);setFocRow(r=>Math.min(r+1,items.length-1));}
        return;
      }
      if(tab===7&&k==="Enter") saveNext();
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[tab,focRow,tabItems,upd,parts,pIdx,cur]);

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
      <div style={{color:"#a78bfa",fontSize:16,fontWeight:700}}>Loading…</div>
    </div>
  );
  if(!cur) return null;

  const isOrderOnly = !!cur.order_only;

  const pct=(()=>{
    const keys=Object.keys(cur).filter(k=>
      !["_id","_num","email","order_only"].includes(k)&&
      !k.endsWith("_order")&&!/^s[123]_rank_/.test(k)
    );
    const relevant = isOrderOnly
      ? keys.filter(k=>!(/^s[123]_[qm]/.test(k)))
      : keys;
    return Math.round(relevant.filter(k=>cur[k]!==null&&cur[k]!=="").length/relevant.length*100);
  })();

  const items=tabItems();
  const filled=items.filter(k=>cur[k]!==null).length;

  // ── Sub-components ─────────────────────────────────────────────
  const MAIRow=({idx,gIdx})=>{
    const key=mk(gIdx),val=cur[key],foc=focRow===idx;
    const ss=MAI_ITEM_SS[gIdx];
    return(
      <div ref={el=>rowRefs.current[idx]=el} onClick={()=>setFocRow(idx)}
        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,
          background:val===1?"#052e16":val===2?"#1c0a09":"#1e293b",
          borderRadius:8,cursor:"pointer",transition:"all 0.1s",
          border:`2px solid ${foc?"#a78bfa":val===1?"#10b981":val===2?"#ef4444":"#2d3f55"}`,
          boxShadow:foc?"0 0 0 3px rgba(124,58,237,0.2)":"none"}}>
        <div style={{fontSize:10,color:"#475569",minWidth:22,fontWeight:700,textAlign:"right"}}>{gIdx}</div>
        {/* Subscale badge */}
        {ss&&<div style={{fontSize:8,fontWeight:800,color:"#0f172a",background:ss.color,
          borderRadius:4,padding:"2px 5px",flexShrink:0,minWidth:64,textAlign:"center",
          whiteSpace:"nowrap"}}>{ss.name}</div>}
        <div style={{flex:1,fontSize:12.5,color:"#cbd5e1",lineHeight:1.45}}>{MAI_ITEMS[gIdx-1]}</div>
        <div style={{display:"flex",gap:4}}>
          {[["T",1,"#10b981"],["R",2,"#ef4444"]].map(([l,v,c])=>(
            <button key={l} onMouseDown={e=>{e.preventDefault();upd(key,cur[key]===v?null:v);}}
              style={{width:30,height:28,borderRadius:6,border:"none",cursor:"pointer",
                fontWeight:800,fontSize:11,transition:"all 0.1s",
                background:cur[key]===v?c:"#334155",color:cur[key]===v?"#fff":"#64748b"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:11,minWidth:14,textAlign:"center",fontWeight:800,
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
        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:3,
          background:foc?"#1a2744":"#1e293b",
          border:`2px solid ${foc?"#a78bfa":"#2d3f55"}`,
          borderRadius:8,cursor:"pointer",transition:"all 0.1s",
          boxShadow:foc?"0 0 0 3px rgba(124,58,237,0.2)":"none",
          opacity:isOrderOnly?0.7:1}}>
        <div style={{fontSize:10,fontWeight:900,color:"#0f172a",background:c,borderRadius:5,
          padding:"3px 5px",minWidth:28,textAlign:"center",flexShrink:0}}>{q.stage}</div>
        <div style={{fontSize:10,color:"#475569",minWidth:38,flexShrink:0,fontFamily:"monospace"}}>
          {q.id.split("_")[1].toUpperCase()}
        </div>
        <div style={{flex:1,fontSize:12.5,color:"#94a3b8",lineHeight:1.4}}>{q.text}</div>
        {!isOrderOnly?(
          <div style={{display:"flex",gap:2,flexShrink:0}}>
            {[1,2,3,4,5,6,7].map(n=>(
              <button key={n} onMouseDown={e=>{e.preventDefault();upd(q.id,cur[q.id]===n?null:n);}}
                style={{width:26,height:26,borderRadius:5,border:"none",cursor:"pointer",
                  fontWeight:800,fontSize:11,transition:"all 0.1s",
                  background:cur[q.id]===n?c:"#334155",color:cur[q.id]===n?"#fff":"#64748b"}}>{n}</button>
            ))}
            <div style={{fontSize:12,minWidth:12,fontWeight:800,color:val?c:"#334155",marginLeft:2}}>{val||""}</div>
          </div>
        ):(
          <div style={{fontSize:10,color:"#334155",fontStyle:"italic",flexShrink:0}}>order only</div>
        )}
      </div>
    );
  };

  // ── RENDER ──────────────────────────────────────────────────────
  return(
    <div style={{height:"100vh",background:"#0f172a",color:"#e2e8f0",display:"flex",
      flexDirection:"column",overflow:"hidden"}}>

      {/* HEADER */}
      <div style={{background:"#1e293b",borderBottom:"2px solid #334155",padding:"7px 16px",
        display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{fontWeight:900,fontSize:13,color:"#a78bfa",flexShrink:0}}>📋 THESIS</div>
        <div style={{display:"flex",gap:3,flex:1,flexWrap:"wrap",maxHeight:56,overflowY:"auto"}}>
          {parts.map((_,i)=>(
            <button key={i} onClick={()=>{setPIdx(i);setTab(0);}}
              style={{width:24,height:24,borderRadius:"50%",border:"none",cursor:"pointer",
                fontSize:8,fontWeight:800,transition:"all 0.1s",
                background:i===pIdx?"#7c3aed":"#334155",
                color:i===pIdx?"#fff":"#94a3b8"}}>
              {i+1}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
          {status&&<span style={{color:"#10b981",fontWeight:600,fontSize:10}}>{status}</span>}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:50,height:5,background:"#334155",borderRadius:3,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",
                background:pct===100?"#10b981":"#7c3aed",transition:"width 0.3s"}}/>
            </div>
            <span style={{fontSize:9,color:pct===100?"#10b981":"#64748b",fontWeight:600}}>{pct}%</span>
          </div>
          {[["CSV","csv","#334155"],["Rows","datarows","#0f4c75"],
            ["PSPP+Data","pspp_both","#7c3aed"],["SPSS","spss","#9333ea"],
            ["SQL","sql","#0369a1"],["All ↓","all","#10b981"]
          ].map(([l,t,bg])=>(
            <button key={t} onClick={()=>doExport(t)}
              style={{padding:"4px 8px",background:bg,color:"#fff",border:"none",
                borderRadius:5,cursor:"pointer",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>
              ⬇{l}
            </button>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div style={{background:"#0d1b2e",borderBottom:"1px solid #1e293b",padding:"3px 16px",
        display:"flex",gap:12,fontSize:9,color:"#334155",flexWrap:"wrap",flexShrink:0,alignItems:"center"}}>
        {(tab===4||tab===5)&&<><span><kbd style={{color:"#10b981"}}>T</kbd> True(1)</span><span><kbd style={{color:"#ef4444"}}>R</kbd> False(2)</span></>}
        {[1,2,3].includes(tab)&&!isOrderOnly&&<span><kbd style={{color:"#a78bfa"}}>1–7</kbd> Rate</span>}
        {[1,2,3].includes(tab)&&isOrderOnly&&<span style={{color:"#f59e0b",fontWeight:700}}>⚡ Order-only mode — use rank field below</span>}
        <span><kbd>↑↓</kbd> Navigate</span><span><kbd>Tab</kbd> Next</span><span><kbd>⇧Tab</kbd> Prev</span><span><kbd>Bksp</kbd> Clear</span>
        {tab===7&&<span><kbd style={{color:"#10b981"}}>Enter</kbd> Save&amp;Next</span>}
        <span style={{marginLeft:"auto",color:"#475569"}}>
          {items.length?`${filled}/${items.length} filled`:""} P{pIdx+1}/{parts.length}
        </span>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#1e293b",padding:"5px 16px",
        borderBottom:"1px solid #334155",gap:2,overflowX:"auto",flexShrink:0}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)}
            style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",
              fontWeight:700,fontSize:10,whiteSpace:"nowrap",transition:"all 0.1s",
              background:tab===i?"#7c3aed":"transparent",
              color:tab===i?"#fff":"#64748b"}}>
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>

          {/* DEMOGRAPHICS */}
          {tab===0&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:18,fontSize:15,fontWeight:800}}>
                Participant {pIdx+1} — Demographics
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
                {[["age","Age","number"],["grade","Grade / Year","text"],["email","Email (optional)","email"]].map(([k,l,tp])=>(
                  <div key={k}>
                    <div style={{fontSize:10,color:"#64748b",marginBottom:4,fontWeight:600}}>{l}</div>
                    <input type={tp} value={cur[k]} onChange={e=>upd(k,e.target.value)}
                      style={{width:"100%",padding:"9px 11px",background:"#1e293b",
                        border:"1px solid #334155",borderRadius:8,color:"#e2e8f0",fontSize:12,outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="#7c3aed"}
                      onBlur={e=>e.target.style.borderColor="#334155"}/>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:"#64748b",marginBottom:7,fontWeight:600}}>Gender</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {[[1,"Male","♂"],[2,"Female","♀"],[3,"Other","⚧"],[4,"Not Specified","—"]].map(([v,l,ic])=>(
                    <button key={v} onClick={()=>upd("gender",cur.gender===v?null:v)}
                      style={{padding:"9px 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,
                        transition:"all 0.15s",border:`2px solid ${cur.gender===v?"#7c3aed":"#334155"}`,
                        background:cur.gender===v?"#7c3aed":"#1e293b",color:cur.gender===v?"#fff":"#64748b"}}>
                      {ic} {v}={l}
                    </button>
                  ))}
                </div>
              </div>

              {/* ORDER-ONLY TOGGLE */}
              <div style={{marginBottom:14,padding:"12px 14px",background:"#1e293b",
                borderRadius:10,border:`2px solid ${isOrderOnly?"#f59e0b":"#334155"}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:isOrderOnly?"#f59e0b":"#94a3b8",marginBottom:3}}>
                      {isOrderOnly?"⚡ Order-only mode":"📊 Standard mode (1–7 ratings)"}
                    </div>
                    <div style={{fontSize:10,color:"#475569",lineHeight:1.6}}>
                      {isOrderOnly
                        ?"This participant only ranked items by order — no 1–7 ratings. Rank-derived weights will be used in PSPP for N2-equivalent analysis."
                        :"This participant gave 1–7 importance ratings. Standard N2 scoring applies."}
                    </div>
                  </div>
                  <button onClick={()=>upd("order_only",isOrderOnly?0:1)}
                    style={{padding:"9px 16px",borderRadius:8,border:"none",cursor:"pointer",
                      fontWeight:800,fontSize:11,flexShrink:0,transition:"all 0.15s",
                      background:isOrderOnly?"#f59e0b":"#334155",
                      color:isOrderOnly?"#0f172a":"#94a3b8"}}>
                    {isOrderOnly?"Switch to Standard":"Switch to Order-only"}
                  </button>
                </div>
              </div>

              <div style={{padding:12,background:"#1e293b",borderRadius:9,fontSize:10,color:"#64748b",
                lineHeight:1.9,border:"1px solid #334155"}}>
                <div><span style={{color:"#94a3b8",fontWeight:700}}>Variables per participant:</span> 135 (9 demo + 37 dilemma + 37 rank positions + 52 MAI)</div>
                <div style={{marginTop:6,padding:"6px 10px",background:"#0f172a",borderRadius:6}}>
                  <span style={{color:"#7c3aed",fontWeight:700}}>PSPP workflow:</span> Click <strong style={{color:"#fff"}}>⬇PSPP+Data</strong> → put both files in same folder → run <code style={{color:"#a78bfa"}}>thesis_pspp_structure.sps</code>
                </div>
              </div>
            </div>
          )}

          {/* STORIES */}
          {[1,2,3].includes(tab)&&(()=>{
            const s=STORIES[tab-1];
            const rankPreview=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]);
            const filledRanks=rankPreview.filter(v=>v!==null).length;
            // Rank lookup for preview weights
            const rankLookup=buildRankLookup(cur,s);
            return(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <h2 style={{color:"#a78bfa",fontSize:15,fontWeight:800}}>{s.title}</h2>
                  {/* Mini mode badge */}
                  <div style={{padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:700,
                    background:isOrderOnly?"#422006":"#1e293b",
                    border:`1px solid ${isOrderOnly?"#f59e0b":"#334155"}`,
                    color:isOrderOnly?"#f59e0b":"#475569"}}>
                    {isOrderOnly?"⚡ Order-only":"📊 Rating mode"}
                  </div>
                </div>

                {!isOrderOnly&&(
                  <div style={{fontSize:10,color:"#64748b",marginBottom:12,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                    Press 1–7 to rate.
                    {Object.entries(SC).map(([sg,c])=>(
                      <span key={sg} style={{background:c,color:"#0f172a",borderRadius:3,padding:"1px 5px",fontSize:9,fontWeight:800}}>{sg}</span>
                    ))}
                  </div>
                )}
                {isOrderOnly&&(
                  <div style={{marginBottom:12,padding:"8px 12px",background:"#1c1100",border:"1px solid #78350f",
                    borderRadius:7,fontSize:11,color:"#fcd34d",lineHeight:1.6}}>
                    Rating buttons hidden for this participant. Enter the order string below —
                    rank-derived weights will be calculated automatically for PSPP analysis.
                  </div>
                )}

                {s.questions.map((q,i)=><DRow key={q.id} q={q} idx={i}/>)}

                {/* Rank order input */}
                <div style={{marginTop:12,padding:"14px",background:"#1e293b",
                  borderRadius:10,border:`2px solid ${isOrderOnly?"#f59e0b":"#334155"}`}}>
                  <div style={{fontSize:11,color:isOrderOnly?"#fbbf24":"#94a3b8",marginBottom:6,fontWeight:700}}>
                    {isOrderOnly?"⚡ Order of Importance":"Order of Importance"}
                    <span style={{color:"#475569",fontWeight:"400",marginLeft:6,fontSize:10}}>
                      — type exactly as written, e.g. 9,10,8,7... ({s.rankCount} items)
                    </span>
                  </div>
                  <input
                    value={cur[s.orderKey]}
                    onChange={e=>updOrder(s,e.target.value)}
                    placeholder={`e.g. 9,10,8,7,6... (${s.rankCount} positions)`}
                    style={{width:"100%",padding:"9px 11px",background:"#0f172a",
                      border:`1px solid ${isOrderOnly?"#78350f":"#334155"}`,borderRadius:7,
                      color:"#e2e8f0",fontSize:13,outline:"none",marginBottom:filledRanks>0?10:0}}
                    onFocus={e=>e.target.style.borderColor="#f59e0b"}
                    onBlur={e=>e.target.style.borderColor=isOrderOnly?"#78350f":"#334155"}/>

                  {filledRanks>0&&(
                    <div>
                      <div style={{fontSize:9,color:"#475569",marginBottom:5,fontWeight:600}}>
                        Parsed rank positions ({filledRanks}/{s.rankCount}):
                      </div>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        {rankPreview.map((v,i)=>{
                          const w=v!=null?rankToWeight(i+1,filledRanks):null;
                          return(
                            <div key={i} style={{padding:"3px 6px",borderRadius:5,fontSize:10,fontWeight:700,
                              background:v!=null?"#1e3a5f":"#0f172a",
                              border:`1px solid ${v!=null?"#3b82f6":"#1e293b"}`,
                              color:v!=null?"#93c5fd":"#334155",textAlign:"center",minWidth:40}}>
                              <div style={{fontSize:7,color:"#334155"}}>Rank {i+1}</div>
                              <div>Q{v!=null?pad2(v):"·"}</div>
                              {isOrderOnly&&v!=null&&<div style={{fontSize:7,color:"#f59e0b"}}>w={w}</div>}
                            </div>
                          );
                        })}
                      </div>
                      {isOrderOnly&&(
                        <div style={{fontSize:9,color:"#475569",marginTop:7,padding:"6px 8px",
                          background:"#0f172a",borderRadius:5}}>
                          💡 Rank-derived weights shown (w=) — highest rank = weight {filledRanks}, lowest = 1.
                          PSPP syntax computes these as <code style={{color:"#a78bfa"}}>s{tab}_q##_rw</code> variables.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* MAI 1–26 */}
          {tab===4&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>
                MAI — Items 1–26
                <span style={{fontSize:10,color:"#64748b",fontWeight:400,marginLeft:8}}>Schraw &amp; Dennison (1994)</span>
              </h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:12}}>
                <kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> True → 1 &nbsp;&nbsp;
                <kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> False → 2 &nbsp;&nbsp;
                Coloured badges = subscale assignment
              </div>
              {MAI_ITEMS.slice(0,26).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+1}/>)}
            </div>
          )}

          {/* MAI 27–52 */}
          {tab===5&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI — Items 27–52</h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:12}}>
                <kbd style={{color:"#10b981",fontWeight:800}}>T</kbd> True → 1 &nbsp;&nbsp;
                <kbd style={{color:"#ef4444",fontWeight:800}}>R</kbd> False → 2 &nbsp;&nbsp;
                Coloured badges = subscale assignment
              </div>
              {MAI_ITEMS.slice(26).map((_,i)=><MAIRow key={i} idx={i} gIdx={i+27}/>)}
            </div>
          )}

          {/* MAI SCORING GUIDE */}
          {tab===6&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:4,fontSize:15,fontWeight:800}}>MAI Scoring Guide</h2>
              <div style={{fontSize:10,color:"#64748b",marginBottom:16,lineHeight:1.7}}>
                Schraw &amp; Dennison (1994) — Contemporary Educational Psychology, 19, 460–475<br/>
                Count one point per <strong style={{color:"#10b981"}}>True</strong> answer for each item listed. Enter the totals below.
              </div>

              {/* KNOWLEDGE OF COGNITION */}
              <div style={{marginBottom:16,padding:14,background:"#1e293b",borderRadius:10,
                border:"2px solid #6366f133"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#6366f1",marginBottom:12}}>
                  KNOWLEDGE OF COGNITION
                  <span style={{fontSize:10,fontWeight:400,color:"#475569",marginLeft:8}}>(max 17)</span>
                </div>
                {[
                  ["mai_s_decl","Declarative Knowledge","5, 10, 12, 16, 17, 20, 32, 46",8,"#6366f1"],
                  ["mai_s_proc","Procedural Knowledge", "3, 14, 27, 33",            4,"#8b5cf6"],
                  ["mai_s_cond","Conditional Knowledge","15, 18, 26, 29, 35",       5,"#a78bfa"],
                ].map(([k,label,items,max,color])=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,
                    padding:"10px 12px",background:"#0f172a",borderRadius:8,border:`1px solid ${color}44`}}>
                    <div style={{background:color,color:"#0f172a",borderRadius:5,
                      padding:"3px 8px",fontSize:10,fontWeight:800,flexShrink:0,minWidth:130}}>{label}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:"#475569",marginBottom:2}}>Items: {items}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <input
                        type="number" min="0" max={max}
                        value={cur[k]??""} 
                        onChange={e=>{
                          const v=e.target.value===""?null:Math.min(max,Math.max(0,parseInt(e.target.value)||0));
                          upd(k,v);
                        }}
                        placeholder="—"
                        style={{width:52,padding:"6px 8px",background:"#1e293b",
                          border:`2px solid ${cur[k]!=null?color:"#334155"}`,borderRadius:7,
                          color:"#e2e8f0",fontSize:14,fontWeight:800,textAlign:"center",outline:"none"}}
                        onFocus={e=>e.target.style.borderColor=color}
                        onBlur={e=>e.target.style.borderColor=cur[k]!=null?color:"#334155"}
                      />
                      <span style={{fontSize:10,color:"#475569"}}>/ {max}</span>
                    </div>
                  </div>
                ))}
                {/* Knowledge total */}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                  background:"#1a1040",borderRadius:8,border:"1px solid #6366f166"}}>
                  <div style={{flex:1,fontSize:12,fontWeight:700,color:"#a78bfa"}}>
                    Knowledge of Cognition TOTAL
                  </div>
                  <input
                    type="number" min="0" max={17}
                    value={cur.mai_s_know??""}
                    onChange={e=>{
                      const v=e.target.value===""?null:Math.min(17,Math.max(0,parseInt(e.target.value)||0));
                      upd("mai_s_know",v);
                    }}
                    placeholder="—"
                    style={{width:52,padding:"6px 8px",background:"#1e293b",
                      border:`2px solid ${cur.mai_s_know!=null?"#6366f1":"#334155"}`,borderRadius:7,
                      color:"#a78bfa",fontSize:14,fontWeight:800,textAlign:"center",outline:"none"}}
                  />
                  <span style={{fontSize:10,color:"#475569"}}>/ 17</span>
                </div>
              </div>

              {/* REGULATION OF COGNITION */}
              <div style={{marginBottom:16,padding:14,background:"#1e293b",borderRadius:10,
                border:"2px solid #10b98133"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#10b981",marginBottom:12}}>
                  REGULATION OF COGNITION
                  <span style={{fontSize:10,fontWeight:400,color:"#475569",marginLeft:8}}>(max 35)</span>
                </div>
                {[
                  ["mai_s_plan","Planning",               "4, 6, 8, 22, 23, 42, 45",            7, "#10b981"],
                  ["mai_s_info","Info Management",        "9, 13, 30, 31, 37, 39, 41, 43, 47, 48",10,"#0ea5e9"],
                  ["mai_s_comp","Comprehension Monitoring","1, 2, 11, 21, 28, 34, 49",           7, "#f59e0b"],
                  ["mai_s_debu","Debugging Strategies",  "25, 40, 44, 51, 52",                  5, "#ef4444"],
                  ["mai_s_eval","Evaluation",             "7, 19, 24, 36, 38, 50",               6, "#ec4899"],
                ].map(([k,label,items,max,color])=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,
                    padding:"10px 12px",background:"#0f172a",borderRadius:8,border:`1px solid ${color}44`}}>
                    <div style={{background:color,color:"#0f172a",borderRadius:5,
                      padding:"3px 8px",fontSize:10,fontWeight:800,flexShrink:0,minWidth:130}}>{label}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:"#475569",marginBottom:2}}>Items: {items}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <input
                        type="number" min="0" max={max}
                        value={cur[k]??""} 
                        onChange={e=>{
                          const v=e.target.value===""?null:Math.min(max,Math.max(0,parseInt(e.target.value)||0));
                          upd(k,v);
                        }}
                        placeholder="—"
                        style={{width:52,padding:"6px 8px",background:"#1e293b",
                          border:`2px solid ${cur[k]!=null?color:"#334155"}`,borderRadius:7,
                          color:"#e2e8f0",fontSize:14,fontWeight:800,textAlign:"center",outline:"none"}}
                        onFocus={e=>e.target.style.borderColor=color}
                        onBlur={e=>e.target.style.borderColor=cur[k]!=null?color:"#334155"}
                      />
                      <span style={{fontSize:10,color:"#475569"}}>/ {max}</span>
                    </div>
                  </div>
                ))}
                {/* Regulation total */}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                  background:"#031a10",borderRadius:8,border:"1px solid #10b98166"}}>
                  <div style={{flex:1,fontSize:12,fontWeight:700,color:"#10b981"}}>
                    Regulation of Cognition TOTAL
                  </div>
                  <input
                    type="number" min="0" max={35}
                    value={cur.mai_s_reg??""}
                    onChange={e=>{
                      const v=e.target.value===""?null:Math.min(35,Math.max(0,parseInt(e.target.value)||0));
                      upd("mai_s_reg",v);
                    }}
                    placeholder="—"
                    style={{width:52,padding:"6px 8px",background:"#1e293b",
                      border:`2px solid ${cur.mai_s_reg!=null?"#10b981":"#334155"}`,borderRadius:7,
                      color:"#10b981",fontSize:14,fontWeight:800,textAlign:"center",outline:"none"}}
                  />
                  <span style={{fontSize:10,color:"#475569"}}>/ 35</span>
                </div>
              </div>

              {/* GRAND TOTAL */}
              <div style={{padding:"14px 18px",background:"#1e293b",borderRadius:10,
                border:"2px solid #a78bfa66",display:"flex",alignItems:"center",gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#a78bfa"}}>MAI GRAND TOTAL</div>
                  <div style={{fontSize:10,color:"#475569",marginTop:2}}>
                    Knowledge ({cur.mai_s_know??'?'}) + Regulation ({cur.mai_s_reg??'?'}) = Grand Total (max 52)
                  </div>
                </div>
                <input
                  type="number" min="0" max={52}
                  value={cur.mai_s_tot??""}
                  onChange={e=>{
                    const v=e.target.value===""?null:Math.min(52,Math.max(0,parseInt(e.target.value)||0));
                    upd("mai_s_tot",v);
                  }}
                  placeholder="—"
                  style={{width:64,padding:"8px 10px",background:"#0f172a",
                    border:`2px solid ${cur.mai_s_tot!=null?"#a78bfa":"#334155"}`,borderRadius:8,
                    color:"#a78bfa",fontSize:18,fontWeight:900,textAlign:"center",outline:"none"}}
                />
                <span style={{fontSize:11,color:"#475569"}}>/ 52</span>
              </div>
            </div>
          )}


          {/* REVIEW */}
          {tab===7&&(
            <div>
              <h2 style={{color:"#a78bfa",marginBottom:16,fontSize:15,fontWeight:800}}>
                Review — Participant {pIdx+1}
                {isOrderOnly&&<span style={{marginLeft:10,fontSize:10,color:"#f59e0b",fontWeight:600}}>⚡ Order-only</span>}
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                {[["P#",cur._num],["Age",cur.age||"—"],
                  ["Gender",["—","Male","Female","Other","N/S"][cur.gender||0]],
                  ["Grade",cur.grade||"—"]].map(([l,v])=>(
                  <div key={l} style={{background:"#1e293b",borderRadius:8,padding:"10px 12px",border:"1px solid #334155"}}>
                    <div style={{fontSize:9,color:"#64748b",marginBottom:3,fontWeight:600}}>{l}</div>
                    <div style={{fontSize:13,color:"#e2e8f0",fontWeight:800}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Mode info */}
              <div style={{padding:"10px 14px",background:isOrderOnly?"#1c1100":"#1e293b",
                borderRadius:8,border:`1px solid ${isOrderOnly?"#78350f":"#334155"}`,marginBottom:14,fontSize:11}}>
                <span style={{color:isOrderOnly?"#f59e0b":"#10b981",fontWeight:700}}>
                  {isOrderOnly?"⚡ Order-only participant":"📊 Standard participant"}
                </span>
                <span style={{ color:"#475569", marginLeft:8 }}>
                  {isOrderOnly
                    ? "— Rank-derived weights computed in PSPP. N2 uses rank weights instead of 1-7 ratings."
                    : "— Standard 1-7 ratings recorded. N2 computed from ratings."}
                </span>
              </div>

              {/* Rank summary */}
              <div style={{background:"#1e293b",borderRadius:9,padding:12,marginBottom:12,border:"1px solid #334155"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:10}}>Rank Positions</div>
                {STORIES.map(s=>{
                  const ranks=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]);
                  const filled=ranks.filter(v=>v!==null).length;
                  return(
                    <div key={s.id} style={{marginBottom:10}}>
                      <div style={{fontSize:10,color:"#94a3b8",marginBottom:4,fontWeight:600}}>
                        {s.title}&nbsp;
                        <span style={{color:filled>0?"#10b981":"#f59e0b"}}>({filled}/{s.rankCount} ranked)</span>
                        {cur[s.orderKey]&&<span style={{color:"#334155",marginLeft:8}}>"{cur[s.orderKey]}"</span>}
                      </div>
                      <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                        {ranks.map((v,i)=>(
                          <div key={i} style={{padding:"2px 5px",borderRadius:4,fontSize:9,fontWeight:700,
                            background:v!=null?"#1e3a5f":"#0f172a",
                            border:`1px solid ${v!=null?"#3b82f6":"#1e293b"}`,
                            color:v!=null?"#93c5fd":"#334155",textAlign:"center",minWidth:34}}>
                            <div style={{fontSize:7,color:"#334155"}}>#{i+1}</div>
                            Q{v!=null?pad2(v):"·"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MAI subscales */}
              <div style={{background:"#1e293b",borderRadius:9,padding:12,marginBottom:12,border:"1px solid #334155"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:10}}>MAI Scores</div>
                {Object.entries(MAI_SS).map(([nm,{items,max,color}])=>{
                  const miss=items.filter(n=>cur[mk(n)]===null).length;
                  const score=items.reduce((a,n)=>a+(cur[mk(n)]===1?1:0),0);
                  return(
                    <div key={nm} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <div style={{fontSize:9,fontWeight:800,color:"#0f172a",background:color,
                        borderRadius:4,padding:"1px 5px",minWidth:80,textAlign:"center",flexShrink:0}}>{nm}</div>
                      <div style={{flex:1,height:5,background:"#334155",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${(score/max)*100}%`,height:"100%",background:color}}/>
                      </div>
                      <div style={{fontSize:10,minWidth:55,textAlign:"right",fontWeight:700,
                        color:miss>0?"#f59e0b":"#10b981"}}>
                        {miss>0?`⚠ ${miss} miss`:`${score}/${max}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Missing */}
              <div style={{background:"#1e293b",borderRadius:9,padding:12,marginBottom:14,border:"1px solid #334155"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:8}}>Missing Values</div>
                {STORIES.map(s=>{
                  const m=s.questions.filter(q=>cur[q.id]===null&&!isOrderOnly);
                  const rankFilled=Array.from({length:s.rankCount},(_,i)=>cur[rk(s.rankPrefix,i+1)]).filter(v=>v!=null).length;
                  return(
                    <div key={s.id} style={{fontSize:11,marginBottom:4,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{color:"#64748b",minWidth:130}}>{s.title}:</span>
                      {isOrderOnly
                        ?<span style={{color:rankFilled>0?"#10b981":"#f59e0b"}}>
                            {rankFilled>0?`✓ ${rankFilled}/${s.rankCount} ranked`:"⚠ No ranks entered"}
                          </span>
                        :(m.length===0?<span style={{color:"#10b981",fontWeight:700}}>✓ Complete</span>
                          :<span style={{color:"#f59e0b"}}>⚠ {m.map(q=>q.id.split("_")[1].toUpperCase()).join(", ")}</span>)}
                    </div>
                  );
                })}
                {(()=>{
                  const mm=MAI_ITEMS.map((_,i)=>mk(i+1)).filter(k=>cur[k]===null).length;
                  return(
                    <div style={{fontSize:11,display:"flex",gap:8}}>
                      <span style={{color:"#64748b",minWidth:130}}>MAI (52 items):</span>
                      {mm===0?<span style={{color:"#10b981",fontWeight:700}}>✓ Complete</span>
                        :<span style={{color:"#f59e0b"}}>⚠ {mm} missing</span>}
                    </div>
                  );
                })()}
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={saveNext}
                  style={{flex:1,padding:"13px",background:"#7c3aed",color:"#fff",border:"none",
                    borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13}}>
                  ✓ Save &amp; Next (P{pIdx+2}) <span style={{opacity:0.4,fontSize:10}}>[Enter]</span>
                </button>
                <button onClick={()=>doExport("all")}
                  style={{padding:"13px 18px",background:"#10b981",color:"#fff",border:"none",
                    borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>
                  ⬇ Export All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:"#1e293b",borderTop:"2px solid #334155",padding:"7px 16px",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <button onClick={()=>setTab(t=>Math.max(t-1,0))}
          style={{padding:"6px 18px",background:"#334155",color:"#e2e8f0",border:"none",
            borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11}}>← Prev</button>
        <span style={{fontSize:10,color:"#475569"}}>{TABS[tab]} | P{pIdx+1}/{parts.length}</span>
        <button onClick={()=>setTab(t=>Math.min(t+1,TABS.length-1))}
          style={{padding:"6px 18px",background:"#7c3aed",color:"#fff",border:"none",
            borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11}}>Next →</button>
      </div>
    </div> 
  );
}
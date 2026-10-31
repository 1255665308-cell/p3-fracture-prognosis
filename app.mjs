import { EVIDENCE } from './evidence-data.mjs';
import { FROZEN, PARAMETER_SHA256 } from './frozen-parameters.mjs';
import { MODEL, predict, explain } from './model.mjs';
import { MODEL16, predict16 } from './model16.mjs';
import { FIELDS16, DEMO16, label16, buildFields16 } from './fields16.mjs';

const $ = id => document.getElementById(id);
const originals = Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(el => [el.dataset.i18n, el.innerHTML]));
const english = {
  skip:'Skip to main content',workspace:'RESEARCH WORKSPACE',navPredict:'Risk calculator',navEvidence:'Model evidence',navGuide:'User guide',
  sideModel:'Two assessment modes. Frozen study models.',sideVersion:'Public research demo · v2.1',localNote:'Calculations stay in your browser. The app does not upload or save inputs.',research:'Public research demo',
  title:'Two-year mortality after fracture',intro:'At discharge, estimate 730-day all-cause mortality with 16 clinical factors or two reduced inputs.',horizon:'730 days after discharge',
  mode16Title:'16-factor detailed assessment',mode16Sub:'Existing FineLASSO comparator',mode2Title:'Two-factor quick assessment',mode2Sub:'Age + procedure · Reduced primary model',
  scope:'Study population: adults aged 50+ with distal radius, proximal humerus, thoracic vertebral, lumbar vertebral, or proximal femoral fracture who survived to discharge. Research demonstration at discharge, outside preadmission or preoperative use.',
  inputTitle:'Enter patient information',inputSub:'Use records from the index admission',ageLabel:'Age at admission',years:'years',ageHelp:'Enter whole years. Development cohort range: 50–105 years.',surgeryLabel:'Recorded surgical procedure',surgeryHelp:'Select the procedure performed, consistent with fracture site and source records.',
  calculate:'Calculate probability',example:'Load a demonstration',reset:'Clear inputs',privacyShort:'No name or record number is required. Inputs are used only on this page.',
  resultTitle:'Predicted two-year all-cause mortality',awaiting:'Awaiting inputs',emptyTitle:'Start with two inputs',emptyText:'Enter age and the recorded procedure to see the model estimate.',within730:'Within 730 days<br>after discharge',exampleBadge:'DEMO',meaning:'This is the model estimate for these inputs. It does not determine an individual outcome.',download:'Export result',print:'Print report',
  inputUnit:'',miniInputs:'Clinical inputs',miniAuc:'Complete-support AUC',miniN:'Complete-support cohort',viewEvidence:'Explore the evidence',explanationTitle:'What contributes to this estimate?',explanationEmpty:'After calculation, explore the contributions of age and procedure.',baselineLabel:'Mean background prediction',baselineNote:'A fixed background of 2,094 development participants. Contributions are in percentage points.',positive:'Raises model prediction',negative:'Lowers model prediction',shapNote:'SHAP explains associations in the model. Procedure may also reflect fracture site and illness severity; these contributions cannot compare treatment effects or guide procedure selection.',
  bottomNote:'The study includes temporal evaluation from the same data source. Independent validation in other hospitals is not complete. No clinical high/low-risk cutoff is applied.',
  evidenceTitle:'The evidence behind the estimate',evidenceIntro:'Complete follow-up evidence anchors interpretation, with exploratory full-cohort results alongside it. Every cohort uses the same frozen model.',frozen:'Frozen model',people:'participants',developmentText:'Development cohort admitted in 2017–2020, with 170 recorded deaths within two years.',developmentCaption:'Model development and SHAP background',temporalText:'Temporal cohort admitted in 2021–2023, from the same data source.',temporalCaption:'135 deaths · 814 known 730-day survivors · 1,033 incompletely observed labels',
  comparisonTitle:'Performance alongside simple references',comparisonSub:'Complete support / 2021 / full temporal · Frozen predictions',modelColumn:'Model',ci:'(95% CI)',primaryName:'Two-factor primary model',current:'QUICK MODE',detailedModelName:'16-factor FineLASSO comparator',detailedEntry:'DETAILED MODE',ageOnly:'Age-only reference',fiveReference:'Original five-candidate reference',comparisonNote:'Higher AUC/AP and lower Brier are better. Ideal calibration slope is 1 and CITL is 0; positive CITL indicates overall underprediction. Cohort selection changes evidence, not the prediction formula. Improvement over age alone has not been demonstrated.',
  outcomeTitle:'Outcome and incomplete follow-up',outcomeText:'The origin is discharge and the outcome is death within 730 days. The 892-person and 696-person earlier-calendar populations overlap; they are not independent validation samples. In the full cohort, 1,033 horizon outcomes are unknown. Marginal IPCW assumes independent censoring and calendar representativeness; it cannot provide 730-day support for the 2023 cohort. AP is average precision; full-cohort metrics are weighted.',ageLimitText:'Overall AUC does not establish performance in every age group. For the two-factor primary model, full-temporal AUC was approximately 0.622 and CITL 0.333 among participants aged 80+, indicating underprediction; younger subgroups had few events.',
  explanationMethodTitle:'Explanation method',explanationMethodText:'Quick mode provides exact individual probability-scale SHAP. Detailed mode presents existing global SHAP importance across 1,982 temporal participants; those averages are not individual contributions for the current input. Both use the 2,094-person development background.',uncertaintyText:'The AUC confidence interval describes uncertainty in cohort performance, not an individual mortality-probability interval.',
  formulaTitle:'An open formula and explicit coding',formulaIntro:'The five two-factor members coincide, permitting the formula below. Detailed mode preserves five distinct coefficient sets, computes their probabilities separately, and averages the probabilities. Original log1p transfusion transformations and category mappings are retained.',parameters16Note:'Detailed mode requires all 16 source inputs. The original multiple-imputation analysis used in development and evaluation is unchanged.',parameters16Download:'Download exact publication parameters (JSON) ↓',coefficientsTitle:'View two-factor procedure coefficients',sourceCode:'Source code',codingNote:'PKP (code 7) is the reference. Rare codes 2, 10, and 11 are pooled as OTHER. Code 0 maps to OTHER and unknown maps to UNKNOWN; both have zero coefficients. Identical coefficients do not imply clinical equivalence.',
  guideTitle:'User guide',guideIntro:'Confirm eligibility, then use information already available at discharge.',guide1Title:'Confirm the study population',guide1Text:'The application represents participants aged 50+ with one of the five specified fracture sites who survived to discharge. Development ages ranged from 50 to 105. Other diseases, fracture sites, ages, and prediction times are outside this application’s scope.',guide2Title:'Use recorded discharge information',guide2Text:'Detailed mode requires 16 inputs; quick mode requires age and the procedure performed. This page does not impute new patients. If calcium is missing, use quick mode. Map explicit source 0 or unknown records accordingly. Do not compare candidate procedures to select treatment.',guide3Title:'Read the probability and explanation',guide3Text:'The result estimates 730-day all-cause mortality after discharge. Quick mode provides exact individual SHAP; detailed mode shows the original global SHAP, clearly distinguished from a current individual explanation. No treatment prescription, clinical risk cutoff, or individual probability interval is provided.',guide4Title:'Keep a traceable record',guide4Text:'JSON export records inputs, model version, unrounded probability, and explanation type. Detailed mode also includes five member probabilities. Printing creates a readable report. No identifier is required; inputs are not sent or persisted and are cleared on refresh.',researchBoundary:'Research-use scope',researchBoundaryText:'This is an interactive implementation of a research model. Independent hospital validation and clinical impact evaluation are not complete. Research reports should state the model version, target population, and temporal evaluation scope.',backPredict:'Return to calculator',footer:'Traceable predictions. Clear scope.'
};
const procedures = [
  {c:'7',g:'spine',zh:'经皮椎体后凸成形术（PKP）',en:'Percutaneous kyphoplasty (PKP)'},
  {c:'8',g:'spine',zh:'经皮椎体成形术（PVP）',en:'Percutaneous vertebroplasty (PVP)'},
  {c:'9',g:'spine',zh:'椎体骨折复位内固定术',en:'Vertebral fracture reduction and internal fixation'},
  {c:'10',g:'spine',zh:'脊柱融合术',en:'Spinal fusion'},
  {c:'3',g:'hip',zh:'人工股骨头置换术',en:'Hemiarthroplasty'},
  {c:'4',g:'hip',zh:'全髋关节置换术',en:'Total hip arthroplasty'},
  {c:'5',g:'hip',zh:'股骨近端骨折闭合复位内固定术',en:'Closed reduction and internal fixation of proximal femur fracture'},
  {c:'6',g:'hip',zh:'股骨近端骨折切开复位内固定术',en:'Open reduction and internal fixation of proximal femur fracture'},
  {c:'1',g:'radius',zh:'桡骨远端骨折切开复位内固定术',en:'Open reduction and internal fixation of distal radius fracture'},
  {c:'2',g:'radius',zh:'桡骨远端骨折闭合复位外固定术',en:'Closed reduction and external fixation of distal radius fracture'},
  {c:'11',g:'humerus',zh:'肱骨近端骨折闭合复位髓内钉固定术',en:'Closed reduction and intramedullary nailing of proximal humerus fracture'},
  {c:'12',g:'humerus',zh:'肱骨近端骨折切开复位内固定术',en:'Open reduction and internal fixation of proximal humerus fracture'},
  {c:'0',g:'unclear',zh:'原始记录类型未明确（代码0）',en:'Undefined source procedure (code 0)'},
  {c:'unknown',g:'unclear',zh:'原始记录为unknown',en:'Source record explicitly unknown'},
];
const groupNames = {spine:['胸椎／腰椎相关手术','Thoracic / lumbar spine'],hip:['髋部相关手术','Hip'],radius:['桡骨相关手术','Radius'],humerus:['肱骨相关手术','Humerus'],unclear:['原始记录不明确','Unclear source records']};
let lang = 'en', mode = '2', current = null, demo = false, dirty = false;
let cohortKey = EVIDENCE.cohorts[0].key;
const t = key => lang === 'en' ? english[key] ?? originals[key] : originals[key];
const say = (zh,en) => lang === 'zh' ? zh : en;
const percent = x => (x * 100).toFixed(2) + '%';
const signed = x => (x >= 0 ? '+' : '−') + (Math.abs(x) * 100).toFixed(2);
const proc = code => procedures.find(p => p.c === code)?.[lang] ?? code;

function buildOptions() {
  const value = $('surgery').value;
  $('surgery').replaceChildren();
  const placeholder = new Option(say('请选择本次手术类型','Select the recorded procedure'), '');
  placeholder.disabled = true; placeholder.selected = !value; $('surgery').append(placeholder);
  for (const [group, names] of Object.entries(groupNames)) {
    const optgroup = document.createElement('optgroup'); optgroup.label = names[lang === 'zh' ? 0 : 1];
    for (const p of procedures.filter(p => p.g === group)) optgroup.append(new Option(p[lang], p.c));
    $('surgery').append(optgroup);
  }
  $('surgery').value = value;
  $('coefficient-body').replaceChildren();
  for (const p of procedures) {
    const row = document.createElement('tr');
    for (const text of [p[lang], p.c, MODEL.surgeryOffsets[p.c] === 0 ? '0' : MODEL.surgeryOffsets[p.c].toPrecision(16)]) {
      const cell = document.createElement('td'); cell.textContent = text; row.append(cell);
    }
    $('coefficient-body').append(row);
  }
}
function translate() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = say('P3 · 骨折后两年风险预测','P3 · Two-year mortality after fracture');
  for (const el of document.querySelectorAll('[data-i18n]')) el.innerHTML = t(el.dataset.i18n);
  $('lang-zh').classList.toggle('selected', lang === 'zh');
  $('lang-en').classList.toggle('selected', lang === 'en');
  $('lang-zh').setAttribute('aria-pressed', String(lang === 'zh'));
  $('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
  $('navigation').setAttribute('aria-label', say('主导航','Main navigation'));
  document.querySelector('.result-column').setAttribute('aria-label', say('预测结果','Prediction result'));
  document.querySelector('.mode-selector').setAttribute('aria-label',say('评估模式','Assessment mode'));
  $('surgery').setAttribute('aria-label', say('本次手术类型','Recorded surgical procedure'));
  buildOptions(); buildFields16($('detailed-fields'),lang); sourceNote(); clearErrors(); renderEvidence(); render(); route(false);
}
function sourceNote() {
  const code = $('surgery').value;
  const text = code === '0' ? say('代码0是原始记录未定义的类型，不代表非手术治疗。网页按原模型映射为OTHER。','Code 0 is undefined in the source. It does not mean nonoperative treatment; the frozen model maps it to OTHER.') : code === 'unknown' ? say('请确认原始记录确为unknown；本页按原模型的UNKNOWN类别计算。','Confirm that the source record is explicitly unknown. The frozen UNKNOWN category will be used.') : ['2','10','11'].includes(code) ? say('该少见类型在开发时合并为OTHER，网页沿用原模型编码。','This rare procedure was pooled into OTHER during development. The original mapping is preserved.') : '';
  $('source-note').textContent = text; $('source-note').hidden = !text;
}
function clearErrors() {
  for (const name of ['age','surgery']) { $(name + '-error').hidden = true; $(name).removeAttribute('aria-invalid'); }
  for (const f of FIELDS16) { const control=$('f16-'+f.key); if(control){control.removeAttribute('aria-invalid');$('f16-'+f.key+'-error').hidden=true;} }
}
function markError(name, text) {
  $(name + '-error').textContent = text; $(name + '-error').hidden = false; $(name).setAttribute('aria-invalid','true');
}
function invalidate() {
  if (current) dirty = true;
  current = null; demo = false; clearErrors(); sourceNote(); render();
}
function calculate() {
  clearErrors(); let invalid = false;
  const age = $('age').value, surgery = $('surgery').value;
  if (!age || !Number.isInteger(Number(age)) || Number(age) < 50 || Number(age) > 105) {
    markError('age', say('请输入50–105岁之间的整数年龄。','Enter an integer age between 50 and 105.')); invalid = true;
  }
  if (!procedures.some(p => p.c === surgery)) { markError('surgery', say('请选择本次已实施的手术类型。','Select the procedure performed during this admission.')); invalid = true; }
  const raw16={Age:age,SURGERY:surgery};
  if(mode==='16'){
    for(const f of FIELDS16){raw16[f.key]=$('f16-'+f.key).value;if(raw16[f.key]===''){markError('f16-'+f.key,say('请核对记录后填写此项。','Provide this value after checking the source record.'));invalid=true;}}
  }
  if (invalid) { current = null; dirty = false; render(); document.querySelector('[aria-invalid=true]')?.focus(); return; }
  if(mode==='16'){
    try{const r=predict16(raw16);current={mode,inputAge:Number(age),inputSurgery:surgery,...r};}
    catch(error){const field=String(error.message);const id=field==='Age'?'age':field==='SURGERY'?'surgery':'f16-'+field;markError(id,say('数值或类别超出研究输入范围，请核对记录与单位。','Value or category is outside the study input range; verify the record and units.'));current=null;render();$(id).focus();return;}
  }else{const e=explain(Number(age),surgery);current={mode,inputAge:Number(age),inputSurgery:surgery,...e};}
  dirty = false; render();
  $('live-message').textContent = say('计算已完成','Calculation complete');
  $('probability').focus({ preventScroll: true });
  if (matchMedia('(max-width:700px)').matches) $('probability').scrollIntoView({ block:'center', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
}
function render() {
  const detailed=mode==='16';document.body.classList.toggle('detailed-mode',detailed);
  for(const [id,value]of [['mode16','16'],['mode2','2']]){$(id).classList.toggle('selected',mode===value);$(id).setAttribute('aria-pressed',String(mode===value));}
  $('detailed-fields').hidden=!detailed;
  $('mode-contract').textContent=detailed?say('详细模式：填齐16项临床信息，使用原16因素比较模型。缺失血钙时可切换快速模式；新患者缺失值不会在本页自动插补。','Detailed mode: provide all 16 inputs for the original comparator. If calcium is missing, switch to quick mode. This page does not impute new patients.'):say('快速模式：仅需年龄和手术类型，使用既有两因素精简主模型。','Quick mode: age and procedure only, using the existing reduced primary model.');
  $('factor-count').firstChild.textContent=detailed?'16':'2';
  const complete = EVIDENCE.cohorts[0];
  $('active-auc').textContent=complete.rows.find(r=>r.role===(detailed?'comparator':'primary')).metrics.AUC.estimate.toFixed(3);
  $('active-n').textContent=complete.n.toLocaleString('en-US');
  document.querySelector('#empty-result strong').textContent=detailed?say('填写完整临床信息','Provide the complete clinical inputs'):t('emptyTitle');
  const has = !!current;
  $('empty-result').hidden = has; $('calculated-result').hidden = !has;
  $('explanation-empty').hidden = detailed||has; $('explanation-content').hidden = detailed||!has;
  $('global-shap16').hidden=!detailed;
  $('explanation-title').textContent=detailed?say('16项因素在研究中的总体贡献','Global contributions of all 16 factors'):say('这个预测是如何形成的？','What contributes to this estimate?');
  $('explanation-method').textContent=detailed?'Global SHAP · n=1,982':'Exact SHAP · 2 factors';
  if(detailed)renderGlobal16();
  $('range-warning').hidden=true;
  $('download').disabled = !has; $('print').disabled = !has;
  $('result-status').textContent = has ? say('已计算','Calculated') : dirty ? say('待重新计算','Inputs changed') : t('awaiting');
  $('result-status').classList.toggle('complete',has);
  $('empty-message').textContent = dirty ? say('输入或评估模式已更改，请重新计算。','Inputs or assessment mode changed. Recalculate to see the result.') : detailed?say('填写16项信息，或载入演示示例查看详细模型。','Provide 16 inputs, or load a demonstration of the detailed model.'):t('emptyText');
  $('live-message').textContent = '';
  if (!has) return;
  $('probability').replaceChildren(document.createTextNode((current.probability * 100).toFixed(2)));
  const symbol = document.createElement('span');symbol.className='percent-sign';symbol.textContent='%';$('probability').append(symbol);
  $('probability-fill').style.width = (current.probability * 100) + '%';
  $('patient-context').textContent = `${detailed?say('16因素','16 factors'):say('两因素','2 factors')} · ${current.inputAge} ${say('岁','years')} · ${proc(current.inputSurgery)}`;
  $('example-badge').hidden = !demo;
  if(!detailed){$('baseline').textContent = percent(current.baseline);drawShap(current);}
  else{
    const outside=Object.entries(MODEL16.developmentRanges).filter(([f,[a,b]])=>current.inputs[f]<a||current.inputs[f]>b).map(([f])=>label16(f,lang));
    if(outside.length){$('range-warning').textContent=say('以下输入超出开发样本观察范围，请核对原始记录和单位：','These inputs are outside the observed development range; check records and units: ')+outside.join('、');$('range-warning').hidden=false;}
  }
}
function renderGlobal16(){
  const box=$('global-shap16');box.replaceChildren();
  const note=document.createElement('p');note.className='global-shap-note';note.textContent=say('以下是原研究1,982名时间评价患者的平均绝对SHAP贡献（百分点），不是本次输入的个体SHAP。药物或手术的贡献不代表治疗因果效应。','These are mean absolute SHAP contributions across the original 1,982 temporal participants (percentage points), not individual SHAP for the current input. Medication and procedure contributions are not causal treatment effects.');box.append(note);
  const max=MODEL16.globalSHAP.importance[0].meanAbsoluteProbability;
  for(const item of MODEL16.globalSHAP.importance){
    const row=document.createElement('div');row.className='global-shap-row';
    const label=document.createElement('span');label.className='global-shap-label';label.textContent=label16(item.field,lang);row.append(label);
    const track=document.createElement('span');track.className='global-shap-track';const bar=document.createElement('i');bar.style.width=(100*item.meanAbsoluteProbability/max)+'%';track.append(bar);row.append(track);
    const value=document.createElement('span');value.className='global-shap-value';value.textContent=(item.meanAbsoluteProbability*100).toFixed(2);row.append(value);box.append(row);
  }
}
function drawShap(e) {
  const xmlns='http://www.w3.org/2000/svg';
  const narrow=matchMedia('(max-width:700px)').matches;
  const svg=document.createElementNS(xmlns,'svg'); svg.setAttribute('viewBox',narrow?'0 0 380 220':'0 0 580 220');svg.setAttribute('role','img');
  const title=document.createElementNS(xmlns,'title');title.textContent=say(`背景平均预测${percent(e.baseline)}；年龄贡献${signed(e.age)}个百分点；手术类型贡献${signed(e.surgery)}个百分点；预测${percent(e.probability)}。`,`Background ${percent(e.baseline)}; age ${signed(e.age)} percentage points; procedure ${signed(e.surgery)} percentage points; prediction ${percent(e.probability)}.`);svg.append(title);
  const afterAge=e.baseline+e.age;
  // Intermediate waterfall positions can be negative even though probabilities
  // cannot. Preserve those positions and expand the axis; never clip SHAP bars.
  const points=[0,e.baseline,afterAge,e.probability];
  const low=Math.min(0,Math.floor(Math.min(...points)*10)/10);
  let high=Math.ceil(Math.max(...points)*10)/10;if(high<=low)high=low+.1;
  const x0=narrow?80:105,x1=narrow?245:430,valueX=narrow?260:450,ys=[35,83,131,179];
  const x=v=>x0+(v-low)/(high-low)*(x1-x0);
  const add=(tag,attrs,text)=>{const el=document.createElementNS(xmlns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;svg.append(el);return el;};
  for(let i=0;i<=4;i++){const value=low+(high-low)*i/4;const xx=x(value);add('line',{x1:xx,y1:13,x2:xx,y2:193,stroke:'#edf0e8','stroke-width':1});add('text',{x:xx,y:211,'text-anchor':'middle',class:'axis-label'},`${(value*100).toFixed(high-low<=.3?1:0)}%`);}
  const rows=[
    {label:narrow?say('背景预测','Baseline'):say('背景平均预测','Background'),from:0,to:e.baseline,value:percent(e.baseline),color:'#c4cdb9'},
    {label:say('年龄','Age'),from:e.baseline,to:afterAge,value:signed(e.age)+say(' 个百分点',' pp'),color:e.age>=0?'#a75c60':'#547d91'},
    {label:say('手术类型','Procedure'),from:afterAge,to:e.probability,value:signed(e.surgery)+say(' 个百分点',' pp'),color:e.surgery>=0?'#a75c60':'#547d91'},
    {label:say('最终预测','Prediction'),from:0,to:e.probability,value:percent(e.probability),color:'#274e4b'},
  ];
  rows.forEach((r,i)=>{add('text',{x:0,y:ys[i]+4,class:'row-label'},r.label);add('rect',{x:Math.min(x(r.from),x(r.to)),y:ys[i]-8,width:Math.max(.8,Math.abs(x(r.to)-x(r.from))),height:16,rx:2,fill:r.color});add('text',{x:valueX,y:ys[i]+4,class:'plot-value'},r.value);if(i<2)add('line',{x1:x(r.to),y1:ys[i]+8,x2:x(r.to),y2:ys[i+1]-8,stroke:'#bdc9bb','stroke-width':1,'stroke-dasharray':'3 3'});});
  $('shap-plot').replaceChildren(svg);
}
function route(focus=true) {
  const chosen=location.hash.slice(1);const view=['predict','evidence','guide'].includes(chosen)?chosen:'predict';
  for(const name of ['predict','evidence','guide']) $('view-'+name).hidden=name!==view;
  for(const a of document.querySelectorAll('[data-view]')) {const active=a.dataset.view===view;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  const key={predict:'navPredict',evidence:'navEvidence',guide:'navGuide'}[view];
  $('breadcrumb-label').dataset.i18n=key;$('breadcrumb-label').textContent=t(key);
  if(focus){window.scrollTo({top:0,behavior:'instant'});const heading=$('view-'+view).querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
$('prediction-form').addEventListener('submit',e=>{e.preventDefault();calculate();});
for(const name of ['age','surgery']) $(name).addEventListener('input',invalidate);
$('surgery').addEventListener('change',sourceNote);
$('load-example').addEventListener('click',()=>{$('age').value='78';$('surgery').value='5';if(mode==='16')for(const f of FIELDS16)$('f16-'+f.key).value=String(DEMO16[f.key]);demo=true;sourceNote();calculate();});
$('reset').addEventListener('click',()=>{$('age').value='';$('surgery').value='';for(const f of FIELDS16)$('f16-'+f.key).value='';current=null;dirty=false;demo=false;clearErrors();sourceNote();render();$('age').focus();});
$('detailed-fields').addEventListener('input',invalidate);
for(const [id,value]of [['mode16','16'],['mode2','2']])$(id).addEventListener('click',()=>{if(mode!==value){mode=value;invalidate();}});
$('lang-zh').addEventListener('click',()=>{lang='zh';translate();});
$('lang-en').addEventListener('click',()=>{lang='en';translate();});
window.addEventListener('hashchange',()=>route());
window.addEventListener('resize',()=>{if(current&&mode==='2')drawShap(current);});
$('print').addEventListener('click',()=>{if(current)window.print();});
$('download').addEventListener('click',()=>{
  if(!current)return;
  const detailed=mode==='16';
  const report={app_version:EVIDENCE.appVersion,manuscript_version:EVIDENCE.manuscriptVersion,parameter_sha256:PARAMETER_SHA256,assessment_mode:detailed?'16-factor detailed':'2-factor quick',model_version:detailed?MODEL16.version:MODEL.version,research_role:detailed?'16-factor comparator':'2-factor primary',exported_at:new Date().toISOString(),demonstration_data:demo,
    inputs:detailed?current.inputs:{age_years:current.inputAge,surgery_source_code:current.inputSurgery,surgery_label_en:procedures.find(p=>p.c===current.inputSurgery).en},
    prediction:{origin:'discharge',horizon_days:730,outcome:'all-cause death',probability:current.probability,...(detailed?{member_probabilities:current.memberProbabilities,aggregation:'mean of five probabilities'}:{})},
    explanation:detailed?{type:'existing study global SHAP summary',cohort_n:1982,individual_shap_computed:false}:{type:'exact individual two-group interventional probability SHAP',background_n:2094,background_mean_probability:current.baseline,age_contribution_probability:current.age,surgery_contribution_probability:current.surgery},
    evidence:{primary_interpretation_cohort_n:892,complete_2021_n:696,full_temporal_n:1982,full_temporal_unknown_horizon_outcomes:1033,displayed_cohort:cohortKey,cohort_selection_does_not_change_prediction:true},scope:'Adults aged 50+ with one of five ICD-mapped fracture sites, surviving to discharge. Research model; same-source temporal evaluation; no independent hospital validation or clinical cutoff.'};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='P3_prediction_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('live-message').textContent=say('结果已导出','Result exported');
});
$('download-parameters16').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(FROZEN,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='P3_exact_publication_parameters_20261030.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
function renderEvidence(){
  const select=$('evidence-cohort');select.replaceChildren();
  for(const c of EVIDENCE.cohorts) select.append(new Option(c[lang],c.key));
  select.value=cohortKey;
  const c=EVIDENCE.cohorts.find(c=>c.key===cohortKey);
  $('evidence-cohort-label').textContent=say('评价人群','Evaluation population');
  $('slope-heading').textContent=say('校准斜率','Calibration slope');
  $('cohort-context').textContent=say(`${c.deaths}例死亡 · ${c.controls}例时点对照 · ${c.unknown}例时点未知。`,`${c.deaths} deaths · ${c.controls} horizon controls · ${c.unknown} unknown horizon outcomes. `)+(c.unknown?say('探索性边际IPCW；2023年无完整730天行政支持。','Exploratory marginal IPCW; no complete 730-day administrative support in 2023.'):say('不加权时点评价。892人与696人相互重叠，不代表不同医院。','Unweighted horizon evaluation. The 892-person and 696-person populations overlap within one hospital.'));
  const body=$('performance-body');body.replaceChildren();
  for(const r of c.rows){
    const row=document.createElement('tr');if(['primary','comparator'].includes(r.role)) row.className=r.role==='primary'?'primary-model-row':'detailed-model-row';
    const title=document.createElement('th');title.scope='row';title.textContent=r[lang];row.append(title);
    for(const metric of ['AUC','AP','Brier','slope','CITL']){
      const td=document.createElement('td'),v=r.metrics[metric];
      td.textContent=v.estimate.toFixed(metric==='Brier'?4:3)+(metric==='AUC'&&v.CI_low!==undefined?` (${v.CI_low.toFixed(3)}–${v.CI_high.toFixed(3)})`:'');
      if(v.CI_low!==undefined)td.title=`95% CI: ${v.CI_low} – ${v.CI_high}`;
      row.append(td);
    }body.append(row);
  }
  $('primary-equation').textContent=`z = ${MODEL.intercept.toPrecision(17)} + ${MODEL.ageCoefficient.toPrecision(17)} × Age + β_surgery`;
  $('version-receipt').textContent=`${EVIDENCE.appVersion} · ${EVIDENCE.manuscriptVersion} · SHA-256 ${PARAMETER_SHA256.slice(0,16)}…`;
}
$('evidence-cohort').addEventListener('change',()=>{cohortKey=$('evidence-cohort').value;renderEvidence();});
// No local/session storage, analytics, remote prediction APIs, or patient identifiers.
translate();
for(const button of document.querySelectorAll('[data-await-ready]'))button.disabled=false;

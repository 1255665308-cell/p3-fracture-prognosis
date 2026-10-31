export const GROUPS16 = [
  {zh:'基本信息与麻醉评估',en:'Patient and anaesthesia assessment',fields:[
    {key:'Gender',zh:'性别',en:'Sex',options:[['0','女','Female'],['1','男','Male']]},
    {key:'ASA',zh:'ASA分级',en:'ASA physical status',options:[['1','I级','Class I'],['2','II级','Class II'],['3','III级','Class III'],['4','IV级','Class IV'],['unknown','原始记录为unknown','Source record explicitly unknown']]},
  ]},
  {zh:'输血与住院检验',en:'Transfusion and inpatient laboratory',noteZh:'MAP为术中浓缩红细胞单位数；血钙采样的精确时点在原始数据中未确认。',noteEn:'MAP denotes intraoperative packed red-cell units. Exact serum calcium sampling time was unavailable in the source.',fields:[
    {key:'MAP',zh:'术中浓缩红细胞（单位）',en:'Packed red cells (units)',type:'number',min:0,max:112.5,placeholder:'0',step:'any'},
    {key:'FFP',zh:'术中新鲜冰冻血浆（mL）',en:'Fresh frozen plasma (mL)',type:'number',min:0,max:18000,placeholder:'0',step:'any'},
    {key:'calcium',zh:'住院血清钙（mmol/L）',en:'Inpatient serum calcium (mmol/L)',type:'number',min:.74,max:2.91,placeholder:'2.25',step:'any'},
  ]},
  {zh:'既往疾病记录',en:'Recorded medical history',noteZh:'恶性肿瘤史与CCI实体肿瘤项按原始记录分别填写。',noteEn:'Enter malignancy history and the CCI solid-tumour item separately, as recorded.',fields:[
    {key:'hypertension',zh:'高血压病史',en:'History of hypertension',binary:'history'},
    {key:'tumor',zh:'恶性肿瘤病史',en:'History of malignancy',binary:'history'},
    {key:'2Solidtumor',zh:'实体肿瘤病史（CCI项）',en:'Solid-tumour history (CCI item)',binary:'history'},
  ]},
  {zh:'本次住院与出院用药记录',en:'Index-admission and discharge medication records',noteZh:'阿法骨化醇对应出院发药记录；其余药物对应入院至出院期间处方。未确认的信息请先核对，不以“未记录”代替未知。',noteEn:'Alfacalcidol refers to dispensing at discharge. Other classes refer to prescriptions during the index admission through discharge. Verify unknown information before selecting “not recorded”.',fields:[
    {key:'VD1',zh:'出院阿法骨化醇发药',en:'Alfacalcidol dispensed at discharge',binary:'record'},
    {key:'rx_CCB_index',zh:'钙通道阻滞剂（CCB）',en:'Calcium-channel blocker (CCB)',binary:'record'},
    {key:'rx_loop_diuretic_index',zh:'袢利尿剂',en:'Loop diuretic',binary:'record'},
    {key:'rx_beta_blocker_index',zh:'β受体阻滞剂',en:'Beta-blocker',binary:'record'},
    {key:'rx_other_antihypertensive_index',zh:'其他降压药类（原表Others）',en:'Other antihypertensives (source Others)',binary:'record'},
    {key:'rx_thiazide_index',zh:'噻嗪类利尿剂',en:'Thiazide diuretic',binary:'record'},
  ]},
];
export const FIELDS16 = GROUPS16.flatMap(g=>g.fields);
export const DEMO16 = {Gender:0,Age:78,MAP:0,FFP:0,hypertension:1,tumor:0,'2Solidtumor':0,VD1:1,calcium:2.25,ASA:'2',SURGERY:'5',rx_CCB_index:1,rx_loop_diuretic_index:0,rx_beta_blocker_index:0,rx_other_antihypertensive_index:0,rx_thiazide_index:0};
export function label16(field,lang){if(field==='Age')return lang==='zh'?'年龄':'Age';if(field==='SURGERY')return lang==='zh'?'手术类型':'Procedure';return FIELDS16.find(f=>f.key===field)?.[lang]??field;}
export function buildFields16(container,lang){
  const prior=Object.fromEntries(FIELDS16.map(f=>[f.key,document.getElementById('f16-'+f.key)?.value??'']));
  container.replaceChildren();
  for(const group of GROUPS16){
    const fs=document.createElement('fieldset');fs.className='detailed-fieldset';
    const legend=document.createElement('legend');legend.textContent=group[lang];fs.append(legend);
    if(group.noteZh){const p=document.createElement('p');p.className='detailed-group-note';p.textContent=lang==='zh'?group.noteZh:group.noteEn;fs.append(p);}
    const grid=document.createElement('div');grid.className='fields16-grid';
    for(const field of group.fields){
      const wrap=document.createElement('div');wrap.className='field16';
      const id='f16-'+field.key;const label=document.createElement('label');label.htmlFor=id;label.textContent=field[lang]+' *';wrap.append(label);
      let control;
      if(field.type==='number'){
        control=document.createElement('input');control.type='number';control.min=String(field.min);control.max=String(field.max);control.step=field.step;control.placeholder=field.placeholder;control.inputMode='decimal';
      }else{
        control=document.createElement('select');const empty=new Option(lang==='zh'?'请选择':'Select an option','');empty.disabled=true;empty.selected=true;control.append(empty);
        const options=field.options??(field.binary==='history'?[['0','无','No'],['1','有','Yes']]:[['0','未记录','Not recorded'],['1','有记录','Recorded']]);
        for(const [value,zh,en]of options)control.append(new Option(lang==='zh'?zh:en,value));
      }
      control.id=id;control.name=field.key;control.required=true;control.setAttribute('aria-describedby',id+'-error');control.value=prior[field.key];wrap.append(control);
      const error=document.createElement('p');error.id=id+'-error';error.className='field-error';error.hidden=true;wrap.append(error);grid.append(wrap);
    }
    fs.append(grid);container.append(fs);
  }
}

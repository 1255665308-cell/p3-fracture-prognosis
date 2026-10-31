// Browser-compatible pure prediction functions; no IO, network, or persistence.
export function canonical(value) {
  if (value===null || value===undefined) return 'UNKNOWN';
  const s=String(value).trim();
  if (['unknown','unknown_or_mixed','nan','none',''].includes(s.toLowerCase())) return 'UNKNOWN';
  const n=Number(s);return Number.isFinite(n)&&Number.isInteger(n)?String(n):s;
}
export function probability(input, specification) {
  if(input===null || typeof input!=='object' || Array.isArray(input))throw new Error('Input must be a field-value object');
  const required=new Set(specification.members.flatMap(m=>m.columns.map(c=>c.field)));
  for(const field of required)if(!Object.prototype.hasOwnProperty.call(input,field))throw new Error('Missing input field: '+field);
  const probabilities=specification.members.map(member=>{
    let eta=member.intercept;
    member.columns.forEach(column=>{
      let value;
      if(column.category!==null){
        let level=canonical(input[column.field]);
        const common=member.categories[column.field].common;
        if(level!=='UNKNOWN'&&!common.includes(level))level='OTHER';
        value=Number(level===column.category);
      } else {
        const raw=input[column.field];
        if(raw===null || raw===undefined || !['number','string'].includes(typeof raw) || (typeof raw==='string' && raw.trim()===''))throw new Error('Missing or invalid numeric input: '+column.field);
        value=Number(raw);
        if(!Number.isFinite(value))throw new Error('Missing or non-finite input');
      }
      if(column.log1p)value=Math.log1p(value);
      if(!Number.isFinite(value))throw new Error('Invalid transformed input: '+column.field);
      eta+=column.coefficient*(value-column.mean)/column.scale;
    });
    return eta>=0?1/(1+Math.exp(-eta)):Math.exp(eta)/(1+Math.exp(eta));
  });
  return probabilities.reduce((a,b)=>a+b,0)/probabilities.length;
}

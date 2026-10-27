(()=>{
 const key='rist-phase4-review-v1:';let state={};try{if(window.name.startsWith(key))state=JSON.parse(window.name.slice(key.length));}catch{}
 const incoming=state.pending?.page==='rist-phase4-group-save-failed'?state.pending:state.saveContext;
 if(!incoming)state={};
 const group=incoming?.group||'CSV-003';const defaults={'CSV-003':Array.from({length:5},(_,i)=>`VOCs_20261027_${String(i+1).padStart(2,'0')}.csv`),'EXCEL-004':Array.from({length:3},(_,i)=>`대기종합오염도_20261027_${String(i+1).padStart(2,'0')}.xlsx`)};
 const names=incoming?.names||state.saveFlow?.names||defaults;
 if(incoming?.excluded)names['CSV-003']=names['CSV-003'].filter(n=>n!=='VOCs_20261027_03.csv');
 const files=names[group],index=Math.max(0,Math.min(incoming?.index||0,files.length-1));
 state.groupSaveResults??={};const results=state.groupSaveResults[group]||Object.fromEntries(files.map((name,i)=>[name,i<2?'저장 성공':i===2?'저장 실패':'저장 미완료']));state.groupSaveResults[group]=results;
 document.getElementById('failed-group').textContent=group+' 그룹 저장을 완료하지 못했습니다.';
 document.getElementById('failed-count').textContent=['저장 성공','저장 실패','저장 미완료'].map(status=>status+' '+files.filter(name=>results[name]===status).length+'개').join(' / ');
 const tbody=document.querySelector('.panel tbody');tbody.replaceChildren();files.forEach(name=>{const tr=document.createElement('tr');for(const text of [name,results[name]||'저장 미완료']){const td=document.createElement('td');td.textContent=text;tr.append(td);}tbody.append(tr);});
 delete state.pending;delete state.saveContext;window.name=key+JSON.stringify(state);
 document.getElementById('return-review').onclick=()=>{const page='rist-phase4-review-detail-first';state.pending={page,group,index,names,excluded:!!incoming?.excluded};window.name=key+JSON.stringify(state);const b=document.createElement('button');b.dataset.viewerPage=page;document.body.append(b);b.click();b.remove();};
})();

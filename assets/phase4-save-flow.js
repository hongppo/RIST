(()=>{
 const key='rist-phase4-review-v1:',mode=document.body.dataset.p4SaveState;
 const ids={saving:'rist-phase4-group-saving',complete:'rist-phase4-group-saved',history:'rist-phase4-bundle-partial',all:'rist-phase4-all-groups-complete'};
 let state={};try{if(window.name.startsWith(key))state=JSON.parse(window.name.slice(key.length));}catch{}
 const incoming=state.pending?.page===ids[mode]?state.pending:null;
 if(['history','all'].includes(mode)&&!incoming)return;
 const defaults={'CSV-003':Array.from({length:5},(_,i)=>`VOCs_20261027_${String(i+1).padStart(2,'0')}.csv`),'EXCEL-004':Array.from({length:3},(_,i)=>`대기종합오염도_20261027_${String(i+1).padStart(2,'0')}.xlsx`)};
 let context=incoming||(mode==='complete'?state.saveContext:null);
 if(!context&&['saving','complete'].includes(mode))state={};
 context=context||{group:'CSV-003',names:defaults};
 const flow=state.saveFlow||{names:context.names||defaults,completed:[],expiry:{},owner:'박보검'};
 flow.names=context.names||flow.names;
 if(context.excluded)flow.names={...flow.names,'CSV-003':flow.names['CSV-003'].filter(n=>n!=='VOCs_20261027_03.csv')};
 flow.group=context.group||flow.group||'CSV-003';
 const groups=Object.keys(flow.names).filter(g=>flow.names[g].length).sort();
 if(!state.saveFlow)flow.completed=groups.slice(0,Math.max(0,groups.indexOf(flow.group)));
 const count=g=>flow.names[g].length;
 const rows=g=>flow.names[g].reduce((n,name)=>n+(state[name]?.rows?.length??(g==='CSV-003'?171:120)),0);
 const stamp=groups.flatMap(g=>flow.names[g]).join(' ').match(/_(\d{8})_/);const raw=stamp?stamp[1]:'20261027';
 flow.date=flow.date||`${raw.slice(0,4)}/${raw.slice(4,6)}/${raw.slice(6,8)}`;
 const expiry=new Date(flow.date.replaceAll('/','-')+'T00:00:00Z');expiry.setUTCDate(expiry.getUTCDate()+30);
 groups.forEach(g=>{flow.expiry[g]??=expiry.toISOString().slice(0,10).replaceAll('-','/');});
 const write=()=>{state.saveFlow=flow;window.name=key+JSON.stringify(state);};
 const go=(page,group=flow.group)=>{state.pending={page,group,index:0,names:flow.names};write();const b=document.createElement('button');b.dataset.viewerPage=page;document.body.append(b);b.click();b.remove();};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 delete state.pending;
 if(mode==='saving'){
  document.getElementById('saving-group').textContent=flow.group+' 그룹 저장 중';document.getElementById('saving-count').textContent=count(flow.group)+'개 파일 / 전체 '+rows(flow.group)+'행';
  state.saveContext={page:ids.complete,group:flow.group,index:context.index||0,excluded:!!context.excluded,names:flow.names};write();return;
 }
 if(mode==='complete'){
  if(!flow.completed.includes(flow.group))flow.completed.push(flow.group);
  delete state.saveContext;
  const next=groups.find(g=>!flow.completed.includes(g));
  document.getElementById('saved-group').textContent=flow.group+' 그룹 저장 완료';
  document.getElementById('saved-count').textContent=count(flow.group)+'개 파일 / 전체 '+rows(flow.group)+'행';
  document.getElementById('next-group-choice').hidden=!next;
  document.getElementById('all-complete-action').hidden=!!next;
  if(next){
   document.getElementById('next-group-count').textContent=next+' / '+count(next)+'개 파일';
   document.getElementById('next-group-start').onclick=()=>go('rist-phase4-review-next-group',next);
   document.getElementById('next-group-later').onclick=()=>go(ids.history);
  }else document.getElementById('saved-finish').onclick=()=>go(ids.all);
  write();return;
 }
 if(mode==='history'){
  document.body.dataset.historyBundleSource='review-flow';
  const completed=groups.filter(g=>flow.completed.includes(g));
  document.getElementById('bundle-meta').innerHTML=`<dl><div><dt>업로드</dt><dd>${esc(flow.date)} 10:00</dd></div><div><dt>업로드한 사람</dt><dd>${esc(flow.owner)}</dd></div></dl><dl><div><dt>파일 / 그룹</dt><dd>${groups.reduce((n,g)=>n+count(g),0)}개 / ${groups.length}개</dd></div><div><dt>완료 / 미완료</dt><dd>${completed.length}개 / ${groups.length-completed.length}개 그룹</dd></div></dl>`;
  document.getElementById('bundle-groups').innerHTML=groups.map(g=>{const done=completed.includes(g);return `<tr><td>${esc(g)}</td><td>${count(g)}개</td><td><span class="status-tag ${done?'status-complete':''}">${done?'최종 저장 완료':'검토 대기'}</span></td><td>${done?'—':esc(flow.expiry[g])}</td><td>${done?'—':`<button class="action primary" data-flow-resume="${esc(g)}">이어서 검토</button>`}</td></tr>`;}).join('');
  document.querySelectorAll('[data-flow-resume]').forEach(b=>b.onclick=()=>go('rist-phase4-review-next-group',b.dataset.flowResume));write();return;
 }
 if(mode==='all'){
  document.querySelector('.panel>p').textContent=groups.length+'개 그룹 / '+groups.reduce((n,g)=>n+count(g),0)+'개 파일 / 전체 '+groups.reduce((n,g)=>n+rows(g),0).toLocaleString('ko-KR')+'행';
  document.querySelector('.panel tbody').innerHTML=groups.map(g=>`<tr><td>${esc(g)}</td><td>${count(g)}개</td><td>${rows(g)}행</td><td>최종 저장 완료</td></tr>`).join('');write();
 }
})();

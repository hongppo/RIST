(()=>{
 const key='rist-phase4-review-v1:';let state={};try{if(window.name.startsWith(key))state=JSON.parse(window.name.slice(key.length));}catch{}
 const records={
  'single-failed':{mode:'single',file:'추출 확인.csv',type:'CSV-001',owner:'박보검',uploaded:'2026/10/20 11:00',expiry:'2026/11/19',status:'추출 실패',page:'rist-phase4-single-history-failed',list:'rist-phase4-single-upload-history'},
  'single-unsupported':{mode:'single',file:'측정 자료.txt',type:'—',owner:'박보검',uploaded:'2026/10/21 11:00',expiry:'2026/11/20',status:'지원하지 않는 파일',page:'rist-phase4-single-history-unsupported',list:'rist-phase4-single-upload-history'},
  'multiple-failed':{mode:'multiple',file:'측정자료_20260930.csv',type:'—',owner:'박보검',uploaded:'2026/09/30 10:00',expiry:'2026/10/30',status:'추출 실패',page:'rist-phase4-history-file-failed',list:'rist-phase4-bundle-expiring'},
  'multiple-unsupported':{mode:'multiple',file:'현장메모_20261020.txt',type:'—',owner:'박보검',uploaded:'2026/10/20 10:00',expiry:'2026/11/19',status:'지원하지 않는 파일',page:'rist-phase4-history-file-unsupported',list:'rist-phase4-bundle-partial'}
 };
 const source=document.body.dataset.historyDeleteSource,view=document.body.dataset.historyDeleteView;
 const previous=state.historyDeletion;
 if(!source&&!view&&!previous)return;
 const ledger=state.historyDeletion||{hidden:[]};ledger.hidden??=[];
 const current=state.currentAccount||'박보검';
 const write=()=>{state.historyDeletion=ledger;window.name=key+JSON.stringify(state);};
 const go=(page,id)=>{ledger.pending={page,record:id};write();const b=document.createElement('button');b.dataset.viewerPage=page;document.body.append(b);b.click();b.remove();};
 const hidden=id=>ledger.hidden.includes(id);
 const allowed=r=>r.owner===current&&['추출 실패','지원하지 않는 파일'].includes(r.status)&&r.expiry>='2026/10/27';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 if(view==='bundle'){
  const page=document.body.dataset.historyDeletePage;
  function renderUngrouped(){
   document.getElementById('ungrouped-history')?.remove();document.getElementById('hidden-history-note')?.remove();
   if(document.body.dataset.historyBundleSource==='review-flow')return;
   const context=document.body.dataset.bundleContext;
   if(!['partial','expiring'].includes(context)||current!=='박보검')return;
   const relevant=Object.entries(records).filter(([id,r])=>r.mode==='multiple'&&r.list===page);
   const visible=relevant.filter(([id])=>!hidden(id));
   const section=document.createElement('section');section.id='ungrouped-history';section.className='table-panel';section.style.flex='none';section.innerHTML='<div class="table-heading"><h2>그룹에 포함되지 않은 파일</h2></div>'+(visible.length?'<table><thead><tr><th>파일명</th><th>상태</th><th>상세</th></tr></thead><tbody>'+visible.map(([id,r])=>`<tr><td>${esc(r.file)}</td><td>${r.status}</td><td><button class="action" data-open-history="${id}">상세 보기</button></td></tr>`).join('')+'</tbody></table>':'<p style="padding:0 20px">표시할 파일 이력이 없습니다.</p>');
   document.querySelector('main').append(section);
   section.querySelectorAll('[data-open-history]').forEach(b=>b.onclick=()=>go(records[b.dataset.openHistory].page,b.dataset.openHistory));
   if(relevant.some(([id])=>hidden(id))){const note=document.createElement('p');note.id='hidden-history-note';note.className='meta';note.textContent='삭제된 이력을 제외한 목록입니다.';document.querySelector('main').append(note);}
  }
  renderUngrouped();document.addEventListener('bundle-content-rendered',renderUngrouped);
  delete ledger.pending;write();return;
 }
 if(!source){
  if(!previous&&view!=='single-list')return;
  if(document.querySelector('#list-count')){
   Object.entries(records).filter(([,r])=>r.mode==='single').forEach(([id,r])=>{const tr=[...document.querySelectorAll('tr[data-file]')].find(x=>x.dataset.file===r.file);if(!tr)return;if(hidden(id))tr.remove();else{const b=tr.querySelector('button');b.dataset.viewerPage=r.page;delete b.dataset.viewerAnchor;}});
   document.querySelectorAll('[data-viewer-page^="rist-phase3-history-"]').forEach(b=>b.addEventListener('click',()=>{ledger.legacyDetail=b.dataset.viewerPage;write();}));
   if(typeof search==='function')search();
   delete ledger.pending;write();return;
  }
  const guard=()=>{const file=document.getElementById('info-file')?.textContent;const pair=Object.entries(records).find(([id,r])=>r.mode==='single'&&r.file===file&&hidden(id));if(pair)unavailable(pair[1]);};
  guard();window.addEventListener('message',e=>{if(e.source===parent&&e.data?.channel==='mockup-viewer-host'&&e.data.action==='document-target')guard();});return;
 }
 const confirm=document.body.dataset.historyDeleteConfirm==='true';
 const thisPage=document.body.dataset.historyDeletePage;
 let id=confirm&&ledger.pending?.page===thisPage?ledger.pending.record:source;
 if(!records[id])id=source;
 const record=records[id];
 function unavailable(r){const recordId=Object.keys(records).find(k=>records[k]===r);const main=document.querySelector('main');main.replaceChildren();const p=document.createElement('p');p.className='no-data';p.textContent='이 이력을 확인할 수 없습니다.';const b=document.createElement('button');b.className='action';b.textContent=r.mode==='single'?'목록으로':'묶음 상세로';b.onclick=()=>go(r.list,recordId);main.append(p,b);document.getElementById('history-delete-dialog')?.remove();}
 if(hidden(id)||record.owner!==current){unavailable(record);return;}
 // Fill the inherited detail layout without changing the source records.
 if(document.getElementById('info-file')){
  for(const [field,value] of Object.entries({...record,saved:'—',count:'—'})){const el=document.getElementById('info-'+field);if(el)el.textContent=value;}
  const statusField=document.getElementById('info-status');if(statusField&&record.expiry==='2026/10/30'){const badge=document.createElement('span');badge.className='status-tag expiry-badge';badge.textContent='만료 예정';statusField.append(badge);}
  document.querySelector('h1').textContent='업로드 이력 상세';
 }else{
  document.querySelector('h1').textContent='업로드 이력 상세';const values={파일명:record.file,'업로드한 사람':record.owner,업로드:record.uploaded,상태:record.status,'보관 만료일':record.expiry};document.querySelectorAll('.summary-card dt').forEach(dt=>{if(values[dt.textContent]){const dd=dt.nextElementSibling;if(dt.textContent==='상태'){dd.replaceChildren();const tag=document.createElement('span');tag.className='status-tag';tag.textContent=record.status;dd.append(tag);if(record.expiry==='2026/10/30'){const badge=document.createElement('span');badge.className='status-tag expiry-badge';badge.textContent='만료 예정';dd.append(badge);}}else dd.textContent=values[dt.textContent];}});
  
 }
 const note=document.getElementById('failure-note');if(note)note.textContent=record.status==='추출 실패'?'추출에 실패하여 검토 데이터가 없습니다.':'지원하지 않는 파일로 검토 데이터가 없습니다.';
 const parentLink=document.getElementById('history-back');if(parentLink){parentLink.textContent='묶음 상세로';parentLink.removeAttribute('data-viewer-page');parentLink.onclick=()=>go(record.list,id);}
 const trigger=document.getElementById('delete-history');trigger.hidden=!allowed(record);
 trigger.onclick=()=>go(record.mode==='single'?'rist-phase4-history-delete-single':'rist-phase4-history-delete-multiple',id);
 if(confirm){
  const dialog=document.getElementById('history-delete-dialog');document.getElementById('delete-history-cancel').onclick=()=>go(record.page,id);
  dialog.addEventListener('cancel',e=>{e.preventDefault();go(record.page,id);});
  document.getElementById('delete-history-confirm').onclick=()=>{if(!allowed(record)||hidden(id))return;ledger.hidden.push(id);go(record.list,id);};
  if(allowed(record))dialog.showModal();
 }else{delete ledger.pending;write();}
})();

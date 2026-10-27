(()=>{
 const key='rist-phase4-review-v1:';let state;try{if(!window.name.startsWith(key))return;state=JSON.parse(window.name.slice(key.length));}catch{return;}
 if(state.historyDeletion?.legacyDetail!==window.phase4LegacyHistoryPage)return;
 document.querySelectorAll('[data-viewer-page="rist-phase3-upload-history"]').forEach(b=>b.dataset.viewerPage='rist-phase4-single-upload-history');
 delete state.historyDeletion.legacyDetail;window.name=key+JSON.stringify(state);
})();

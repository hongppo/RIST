'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../pages/rist-phase2-final-validation.html'),'utf8');
function validator(){
 const definitions=html.slice(html.indexOf('const cols='),html.indexOf('const options='));
 const coord=html.slice(html.indexOf('function parseCoord('),html.indexOf('function setMapCoords('));
 const final=html.slice(html.indexOf('function dateOnly('),html.indexOf('function pendingInspectionEdit('));
 const c=vm.createContext({structuredClone});vm.runInContext(definitions+coord+"\nconst isEmpty=v=>v==null||String(v).trim()==='';let data=Array.from({length:171},()=>structuredClone(original[0]));\n"+final,c);
 return expression=>JSON.parse(JSON.stringify(vm.runInContext(expression,c)));
}
test('final inspection scans row 171, and zero/n.d/inequalities remain values',()=>{
 const run=validator();assert.deepEqual(run('collectInspectionIssues()'),[]);
 assert.deepEqual(run("data[0][15]=0;data[1][15]='n.d';data[2][15]='<0.01';collectInspectionIssues()"),[]);
 assert.deepEqual(run("data[170][16]=' ';collectInspectionIssues().map(({r,c,type})=>({r,c,type}))"),[{r:170,c:16,type:'missing'}]);
});
test('date comparison is date-only and rejects impossible dates without correction',()=>{
 const run=validator();assert.deepEqual(run("data[0][6]='2025/05/16 00:00';collectInspectionIssues()"),[]);
 assert.equal(run("data[0][6]='2025/05/15 23:59';collectInspectionIssues()[0].type"),'date-order');
 assert.equal(run("data[0][6]='2025/02/30 12:00';collectInspectionIssues()[0].type"),'invalid');
 assert.equal(run('data[0][6]'),'2025/02/30 12:00');
});
test('coordinates and existing duration validity are checked independently of required values',()=>{
 const run=validator();const issues=run("data[0][9]='91°00′00.00″N';data[0][7]='0';collectInspectionIssues().map(({c,type})=>({c,type}))");
 assert.deepEqual(issues,[{c:7,type:'invalid'},{c:9,type:'invalid'}]);
});

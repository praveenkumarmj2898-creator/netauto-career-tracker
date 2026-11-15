const stages = ["CCNA","Python","Automation","Cloud + SD-WAN"];
const starter = [
  {stage:"CCNA",name:"Review switching fundamentals",detail:"VLANs, trunking, STP and EtherChannel"},
  {stage:"CCNA",name:"Practise routing fundamentals",detail:"Static routing, OSPF and EIGRP concepts"},
  {stage:"CCNA",name:"Build troubleshooting command notes",detail:"Practise show commands and explain what each output means"},
  {stage:"Python",name:"Learn Python fundamentals",detail:"Variables, data types, conditions, loops and functions"},
  {stage:"Python",name:"Practise lists, dictionaries and files",detail:"Write small scripts and handle text/CSV files"},
  {stage:"Python",name:"Learn API and JSON basics",detail:"Understand requests, responses and JSON data"},
  {stage:"Automation",name:"Learn Git and GitHub basics",detail:"Create a repository and publish practice scripts"},
  {stage:"Automation",name:"Learn Ansible fundamentals",detail:"Inventory, ad-hoc commands, playbooks and variables"},
  {stage:"Automation",name:"Automate a network task",detail:"Start with backing up device configurations or collecting show output"},
  {stage:"Cloud + SD-WAN",name:"Revise cloud networking fundamentals",detail:"VPC/VNet, routing, VPN and hybrid connectivity"},
  {stage:"Cloud + SD-WAN",name:"Document SD-WAN concepts",detail:"Underlay, overlay, control plane and troubleshooting"},
  {stage:"Cloud + SD-WAN",name:"Build an end-to-end troubleshooting lab",detail:"Record topology, symptoms, checks, root cause and resolution"}
].map((x,i)=>({...x,id:crypto.randomUUID(),done:false}));
const KEY="netauto-career-tracker-v1";
let data=load();
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&Array.isArray(v.tasks))return v;}catch(e){}return {tasks:starter,notes:""}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const total=data.tasks.length,done=data.tasks.filter(t=>t.done).length,pct=total?Math.round(done/total*100):0;
 document.querySelector("#overallText").textContent=pct+"% completed";
 document.querySelector("#taskCount").textContent=`${done} / ${total} tasks`;
 document.querySelector("#overallBar").style.width=pct+"%";
 document.querySelector("#roadmap").innerHTML=stages.map(stage=>{
  const ts=data.tasks.filter(t=>t.stage===stage),d=ts.filter(t=>t.done).length,p=ts.length?Math.round(d/ts.length*100):0;
  return `<section class="stage"><div class="stage-head"><h3>${esc(stage)}</h3><span class="stage-progress">${d}/${ts.length} completed</span></div><div class="progress"><div style="width:${p}%"></div></div>${ts.map(t=>`<div class="task ${t.done?"done":""}"><input type="checkbox" data-check="${t.id}" ${t.done?"checked":""} aria-label="Mark ${esc(t.name)} complete"><div class="task-main"><div class="task-name">${esc(t.name)}</div>${t.detail?`<div class="task-detail">${esc(t.detail)}</div>`:""}</div><div class="task-buttons"><button class="icon-btn" data-edit="${t.id}" aria-label="Edit task">✎</button><button class="icon-btn" data-delete="${t.id}" aria-label="Delete task">×</button></div></div>`).join("")||'<p class="hint">No tasks yet. Add one to this stage.</p>'}</section>`;
 }).join("");
 document.querySelector("#notes").value=data.notes||"";
}
document.querySelector("#roadmap").addEventListener("change",e=>{if(e.target.dataset.check){const t=data.tasks.find(x=>x.id===e.target.dataset.check);if(t){t.done=e.target.checked;save()}}});
document.querySelector("#roadmap").addEventListener("click",e=>{
 const id=e.target.dataset.edit||e.target.dataset.delete;if(!id)return;
 if(e.target.dataset.delete){if(confirm("Delete this task?")){data.tasks=data.tasks.filter(t=>t.id!==id);save()}return}
 const t=data.tasks.find(x=>x.id===id);if(t)openDialog(t);
});
const dialog=document.querySelector("#taskDialog");
function openDialog(task=null){
 document.querySelector("#dialogTitle").textContent=task?"Edit task":"Add a task";
 document.querySelector("#taskStage").value=task?.stage||"CCNA";
 document.querySelector("#taskName").value=task?.name||"";
 document.querySelector("#taskDetail").value=task?.detail||"";
 document.querySelector("#taskForm").dataset.editId=task?.id||"";
 dialog.showModal();
}
document.querySelector("#addBtn").onclick=()=>openDialog();
document.querySelector("#cancelBtn").onclick=()=>dialog.close();
document.querySelector("#taskForm").onsubmit=e=>{
 e.preventDefault();const id=e.currentTarget.dataset.editId;
 const item={id:id||crypto.randomUUID(),stage:document.querySelector("#taskStage").value,name:document.querySelector("#taskName").value.trim(),detail:document.querySelector("#taskDetail").value.trim(),done:false};
 if(!item.name)return;
 if(id){const old=data.tasks.find(t=>t.id===id);item.done=old?.done||false;data.tasks=data.tasks.map(t=>t.id===id?item:t)}else data.tasks.push(item);
 dialog.close();save();
};
document.querySelector("#notes").addEventListener("input",e=>{data.notes=e.target.value;localStorage.setItem(KEY,JSON.stringify(data))});
document.querySelector("#exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="netauto-tracker-backup.json";a.click();URL.revokeObjectURL(url);
};
document.querySelector("#importFile").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{const v=JSON.parse(await f.text());if(!Array.isArray(v.tasks))throw Error();data={tasks:v.tasks,notes:v.notes||""};save();alert("Backup imported.")}catch(err){alert("That backup file is not valid.")}e.target.value="";
};
document.querySelector("#resetBtn").onclick=()=>{if(confirm("Reset all tasks and notes to the starter roadmap? Export a backup first if needed.")){data={tasks:starter,notes:""};save()}};
let installPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;document.querySelector("#installBtn").classList.remove("hidden")});
document.querySelector("#installBtn").onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;document.querySelector("#installBtn").classList.add("hidden")};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
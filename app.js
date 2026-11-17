const KEY="tallyKhataV3";
let db=load();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{people:[],entries:[],expenses:[]}}catch{return {people:[],entries:[],expenses:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function money(n){return "৳"+Number(n||0).toLocaleString("bn-BD",{maximumFractionDigits:2})}
function dateNow(){return new Date().toISOString()}
function toast(s){let t=document.getElementById("toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function go(id){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("selected",x.dataset.tab===id));}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>go(b.dataset.tab));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
function balances(){let b={};db.people.forEach(p=>b[p.id]=0);db.entries.forEach(e=>{if(e.type==="sale")b[e.personId]=(b[e.personId]||0)+e.amount;if(e.type==="payment")b[e.personId]=(b[e.personId]||0)-e.amount;if(e.type==="purchase")b[e.personId]=(b[e.personId]||0)-e.amount;if(e.type==="paid")b[e.personId]=(b[e.personId]||0)+e.amount});return b}
function render(){
 const b=balances(),today=new Date().toDateString();
 let rec=0,pay=0;Object.values(b).forEach(v=>{if(v>0)rec+=v;else pay+=-v});
 let inc=db.entries.filter(e=>new Date(e.date).toDateString()===today&&(e.type==="payment"||e.type==="sale")).reduce((s,e)=>s+e.amount,0);
 let cost=db.expenses.filter(e=>new Date(e.date).toDateString()===today).reduce((s,e)=>s+e.amount,0);
 document.getElementById("receivable").textContent=money(rec);document.getElementById("payable").textContent=money(pay);document.getElementById("income").textContent=money(inc);document.getElementById("cost").textContent=money(cost);
 document.getElementById("totalEntries").textContent=db.entries.length.toLocaleString("bn-BD");document.getElementById("totalExpenses").textContent=money(db.expenses.reduce((s,e)=>s+e.amount,0));
 let sel=document.getElementById("entryPerson");sel.innerHTML=db.people.map(p=>`<option value="${p.id}">${esc(p.name)} (${p.type==="customer"?"কাস্টমার":"সাপ্লায়ার"})</option>`).join("")||'<option value="">আগে ব্যক্তি যোগ করুন</option>';
 document.getElementById("peopleList").innerHTML=db.people.map(p=>`<div class="person"><div><strong>${esc(p.name)}</strong><small>${p.type==="customer"?"কাস্টমার":"সাপ্লায়ার"} · ${esc(p.phone||"মোবাইল নেই")}<br>ব্যালেন্স: ${money(Math.abs(b[p.id]||0))} ${b[p.id]>0?"পাবেন":b[p.id]<0?"দেবেন":"সমান"}</small></div><button onclick="removePerson('${p.id}')">মুছুন</button></div>`).join("")||'<div class="empty">কোনো ব্যক্তি যোগ করা হয়নি</div>';
 const entryHtml=e=>{let p=db.people.find(x=>x.id===e.personId);return `<div class="entry"><div><strong>${esc(p?.name||"মুছে ফেলা ব্যক্তি")}</strong><small>${label(e.type)} · ${new Date(e.date).toLocaleString("bn-BD")}<br>${esc(e.note||"")}</small></div><div class="amount">${money(e.amount)}</div></div>`};
 document.getElementById("recent").innerHTML=db.entries.slice().reverse().slice(0,5).map(entryHtml).join("")||"এখনো কোনো লেনদেন নেই";
 document.getElementById("allEntries").innerHTML=db.entries.slice().reverse().map(entryHtml).join("")||"কোনো তথ্য নেই";
 document.getElementById("expenseList").innerHTML=db.expenses.slice().reverse().map(e=>`<div class="entry"><div><strong>${esc(e.title)}</strong><small>${new Date(e.date).toLocaleString("bn-BD")}</small></div><div class="amount">${money(e.amount)}</div></div>`).join("")||'<div class="empty">এখনো কোনো খরচ নেই</div>';
}
function label(t){return ({sale:"বাকি দিয়েছেন",payment:"জমা পেয়েছেন",purchase:"বাকিতে কিনেছেন",paid:"পরিশোধ করেছেন"})[t]||t}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.getElementById("addPerson").onclick=()=>{let name=personName.value.trim();if(!name)return toast("নাম লিখুন");db.people.push({id:crypto.randomUUID(),name,phone:personPhone.value.trim(),type:personType.value});personName.value="";personPhone.value="";save();toast("ব্যক্তি সংরক্ষিত হয়েছে")};
window.removePerson=id=>{if(!confirm("এই ব্যক্তিকে মুছে ফেলবেন? পুরোনো লেনদেন থাকবে।"))return;db.people=db.people.filter(p=>p.id!==id);save()};
document.getElementById("saveEntry").onclick=()=>{let personId=entryPerson.value,amount=Number(entryAmount.value);if(!personId)return toast("আগে ব্যক্তি যোগ করুন");if(!(amount>0))return toast("সঠিক টাকার পরিমাণ দিন");db.entries.push({id:crypto.randomUUID(),personId,type:entryType.value,amount,note:entryNote.value.trim(),date:dateNow()});entryAmount.value="";entryNote.value="";save();toast("লেনদেন সংরক্ষিত হয়েছে")};
document.getElementById("saveExpense").onclick=()=>{let title=expenseTitle.value.trim(),amount=Number(expenseAmount.value);if(!title||!(amount>0))return toast("খাত ও সঠিক পরিমাণ লিখুন");db.expenses.push({id:crypto.randomUUID(),title,amount,date:dateNow()});expenseTitle.value="";expenseAmount.value="";save();toast("খরচ সংরক্ষিত হয়েছে")};
document.getElementById("exportBtn").onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tally-khata-backup.json";a.click();URL.revokeObjectURL(a.href);toast("ব্যাকআপ ডাউনলোড শুরু হয়েছে")};
document.getElementById("importBtn").onclick=()=>importFile.click();
document.getElementById("importFile").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.people)||!Array.isArray(x.entries)||!Array.isArray(x.expenses))throw 0;if(!confirm("বর্তমান ডেটা প্রতিস্থাপন করবেন?"))return;db=x;save();toast("ব্যাকআপ ফিরিয়ে আনা হয়েছে")}catch{toast("ব্যাকআপ ফাইলটি সঠিক নয়")}e.target.value=""};
document.getElementById("printBtn").onclick=()=>window.print();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
let installPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false});installBtn.onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true};
render();
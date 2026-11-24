const KEY='survivor_clone_v1';
const Save={d:null,def:()=>({coins:500,owned:{},shiny:{},ach:{},best:{time:0,kills:0},tk:0,boss:0,sel:4,set:{vol:.5,mute:false}}),
 load(){try{this.d=Object.assign(this.def(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){this.d=this.def()}
  if(!Object.keys(this.d.owned).length)this.d.owned[4]=1;Snd.vol=this.d.set.vol;Snd.mute=this.d.set.mute},
 save(){try{localStorage.setItem(KEY,JSON.stringify(this.d))}catch(e){}},
 checkAch(bt=0){const s={tk:this.d.tk,bt,boss:this.d.boss,sh:Object.keys(this.d.shiny).length,own:Object.keys(this.d.owned).length};
  ACH.forEach(a=>{if(!this.d.ach[a.id]&&a.t(s)){this.d.ach[a.id]=1;toast('🏆 '+a.n)}});this.save()}};
function toast(t){const e=document.createElement('div');e.textContent=t;e.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#000c;border:2px solid #ffd43b;padding:8px 14px;z-index:9';document.body.append(e);setTimeout(()=>e.remove(),2500)}

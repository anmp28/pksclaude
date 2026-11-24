const cv=document.getElementById('c'),cx=cv.getContext('2d'),UI=document.getElementById('ui'),HUD=document.getElementById('hud');
let W,H;function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();onresize=rs;
const keys={};onkeydown=e=>{keys[e.key.toLowerCase()]=1};onkeyup=e=>{keys[e.key.toLowerCase()]=0};
let touch=null;cv.onpointerdown=e=>{touch={x:e.clientX,y:e.clientY}};cv.onpointermove=e=>{if(touch&&e.buttons)touch.cur={x:e.clientX,y:e.clientY}};onpointerup=()=>touch=null;
let G=null,running=false,last=0;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const modal=h=>{UI.innerHTML=`<div class="modal">${h}</div>`};const closeM=()=>UI.innerHTML='';
// ---------- MENÚS ----------
function menu(){running=false;Snd.music(false);HUD.innerHTML='';const s=Save.d,m=ROSTER[s.sel-1];
 modal(`<h1>SURVIVOR CLONE</h1>${SpriteManager.html(m,s.shiny[m.id],72)}<p>${m.name} · ${m.types.join('/')} · ${MOVES[m.move].n}</p><p>💰 ${s.coins} · Récord ${Math.floor(s.best.time)}s / ${s.best.kills} kills</p>
 <button onclick="play()">▶ Jugar</button><button onclick="gachaUI()">🎰 Gacha</button><button onclick="dex()">📖 Pokédex</button><button onclick="achUI()">🏆 Logros</button><button onclick="setUI()">⚙ Ajustes</button>`)}
function gachaUI(msg=''){modal(`<h2>Gacha por región (100💰)</h2><p>💰 ${Save.d.coins}</p><p>${msg}</p>`+REGIONS.map(r=>`<button onclick="roll('${r[0]}')">${r[0]}</button>`).join('')+`<br><button onclick="menu()">Volver</button>`)}
function roll(reg){const s=Save.d;if(s.coins<100)return gachaUI('Monedas insuficientes');s.coins-=100;
 const pool=ROSTER.filter(p=>p.region===reg),w={common:60,uncommon:28,rare:10,legendary:2};let tot=pool.reduce((a,p)=>a+w[p.rarity],0),r=Math.random()*tot,got=pool[0];
 for(const p of pool){r-=w[p.rarity];if(r<=0){got=p;break}}const sh=Math.random()<SHINY_RATE;s.owned[got.id]=(s.owned[got.id]||0)+1;if(sh)s.shiny[got.id]=1;Snd.init();Snd.gacha(sh);Save.checkAch();
 modal(`<h2>${sh?'✨ ¡SHINY! ✨':'¡Nuevo!'}</h2>${SpriteManager.html(got,sh,96)}<p>${got.name} (${got.rarity})</p><button onclick="roll('${reg}')">Otra tirada</button><button onclick="gachaUI()">Volver</button>`)}
function dex(reg=0){const s=Save.d;modal(`<h2>Pokédex ${Object.keys(s.owned).length}/966 · ✨${Object.keys(s.shiny).length}</h2>`+REGIONS.map((r,i)=>`<button onclick="dex(${i})">${r[0]}</button>`).join('')+
 `<div class="grid">`+ROSTER.filter(p=>p.region===REGIONS[reg][0]).map(p=>`<div class="cell ${s.owned[p.id]?'own':''} ${s.shiny[p.id]?'sh':''}" ${s.owned[p.id]?`onclick="Save.d.sel=${p.id};Save.save();menu()"`:''}>${s.owned[p.id]?SpriteManager.html(p,s.shiny[p.id],40):'<div style="height:40px">?</div>'}${p.id} ${s.owned[p.id]?p.name:''}</div>`).join('')+`</div><button onclick="menu()">Volver</button>`)}
function achUI(){modal(`<h2>Logros</h2>`+ACH.map(a=>`<p>${Save.d.ach[a.id]?'🏆':'🔒'} <b>${a.n}</b> — ${a.d}</p>`).join('')+`<button onclick="menu()">Volver</button>`)}
function setUI(){const s=Save.d.set;modal(`<h2>Ajustes</h2><p>Volumen <input type="range" min="0" max="1" step=".05" value="${s.vol}" oninput="Save.d.set.vol=Snd.vol=+this.value;Save.save()"></p>
 <button onclick="Save.d.set.mute=Snd.mute=!Snd.mute;Save.save();setUI()">${s.mute?'🔇 Silenciado':'🔊 Sonido'}</button><p>Controles: WASD/flechas o arrastrar (táctil/ratón)</p><button onclick="if(confirm('¿Borrar todo?')){localStorage.removeItem(KEY);Save.load();menu()}">Borrar datos</button><button onclick="menu()">Volver</button>`)}
// ---------- PARTIDA ----------
function play(){Snd.init();Snd.music(!Snd.mute);closeM();const m=ROSTER[Save.d.sel-1],mv=MOVES[m.move];
 const reg=REGIONS.find(r=>r[0]===m.region);G={mon:m,sh:!!Save.d.shiny[m.id],t:0,kills:0,lv:1,xp:0,nx:5,paused:false,over:false,
  p:{x:0,y:0,hp:m.hp,mhp:m.hp,spd:m.spd,dm:mv.dmg,cd:mv.cd,ar:mv.ar,ct:mv.ct,pi:mv.pi,sp:mv.sp,mag:70,inv:0,fx:1},items:{},types:{},cool:0,en:[],pr:[],gems:[],spawn:0,nextBoss:60,reg,coins:0,cam:{x:0,y:0}};
 running=true;last=performance.now();requestAnimationFrame(loop)}
function spawnEnemy(boss){const g=G,a=rnd(0,6.283),d=Math.max(W,H)*.6,pool=ROSTER.filter(p=>p.id>=g.reg[1]&&p.id<=g.reg[2]),
 mon=boss?pick(pool.filter(p=>p.rarity==='legendary').concat(pool.filter(p=>p.rarity==='rare'))):pick(pool),k=1+g.t/60;
 g.en.push({x:g.p.x+Math.cos(a)*d,y:g.p.y+Math.sin(a)*d,mon,sh:Math.random()<SHINY_RATE,boss,hp:(boss?250:12)*k*(boss?1:1),mhp:(boss?250:12)*k,spd:(boss?60:rnd(50,80))*(1+g.t/400),sz:boss?72:34,dmg:boss?15:6,hit:0})}
function fire(){const g=G,p=g.p;let best=null,bd=1e12;for(const e of g.en){const d=(e.x-p.x)**2+(e.y-p.y)**2;if(d<bd){bd=d;best=e}}if(!best||bd>(500**2))return;
 const base=Math.atan2(best.y-p.y,best.x-p.x),n=Math.round(p.ct);Snd.shoot();
 for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*.18;g.pr.push({x:p.x,y:p.y,vx:Math.cos(a)*p.sp,vy:Math.sin(a)*p.sp,dm:p.dm,r:p.ar,pi:p.pi,life:1.6,hit:new Set(),col:TCOL[g.mon.move]})}}
function levelUp(){const g=G;g.paused=true;Snd.lvl();const opts=[];const pool=ITEMS.slice();while(opts.length<3&&pool.length)opts.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 modal(`<h2>¡Nivel ${g.lv}!</h2>`+opts.map((o,i)=>`<button class="opt" onclick="takeItem('${o.id}')">${o.n} (x${g.items[o.id]||0}) — ${o.d}</button>`).join(''))}
function takeItem(id){const g=G,it=ITEMS.find(i=>i.id===id);it.f(g.p);g.items[id]=(g.items[id]||0)+1;
 // sinergia de tipos: cada 3 objetos iguales de tipo del Pokémon → bonus
 const tt=g.mon.types[0];g.types[tt]=(g.types[tt]||0)+1;if(g.types[tt]%3===0){g.p.dm*=1.2;toast('Sinergia '+tt+': +20% daño')}closeM();g.paused=false;last=performance.now()}
function end(){const g=G;g.over=true;running=false;Snd.die();Snd.music(false);const s=Save.d;s.coins+=g.coins+Math.floor(g.t/10);s.tk+=g.kills;s.best.time=Math.max(s.best.time,g.t);s.best.kills=Math.max(s.best.kills,g.kills);Save.checkAch(g.t);
 modal(`<h2>Derrotado</h2><p>Tiempo ${Math.floor(g.t)}s · Kills ${g.kills} · +${g.coins+Math.floor(g.t/10)}💰</p><button onclick="play()">Reintentar</button><button onclick="menu()">Menú</button>`)}
function update(dt){const g=G,p=g.p;if(g.paused)return;g.t+=dt;
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(touch&&touch.cur){dx=touch.cur.x-touch.x;dy=touch.cur.y-touch.y;const l=Math.hypot(dx,dy)||1;if(l>10){dx/=l;dy/=l}else dx=dy=0}
 const l=Math.hypot(dx,dy)||1;if(dx||dy){p.x+=dx/l*p.spd*dt;p.y+=dy/l*p.spd*dt;if(dx)p.fx=Math.sign(dx)}p.inv-=dt;
 g.cam.x+=(p.x-g.cam.x)*Math.min(1,dt*6);g.cam.y+=(p.y-g.cam.y)*Math.min(1,dt*6);
 g.cool-=dt;if(g.cool<=0){fire();g.cool=p.cd}
 g.spawn-=dt;const rate=Math.max(.12,.9-g.t/150);if(g.spawn<=0&&g.en.length<250){const n=1+Math.floor(g.t/45);for(let i=0;i<n;i++)spawnEnemy(false);g.spawn=rate}
 if(g.t>=g.nextBoss){spawnEnemy(true);g.nextBoss+=60;toast('¡Jefe / legendario!')}
 for(const b of g.pr){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt}
 for(const e of g.en){const a=Math.atan2(p.y-e.y,p.x-e.x);e.x+=Math.cos(a)*e.spd*dt;e.y+=Math.sin(a)*e.spd*dt;e.hit-=dt;
  if(Math.hypot(e.x-p.x,e.y-p.y)<e.sz/2+14&&p.inv<=0){p.hp-=e.dmg;p.inv=.5;Snd.hit();if(p.hp<=0)return end()}
  for(const b of g.pr){if(b.pi<0||b.hit.has(e))continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.sz/2+b.r){b.hit.add(e);e.hp-=b.dm;e.hit=.1;b.pi--;Snd.hit()}}}
 for(const e of g.en)if(e.hp<=0){e.dead=1;g.kills++;if(e.boss){Save.d.boss++;g.coins+=50}g.gems.push({x:e.x,y:e.y,v:e.boss?20:1});if(e.sh&&!Save.d.shiny[e.mon.id]){Save.d.shiny[e.mon.id]=1;Save.d.owned[e.mon.id]=Save.d.owned[e.mon.id]||1;toast('✨ ¡Shiny registrado!')}}
 g.en=g.en.filter(e=>!e.dead);g.pr=g.pr.filter(b=>b.life>0&&b.pi>=0);
 for(const q of g.gems){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<p.mag){q.x+=(p.x-q.x)/d*300*dt;q.y+=(p.y-q.y)/d*300*dt}if(d<16){q.got=1;g.xp+=q.v;Snd.gem();g.coins+=q.v>1?5:0}}
 g.gems=g.gems.filter(q=>!q.got);if(g.xp>=g.nx){g.xp-=g.nx;g.lv++;g.nx=Math.floor(g.nx*1.35+3);levelUp()}}
function draw(){const g=G,p=g.p,ox=W/2-g.cam.x,oy=H/2-g.cam.y;cx.fillStyle='#2b3a2b';cx.fillRect(0,0,W,H);cx.strokeStyle='#ffffff12';cx.lineWidth=1;
 for(let x=-(g.cam.x%64);x<W;x+=64){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}for(let y=-(g.cam.y%64);y<H;y+=64){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}
 cx.fillStyle='#74c0fc';for(const q of g.gems){cx.fillRect(q.x+ox-3,q.y+oy-3,6,6)}
 for(const b of g.pr){cx.fillStyle=b.col;cx.beginPath();cx.arc(b.x+ox,b.y+oy,b.r/2,0,6.283);cx.fill()}
 for(const e of g.en){if(e.x+ox<-80||e.x+ox>W+80||e.y+oy<-80||e.y+oy>H+80)continue;SpriteManager.draw(cx,e.mon,e.sh,e.x+ox,e.y+oy,e.sz,g.t,e.x<p.x);
  if(e.boss){cx.fillStyle='#000';cx.fillRect(e.x+ox-30,e.y+oy-e.sz/2-8,60,5);cx.fillStyle='#fa5252';cx.fillRect(e.x+ox-30,e.y+oy-e.sz/2-8,60*e.hp/e.mhp,5)}}
 if(p.inv>0&&Math.floor(g.t*20)%2)cx.globalAlpha=.4;SpriteManager.draw(cx,g.mon,g.sh,p.x+ox,p.y+oy,44,g.t,p.fx<0);cx.globalAlpha=1;
 HUD.innerHTML=`<div class="bar"><i style="width:${100*g.xp/g.nx}%;background:#74c0fc"></i></div><div class="bar" style="width:220px"><i style="width:${100*Math.max(0,p.hp)/p.mhp}%;background:#ff6b6b"></i></div>Nv ${g.lv} · ⏱ ${Math.floor(g.t/60)}:${String(Math.floor(g.t%60)).padStart(2,'0')} · ☠ ${g.kills} · 💰 ${g.coins}`}
function loop(now){if(!running)return;const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);if(running)draw();requestAnimationFrame(loop)}
Save.load();menu();

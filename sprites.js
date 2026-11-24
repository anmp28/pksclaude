// ===== SpriteManager: AQUÍ se enchufan PMD SpriteCollab y Edición Reloaded =====
// {key}=id de 4 dígitos, {v}='normal'|'shiny'. Se prueban las fuentes en orden.
const SPRITE_CONFIG={
 sources:[{name:'pmd',path:'assets/sprites/pmd/{key}/{v}.png'},{name:'reloaded',path:'assets/sprites/reloaded/{key}_{v}.png'}],
 // Hojas: sheets['0025']={cols:4,rows:8,fw:40,fh:40,anim:{idle:[0,1,2,3]}}. Sin entrada = sprite individual.
 sheets:{default:{cols:1,rows:1,fw:0,fh:0,anim:{idle:[0]}}},
 overrides:{} // overrides['0025_shiny']='https://.../sprite.png'
};
const SpriteManager={cache:{},
 _load(key,v){const k=key+'_'+v;if(this.cache[k])return this.cache[k];const e=this.cache[k]={img:null,state:'loading'};
  const urls=SPRITE_CONFIG.overrides[k]?[SPRITE_CONFIG.overrides[k]]:SPRITE_CONFIG.sources.map(s=>s.path.replace('{key}',key).replace('{v}',v));
  const go=i=>{if(i>=urls.length){e.state='missing';return}const im=new Image();im.onload=()=>{e.img=im;e.state='ok'};im.onerror=()=>go(i+1);im.src=urls[i]};go(0);return e},
 // Si no hay sprite: marcador limpio "#ID" (nunca un dibujo del Pokémon).
 draw(ctx,mon,shiny,x,y,s,t,flip){const key=mon.sprite.key,e=this._load(key,shiny?'shiny':'normal');
  if(e.state==='ok'){const sh=SPRITE_CONFIG.sheets[key]||SPRITE_CONFIG.sheets.default,im=e.img,fw=sh.fw||im.width/sh.cols,fh=sh.fh||im.height/sh.rows;
   const fr=sh.anim.idle,f=fr[Math.floor(t*8)%fr.length],sx=(f%sh.cols)*fw,sy=Math.floor(f/sh.cols)*fh;
   ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.imageSmoothingEnabled=false;ctx.drawImage(im,sx,sy,fw,fh,-s/2,-s/2,s,s*fh/fw);ctx.restore();return}
  ctx.save();ctx.globalAlpha=e.state==='loading'?.4:.85;ctx.strokeStyle=shiny?'#f783ac':'#fff';ctx.setLineDash([3,3]);ctx.strokeRect(x-s/2,y-s/2,s,s);ctx.setLineDash([]);
  ctx.fillStyle='#fff';ctx.font=`${Math.max(9,s/3)}px 'Pixelify Sans',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('#'+mon.id,x,y);ctx.restore()},
 html(mon,shiny,s=48){const e=this._load(mon.sprite.key,shiny?'shiny':'normal');
  return e.state==='ok'?`<img src="${e.img.src}" width="${s}" height="${s}" style="object-fit:contain;image-rendering:pixelated">`:`<div style="width:${s}px;height:${s}px;border:1px dashed #889;display:flex;align-items:center;justify-content:center;font-size:12px;margin:auto">#${mon.id}</div>`}};

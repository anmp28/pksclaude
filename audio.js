const Snd={ctx:null,vol:.5,mute:false,mus:null,
 init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()},
 tone(f,d,type='square',v=.15,slide=0){if(this.mute||!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;if(slide)o.frequency.linearRampToValueAtTime(Math.max(40,f+slide),c.currentTime+d);
  g.gain.value=Math.max(.0002,v*this.vol);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+d)},
 shoot(){this.tone(500,.08,'square',.05,-200)},hit(){this.tone(180,.06,'sawtooth',.06)},gem(){this.tone(900,.07,'triangle',.07,300)},
 lvl(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.tone(f,.15,'square',.12),i*90))},gacha(s){[400,500,600,800].forEach((f,i)=>setTimeout(()=>this.tone(f*(s?1.5:1),.12,'triangle',.15),i*100))},die(){this.tone(300,.6,'sawtooth',.2,-250)},
 music(on){clearInterval(this.mus);if(!on)return;const sc=[220,262,294,330,392,330,294,262];let i=0;this.mus=setInterval(()=>{this.tone(sc[i%8]/(i%16<8?2:1),.3,'triangle',.06);i++},300)}};

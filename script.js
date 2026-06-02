const notes = { C4:261.63,D4:293.66,E4:329.63,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5 };
let audioCtx, master, enabled = false;
const permission = document.getElementById('soundPermission');
const cylinder = document.getElementById('cylinder');
const windKey = document.getElementById('windKey');
const glow = document.getElementById('cursorGlow');

function initAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain(); master.gain.value = 0.42; master.connect(audioCtx.destination);
}
function unlock(){ initAudio(); audioCtx.resume(); enabled = true; permission.textContent = 'звук включен'; permission.classList.add('active'); playMelody(['C5','E5','G5','C6'], .09); }
permission.addEventListener('click', unlock);

document.addEventListener('pointermove', e=>{ glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px'; });

function pluck(note='C5', type='metal'){
  initAudio(); if(audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime, f = notes[note] || notes.C5;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const delay = audioCtx.createDelay();
  const feedback = audioCtx.createGain();
  const wet = audioCtx.createGain();
  osc.type = type === 'wood' ? 'triangle' : type === 'bass' ? 'sine' : 'sine';
  osc.frequency.setValueAtTime(f, now);
  osc.frequency.exponentialRampToValueAtTime(f * (type==='wind' ? .985 : 1.008), now + .18);
  filter.type = 'bandpass'; filter.frequency.value = type === 'glass' ? f*3 : type === 'wood' ? f*1.6 : f*2.2; filter.Q.value = type === 'bass' ? 4 : 11;
  gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(type==='bass'?0.55:0.34, now+.012); gain.gain.exponentialRampToValueAtTime(0.0001, now + (type==='glass'?1.8:type==='wood'?1.1:.95));
  delay.delayTime.value = type==='glass'?.18:.12; feedback.gain.value = type==='bass'?.18:.28; wet.gain.value = .18;
  osc.connect(filter); filter.connect(gain); gain.connect(master); gain.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(master);
  osc.start(now); osc.stop(now+2);
}
function playMelody(seq, step=.16){ seq.forEach((n,i)=>setTimeout(()=>pluck(n, i%3===0?'glass':'metal'), i*step*1000)); }

for(let i=0;i<36;i++){ const p=document.createElement('b'); p.className='pin'; p.style.left=(6+Math.random()*88)+'%'; p.style.top=(12+Math.random()*70)+'%'; p.style.animationDelay=(Math.random()*2)+'s'; document.getElementById('pinGrid').appendChild(p); }

document.querySelectorAll('[data-note]').forEach(el=>{
  el.addEventListener('click',()=>{
    if(!enabled) unlock();
    const type = el.dataset.type || 'metal'; pluck(el.dataset.note, type);
    el.classList.add('playing'); setTimeout(()=>el.classList.remove('playing'),220);
  });
});
windKey.addEventListener('click',()=>{ if(!enabled) unlock(); windKey.classList.add('turn'); cylinder.classList.add('spin'); playMelody(['C5','D5','E5','G5','E5','A5','G5','C6'], .12); setTimeout(()=>{windKey.classList.remove('turn'); cylinder.classList.remove('spin')},1200); });
cylinder.addEventListener('click',()=>{ if(!enabled) unlock(); cylinder.classList.add('spin'); playMelody(['A4','C5','E5','G5','A5'], .11); setTimeout(()=>cylinder.classList.remove('spin'),1000); });

const io = new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting)e.target.classList.add('visible') }), {threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

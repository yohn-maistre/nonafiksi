// NonaFiksi engine — manifest-driven pixel world. NF.init(bundle) boots it.
// Worlds are DATA: catalog.json defines components, aksara/*.json define
// scenes. See docs/PLAN.md Wave 1 and .claude/NORTH-STAR.md (world grammar).
"use strict";
const NF = (() => {

// ---------- palette / ramps ----------
const C = { kopi:'#1a120d', kayu:'#2a1d14', kayu2:'#3a2a1c', kayu3:'#241812',
  batu:'#241a12', batu2:'#2f2317', kertas:'#f2e8d5', kertas2:'#e4d5b8',
  tinta:'#303b7a', tinta2:'#4a57a8', terakota:'#c4553b', kunyit:'#e3a62f',
  langit:'#0e0b1a', gelap:'#141311', daun:'#2e4b46' };
const RAMP_MALAM = [[14,11,26],[26,18,13],[36,24,18],[42,29,20],[58,42,28],
  [74,50,34],[90,64,48],[122,106,80],[169,107,69],[201,138,94],[228,213,184],
  [242,232,213],[48,59,122],[74,87,168],[196,85,59],[227,166,47],[46,75,70],[140,59,46]];
// phase: sprites raw by day (playtest verdict: pack vibrancy reads great in
// daylight), graded at night; overlays tint the hours in between.
const PHASES = ['pagi','siang','sore','malam'];
const OVERLAY = { pagi:'rgba(255,170,190,.08)', siang:'rgba(255,220,150,.05)',
  sore:'rgba(255,130,60,.13)', malam:null };
const phaseOfHour = h => (h>=5&&h<10)?'pagi':(h>=10&&h<15)?'siang':(h>=15&&h<18)?'sore':'malam';

// ---------- custom sprites (string maps, house style) ----------
const PAL = {'.':null,'k':'#241610','K':'#4a3222','s':'#c98a5e','S':'#a96b45',
 'e':'#2a1b12','m':'#8c3b2e','t':C.terakota,'i':C.tinta,'I':C.tinta2,
 'c':C.kertas,'C':C.kertas2,'g':C.kunyit,'d':C.daun,'w':C.kayu2,'W':C.kayu3,'x':C.gelap};
const MAPS = {
 nona: ["......kkkkk.g.....",".....kkkkkkkg.....",".....kkkkkkkk.....","....kkkkkkkkkk....",
  "....kksssssskk....","...kksssssssskk...","...kkseesseeskk...","...kksssssssskk...",
  "....ksssmmsssk....",".....ssssssss.....",".......ssss.......",".....iissssii.....",
  "....iiiissiiii....","...iiiiicciiiii...","...iiiiicciiiii...","..iiiiiiggiiiiii..",
  "..iiiiiicciiiiii..","..iiiiiicciiiiii.."],
 nonaApron: ["......kkkkk.g.....",".....kkkkkkkg.....",".....kkkkkkkk.....","....kkkkkkkkkk....",
  "....kksssssskk....","...kksssssssskk...","...kkseesseeskk...","...kksssssssskk...",
  "....ksssmmsssk....",".....ssssssss.....",".......ssss.......",".....iiccccii.....",
  "....iiccccccii....","...iiccCccCccii...","...iicccccccii....","..iiicccggccciii..",
  "..iiiccccccccIii..","..iiiccccccccIii.."],
 cakeRack: ["xxxxxxxxxxxxxxxxxxxx","xCCCCCCCCCCCCCCCCCCx","xC.tt..ggg..cc.mm.Cx","xC.tt..ggg..cc.mm.Cx",
  "xCCCCCCCCCCCCCCCCCCx","xC.cc..tt..gg..cc.Cx","xC.cc..tt..gg..cc.Cx","xCCCCCCCCCCCCCCCCCCx",
  "xWWWWWWWWWWWWWWWWWWx","xxxxxxxxxxxxxxxxxxxx"],
 coffeeMachine: ["..xxxxxxxx..",".xxxxxxxxxx.",".xggxxxxggx.",".xxxxxxxxxx.",".xxxCCxxxxx.",
  ".xxxCCxxttx.",".xxxxxxxxxx.","..xcc..cc...","..xcc..cc...",".WWWWWWWWWW."],
 chair: ["..wwwwww....","..wwwwww....","..ww........","..wwwwwwww..","..wwwwwwww..","..ww....ww..","..ww....ww.."],
 rak: ["CCCCCCCCCCCCCCCCCCCCCCCC","CttttttttttttttttttttttC","WWWWWWWWWWWWWWWWWWWWWWWW",
  ".WW..................WW.",".WW..................WW."],
 poster: ["xxxxxxxxxxxxxx","xccccccccccccx","xciiiiiiiiiccx","xccccccccccccx","xcttttttttccx".replace('x','xx').slice(0,14),
  "xccccccccccccx","xciiiiiiiccccx","xxxxxxxxxxxxxx"],
 frame: ["xxxxxxxxxx","xccccccccx","xcggssggcx","xcgssssgcx","xccccccccx","xxxxxxxxxx"],
 musicBox: ["..xxxxxxxx..",".xxWWWWWWxx.",".xWggggggWx.",".xWgxxxxgWx.",".xWggggggWx.",".xxWWWWWWxx.","..xxxxxxxx.."],
 bed: ["xWWWWWWWWWWWWWWWWWWWWWWx","xWccccccWWWWWWWWWWWWWWWx","xWccccccttttttttttttttWx",
  "xWccccccttttttttttttttWx","xWccccccttttttttttttttWx","xWWWWWWWWWWWWWWWWWWWWWWx",
  "xW....................Wx","xW....................Wx"],
 tanaman: ["....dd......","..dddddd....","..dddddd....","....dd......","...tttt.....","...tttt....."],
 lampuJalan: ['.ggggg.','.gxxxg.','.ggggg.',...Array(18).fill('..xxx..'),'.xxxxx.'],
 lampuGantung: ['......xx......','......xx......','......xx......','...gggggggg...','..gggggggggg..','..xxxxxxxxxx..'],
 papan: ['xxxxxxxxxxxx','xccccccccccx','xciiiiiiiicx','xccccccccccx','xciiiiiiiicx','xccccccccccx','xxxxxxxxxxxx','....xx......','....xx......'],
 meja: ['W'.repeat(38),'W'+'w'.repeat(36)+'W','W'.repeat(38),'.WW'+'.'.repeat(32)+'WW.','.WW'+'.'.repeat(32)+'WW.'],
 cangkir: ['ccccc.','cCCCcc','cCCCcc','ccccc.','.ccc..'],
 menuBesar: ['x'.repeat(34),'x'+'c'.repeat(32)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'i'.repeat(18)+'c'.repeat(12)+'x',
   'x'+'c'.repeat(32)+'x','xcc'+'C'.repeat(24)+'c'.repeat(6)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'C'.repeat(20)+'c'.repeat(10)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'C'.repeat(24)+'c'.repeat(6)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'C'.repeat(16)+'c'.repeat(14)+'x','x'+'c'.repeat(32)+'x','x'.repeat(34)]
};
function spr(map, pal) { pal = pal || PAL;
  const w = Math.max(...map.map(r=>r.length)), h = map.length,
    oc = document.createElement('canvas'); oc.width = w; oc.height = h;
  const o = oc.getContext('2d');
  map.forEach((r,y)=>{ for(let x=0;x<r.length;x++){ const c=pal[r[x]||'.'];
    if(c){ o.fillStyle=c; o.fillRect(x,y,1,1); } } });
  return oc; }

// ---------- asset loading + grading ----------
const A = { raw:{}, malam:{}, custom:{} };
function gradeImg(img) {
  const oc=document.createElement('canvas'); oc.width=img.width; oc.height=img.height;
  const o=oc.getContext('2d'); o.drawImage(img,0,0);
  const d=o.getImageData(0,0,oc.width,oc.height), p=d.data;
  for(let i=0;i<p.length;i+=4){ if(p[i+3]<120){p[i+3]=0;continue;}
    let br=0,bd=1e9; for(let r=0;r<RAMP_MALAM.length;r++){
      const a=p[i]-RAMP_MALAM[r][0],b=p[i+1]-RAMP_MALAM[r][1],c2=p[i+2]-RAMP_MALAM[r][2];
      const dist=a*a*2+b*b*3+c2*c2; if(dist<bd){bd=dist;br=r;} }
    p[i]=RAMP_MALAM[br][0];p[i+1]=RAMP_MALAM[br][1];p[i+2]=RAMP_MALAM[br][2];p[i+3]=255; }
  o.putImageData(d,0,0); return oc; }
function loadSheets(srcMap) {
  return Promise.all(Object.entries(srcMap).map(([k,u])=>new Promise(res=>{
    const im=new Image(); im.onload=()=>{ const oc=document.createElement('canvas');
      oc.width=im.width; oc.height=im.height; oc.getContext('2d').drawImage(im,0,0);
      A.raw[k]=oc; A.malam[k]=gradeImg(im); res(); }; im.src=u; })));
}

// ---------- state ----------
const st = { scene:null, x:0, y:0, dir:'down', frame:0, ft:0, moving:false,
  fading:false, phaseOverride:null, dlg:null, kopi:3 };
const persona = { get(){ try{return JSON.parse(localStorage.nf_persona||'null');}catch(e){return null;} },
  set(p){ localStorage.nf_persona = JSON.stringify(p); } };

let CATALOG={}, SCENES={}, cvs, X, ui={};
const phase = () => st.phaseOverride || phaseOfHour(new Date().getHours());
const sheets = () => phase()==='malam' ? A.malam : A.raw;
const img = k => k.startsWith('custom:') ? A.custom[k.slice(7)] : sheets()[k];

// ---------- drawing ----------
function rect(c,x,y,w,h){ X.fillStyle=c; X.fillRect(x|0,y|0,w|0,h|0); }
function glow(cx,cy,r,a){ const g=X.createRadialGradient(cx,cy,2,cx,cy,r);
  g.addColorStop(0,'rgba(227,166,47,'+a+')'); g.addColorStop(1,'rgba(227,166,47,0)');
  X.fillStyle=g; X.fillRect(cx-r,cy-r,r*2,r*2); }
const rnd=(x,y)=>((x*73+y*151)%97)/97;
// FIXED (playtest: beyblade bug): Ninja Walk.png = cols are directions, rows frames
const DIRCOL={down:0,up:1,left:2,right:3};
function drawChar(k,x,y,dir,frame){
  X.drawImage(img(k),DIRCOL[dir]*16,(frame%4)*16,16,16,(x-8)|0,(y-16)|0,16,16); }

const GROUNDS = {
 street(sc,t){ rect(C.batu,0,0,sc.W,sc.H);
   for(let y=0;y<sc.H;y+=6)for(let x=0;x<sc.W;x+=6)
     if(rnd(x,y)>.82)rect('rgba(0,0,0,.2)',x+(rnd(y,x)*4|0),y+(rnd(x+1,y)*4|0),2,1);
   const p=sc.path||[40,64]; rect(C.batu2,p[0],0,p[1],sc.H);
   for(let y=0;y<sc.H;y+=6)for(let x=p[0]+2;x<p[0]+p[1]-2;x+=6)
     if(rnd(x,y)>.86)rect('rgba(242,232,213,.05)',x,y,3,1); },
 interior(sc,t){ const wh=sc.wallH||56;
   rect(C.kayu,0,0,sc.W,wh);
   for(let y=12;y<wh;y+=14)rect('rgba(0,0,0,.18)',0,y,sc.W,1);
   rect(C.kayu2,0,wh,sc.W,sc.H-wh);
   for(let y=wh+6;y<sc.H;y+=22)rect('rgba(0,0,0,.22)',0,y,sc.W,1);
   for(let x=0;x<sc.W;x+=26)rect('rgba(0,0,0,.12)',x,wh,1,sc.H-wh); }
};

const FX = {
 glowFlicker(pl,t){ glow(pl.x+(pl.gx||0),pl.y+(pl.gy||0),pl.r||26,(pl.a||.22)+.03*Math.sin(t/290+pl.x)); },
 pool(pl,t){ X.fillStyle='rgba(227,166,47,.08)'; X.beginPath();
   X.ellipse(pl.x+(pl.gx||0),pl.y+(pl.py||24),13,5,0,0,7); X.fill(); },
 stars(pl,t){ X.fillStyle='#cfd4ea';
   for(let i=0;i<5;i++){ if(((t/400|0)+i)%4)
     X.fillRect(pl.x+3+((i*13)%(pl.w-8)),pl.y+3+((i*29)%(pl.h-8)),1,1); } },
 steam(pl,t){ X.fillStyle='rgba(242,232,213,.5)';
   for(let j=0;j<3;j++){ const p=((t/900)+j*.33+pl.x)%1;
     if(p<.9)X.fillRect(pl.x+2*Math.sin(p*6+j)|0,pl.y-p*11|0,1,1); } },
 smoke(pl,t){ X.fillStyle='rgba(180,170,160,.28)';
   for(let j=0;j<4;j++){ const p=((t/1600)+j*.25+pl.x*.01)%1;
     if(p<.92)X.fillRect(pl.x+3*Math.sin(p*5+j)|0,pl.y-p*22|0,2,2); } },
 rays(pl,t){ if(phase()==='pagi'||phase()==='siang'){
   X.save(); X.globalAlpha=.10+.03*Math.sin(t/1400);
   X.fillStyle='#ffe9b0';
   X.beginPath(); X.moveTo(pl.x,pl.y); X.lineTo(pl.x+(pl.w||40),pl.y);
   X.lineTo(pl.x+(pl.w||40)+(pl.dx||26),pl.y+(pl.len||60));
   X.lineTo(pl.x+(pl.dx||26),pl.y+(pl.len||60)); X.fill(); X.restore(); } },
 fireflies(pl,t){ if(phase()!=='malam')return;
   for(let i=0;i<(pl.n||6);i++){ const p=(t/2600+i*.37)%1;
     if(((t/240|0)+i)%3){ X.fillStyle='rgba(227,166,47,.8)';
       X.fillRect(pl.x+((i*19)%pl.w)+9*Math.sin(p*6.3+i)|0,pl.y+((i*67)%pl.h)-6*Math.sin(p*12)|0,1,1); } } },
 bunting(pl,t){ for(let x=pl.x;x<pl.x+pl.w;x+=12){ rect('#191009',x,pl.y,12,1);
   rect([C.terakota,C.kunyit,C.tinta][((x/12)|0)%3],x+3,pl.y+1,5,4); } },
 window(pl,t){ const ph=phase(), w=pl.w||40, h=pl.h||30;
   rect(C.gelap,pl.x,pl.y,w,h);
   const sky={pagi:'#e8b7a0',siang:'#bcd4e6',sore:'#e88a50',malam:C.langit}[ph];
   rect(sky,pl.x+3,pl.y+3,w-6,h-6);
   if(ph==='malam'){ X.fillStyle='#cfd4ea'; for(let i=0;i<4;i++){
     if(((t/400|0)+i)%4)X.fillRect(pl.x+5+((i*11)%(w-10)),pl.y+5+((i*17)%(h-10)),1,1); } }
   rect(C.gelap,pl.x+(w/2|0)-1,pl.y+3,3,h-6); rect(C.gelap,pl.x+3,pl.y+(h/2|0),w-6,2);
   if(ph==='pagi'||ph==='siang')FX.rays({x:pl.x,y:pl.y+h,w:w,dx:20,len:56},t); }
};

// parametric scene pieces (counters, shelves, mats) — data-driven via sc.decos
const DECOS = {
 counter(d,t){ rect(C.kayu3,d.x,d.y,d.w,8); rect('#191009',d.x,d.y+8,d.w,2);
   rect(C.kayu,d.x+4,d.y+10,d.w-8,12); rect('rgba(0,0,0,.2)',d.x+4,d.y+15,d.w-8,1); },
 shelfJars(d,t){ rect(C.kayu3,d.x,d.y+10,d.w,3);
   [C.tinta,C.terakota,C.kunyit].forEach((c,i)=>rect(c,d.x+4+i*11,d.y+(i%2?2:0),7,10-(i%2?2:0))); },
 doormat(d,t){ rect('#191009',d.x,d.y,d.w,9); rect(C.terakota,d.x+2,d.y+2,d.w-4,5); }
};

function drawScene(sc,t){
  (GROUNDS[sc.ground]||GROUNDS.street)(sc,t);
  (sc.decos||[]).forEach(d=>DECOS[d.type]&&DECOS[d.type](d,t));
  const ents=[];
  sc.placements.forEach(pl=>{
    const c=CATALOG[pl.component]; if(!c)return;
    const draw = ()=>{ if(c.custom)X.drawImage(A.custom[c.custom],pl.x,pl.y);
      else if(c.sheet)X.drawImage(img(c.sheet),c.sx,c.sy,c.w,c.h,pl.x,pl.y,c.w,c.h);
      (c.fx||[]).forEach(f=>FX[f]&&FX[f]({...pl,w:c.w||16,h:c.h||16,...(c.fxArgs||{})},t)); };
    if(c.flat)draw(); else ents.push({y:pl.y+(c.h||(A.custom[c.custom]||{}).height||16),draw});
  });
  (sc.npcs||[]).forEach(n=>{
    if(!n.static&&n.y1){ n.y=(n.y??n.y0)+(n.dirDown?1:-1)*22/60;
      if(n.y>n.y1)n.dirDown=false; if(n.y<n.y0)n.dirDown=true; }
    const h=n.custom?(A.custom[n.custom]||{}).height||18:0;
    ents.push({y:n.custom?n.y+h:n.y,draw:()=>n.custom
      ?X.drawImage(A.custom[n.custom],n.x,n.y)
      :drawChar(n.k,n.x,n.y,n.static||(n.dirDown?'down':'up'),n.static?0:(t/180|0)%4)});
  });
  (sc.fx||[]).forEach(f=>FX[f.type]&&FX[f.type](f,t));
  ents.filter(e=>e.y<=st.y).sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  drawChar(st.playerSheet||'boy',st.x,st.y,st.dir,st.moving?st.frame:0);
  ents.filter(e=>e.y>st.y).sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
}

// ---------- collision / zones ----------
function hits(sc,x,y){ const bx=x-5,by=y-5;
  return (sc.colliders||[]).some(c=>bx<c[0]+c[2]&&bx+10>c[0]&&by<c[1]+c[3]&&by+5>c[1]); }
const inZone=(z)=>z&&st.x>z.x&&st.x<z.x+z.w&&st.y>z.y-6&&st.y<z.y+z.h+10;
function nearestInteract(sc){
  let best=null,bd=1e9;
  sc.placements.forEach(pl=>{ const c=CATALOG[pl.component];
    if(!c||!(pl.interact||c.interact))return;
    const cx=pl.x+(c.w||12)/2, cy=pl.y+(c.h||12);
    const d=Math.abs(cx-st.x)+Math.abs(cy-st.y);
    if(d<30&&d<bd){bd=d;best={...(c.interact||{}),...(pl.interact||{})};} });
  return best; }

// ---------- dialog (say / input / choices) — with playtest fixes ----------
function runScript(script,who){ st.dlg={script,i:0,who:who||'NONA AKSARA',typed:0}; stepDlg(); }
function stepDlg(){
  const d=st.dlg; if(!d)return closeDlg();
  const s=d.script[d.i];
  if(!s)return closeDlg();
  ui.dlg.classList.add('on'); ui.who.textContent=d.who;
  ui.dinput.style.display=s.input?'block':'none';
  ui.dchoices.innerHTML='';
  if(s.choices){ s.choices.forEach(ch=>{ const b=document.createElement('button');
      b.className='chc'+(ch.locked?' lock':''); b.textContent=ch.label;
      b.onpointerdown=e=>{e.preventDefault();e.stopPropagation();
        if(ch.locked){ui.dtxt.textContent=ch.lockedMsg||'Belum terbuka. ✦';d.typed=1e9;return;}
        d.i++; (ch.then||(()=>{}))(); if(st.dlg===d)stepDlg(); };
      ui.dchoices.appendChild(b); }); }
  d.typed=0; d.text=(typeof s.say==='function'?s.say():s.say)||'';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.typed=d.text.length;}
  ui.dtxt.textContent=d.text.slice(0,d.typed);
  if(s.input){ ui.dinput.value=''; ui.dinput.placeholder=s.placeholder||''; setTimeout(()=>ui.dinput.focus(),50); }
}
function advDlg(){ const d=st.dlg; if(!d)return;
  const s=d.script[d.i];
  if(d.typed<d.text.length){ d.typed=d.text.length; ui.dtxt.textContent=d.text; return; }
  if(s.choices)return; // must pick
  if(s.input){ const v=ui.dinput.value.trim(); if(!v)return ui.dinput.focus();
    (s.oninput||(()=>{}))(v); }
  if(s.action)s.action();
  d.i++; if(st.dlg===d)stepDlg(); }
function closeDlg(){ st.dlg=null; ui.dlg.classList.remove('on'); }

// ---------- popup (periksa — the Pokémon rule) ----------
function popup(p){ ui.ptitle.textContent=p.title||''; ui.pbody.textContent=p.body||'';
  ui.plink.style.display=p.url?'inline-block':'none';
  if(p.url){ui.plink.href=p.url;ui.plink.textContent='BUKA ▸ '+(p.linkLabel||new URL(p.url).hostname);}
  ui.pop.classList.add('on'); }

// ---------- scene switching / home generation ----------
function goto(name,sx,sy){ st.fading=true; ui.fade.classList.add('on');
  setTimeout(()=>{ st.scene=name; const sc=SCENES[name];
    st.x=sx??sc.spawn[0]; st.y=sy??sc.spawn[1];
    ui.loc.textContent=sc.name; ui.fade.classList.remove('on'); st.fading=false; },240); }
function generateHome(p){
  const links=(p.links||[]).slice(0,4);
  const sc={ name:'RUMAH '+(p.nama||'').toUpperCase(), ground:'interior', W:144,H:224,
    wallH:52, spawn:[72,190], path:[0,0],
    colliders:[[0,0,144,74],[0,0,5,224],[139,0,5,224],[14,150,26,10]],
    placements:[
      {component:'window-l',x:10,y:12},{component:'lampu-gantung',x:64,y:0},
      {component:'poster',x:104,y:14,interact:{type:'text',title:'Poster',body:(p.quote||'Ceritamu tetap milikmu. — Nona Aksara')}},
      {component:'kasur',x:12,y:52},{component:'tanaman',x:126,y:60},
      {component:'musik',x:110,y:150,interact:{type:'text',title:'Pemutar Musik',body:'V1: tautkan lagu favoritmu di sini. (Segera)'}},
      {component:'frame',x:52,y:16,interact:{type:'text',title:'Bingkai Foto',body:'Foto-fotomu akan dipajang di sini. (Unggah — segera)'}}],
    npcs:[], fx:[],
    exits:[{x:56,y:206,w:34,h:18,label:'✦ KELUAR',menu:true}] };
  links.forEach((l,i)=>{ sc.placements.push({component:'rak',x:20+ (i%2)*62, y:92+(i/2|0)*44,
    interact:{type:'link',title:l.label||('Tautan '+(i+1)),body:l.url,url:l.url}});
    sc.colliders.push([20+(i%2)*62,92+(i/2|0)*44,48,10]); });
  return sc; }

// ---------- input ----------
const keys={};
function bindUI(){
  document.querySelectorAll('.btn').forEach(b=>{ const k=b.dataset.k;
    b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;});
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false)); });
  const KM={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',ArrowUp:'U',w:'U',ArrowDown:'D',s:'D'};
  addEventListener('keydown',e=>{ if(document.activeElement===ui.dinput){ if(e.key==='Enter')advDlg(); return; }
    if(KM[e.key])keys[KM[e.key]]=true; if(e.key==='e'||e.key==='Enter')act(); });
  addEventListener('keyup',e=>{ if(KM[e.key])keys[KM[e.key]]=false; });
  ui.ctx.addEventListener('pointerdown',e=>{e.preventDefault();act();});
  ui.dlg.addEventListener('pointerdown',e=>{ if(e.target===ui.dinput||e.target.tagName==='BUTTON')return;
    e.preventDefault(); advDlg(); });         // FIX: tap dialog to advance
  ui.pclose.addEventListener('pointerdown',e=>{e.preventDefault();ui.pop.classList.remove('on');});
  ui.phasebtn.addEventListener('pointerdown',e=>{e.preventDefault();
    const order=[null,...PHASES]; st.phaseOverride=order[(order.indexOf(st.phaseOverride)+1)%order.length];
    ui.phasebtn.textContent=(st.phaseOverride||'auto').toUpperCase()+' ✦'; });
}
function act(){
  if(st.dlg){advDlg();return;}
  if(ui.pop.classList.contains('on')){ui.pop.classList.remove('on');return;}
  const sc=SCENES[st.scene];
  const ex=(sc.exits||[]).find(inZone);
  if(sc.talk&&inZone(sc.talk)){ (sc.onTalk||(()=>{}))(); return; }
  const it=nearestInteract(sc); if(it){ popup(it); return; }
  if(ex){ if(ex.menu)return (sc.onMenu||(()=>{}))(ex);
    if(ex.locked)return popup({title:'Terkunci',body:ex.locked});
    goto(ex.to,ex.sx,ex.sy); } }

// ---------- main loop ----------
let last=0,READY=false;
function loop(t){
  const dt=Math.min(32,t-last)/1000; last=t;
  if(!READY){requestAnimationFrame(loop);return;}
  const sc=SCENES[st.scene];
  st.moving=false;
  if(!st.dlg&&!st.fading&&!ui.pop.classList.contains('on')){
    let dx=(keys.R?1:0)-(keys.L?1:0),dy=(keys.D?1:0)-(keys.U?1:0);
    if(dx&&dy){dx*=.72;dy*=.72;}
    if(dx||dy){st.moving=true;
      st.dir=Math.abs(dy)>=Math.abs(dx)?(dy>0?'down':'up'):(dx>0?'right':'left');
      const nx=Math.max(8,Math.min(sc.W-8,st.x+dx*56*dt)),
            ny=Math.max(12,Math.min(sc.H-3,st.y+dy*56*dt));
      if(!hits(sc,nx,st.y))st.x=nx; if(!hits(sc,st.x,ny))st.y=ny; } }
  st.ft+=dt; if(st.ft>.14){st.ft=0;st.frame=(st.frame+1)%4;}
  // context button — FIX: stays live as LANJUT while dialog is open
  const ex=(sc.exits||[]).find(inZone), talk=sc.talk&&inZone(sc.talk), it=nearestInteract(sc);
  ui.ctx.textContent=st.dlg?'▼ LANJUT':(talk?'✦ BICARA':(it?'✦ PERIKSA':(ex?ex.label:'')));
  ui.ctx.classList.toggle('on',!!(st.dlg||talk||ex||it));
  if(st.dlg&&st.dlg.typed<st.dlg.text.length){
    st.dlg.typed=Math.min(st.dlg.text.length,st.dlg.typed+dt*38);
    ui.dtxt.textContent=st.dlg.text.slice(0,st.dlg.typed|0); }
  const camY=Math.max(0,Math.min(sc.H-256,st.y-150));
  X.setTransform(1,0,0,1,0,0); X.clearRect(0,0,144,256); X.translate(0,-camY);
  drawScene(sc,t);
  X.setTransform(1,0,0,1,0,0);
  const ov=OVERLAY[phase()]; if(ov){X.fillStyle=ov;X.fillRect(0,0,144,256);}
  if(phase()==='malam'){ const v=X.createRadialGradient(72,130,70,72,130,190);
    v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.42)');
    X.fillStyle=v; X.fillRect(0,0,144,256); }
  requestAnimationFrame(loop); }

// ---------- boot ----------
async function init(bundle){
  CATALOG=bundle.catalog; SCENES=bundle.scenes;
  cvs=document.getElementById('cv'); X=cvs.getContext('2d'); X.imageSmoothingEnabled=false;
  ['loc','ctx','dlg','who','dtxt','dinput','dchoices','fade','pop','ptitle','pbody','plink','pclose','phasebtn']
    .forEach(id=>ui[id]=document.getElementById(id));
  Object.entries(MAPS).forEach(([k,m])=>A.custom[k]=spr(m));
  await loadSheets(bundle.sheets);
  bundle.wire(api); // scenes get their scripts (onTalk, onMenu, first-visit)
  st.scene=bundle.start; ui.loc.textContent=SCENES[st.scene].name;
  st.x=SCENES[st.scene].spawn[0]; st.y=SCENES[st.scene].spawn[1];
  bindUI(); READY=true; requestAnimationFrame(loop); }

const api={ init,goto,runScript,popup,closeDlg,persona,generateHome,
  scenes:()=>SCENES,state:st,phase };
return api; })();

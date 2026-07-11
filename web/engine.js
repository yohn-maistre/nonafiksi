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
 rakBuku: ['x'.repeat(20),'x'+'W'.repeat(18)+'x',
  'x'+'ttiiddggttiiddggtt'+'x','x'+'ttiiddggttiiddggtt'+'x','x'+'W'.repeat(18)+'x',
  'x'+'ggttiiddggttiiddgg'+'x','x'+'ggttiiddggttiiddgg'+'x','x'+'W'.repeat(18)+'x',
  'x'+'iiddggttiiddggttii'+'x','x'+'iiddggttiiddggttii'+'x','x'+'W'.repeat(18)+'x','x'.repeat(20)],
 mejaBundar: ['....WWWWWWWW....','..WWwwwwwwwwWW..','.W'+'w'.repeat(12)+'W.','.W'+'w'.repeat(12)+'W.',
  '..WWwwwwwwwwWW..','....WWWWWWWW....','.....W....W.....','.....W....W.....'],
 kasir: ['.xxxxxxxx.','.xccccccx.','.xxxxxxxx.','xxggggggxx','xxggggggxx','xxxxxxxxxx'],
 tanamanGantung: ['....xx....','....xx....','.d.dddd.d.','.dddddddd.','..tttttt..','..tttttt..',
  '.d.dddd.d.','.dd.dd.dd.','.d..dd..d.','....d.....','....d.....'],
 kursiBar: ['.wwwwww.','.wwwwww.','..x..x..','..x..x..','.x....x.'],
 menuBesar: ['x'.repeat(34),'x'+'c'.repeat(32)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'i'.repeat(18)+'c'.repeat(12)+'x',
   'x'+'c'.repeat(32)+'x','xcc'+'C'.repeat(24)+'c'.repeat(6)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'C'.repeat(20)+'c'.repeat(10)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'C'.repeat(24)+'c'.repeat(6)+'x','x'+'c'.repeat(32)+'x',
   'xcc'+'C'.repeat(16)+'c'.repeat(14)+'x','x'+'c'.repeat(32)+'x','x'.repeat(34)],
 // Nona the kedai-keeper polishing a glass — 2 frames, same 18 rows as nonaApron
 nonaBar0: ["......kkkkk.g.....",".....kkkkkkkg.....",".....kkkkkkkk.....","....kkkkkkkkkk....",
  "....kksssssskk....","...kksssssssskk...","...kkseesseeskk...","...kksssssssskk...",
  "....ksssmmsssk....",".....ssssssss.....",".......ssss..scc..",".....iiccccii.cc..",
  "....iiccccccii....","...iiccCccCccii...","...iicccccccii....","..iiicccggccciii..",
  "..iiiccccccccIii..","..iiiccccccccIii.."],
 nonaBar1: ["......kkkkk.g.....",".....kkkkkkkg.....",".....kkkkkkkk.....","....kkkkkkkkkk....",
  "....kksssssskk....","...kksssssssskk...","...kkseesseeskk...","...kksssssssskk...",
  "....ksssmmsssk....",".....ssssssss.....",".......ssss..sCC..",".....iiccccii.Cc..",
  "....iiccccccii....","...iiccCccCccii...","...iicccccccii....","..iiicccggccciii..",
  "..iiiccccccccIii..","..iiiccccccccIii.."],
 gelas: ['c..c','cC.c','cC.c','cccc'],
 gerobak: ['.gcgcgcgcgcgcgcgcgcg.',
  'gcgcgcgcgcgcgcgcgcgcg',
  '.x.................x.',
  '.x.................x.',
  '.xWWWWWWWWWWWWWWWWWx.',
  '.xWcccccccccccccccWx.',
  '.xWcttc.ggc.mmc.ccWx.',
  '.xWWWWWWWWWWWWWWWWWx.',
  '.xwwwwwwwwwwwwwwwwwx.',
  '.xwwwwwwwwwwwwwwwwwx.',
  '..x....x.....x....x..',
  '..xx..xx.....xx..xx..',
  '...xxxx.......xxxx...'],
 jemuran: ['K............................K',
  'KxxxxxxxxxxxxxxxxxxxxxxxxxxxxK',
  'K.ccccc...iiiii...CCCCC..III.K',
  'K..ccc.....iii.....CCC...III.K',
  'K..ccc.....iii.....CCC...III.K',
  'K..c.c.....i.i.....C.C....I..K',
  'K............................K',
  'K............................K'],
 // fallback dog (2-frame trot) — superseded if the Ninja animal sheets land
 anjing0: ['.kkk........','kkkkk.......','kk.kssssssss','.kkssssssss.','..ssssssss..',
  '..s..ss..s..','..s..ss..s..'],
 anjing1: ['.kkk........','kkkkk.......','kk.kssssssss','.kkssssssss.','..ssssssss..',
  '..s.s..s.s..','.s...s....s.']
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
  fading:false, phaseOverride:null, dlg:null, kopi:3,
  mode:'play', jx:0, jy:0, hidePlayer:false, playerSheet:'boy' };
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

// grounds are phase-aware: grass is GREEN at noon, lamps own the night.
const GROUND_PAL={
 pagi:{grass:'#4f7040',tuft:'#3f5c33',path:'#a3855c',fleck:'rgba(255,244,214,.12)',
   wall:'#3d2c1d',floor:'#4a3626',seam:'rgba(0,0,0,.14)'},
 siang:{grass:'#5a8046',tuft:'#476a38',path:'#b29467',fleck:'rgba(205,230,255,.16)',
   wall:'#43301f',floor:'#54402c',seam:'rgba(0,0,0,.12)'},
 sore:{grass:'#6b6238',tuft:'#55492c',path:'#a37f52',fleck:'rgba(255,190,120,.13)',
   wall:'#38281a',floor:'#443121',seam:'rgba(60,20,0,.18)'},
 malam:{grass:'#241a12',tuft:'#1c140d',path:'#2f2317',fleck:'rgba(242,232,213,.05)',
   wall:'#2a1d14',floor:'#3a2a1c',seam:'rgba(0,0,0,.22)'}};
const isDark=()=>{const p=phase();return p==='malam'||p==='sore';};
const GROUNDS = {
 street(sc,t){ const G=GROUND_PAL[phase()];
   rect(G.grass,0,0,sc.W,sc.H);
   for(let y=0;y<sc.H;y+=6)for(let x=0;x<sc.W;x+=6){
     const r=rnd(x,y);
     if(r>.86)rect(G.tuft,x+(rnd(y,x)*4|0),y+(rnd(x+1,y)*4|0),2,2);
     else if(r>.80)rect(G.tuft,x+(rnd(y,x+2)*4|0),y+(rnd(x+3,y)*4|0),1,3); }
   const p=sc.path||[40,64]; rect(G.path,p[0],0,p[1],sc.H);
   for(let y=0;y<sc.H;y+=6)for(let x=p[0]+2;x<p[0]+p[1]-2;x+=6){
     if(rnd(x,y)>.86)rect(G.fleck,x,y,3,1);
     if(rnd(x+1,y)>.9)rect('rgba(0,0,0,.12)',x+3,y+3,2,1); } },
 interior(sc,t){ const wh=sc.wallH||56, G=GROUND_PAL[phase()];
   rect(G.wall,0,0,sc.W,wh);
   for(let y=12;y<wh;y+=14)rect(G.seam,0,y,sc.W,1);
   rect(G.floor,0,wh,sc.W,sc.H-wh);
   if(sc.floorStyle==='checker'){ // proper-cafe floor (Yose's references)
     for(let y=wh;y<sc.H;y+=8)for(let x=0;x<sc.W;x+=8)
       if((x/8+(y-wh)/8)%2)rect(G.seam,x,y,8,8);
   } else {
     for(let y=wh+6;y<sc.H;y+=22)rect(G.seam,0,y,sc.W,1);
     for(let x=0;x<sc.W;x+=26)rect('rgba(0,0,0,.10)',x,wh,1,sc.H-wh);
   } }
};

const FX = {
 glowFlicker(pl,t){ if(!isDark())return;
   const amp=phase()==='malam'?1:.55; // sore = lamps waking up, malam = full ember
   glow(pl.x+(pl.gx||0),pl.y+(pl.gy||0),pl.r||26,((pl.a||.22)+.03*Math.sin(t/290+pl.x))*amp); },
 pool(pl,t){ if(!isDark())return; X.fillStyle='rgba(227,166,47,.08)'; X.beginPath();
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
 birds(pl,t){ if(phase()==='malam')return; // a small V crosses the band every ~9s
   const T=9000,k=t/T|0,p=(t%T)/T; if(p>.55)return;
   const y0=pl.y+((k*37)%Math.max(1,(pl.h||100)-12)),ltr=k%2,
     bx=pl.x+(ltr?p/.55*(pl.w+30)-15:pl.w+15-p/.55*(pl.w+30));
   X.fillStyle='rgba(20,19,17,.75)';
   for(let i=0;i<4;i++){ const wx=bx-i*7*(ltr?1:-1),wy=y0+(i%2)*4+i*2,
     fl=((t/150|0)+i)%2?-1:1;
     X.fillRect(wx|0,wy|0,2,1); X.fillRect((wx-2)|0,(wy+fl)|0,2,1);
     X.fillRect((wx+2)|0,(wy+fl)|0,2,1); } },
 butterfly(pl,t){ const ph=phase(); if(ph!=='pagi'&&ph!=='siang')return;
   for(let i=0;i<(pl.n||2);i++){ const p=t/5200+i*.5,
     x=pl.x+pl.w/2+Math.sin(p*2.1+i)*pl.w/2, y=pl.y+pl.h/2+Math.sin(p*3.3+i*2)*pl.h/2,
     fl=((t/120|0)+i)%2;
     X.fillStyle=i%2?C.kunyit:C.kertas;
     X.fillRect(x|0,y|0,1,1);
     if(fl){X.fillRect((x-1)|0,y|0,1,1);X.fillRect((x+1)|0,y|0,1,1);} } },
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
 doormat(d,t){ rect('#191009',d.x,d.y,d.w,9); rect(C.terakota,d.x+2,d.y+2,d.w-4,5); },
 rakBotol(d,t){ // kedai-malam back shelf: sirup/kopi/jamu bottles (paper labels,
   // varied heights) — warung reading, never liquor. {x,y,w,rows}
   const rows=d.rows||2,rh=13;
   for(let r=0;r<rows;r++){ const by=d.y+r*rh;
     rect(C.kayu3,d.x,by+10,d.w,3); rect('rgba(0,0,0,.25)',d.x,by+13,d.w,1);
     for(let i=0,bx=d.x+3;bx<d.x+d.w-8;i++,bx+=9){
       const c=[C.terakota,C.kunyit,C.tinta2,C.daun][(i+r*2)%4],bh=8+((i*7+r*3)%3);
       rect(c,bx,by+10-bh,5,bh);
       rect(c,bx+1,by+8-bh,3,2); rect('#191009',bx+1,by+7-bh,3,1);
       rect(C.kertas,bx+1,by+10-(bh>9?5:4),3,3); } }
   if(isDark())glow(d.x+d.w/2,d.y+rows*rh/2,d.w/2.2,.05); }
};

// ---------- NPC brains — all data-driven from scene npc entries ----------
// {y0,y1} vertical ping-pong · {x0,x1} horizontal patrol · {wander:[x,y,w,h]}
// amble-and-pause · {chase:'id',ox,oy} follow a leader (kid-chasing-dog pairs)
// · {static:'down'} stand · {anim:[maps],animMs} 2-frame custom (bartender)
function stepNpc(n,sc,t){
  n._mov=false;
  if(n.static){ n.dir=n.static; return; }
  const sp=(n.speed||22)/60;
  if(n.y1!=null){ n.y=(n.y??n.y0)+(n.dirDown?1:-1)*sp;
    if(n.y>n.y1)n.dirDown=false; if(n.y<n.y0)n.dirDown=true;
    n.dir=n.dirDown?'down':'up'; n._mov=true; return; }
  if(n.x1!=null){ n.x=(n.x??n.x0)+(n.dirRight?1:-1)*sp;
    if(n.x>n.x1)n.dirRight=false; if(n.x<n.x0)n.dirRight=true;
    n.dir=n.dirRight?'right':'left'; n._mov=true; return; }
  let tx=null,ty=null;
  if(n.chase){ const L=(sc.npcs||[]).find(m=>m.id===n.chase);
    if(L){ tx=L.x+(n.ox||0); ty=L.y+(n.oy||0); } }
  else if(n.wander){ const r=n.wander;
    if(n._wait>0){ n._wait-=1/60; return; }
    if(n._tx==null||(Math.abs(n._tx-n.x)<2&&Math.abs(n._ty-n.y)<2)){
      n._tx=r[0]+rnd((n.x*3)|0,(t/900)|0)*r[2]; n._ty=r[1]+rnd((t/900)|0,(n.y*3)|0)*r[3];
      n._wait=1+2*rnd((n.x+t/1000)|0,(n.y*7)|0); return; }
    tx=n._tx; ty=n._ty; }
  if(tx==null)return;
  const dx=tx-n.x,dy=ty-n.y,d=Math.hypot(dx,dy);
  if(d<(n.chase?5:2))return;
  n.x+=dx/d*sp; n.y+=dy/d*sp;
  n.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  n._mov=true;
}

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
    stepNpc(n,sc,t);
    const cKey=n.anim?n.anim[(t/(n.animMs||600)|0)%n.anim.length]:n.custom;
    const h=cKey?(A.custom[cKey]||{}).height||18:0;
    ents.push({y:cKey?n.y+h:n.y,draw:()=>{
      if(cKey)return X.drawImage(A.custom[cKey],n.x,n.y);
      if(n.strip){ // 2-frame side-view sheets (Ninja animals): flip-x for left
        if(n.dir==='left'||n.dir==='right')n._face=n.dir;
        const fw=n.fw||16,fh=n.fh||16,f=n._mov?(t/160|0)%(n.frames||2):0;
        X.save(); X.translate(n.x|0,(n.y-fh)|0);
        if(n._face==='left'){X.scale(-1,1);}
        X.drawImage(img(n.strip),f*fw,0,fw,fh,-(fw/2|0),0,fw,fh);
        X.restore(); return; }
      drawChar(n.k,n.x,n.y,n.dir||'down',n._mov?(t/180|0)%(n.frames||4):0);}});
  });
  (sc.fx||[]).forEach(f=>FX[f.type]&&FX[f.type](f,t));
  ents.filter(e=>e.y<=st.y).sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  if(!st.hidePlayer)drawChar(st.playerSheet||'boy',st.x,st.y,st.dir,st.moving?st.frame:0);
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
  if(s.choices){ // choices + free-typed input can coexist (Yose: "ketik sendiri")
    if(s.input){ const v=ui.dinput.value.trim();
      if(v){ (s.onfree||(()=>{}))(v); if(st.dlg===d){d.i++;stepDlg();} } }
    return; }
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
    ui.loc.textContent=sc.name; ui.fade.classList.remove('on'); st.fading=false;
    if(sc.onEnter){const f=sc.onEnter; if(sc.onEnterOnce)sc.onEnter=null; setTimeout(f,260);} },240); }
function generateHome(p){
  const links=(p.links||[]).slice(0,4);
  const sc={ name:'RUMAH '+(p.nama||'').toUpperCase(), ground:'interior', W:144,H:224,
    wallH:52, spawn:[72,190], path:[0,0],
    colliders:[[0,0,144,74],[0,0,5,224],[139,0,5,224],
      [62,162,16,8],[110,150,12,8],[126,64,10,6],[12,60,26,16]],
    placements:[
      {component:'window-l',x:10,y:12},{component:'lampu-gantung',x:64,y:0},
      {component:'tanaman-gantung',x:34,y:2},
      {component:'poster',x:104,y:14,interact:{type:'text',title:'Poster',body:(p.quote||'Ceritamu tetap milikmu. — Nona Aksara')}},
      {component:'kasur',x:12,y:52},{component:'tanaman',x:126,y:60},
      {component:'karpet',x:48,y:138},
      {component:'meja-bundar',x:62,y:162},{component:'cangkir',x:66,y:158},
      {component:'musik',x:110,y:150,interact:{type:'text',title:'Pemutar Musik',body:'V1: tautkan lagu favoritmu di sini. (Segera)'}},
      {component:'frame',x:52,y:16,interact:{type:'text',title:'Bingkai Foto',body:'Foto-fotomu akan dipajang di sini. (Unggah — segera)'}}],
    npcs:[], fx:[],
    exits:[{x:56,y:206,w:34,h:18,label:'✦ KELUAR',menu:true}] };
  links.forEach((l,i)=>{ sc.placements.push({component:'rak',x:20+ (i%2)*62, y:92+(i/2|0)*44,
    interact:{type:'link',title:l.label||('Tautan '+(i+1)),body:l.url,url:l.url}});
    sc.colliders.push([20+(i%2)*62,92+(i/2|0)*44,48,10]); });
  if(p.vibe==='ramai'){ sc.placements.push({component:'bantal-duduk',x:112,y:186},
      {component:'tanaman',x:8,y:130},{component:'karpet',x:48,y:130});
    sc.colliders.push([8,134,10,6]); }
  if(p.vibe==='hangat'){ sc.placements.push({component:'karpet',x:48,y:120},
      {component:'kucing',x:118,y:184,interact:{type:'text',title:'Kucing',body:'Ia sudah menganggap ini rumahnya juga.'}}); }
  return sc; }

// ---------- input ----------
const keys={};
function bindUI(){
  // floating thumb joystick — spawns faint at the touch point, whole screen is the pad
  const scr=document.querySelector('.screen'); let joyId=null,jcx=0,jcy=0;
  scr.addEventListener('pointerdown',e=>{
    if(st.mode!=='play'||st.dlg||ui.pop.classList.contains('on')||joyId!==null)return;
    if(e.target!==cvs&&e.target!==scr)return;
    e.preventDefault(); joyId=e.pointerId; jcx=e.clientX; jcy=e.clientY;
    const r=scr.getBoundingClientRect();
    ui.joy.style.left=(jcx-r.left-38)+'px'; ui.joy.style.top=(jcy-r.top-38)+'px';
    ui.joy.style.display='block'; ui.jnub.style.left='21px'; ui.jnub.style.top='21px';
    try{scr.setPointerCapture(e.pointerId);}catch(err){} });
  scr.addEventListener('pointermove',e=>{
    if(e.pointerId!==joyId)return;
    let dx=e.clientX-jcx, dy=e.clientY-jcy; const m=Math.hypot(dx,dy);
    if(m>28){dx*=28/m;dy*=28/m;}
    ui.jnub.style.left=(21+dx)+'px'; ui.jnub.style.top=(21+dy)+'px';
    st.jx=Math.abs(dx)<6?0:dx/28; st.jy=Math.abs(dy)<6?0:dy/28; });
  const jend=e=>{ if(e.pointerId!==joyId)return;
    joyId=null; st.jx=st.jy=0; ui.joy.style.display='none'; };
  scr.addEventListener('pointerup',jend); scr.addEventListener('pointercancel',jend);
  ui.dclose.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();closeDlg();});
  const KM={ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',ArrowUp:'U',w:'U',ArrowDown:'D',s:'D'};
  addEventListener('keydown',e=>{ if(document.activeElement===ui.dinput){ if(e.key==='Enter')advDlg(); return; }
    // arrow-key selection on dialog choices (desktop)
    if(st.dlg){ const chc=[...ui.dchoices.querySelectorAll('button.chc')];
      if(chc.length){
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault();
          let i=chc.findIndex(b=>b.classList.contains('sel'));
          chc.forEach(b=>b.classList.remove('sel'));
          i=e.key==='ArrowDown'?(i+1)%chc.length:(i<=0?chc.length-1:i-1);
          chc[i].classList.add('sel'); return; }
        if(e.key==='Enter'||e.key==='e'||e.key===' '){
          const s=chc.find(b=>b.classList.contains('sel'));
          if(s){ e.preventDefault();
            s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); return; } } } }
    if(KM[e.key]){e.preventDefault();keys[KM[e.key]]=true;}
    if(e.key==='e'||e.key==='Enter'||e.key===' '){e.preventDefault();act();} });
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
  if(st.mode!=='play')return;
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
  if(st.mode==='title'){ // attract: slow camera drift over the street, no player
    const camY=(Math.sin(t/12000)*.5+.5)*Math.max(0,sc.H-256);
    X.setTransform(1,0,0,1,0,0); X.clearRect(0,0,144,256); X.translate(0,-camY);
    drawScene(sc,t); X.setTransform(1,0,0,1,0,0);
    const tov=OVERLAY[phase()]; if(tov){X.fillStyle=tov;X.fillRect(0,0,144,256);}
    ui.chprevs.forEach(c=>{ const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
      g.clearRect(0,0,16,16); g.drawImage(img(c.dataset.k),0,((t/200|0)%4)*16,16,16,0,0,16,16); });
    requestAnimationFrame(loop); return; }
  st.moving=false;
  if(!st.dlg&&!st.fading&&!ui.pop.classList.contains('on')){
    let dx=(keys.R?1:0)-(keys.L?1:0)+st.jx, dy=(keys.D?1:0)-(keys.U?1:0)+st.jy;
    const mag=Math.hypot(dx,dy); if(mag>1){dx/=mag;dy/=mag;}
    if(Math.abs(dx)>.05||Math.abs(dy)>.05){st.moving=true;
      if(ui.hint.classList.contains('on')){ui.hint.classList.remove('on');
        try{localStorage.nf_hint=1;}catch(e){}}
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
  ['loc','ctx','dlg','who','dtxt','dinput','dchoices','fade','pop','ptitle','pbody','plink','pclose',
   'phasebtn','joy','jnub','hint','title','dclose']
    .forEach(id=>ui[id]=document.getElementById(id));
  ui.chprevs=[...document.querySelectorAll('.chprev')];
  Object.entries(MAPS).forEach(([k,m])=>A.custom[k]=spr(m));
  await loadSheets(bundle.sheets);
  bundle.wire(api); // scenes get their scripts (onTalk, onMenu, first-visit)
  st.scene=bundle.start; ui.loc.textContent=SCENES[st.scene].name;
  st.x=SCENES[st.scene].spawn[0]; st.y=SCENES[st.scene].spawn[1];
  st.mode='title'; st.hidePlayer=true; ui.title.classList.add('on');
  ui.loc.textContent='NONAFIKSI';
  bindUI(); READY=true; requestAnimationFrame(loop); }

// leave the title screen and enter the world
function begin(name,sx,sy){
  ui.title.classList.remove('on'); st.mode='play'; st.hidePlayer=false;
  goto(name,sx,sy);
  if(!localStorage.nf_hint)ui.hint.classList.add('on'); }

const api={ init,goto,begin,runScript,popup,closeDlg,persona,generateHome,
  scenes:()=>SCENES,state:st,phase,sheet:img };
return api; })();

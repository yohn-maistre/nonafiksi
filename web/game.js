// NonaFiksi game wiring — scripts on top of the data (catalog + scenes).
// Expects globals: NF (engine), NF_ASSETS, NF_CATALOG, NF_SCENES, qrcodegen
// (build.py inlines these for the single-file build).
"use strict";
(function(){
const wire = (api)=>{
  const S = api.scenes();
  const $ = id=>document.getElementById(id);
  const slug = s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0,24)||'tamu';

  // API base: set post-deploy (localStorage nf_api or the hardcoded worker URL).
  // Empty = offline mode — every feature degrades to its deterministic layer.
  const NF_API = localStorage.nf_api||'';
  const post = (path,body)=>NF_API
    ? fetch(NF_API+path,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify(body)})
    : Promise.reject(new Error('offline'));

  // ---- title screen ----
  api.state.playerSheet = localStorage.nf_char||'boy';
  if(api.persona.get()) $('bLanjut').style.display='block';
  $('bMulai').onpointerdown = e=>{ e.preventDefault();
    $('tbtns').style.display='none'; $('chsel').style.display='flex'; };
  document.querySelectorAll('.chcard').forEach(c=>c.onpointerdown=e=>{ e.preventDefault();
    localStorage.nf_char=c.dataset.k; api.state.playerSheet=c.dataset.k;
    api.begin('warung',72,224); });
  $('bLanjut').onpointerdown = e=>{ e.preventDefault(); api.begin('rumah',72,190); };
  $('bKredit').onpointerdown = e=>{ e.preventDefault(); api.popup({title:'KREDIT & SUMBER',
    body:'Aset pixel: Cozy Farm, Ninja Adventure, Kenney, dkk — CC0; daftar per berkas di repo '+
      '(web/assets/SUMBER.md). QR: Project Nayuki (MIT). Font: Press Start 2P & VT323 (OFL). '+
      'Semua tokoh cerita adalah fiksi komposit. Dicetak hangat. ☕'}); };

  // ---- kartu profil: QR + shareable card ----
  const makeCard=(per)=>{
    const cv=document.createElement('canvas'); cv.width=384; cv.height=640;
    const g=cv.getContext('2d'); g.imageSmoothingEnabled=false;
    g.fillStyle='#1a120d'; g.fillRect(0,0,384,640);
    g.strokeStyle='#3a2a1c'; g.lineWidth=8; g.strokeRect(10,10,364,620);
    g.fillStyle='#f2e8d5'; g.fillRect(24,24,336,592);
    g.fillStyle='#303b7a'; g.fillRect(24,24,336,96);
    const sh=api.sheet(api.state.playerSheet);
    g.fillStyle='#f2e8d5'; g.fillRect(144,72,96,96);
    g.strokeStyle='#1a120d'; g.lineWidth=4; g.strokeRect(144,72,96,96);
    g.drawImage(sh,0,0,16,16,152,80,80,80);
    g.textAlign='center';
    g.fillStyle='#1a120d'; g.font='20px PS2P,monospace';
    g.fillText((per.nama||'TAMU').toUpperCase().slice(0,14),192,208);
    g.fillStyle='#303b7a'; g.font='26px VT323,monospace';
    g.fillText('@'+per.handle,192,236);
    const url='https://nonafiksi.pages.dev/@'+per.handle;
    const qr=qrcodegen.QrCode.encodeText(url,qrcodegen.QrCode.Ecc.MEDIUM);
    const m=qr.size, px=Math.max(4,(240/m)|0), off=((384-m*px)/2)|0, top=262;
    g.fillStyle='#ffffff'; g.fillRect(off-10,top-10,m*px+20,m*px+20);
    g.fillStyle='#1a120d';
    for(let y=0;y<m;y++)for(let x=0;x<m;x++)
      if(qr.getModule(x,y))g.fillRect(off+x*px,top+y*px,px,px);
    g.font='22px VT323,monospace'; g.fillStyle='#1a120d';
    g.fillText(url.replace('https://',''),192,top+m*px+34);
    g.font='9px PS2P,monospace'; g.fillStyle='#c4553b';
    g.fillText('NONAFIKSI ✦ CERITA YANG DICETAK HANGAT',192,596);
    return cv; };
  const shareCard=(per)=>{ makeCard(per).toBlob(async b=>{
    const f=new File([b],'nonafiksi-'+per.handle+'.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){
      try{ await navigator.share({files:[f],title:'NonaFiksi',
        text:'Rumahku di NonaFiksi ✦'}); return; }catch(e){} }
    const a=document.createElement('a'); a.href=URL.createObjectURL(b);
    a.download=f.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000); }); };

  // ---- rumah ----
  const doorMenu = ()=>api.runScript([{say:"Mau ke mana?",choices:[
    {label:"Jalan Kenangan",then:()=>{api.closeDlg();api.goto('street',72,110);}},
    {label:"Kartu Profil ✦ bagikan",then:()=>{api.closeDlg();shareCard(api.persona.get());}},
    {label:"Dunia kisah lain",locked:true,lockedMsg:"Peta dunia menyusul. ✦"}]}]);
  const buildRumah = (p)=>{ S.rumah=api.generateHome(p); S.rumah.onMenu=doorMenu;
    if(!localStorage.nf_card){ S.rumah.onEnterOnce=true;
      S.rumah.onEnter=()=>{ localStorage.nf_card=1; api.runScript([
        {say:"(Secarik catatan tertempel di dinding — tulisan Nona:) “Rumah pertamamu. Rak-raknya menunggu kisah.”"},
        {say:"“Bagikan kartunya — biar dunia tahu jalan pulangmu. ✦”",choices:[
          {label:"KARTU PROFIL ✦ BAGIKAN",then:()=>{api.closeDlg();shareCard(api.persona.get());}},
          {label:"Nanti saja",then:()=>api.closeDlg()}]}]); }; } };

  // merge an LLM decor plan into the deterministic base home (validated twice:
  // Worker gates components/bounds; here we re-check against the live catalog)
  const applyPlan=(plan)=>{ const sc=S.rumah; if(!sc||!plan)return;
    (plan.placements||[]).forEach(pl=>{ const c=NF_CATALOG[pl.component]; if(!c)return;
      sc.placements.push({component:pl.component,x:pl.x,y:pl.y});
      if(!c.flat)sc.colliders.push([pl.x,pl.y+(c.h||12)-6,c.w||14,6]); });
    if(plan.quote){ const po=sc.placements.find(p=>p.component==='poster');
      if(po&&po.interact)po.interact.body=plan.quote+' — Nona Aksara'; } };

  const pulang = S.street.exits.find(e=>e.id==='pulang');
  const refreshPulang = ()=>{ if(api.persona.get()) delete pulang.locked;
    else pulang.locked='Rumahmu belum dibangun. Bicaralah dengan Nona di warung. ✦'; };
  const p0 = api.persona.get(); if(p0) buildRumah(p0);
  refreshPulang();

  // ---- curhat drawer: typed stories persist locally until the press wakes ----
  // (when the Worker is live, hear() also posts to /api/bicara — Wave F)
  const hearStore=v=>{ try{ const a=JSON.parse(localStorage.nf_curhat||'[]');
    a.push({t:Date.now(),v:String(v).slice(0,500)});
    localStorage.nf_curhat=JSON.stringify(a.slice(-20)); }catch(e){} };
  const hear=(v)=>{ hearStore(v);
    const per=api.persona.get()||{};
    post('/api/bicara',{user:per.handle||'tamu',text:v}).catch(()=>{});
    api.runScript([
    {say:"“"+(v.length>70?v.slice(0,70)+'…':v)+"” — hm."},
    {say:"Kucatat di laci, kata demi kata. Saat mesin cetak besar menyala, kisah seperti ini yang pertama kucetak. ✦"}]); };

  // ---- Oligarki Bab 1 — 3 adegan, semua tokoh fiksi komposit (aturan UU ITE) ----
  const startOligarki=()=>{ api.closeDlg();
    api.state.playerSheet='v4'; // cerita meminjamkan tubuh: Pak Bakri
    api.popup({title:'FIKSI KOMPOSIT',
      body:'Semua tokoh dan kejadian bab ini fiksi komposit. Kemiripan dengan siapa pun bersifat kebetulan (dan mungkin struktural). Kau bermain sebagai PAK BAKRI.'});
    api.goto('oli1'); };
  const endOligarki=()=>{ api.state.playerSheet=localStorage.nf_char||'boy';
    api.goto('warung',72,224);
    setTimeout(()=>api.runScript([
      {say:"— begitulah Bab Satu. Kutulis dari kursi ini, dari cerita orang-orang yang antre kopi."},
      {say:"Bab berikutnya menunggu tinta. Dan kopi. Selalu kopi. ☕"}]),800); };

  S.oli1.onTalk=()=>{ let amp='';
    api.runScript([
      {say:"Pak Bakri. Agenda Bapak hari ini… padat sekali, tiba-tiba."},
      {say:"(Sampaikan maksudmu. Pilih amplopnya:)",choices:[
        {label:"“Kajian strategis”",then:()=>amp="Kajian ke-17 tahun ini, Pak. Semuanya menyimpulkan hal yang sama: proyek Bapak."},
        {label:"“Dana pembinaan”",then:()=>amp="Dinas kami sudah sangat… terbina, Pak Bakri."},
        {label:"“Sosialisasi berkelanjutan”",then:()=>amp="Yang disosialisasikan siapa, kepada siapa, untuk apa — jangan dijawab, Pak."}]},
      {say:()=>amp},
      {say:"Pintu saya selalu terbuka untuk Bapak. Pintu yang ITU. (Ia menunjuk pintu keluar.)"},
      {say:"(Lanjut lewat pintu bawah: RESTORAN, jam makan siang.)"}],
      'IBU KADIS (FIKSI)'); };

  S.oli2.onTalk=()=>{ let jaw='';
    api.runScript([
      {say:"Bakri! Duduk, duduk. Rendangnya premium — dan seperti biasa, kau yang bayar, kan?"},
      {say:"(Buka negosiasimu:)",choices:[
        {label:"“RUU itu… bisa dipercepat?”",then:()=>jaw='cepat'},
        {label:"“Keluarga kami ingin berkontribusi”",then:()=>jaw='kontribusi'},
        {label:"“Golf akhir pekan? Bahas visi bangsa”",then:()=>jaw='golf'}]},
      {say:"— MAAF PAK, tambahan sambal? Gratis untuk pelanggan setia! (Pelayan datang tepat di detik paling penting.)"},
      {say:()=>({cepat:"…RUU tidak dipercepat, Bakri. Ia ‘matang di pohon’. Pohonnya kau yang tanam, sih.",
        kontribusi:"Kontribusi keluargamu yang bulan lalu saja masih dihitung… akuntan. Iya. Akuntan.",
        golf:"Visi bangsamu delapan belas lubang, Bakri, dan semuanya par."}[jaw])},
      {say:"Intinya: rakyat menonton. Untungnya saluran TV-nya… punyamu juga, ya? (Kalian tertawa. Kalian berdua tahu.)"},
      {say:"(Lanjut lewat pintu bawah: KONFERENSI PERS.)"}],
      'PAK DEWAN (FIKSI)'); };

  S.oli3.onTalk=()=>{ let head='';
    api.runScript([
      {say:"Pak Bakri! Satu pertanyaan: tanggapan Bapak soal izin tambang di hutan adat?"},
      {say:"(Pilih jawaban terbaikmu:)",choices:[
        {label:"“Optimalisasi lahan tidur”",then:()=>head="HEADLINE BESOK: “BAKRI: HUTAN ADAT = LAHAN TIDUR”. Tiga demonstrasi. Satu meme abadi."},
        {label:"“Kami berdampingan dengan warga”",then:()=>head="HEADLINE BESOK: “BERDAMPINGAN: RUMAH WARGA KINI DI SAMPING LUBANG”."},
        {label:"“Tanya anak perusahaan saja”",then:()=>head="HEADLINE BESOK: “BAKRI TAK KENAL PERUSAHAANNYA SENDIRI”. Sahamnya ikut tidur."}]},
      {say:()=>head},
      {say:"(Setiap jawaban memperburuk keadaan. Kau tersenyum ke kamera — senyum tiga puluh tahun latihan.)"},
      {say:"(TAMAT — BAB 1.)",action:endOligarki}],
      'WARTAWAN (FIKSI)'); };

  // ---- Nona Aksara di warung ----
  const SMALL={
    pagi:["Pagi. Kopi pertama selalu yang paling jujur.","Roti baru keluar — baunya seperti niat baik."],
    siang:["Siang begini cerita datang lebih pelan, tapi lebih dalam.","Panas di luar. Duduk dulu, dingin dulu."],
    sore:["Sore itu jam emas percetakan — semua orang tiba-tiba ingin bercerita.","Lampu-lampu mulai kunyalakan satu per satu."],
    malam:["Malam. Jam paling ramai kisah, paling sepi jalan.","Dengar jangkrik di luar? Koor tetap warung ini."]};

  S.warung.onTalk = ()=>{
    const per = api.persona.get();
    if(!per){
      const draft = {links:[]};
      api.runScript([
        {say:"Selamat datang di Warung Pusat. Aku Aksara — penjaga percetakan ini. Kopi dulu? Cangkir pertama kutraktir. ✦"},
        {say:"Sebelum kutulis apa pun — siapa namamu?",input:true,placeholder:"namamu…",
          oninput:v=>draft.nama=v},
        {say:()=>"Salam kenal, "+draft.nama+". Tautan yang paling menceritakan dirimu? (portofolio, IG, apa saja)",
          input:true,placeholder:"https://…",
          oninput:v=>draft.links.push({label:"Tautanku",url:v.startsWith('http')?v:'https://'+v})},
        {say:"Terakhir — rumah seperti apa dirimu?",choices:[
          {label:"HANGAT — selimut & kopi",then:()=>draft.vibe='hangat'},
          {label:"RAPI — semua pada tempatnya",then:()=>draft.vibe='rapi'},
          {label:"RAMAI — tamu & tanaman",then:()=>draft.vibe='ramai'}]},
        {say:"Cukup. Malam ini kubangun rumahmu di ujung jalan — kecil, hangat, penuh rak untuk kisahmu.",
          action:()=>{draft.handle=slug(draft.nama);api.persona.set(draft);buildRumah(draft);refreshPulang();
            post('/api/bangun',{persona:draft}).then(r=>r.json())
              .then(r=>applyPlan(r.plan)).catch(()=>{});
            post('/api/rumah',{handle:draft.handle,persona:draft,manifest:{}}).catch(()=>{});}},
        {say:()=>"Selesai. Pulanglah, "+draft.nama+" — keluar, ikuti jalan ke selatan sampai papan terakhir. Rumahmu menunggu. ✦"}]);
    } else {
      const n=(+localStorage.nf_talks||0); localStorage.nf_talks=n+1;
      const pool=SMALL[api.phase()];
      api.runScript([
        {say:pool[n%pool.length]},
        {say:"Mau apa hari ini, "+(per.nama||'Tuan Pencetak')+"?",
          input:true,placeholder:"…atau ketik apa saja",onfree:hear,
          choices:[
          {label:"Ngobrol",then:()=>api.runScript([
            {say:"Jalan Kenangan mulai ramai, ya? Rumah-rumah ini pinjaman — nanti kita bangun milik kita sendiri."},
            {say:"Kalau ceritamu sudah siap dituturkan — duduklah. Aku yang menulis, kau yang punya. ✦"}])},
          {label:"Kisah: Oligarki — Bab 1",then:startOligarki},
          {label:"Kisah: Zakheus",locked:true,
            lockedMsg:"Sedang ditulis — dengan restu keluarga, tanpa terburu-buru. ✦"},
          {label:"Curhat (cetak kisahmu)",then:()=>{api.closeDlg();api.runScript([
            {say:"Duduk. Ceritakan — aku mendengarkan.",input:true,placeholder:"ketik ceritamu…",
              oninput:hearStore},
            {say:"…kucatat, kata demi kata. Mesin cetak besarnya masih menunggu kopi — tapi ceritamu aman di laciku. ☕"}])}}]}]);
    }
  };
};
NF.init({sheets:NF_ASSETS,catalog:NF_CATALOG,scenes:NF_SCENES,start:'street',wire});
})();

// NonaFiksi game wiring — scripts on top of the data (catalog + scenes).
// Expects globals: NF (engine), NF_ASSETS, NF_CATALOG, NF_SCENES (build.py
// inlines these for the single-file build; hosted mode adds a fetch shim).
"use strict";
(function(){
const wire = (api)=>{
  const S = api.scenes();
  const doorMenu = ()=>api.runScript([{say:"Mau ke mana?",choices:[
    {label:"Jalan Kenangan",then:()=>{api.closeDlg();api.goto('street',72,110);}},
    {label:"Dunia kisah lain",locked:true,lockedMsg:"Peta dunia menyusul. ✦"}]}]);
  const buildRumah = (p)=>{ S.rumah=api.generateHome(p); S.rumah.onMenu=doorMenu; };

  const pulang = S.street.exits.find(e=>e.id==='pulang');
  const refreshPulang = ()=>{ if(api.persona.get()) delete pulang.locked;
    else pulang.locked='Rumahmu belum dibangun. Bicaralah dengan Nona di warung. ✦'; };
  const p0 = api.persona.get(); if(p0) buildRumah(p0);
  refreshPulang();

  S.warung.onTalk = ()=>{
    const per = api.persona.get();
    if(!per){
      const draft = {links:[]};
      api.runScript([
        {say:"Selamat datang di Warung Pusat. Aku Aksara — penjaga percetakan ini. Kopi dulu? Cangkir pertama kutraktir. ✦"},
        {say:"Sebelum kutulis apa pun — siapa namamu?",input:true,placeholder:"namamu…",
          oninput:v=>draft.nama=v},
        {say:()=>"Salam kenal, "+draft.nama+". Satu lagi: tautan yang paling menceritakan dirimu? (portofolio, IG, apa saja)",
          input:true,placeholder:"https://…",
          oninput:v=>draft.links.push({label:"Tautanku",url:v.startsWith('http')?v:'https://'+v})},
        {say:"Cukup. Malam ini kubangun rumahmu di ujung jalan — kecil, hangat, penuh rak untuk kisahmu.",
          action:()=>{api.persona.set(draft);buildRumah(draft);refreshPulang();}},
        {say:()=>"Selesai. Pulanglah, "+draft.nama+" — ikuti jalan ke selatan sampai papan terakhir. Rumahmu menunggu. ✦"}]);
    } else {
      api.runScript([
        {say:"Mau apa hari ini, "+(per.nama||'Tuan Pencetak')+"?",choices:[
          {label:"Ngobrol",then:()=>api.runScript([
            {say:"Jalan Kenangan mulai ramai, ya? Rumah-rumah ini pinjaman — nanti kita bangun milik kita sendiri."},
            {say:"Kalau ceritamu sudah siap dituturkan — duduklah. Aku yang menulis, kau yang punya. ✦"}])},
          {label:"Kisah: Oligarki (cuplikan)",then:()=>{api.closeDlg();api.goto('kantor');}},
          {label:"Kisah: Zakheus",locked:true,
            lockedMsg:"Sedang ditulis — dengan restu keluarga, tanpa terburu-buru. ✦"},
          {label:"Curhat (cetak kisahmu)",locked:true,
            lockedMsg:"Butuh mesin cetak yang lebih besar. Segera — berbahan bakar kopi. ☕"}]}]);
    }
  };

  S.kantor.onTalk = ()=>api.runScript([
    {say:"'Anggaran sosialisasi', 'kajian strategis', 'dana pembinaan' — tiga nama untuk satu sungai yang sama."},
    {say:"Kau baru di kantor ini. Pertanyaannya bukan apakah kau ikut arus — tapi seberapa dalam."},
    {say:"(CUPLIKAN selesai — kisah penuh sedang dicetak. Semua tokoh fiksi komposit.)"}],
    'PAK B. (FIKSI)');
};
NF.init({sheets:NF_ASSETS,catalog:NF_CATALOG,scenes:NF_SCENES,start:'street',wire});
})();

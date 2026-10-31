// Funções usadas no painel da Shopee (rodar no navegador, aba shopee.com.br)
// 1) Lista de ofertas com Comissão Xtra (rodar na aba affiliate.shopee.com.br):
//    fetch('/api/v3/offer/product/list?list_type=7&sort_type=1&page_offset=0&page_limit=50&client_type=1')
//    item: data.list[i].batch_item_for_item_card_full -> itemid, shopid, name, catid (100636 = casa), ctime, stock, sold, item_rating
//    SEMPRE 10–17 s entre páginas.
// 2) Detalhe do produto (aba shopee.com.br): /api/v4/pdp/get_pc?item_id=..&shop_id=..  — 12–20 s entre chamadas
//    product_images.images, first_tier_variations, video.formats[0].url, product_description.paragraph_list
// 3) Imagens: https://down-br.img.susercontent.com/file/<id>
// 4) Juntar tudo em .zip (sem compressão) e baixar UM arquivo por parte (nunca centenas de downloads soltos):
(()=>{const T=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0}
const crc=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
window._zip=(files)=>{const enc=new TextEncoder();const parts=[],cent=[];let off=0;
for(const f of files){const nm=enc.encode(f.name),d=f.data,c=crc(d);
const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);
parts.push(h.buffer,nm,d);
const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint32(16,c,true);ch.setUint32(20,d.length,true);ch.setUint32(24,d.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
cent.push(ch.buffer,nm);off+=30+nm.length+d.length;}
const cs=cent.reduce((a,b)=>a+(b.byteLength),0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
return new Blob([...parts,...cent,e.buffer],{type:'application/zip'})};
window._san=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'').slice(0,24)||'x';
// window._info[slug] = {id,shop,name,images,tiers:[[nome,img]],video,desc}
window._pack=async(slugs,zipname)=>{const files=[];const IMG='https://down-br.img.susercontent.com/file/';
for(const s of slugs){const p=window._info[s]; if(!p||p.erro)continue;
 const jobs=[]; p.images.forEach((im,i)=>jobs.push([IMG+im,`${s}/foto${i+1}.jpg`]));
 const seen=new Set(); p.tiers.forEach(([n,im])=>{let nm=window._san(n); while(seen.has(nm)) nm+='x'; seen.add(nm); if(im)jobs.push([IMG+im,`${s}/cor-${nm}.jpg`])});
 if(p.video) jobs.push([p.video,`${s}/video.mp4`]);
 for(const [u,n] of jobs){try{const r=await fetch(u);if(r.ok)files.push({name:n,data:new Uint8Array(await r.arrayBuffer())});}catch(e){} await new Promise(r=>setTimeout(r,150+Math.random()*250));}
 files.push({name:`${s}/info.json`,data:new TextEncoder().encode(JSON.stringify(p,null,1))});}
const b=window._zip(files);const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=zipname;document.body.appendChild(a);a.click();a.remove();
return zipname+' '+files.length+' arquivos '+Math.round(b.size/1e6)+'MB'};})();

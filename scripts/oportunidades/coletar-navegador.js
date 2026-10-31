// Coleta de candidatos no painel de afiliado (rodar na aba affiliate.shopee.com.br pelo Claude).
// Ritmo humano: 14-19 s entre buscas; para ao primeiro sinal de bloqueio (resposta sem "data").
// No fim baixa candidatos.json (chega como .tmp em Downloads) -> scripts/oportunidades/rodadas/candidatos-<data>.json
window._cand = window._cand || {}; window._log = [];
const KW = ['organizador','utensilios cozinha','limpeza casa','decoracao sala','luminaria','banheiro acessorios','enfeite natal','prateleira']; // trocar a cada rodada
(async () => {
  for (const kw of KW) {
    try {
      const r = await fetch('/api/v3/offer/product/list?list_type=7&sort_type=1&page_offset=0&page_limit=50&client_type=1&keyword=' + encodeURIComponent(kw));
      const j = await r.json();
      if (!j.data) { window._log.push(kw + ': SEM DATA (parar) ' + JSON.stringify(j).slice(0, 120)); break; }
      let n = 0;
      for (const o of j.data.list || []) {
        const b = o.batch_item_for_item_card_full || {};
        if (parseFloat(String(o.seller_commission_rate).replace(',', '.')) > 0) {
          n++;
          window._cand[b.itemid] = { busca: kw, itemId: String(b.itemid), shopId: String(b.shopid), nome: b.name, catid: b.catid,
            preco_min: (b.price_min || b.price) / 1e5, preco_max: (b.price_max || b.price) / 1e5, preco_antes: (b.price_min_before_discount || 0) / 1e5,
            taxa_total: o.default_commission_rate, taxa_xtra: o.seller_commission_rate, estoque: b.stock, ctime: b.ctime,
            vendas_30d: b.sold, vendas_total: b.historical_sold, nota: b.item_rating?.rating_star, n_avaliacoes: (b.item_rating?.rating_count || [])[0],
            curtidas: b.liked_count, loja: b.shop_name, loja_nota: b.shop_rating, oficial: b.is_official_shop,
            preferido: b.is_preferred_plus_seller || b.shopee_verified, n_fotos: (b.images || []).length,
            tem_video: (b.video_info_list || []).length > 0, variacoes: (b.tier_variations || []).map(t => t.options?.length || 0),
            link: o.product_link, status: b.item_status };
        }
      }
      window._log.push(kw + ': ' + (j.data.list || []).length + ' / xtra ' + n);
    } catch (e) { window._log.push(kw + ' ERRO ' + e); }
    await new Promise(r => setTimeout(r, 14000 + Math.random() * 5000));
  }
  window._log.push('FIM');
  const blob = new Blob([JSON.stringify(window._cand)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'candidatos.json'; document.body.appendChild(a); a.click();
})();

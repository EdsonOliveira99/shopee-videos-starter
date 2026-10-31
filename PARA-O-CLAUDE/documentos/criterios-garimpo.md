# Critérios de garimpo de produtos

## Obrigatório
- **Comissão Xtra** (campo `seller_commission_rate` > 0 nos dados do painel de afiliado).
- Nicho de `conta.json` (combinado com o grupo: cada conta tem o seu).
- Preço, comissão mínima, nota, vendas e estoque: `scripts/oportunidades/config-pontuacao.json` (definidos no 1-INSTALAR.bat). Produto novo sem avaliação pode entrar.
- Nada de réplica de marca famosa, álcool, tabaco, itens regulados, "fotos meramente ilustrativas", título que não bate com o produto.

## Prioridade
1. Anúncios recentes (campo `ctime`). 2. Recente e já vendendo. 3. Maior comissão por venda. Antigos que ainda vendem bem são aceitos.

## Onde garimpar
- Painel de afiliado: `/api/v3/offer/product/list?list_type=7` (aba Comissão da marca) e, com `&keyword=...`, busca geral → filtrar `seller_commission_rate` > 0.
- Não abrir shopee.com.br (captcha). Ritmo humano: 10–20 s entre consultas. Se aparecer verificação: parar.

## Vídeo
- Sem preço; narração sempre (voz definida para esta conta); roteiro 230–290 caracteres; capa pronta no frame 0; tela cheia; mãos ok, rosto nunca.
- `videosPorDia` vídeos por dia, distribuídos por igual na `janela` de `conta.json`.
- Saída: `VIDEOS-PRONTOS/DD-MM-AAAA/N-HHhMM-produto.mp4` + `.txt` com legenda (≤150 caracteres).
- Custo de narração medido: ~110 créditos ElevenLabs por vídeo (30/dia ≈ 100 mil/mês: conferir se o plano do ElevenLabs comporta).

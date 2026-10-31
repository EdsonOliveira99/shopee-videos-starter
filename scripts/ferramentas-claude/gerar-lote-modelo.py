import json,os
VOZ='<voz.id do conta.json>'  # trocar pela voz desta conta
L='/tmp/claude-0/-home-claude/0378124e-c9a3-5c9b-ac4b-31afb8abc71a/scratchpad/lote23'
OUT='/tmp/claude-0/-home-claude/0378124e-c9a3-5c9b-ac4b-31afb8abc71a/scratchpad/json23'
BL='produtos/jogo-facas/broll-legumes.mp4'; BM='produtos/garrafa-termica/broll-mesa.mp4'; BLAV='produtos/kit-coala/broll-lavanda.mp4'; BMAQ='produtos/saco-tenis/broll-maquina.mp4'; BQ='produtos/jogo-lencol/broll-quarto.mp4'
CTA={'o':'Toque no carrinho 🛒 e garanta o seu','a':'Toque no carrinho 🛒 e garanta a sua','e':'Toque no carrinho 🛒 e escolha o seu','ea':'Toque no carrinho 🛒 e escolha a sua','k':'Toque no carrinho 🛒 e garanta o seu kit'}
def m(arq,txt,dur=2.6,aj=None,ini=None):
    d={'arquivo':arq,'texto':txt,'duracao':dur}
    if aj: d['ajuste']=aj
    if ini is not None: d['inicio']=ini
    return d
P=[];V='video.mp4'
def add(slug,cat,cor,mus,nome,gancho,capa,gm,midias,roteiro,cta,legenda): P.append(locals())
# ---------- COZINHA
add('pegador-escorredor','C','#E65100','funk','Pegador com Escorredor Inox','Fritura sem respingar óleo? 🍗','foto2.jpg',(V,3.0),
 [m(V,'Pega e escorre de uma vez',2.6,'inteira',14.5),m('foto3.jpg','Pinça + peneira',2.4,'inteira'),m(V,'Escorre o óleo na hora',2.6,'inteira',21.0),m('foto7.jpg','Aço inox',2.4),m('cor-2unidades.jpg','1 ou 2 unidades',2.2,'inteira')],
 "[excited] Olha que ideia esperta: um pegador que já vem com peneira na ponta! Você pega o salgado ou a batata na fritura e o óleo escorre na hora, sem pingar no fogão. É de aço inox e serve pra frituras, massas e legumes. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Pegou, escorreu, pronto 🍗 Pegador inox com peneira na ponta! #cozinha #utensilios #receitas #achadinhosshopee")
add('lancheira-termica','C','#37474F','ukulele','Lancheira Térmica com Alça','Marmita sempre geladinha? 🥗','recorte-azul.png',None,
 [m('foto1.jpg','Cabe marmita e lanche',2.6),m('foto2.jpg','Forro térmico por dentro',2.6),m('foto5.jpg','Alça de ombro regulável',2.4,'inteira'),m('foto6.jpg','Bolsos extras',2.4,'inteira'),m('foto7.jpg','Preta, cinza ou azul',2.2)],
 "[excited] Quem leva marmita pro trabalho precisa ver essa lancheira! Ela tem forro térmico por dentro, que ajuda a manter a comida na temperatura, tecido impermeável e alça de ombro regulável. Cabe pote, fruta e garrafinha. [excited] Toca no carrinho aqui embaixo e escolhe a sua!",
 'ea',"Marmita organizada e fresquinha 🥗 Lancheira térmica com alça de ombro! #marmita #organizacao #cozinha #achadinhosshopee")
add('porta-frios','C','#795548','acustica','Porta Frios Duplo Hermético','Presunto e queijo sem estragar 🧀','foto2.jpg',None,
 [m('foto1.jpg','Vedação de silicone',2.6),m('foto3.jpg','Fundo removível',2.6),m('foto7.jpg','Organiza a geladeira',2.4),m('foto8.jpg','Café da manhã prático',2.4)],
 "[excited] Sabe aquele presunto que fica melado na geladeira? Esse porta frios tem duas divisórias, fundo removível que não deixa acumular umidade e tampa com borracha de silicone que fecha bem. Pode ir no freezer e no micro-ondas. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Frios conservados e geladeira organizada 🧀 Porta frios duplo hermético! #cozinha #organizacao #geladeira #achadinhosshopee")
add('jogo-panelas','C','#8D6E63','acustica','Jogo de Panelas 10 Peças Antiaderente','Cozinha nova com 10 peças ✨','foto2.jpg',(V,1.5),
 [m('foto1.jpg','10 peças',2.6),m(V,'Tampas de vidro',2.6,None,4.0),m('foto4.jpg','Antiaderente',2.4,'inteira'),m(V,'Utensílios inclusos',2.6,None,10.5),m('foto6.jpg','Nada gruda',2.2)],
 "[excited] Olha que jogo de panelas lindo, cor cappuccino! São dez peças: panelas, caçarolas, frigideira, fervedor e utensílios de nylon, com revestimento antiaderente e tampa de vidro. Serve no fogão a gás, elétrico e vitrocerâmico. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Cozinha nova com 10 peças ✨ Jogo de panelas antiaderente cor cappuccino! #cozinha #panelas #casanova #achadinhosshopee")
add('pote-dosador','C','#1E88E5','ukulele','Pote Hermético 2,5L com Copo Medidor','Arroz na medida certa? 🍚','recorte-pote.png',(V,4.0),
 [m('foto2.jpg','Copo medidor na tampa',2.6),m(V,'Bico dosador',2.6,None,9.5),m('foto4.jpg','Vedação dupla',2.4,'inteira'),m(V,'Serve até pra ração',2.6,None,17.0),m('foto9.jpg','Organiza o armário',2.2)],
 "[excited] Esse pote hermético é muito prático! Tem dois litros e meio, vedação de silicone e um copo medidor na tampa, então você serve o arroz, o feijão ou a ração na medida certa, direto pelo bico. Organiza o armário e a lavanderia. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Tudo na medida certa 🍚 Pote hermético 2,5L com copo medidor! #organizacao #cozinha #despensa #achadinhosshopee")
add('suporte-geladeira','C','#607D8B','funk','Base com Rodinhas para Geladeira e Máquina','Limpar atrás da geladeira? 🧽','foto1.jpg',None,
 [m('foto2.jpg','Aguenta até 200 kg',2.6,'inteira'),m('foto5.jpg','Tamanho ajustável',2.6,'inteira'),m('foto8.jpg','Geladeira, máquina e ar',2.4,'inteira'),m('foto3.jpg','Move sem esforço',2.4,'inteira')],
 "[excited] Sabe a sujeira que acumula atrás da geladeira? Com essa base de rodinhas você move geladeira, máquina de lavar ou fogão sem esforço. Ela é ajustável, de quarenta a setenta centímetros, e aguenta até duzentos quilos. [excited] Toca no carrinho aqui embaixo e garante a sua!",
 'a',"Mova a geladeira sem esforço 🧽 Base ajustável com rodinhas até 200 kg! #limpeza #cozinha #organizacao #achadinhosshopee")
add('lixeira-sensor','C','#90A4AE','ukulele','Lixeira Automática 12L com Sensor','Lixeira que abre sozinha? ✋','recorte-lixeira.png',(V,5.0),
 [m(V,'Abre sem tocar',2.6,None,9.0),m('foto2.jpg','Abre em 0,3 s',2.4,'inteira'),m(V,'Fecha sozinha',2.6,None,13.0),m('foto7.jpg','Prende o saco',2.4,'inteira'),m(V,'Cozinha ou banheiro',2.4,None,17.5)],
 "[excited] Olha essa lixeira que abre sozinha quando você aproxima a mão! Ela tem sensor infravermelho, fecha devagar, prende o saco por dentro e tem doze litros. Fica linda na cozinha, no banheiro ou no escritório, e você não encosta em nada. [excited] Toca no carrinho aqui embaixo!",
 'a',"Lixeira que abre sozinha ✋ Sensor infravermelho, 12 litros, sem encostar! #cozinha #banheiro #casa #achadinhosshopee")
add('escorredor-aluminio','C','#424242','acustica','Organizador de Pia com Escorredor','Pia bagunçada? 🧽','foto1.jpg',(V,9.0),
 [m(V,'Esponja no lugar',2.6,'inteira',12.0),m('foto3.jpg','Serve no banheiro',2.4,'inteira'),m(V,'Escorre a água',2.6,'inteira',14.5),m('foto4.jpg','Bandeja removível',2.4,'inteira')],
 "[excited] Chega de esponja e detergente espalhados pela pia! Esse organizador de alumínio tem bandeja que escorre a água, suporte pra pano de prato e espaço pra esponja e sabão. Mede vinte e três centímetros e serve também no banheiro. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Pia organizada e sequinha 🧽 Organizador de alumínio com escorredor! #organizacao #cozinha #pia #achadinhosshopee")
add('copo-termico','C','#F48FB1','ukulele','Copo Térmico Inox 1,2L com Canudo','Bebida gelada o dia todo? 🧊','foto4.jpg',(V,2.0),
 [m(V,'Parede dupla de inox',2.6,'inteira',10.5),m('foto2.jpg','Gelado e quente',2.4),m(V,'Tampa com canudo',2.6,'inteira',23.0),m('foto5.jpg','Não vaza',2.4),m('foto9.jpg','Várias cores',2.2)],
 "[excited] Esse copo térmico de inox é a cara do verão! Ele tem parede dupla, então mantém a bebida gelada por horas, tampa com canudo, alça e cabe no porta-copos do carro. São mil e duzentos ml e várias cores. [excited] Toca no carrinho aqui embaixo e escolhe a sua cor!",
 'ea',"Bebida geladinha o dia todo 🧊 Copo térmico inox 1,2L com canudo! #copotermico #verao #utilidades #achadinhosshopee")
add('tampas-elasticas','C','#43A047','funk','Tampas Elásticas Descartáveis para Potes','Chega de filme plástico! 🍉','foto7.jpg',None,
 [m('foto2.jpg','Estica e veda',2.6,'inteira'),m('foto8.jpg','Serve em vários tamanhos',2.6),m('foto9.jpg','Prático na geladeira',2.4),m('foto4.jpg','Mais rápido que filme',2.4,'inteira')],
 "[excited] Chega de brigar com filme plástico! Essas tampas elásticas esticam e cobrem tigela, prato, pote e até melancia cortada. É só colocar e pronto, a comida fica protegida na geladeira. Vem em kits de cem até quatrocentas. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'k',"Adeus filme plástico 🍉 Tampas elásticas pra tigelas e potes! #cozinha #organizacao #geladeira #achadinhosshopee")
add('fatiador-couve','C','#FB8C00','funk','Fatiador de Legumes Kitop','Couve fininha em segundos 🥬','cor-laranja.jpg',(V,9.0),
 [m(V,'Corte fininho',2.6,'inteira',12.5),m('foto8.jpg','Couve e repolho',2.4),m('cor-amarelo.jpg','Batata e legumes',2.4),m(V,'Rápido e prático',2.6,'inteira',20.5),m('foto1.jpg','8 cores',2.2,'inteira')],
 "[excited] Couve fininha igual de restaurante, em segundos! Esse fatiador tem lâmina afiada e cabo firme, então você corta couve, repolho, batata e pepino bem fininho, sem precisar de faca. E tem várias cores. Cuidado com a lâmina, tá? [excited] Toca no carrinho aqui embaixo!",
 'e',"Couve fininha em segundos 🥬 Fatiador prático pra legumes! #cozinha #receitas #utensilios #achadinhosshopee")
add('frigideiras','C','#C62828','acustica','Jogo de 3 Frigideiras Antiaderentes','3 frigideiras: P, M e G 🍳','foto1.jpg',(V,15.0),
 [m('foto5.jpg','14, 18 e 24 cm',2.6,'inteira'),m(V,'Antiaderente',2.6,None,19.0),m('foto2.jpg','Ovo, panqueca e omelete',2.4),m(V,'Base firme',2.6,None,24.0),m('cor-preto-stone.jpg' if False else 'cor-pretostone.jpg','4 cores',2.2,'inteira')],
 "[excited] Olha esse jogo com três frigideiras: pequena, média e grande, de catorze, dezoito e vinte e quatro centímetros. Elas são antiaderentes, perfeitas pra ovo, panqueca e omelete, e servem no fogão a gás e elétrico. [excited] Toca no carrinho aqui embaixo e escolhe a cor!",
 'e',"3 frigideiras antiaderentes 🍳 Tamanhos P, M e G pro dia a dia! #cozinha #panelas #receitas #achadinhosshopee")
# ---------- CASA
add('fita-dupla-face','H','#00897B','ukulele','Fita Dupla Face Nano Gel Transparente','Pendurar sem furar a parede? 🧷','foto1.jpg',(V,0.3),
 [m(V,'Gruda forte',2.6,None,7.5),m('foto4.jpg','Corta no tamanho',2.4,'inteira'),m(V,'Sem furar a parede',2.6,None,9.5),m('foto6.jpg','Banheiro, cozinha e mais',2.4,'inteira'),m('foto8.jpg','Lavável e reutilizável',2.2)],
 "[excited] Quer pendurar as coisas sem furar a parede? Essa fita dupla face de nano gel é transparente, gruda firme em azulejo, vidro, metal e madeira, e quando perde a cola, é só lavar que volta a grudar. [excited] Toca no carrinho aqui embaixo e garante a sua!",
 'a',"Pendure sem furar 🧷 Fita dupla face nano gel transparente e lavável! #organizacao #casa #dicasdecasa #achadinhosshopee")
add('anti-mofo','H','#1E88E5','acustica','Leve Brisa Evita Mofo Odorizante','Cheiro de mofo no armário? 🌸','recorte-peca.png',None,
 [m('foto2.jpg','Pendura e pronto',2.6,'inteira'),m('foto4.jpg','Armário e sapateira',2.6,'inteira'),m('foto3.jpg','Neutraliza odores',2.4,'inteira'),m('foto5.jpg','Kits de 1 a 12',2.4,'inteira')],
 "[warmly] Abriu o guarda-roupa e sentiu aquele cheiro de mofo? Esse evita mofo vem com ganchinho, é só pendurar no armário, na sapateira ou no banheiro. Ele ajuda a evitar o mofo e deixa um cheirinho suave. [excited] Toca no carrinho aqui embaixo e garante o seu kit!",
 'k',"Armário sem cheiro de mofo 🌸 Evita mofo com ganchinho, é só pendurar! #casa #organizacao #limpeza #achadinhosshopee")
add('desentupidor','H','#0277BD','funk','Desentupidor Desentop Max','Pia entupida? 🚰','foto1.jpg',(V,0.3),
 [m(V,'Despeja no ralo',2.6,None,1.5),m(V,'Age sozinho',2.6,None,4.0),m(V,'Enxágua com água',2.4,None,6.5),m('foto2.jpg','Pia, ralo e vaso',2.4)],
 "[excited] Pia entupida? Esse desentupidor em grânulos age sozinho: você coloca no ralo, espera agir e depois enxágua com água. Serve pra pia, ralo, vaso e caixa de gordura. Use luvas e siga sempre as instruções da embalagem, tá? [excited] Toca no carrinho aqui embaixo!",
 'o',"Ralo desentupido sem drama 🚰 Desentupidor em grânulos pra pia e vaso! #limpeza #casa #dicasdecasa #achadinhosshopee")
add('espuma-sofa','H','#FBC02D','funk','Espuma Limpa Estofados Zip Clean','Sofá encardido? 🛋️','foto7.jpg',(V,6.0),
 [m(V,'Borrifa a espuma',2.6,None,9.5),m('foto4.jpg','Sofá, colchão e carro',2.4,'inteira'),m(V,'Esfrega e pronto',2.6,None,13.5),m('foto5.jpg','Limpa a seco',2.4,'inteira'),m('foto3.jpg','Cheiro agradável',2.2,'inteira')],
 "[excited] Olha o que essa espuma faz no sofá! É só borrifar, esfregar com uma escovinha e passar um pano. Ela limpa a seco, tira sujeira e gordura de sofá, colchão, cadeira e banco de carro, e deixa um cheirinho bom. [excited] Toca no carrinho aqui embaixo e garante a sua!",
 'a',"Sofá limpinho sem lavar 🛋️ Espuma limpa estofados a seco! #limpeza #casa #dicasdecasa #achadinhosshopee")
add('fita-vedacao','H','#26A69A','acustica','Fita de Vedação PVC Impermeável','Fresta com mofo na pia? 💧','foto1.jpg',(V,10.0),
 [m(V,'Limpa e cola',2.6,'inteira',4.0),m('foto3.jpg','Antes e depois',2.4,'inteira'),m(V,'Contorna os cantos',2.6,'inteira',17.5),m(V,'Fácil de limpar',2.6,'inteira',39.0),m('foto2.jpg','Pia, box e vaso',2.2,'inteira')],
 "[excited] Sabe aquela fresta entre a pia e a parede que junta sujeira e mofo? Essa fita de vedação de PVC é autoadesiva e à prova d'água: você limpa, cola e pronto. Serve na pia, no box, no vaso e na bancada. [excited] Toca no carrinho aqui embaixo e garante a sua!",
 'a',"Fim da fresta com mofo 💧 Fita de vedação autoadesiva à prova d'água! #reforma #cozinha #banheiro #achadinhosshopee")
add('adesivo-ralo','H','#78909C','ukulele','Adesivo Protetor de Ralo Descartável','Cabelo entupindo o ralo? 🚿','foto1.jpg',(V,1.0),
 [m(V,'Cola direto no ralo',2.6,'inteira',7.0),m('foto8.jpg','Segura os cabelos',2.4),m(V,'A água passa normal',2.6,'inteira',11.0),m('foto4.jpg','Pia, box e lavatório',2.4,'inteira'),m(V,'Sujou, joga fora',2.2,'inteira',12.5)],
 "[excited] Nojo de tirar cabelo do ralo? Esse adesivo de tela cola direto em cima do ralo, segura cabelo e sujeira e deixa a água passar normal. Quando sujar, é só tirar e jogar fora. Serve no box, na pia e no lavatório. [excited] Toca no carrinho aqui embaixo e garante o seu kit!",
 'k',"Ralo sem cabelo entupindo 🚿 Adesivo de tela descartável! #limpeza #banheiro #casa #achadinhosshopee")
add('mop-girassol','H','#FF7043','funk','Mop Girassol com Cabo de 1 Metro','Limpar o teto sem escada? 🌻','foto6.jpg',(V,4.0),
 [m(V,'Alcança o teto',2.6,'inteira',6.5),m('foto5.jpg','Microfibra macia',2.4,'inteira'),m(V,'Parede e azulejo',2.6,'inteira',9.0),m('cor-mop2cabeca.jpg','Até 3 cabeças',2.4,'inteira'),m('foto2.jpg','Confira a variação',2.2,'inteira')],
 "[excited] Olha esse mop em formato de girassol! O cabo tem um metro, então você alcança teto, parede, janela e azulejo sem subir em escada, e a microfibra macia tira a poeira. Atenção: escolha a variação certa, porque uma delas é só o refil. [excited] Toca no carrinho aqui embaixo!",
 'e',"Limpa até o teto 🌻 Mop girassol de microfibra com cabo de 1 metro! #limpeza #casa #faxina #achadinhosshopee")
add('escova-eletrica','H','#5E35B1','funk','Escova Elétrica de Limpeza 12 em 1','Esfregar sem cansar o braço? 🫧','recorte-branco.png',None,
 [m('foto1.jpg','12 acessórios',2.6),m('foto9.jpg','Banheiro, pia e carro',2.6,'inteira'),m('foto4.jpg','Recarregável USB-C',2.4,'inteira'),m('foto6.jpg','Cabo extensível',2.4,'inteira'),m('foto5.jpg','Gira sozinha',2.2)],
 "[excited] Cansou de esfregar azulejo na mão? Essa escova elétrica gira sozinha e vem com doze acessórios pra banheiro, pia, rejunte, fogão e até carro. É sem fio, recarrega por USB e tem cabo extensível pra alcançar longe. [excited] Toca no carrinho aqui embaixo e garante a sua!",
 'a',"Faxina sem cansar o braço 🫧 Escova elétrica 12 em 1 sem fio! #limpeza #faxina #banheiro #achadinhosshopee")
add('suporte-escova-dentes','H','#29B6F6','ukulele','Suporte de Escova com Dispensador de Pasta','Banheiro mais organizado 🪥','foto5.jpg',None,
 [m('cor-modelosemuv.jpg','Dispensa a pasta',2.6,'inteira'),m('foto6.jpg','Cola na parede',2.4,'inteira'),m('foto3.jpg','2 modelos',2.6,'inteira'),m('cor-modelointelligente.jpg','Modelo com luz UV',2.4,'inteira')],
 "[excited] Olha que organizado fica o banheiro! Esse suporte cola na parede, guarda as escovas e tem dispensador que solta a pasta na medida, é só encostar a escova. Tem o modelo simples e o modelo com luz UV, escolhe com atenção. [excited] Toca no carrinho aqui embaixo!",
 'e',"Banheiro organizado 🪥 Suporte de escovas com dispensador de pasta! #banheiro #organizacao #casa #achadinhosshopee")
add('papel-parede-3d','H','#A1887F','acustica','Papel de Parede Autoadesivo Madeira','Parede nova sem obra? 🪵','foto7.jpg',(V,7.0),
 [m(V,'Várias madeiras',2.6,None,9.5),m('foto8.jpg','Sala com cara de nova',2.4),m(V,'Fácil de aplicar',2.6,None,27.0),m('foto9.jpg','Muitas cores',2.4),m('foto1.jpg','Rolo de 5 m',2.2,'inteira')],
 "[excited] Quer mudar a cara da sala sem quebra-quebra? Esse papel de parede é autoadesivo, imita madeira e é lavável. Cada rolo tem cinco metros por quarenta e cinco centímetros, e serve em parede, móvel e até geladeira. Usa uma régua pra não fazer bolha! [excited] Toca no carrinho aqui embaixo!",
 'e',"Parede nova sem obra 🪵 Papel de parede autoadesivo que imita madeira! #decoracao #reforma #casa #achadinhosshopee")
add('fio-fada','H','#FFB300','ukulele','Fio de Fada LED 2 Metros','Decoração de Natal que brilha ✨','foto1.jpg',None,
 [m('foto3.jpg','Enfeita qualquer canto',2.6),m('foto5.jpg','Luz quentinha',2.6),m('foto2.jpg','Fio fino e flexível',2.4),m('foto8.jpg','Natal e festas',2.4)],
 "[warmly] Esse fio de fada deixa qualquer cantinho mágico! São dois metros de fio de cobre fininho com luz de LED quentinha. Dá pra enrolar em vaso, cúpula, arranjo e na árvore de Natal. Pequeno no preço e grande no efeito! [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Cantinho mágico pro Natal ✨ Fio de fada LED de 2 metros! #natal #decoracao #casa #achadinhosshopee")
add('toalhas-banho','H','#EC407A','acustica','Kit Toalhas de Banho Estampadas 140x70','Toalha grande e macia 🛁','foto1.jpg',(BQ,None),
 [m('foto2.jpg','Estampadas e felpudas',2.6),m('foto5.jpg','Toque macio',2.4),m('foto3.jpg','140 x 70 cm',2.4,'inteira'),m('foto8.jpg','Linda no banheiro',2.4),m('cor-4toalhas.jpg','Kits de 2 a 6',2.2,'inteira')],
 "[warmly] Hora de renovar as toalhas! Esse kit vem com toalhas de banho grandes, de cento e quarenta por setenta, felpudas, macias e com estampas bordadas sortidas. Dá pra escolher de duas até seis toalhas. [excited] Toca no carrinho aqui embaixo e garante o seu kit!",
 'k',"Toalhas grandes e macias 🛁 Kit de toalhas de banho estampadas! #enxoval #banheiro #casa #achadinhosshopee")
add('cesto-roupa','H','#455A64','funk','Cesto de Roupa Dobrável','Roupa suja espalhada? 🧺','recorte-cesto.png',None,
 [m('foto3.jpg','Abre e dobra fácil',2.6,'inteira'),m('foto2.jpg','Bolso lateral',2.4),m('foto9.jpg','Tela que ventila',2.4,'inteira'),m('foto7.jpg','Dois tamanhos',2.4,'inteira')],
 "[excited] Chega de roupa suja espalhada pelo quarto! Esse cesto dobrável abre num segundo, tem tela que deixa o ar circular, bolsinho lateral e alças. Quando não usa, fecha e guarda em qualquer canto. Tem dois tamanhos. [excited] Toca no carrinho aqui embaixo e garante o seu!",
 'o',"Roupa suja no lugar certo 🧺 Cesto dobrável com tela e alças! #organizacao #lavanderia #casa #achadinhosshopee")
add('mop-giratorio','H','#D32F2F','funk','Mop Giratório com Balde Centrífuga','Chão limpo sem molhar a mão 🧹','foto7.jpg',(V,30.0),
 [m(V,'Gira e seca o esfregão',2.6,'inteira',10.0),m('foto2.jpg','2 refis de microfibra',2.4,'inteira'),m(V,'Rodinhas no balde',2.6,'inteira',22.5),m('foto4.jpg','Cabo de inox regulável',2.4,'inteira'),m(V,'Dispenser de sabão',2.2,'inteira',36.5)],
 "[excited] Esse mop giratório facilita demais a faxina! Você lava o esfregão, coloca no cesto de inox e ele gira e seca, sem você encostar a mão. O balde tem rodinhas e dispenser de sabão, e vem com dois refis de microfibra. [excited] Toca no carrinho aqui embaixo e escolhe o seu!",
 'e',"Faxina sem molhar a mão 🧹 Mop giratório com balde centrífuga! #limpeza #faxina #casa #achadinhosshopee")
add('colcha','H','#F06292','acustica','Colcha Cobre Leito Matelassada','Quarto de hotel em casa 🛏️','foto4.jpg',(V,4.0),
 [m('foto3.jpg','Matelassada',2.6),m(V,'Acompanha porta-travesseiro',2.6,None,8.5),m('foto2.jpg','Solteiro ao king',2.4,'inteira'),m(V,'11 cores',2.4,None,18.0),m('cor-avela.jpg','Linda em qualquer quarto',2.2)],
 "[warmly] Quer o quarto com cara de hotel? Essa colcha cobre leito é matelassada, com bordado delicado, e já acompanha porta-travesseiro. Tem tamanho solteiro, casal, queen e king, e um montão de cores. [excited] Toca no carrinho aqui embaixo e escolhe a sua!",
 'ea',"Quarto com cara de hotel 🛏️ Colcha matelassada com porta-travesseiro! #quarto #enxoval #decoracao #achadinhosshopee")
add('essencia-lavanda','H','#9575CD','acustica','Essência Via Aroma 10ml','Casa com cheirinho de lavanda 💜','recorte-lavanda.png',(BLAV,None),
 [m(V,'Pingue no difusor',2.6,'inteira',0.5),m('foto3.jpg','Notas de lavanda',2.4,'inteira'),m(V,'Várias fragrâncias',2.6,'inteira',6.5),m('cor-alecrimsilvestre.jpg','Escolha seu aroma',2.2,'inteira')],
 "[warmly] Sabe aquele cheirinho de casa limpa? Essa essência de lavanda é pra usar no aromatizador ou difusor elétrico: é só pingar algumas gotas e o ambiente fica perfumado. São dez ml e tem muitas outras fragrâncias. [excited] Toca no carrinho aqui embaixo e escolhe a sua!",
 'ea',"Casa cheirosa 💜 Essência de lavanda pra difusor e aromatizador! #casacheirosa #decoracao #casa #achadinhosshopee")
add('revestimento-ripado','H','#6D4C41','acustica','Revestimento Ripado Autocolante EVA','Parede ripada sem obra? 🪵','foto5.jpg',(V,26.0),
 [m('cor-marrom.jpg','Atrás da TV fica lindo',2.6),m('foto3.jpg','Só destacar e colar',2.4,'inteira'),m(V,'Corta no tamanho',2.6,None,25.0),m('foto6.jpg','Onde aplicar',2.4,'inteira'),m('cor-cinza.jpg','5 cores',2.2)],
 "[excited] Parede ripada sem marceneiro! Esse revestimento de EVA é autocolante e flexível: você corta no tamanho, destaca e cola. Funciona em parede lisa, pintada e madeira, e vem em cinco cores. Atrás da TV ou da cama fica lindo! [excited] Toca no carrinho aqui embaixo e escolhe a cor!",
 'e',"Parede ripada sem obra 🪵 Revestimento autocolante de EVA em 5 cores! #decoracao #reforma #casa #achadinhosshopee")
add('mangueira','H','#43A047','funk','Mangueira Expansível com Esguicho 7 Jatos','Mangueira que cresce 3x? 🌱','recorte-verde.png',(V,25.0),
 [m('foto2.jpg','Expande com a água',2.6,'inteira'),m('foto4.jpg','7 tipos de jato',2.4,'inteira'),m('foto6.jpg','Lava carro e quintal',2.4),m('foto7.jpg','Encaixe fácil',2.4,'inteira'),m('cor-azul.jpg','Verde, azul ou preta',2.2,'inteira')],
 "[excited] Olha essa mangueira! Sem água ela fica pequenininha, e quando você abre a torneira ela estica até três vezes. Vem com esguicho de sete jatos, pra regar planta, lavar carro e quintal, e depois volta ao tamanho e guarda fácil. [excited] Toca no carrinho aqui embaixo!",
 'e',"Mangueira que cresce 3x 🌱 Expansível com esguicho de 7 jatos! #jardim #casa #limpeza #achadinhosshopee")

C=[p for p in P if p['cat']=='C']; H=[p for p in P if p['cat']=='H']
ordem=[]; ci=hi=0
for k in range(30):
    if (k%5 in (1,3)) and ci<len(C): ordem.append(C[ci]); ci+=1
    elif hi<len(H): ordem.append(H[hi]); hi+=1
    else: ordem.append(C[ci]); ci+=1
assert len(ordem)==30 and len(set(p['slug'] for p in ordem))==30
MUS={'ukulele':'musicas/ukulele.mp3','acustica':'musicas/acustica.mp3','funk':'musicas/funk.mp3'}  # trocar pelas faixas de public/musicas desta conta
erros=[]
for i,p in enumerate(ordem):
    s=p['slug']; info=json.load(open(f'{L}/{s}/info.json'))
    pre=lambda a: a if a.startswith('produtos/') else f'produtos/{s}/{a}'
    vd=None
    if os.path.exists(f'{L}/{s}/video.mp4'):
        import subprocess; vd=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{L}/{s}/video.mp4'],capture_output=True,text=True).stdout)
    for mm in p['midias']:
        a=pre(mm['arquivo']); mm['arquivo']=a
        if a.startswith(f'produtos/{s}/') and not os.path.exists(f"{L}/{a[len('produtos/'):]}"): erros.append(a)
        if 'inicio' in mm and (vd is None or mm['inicio']+mm['duracao']*1.4>vd): erros.append(f'{s} inicio {mm["inicio"]} dur video {vd}')
    if not os.path.exists(f"{L}/{s}/{p['capa']}"): erros.append(s+' capa')
    h=7*60+i*30; hr=f'{h//60:02d}:{h%60:02d}'
    d={'slug':s,'postar':'2026-10-22','horario':hr,'corDestaque':p['cor'],'volumeMusica':0.12,'narracao':f'produtos/{s}/narracao.mp3',
       'voz':VOZ,'musica':MUS[p['mus']],'produtoNome':info['name'],'itemId':info['id'],'lojaId':info['shop'],
       'nomeProduto':p['nome'],'gancho':p['gancho'],'roteiro':p['roteiro'],'cta':CTA[p['cta']],'legenda':p['legenda'],
       'capa':pre(p['capa']),'midias':p['midias'],'zoomAlternado':i%2==0}
    if p['gm']:
        a,ini=p['gm']; g={'arquivo':pre(a)}
        if ini is not None:
            g['inicio']=ini
            if vd is None or ini+3>vd: erros.append(f'{s} gancho {ini} {vd}')
        d['ganchoMidia']=g
    if len(d['legenda'])>150: erros.append(f'{s} legenda {len(d["legenda"])}')
    json.dump(d,open(f'{OUT}/{s}.json','w'),ensure_ascii=False,indent=2)
    print(hr,p['cat'],s,len(p['roteiro']),len(p['gancho']))
print('ERROS',erros)

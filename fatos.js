import { MAIS } from "./saberes.js?v=1";

/* BACH AI 2.5
   Base de fatos verificados + distâncias espaciais/geográficas + respostas sobre a própria BACH.
   Sem lookbehind (compatível com todas as versões de iOS/Android). */

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const SEM_VALOR = new Set(("qual quais quem quanto quantos quantas como onde quando porque por que para pra o a os as um uma uns umas " +
  "de do da dos das em no na nos nas e eh ao aos me se fale fala falar diga dizer explique explica explicar sobre significa " +
  "significado definicao conceito mesmo voce vc eu sao foi ser ha tem existe existem exatamente basicamente resumo resuma " +
  "conte conta pode poderia favor pf entao ai tipo seria era passe passa manda mande quero preciso gostaria crie cria faca fazer ajuda ajude algum alguma uns umas pesquise pesquisa busque procure ensina ensine mostra mostre bach ate fica").split(" "));

const stem = w => {
  w = w.replace(/(coes|oes|aes)$/, "ao");
  if (w.length > 4) w = w.replace(/s$/, "");
  return w.length > 6 ? w.slice(0, 6) : w;
};
const toks = t => norm(t).split(" ").filter(w => w && !SEM_VALOR.has(w)).map(stem);

const FATOS = [
["arco iris|cores arco iris|quantas cores arco iris|como forma arco iris|formacao arco iris|origem arco iris",
 "🌈 O arco-íris é um fenômeno óptico causado pela refração, reflexão interna e dispersão da luz do Sol em gotas de água. As cores, de fora para dentro, são sete (convenção de Isaac Newton): vermelho, laranja, amarelo, verde, azul, anil e violeta. Na natureza o espectro é contínuo; as sete cores são só uma forma de dividi-lo."],
["planeta|planetas|planetas sistema solar|quantos planetas|sistema solar",
 "🪐 O Sistema Solar tem 8 planetas, em ordem a partir do Sol: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno. Planeta é um corpo que orbita uma estrela, é massivo o bastante para ser arredondado pela própria gravidade e dominou a órbita onde está. Plutão é classificado como planeta anão desde 2006."],
["maior planeta|planeta maior|maior planeta sistema solar",
 "🪐 O maior planeta do Sistema Solar é Júpiter: cerca de 140 mil km de diâmetro, mais de 11 vezes o da Terra."],
["menor planeta|planeta menor|planeta mais proximo sol|planeta proximo sol",
 "🪐 Mercúrio é o menor planeta (cerca de 4.880 km de diâmetro) e também o mais próximo do Sol."],
["planeta mais quente",
 "🪐 O planeta mais quente é Vênus (cerca de 465 °C na superfície), por causa do efeito estufa intenso da sua atmosfera de CO₂. Mercúrio está mais perto do Sol, mas quase não tem atmosfera para reter calor."],
["planeta vermelho",
 "🪐 O planeta vermelho é Marte. A cor vem do óxido de ferro (ferrugem) na superfície."],
["distancia marte|distancia terra marte|marte distancia|longe marte|marte terra",
 "🚀 A distância entre a Terra e Marte varia conforme suas órbitas: a média é de ~225 milhões de km. Na máxima aproximação registrada pode chegar a ~54,6 milhões de km, e no ponto mais distante passa de 400 milhões de km. Do Sol, Marte fica a ~228 milhões de km (1,52 UA)."],
["distancia lua|distancia terra lua|lua distancia|longe lua|terra lua",
 "🌙 A distância média entre a Terra e a Lua é de cerca de 384.400 km (variando entre ~363 mil km no perigeu e ~405 mil km no apogeu). A luz leva cerca de 1,28 segundo para ir da Terra à Lua."],
["distancia sol|distancia terra sol|sol distancia|longe sol|unidade astronomica",
 "☀️ A Terra fica em média a ~149,6 milhões de km do Sol — distância chamada de 1 Unidade Astronômica (UA). A luz solar leva cerca de 8 minutos e 20 segundos para chegar aqui."],
["distancia mercurio|mercurio distancia|distancia venus|venus distancia|distancia jupiter|jupiter distancia|distancia saturno|saturno distancia|distancia urano|urano distancia|distancia netuno|netuno distancia",
 "🪐 Distâncias médias dos planetas até o Sol:\n• Mercúrio: ~58 milhões de km (0,39 UA)\n• Vênus: ~108 milhões de km (0,72 UA)\n• Terra: ~150 milhões de km (1 UA)\n• Marte: ~228 milhões de km (1,52 UA)\n• Júpiter: ~778 milhões de km (5,2 UA)\n• Saturno: ~1,43 bilhão de km (9,5 UA)\n• Urano: ~2,87 bilhões de km (19,2 UA)\n• Netuno: ~4,5 bilhões de km (30 UA)"],
["ano luz|anos luz",
 "✨ Um ano-luz é a distância que a luz percorre no vácuo em 1 ano: cerca de 9,46 trilhões de km (não é medida de tempo, e sim de distância!)."],
["andromeda|galaxia mais proxima|distancia andromeda",
 "🌌 A galáxia espiral grande mais próxima da Via Láctea é Andrômeda (M31), a cerca de 2,5 milhões de anos-luz de distância."],
["sol|estrela sol",
 "☀️ O Sol é uma estrela anã amarela (tipo G) no centro do Sistema Solar. Concentra cerca de 99,86% da massa do sistema. Fica a ~149,6 milhões de km da Terra (1 unidade astronômica) e sua luz leva cerca de 8 minutos e 20 segundos para chegar aqui."],
["lua|satelite natural terra",
 "🌙 A Lua é o único satélite natural da Terra, a cerca de 384.400 km em média. Ela leva ~27,3 dias para dar uma volta na Terra, e o ciclo completo das fases dura ~29,5 dias."],
["velocidade luz|velocidade da luz",
 "💡 No vácuo a luz viaja a 299.792.458 m/s, ou seja, cerca de 300.000 km/s."],
["via lactea|nossa galaxia",
 "🌌 A Via Láctea é a galáxia espiral onde fica o Sistema Solar. Tem algo entre 100 e 400 bilhões de estrelas e cerca de 100 mil anos-luz de diâmetro."],
["estacoes ano|estacoes|causa estacoes|por que existem estacoes",
 "🍂 As estações do ano acontecem porque o eixo da Terra é inclinado cerca de 23,5° em relação à órbita. Quando um hemisfério recebe os raios solares mais diretamente, é verão ali; no outro é inverno. Não é a distância até o Sol que causa isso."],
["rotacao terra|translacao terra|movimentos terra",
 "🌍 A Terra faz dois movimentos principais: **rotação** (gira em torno do próprio eixo em ~23h 56min, causando os dias e noites) e **translação** (dá a volta ao redor do Sol em ~365 dias e 6 horas, originando os anos)."],
["plutao",
 "🪐 Plutão é um planeta anão (desde 2006, decisão da União Astronômica Internacional) no Cinturão de Kuiper. Foi descoberto em 1930 por Clyde Tombaugh."],
["idade terra|idade da terra|quantos anos terra",
 "🌍 A Terra tem cerca de 4,54 bilhões de anos. O Universo tem cerca de 13,8 bilhões."],
["big bang|idade universo|origem universo",
 "💥 O Big Bang é a teoria cosmológica de que o Universo começou há cerca de 13,8 bilhões de anos, a partir de um estado extremamente quente e denso, e vem se expandindo desde então."],
["buraco negro|buracos negros",
 "🕳️ Buraco negro é uma região do espaço onde a gravidade é tão intensa que nem a luz escapa depois de cruzar o chamado horizonte de eventos. Costuma se formar quando uma estrela muito massiva colapsa."],
["tamanho terra|diametro terra|raio terra|circunferencia terra",
 "🌍 A Terra tem raio médio de ~6.371 km (diâmetro ~12.742 km) e circunferência de ~40.075 km no equador."],
["eclipse|eclipse solar|eclipse lunar",
 "🌑 No eclipse solar a Lua passa entre o Sol e a Terra (na lua nova) e cobre o Sol. No eclipse lunar a Terra fica entre o Sol e a Lua (na lua cheia) e sua sombra escurece a Lua."],
["gravidade",
 "🍎 Gravidade é a força de atração entre corpos com massa. Na superfície da Terra a aceleração é ≈ 9,8 m/s². Na Lua é ≈ 1,6 m/s² (cerca de 1/6)."],
["leis newton|lei newton|tres leis newton",
 "⚙️ As 3 leis de Newton: 1) Inércia: um corpo mantém seu estado de repouso ou movimento se nenhuma força resultante agir sobre ele. 2) F = m·a: a força resultante é massa vezes aceleração. 3) Ação e reação: toda ação tem uma reação de mesma intensidade e sentido oposto."],
["mc|energia massa|relatividade|teoria relatividade|einstein relatividade",
 "⚛️ E = mc² é a equação de Einstein (relatividade restrita, 1905): energia (E) é igual à massa (m) vezes a velocidade da luz (c) ao quadrado. Mostra que massa e energia são equivalentes."],
["atomo|atomos|estrutura atomo",
 "⚛️ O átomo tem um núcleo com prótons (carga +) e nêutrons (sem carga), e elétrons (carga −) ao redor. O número de prótons define o elemento químico."],
["estados materia|estados fisicos materia|estado fisico|estados fisicos",
 "🧊 Os estados físicos da matéria mais comuns são sólido, líquido e gasoso. Há também o plasma (gás ionizado, como no Sol)."],
["agua formula|composicao agua|h2o|formula agua|ponto ebulicao agua|agua ferve|agua congela|ponto congelamento agua|temperatura ebulicao agua",
 "💧 A água é H₂O: dois átomos de hidrogênio e um de oxigênio. Ao nível do mar ela congela a 0 °C e ferve a 100 °C (a temperatura de ebulição cai com a altitude)."],
["som|velocidade som|velocidade do som|barreira som|mach",
 "🔊 No ar a 20 °C o som viaja a cerca de 343 m/s (≈ 1.235 km/h — velocidade conhecida como Mach 1). Na água é mais rápido (~1.480 m/s)."],
["lei ohm|corrente eletrica|ohm",
 "⚡ Lei de Ohm: V = R · I (tensão em volts = resistência em ohms × corrente em ampères). Potência elétrica: P = V · I."],
["cores primarias|cor primaria|rgb|cores primarias luz",
 "🎨 Depende do sistema: na luz (telas) as primárias são vermelho, verde e azul (RGB). Na impressão são ciano, magenta e amarelo (CMY). No ensino tradicional de artes: vermelho, amarelo e azul."],
["ceu azul|cor ceu|por que ceu azul",
 "🌤️ O céu é azul por causa do espalhamento de Rayleigh: a atmosfera espalha mais a luz azul (comprimento de onda curto) do Sol do que a vermelha. No pôr do sol a luz atravessa mais atmosfera e predominam os tons avermelhados."],
["efeito estufa|aquecimento global",
 "🌡️ O efeito estufa é a retenção de calor na atmosfera por gases como vapor de água, CO₂ e metano. Ele é natural e essencial para a vida. O aquecimento global é o reforço desse efeito pelo aumento desses gases por atividades humanas (queima de combustíveis fósseis, desmatamento), consenso entre as principais instituições científicas, como o IPCC."],
["ciclo agua|ciclo da agua|ciclo hidrologico",
 "💧 Ciclo da água: evaporação (e transpiração das plantas) → condensação (formam-se nuvens) → precipitação (chuva, neve) → escoamento e infiltração, e o ciclo recomeça."],
["fotossintese",
 "🌱 Fotossíntese é o processo em que plantas, algas e algumas bactérias usam luz, água e gás carbônico para produzir glicose e liberar oxigênio: 6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂. Ocorre nos cloroplastos, graças à clorofila."],
["dna|adn|acido desoxirribonucleico",
 "🧬 DNA (ácido desoxirribonucleico) é a molécula que guarda a informação genética, em forma de dupla hélice. Usa quatro bases: adenina (A), timina (T), citosina (C) e guanina (G); A pareia com T e C com G."],
["celula|celulas",
 "🔬 A célula é a unidade básica da vida. Células procariontes (bactérias) não têm núcleo definido; as eucariontes (animais, plantas, fungos) têm núcleo e organelas."],
["mitocondria|mitocondrias",
 "🔋 A mitocôndria é a organela que produz a maior parte do ATP, a energia usada pela célula, na respiração celular."],
["ossos corpo humano|quantos ossos|ossos humano|esqueleto humano",
 "🦴 O corpo humano adulto tem 206 ossos. Bebês nascem com cerca de 270 a 300 peças, que vão se fundindo."],
["coracao|coracao humano",
 "❤️ O coração humano tem 4 câmaras (2 átrios e 2 ventrículos) e bombeia o sangue pelo corpo. Em repouso, um adulto saudável costuma ter 60 a 100 batimentos por minuto."],
["maior orgao corpo humano|maior orgao|maior orgao corpo",
 "🫶 O maior órgão do corpo humano é a pele."],
["tipos sanguineos|tipo sanguineo|grupos sanguineos|tipos sangue",
 "🩸 Os principais grupos sanguíneos (sistema ABO) são A, B, AB e O, cada um podendo ser Rh positivo (+) ou negativo (−). O tipo O− é doador universal de hemácias e AB+ é receptor universal."],
["maior animal|maior animal mundo|maior animal planeta",
 "🐋 O maior animal que já existiu (e existe hoje) é a baleia-azul: até ~30 m de comprimento e ~150 toneladas ou mais."],
["maior animal terrestre",
 "🐘 O maior animal terrestre é o elefante-africano (de savana), com até ~6 toneladas."],
["extincao dinossauros|dinossauros extincao|por que dinossauros extintos|dinossauros",
 "🦖 Os dinossauros não-avianos foram extintos há cerca de 66 milhões de anos, após o impacto de um grande asteroide (cratera de Chicxulub, México), somado a efeitos climáticos e vulcanismo. As aves são descendentes de dinossauros."],
["evolucao|selecao natural|darwin",
 "🐒 Evolução é a mudança das características das populações ao longo das gerações. Charles Darwin propôs a seleção natural em 'A Origem das Espécies' (1859): indivíduos mais adaptados ao ambiente tendem a deixar mais descendentes."],
["pi|numero pi",
 "🔢 Pi (π) é a razão entre a circunferência de um círculo e seu diâmetro: ≈ 3,14159265. É um número irracional (infinitas casas decimais sem repetição)."],
["teorema pitagoras|pitagoras",
 "📐 Teorema de Pitágoras: em um triângulo retângulo, a² + b² = c², onde c é a hipotenusa (lado oposto ao ângulo reto) e a, b são os catetos."],
["bhaskara|formula bhaskara|equacao segundo grau",
 "📐 Para ax² + bx + c = 0: Δ = b² − 4ac e x = (−b ± √Δ) / 2a. Se Δ > 0 há duas raízes reais; se Δ = 0, uma; se Δ < 0, nenhuma real."],
["numero primo|numeros primos|primo",
 "🔢 Número primo é um natural maior que 1 divisível apenas por 1 e por ele mesmo. Os primeiros: 2, 3, 5, 7, 11, 13, 17, 19, 23… O 2 é o único primo par."],
["area circulo|area triangulo|area retangulo|area quadrado|formulas area|perimetro",
 "📐 Áreas: retângulo = base × altura; quadrado = lado²; triângulo = base × altura ÷ 2; círculo = π × r². Circunferência = 2 × π × r."],
["porcentagem|calcular porcentagem|como calcular porcentagem",
 "➗ Para achar x% de um valor N: N × x ÷ 100 (ex.: 20% de 150 = 150 × 20 ÷ 100 = 30). Para saber quantos % A é de B: A ÷ B × 100."],
["fatorial",
 "🔢 Fatorial de n (n!) é o produto de todos os inteiros de 1 até n. Ex.: 5! = 5×4×3×2×1 = 120. Por definição, 0! = 1."],
["juros compostos|juros composto",
 "💰 Juros compostos incidem sobre o capital e também sobre os juros já acumulados: M = C × (1 + i)^t, onde C é o capital, i a taxa por período e t o número de períodos."],
["inflacao",
 "📈 Inflação é o aumento generalizado e contínuo dos preços, que reduz o poder de compra da moeda. No Brasil é medida principalmente pelo IPCA (IBGE)."],
["pib|produto interno bruto",
 "📊 PIB (Produto Interno Bruto) é a soma de todos os bens e serviços finais produzidos em um país em um período. É o principal indicador do tamanho da economia."],
["selic|taxa selic",
 "🏦 A Selic é a taxa básica de juros da economia brasileira, definida pelo Copom do Banco Central. Serve de referência para os demais juros. (O valor muda a cada reunião: consulte o site do Banco Central para o número atual.)"],
["estados brasil|quantos estados brasil|estados brasileiros",
 "🇧🇷 O Brasil tem 26 estados e 1 Distrito Federal (Brasília), somando 27 unidades federativas."],
["regioes brasil|regioes brasileiras|quantas regioes brasil",
 "🇧🇷 O Brasil tem 5 regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul."],
["populacao brasil|habitantes brasil|quantos habitantes brasil",
 "🇧🇷 Segundo o Censo 2022 do IBGE, o Brasil tinha cerca de 203 milhões de habitantes."],
["independencia brasil|7 setembro|sete setembro",
 "🇧🇷 A Independência do Brasil foi proclamada por Dom Pedro I em 7 de setembro de 1822, às margens do riacho do Ipiranga (São Paulo)."],
["proclamacao republica|republica brasil|15 novembro",
 "🇧🇷 A República foi proclamada em 15 de novembro de 1889, liderada pelo marechal Deodoro da Fonseca, que se tornou o primeiro presidente."],
["descobrimento brasil|descobriu brasil|chegada portugueses brasil|pedro alvares cabral",
 "🇧🇷 A esquadra de Pedro Álvares Cabral chegou ao território hoje brasileiro em 22 de abril de 1500 (Porto Seguro, Bahia)."],
["lei aurea|abolicao escravidao brasil|abolicao",
 "🇧🇷 A Lei Áurea, assinada pela princesa Isabel em 13 de maio de 1888, aboliu a escravidão no Brasil."],
["maior pais|maior pais mundo",
 "🌍 O maior país do mundo em área é a Rússia (~17,1 milhões de km²). O Brasil é o 5º maior."],
["menor pais|menor pais mundo",
 "🌍 O menor país do mundo é o Vaticano (~0,44 km²)."],
["pais mais populoso|mais populoso pais|pais maior populacao",
 "🌍 A Índia é o país mais populoso (superou a China em 2023), com cerca de 1,4 bilhão de habitantes."],
["populacao mundial|habitantes mundo|populacao mundo|quantas pessoas mundo",
 "🌍 A população mundial é de cerca de 8,1 bilhões de pessoas (estimativa da ONU para 2024). O número cresce todo ano."],
["maior oceano|oceano maior",
 "🌊 O maior oceano é o Pacífico: cerca de 165 milhões de km², aproximadamente um terço da superfície da Terra."],
["fossa marianas|ponto mais profundo oceano|lugar mais fundo mar",
 "🌊 O ponto mais profundo dos oceanos é a Fossa das Marianas (no Oceano Pacífico), com quase 11 km de profundidade (~10.984 m)."],
["continentes|quantos continentes",
 "🌍 Depende do modelo: 6 continentes (África, América, Antártida, Ásia, Europa e Oceania) ou 7, quando América do Norte e América do Sul são contadas separadas."],
["rio mais longo|maior rio|rio maior|rio mais extenso",
 "🌊 O Nilo (~6.650 km) e o Amazonas (~6.400 km) disputam o título de rio mais longo, dependendo de como se mede a nascente. O Amazonas é o maior em volume de água e o maior da Terra nesse critério."],
["maior montanha|montanha mais alta|monte everest|everest",
 "🏔️ O Monte Everest (Himalaia, entre Nepal e Tibete) é a montanha mais alta acima do nível do mar: 8.849 m."],
["maior deserto|deserto maior",
 "🏜️ O maior deserto do mundo é a Antártida (~14 milhões de km², deserto polar). O maior deserto quente é o Saara (~9 milhões de km²)."],
["amazonia|floresta amazonica|floresta amazonia",
 "🌳 A Amazônia é a maior floresta tropical do mundo, com cerca de 5,5 milhões de km² de floresta (a bacia tem ~6,9 milhões). Aproximadamente 60% fica no Brasil."],
["segunda guerra mundial|segunda guerra|ii guerra mundial",
 "📜 A Segunda Guerra Mundial durou de 1939 (invasão da Polônia pela Alemanha, 1º de setembro) a 1945 (rendição alemã em maio e japonesa em 2 de setembro). Opôs os Aliados ao Eixo (Alemanha, Itália e Japão)."],
["primeira guerra mundial|primeira guerra|i guerra mundial",
 "📜 A Primeira Guerra Mundial ocorreu de 1914 a 1918. O estopim foi o assassinato do arquiduque Francisco Ferdinando, em Sarajevo."],
["revolucao francesa",
 "📜 A Revolução Francesa começou em 1789 (com a Queda da Bastilha, 14 de julho) e derrubou a monarquia absolutista, trazendo o lema 'Liberdade, Igualdade e Fraternidade'."],
["muro berlim|queda muro berlim",
 "📜 O Muro de Berlim foi construído em 1961 e caiu em 9 de novembro de 1989. A Alemanha foi reunificada em 3 de outubro de 1990."],
["homem lua|chegada lua|apollo 11|primeiro homem lua",
 "🚀 Em 20 de julho de 1969 a missão Apollo 11 (NASA) pousou na Lua. Neil Armstrong foi o primeiro a pisar nela, seguido por Buzz Aldrin."],
["descoberta america|colombo|cristovao colombo",
 "⛵ Cristóvão Colombo chegou à América em 12 de outubro de 1492, numa expedição financiada pela Espanha, achando que estava chegando às Índias."],
["revolucao industrial",
 "🏭 A Revolução Industrial começou na Inglaterra na segunda metade do século XVIII (~1760), com a mecanização da produção têxtil e o uso da máquina a vapor."],
["queda imperio romano|queda roma|fim imperio romano",
 "🏛️ O Império Romano do Ocidente caiu em 476 d.C., quando Odoacro depôs o imperador Rômulo Augústulo. O do Oriente (Bizantino) durou até 1453."],
["piramides gize|piramide queops|piramides egito",
 "🔺 As pirâmides de Gizé (Egito) foram construídas como tumbas de faraós há cerca de 4.500 anos. A Grande Pirâmide é a de Quéops (~2560 a.C.), com ~139 m de altura atual."],
["quem inventou aviao|irmaos wright|santos dumont",
 "✈️ Os irmãos Wright realizaram o primeiro voo controlado e motorizado em 1903 (com auxílio de trilho/catapulta), enquanto Alberto Santos Dumont fez em 1906, em Paris, o famoso voo público do 14-Bis decolando por meios próprios."],
["quem inventou lampada|thomas edison",
 "💡 Thomas Edison aperfeiçoou e comercializou a lâmpada elétrica incandescente prática em 1879, após vários inventores anteriores (como Humphry Davy e Joseph Swan) desenvolverem protótipos."],
["quem inventou telefone|graham bell",
 "📞 Alexander Graham Bell patenteou o telefone em 1876 (Antonio Meucci já havia construído protótipos anos antes)."],
["quem inventou computador|charles babbage|alan turing",
 "💻 Charles Babbage projetou a Máquina Analítica no século XIX (com algoritmos de Ada Lovelace), e Alan Turing formalizou a base da computação moderna nos anos 1930-40."],
["internet|o que e internet",
 "🌐 Internet é a rede mundial de redes de computadores interligadas, que trocam dados por protocolos como o TCP/IP. A Web (sites, navegadores, HTTP) é só um dos serviços que rodam nela. Sua origem é a ARPANET, nos anos 1960-70."],
["inteligencia artificial",
 "🤖 Inteligência artificial é a área da computação que cria sistemas capazes de executar tarefas que normalmente exigem inteligência humana, como entender linguagem, reconhecer imagens ou tomar decisões. Hoje a maior parte vem de aprendizado de máquina, em que o sistema aprende padrões a partir de dados."],
["chatgpt|chat gpt",
 "🤖 ChatGPT é um assistente conversacional de IA da OpenAI, baseado em grandes modelos de linguagem (família GPT), lançado em novembro de 2022."],
["claude",
 "🤖 Claude é uma família de assistentes de IA desenvolvida pela Anthropic, baseada em grandes modelos de linguagem."],
["gemini|gemini google",
 "🤖 Gemini é a família de modelos de IA desenvolvida pelo Google."],
["llm|modelo linguagem|grande modelo linguagem|modelos linguagem",
 "🤖 LLM (grande modelo de linguagem) é uma rede neural treinada com enormes quantidades de texto para prever a próxima palavra. Dessa tarefa simples surge a capacidade de conversar, resumir, traduzir e programar."],
["bit|byte|quantos bits byte",
 "💾 Bit é a menor unidade de informação (0 ou 1). 1 byte = 8 bits. 1 KB = 1.000 bytes (ou 1.024 no uso binário, KiB), 1 MB = 1.000 KB, 1 GB = 1.000 MB."],
["sistema binario|binario|numero binario",
 "💻 O sistema binário usa só 0 e 1 (base 2). Cada posição vale uma potência de 2: 101₂ = 1×4 + 0×2 + 1×1 = 5. Computadores usam binário porque circuitos têm dois estados (ligado/desligado)."],
["cpu|processador",
 "💻 CPU (processador) é o 'cérebro' do computador: executa as instruções dos programas, fazendo cálculos e controlando as outras partes."],
["ram|memoria ram",
 "💻 RAM é a memória de trabalho do computador: rápida e temporária (apaga ao desligar), guarda o que está em uso agora. O armazenamento (SSD/HD) guarda os arquivos de forma permanente."],
["sistema operacional",
 "💻 Sistema operacional é o programa que gerencia o hardware e permite rodar os outros programas. Exemplos: Windows, macOS, Linux, Android e iOS."],
["http|https",
 "🔒 HTTP é o protocolo usado pelos navegadores para pedir e receber páginas. HTTPS é o mesmo protocolo com criptografia (TLS), que protege os dados no caminho."],
["dns|dominio",
 "🌐 DNS é o sistema que traduz nomes (como exemplo.com) em endereços IP numéricos, a 'lista telefônica' da internet. Domínio é o nome registrado de um site."],
["alfabeto portugues|quantas letras alfabeto|letras alfabeto",
 "🔤 O alfabeto da língua portuguesa tem 26 letras (K, W e Y foram oficializadas pelo Acordo Ortográfico, em vigor no Brasil desde 2009)."],
["notas musicais|notas musica",
 "🎵 As sete notas musicais são: dó, ré, mi, fá, sol, lá, si."],
["ano bissexto|anos bissextos|quantos dias ano",
 "📅 Um ano comum tem 365 dias e o bissexto tem 366 (fevereiro ganha o dia 29). São bissextos os anos divisíveis por 4, exceto os divisíveis por 100 que não sejam também por 400 (2000 foi bissexto; 1900 não)."],
["milha km|quantos km milha|1 milha|milha em km",
 "📏 1 milha ≈ 1,609 km. Para converter km em milhas, divida por 1,609."],
["celsius fahrenheit|converter celsius fahrenheit|fahrenheit celsius",
 "🌡️ °F = °C × 9/5 + 32. E °C = (°F − 32) × 5/9. Exemplo: 25 °C = 77 °F."]
];

FATOS.push(...MAIS);

const BASE = FATOS.map(([k, r]) => ({
  frases: k.split("|").map(f => new Set(toks(f))).filter(s => s.size),
  r
}));

const CAPITAIS = {
  "brasil": ["Brasil", "Brasília"], "franca": ["França", "Paris"], "alemanha": ["Alemanha", "Berlim"],
  "italia": ["Itália", "Roma"], "espanha": ["Espanha", "Madri"], "portugal": ["Portugal", "Lisboa"],
  "argentina": ["Argentina", "Buenos Aires"], "chile": ["Chile", "Santiago"], "uruguai": ["Uruguai", "Montevidéu"],
  "paraguai": ["Paraguai", "Assunção"], "peru": ["Peru", "Lima"], "colombia": ["Colômbia", "Bogotá"],
  "venezuela": ["Venezuela", "Caracas"], "equador": ["Equador", "Quito"], "mexico": ["México", "Cidade do México"],
  "estados unidos": ["Estados Unidos", "Washington, D.C."], "eua": ["Estados Unidos", "Washington, D.C."],
  "canada": ["Canadá", "Ottawa"], "japao": ["Japão", "Tóquio"], "china": ["China", "Pequim"],
  "india": ["Índia", "Nova Délhi"], "russia": ["Rússia", "Moscou"], "reino unido": ["Reino Unido", "Londres"],
  "inglaterra": ["Inglaterra", "Londres"], "australia": ["Austrália", "Camberra"], "egito": ["Egito", "Cairo"],
  "turquia": ["Turquia", "Ancara"], "coreia do sul": ["Coreia do Sul", "Seul"], "suica": ["Suíça", "Berna"],
  "belgica": ["Bélgica", "Bruxelas"], "grecia": ["Grécia", "Atenas"], "suecia": ["Suécia", "Estocolmo"],
  "noruega": ["Noruega", "Oslo"], "angola": ["Angola", "Luanda"], "mocambique": ["Moçambique", "Maputo"],
  "nigeria": ["Nigéria", "Abuja"], "arabia saudita": ["Arábia Saudita", "Riade"], "ira": ["Irã", "Teerã"],
  "cuba": ["Cuba", "Havana"], "polonia": ["Polônia", "Varsóvia"], "austria": ["Áustria", "Viena"],
  "irlanda": ["Irlanda", "Dublin"], "ucrania": ["Ucrânia", "Kiev"], "nova zelandia": ["Nova Zelândia", "Wellington"]
};

const VOC = new Set(); BASE.forEach(e => e.frases.forEach(f => f.forEach(w => VOC.add(w))));
function lev(a, b) {
  let p = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const c = [i];
    for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    p = c;
  }
  return p[b.length];
}
function consertar(lista) {
  return lista.map(w => {
    if (w.length < 4 || VOC.has(w)) return w;
    let melhor = null, n = 0;
    for (const v of VOC) {
      if (Math.abs(v.length - w.length) > 1 || v.length < 4) continue;
      if (lev(w, v) <= 1) { melhor = v; n++; }
    }
    return n === 1 ? melhor : w;
  });
}

function capital(t) {
  const m = t.match(/^(?:(?:qual|me diga|diga) (?:e )?)?(?:a )?capital (?:d[aeo]s? )?(.+)$/);
  if (!m) return null;
  const nome = m[1].replace(/\b(mesmo|mesma|hoje|atual)\b/g, "").trim();
  const c = CAPITAIS[nome];
  return c ? "🏙️ Capital — " + c[0] + ": " + c[1].replace(/\.$/, "") + "." : null;
}

function responder(texto) {
  const t = norm(texto).replace(/\bbash\b/g, "bach");
  if (!t) return null;
  const cap = capital(t);
  if (cap) return cap;
  const q = new Set(consertar(toks(texto)));
  if (!q.size) return null;
  let melhor = null, nota = 0;
  for (const e of BASE) {
    for (const f of e.frases) {
      if (f.size === 1 && [...f][0].length < 4) continue;
      let tudo = true;
      for (const w of f) if (!q.has(w)) { tudo = false; break; }
      if (!tudo) continue;
      const cob = f.size / q.size;
      if (cob < 0.75) continue;
      const n = cob + f.size * 0.01;
      if (n > nota) { nota = n; melhor = e; }
    }
  }
  return melhor ? melhor.r : null;
}

const SOBRE = {
  nome: "Meu nome é BACH AI 🧠.",
  quem: "Sou a BACH AI 🧠, sua assistente inteligente própria! Converso, guardo memórias, traduzo idiomas, pesquiso na web, analiso textos, códigos, fotos e vídeos, escrevo rascunhos, calculo e jogo com você.",
  servir: "Eu sirvo para:\n• conversar, lembrar do que você me conta e aprender respostas novas (ensine: pergunta => resposta)\n• atuar em 10 modos (Automático, Raciocínio, Pesquisa, Aprendizado, Programação, Matemática, Imagens, Voz, Criatividade, Documentos)\n• recomendar filmes por gênero, séries, animes e músicas\n• escrever textos, e-mails, planos de estudo e comparações\n• traduzir palavras e pesquisar na internet citando as fontes\n• ler textos, códigos, links, fotos e vídeos.",
  como: "Funciono de forma integrada, juntando memória local, compreensão natural, ferramentas próprias (cálculo, código, dicionário, OCR de imagens) e pesquisa online automática quando preciso de informação atual.",
  ia: "Sou a BACH AI — uma inteligência própria desenvolvida especialmente no seu projeto, privada, rápida e que aprende com o que você ensina.",
  erro: "Você tem razão em cobrar. Quando alguma resposta sair fora do alvo, você pode reformular com mais contexto ou me ensinar a resposta certa com: corrija: pergunta => resposta certa.",
  limite: "Ainda estou evoluindo: em vídeos e fotos sem texto escrito eu descrevo cores, dimensões e iluminação (e leio textos escritos em prints!), mas não identifico rostos nem executo código diretamente.",
  melhor: "Meu diferencial é ser 100% sua, rodar leve direto no seu aparelho, guardar suas preferências e combinar ferramentas práticas com pesquisa na internet na hora."
};

function sobreMim(texto) {
  const t = norm(texto).replace(/\bbash\b/g, "bach").replace(/\b(oq|oqe|oque)\b/g, "o que").replace(/\bvc\b/g, "voce").replace(/\bpra\b/g, "para");
  const eu = "(?:voce|a bach|bach|a bach ai|bach ai)";
  if (/\b(qual|como) (e )?(o )?(seu nome|voce se chama)\b/.test(t) || /^como voce se chama$/.test(t)) return SOBRE.nome;
  if (new RegExp("\\b(quem|o que) (e|eh) " + eu + "\\b").test(t) || /^quem e voce/.test(t)) return SOBRE.quem;
  if ((/\b(voce|bach)\b/.test(t) && /\b(serve|servir|presta|funciona|utilidade)\b/.test(t)) ||
      /\b(qual|quais) (e )?(a |as )?(sua|suas) (funcao|funcoes|utilidade|objetivo|proposito|capacidades)\b/.test(t) ||
      /\bpara que voce foi (criada|feita|criado|feito)\b/.test(t)) return SOBRE.servir;
  if (new RegExp("\\bcomo " + eu + " (funciona|pensa|aprende|responde|e feita)\\b").test(t) ||
      /\bvoce (usa|roda|funciona com|e feita com) (ia|inteligencia artificial|internet|api)\b/.test(t)) return SOBRE.como;
  if (/\bvoce e (uma |um )?(ia|inteligencia artificial|robo|chatgpt|humana|gente|pessoa|real)\b/.test(t)) return SOBRE.ia;
  if (/\bvoce (esta|ta|anda|so|vive|sempre|muito|ainda) (errando|errada|falhando|dando errado|entendendo)\b/.test(t) ||
      /\b(errando voce|falou errado|voce errou|voce esta errando|ta errando)\b/.test(t) ||
      /\b(respostas?) (erradas?|diferentes|trocadas)\b/.test(t) ||
      /\bpor que voce nao entende\b/.test(t) || /\bvoce nao (entende|entendeu)\b/.test(t)) return SOBRE.erro;
  if (/\b(suas|quais (sao )?(as )?(suas )?) ?(limitacoes|limites)\b/.test(t) || /\bvoce nao (consegue|sabe) tudo\b/.test(t)) return SOBRE.limite;
  if (/\bvoce e (melhor|igual|parecida?) (que|do|de|ao|com) (o )?(chatgpt|claude|gemini)\b/.test(t) ||
      /\b(melhor|igual) (que|do|de|ao) (o )?(chatgpt|claude|gemini)\b.*\bvoce\b/.test(t)) return SOBRE.melhor;
  return null;
}

const semEmoji = s => String(s).replace(/^[^\p{L}\p{N}"“(]+/u, "").trim();
const maiuscula = s => s.charAt(0).toUpperCase() + s.slice(1);
const corpo = t => String(t || "").split(/\n\s*(?:Fontes|🔍|ℹ️|💾|🚫)/)[0].trim();
const dividirFrases = str => String(str || "").replace(/([.!?])\s+/g, "$1\n").split("\n").map(x => x.trim()).filter(Boolean);

function enumerar(texto) {
  const base = corpo(texto);
  if (!base) return null;
  const plano = base.replace(/\s+/g, " ");
  const m = plano.match(/([^.:!?]{0,200}):\s*([^.!?]+?)[.!?](?:\s|$)/);
  if (m) {
    const itens = m[2].split(/\s*,\s*|\s+e\s+/).map(x => x.trim()).filter(x => x && x.length < 60);
    if (itens.length >= 3) return "🔢 " + semEmoji(m[1]) + ":\n" + itens.map((x, i) => (i + 1) + ". " + maiuscula(x)).join("\n");
  }
  const linhas = base.split("\n").map(l => l.replace(/^[•\-*]\s*|^\d+[.)]\s*/, "").replace(/\s*\[\d+\]/g, "").trim())
    .filter(l => l.length > 25 && !/^(Além disso|Fontes|Sobre|Pesquisei|Aqui está)/.test(l));
  const fr = (linhas.length >= 2 ? linhas : dividirFrases(plano).map(semEmoji).filter(l => l.length > 25)).slice(0, 12);
  return fr.length >= 2 ? "🔢 Em numeração:\n" + fr.map((x, i) => (i + 1) + ". " + x).join("\n") : null;
}

function resumir(texto) {
  const base = corpo(texto).replace(/\s*\[\d+\]/g, "").replace(/\s+/g, " ");
  const fr = dividirFrases(base).map(semEmoji).filter(s => s.length > 25);
  return fr.length ? "📝 Resumindo: " + fr.slice(0, 2).join(" ") : null;
}

const sobreVoce = texto => /\b(voce|vc|bach|bash)\b/.test(norm(texto));

export const Fatos = { responder, sobreMim, sobreVoce, enumerar, resumir, total: FATOS.length };

/* BACH AI - DICIONÁRIO 2.1
   Dicionário brasileiro + sinônimos/antônimos + tradução flexível em várias línguas. */

const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s'’-]/g, " ").replace(/\s+/g, " ").trim();
const normCmd = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

export const LINGUAS = {
  en: ["ingles", "english"], es: ["espanhol", "castelhano", "spanish"], fr: ["frances", "french"], it: ["italiano", "italian"],
  de: ["alemao", "german"], pt: ["portugues", "portuguese"], ja: ["japones", "japanese"], zh: ["chines", "mandarim", "chinese"],
  ru: ["russo", "russian"], ko: ["coreano", "korean"], ar: ["arabe", "arabic"], nl: ["holandes", "neerlandes", "dutch"],
  tr: ["turco", "turkish"], el: ["grego", "greek"], la: ["latim", "latin"], hi: ["hindi"], pl: ["polones", "polish"], sv: ["sueco", "swedish"]
};
const NOME = { en: "inglês", es: "espanhol", fr: "francês", it: "italiano", de: "alemão", pt: "português", ja: "japonês", zh: "chinês", ru: "russo", ko: "coreano", ar: "árabe", nl: "holandês", tr: "turco", el: "grego", la: "latim", hi: "hindi", pl: "polonês", sv: "sueco" };
const BANDEIRA = { en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", it: "🇮🇹", de: "🇩🇪", ja: "🇯🇵", zh: "🇨🇳", ru: "🇷🇺", ko: "🇰🇷", pt: "🇧🇷" };
const lingua = n => { n = norm(n); for (const [c, v] of Object.entries(LINGUAS)) if (v.includes(n)) return c; return null; };
const LRE = Object.values(LINGUAS).flat().join("|");

/* ---------- português (offline) ---------- */
const PT = `saudade|substantivo feminino|sentimento de falta e carinho por alguém, algum lugar ou momento que ficou no passado. Palavra típica do português.
cafuné|substantivo masculino|carinho feito passando os dedos suavemente entre os cabelos de alguém.
efêmero|adjetivo|que dura pouco; passageiro. Ex.: "A fama é efêmera."
ubíquo|adjetivo|que está em toda parte ao mesmo tempo. Ex.: "O celular se tornou ubíquo."
ambíguo|adjetivo|que permite mais de uma interpretação; duvidoso ou pouco claro.
resiliência|substantivo feminino|capacidade de se recuperar de dificuldades e se adaptar a mudanças; em física, de um material voltar à forma original.
empatia|substantivo feminino|capacidade de entender o que o outro sente, colocando-se no lugar dele.
simpatia|substantivo feminino|afinidade ou jeito agradável de tratar as pessoas. (Diferente de empatia, que é compreender o sentimento do outro.)
ética|substantivo feminino|conjunto de princípios sobre o que é certo e errado na conduta das pessoas; também o estudo disso.
moral|substantivo feminino|conjunto de regras e valores de uma sociedade ou pessoa sobre o bem e o mal; também a lição de uma história.
sarcasmo|substantivo masculino|ironia cortante, usada para ferir ou zombar, dizendo o contrário do que se quer dizer.
ironia|substantivo feminino|dizer o contrário do que se pensa, ou situação que acontece de modo oposto ao esperado.
paradoxo|substantivo masculino|afirmação ou situação aparentemente contraditória, mas que pode ter sentido. Ex.: "Menos é mais."
eloquente|adjetivo|que fala bem e convence; expressivo.
procrastinar|verbo|adiar tarefas importantes de forma repetida, deixando para depois.
procrastinação|substantivo feminino|hábito de adiar tarefas importantes para depois.
altruísmo|substantivo masculino|preocupação e ação em favor do bem dos outros, sem esperar algo em troca.
egoísmo|substantivo masculino|amor excessivo a si mesmo, pensando só no próprio interesse.
hipócrita|adjetivo e substantivo|quem finge ter virtudes ou sentimentos que não tem.
pragmático|adjetivo|prático; que se guia pelos resultados e pela utilidade das coisas.
ceticismo|substantivo masculino|atitude de duvidar e pedir provas antes de aceitar algo como verdade.
concisão|substantivo feminino|qualidade de dizer o necessário com poucas palavras.
plausível|adjetivo|que parece verdadeiro ou possível; aceitável.
inerente|adjetivo|que faz parte da natureza de algo; inseparável.
efetivo|adjetivo|real, que produz efeito; também funcionário fixo. (Não confundir com afetivo.)
afetivo|adjetivo|relativo a afeto, carinho, sentimentos.
eminente|adjetivo|elevado, notável. (Não confundir com iminente.)
iminente|adjetivo|que está prestes a acontecer. Ex.: "chuva iminente".
mal|advérbio ou substantivo|oposto de bem. Ex.: "Passei mal." / "O mal da pressa."
mau|adjetivo|oposto de bom. Ex.: "um mau aluno".
ótimo|adjetivo|muito bom; excelente.
sutil|adjetivo|delicado, fino, quase imperceptível.
altivo|adjetivo|orgulhoso, de postura elevada.
arcaico|adjetivo|muito antigo; fora de uso.
benevolente|adjetivo|que deseja e faz o bem; generoso.
cabisbaixo|adjetivo|de cabeça baixa; triste ou envergonhado.
catártico|adjetivo|que provoca alívio emocional, como uma limpeza interna.
cônscio|adjetivo|ciente, consciente de algo.
desdém|substantivo masculino|desprezo, indiferença com ar de superioridade.
dicotomia|substantivo feminino|divisão de algo em duas partes opostas.
efusivo|adjetivo|que demonstra alegria ou afeto com intensidade.
empírico|adjetivo|baseado na experiência e na observação, não só na teoria.
enigma|substantivo masculino|mistério difícil de entender ou resolver; charada.
epifania|substantivo feminino|revelação súbita; momento em que se percebe algo importante.
esdrúxulo|adjetivo|estranho, excêntrico; em gramática, palavra com acento na antepenúltima sílaba.
estoico|adjetivo|que suporta dor e dificuldade com serenidade; seguidor do estoicismo.
exímio|adjetivo|excelente, muito hábil em algo.
fugaz|adjetivo|que passa depressa; fugidio.
genuíno|adjetivo|autêntico, verdadeiro, sem falsidade.
holístico|adjetivo|que considera o todo, e não só as partes.
idiossincrasia|substantivo feminino|jeito próprio e peculiar de ser, sentir ou reagir de cada pessoa.
impávido|adjetivo|sem medo, destemido.
inócuo|adjetivo|que não faz mal; inofensivo, sem efeito.
insólito|adjetivo|incomum, fora do normal.
jocoso|adjetivo|engraçado, brincalhão.
lacônico|adjetivo|que fala pouco, resumido.
letargia|substantivo feminino|estado de sono profundo ou de grande moleza e falta de reação.
melancolia|substantivo feminino|tristeza vaga e prolongada, às vezes com um ar poético.
nostalgia|substantivo feminino|saudade de um tempo ou lugar do passado.
ócio|substantivo masculino|tempo livre, descanso; ociosidade.
onipresente|adjetivo|que está presente em todos os lugares.
perspicaz|adjetivo|que percebe as coisas com rapidez e inteligência.
quimera|substantivo feminino|fantasia, sonho impossível; na mitologia, monstro com partes de vários animais.
resignação|substantivo feminino|aceitação calma de uma situação difícil.
serendipidade|substantivo feminino|descoberta feliz feita por acaso, quando se procurava outra coisa.
tácito|adjetivo|não dito em palavras, mas entendido; implícito.
tenaz|adjetivo|persistente, firme, que não desiste.
utopia|substantivo feminino|lugar ou sociedade ideal e perfeita, difícil de alcançar.
vicissitude|substantivo feminino|mudança de situação; altos e baixos da vida.
zênite|substantivo masculino|ponto mais alto; auge. Ex.: "no zênite da carreira".
ápice|substantivo masculino|ponto mais alto; topo, auge.
acurácia|substantivo feminino|precisão, grau de acerto.
inteligência|substantivo feminino|capacidade de compreender, aprender, raciocinar e resolver problemas.
conhecimento|substantivo masculino|informação, experiência ou saber adquirido pelo estudo ou pela prática.
sabedoria|substantivo feminino|uso sensato do conhecimento e da experiência de vida para tomar boas decisões.
memória|substantivo feminino|capacidade de guardar e lembrar informações; na informática, onde os dados ficam armazenados.
criatividade|substantivo feminino|capacidade de inventar ideias novas, soluções originais ou obras artísticas.
lógica|substantivo feminino|forma organizada e coerente de raciocinar; na programação, sequência de regras que guia o código.
foco|substantivo masculino|atenção concentrada em um objetivo ou tarefa.
disciplina|substantivo feminino|constância e organização para cumprir objetivos mesmo sem vontade no momento.
paciência|substantivo feminino|capacidade de esperar ou lidar com dificuldades mantendo a calma.
respeito|substantivo masculino|consideração e cuidado com os direitos, sentimentos e limites dos outros.
justiça|substantivo feminino|princípio moral e legal de dar a cada um o que é justo e correto.
liberdade|substantivo feminino|direito e condição de escolher e agir por conta própria, respeitando os outros.
honestidade|substantivo feminino|qualidade de agir com verdade, transparência e retidão.
coragem|substantivo feminino|força para agir e enfrentar desafios mesmo sentindo medo.
gratidão|substantivo feminino|reconhecimento e sentimento bom por algo que alguém fez ou pela vida.
esperança|substantivo feminino|confiança de que algo bom pode acontecer no futuro.
confiança|substantivo feminino|crença firme na honestidade, capacidade ou segurança de alguém ou de algo.
amizade|substantivo feminino|relação de afeto, confiança e companheirismo entre pessoas.
família|substantivo feminino|grupo de pessoas ligadas por parentesco, afeto ou convivência próxima.
propósito|substantivo masculino|objetivo principal que dá sentido e direção ao que alguém faz.
ansiedade|substantivo feminino|estado de preocupação intensa, inquietação ou expectativa sobre o que pode acontecer.
estresse|substantivo masculino|reação física e mental de tensão diante de pressão ou excesso de exigências.
autoestima|substantivo feminino|valor e respeito que uma pessoa sente por si mesma.
frustração|substantivo feminino|sentimento de decepção quando algo não sai como esperado.
euforia|substantivo feminino|estado de grande alegria, entusiasmo ou empolgação.
tédio|substantivo masculino|sensação de desânimo ou falta de interesse por não ter algo estimulante para fazer.
tecnologia|substantivo feminino|conjunto de conhecimentos, técnicas e ferramentas criadas para resolver problemas humanos.
ciência|substantivo feminino|estudo sistemático do universo, da natureza e da sociedade baseado em observação e provas.
história|substantivo feminino|estudo do passado humano; também uma narrativa real ou inventada.
cultura|substantivo feminino|conjunto de costumes, artes, línguas, crenças e saberes de um povo.
arte|substantivo feminino|expressão humana criativa por meio de música, pintura, cinema, literatura, dança e outras formas.
economia|substantivo feminino|ciência e atividade ligada à produção, distribuição e uso de bens, serviços e dinheiro.
política|substantivo feminino|atividade e debate sobre como organizar e governar uma sociedade.
natureza|substantivo feminino|conjunto de seres vivos, paisagens, águas e elementos físicos do mundo natural.
universo|substantivo masculino|tudo o que existe no espaço e no tempo: galáxias, estrelas, planetas, matéria e energia.
energia|substantivo feminino|capacidade de realizar trabalho ou produzir movimento, calor e luz.
algoritmo|substantivo masculino|sequência finita de passos para resolver um problema ou realizar uma tarefa.
programação|substantivo feminino|ato de escrever instruções (código) para que computadores e aplicativos executem tarefas.
código|substantivo masculino|conjunto de instruções escritas em uma linguagem de programação; também sistema de sinais secretos.
variável|substantivo feminino|na programação, espaço na memória com um nome que guarda um valor que pode mudar.
função|substantivo feminino|na programação, bloco de código reutilizável que executa uma tarefa e pode devolver um resultado.
servidor|substantivo masculino|computador ou sistema que fornece dados, sites ou serviços para outros dispositivos pela rede.
banco de dados|expressão|sistema organizado para guardar, buscar e atualizar grandes quantidades de informação.
criptografia|substantivo feminino|técnica de embaralhar informações para que só quem tem a chave consiga ler.
api|substantivo feminino|sigla de Interface de Programação de Aplicações: ponte que permite que dois programas conversem entre si.
interface|substantivo feminino|ponto de contato entre duas coisas, como a tela e os botões que o usuário usa num app.
navegador|substantivo masculino|programa usado para abrir sites na internet, como Chrome, Safari, Firefox ou Edge.
repositório|substantivo masculino|pasta ou local online (como o GitHub) onde ficam guardados o código e o histórico de versões de um projeto.
bug|substantivo masculino|erro em um programa que o faz funcionar de modo errado.
cache|substantivo masculino|memória rápida que guarda dados usados com frequência para acelerar o acesso.
nuvem|substantivo feminino|nuvem de chuva; em informática, serviços e armazenamento em servidores na internet.
pixel|substantivo masculino|menor ponto de uma imagem digital.
firmware|substantivo masculino|programa gravado no hardware que o faz funcionar.
mano|substantivo masculino|gíria: irmão; amigo, forma de chamar alguém. Muito usada em São Paulo.
tipo|expressão|gíria: "tipo assim" = "por exemplo"/"mais ou menos"; também usada como muleta de fala.
firmeza|expressão|gíria: tudo certo, ok, "de boa".
daora|adjetivo|gíria paulista: legal, bacana, bom (de "da hora").
trampo|substantivo masculino|gíria: trabalho, emprego.
rolê|substantivo masculino|gíria: passeio, saída para se divertir.
bagulho|substantivo masculino|gíria: coisa, objeto qualquer (às vezes de pouco valor).
zoar|verbo|gíria: fazer brincadeira, tirar sarro de alguém ou bagunçar.
mó|advérbio|gíria: muito. Ex.: "mó legal".
ranço|substantivo masculino|gíria: antipatia ou irritação forte por alguém ou algo.
treta|substantivo feminino|gíria: briga, confusão ou problema complicado.
hype|substantivo masculino|gíria: grande empolgação ou expectativa em volta de algo (filme, jogo, lançamento).
spoiler|substantivo masculino|informação que revela partes importantes de um filme, série, jogo ou livro antes de a pessoa assistir.
cringe|adjetivo|gíria: algo considerado sem graça, forçado ou que dá vergonha alheia.
flopar|verbo|gíria: fracassar, não fazer o sucesso esperado.
tankar|verbo|gíria (dos jogos): aguentar, suportar pressão, dano ou uma situação difícil.
trem|substantivo masculino|veículo sobre trilhos; em Minas Gerais, "coisa" em geral ("passa o trem pra mim").
uai|interjeição|expressão mineira de surpresa ou dúvida, como "ué".
oxente|interjeição|expressão nordestina de surpresa ou espanto.
bah|interjeição|expressão gaúcha de espanto, admiração ou ênfase.
tchê|substantivo masculino|forma gaúcha de chamar alguém, como "cara" ou "amigo".
barraco|substantivo masculino|casa muito simples; gíria: briga, confusão.
perrengue|substantivo masculino|situação difícil ou apertada.
rapadura|substantivo feminino|doce duro de caldo de cana, típico do Nordeste.
gambiarra|substantivo feminino|improviso, solução provisória e malfeita para quebrar o galho.
jeitinho|substantivo masculino|maneira criativa (às vezes informal) de resolver um problema.
cafezinho|substantivo masculino|café servido em xícara pequena, tradição brasileira de receber bem.
mandioca|substantivo feminino|raiz comestível, também chamada aipim ou macaxeira.
macaxeira|substantivo feminino|nome nordestino para mandioca/aipim.
aipim|substantivo masculino|nome de mandioca doce em várias regiões do Brasil.
pão de queijo|expressão|pãozinho mineiro de polvilho e queijo.
chimarrão|substantivo masculino|bebida quente de erva-mate, típica do Sul.
caatinga|substantivo feminino|bioma exclusivo do Brasil, de vegetação seca, no Nordeste. Do tupi: "mata branca".
sertão|substantivo masculino|região interior, de clima seco, principalmente no Nordeste.
quilombo|substantivo masculino|comunidade formada por pessoas escravizadas que fugiram, e seus descendentes.
cidadania|substantivo feminino|condição de quem tem direitos e deveres em uma sociedade.
democracia|substantivo feminino|sistema em que o poder vem do povo, por voto direto ou por representantes.
inflação|substantivo feminino|aumento geral e contínuo dos preços.
juros|substantivo masculino plural|valor pago ou recebido pelo uso do dinheiro ao longo do tempo.
hipoteca|substantivo feminino|garantia de dívida com um imóvel.
fotossíntese|substantivo feminino|processo em que plantas usam luz, água e gás carbônico para produzir açúcar e oxigênio.
ecossistema|substantivo masculino|conjunto de seres vivos e do ambiente onde interagem.
metáfora|substantivo feminino|figura de linguagem que compara sem usar "como". Ex.: "Seus olhos são estrelas."
hipérbole|substantivo feminino|exagero intencional. Ex.: "Já te falei mil vezes."
eufemismo|substantivo masculino|palavra suave no lugar de outra mais dura. Ex.: "ele partiu" (morreu).
antítese|substantivo feminino|aproximação de palavras ou ideias opostas. Ex.: "amor e ódio".
onomatopeia|substantivo feminino|palavra que imita um som. Ex.: "tic-tac", "miau".
neologismo|substantivo masculino|palavra ou expressão nova na língua. Ex.: "textão".
estrangeirismo|substantivo masculino|palavra de outra língua usada no português. Ex.: "mouse", "delivery".
sinônimo|substantivo masculino|palavra com sentido igual ou muito parecido com outra.
antônimo|substantivo masculino|palavra de sentido oposto a outra.
homônimo|substantivo masculino|palavra com a mesma pronúncia ou escrita de outra, mas com significado diferente.`;

const SIN = `feliz: alegre, contente, radiante, satisfeito
triste: abatido, desanimado, melancólico, infeliz
bonito: belo, lindo, formoso, atraente
feio: horrível, desagradável, medonho
grande: enorme, amplo, imenso, gigante
pequeno: mínimo, miúdo, reduzido, diminuto
rápido: veloz, ligeiro, ágil, célere
lento: devagar, vagaroso, demorado
inteligente: esperto, sagaz, perspicaz, brilhante
burro: tolo, ignorante, obtuso
bom: ótimo, excelente, agradável, benéfico
ruim: mau, péssimo, nocivo, desagradável
difícil: complicado, árduo, penoso, complexo
fácil: simples, descomplicado, tranquilo
começar: iniciar, principiar, estrear, dar início
terminar: acabar, concluir, finalizar, encerrar
falar: dizer, conversar, proferir, comentar
ver: enxergar, avistar, observar, notar
pensar: refletir, raciocinar, imaginar, cogitar
ajudar: auxiliar, apoiar, socorrer, colaborar
pergunta: questão, indagação, interrogação
resposta: réplica, retorno, resolução
amigo: companheiro, parceiro, camarada, colega
medo: receio, temor, pavor, susto
raiva: ira, fúria, cólera, irritação
alegria: contentamento, júbilo, felicidade
casa: lar, moradia, residência, habitação
trabalho: emprego, labor, ofício, serviço
dinheiro: grana, verba, capital, recursos
importante: relevante, essencial, fundamental, necessário
rico: abastado, endinheirado, próspero
pobre: carente, necessitado, humilde
cansado: exausto, esgotado, fatigado
forte: robusto, resistente, vigoroso, potente
fraco: frágil, débil, delicado
mentira: falsidade, embuste, farsa
verdade: realidade, fato, exatidão
caminho: trajeto, rota, estrada, percurso
erro: engano, equívoco, falha, deslize
vitória: triunfo, conquista, sucesso
derrota: fracasso, revés, perda
calmo: tranquilo, sereno, sossegado
nervoso: agitado, ansioso, inquieto
esquisito: estranho, bizarro, singular
legal: bacana, bom, interessante, massa, daora
novo: recente, atual, moderno, inédito
velho: antigo, idoso, ultrapassado, ancestral
certo: correto, exato, adequado, preciso
errado: incorreto, equivocado, falho, impróprio
amor: afeto, carinho, paixão, estima
ódio: rancor, aversão, repulsa, hostilidade
coragem: bravura, ousadia, determinação, destemor
criar: inventar, produzir, elaborar, construir
destruir: arruinar, demolir, desmanchar, devastar
aprender: estudar, assimilar, absorver, descobrir
ensinar: instruir, educar, explicar, orientar
lembrar: recordar, rememorar, memorizar
esquecer: omitir, deixar de lado, deslembrar
procurar: buscar, pesquisar, investigar, caçar
achar: encontrar, descobrir, localizar, avistar
gostar: apreciar, curtir, estimar, aprovar
querer: desejar, pretender, almejar, ambicionar
precisar: necessitar, carecer, exigir
entender: compreender, captar, assimilar, perceber
explicar: esclarecer, detalhar, expor, demonstrar
mostrar: exibir, apresentar, revelar, indicar
guardar: armazenar, conservar, proteger, salvar
mudar: alterar, transformar, modificar, trocar
aumentar: crescer, ampliar, elevar, expandir
diminuir: reduzir, encurtar, baixar, atenuar
problema: questão, obstáculo, dificuldade, contratempo
solução: saída, resposta, resolução, remédio
ideia: pensamento, conceito, noção, sugestão
história: relato, narrativa, crônica, passado
tempo: período, duração, época, momento
lugar: local, espaço, região, ponto
pessoa: indivíduo, ser humano, sujeito, cidadão
grupo: conjunto, equipe, turma, bando
força: vigor, energia, potência, intensidade
paz: harmonia, tranquilidade, sossego, calma
guerra: conflito, batalha, combate, luta
frio: gelado, gélido, fresco, glacial
quente: cálido, morno, ardente, fervente
limpo: asseado, puro, higienizado, claro
sujo: imundo, encardido, manchado, impuro
cheio: lotado, repleto, completo, abarrotado
vazio: oco, desocupado, deserto, vago
seguro: protegido, firme, confiável, estável
perigoso: arriscado, ameaçador, grave, inseguro
simples: fácil, básico, descomplicado, modesto`.split("\n");

const ANT = `feliz: triste
grande: pequeno
bom: mau, ruim
bonito: feio
rápido: lento
forte: fraco
fácil: difícil
verdade: mentira
começo: fim
alegria: tristeza
amor: ódio
claro: escuro
quente: frio
alto: baixo
cheio: vazio
novo: velho
rico: pobre
dia: noite
subir: descer
abrir: fechar
chegar: partir
vitória: derrota
paz: guerra
calmo: agitado
presente: ausente
certo: errado
coragem: medo
amigo: inimigo
comprar: vender
dar: receber
entrar: sair
acordar: dormir
lembrar: esquecer
ganhar: perder
construir: destruir
aumentar: diminuir
aceitar: recusar
ligar: desligar
seguro: perigoso
limpo: sujo
simples: complexo
público: privado
igual: diferente
sempre: nunca
tudo: nada
muito: pouco
cedo: tarde
perto: longe
dentro: fora
antes: depois
verdadeiro: falso`.split("\n");

/* ---------- tradução (offline): pt | en | es | fr | it | de ---------- */
const TRAD = `olá|hello|hola|bonjour|ciao|hallo
oi|hi|hola|salut|ciao|hallo
bom dia|good morning|buenos días|bonjour|buongiorno|guten Morgen
boa tarde|good afternoon|buenas tardes|bonne après-midi|buon pomeriggio|guten Tag
boa noite|good night|buenas noches|bonne nuit|buonanotte|gute Nacht
tchau|bye|adiós|au revoir|ciao|tschüss
obrigado|thank you|gracias|merci|grazie|danke
obrigada|thank you|gracias|merci|grazie|danke
por favor|please|por favor|s'il vous plaît|per favore|bitte
desculpe|sorry|perdón|désolé|scusa|Entschuldigung
sim|yes|sí|oui|sì|ja
não|no|no|non|no|nein
de nada|you're welcome|de nada|de rien|prego|bitte schön
tudo bem?|how are you?|¿cómo estás?|ça va ?|come stai?|wie geht's?
eu não sei|I don't know|no lo sé|je ne sais pas|non lo so|ich weiß nicht
pode me ajudar?|can you help me?|¿puedes ayudarme?|pouvez-vous m'aider ?|puoi aiutarmi?|kannst du mir helfen?
eu te amo|I love you|te quiero|je t'aime|ti amo|ich liebe dich
meu nome é|my name is|me llamo|je m'appelle|mi chiamo|ich heiße
eu não entendo|I don't understand|no entiendo|je ne comprends pas|non capisco|ich verstehe nicht
você fala português?|do you speak Portuguese?|¿hablas portugués?|parlez-vous portugais ?|parli portoghese?|sprichst du Portugiesisch?
quanto custa?|how much is it?|¿cuánto cuesta?|combien ça coûte ?|quanto costa?|wie viel kostet das?
onde fica o banheiro?|where is the bathroom?|¿dónde está el baño?|où sont les toilettes ?|dov'è il bagno?|wo ist die Toilette?
estou com fome|I am hungry|tengo hambre|j'ai faim|ho fame|ich habe Hunger
estou com sede|I am thirsty|tengo sed|j'ai soif|ho sete|ich habe Durst
estou cansado|I am tired|estoy cansado|je suis fatigué|sono stanco|ich bin müde
eu gosto disso|I like this|me gusta esto|j'aime ça|mi piace questo|das gefällt mir
muito bom|very good|muy bueno|très bien|molto bene|sehr gut
parabéns|congratulations|felicidades|félicitations|complimenti|Herzlichen Glückwunsch
socorro|help|ayuda|au secours|aiuto|Hilfe
saúde|cheers|salud|santé|salute|Prost
feliz aniversário|happy birthday|feliz cumpleaños|joyeux anniversaire|buon compleanno|alles Gute zum Geburtstag
feliz natal|merry christmas|feliz Navidad|joyeux Noël|buon Natale|frohe Weihnachten
feliz ano novo|happy new year|feliz año nuevo|bonne année|felice anno nuovo|frohes neues Jahr
bem-vindo|welcome|bienvenido|bienvenue|benvenuto|willkommen
boa sorte|good luck|buena suerte|bonne chance|buona fortuna|viel Glück
casa|house|casa|maison|casa|Haus
carro|car|coche|voiture|macchina|Auto
ônibus|bus|autobús|bus|autobus|Bus
trem|train|tren|train|treno|Zug
avião|airplane|avión|avion|aereo|Flugzeug
água|water|agua|eau|acqua|Wasser
comida|food|comida|nourriture|cibo|Essen
pão|bread|pan|pain|pane|Brot
leite|milk|leche|lait|latte|Milch
café|coffee|café|café|caffè|Kaffee
chá|tea|té|thé|tè|Tee
cerveja|beer|cerveza|bière|birra|Bier
vinho|wine|vino|vin|vino|Wein
maçã|apple|manzana|pomme|mela|Apfel
banana|banana|plátano|banane|banana|Banane
laranja|orange|naranja|orange|arancia|Orange
carne|meat|carne|viande|carne|Fleisch
peixe|fish|pescado|poisson|pesce|Fisch
frango|chicken|pollo|poulet|pollo|Hähnchen
arroz|rice|arroz|riz|riso|Reis
feijão|beans|frijoles|haricots|fagioli|Bohnen
queijo|cheese|queso|fromage|formaggio|Käse
ovo|egg|huevo|œuf|uovo|Ei
sal|salt|sal|sel|sale|Salz
açúcar|sugar|azúcar|sucre|zucchero|Zucker
cachorro|dog|perro|chien|cane|Hund
gato|cat|gato|chat|gatto|Katze
pássaro|bird|pájaro|oiseau|uccello|Vogel
cavalo|horse|caballo|cheval|cavallo|Pferd
vaca|cow|vaca|vache|mucca|Kuh
porco|pig|cerdo|cochon|maiale|Schwein
leão|lion|león|lion|leone|Löwe
amigo|friend|amigo|ami|amico|Freund
família|family|familia|famille|famiglia|Familie
mãe|mother|madre|mère|madre|Mutter
pai|father|padre|père|padre|Vater
irmão|brother|hermano|frère|fratello|Bruder
irmã|sister|hermana|sœur|sorella|Schwester
filho|son|hijo|fils|figlio|Sohn
filha|daughter|hija|fille|figlia|Tochter
homem|man|hombre|homme|uomo|Mann
mulher|woman|mujer|femme|donna|Frau
criança|child|niño|enfant|bambino|Kind
menino|boy|chico|garçon|ragazzo|Junge
menina|girl|chica|fille|ragazza|Mädchen
amor|love|amor|amour|amore|Liebe
vida|life|vida|vie|vita|Leben
morte|death|muerte|mort|morte|Tod
sonho|dream|sueño|rêve|sogno|Traum
tempo|time|tiempo|temps|tempo|Zeit
dia|day|día|jour|giorno|Tag
noite|night|noche|nuit|notte|Nacht
manhã|morning|mañana|matin|mattina|Morgen
tarde|afternoon|tarde|après-midi|pomeriggio|Nachmittag
hoje|today|hoy|aujourd'hui|oggi|heute
amanhã|tomorrow|mañana|demain|domani|morgen
ontem|yesterday|ayer|hier|ieri|gestern
agora|now|ahora|maintenant|adesso|jetzt
sempre|always|siempre|toujours|sempre|immer
nunca|never|nunca|jamais|mai|nie
semana|week|semana|semaine|settimana|Woche
mês|month|mes|mois|mese|Monat
ano|year|año|an|anno|Jahr
hora|hour|hora|heure|ora|Stunde
minuto|minute|minuto|minute|minuto|Minute
segunda-feira|Monday|lunes|lundi|lunedì|Montag
terça-feira|Tuesday|martes|mardi|martedì|Dienstag
quarta-feira|Wednesday|miércoles|mercredi|mercoledì|Mittwoch
quinta-feira|Thursday|jueves|jeudi|giovedì|Donnerstag
sexta-feira|Friday|viernes|vendredi|venerdì|Freitag
sábado|Saturday|sábado|samedi|sabato|Samstag
domingo|Sunday|domingo|dimanche|domenica|Sonntag
janeiro|January|enero|janvier|gennaio|Januar
fevereiro|February|febrero|février|febbraio|Februar
março|March|marzo|mars|marzo|März
abril|April|abril|avril|aprile|April
maio|May|mayo|mai|maggio|Mai
junho|June|junio|juin|giugno|Juni
julho|July|julio|juillet|luglio|Juli
agosto|August|agosto|août|agosto|August
setembro|September|septiembre|septembre|settembre|September
outubro|October|octubre|octobre|ottobre|Oktober
novembro|November|noviembre|novembre|novembre|November
dezembro|December|diciembre|décembre|dicembre|Dezember
um|one|uno|un|uno|eins
dois|two|dos|deux|due|zwei
três|three|tres|trois|tre|drei
quatro|four|cuatro|quatre|quattro|vier
cinco|five|cinco|cinq|cinque|fünf
seis|six|seis|six|sei|sechs
sete|seven|siete|sept|sette|sieben
oito|eight|ocho|huit|otto|acht
nove|nine|nueve|neuf|nove|neun
dez|ten|diez|dix|dieci|zehn
cem|one hundred|cien|cent|cento|hundert
mil|thousand|mil|mille|mille|tausend
vermelho|red|rojo|rouge|rosso|rot
azul|blue|azul|bleu|blu|blau
verde|green|verde|vert|verde|grün
amarelo|yellow|amarillo|jaune|giallo|gelb
preto|black|negro|noir|nero|schwarz
branco|white|blanco|blanc|bianco|weiß
rosa|pink|rosa|rose|rosa|rosa
roxo|purple|morado|violet|viola|lila
laranja (cor)|orange|naranja|orange|arancione|orange
cinza|gray|gris|gris|grigio|grau
grande|big|grande|grand|grande|groß
pequeno|small|pequeño|petit|piccolo|klein
bonito|beautiful|bonito|beau|bello|schön
feio|ugly|feo|laid|brutto|hässlich
bom|good|bueno|bon|buono|gut
mau|bad|malo|mauvais|cattivo|schlecht
novo|new|nuevo|nouveau|nuovo|neu
velho|old|viejo|vieux|vecchio|alt
quente|hot|caliente|chaud|caldo|heiß
frio|cold|frío|froid|freddo|kalt
rápido|fast|rápido|rapide|veloce|schnell
devagar|slow|lento|lent|lento|langsam
feliz|happy|feliz|heureux|felice|glücklich
triste|sad|triste|triste|triste|traurig
fácil|easy|fácil|facile|facile|einfach
difícil|difficult|difícil|difficile|difficile|schwierig
muito|very|muy|très|molto|sehr
pouco|little|poco|peu|poco|wenig
eu|I|yo|je|io|ich
você|you|tú|tu|tu|du
ele|he|él|il|lui|er
ela|she|ella|elle|lei|sie
nós|we|nosotros|nous|noi|wir
eles|they|ellos|ils|loro|sie
escola|school|escuela|école|scuola|Schule
professor|teacher|profesor|professeur|insegnante|Lehrer
aluno|student|alumno|élève|studente|Schüler
livro|book|libro|livre|libro|Buch
caneta|pen|bolígrafo|stylo|penna|Stift
mesa|table|mesa|table|tavolo|Tisch
cadeira|chair|silla|chaise|sedia|Stuhl
porta|door|puerta|porte|porta|Tür
janela|window|ventana|fenêtre|finestra|Fenster
cidade|city|ciudad|ville|città|Stadt
país|country|país|pays|paese|Land
rua|street|calle|rue|strada|Straße
trabalho|work|trabajo|travail|lavoro|Arbeit
dinheiro|money|dinero|argent|soldi|Geld
telefone|phone|teléfono|téléphone|telefono|Telefon
computador|computer|ordenador|ordinateur|computer|Computer
internet|internet|internet|internet|internet|Internet
programação|programming|programación|programmation|programmazione|Programmierung
inteligência|intelligence|inteligencia|intelligence|intelligenza|Intelligenz
memória|memory|memoria|mémoire|memoria|Gedächtnis
código|code|código|code|codice|Code
fogo|fire|fuego|feu|fuoco|Feuer
terra|earth|tierra|terre|terra|Erde
sol|sun|sol|soleil|sole|Sonne
lua|moon|luna|lune|luna|Mond
estrela|star|estrella|étoile|stella|Stern
chuva|rain|lluvia|pluie|pioggia|Regen
vento|wind|viento|vent|vento|Wind
neve|snow|nieve|neige|neve|Schnee
mar|sea|mar|mer|mare|Meer
praia|beach|playa|plage|spiaggia|Strand
montanha|mountain|montaña|montagne|montagna|Berg
floresta|forest|bosque|forêt|foresta|Wald
flor|flower|flor|fleur|fiore|Blume
árvore|tree|árbol|arbre|albero|Baum
coração|heart|corazón|cœur|cuore|Herz
cabeça|head|cabeza|tête|testa|Kopf
mão|hand|mano|main|mano|Hand
olho|eye|ojo|œil|occhio|Auge
boca|mouth|boca|bouche|bocca|Mund
paz|peace|paz|paix|pace|Frieden
guerra|war|guerra|guerre|guerra|Krieg
liberdade|freedom|libertad|liberté|libertà|Freiheit
saudade|longing / missing someone|añoranza|nostalgie|nostalgia|Sehnsucht
verdade|truth|verdad|vérité|verità|Wahrheit
mentira|lie|mentira|mensonge|bugia|Lüge
ajuda|help|ayuda|aide|aiuto|Hilfe
pergunta|question|pregunta|question|domanda|Frage
resposta|answer|respuesta|réponse|risposta|Antwort
palavra|word|palabra|mot|parola|Wort
língua|language|idioma|langue|lingua|Sprache
música|music|música|musique|musica|Musik
jogo|game|juego|jeu|gioco|Spiel
filme|movie|película|film|film|Film
história|history|historia|histoire|storia|Geschichte
ciência|science|ciencia|science|scienza|Wissenschaft
arte|art|arte|art|arte|Kunst
futebol|soccer|fútbol|football|calcio|Fußball
viagem|trip|viaje|voyage|viaggio|Reise
aeroporto|airport|aeropuerto|aéroport|aeroporto|Flughafen
hotel|hotel|hotel|hôtel|albergo|Hotel
hospital|hospital|hospital|hôpital|ospedale|Krankenhaus
médico|doctor|médico|médecin|medico|Arzt
comer|eat|comer|manger|mangiare|essen
beber|drink|beber|boire|bere|trinken
dormir|sleep|dormir|dormir|dormire|schlafen
acordar|wake up|despertar|se réveiller|svegliarsi|aufwachen
falar|speak|hablar|parler|parlare|sprechen
ouvir|hear|oír|écouter|sentire|hören
ler|read|leer|lire|leggere|lesen
escrever|write|escribir|écrire|scrivere|schreiben
aprender|learn|aprender|apprendre|imparare|lernen
ensinar|teach|enseñar|enseigner|insegnare|lehren
pensar|think|pensar|penser|penser|denken
criar|create|crear|créer|creare|erschaffen
abrir|open|abrir|ouvrir|aprire|öffnen
fechar|close|cerrar|fermer|chiudere|schließen`.split("\n").map(l => l.split("|"));

/* ---------- utilidades ---------- */
const PTX = PT.split("\n").map(l => { const [p, c, ...d] = l.split("|"); return { p, n: norm(p), c, d: d.join("|") }; });
const SINX = SIN.map(l => { const [p, s] = l.split(": "); return { p, n: norm(p), s }; });
const ANTX = ANT.map(l => { const [p, s] = l.split(": "); return { p, n: norm(p), s }; });
const TR = TRAD.map(r => ({ nk: r.map(norm), r }));
const COLS = ["pt", "en", "es", "fr", "it", "de"];
const cache = new Map();
const limpa = h => String(h || "").replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, m => ({ "&amp;": "&", "&quot;": '"', "&#39;": "'", "&nbsp;": " ", "&lt;": "<", "&gt;": ">" }[m] || " ")).replace(/\s+/g, " ").trim();
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

async function jget(url, ms = 9000) {
  if (cache.has(url)) return cache.get(url);
  const c = new AbortController(), id = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) return null; const j = await r.json(); cache.set(url, j); return j; }
  catch { return null; } finally { clearTimeout(id); }
}

function limpaAspas(s) { return String(s || "").replace(/^["'“”‘’:\-\s]+|["'“”‘’\s]+$/g, "").trim(); }

/* Extrai o trecho correspondente do texto original preservando acentos/pontuação */
function trechoOriginal(raw, idxFimPrefixo) {
  return limpaAspas(String(raw || "").slice(idxFimPrefixo));
}

/* ---------- detectar pedido ---------- */
const PERGUNTAS_NAO = /^(qual|quais|quem|quando|onde|como|por que|porque|quanto|quantos|o que|oque|que|se)\b/;
function detectar(texto) {
  const raw = String(texto || "").trim();
  const s = normCmd(raw).replace(/\bvc\b/g, "voce");
  if (!s || s.length > 600) return null;
  let m;

  // 1) "traduz isso para português: Where is the world..." ou "traduz para inglês bom dia"
  m = s.match(new RegExp("^(?:(?:pode|poderia|consegue)\\s+)?(?:(?:bach|me)\\s+)?(?:traduz|traduza|traduzir|traducao)(?:\\s+(?:isso|isto|esse\\s+texto|essa\\s+frase|esta\\s+frase|ele|ela))?\\s+(?:em|para|pra|no|na|ao|pro)\\s+(?:o\\s+|a\\s+|lingua\\s+)?(" + LRE + ")(?:\\s*[:,-]?\\s+([\\s\\S]+))?$"));
  if (m) {
    const alvo = lingua(m[1]);
    const resto = m[2] ? limpaAspas(raw.slice(raw.length - m[2].length)) : "__ALVO__";
    return { tipo: "trad", q: resto || "__ALVO__", alvo };
  }

  // 2) "como se diz X em inglês" / "traduz X para espanhol"
  m = s.match(new RegExp("^(?:(?:pode|poderia|consegue)\\s+)?(?:(?:bach\\s+|me\\s+)?(?:diga\\s+|diz\\s+|fala\\s+)?como\\s+(?:se\\s+)?(?:diz|fala|escreve|dizer|falar|escrevo)|(?:bach\\s+|me\\s+)?(?:traduz|traduza|traduzir|tradu[zc]\\w*)|traducao\\s+d[eoa]s?)\\s+([\\s\\S]+?)\\s+(?:em|para|pra|no|na|ao|pro|do|de|em\\s+lingua)\\s+(?:o\\s+|a\\s+|lingua\\s+)?(" + LRE + ")[?!.\\s]*$"));
  if (m) return { tipo: "trad", q: limpaAspas(m[1]), alvo: lingua(m[2]) };

  // 3) "traduz isso" / "traduz <texto>"
  m = s.match(/^(?:(?:pode|poderia)\s+)?(?:(?:bach\s+|me\s+)?(?:traduz|traduza|traduzir))\s+([\s\S]+)$/);
  if (m) {
    const q = limpaAspas(raw.slice(raw.length - m[1].length));
    return { tipo: "trad", q: /^(isso|isto|essa frase|esse texto)$/i.test(q) ? "__ALVO__" : q, alvo: null };
  }

  // 4) "como se diz <palavra>"
  m = s.match(/^(?:como\s+(?:se\s+)?(?:diz|fala|escreve|dizer|falar))\s+(.+)$/);
  if (m && m[1].split(" ").length <= 8 && !/\b(em|no|na)\s+(?:que|qual)/.test(m[1])) return { tipo: "trad", q: limpaAspas(m[1]), alvo: null };

  // 5) definições: "o que significa X"
  const t = norm(texto).replace(/\bvc\b/g, "voce");
  m = t.match(new RegExp("^(?:o que (?:significa|quer dizer|quer dizer a palavra|significa a palavra)|significado d[eoa]s?|qual (?:e )?o significado d[eoa]s?|defin[ae]r?|definicao d[eoa]s?|dicionario(?: de)?|me (?:explica|diz|fala) o que (?:significa|quer dizer)|palavra|giria|qual (?:e )?o sentido d[eoa]s?)\\s+(?:a palavra |o termo |a expressao |a giria |a sigla )?(.+?)(?:\\s+(?:em|no|na|do|de)\\s+(?:o |a |lingua )?(" + LRE + "))?$"));
  if (m) {
    const q = limpaAspas(m[1]);
    if (q.split(" ").length > 4 || /^(que|isso|esse|essa|esta|este|ele|ela)\b/.test(q)) return null;
    return { tipo: "def", q, lang: m[2] ? lingua(m[2]) : null };
  }
  m = t.match(/^(?:sinonimos? d[eoa]s?|outra palavra para|palavra parecida com|palavras? (?:que )?(?:significa|significam) (?:o )?(?:mesmo|igual) (?:que|a)|qual (?:e )?o sinonimo d[eoa]s?)\s+(.+)$/);
  if (m && m[1].split(" ").length <= 3) return { tipo: "sin", q: limpaAspas(m[1]) };
  m = t.match(/^(?:antonimos? d[eoa]s?|oposto d[eoa]s?|qual (?:e )?o (?:antonimo|oposto) d[eoa]s?|contrario d[eoa]s?)\s+(.+)$/);
  if (m && m[1].split(" ").length <= 3) return { tipo: "ant", q: limpaAspas(m[1]) };

  m = t.match(new RegExp("^(.+?)\\s+em\\s+(?:o |a )?(" + LRE + ")$"));
  if (m && m[1].split(" ").length <= 5 && !PERGUNTAS_NAO.test(m[1]) && !/\b(escreva|fale|conversa|responda|programa|codigo|site|texto|livro|filme)\b/.test(m[1])) {
    return { tipo: "trad", q: limpaAspas(m[1]), alvo: lingua(m[2]) };
  }
  if (/^(?:dicionario|\/dicionario|idiomas|linguas|tradutor)$/.test(t)) return { tipo: "ajuda" };
  return null;
}

/* ---------- busca offline ---------- */
function achaTrad(q) {
  const k = norm(q).replace(/[?!.]+$/, "");
  for (let c = 0; c < COLS.length; c++) { const l = TR.find(x => x.nk[c] === k); if (l) return { linha: l.r, col: c }; }
  return null;
}
function paraTodas(l, colOrig) {
  return COLS.map((c, i) => i === colOrig ? null : (BANDEIRA[c] || "") + " " + cap(NOME[c]) + ": " + l[i]).filter(Boolean).join("\n");
}
function achaPT(q) {
  const k = norm(q);
  let e = PTX.find(x => x.n === k); if (e) return e;
  const sing = k.replace(/(ns)$/, "m").replace(/(oes|aes|aos)$/, "ao").replace(/(is)$/, "l").replace(/s$/, "");
  return PTX.find(x => x.n === sing || x.n === sing + "s") || null;
}
function fmtPT(e) { return "📖 " + e.p + " (" + e.c + ")\n\n" + cap(e.d) + "\n\n📚 Fonte: dicionário da BACH."; }

/* ---------- busca online ---------- */
async function traduzirNet(q, src, tgt) {
  const j = await jget("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(q) + "&langpair=" + src + "|" + tgt);
  const r = j?.responseData?.translatedText;
  if (!r || /MYMEMORY WARNING|INVALID/i.test(r)) return null;
  return limpa(r);
}
const parecePT = q => /[ãõçáàâéêíóú]/i.test(q) || /\b(o|a|os|as|de|que|um|uma|para|com|não|nao|voce|você|eu|meu|minha|esta|isso|casa|bom|dia|mundo|onde|com)\b/i.test(q);
function adivinharIdioma(q) {
  const n = norm(q);
  if (/[ñ¿¡]|\b(hola|gracias|buenos|como estas|donde|quien|por favor|coche|perro|amigo)\b/.test(n)) return "es";
  if (/\b(bonjour|merci|salut|comment|je suis|maison|pourquoi|oui)\b/.test(n)) return "fr";
  if (/\b(ciao|grazie|buongiorno|come stai|perche|amore|casa)\b/.test(n)) return "it";
  if (/\b(hallo|danke|guten|wie geht|ich bin|nicht|ja)\b/.test(n)) return "de";
  if (/\b(the|is|are|where|what|when|who|how|with|these|those|this|that|world|going|girls|boys|you|and|for|lol)\b/.test(n)) return "en";
  if (parecePT(q)) return "pt";
  return "en";
}

async function defNet(q, lang, passo) {
  const w = q.trim();
  if (lang === "pt") {
    passo?.("📖 Consultando o Wikcionário em português...");
    const j = await jget("https://pt.wiktionary.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=plain&redirects=1&format=json&origin=*&titles=" + encodeURIComponent(w))
      || await jget("https://pt.wiktionary.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=plain&redirects=1&format=json&origin=*&titles=" + encodeURIComponent(w.toLowerCase()));
    const pg = j && Object.values(j.query?.pages || {})[0];
    const tx = pg?.extract;
    if (tx && !pg.missing && pg.pageid) {
      const sec = (tx.split(/\n(?=Português\s*\n)/)[0].startsWith("Português") ? tx : (tx.match(/(?:^|\n)Português\s*\n([\s\S]*)/) || [])[1]) || "";
      const corte = sec.split(/\n(?=(?:Inglês|Espanhol|Francês|Italiano|Alemão|Latim|Galego|Catalão|Japonês|Tupi)\s*\n)/)[0];
      const linhas = corte.split("\n").map(s => s.trim()).filter(s => s && s.length > 3 && !/^(Etimologia|Pronúncia|Tradução|Traduções|Ver também|Anagramas|Referências|Hifenização|Fonética|Rimas|Locuções|Expressões|Verbete|Formas|Palavras)/i.test(s));
      const out = [];
      for (const s of linhas) { if (out.join("\n").length > 900) break; if (s.length > 280) out.push(s.slice(0, 277) + "…"); else out.push(s); }
      if (out.length) return "📖 " + w + " — Wikcionário (português)\n\n" + out.slice(0, 14).join("\n") + "\n\n🌐 Fonte: pt.wiktionary.org";
    }
    return null;
  }
  if (lang === "en") {
    passo?.("📖 Consultando dicionário de inglês...");
    const j = await jget("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(w.toLowerCase()));
    if (Array.isArray(j) && j[0]) {
      const partes = [];
      for (const m of (j[0].meanings || []).slice(0, 3)) {
        const d = (m.definitions || []).slice(0, 2).map(x => "• " + x.definition + (x.example ? "  (ex.: " + x.example + ")" : "")).join("\n");
        partes.push(cap(m.partOfSpeech) + ":\n" + d);
      }
      let txt = "📖 " + w + (j[0].phonetic ? " " + j[0].phonetic : "") + " (inglês)\n\n" + partes.join("\n\n");
      const tr = await traduzirNet(w, "en", "pt");
      if (tr && norm(tr) !== norm(w)) txt += "\n\n🇧🇷 Em português: " + tr;
      return txt + "\n\n🌐 Fonte: dictionaryapi.dev";
    }
  }
  passo?.("📖 Consultando o Wiktionary...");
  const j = await jget("https://en.wiktionary.org/api/rest_v1/page/definition/" + encodeURIComponent(w));
  const lista = j && (j[lang] || j[lang === "la" ? "la" : lang]);
  if (lista?.length) {
    const partes = lista.slice(0, 3).map(b => cap(b.partOfSpeech) + ":\n" + (b.definitions || []).slice(0, 2).map(d => "• " + limpa(d.definition)).filter(x => x.length > 4).join("\n")).join("\n\n");
    let txt = "📖 " + w + " (" + (NOME[lang] || lang) + ") — definição em inglês:\n\n" + partes;
    const tr = await traduzirNet(w, lang, "pt");
    if (tr && norm(tr) !== norm(w)) txt += "\n\n🇧🇷 Em português: " + tr;
    return txt + "\n\n🌐 Fonte: en.wiktionary.org";
  }
  return null;
}

const AJUDA = "🌍 DICIONÁRIO E TRADUÇÃO\n\n• o que significa saudade\n• sinônimo de feliz / antônimo de rápido\n• como se diz obrigado em japonês\n• traduz para português: Where is the world going?\n• traduz \"good morning\" para português\n\nLínguas: inglês, espanhol, francês, italiano, alemão (também offline) e japonês, chinês, russo, coreano, árabe, latim e outras (com internet).";

/* ---------- principal ---------- */
async function consultar(d, passo) {
  if (!d) return null;
  if (d.tipo === "ajuda") return AJUDA;
  const q = d.q;
  if (!q || q === "__ALVO__") return "Cole ou responda (↩) a frase que você quer que eu traduza! 🌍";

  if (d.tipo === "sin") {
    const e = SINX.find(x => x.n === norm(q));
    return e ? "🔁 Sinônimos de “" + e.p + "”: " + e.s + "." : null;
  }
  if (d.tipo === "ant") {
    const e = ANTX.find(x => x.n === norm(q));
    return e ? "↔️ Antônimo de “" + e.p + "”: " + e.s + "." : null;
  }

  if (d.tipo === "def") {
    const lang = d.lang || null;
    if (!lang || lang === "pt") {
      const e = achaPT(q); if (e) return fmtPT(e);
      const s = SINX.find(x => x.n === norm(q));
      const net = await defNet(q, "pt", passo);
      if (net) return net;
      if (!lang && !parecePT(q)) { const en = await defNet(q, "en", passo); if (en) return en; }
      if (s) return "🔁 Não tenho a definição completa de “" + q + "”, mas sinônimos: " + s.s + ".";
      const t = achaTrad(q);
      if (t) return "🌍 “" + q + "” como palavra de outra língua:\n" + paraTodas(t.linha, t.col) + "\n\n(Em português: " + t.linha[0] + ")";
      return null;
    }
    return await defNet(q, lang, passo);
  }

  if (d.tipo === "trad") {
    const alvo = d.alvo;
    const t = achaTrad(q);
    if (t) {
      const [pt] = t.linha;
      if (alvo === "pt") return "🌍 " + cap(q) + " → português: " + pt;
      if (alvo && COLS.includes(alvo)) return "🌍 " + cap(pt) + " em " + NOME[alvo] + ": " + t.linha[COLS.indexOf(alvo)] + (t.col !== 0 ? "\n(Você escreveu em " + NOME[COLS[t.col]] + "; em português é “" + pt + "”.)" : "");
      if (t.col === 0) return "🌍 “" + pt + "” nas principais línguas:\n\n" + paraTodas(t.linha, 0);
      return "🌍 “" + q + "” (" + NOME[COLS[t.col]] + ") em português é: " + pt + "\n\n" + paraTodas(t.linha, t.col);
    }
    if (!alvo) {
      const src = adivinharIdioma(q);
      if (src !== "pt") {
        passo?.("🌍 Traduzindo para português...");
        const r = await traduzirNet(q, src, "pt");
        return r ? "🌍 “" + q + "”\n→ 🇧🇷 Português: " + r + "\n\n🌐 Tradução automática (MyMemory)." : null;
      }
      passo?.("🌍 Traduzindo...");
      const out = [];
      for (const l of ["en", "es", "fr"]) { const r = await traduzirNet(q, "pt", l); if (r) out.push((BANDEIRA[l] || "") + " " + cap(NOME[l]) + ": " + r); }
      return out.length ? "🌍 “" + q + "” em:\n\n" + out.join("\n") + "\n\n🌐 Tradução automática (MyMemory). Diga “em japonês” etc. para outra língua." : null;
    }
    let src = adivinharIdioma(q);
    if (alvo === "pt" && src === "pt") src = "en";
    passo?.("🌍 Traduzindo para " + NOME[alvo] + "...");
    const r = await traduzirNet(q, src, alvo);
    return r ? "🌍 “" + q + "”\n→ " + (BANDEIRA[alvo] || "🌐") + " " + cap(NOME[alvo]) + ": " + r + "\n\n🌐 Tradução automática (MyMemory)." : null;
  }
  return null;
}

export const Dic = {
  detectar, consultar, ajuda: AJUDA,
  total: { pt: PTX.length, sinonimos: SINX.length, antonimos: ANTX.length, traducoes: TR.length }
};

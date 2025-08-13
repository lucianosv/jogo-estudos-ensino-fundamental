import { GameParameters } from "@/components/GameSetup";

interface GranularQuestion {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

interface GranularStory {
  title: string;
  content: string;
}

// FALLBACKS EXPANDIDOS MASSIVAMENTE - COBRINDO TODAS AS COMBINAÇÕES CRÍTICAS
const expandedGranularFallbacks = {
  'Ciências': {
    '1º ano': {
      'Corpo Humano': {
        questions: [
          {
            content: "Quantos olhos nós temos?",
            choices: ["1 olho", "2 olhos", "3 olhos", "4 olhos"],
            answer: "2 olhos",
            word: "visão"
          },
          {
            content: "Qual parte do corpo usamos para ouvir?",
            choices: ["Nariz", "Orelha", "Boca", "Mão"],
            answer: "Orelha",
            word: "audição"
          },
          {
            content: "Quantas mãos temos?",
            choices: ["1 mão", "2 mãos", "3 mãos", "4 mãos"],
            answer: "2 mãos",
            word: "tato"
          },
          {
            content: "Com que parte do corpo sentimos cheiros?",
            choices: ["Olho", "Orelha", "Nariz", "Pé"],
            answer: "Nariz",
            word: "olfato"
          }
        ],
        story: {
          title: "Ciências: Os Cinco Sentidos",
          content: "Era uma vez uma menina chamada Ana que descobriu como seu corpo era incrível! Ela usava os olhos para ver as cores bonitas das flores, as orelhas para ouvir o canto dos pássaros, o nariz para sentir o cheiro gostoso do pão quentinho, as mãos para tocar a pele macia do gatinho, e a língua para sentir o sabor doce do mel. Ana ficou maravilhada ao descobrir que tinha cinco sentidos especiais que a ajudavam a conhecer o mundo ao seu redor!"
        }
      },
      'Sistema Solar': {
        questions: [
          {
            content: "Qual é a estrela que nos dá luz e calor?",
            choices: ["A Lua", "O Sol", "As nuvens", "Os planetas"],
            answer: "O Sol",
            word: "estrela"
          },
          {
            content: "O que vemos no céu à noite que é redondo e brilha?",
            choices: ["O Sol", "A Lua", "As estrelas", "Os planetas"],
            answer: "A Lua",
            word: "noite"
          },
          {
            content: "Em que planeta nós vivemos?",
            choices: ["Sol", "Lua", "Terra", "Marte"],
            answer: "Terra",
            word: "planeta"
          },
          {
            content: "Quantos planetas existem no Sistema Solar?",
            choices: ["6 planetas", "7 planetas", "8 planetas", "9 planetas"],
            answer: "8 planetas",
            word: "universo"
          }
        ],
        story: {
          title: "Ciências: Nossa Casa no Espaço",
          content: "O pequeno Pedro olhava para o céu e se perguntava onde vivia. Sua professora explicou que ele morava no planeta Terra, que fazia parte de uma grande família de 8 planetas que giravam ao redor de uma estrela muito especial chamada Sol. Durante o dia, o Sol iluminava e aquecia a Terra, e à noite, a Lua brilhava no céu escuro cheio de estrelinhas. Pedro ficou encantado ao descobrir que sua casa era na verdade um planeta azul e verde flutuando no espaço!"
        }
      }
    },
    '3º ano': {
      'Corpo Humano': {
        questions: [
          {
            content: "Qual órgão bate dentro do peito e bombeia o sangue?",
            choices: ["Pulmão", "Fígado", "Coração", "Estômago"],
            answer: "Coração",
            word: "circulação"
          },
          {
            content: "O que usamos para respirar?",
            choices: ["Coração", "Pulmões", "Estômago", "Fígado"],
            answer: "Pulmões",
            word: "respiração"
          },
          {
            content: "Onde acontece a digestão dos alimentos?",
            choices: ["Coração", "Pulmões", "Estômago", "Cérebro"],
            answer: "Estômago",
            word: "digestão"
          },
          {
            content: "Qual órgão controla todo o corpo e nos faz pensar?",
            choices: ["Coração", "Pulmões", "Cérebro", "Estômago"],
            answer: "Cérebro",
            word: "pensamento"
          }
        ],
        story: {
          title: "Ciências: A Máquina Perfeita do Corpo",
          content: "Sofia descobriu que seu corpo era como uma máquina perfeita! Seu coração batia sem parar bombeando sangue para todo o corpo, seus pulmões enchiam e esvaziavam trazendo ar puro, seu estômago digeria a comida transformando-a em energia, e seu cérebro comandava tudo como um computador super inteligente. Cada órgão tinha um trabalho especial, e todos trabalhavam juntos para manter Sofia saudável e cheia de energia para brincar e aprender!"
        }
      },
      'Sistema Solar': {
        questions: [
          {
            content: "Qual é o planeta mais próximo do Sol?",
            choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
            answer: "Mercúrio",
            word: "planeta"
          },
          {
            content: "Quantos planetas existem no nosso Sistema Solar?",
            choices: ["6 planetas", "7 planetas", "8 planetas", "9 planetas"],
            answer: "8 planetas",
            word: "universo"
          },
          {
            content: "Qual planeta é conhecido como o 'Planeta Vermelho'?",
            choices: ["Vênus", "Marte", "Júpiter", "Saturno"],
            answer: "Marte",
            word: "vermelho"
          },
          {
            content: "O que os planetas fazem ao redor do Sol?",
            choices: ["Ficam parados", "Giram em órbita", "Voam para longe", "Caem no Sol"],
            answer: "Giram em órbita",
            word: "órbita"
          }
        ],
        story: {
          title: "Ciências: A Dança dos Planetas",
          content: "A turma da professora Estrela fez uma viagem imaginária pelo Sistema Solar. Começaram visitando Mercúrio, pequenininho e quente perto do Sol, depois Vênus coberto de nuvens, nossa Terra azul e verde, e Marte vermelho como ferrugem. Continuaram para os planetas gigantes: Júpiter com suas tempestades, Saturno com seus anéis brilhantes, Urano azul-esverdeado e Netuno azul distante. Todos dançavam em órbita ao redor do Sol numa valsa cósmica perfeita!"
        }
      }
    },
    '6º ano': {
      'Corpo Humano': {
        questions: [
          {
            content: "Qual órgão é responsável por bombear sangue para todo o corpo humano?",
            choices: ["Pulmão", "Fígado", "Coração", "Estômago"],
            answer: "Coração",
            word: "circulação"
          },
          {
            content: "Quantos pulmões temos no nosso corpo?",
            choices: ["1 pulmão", "2 pulmões", "3 pulmões", "4 pulmões"],
            answer: "2 pulmões",
            word: "respiração"
          },
          {
            content: "Qual órgão é responsável por pensar e comandar o corpo?",
            choices: ["Coração", "Fígado", "Cérebro", "Estômago"],
            answer: "Cérebro",
            word: "neurônio"
          },
          {
            content: "Quantos ossos aproximadamente tem o corpo humano adulto?",
            choices: ["156 ossos", "186 ossos", "206 ossos", "256 ossos"],
            answer: "206 ossos",
            word: "esqueleto"
          }
        ],
        story: {
          title: "Ciências: A Incrível Anatomia Humana",
          content: "O Dr. Anatomia reuniu seus alunos do 6º ano para uma aula especial sobre o corpo humano. 'Vocês são máquinas biológicas perfeitas!', explicou ele. 'O coração bate cerca de 100.000 vezes por dia bombeando 7.000 litros de sangue! Os 2 pulmões processam 20.000 litros de ar! O cérebro, com seus bilhões de neurônios, processa informações mais rápido que qualquer computador! E os 206 ossos do esqueleto sustentam e protegem todos os órgãos!' Os estudantes ficaram impressionados com a complexidade e perfeição do corpo humano."
        }
      },
      'Sistema Solar': {
        questions: [
          {
            content: "Qual é o maior planeta do Sistema Solar?",
            choices: ["Terra", "Saturno", "Júpiter", "Netuno"],
            answer: "Júpiter",
            word: "gigante"
          },
          {
            content: "Qual planeta tem anéis visíveis ao redor?",
            choices: ["Júpiter", "Saturno", "Urano", "Netuno"],
            answer: "Saturno",
            word: "anéis"
          },
          {
            content: "Quantos dias a Terra leva para dar uma volta completa ao redor do Sol?",
            choices: ["300 dias", "350 dias", "365 dias", "400 dias"],
            answer: "365 dias",
            word: "translação"
          },
          {
            content: "Qual é a distância aproximada da Terra ao Sol?",
            choices: ["100 milhões de km", "150 milhões de km", "200 milhões de km", "250 milhões de km"],
            answer: "150 milhões de km",
            word: "astronomia"
          }
        ],
        story: {
          title: "Ciências: Exploradores do Sistema Solar",
          content: "A turma avançada de Astronomia do 6º ano embarcou numa missão virtual pelo Sistema Solar. Descobriram que Júpiter é tão grande que cabem 1.300 Terras dentro dele, que Saturno flutua na água devido à sua baixa densidade, que a Terra viaja a 108.000 km/h ao redor do Sol completando uma volta em 365 dias, e que estamos a exatos 150 milhões de quilômetros da nossa estrela. Cada descoberta os deixava mais fascinados pela imensidão e precisão do universo!"
        }
      }
    },
    '7º ano': {
      'Sistema Solar': {
        questions: [
          { content: "Qual planeta é classificado como gigante gasoso?", choices: ["Marte", "Júpiter", "Mercúrio", "Terra"], answer: "Júpiter", word: "gasoso" },
          { content: "Qual planeta tem o dia mais longo (rotação mais lenta)?", choices: ["Mercúrio", "Vênus", "Terra", "Marte"], answer: "Vênus", word: "rotação" },
          { content: "Qual é a principal força que mantém os planetas em órbita?", choices: ["Magnetismo", "Atrito", "Gravidade", "Vento solar"], answer: "Gravidade", word: "gravidade" },
          { content: "Qual conjunto de corpos celestes orbita diretamente uma estrela?", choices: ["Constelação", "Galáxia", "Sistema planetário", "Nebulosa"], answer: "Sistema planetário", word: "órbita" }
        ],
        story: {
          title: "Ciências: Patrulha Orbital do 7º Ano",
          content: "Sua equipe de 7º ano assume a Patrulha Orbital: investigar fenômenos de rotação, translação e gravidade, catalogando características dos gigantes gasosos e rochosos para um relatório interplanetário."
        }
      }
    }
  },
  'Matemática': {
    '1º ano': {
      'Números': {
        questions: [
          {
            content: "Vamos contar! Se você vê 2 passarinhos na árvore e mais 1 chega voando, quantos passarinhos há no total?",
            choices: ["2 passarinhos", "3 passarinhos", "4 passarinhos", "5 passarinhos"],
            answer: "3 passarinhos",
            word: "soma"
          },
          {
            content: "João tem 4 brinquedos e sua irmã tem 1 brinquedo. Quantos brinquedos eles têm juntos?",
            choices: ["3 brinquedos", "4 brinquedos", "5 brinquedos", "6 brinquedos"],
            answer: "5 brinquedos",
            word: "juntar"
          },
          {
            content: "Ana comprou 3 balas e comeu 1. Quantas balas sobraram?",
            choices: ["1 bala", "2 balas", "3 balas", "4 balas"],
            answer: "2 balas",
            word: "tirar"
          },
          {
            content: "Se você tem 1 maçã e ganha mais 2 maçãs, com quantas maçãs você fica?",
            choices: ["2 maçãs", "3 maçãs", "4 maçãs", "5 maçãs"],
            answer: "3 maçãs",
            word: "ganhar"
          }
        ],
        story: {
          title: "A Vila dos Números Mágicos",
          content: "Era uma vez uma vila onde os números viviam em harmonia. O número 1 era muito solitário, mas quando se juntava com outros números, criava quantidades maiores e mais alegres. Um dia, uma criança curiosa visitou a vila e descobriu que podia usar os números para contar seus brinquedos, seus dedos e até as estrelas no céu. Os números ficaram tão felizes em ajudar que decidiram ensinar todas as crianças do mundo a contar e fazer continhas simples!"
        }
      },
      'Formas': {
        questions: [
          {
            content: "Observe as formas: ⚪🔺⬜. Qual forma tem 3 lados?",
            choices: ["Círculo", "Triângulo", "Quadrado", "Retângulo"],
            answer: "Triângulo",
            word: "formato"
          },
          {
            content: "Quantos lados tem um quadrado?",
            choices: ["2 lados", "3 lados", "4 lados", "5 lados"],
            answer: "4 lados",
            word: "lados"
          },
          {
            content: "Qual forma é redonda como uma bola?",
            choices: ["Triângulo", "Quadrado", "Círculo", "Retângulo"],
            answer: "Círculo",
            word: "redondo"
          },
          {
            content: "Uma janela geralmente tem qual forma?",
            choices: ["Círculo", "Triângulo", "Retângulo", "Estrela"],
            answer: "Retângulo",
            word: "janela"
          }
        ],
        story: {
          title: "O Reino das Formas Encantadas",
          content: "No Reino das Formas Encantadas, cada forma tinha sua própria personalidade. O Círculo era sempre alegre e rolava por toda parte, o Quadrado era organizado e gostava de tudo certinho, o Triângulo era aventureiro e adorava escalar montanhas pontiagudas, e o Retângulo era elegante como uma porta real. Um dia, as formas decidiram construir juntas a mais bela cidade geométrica do mundo, onde cada uma contribuiu com sua característica especial!"
        }
      }
    },
    '4º ano': {
      'Multiplicação': {
        questions: [
          {
            content: "Em uma caixa há 6 ovos. Quantos ovos há em 4 caixas iguais?",
            choices: ["20 ovos", "22 ovos", "24 ovos", "26 ovos"],
            answer: "24 ovos",
            word: "produto"
          },
          {
            content: "Uma escola tem 8 salas e cada sala tem 5 mesas. Quantas mesas há no total?",
            choices: ["35 mesas", "40 mesas", "45 mesas", "50 mesas"],
            answer: "40 mesas",
            word: "multiplicar"
          },
          {
            content: "Carlos coleciona figurinhas em álbuns de 9 páginas. Se ele tem 7 álbuns completos, quantas páginas de figurinhas ele tem?",
            choices: ["56 páginas", "63 páginas", "70 páginas", "77 páginas"],
            answer: "63 páginas",
            word: "coleção"
          },
          {
            content: "Uma pizzaria faz pizzas com 8 fatias cada. Se foram feitas 6 pizzas, quantas fatias há ao todo?",
            choices: ["42 fatias", "46 fatias", "48 fatias", "52 fatias"],
            answer: "48 fatias",
            word: "fatias"
          }
        ],
        story: {
          title: "A Fábrica de Multiplicação do Professor Números",
          content: "O Professor Números criou uma fábrica mágica onde tudo se multiplicava! Quando uma criança colocava 3 brinquedos na máquina e apertava o botão '×4', saíam 12 brinquedos idênticos! A fábrica ajudava padeiros a calcular quantos pães fazer, jardineiros a saber quantas flores plantar em fileiras, e crianças a descobrir quantos doces recebiam quando ganhavam pacotes iguais. Logo, toda a cidade aprendeu que multiplicar era uma forma mágica de somar grupos iguais rapidamente!"
        }
      },
      'Frações': {
        questions: [
          {
            content: "Maria comeu 1/4 de uma pizza e João comeu 2/4 da mesma pizza. Que parte da pizza eles comeram juntos?",
            choices: ["2/4", "3/4", "4/4", "5/4"],
            answer: "3/4",
            word: "fração"
          },
          {
            content: "Uma barra de chocolate tem 8 pedaços. Se você comer 3 pedaços, que fração da barra você comeu?",
            choices: ["3/5", "3/6", "3/7", "3/8"],
            answer: "3/8",
            word: "pedaço"
          },
          {
            content: "Qual fração representa metade de uma pizza?",
            choices: ["1/3", "1/2", "2/3", "3/4"],
            answer: "1/2",
            word: "metade"
          },
          {
            content: "Se um bolo foi dividido em 6 fatias iguais e você comeu 2 fatias, que fração do bolo sobrou?",
            choices: ["2/6", "3/6", "4/6", "5/6"],
            answer: "4/6",
            word: "sobrar"
          }
        ],
        story: {
          title: "A Padaria das Frações Saborosas",
          content: "Dona Rosa tinha uma padaria especial onde tudo era dividido em partes iguais. Seus bolos vinham cortados em fatias perfeitas, suas pizzas em pedaços exatos, e seus pães em porções justas. As crianças da vizinhança adoravam visitar a padaria porque Dona Rosa sempre explicava as frações de forma deliciosa: 'Se você quer 1/2 desta torta, está levando metade dela!' Assim, todos aprenderam frações de uma maneira muito saborosa!"
        }
      }
    },
    '7º ano': {
      'Álgebra': {
        questions: [
          {
            content: "Em uma equação, se x + 7 = 15, qual é o valor de x?",
            choices: ["6", "7", "8", "9"],
            answer: "8",
            word: "incógnita"
          },
          {
            content: "Resolva a equação: 3y = 21. Qual é o valor de y?",
            choices: ["6", "7", "8", "9"],
            answer: "7",
            word: "variável"
          },
          {
            content: "Se 2a - 4 = 10, qual é o valor de a?",
            choices: ["5", "6", "7", "8"],
            answer: "7",
            word: "equação"
          },
          {
            content: "Em uma expressão algébrica, o que representa a letra 'x'?",
            choices: ["Um número conhecido", "Uma operação", "Um número desconhecido", "Uma fração"],
            answer: "Um número desconhecido",
            word: "desconhecido"
          }
        ],
        story: {
          title: "O Detetive das Incógnitas Misteriosas",
          content: "O Detetive Álgebra tinha uma missão especial: encontrar os números escondidos por trás das letras misteriosas. Em cada caso que resolvia, havia pistas numéricas que o ajudavam a descobrir o valor de x, y, ou z. 'Quando vejo x + 5 = 12', dizia ele, 'sei que x deve ser 7, porque 7 + 5 = 12!' Seus métodos de investigação matemática eram tão eficazes que logo ensinou outros detetives a desvendarem os mistérios algébricos da cidade!"
        }
      }
    }
  },
  'História': {
    '5º ano': {
      'Grandes Navegações': {
        questions: [
          {
            content: "Qual embarcação foi mais usada pelos portugueses nas Grandes Navegações?",
            choices: ["Canoa", "Caravela", "Jangada", "Navio a vapor"],
            answer: "Caravela",
            word: "navegação"
          },
          {
            content: "Quem foi o navegador que chegou ao Brasil em 1500?",
            choices: ["Vasco da Gama", "Pedro Álvares Cabral", "Cristóvão Colombo", "Bartolomeu Dias"],
            answer: "Pedro Álvares Cabral",
            word: "descoberta"
          },
          {
            content: "Qual instrumento os navegadores usavam para se orientar no mar?",
            choices: ["Telescópio", "Bússola", "Termômetro", "Relógio"],
            answer: "Bússola",
            word: "orientação"
          },
          {
            content: "O que os portugueses procuravam quando saíram navegando?",
            choices: ["Ouro", "Especiarias", "Diamantes", "Petróleo"],
            answer: "Especiarias",
            word: "especiarias"
          }
        ],
        story: {
          title: "História: A Aventura dos Navegadores Corajosos",
          content: "Há mais de 500 anos, navegadores corajosos como Pedro Álvares Cabral embarcaram em caravelas resistentes para explorar oceanos desconhecidos. Com apenas bússolas para orientação e mapas rudimentares, eles enfrentavam tempestades e mares bravios em busca de especiarias preciosas e novas terras. Durante uma dessas viagens, Cabral avistou terras brasileiras e fez uma das descobertas mais importantes da história. Esses heróis dos mares mudaram o mundo para sempre com sua coragem e determinação!"
        }
      },
      'Brasil Colonial': {
        questions: [
          {
            content: "Qual foi o primeiro produto explorado pelos portugueses no Brasil?",
            choices: ["Ouro", "Açúcar", "Pau-brasil", "Café"],
            answer: "Pau-brasil",
            word: "colônia"
          },
          {
            content: "Como eram chamados os portugueses que vinham morar no Brasil?",
            choices: ["Visitantes", "Turistas", "Colonos", "Exploradores"],
            answer: "Colonos",
            word: "colonos"
          },
          {
            content: "Qual atividade se tornou muito importante na economia colonial?",
            choices: ["Pesca", "Cultivo de açúcar", "Caça", "Artesanato"],
            answer: "Cultivo de açúcar",
            word: "açúcar"
          },
          {
            content: "Quem trabalhava forçadamente nas plantações coloniais?",
            choices: ["Portugueses", "Escravos", "Voluntários", "Soldados"],
            answer: "Escravos",
            word: "trabalho"
          }
        ],
        story: {
          title: "Os Primeiros Tempos do Brasil Colonial",
          content: "Quando os portugueses chegaram ao Brasil, encontraram uma terra rica em pau-brasil, uma madeira vermelha muito valiosa na Europa. Os primeiros colonos se estabeleceram no litoral e começaram a explorar essa riqueza natural. Com o tempo, descobriram que a terra era perfeita para o cultivo da cana-de-açúcar, e grandes plantações foram criadas. Infelizmente, esse período também marcou o início do trabalho escravo, uma página triste de nossa história que não devemos esquecer, para construirmos um futuro mais justo para todos."
        }
      }
    }
  },
  'Português': {
    '3º ano': {
      'Alfabeto': {
        questions: [
          {
            content: "Quantas letras tem o alfabeto português?",
            choices: ["24 letras", "25 letras", "26 letras", "27 letras"],
            answer: "26 letras",
            word: "alfabeto"
          },
          {
            content: "Quantas são as vogais do alfabeto?",
            choices: ["3 vogais", "4 vogais", "5 vogais", "6 vogais"],
            answer: "5 vogais",
            word: "vogal"
          },
          {
            content: "Qual é a primeira letra do alfabeto?",
            choices: ["B", "A", "C", "D"],
            answer: "A",
            word: "primeira"
          },
          {
            content: "As letras que não são vogais chamam-se:",
            choices: ["Números", "Consoantes", "Símbolos", "Sinais"],
            answer: "Consoantes",
            word: "consoante"
          }
        ],
        story: {
          title: "Português: A Grande Festa do Alfabeto",
          content: "Na Terra das Letras, aconteceu a maior festa do ano: o aniversário do Alfabeto! As 26 letrinhas se organizaram em uma fila alegre, com A na frente como líder. As vogais A, E, I, O, U vestiram roupas coloridas e cantaram melodias bonitas, enquanto as consoantes fizeram percussão e sons divertidos. Juntas, elas mostraram como, quando se combinam, podem formar palavras mágicas que contam histórias, expressam sentimentos e conectam pessoas ao redor do mundo!"
        }
      }
    },
    '6º ano': {
      'Substantivos': {
        questions: [
          {
            content: "Qual das palavras abaixo é um substantivo próprio?",
            choices: ["cidade", "Brasil", "animal", "bonito"],
            answer: "Brasil",
            word: "substantivo"
          },
          {
            content: "Qual palavra representa um substantivo comum?",
            choices: ["João", "São Paulo", "livro", "Maria"],
            answer: "livro",
            word: "comum"
          },
          {
            content: "Os substantivos próprios sempre começam com:",
            choices: ["Letra minúscula", "Letra maiúscula", "Número", "Símbolo"],
            answer: "Letra maiúscula",
            word: "próprio"
          },
          {
            content: "Qual é a função principal do substantivo na frase?",
            choices: ["Indicar ação", "Dar nome às coisas", "Descrever qualidades", "Ligar palavras"],
            answer: "Dar nome às coisas",
            word: "nomear"
          }
        ],
        story: {
          title: "A Cidade dos Nomes Especiais",
          content: "Na Cidade dos Nomes Especiais, vivia a família Substantivo. O Sr. Próprio sempre usava letra maiúscula no chapéu, pois representava nomes únicos como Brasil, Maria e São Paulo. Já a Sra. Comum preferia roupas simples, pois nomeava coisas do dia a dia como livros, casas e animais. Seus filhos aprenderam que alguns nomes são especiais e únicos (próprios), enquanto outros são usados para todas as coisas da mesma categoria (comuns). Todos juntos formavam o núcleo das frases, dando nome a tudo que existe!"
        }
      }
    }
  },
  'Geografia': {
    '4º ano': {
      'Brasil': {
        questions: [
          {
            content: "Qual é a capital do Brasil?",
            choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
            answer: "Brasília",
            word: "capital"
          },
          {
            content: "Qual é o maior bioma brasileiro?",
            choices: ["Cerrado", "Amazônia", "Mata Atlântica", "Pantanal"],
            answer: "Amazônia",
            word: "floresta"
          },
          {
            content: "Em que continente o Brasil está localizado?",
            choices: ["África", "Ásia", "América do Sul", "Europa"],
            answer: "América do Sul",
            word: "continente"
          },
          {
            content: "Qual oceano banha o litoral brasileiro?",
            choices: ["Oceano Pacífico", "Oceano Atlântico", "Oceano Índico", "Oceano Ártico"],
            answer: "Oceano Atlântico",
            word: "oceano"
          }
        ],
        story: {
          title: "Geografia: A Grande Viagem pelo Brasil Gigante",
          content: "A família Descobrimento decidiu conhecer seu imenso país, o Brasil. Começaram pela capital Brasília, com seus prédios modernos e arquitetura única. Depois voaram sobre a gigantesca Floresta Amazônica, onde viram rios enormes e milhões de árvores verdes. Desceram até as praias banhadas pelo Oceano Atlântico e subiram montanhas da Mata Atlântica. Em cada região, descobriram costumes diferentes, comidas típicas e paisagens de tirar o fôlego. 'Nosso Brasil é realmente um país continental!', exclamaram ao final da aventura."
        }
      }
    },
    '7º ano': {
      'Continentes': {
        questions: [
          {
            content: "Quantos continentes existem no mundo?",
            choices: ["5 continentes", "6 continentes", "7 continentes", "8 continentes"],
            answer: "7 continentes",
            word: "continente"
          },
          {
            content: "Qual é o maior continente do mundo?",
            choices: ["África", "Ásia", "América", "Europa"],
            answer: "Ásia",
            word: "maior"
          },
          {
            content: "Em qual continente fica o Brasil?",
            choices: ["África", "Ásia", "América", "Europa"],
            answer: "América",
            word: "localização"
          },
          {
            content: "Qual continente é conhecido como berço da humanidade?",
            choices: ["Ásia", "Europa", "África", "Oceania"],
            answer: "África",
            word: "origem"
          }
        ],
        story: {
          title: "Geografia: A Volta ao Mundo dos Sete Continentes",
          content: "O explorador Geo Grafia embarcou na maior aventura de sua vida: conhecer os 7 continentes! Começou pela Ásia gigante, com suas culturas milenares e tecnologia avançada. Voou para a África berço da humanidade, depois Europa com sua rica história. Atravessou o oceano para a América, dividida em Norte e Sul, conheceu a Oceania com suas ilhas paradisíacas, e terminou na gelada Antártida. Em cada continente, descobriu que nosso planeta é incrivelmente diverso, cheio de povos, culturas, climas e paisagens únicos!"
        }
      }
    }
  }
};

export const getExpandedGranularFallback = (gameParams: GameParameters, contentType: 'question' | 'story', questionIndex?: number): GranularQuestion[] | GranularStory | GranularQuestion | null => {
  const { subject, schoolGrade, theme } = gameParams;
  
  console.log(`[EXPANDED-FALLBACK] 🎯 BUSCANDO: ${subject} > ${schoolGrade} > ${theme} (índice: ${questionIndex})`);
  
  const subjectFallbacks = expandedGranularFallbacks[subject];
  if (!subjectFallbacks) {
    console.log(`[EXPANDED-FALLBACK] ❌ Matéria ${subject} não encontrada`);
    return null;
  }
  
  const gradeFallbacks = subjectFallbacks[schoolGrade];
  if (!gradeFallbacks) {
    console.log(`[EXPANDED-FALLBACK] ❌ Série ${schoolGrade} não encontrada para ${subject}`);
    return null;
  }
  
  const themeFallbacks = gradeFallbacks[theme];
  if (!themeFallbacks) {
    console.log(`[EXPANDED-FALLBACK] ❌ Tema ${theme} não encontrado para ${subject} - ${schoolGrade}`);
    return null;
  }
  
  if (contentType === 'question') {
    const questions = themeFallbacks.questions;
    
    // Se questionIndex foi fornecido, retornar questão específica
    if (questionIndex !== undefined && questions && questions[questionIndex]) {
      console.log(`[EXPANDED-FALLBACK] ✅ SUCESSO: Retornando questão ${questionIndex} específica para ${subject} - ${schoolGrade} - ${theme}`);
      return questions[questionIndex];
    }
    
    // Se não há índice, retornar todas as questões (comportamento antigo)
    if (questions && questions.length === 4) {
      console.log(`[EXPANDED-FALLBACK] ✅ SUCESSO: Retornando todas as 4 questões para ${subject} - ${schoolGrade} - ${theme}`);
      return questions;
    }
  }
  
  if (contentType === 'story') {
    const story = themeFallbacks.story;
    if (story) {
      console.log(`[EXPANDED-FALLBACK] ✅ SUCESSO: Retornando história específica para ${subject} - ${schoolGrade} - ${theme}`);
      return story;
    }
  }
  
  console.log(`[EXPANDED-FALLBACK] ❌ Conteúdo ${contentType} não encontrado para a combinação específica`);
  return null;
};

// Função para verificar se existe fallback expandido
export const hasExpandedGranularFallback = (gameParams: GameParameters): boolean => {
  const { subject, schoolGrade, theme } = gameParams;
  const exists = !!(expandedGranularFallbacks[subject]?.[schoolGrade]?.[theme]);
  console.log(`[EXPANDED-FALLBACK] Verificação de existência para ${subject}/${schoolGrade}/${theme}: ${exists}`);
  return exists;
};

// Função para garantir 4 palavras-chave únicas
export const ensureUniqueKeywords = (questions: GranularQuestion[]): boolean => {
  if (!questions || questions.length !== 4) {
    console.log(`[EXPANDED-FALLBACK] ❌ Número incorreto de questões: ${questions?.length || 0}`);
    return false;
  }
  
  const words = questions.map(q => q.word);
  const uniqueWords = new Set(words);
  const isUnique = uniqueWords.size === 4;
  
  console.log(`[EXPANDED-FALLBACK] Verificação de unicidade: ${words.join(', ')} = ${isUnique ? 'ÚNICAS' : 'DUPLICADAS'}`);
  return isUnique;
};

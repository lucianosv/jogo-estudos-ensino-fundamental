// FALLBACKS ESPECÍFICOS PARA ROMA ANTIGA - 4 QUESTÕES TOTALMENTE DIFERENTES
import { GameParameters } from "@/components/GameSetup";

interface RomaQuestion {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

export const getRomaSpecificQuestions = (schoolGrade: string): RomaQuestion[] => {
  const grade = parseInt(schoolGrade.charAt(0));

  // QUESTÕES PARA SÉRIES INICIAIS (1º-3º ano)
  if (grade >= 1 && grade <= 3) {
    return [
      {
        content: `História - Roma Antiga (${schoolGrade}): Onde ficava o Império Romano?`,
        choices: ["Na América", "Na Europa", "Na África", "Na Ásia"],
        answer: "Na Europa",
        word: "império1"
      },
      {
        content: `História - Roma Antiga (${schoolGrade}): Como se chamavam os soldados romanos?`,
        choices: ["Cavaleiros", "Gladiadores", "Legionários", "Guerreiros"],
        answer: "Legionários",
        word: "soldados2"
      },
      {
        content: `História - Roma Antiga (${schoolGrade}): O que os romanos construíram para levar água?`,
        choices: ["Pontes", "Aquedutos", "Torres", "Muros"],
        answer: "Aquedutos",
        word: "água3"
      },
      {
        content: `História - Roma Antiga (${schoolGrade}): Qual era a língua falada em Roma?`,
        choices: ["Grego", "Português", "Latim", "Inglês"],
        answer: "Latim",
        word: "idioma4"
      }
    ];
  }

  // QUESTÕES PARA SÉRIES INTERMEDIÁRIAS (4º-6º ano)
  if (grade >= 4 && grade <= 6) {
    return [
      {
        content: `História - Roma Antiga (${schoolGrade}): Qual era a capital do Império Romano?`,
        choices: ["Atenas", "Roma", "Esparta", "Alexandria"],
        answer: "Roma",
        word: "capital1"
      },
      {
        content: `História - Roma Antiga (${schoolGrade}): Quem foi o famoso general que conquistou a Gália?`,
        choices: ["Augusto", "Júlio César", "Marco Antônio", "Pompeu"],
        answer: "Júlio César",
        word: "general2"
      },
      {
        content: `História - Roma Antiga (${schoolGrade}): Como se chamava a arena onde lutavam os gladiadores?`,
        choices: ["Fórum Romano", "Coliseu", "Panteon", "Circo Máximo"],
        answer: "Coliseu",
        word: "arena3"
      },
      {
        content: `História - Roma Antiga (${schoolGrade}): O que caracterizava o governo romano no início?`,
        choices: ["Monarquia", "República", "Império", "Democracia"],
        answer: "República",
        word: "governo4"
      }
    ];
  }

  // QUESTÕES PARA SÉRIES AVANÇADAS (7º ano+)
  return [
    {
      content: `História - Roma Antiga (${schoolGrade}): Em que século começou o Império Romano?`,
      choices: ["Século I a.C.", "Século I d.C.", "Século II d.C.", "Século III d.C."],
      answer: "Século I a.C.",
      word: "século1"
    },
    {
      content: `História - Roma Antiga (${schoolGrade}): Qual imperador dividiu o Império Romano?`,
      choices: ["Júlio César", "Augusto", "Diocleciano", "Constantino"],
      answer: "Diocleciano",
      word: "divisão2"
    },
    {
      content: `História - Roma Antiga (${schoolGrade}): Que acontecimento marcou o fim do Império Romano do Ocidente?`,
      choices: ["Invasões bárbaras", "Guerra civil", "Peste", "Terremoto"],
      answer: "Invasões bárbaras",
      word: "invasões3"
    },
    {
      content: `História - Roma Antiga (${schoolGrade}): Qual foi o principal legado jurídico romano?`,
      choices: ["Constituição", "Direito Romano", "Códigos militares", "Leis comerciais"],
      answer: "Direito Romano",
      word: "legado4"
    }
  ];
};

export const getRomaQuestionByIndex = (schoolGrade: string, questionIndex: number): RomaQuestion => {
  const questions = getRomaSpecificQuestions(schoolGrade);
  return questions[questionIndex % questions.length];
};
import { prisma } from "@/lib/db/prisma";

const TEMPLATES = [
  {
    type: "APPLICATION_RECEIVED",
    name: "Agradecimento de Candidatura",
    subjects: { pt: "Candidatura Recebida — {{jobTitle}}", es: "Candidatura Recibida — {{jobTitle}}", en: "Application Received — {{jobTitle}}" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nObrigado pelo seu interesse na posição de {{jobTitle}} na ITSector.\n\nA sua candidatura foi recebida com sucesso e será analisada pela nossa equipa de recrutamento. Entraremos em contacto consigo em breve com os próximos passos.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nGracias por su interés en el puesto de {{jobTitle}} en ITSector.\n\nHemos recibido su candidatura correctamente y será analizada por nuestro equipo de selección. Nos pondremos en contacto con usted en breve con los próximos pasos.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nThank you for your interest in the {{jobTitle}} position at ITSector.\n\nYour application has been successfully received and will be reviewed by our recruitment team. We will be in touch shortly with the next steps.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "SANITY_CHECK_SUMMARY",
    name: "Resumo de Conversa — Sanity Check",
    subjects: { pt: "Resumo da Nossa Conversa — {{jobTitle}}", es: "Resumen de Nuestra Conversación — {{jobTitle}}", en: "Summary of Our Conversation — {{jobTitle}}" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nAgradeço a disponibilidade para a nossa conversa telefónica de hoje.\n\nConforme discutido, segue o resumo:\n{{summary}}\n\nRequisitos principais da vaga:\n{{nextStep}}\n\nCaso tenha alguma questão adicional, não hesite em contactar-nos.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nAgradezco su disponibilidad para nuestra conversación telefónica de hoy.\n\nTal y como hemos comentado, aquí tiene el resumen:\n{{summary}}\n\nRequisitos principales del puesto:\n{{nextStep}}\n\nSi tiene alguna pregunta adicional, no dude en ponerse en contacto con nosotros.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nThank you for your availability for our phone call today.\n\nAs discussed, here is a summary:\n{{summary}}\n\nMain requirements for the role:\n{{nextStep}}\n\nShould you have any further questions, please do not hesitate to contact us.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "BEHAVIOURAL_INTERVIEW_INVITE",
    name: "Convite — Entrevista Comportamental",
    subjects: { pt: "Convite para Entrevista Comportamental — {{jobTitle}}", es: "Invitación a Entrevista de Comportamiento — {{jobTitle}}", en: "Invitation to Behavioural Interview — {{jobTitle}}" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nTemos o prazer de o(a) convidar para uma entrevista comportamental no âmbito da posição de {{jobTitle}} na ITSector.\n\nData e hora: {{dateTime}}\nFormato: Videochamada / Presencial (a confirmar)\n\nEsta entrevista tem como objetivo conhecê-lo(a) melhor, compreender as suas experiências passadas e motivações.\n\nPor favor confirme a sua disponibilidade respondendo a este email.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nNos complace invitarle a una entrevista de comportamiento para el puesto de {{jobTitle}} en ITSector.\n\nFecha y hora: {{dateTime}}\nFormato: Videollamada / Presencial (a confirmar)\n\nEl objetivo de esta entrevista es conocerle mejor y comprender sus experiencias pasadas y motivaciones.\n\nPor favor confirme su disponibilidad respondiendo a este correo.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nWe are pleased to invite you to a behavioural interview for the {{jobTitle}} position at ITSector.\n\nDate and time: {{dateTime}}\nFormat: Video call / In-person (to confirm)\n\nThis interview aims to get to know you better and understand your past experiences and motivations.\n\nPlease confirm your availability by replying to this email.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "TECHNICAL_INTERVIEW_INVITE",
    name: "Convite — Entrevista Técnica",
    subjects: { pt: "Convite para Entrevista Técnica — {{jobTitle}}", es: "Invitación a Entrevista Técnica — {{jobTitle}}", en: "Invitation to Technical Interview — {{jobTitle}}" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nFelicitamo-lo(a) pela prestação na entrevista comportamental e temos o prazer de o(a) convidar para a próxima fase: entrevista técnica para a posição de {{jobTitle}}.\n\nData e hora: {{dateTime}}\nDuração estimada: 60-90 minutos\n\nSerão abordados temas técnicos relacionados com a função. Recomendamos que reveja os requisitos previamente comunicados.\n\nPor favor confirme a sua disponibilidade.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nLe felicitamos por su desempeño en la entrevista de comportamiento y nos complace invitarle a la siguiente fase: entrevista técnica para el puesto de {{jobTitle}}.\n\nFecha y hora: {{dateTime}}\nDuración estimada: 60-90 minutos\n\nSe tratarán temas técnicos relacionados con el puesto. Le recomendamos revisar los requisitos previamente comunicados.\n\nPor favor confirme su disponibilidad.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nCongratulations on your performance in the behavioural interview. We are pleased to invite you to the next stage: a technical interview for the {{jobTitle}} position.\n\nDate and time: {{dateTime}}\nEstimated duration: 60-90 minutes\n\nTechnical topics related to the role will be covered. We recommend reviewing the requirements previously shared.\n\nPlease confirm your availability.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "PROJECT_INTERVIEW_INVITE",
    name: "Convite — Entrevista em Projeto",
    subjects: { pt: "Convite para Entrevista em Projeto — {{jobTitle}}", es: "Invitación a Entrevista de Proyecto — {{jobTitle}}", en: "Invitation to Project Interview — {{jobTitle}}" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nTemos o prazer de o(a) convidar para uma entrevista em contexto de projeto para a posição de {{jobTitle}} na ITSector.\n\nData e hora: {{dateTime}}\n\nEsta fase envolve uma conversa com a equipa de projeto onde irá colaborar, com o objetivo de alinhar expectativas técnicas e de equipa.\n\nPor favor confirme a sua disponibilidade.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nNos complace invitarle a una entrevista en contexto de proyecto para el puesto de {{jobTitle}} en ITSector.\n\nFecha y hora: {{dateTime}}\n\nEsta fase implica una conversación con el equipo de proyecto con el que colaborará, con el objetivo de alinear expectativas técnicas y de equipo.\n\nPor favor confirme su disponibilidad.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nWe are pleased to invite you to a project interview for the {{jobTitle}} position at ITSector.\n\nDate and time: {{dateTime}}\n\nThis stage involves a conversation with the project team you will be working with, aiming to align technical and team expectations.\n\nPlease confirm your availability.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "CLIENT_INTERVIEW_INVITE",
    name: "Convite — Entrevista no Cliente",
    subjects: { pt: "Convite para Entrevista Final — {{jobTitle}}", es: "Invitación a Entrevista Final — {{jobTitle}}", en: "Invitation to Final Interview — {{jobTitle}}" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nCom muito agrado comunicamos que avançou para a fase final do processo de seleção para a posição de {{jobTitle}}.\n\nData e hora: {{dateTime}}\nLocal: A confirmar brevemente\n\nSugerimos que venha vestido(a) de forma profissional e preparado(a) para apresentar a sua experiência e motivação.\n\nPor favor confirme a sua disponibilidade.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nCon mucho agrado le comunicamos que ha avanzado a la fase final del proceso de selección para el puesto de {{jobTitle}}.\n\nFecha y hora: {{dateTime}}\nLugar: A confirmar brevemente\n\nSugerimos que venga vestido/a de forma profesional y preparado/a para presentar su experiencia y motivación.\n\nPor favor confirme su disponibilidad.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nWe are delighted to inform you that you have advanced to the final stage of the selection process for the {{jobTitle}} position.\n\nDate and time: {{dateTime}}\nLocation: To be confirmed shortly\n\nWe suggest dressing professionally and being prepared to present your experience and motivation.\n\nPlease confirm your availability.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "PROPOSAL_SENT",
    name: "Envio de Proposta",
    subjects: { pt: "Proposta de Colaboração — {{jobTitle}} — ITSector", es: "Propuesta de Colaboración — {{jobTitle}} — ITSector", en: "Collaboration Proposal — {{jobTitle}} — ITSector" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nApós a conclusão do processo de seleção, temos o prazer de lhe apresentar uma proposta de colaboração para a posição de {{jobTitle}}.\n\n{{summary}}\n\nSolicitamos que nos comunique a sua decisão até {{dateTime}}.\n\nFicamos disponíveis para esclarecer qualquer dúvida.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nTras la conclusión del proceso de selección, nos complace presentarle una propuesta de colaboración para el puesto de {{jobTitle}}.\n\n{{summary}}\n\nLe solicitamos que nos comunique su decisión antes del {{dateTime}}.\n\nEstamos disponibles para resolver cualquier duda.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Selección",
      en: "Dear {{candidateName}},\n\nFollowing the conclusion of the selection process, we are pleased to present you with a collaboration proposal for the {{jobTitle}} position.\n\n{{summary}}\n\nWe kindly ask you to communicate your decision by {{dateTime}}.\n\nWe are available to answer any questions.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "REJECTION_FEEDBACK",
    name: "Feedback — Nao Progressao",
    subjects: { pt: "Processo de Selecao — {{jobTitle}} — ITSector", es: "Proceso de Seleccion — {{jobTitle}} — ITSector", en: "Selection Process — {{jobTitle}} — ITSector" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nAgradecemos o seu interesse na posição de {{jobTitle}} na ITSector e o tempo que dedicou ao nosso processo de seleção.\n\nApos cuidadosa analise, informamos que, neste momento, nao iremos avancar com a sua candidatura para esta posicao. Esta decisao nao reflete o seu valor profissional, mas sim a necessidade de alinhar o perfil com as especificidades atuais da funcao.\n\nO seu curriculo ficara registado na nossa base de dados e poderemos contacta-lo(a) para oportunidades futuras que se adequem ao seu perfil.\n\nDesejamos-lhe os maiores sucessos na sua carreira.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nAgradecemos su interes en el puesto de {{jobTitle}} en ITSector y el tiempo que dedicó a nuestro proceso de seleccion.\n\nTras un cuidadoso analisis, le informamos que, en este momento, no vamos a continuar con su candidatura para esta posicion. Esta decision no refleja su valor profesional, sino la necesidad de ajustar el perfil a las especificidades actuales del puesto.\n\nSu curriculum quedara registrado en nuestra base de datos y podremos contactarle para oportunidades futuras que se adapten a su perfil.\n\nLe deseamos mucho exito en su carrera.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Seleccion",
      en: "Dear {{candidateName}},\n\nThank you for your interest in the {{jobTitle}} position at ITSector and for the time you dedicated to our selection process.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application for this position at this time. This decision does not reflect your professional value, but rather the need to match the profile to the current specifics of the role.\n\nYour CV will remain in our database and we may contact you for future opportunities that match your profile.\n\nWe wish you every success in your career.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
  {
    type: "TALENT_POOL_WELCOME",
    name: "Boas-vindas ao Talent Pool",
    subjects: { pt: "O Seu Perfil — ITSector Talent Pool", es: "Su Perfil — ITSector Bolsa de Talento", en: "Your Profile — ITSector Talent Pool" },
    bodies: {
      pt: "Exmo(a) {{candidateName}},\n\nO seu perfil profissional despertou o interesse da nossa equipa de recrutamento e temos o prazer de o(a) informar que foi incluido(a) na nossa Talent Pool.\n\nIsso significa que o seu perfil sera considerado prioritariamente em futuras oportunidades que correspondam as suas competencias e experiencia.\n\nNao e necessaria qualquer acao da sua parte. Entraremos em contacto quando surgir uma oportunidade adequada.\n\nObrigado pela sua confianca na ITSector.\n\nCom os melhores cumprimentos,\n{{recruiterName}}\nITSector — Recrutamento",
      es: "Estimado/a {{candidateName}},\n\nSu perfil profesional ha despertado el interes de nuestro equipo de seleccion y nos complace informarle de que ha sido incluido/a en nuestra Bolsa de Talento.\n\nEsto significa que su perfil sera considerado prioritariamente en futuras oportunidades que correspondan a sus competencias y experiencia.\n\nNo es necesaria ninguna accion por su parte. Nos pondremos en contacto cuando surja una oportunidad adecuada.\n\nGracias por su confianza en ITSector.\n\nUn cordial saludo,\n{{recruiterName}}\nITSector — Seleccion",
      en: "Dear {{candidateName}},\n\nYour professional profile has caught the attention of our recruitment team and we are pleased to inform you that you have been added to our Talent Pool.\n\nThis means your profile will be considered as a priority for future opportunities that match your skills and experience.\n\nNo action is required on your part. We will be in touch when a suitable opportunity arises.\n\nThank you for your trust in ITSector.\n\nKind regards,\n{{recruiterName}}\nITSector — Recruitment",
    },
  },
];

async function main() {
  let count = 0;
  for (const t of TEMPLATES) {
    for (const lang of ["pt", "es", "en"]) {
      const key = `${t.type}_${lang.toUpperCase()}`;
      await prisma.emailTemplate.upsert({
        where:  { type: key },
        update: {
          name:            `${t.name} (${lang.toUpperCase()})`,
          lang,
          subjectTemplate: t.subjects[lang],
          bodyTemplate:    t.bodies[lang],
          isActive:        true,
        },
        create: {
          type:            key,
          name:            `${t.name} (${lang.toUpperCase()})`,
          lang,
          subjectTemplate: t.subjects[lang],
          bodyTemplate:    t.bodies[lang],
          isActive:        true,
        },
      });
      count++;
    }
  }
  console.log(`Seeded ${count} email templates (${TEMPLATES.length} types x PT/ES/EN).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

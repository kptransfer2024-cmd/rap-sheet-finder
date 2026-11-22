import type { AlertId, LText, Locale, RouteStatus, StepMethod, VerificationStatus } from '../domain/types';

export function tr(text: LText | undefined, locale: Locale): string {
  if (!text) return '';
  return (locale === 'es' && text.es) || text.en;
}

/** True when Spanish was requested but this string only exists in English. */
export function isFallback(text: LText | undefined, locale: Locale): boolean {
  return locale === 'es' && !!text && !text.es;
}

type Dict = Record<string, LText>;

export const UI: Dict = {
  appName: { en: 'Rap Sheet Finder', es: 'Rap Sheet Finder' },
  subtitle: {
    en: 'Find the right path to your court records and record-clearance resources.',
    es: 'Encuentre el camino correcto hacia sus registros judiciales y recursos para limpiar su récord.',
  },
  badge: { en: 'Santa Clara County • California', es: 'Condado de Santa Clara • California' },
  demoBadge: { en: 'Research demo', es: 'Demostración' },
  skipToContent: { en: 'Skip to main content', es: 'Saltar al contenido' },
  welcomeTitle: { en: 'Let\'s find the easiest practical next step.', es: 'Encontremos el siguiente paso más fácil.' },
  welcomeLead: {
    en: 'Answer a few simple questions — one at a time — and get a step-by-step plan with official links. Most people finish in 2–4 minutes.',
    es: 'Responda unas preguntas sencillas, una a la vez, y obtenga un plan paso a paso con enlaces oficiales. La mayoría termina en 2–4 minutos.',
  },
  reason1: { en: 'Find your case number without guessing where to look', es: 'Encuentre su número de caso sin adivinar dónde buscar' },
  reason2: { en: 'Get copies of court documents — often without a statewide record request', es: 'Obtenga copias de documentos, a menudo sin pedir un récord estatal' },
  reason3: { en: 'See official record-clearing information and free help', es: 'Vea información oficial para limpiar su récord y ayuda gratuita' },
  reason4: { en: 'Leave with a printable checklist you can do from home where possible', es: 'Salga con una lista imprimible, desde casa cuando sea posible' },
  noPersonal: {
    en: 'We never ask for your name, birth date, case number or what happened. Your answers stay in this browser tab and disappear when you close it.',
    es: 'Nunca pedimos su nombre, fecha de nacimiento, número de caso ni lo que pasó. Sus respuestas se quedan en esta pestaña y desaparecen al cerrarla.',
  },
  startOwn: { en: 'Start — it\'s my own record', es: 'Empezar — es mi propio récord' },
  startHelping: { en: 'I\'m helping someone (with permission)', es: 'Ayudo a alguien (con permiso)' },
  someoneElse: { en: 'Looking up someone else?', es: '¿Busca a otra persona?' },
  tryExample: { en: 'Or try an example', es: 'O pruebe un ejemplo' },
  tryExampleLead: { en: 'Fictional scenarios — no real people or cases.', es: 'Escenarios ficticios, sin personas ni casos reales.' },
  disclaimerShort: {
    en: 'General information, not legal advice. This tool can\'t decide eligibility or look up your records.',
    es: 'Información general, no asesoría legal. Esta herramienta no decide si usted califica ni busca sus registros.',
  },
  back: { en: 'Back', es: 'Atrás' },
  next: { en: 'Continue', es: 'Continuar' },
  skip: { en: 'Skip this question', es: 'Omitir esta pregunta' },
  notSure: { en: 'I\'m not sure', es: 'No estoy seguro/a' },
  whyWeAsk: { en: 'Why we ask', es: 'Por qué preguntamos' },
  showPlanNow: { en: 'Show my plan now', es: 'Ver mi plan ahora' },
  showPlanNowHint: { en: 'Unanswered questions count as "not sure."', es: 'Las preguntas sin responder cuentan como "no estoy seguro/a".' },
  startOver: { en: 'Start over', es: 'Empezar de nuevo' },
  clearAnswers: { en: 'Clear my answers', es: 'Borrar mis respuestas' },
  cleared: { en: 'Your answers were cleared.', es: 'Sus respuestas se borraron.' },
  editAnswers: { en: 'Edit previous answers', es: 'Editar respuestas anteriores' },
  yourAnswers: { en: 'Your answers', es: 'Sus respuestas' },
  noAnswersYet: { en: 'Nothing yet.', es: 'Nada todavía.' },
  edit: { en: 'Edit', es: 'Editar' },
  pathSoFar: { en: 'Your path so far', es: 'Su camino hasta ahora' },
  pathPreviewEmpty: { en: 'Your likely first step will appear here as you answer.', es: 'Su primer paso probable aparecerá aquí.' },
  seePlan: { en: 'See full plan', es: 'Ver plan completo' },
  privacyTitle: { en: 'Privacy', es: 'Privacidad' },
  privacyBody: {
    en: 'Choices only — no names, dates, case numbers or descriptions. Nothing is sent anywhere or saved after you close the tab.',
    es: 'Solo opciones, sin nombres, fechas ni números. Nada se envía ni se guarda al cerrar la pestaña.',
  },
  progressLabel: { en: 'Progress', es: 'Progreso' },
  aboutMore: { en: 'About {n} more — may change with your answers', es: 'Unas {n} más; puede cambiar' },
  almostDone: { en: 'Almost done', es: 'Casi listo' },
  questionOf: { en: 'Question {n}', es: 'Pregunta {n}' },
  caseLabelPrefix: { en: 'About', es: 'Sobre' },
  pickAll: { en: 'Pick all that apply.', es: 'Elija todas las que apliquen.' },
  optional: { en: 'Optional', es: 'Opcional' },
  // Results
  yourPlan: { en: 'Your plan', es: 'Su plan' },
  startHere: { en: 'Start here', es: 'Empiece aquí' },
  alsoInPlan: { en: 'Also in your plan', es: 'También en su plan' },
  steps: { en: 'Steps', es: 'Pasos' },
  option: { en: 'Option', es: 'Opción' },
  haveReady: { en: 'Have ready (enter only on the official site or form)', es: 'Tenga listo (solo en el sitio o formulario oficial)' },
  costs: { en: 'Costs', es: 'Costos' },
  accessAlt: { en: 'Other way', es: 'Otra forma' },
  ifProblem: { en: 'If this doesn\'t work', es: 'Si esto no funciona' },
  whyThis: { en: 'Why you\'re seeing this', es: 'Por qué ve esto' },
  documentsToLookFor: { en: 'Documents to look for', es: 'Documentos que buscar' },
  stillUncertain: { en: 'Not confirmed yet', es: 'Aún sin confirmar' },
  whatIfNot: { en: 'What if this doesn\'t work?', es: '¿Y si esto no funciona?' },
  otherOptions: { en: 'Other options', es: 'Otras opciones' },
  whereToGo: { en: 'Where to call, write or go', es: 'Dónde llamar, escribir o ir' },
  clerkQuestions: { en: 'Questions you could ask the Clerk', es: 'Preguntas que puede hacer al Secretario' },
  clerkQuestionsNote: { en: 'Fill in the brackets yourself when you call or write — not here.', es: 'Complete los corchetes al llamar o escribir, no aquí.' },
  getHelp: { en: 'Get help', es: 'Ayuda' },
  sources: { en: 'Sources & verification', es: 'Fuentes y verificación' },
  sourcesLead: {
    en: '"Checked" means this build opened the official page on that date. Other links come from earlier research and should be confirmed.',
    es: '"Revisado" significa que se abrió la página oficial en esa fecha. Los demás vienen de investigación anterior.',
  },
  ruleTrace: { en: 'Inspect the rule path', es: 'Ver la ruta de reglas' },
  ruleTraceLead: {
    en: 'The plan is chosen by fixed rules, not AI. These are the answer codes and rule IDs that produced it.',
    es: 'El plan lo eligen reglas fijas, no IA. Estos son los códigos y reglas.',
  },
  print: { en: 'Print / Save as PDF', es: 'Imprimir / Guardar PDF' },
  copyChecklist: { en: 'Copy checklist', es: 'Copiar lista' },
  copied: { en: 'Checklist copied.', es: 'Lista copiada.' },
  copyFailed: { en: 'Couldn\'t copy — try Print instead.', es: 'No se pudo copiar; use Imprimir.' },
  changeAnswers: { en: 'Change answers', es: 'Cambiar respuestas' },
  officialSite: { en: 'Official site', es: 'Sitio oficial' },
  opensNewTab: { en: '(opens the official website in a new tab; you will leave Rap Sheet Finder)', es: '(abre el sitio oficial en otra pestaña)' },
  call: { en: 'Call', es: 'Llamar' },
  email: { en: 'Email', es: 'Correo' },
  copyAddress: { en: 'Copy address', es: 'Copiar dirección' },
  addressCopied: { en: 'Address copied.', es: 'Dirección copiada.' },
  map: { en: 'Map', es: 'Mapa' },
  street: { en: 'Street address', es: 'Dirección' },
  mailing: { en: 'Mailing address', es: 'Dirección postal' },
  hours: { en: 'Hours', es: 'Horario' },
  confirmBeforeTravel: { en: 'Call or check the official site before you go.', es: 'Llame o revise el sitio oficial antes de ir.' },
  notPublished: { en: 'Not published', es: 'No publicado' },
  verified: { en: 'Checked', es: 'Revisado' },
  partial: { en: 'Confirm before relying on it', es: 'Confirme antes de usarlo' },
  needs_review: { en: 'Needs verification', es: 'Requiere verificación' },
  spanishStepsNote: {
    en: '',
    es: 'Los pasos detallados están en inglés por ahora; la traducción al español está pendiente de revisión.',
  },
  glossary: { en: 'Words to know', es: 'Palabras útiles' },
  close: { en: 'Close', es: 'Cerrar' },
  practicalTip: { en: 'Practical tip (not from a court source)', es: 'Consejo práctico (no de una fuente oficial)' },
  factsUsed: { en: 'Facts used in this plan', es: 'Datos usados en este plan' },
  sourceConflict: { en: 'Source conflict', es: 'Conflicto entre fuentes' },
  textSize: { en: 'Larger text', es: 'Texto más grande' },
  contrast: { en: 'High contrast', es: 'Alto contraste' },
  language: { en: 'Language', es: 'Idioma' },
  aiTitle: { en: 'Plain-language helper', es: 'Ayuda en lenguaje sencillo' },
  aiOff: {
    en: 'AI assistance can be enabled later. Right now every explanation is hand-written and checked against official sources — no AI is used.',
    es: 'La asistencia con IA podrá activarse más adelante. Ahora todas las explicaciones están escritas a mano.',
  },
  footer: {
    en: 'Independent research prototype. Not affiliated with, sponsored or endorsed by any court, county agency, university or legal aid provider.',
    es: 'Prototipo de investigación independiente. Sin afiliación con tribunales, agencias, universidades ni proveedores de ayuda legal.',
  },
  error: { en: 'Something went wrong on this screen.', es: 'Algo salió mal en esta pantalla.' },
  errorBody: {
    en: 'Your answers were not sent anywhere. You can start over, or contact the Santa Clara court Clerk at 408-808-6611.',
    es: 'Sus respuestas no se enviaron. Puede empezar de nuevo o llamar al Secretario al 408-808-6611.',
  },
  printedOn: { en: 'Printed plan — general information, not legal advice.', es: 'Plan impreso — información general, no asesoría legal.' },
  forCase: { en: 'For', es: 'Para' },
};

export function ui(key: keyof typeof UI | string, locale: Locale, vars?: Record<string, string | number>): string {
  let s = tr(UI[key], locale);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export const STATUS_LABEL: Record<RouteStatus, LText> = {
  route_identified: { en: 'Record-finding route identified', es: 'Ruta para encontrar registros' },
  avenue_to_explore: { en: 'Possible avenue to explore', es: 'Posible opción para explorar' },
  more_info_needed: { en: 'More information needed', es: 'Se necesita más información' },
  legal_review_recommended: { en: 'Legal review strongly recommended', es: 'Se recomienda revisión legal' },
  outside_jurisdiction: { en: 'Outside this tool\'s area', es: 'Fuera del área de esta herramienta' },
};

export const METHOD_LABEL: Record<StepMethod, LText> = {
  online: { en: 'Online', es: 'En línea' },
  mail: { en: 'By mail', es: 'Por correo' },
  phone: { en: 'Phone / email', es: 'Teléfono / correo' },
  in_person: { en: 'In person', es: 'En persona' },
  information: { en: 'Good to know', es: 'Información' },
};

export const VERIFICATION_LABEL: Record<VerificationStatus, LText> = {
  verified: UI.verified,
  partial: UI.partial,
  needs_review: UI.needs_review,
};

export const ALERT_TEXT: Record<AlertId, { title: LText; body: LText; tone: 'urgent' | 'caution' | 'info' }> = {
  immigration: {
    tone: 'urgent',
    title: { en: 'Immigration: get specialized advice before filing anything', es: 'Inmigración: busque asesoría especializada antes de presentar algo' },
    body: {
      en: 'Record-clearing steps can affect immigration matters. Talk to an immigration-qualified lawyer first. Getting copies of your own records is still fine.',
      es: 'Limpiar un récord puede afectar asuntos migratorios. Hable primero con un abogado de inmigración. Obtener copias de sus registros sigue siendo posible.',
    },
  },
  warrant: {
    tone: 'urgent',
    title: { en: 'A possible warrant: talk to a lawyer', es: 'Posible orden de arresto: hable con un abogado' },
    body: {
      en: 'Don\'t ignore it. A defense lawyer or the Public Defender can explain how to resolve it properly with the court.',
      es: 'No la ignore. Un abogado o la Defensoría Pública puede explicar cómo resolverla.',
    },
  },
  active_matter: {
    tone: 'caution',
    title: { en: 'Something may still be open', es: 'Algo puede seguir abierto' },
    body: {
      en: 'You can still get your records. Before filing anything to clear a record, get legal advice.',
      es: 'Aún puede obtener sus registros. Antes de presentar algo, busque asesoría legal.',
    },
  },
  juvenile_mixed: {
    tone: 'info',
    title: { en: 'Juvenile and adult cases are handled separately', es: 'Los casos juveniles y de adultos se manejan aparte' },
    body: { en: 'Your juvenile case has its own card below.', es: 'Su caso juvenil tiene su propia tarjeta.' },
  },
  third_party: {
    tone: 'info',
    title: { en: 'Own records only', es: 'Solo récords propios' },
    body: { en: 'This tool doesn\'t help look up other people.', es: 'Esta herramienta no ayuda a buscar a otras personas.' },
  },
  sc_filing_unclear: {
    tone: 'info',
    title: { en: 'Where was the case filed?', es: '¿Dónde se presentó el caso?' },
    body: {
      en: 'Something that happened in Santa Clara County is usually — but not always — filed there. If the Santa Clara search finds nothing, the case may be in another county.',
      es: 'Lo que pasa en Santa Clara suele presentarse allí, pero no siempre.',
    },
  },
};

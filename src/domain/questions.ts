import type { Condition, QuestionNode } from './types';

/**
 * Typed question registry.
 *
 * ORDER MATTERS: questions are asked in this order, skipping any whose `askIf`
 * is false. A condition may only reference questions that appear EARLIER in the
 * list — this makes the graph acyclic by construction (validated in validate.ts).
 *
 * Contiguous `scope: 'case'` questions form the per-case block, repeated for
 * each Santa Clara case (1, 2) or once for a group ("all").
 *
 * Coverage of master-prompt Q01–Q40 is documented per question in `bankRefs`
 * and summarized in docs/implementation_notes.md.
 */

// ---------------------------------------------------------------- shared conditions
export const IS_SC: Condition = { q: 'jurisdiction', in: ['santa_clara', 'sc_incident_only'] };
export const NOT_THIRD_PARTY: Condition = { not: { q: 'whose_record', in: ['someone_else'] } };
export const GOAL_CLEARANCE: Condition = { q: 'goal', in: ['clearance_info', 'existing_relief'] };
export const CONVICTED: Condition = { q: 'matter_status', in: ['convicted'] };
const NUMBER_NOT_KNOWN: Condition = { q: 'sc_case_number', in: ['paperwork', 'no', 'unknown'], scope: 'case' };

const unsure = { en: 'I\'m not sure', es: 'No estoy seguro/a' };

export const QUESTIONS: QuestionNode[] = [
  // ================================================================ START
  {
    id: 'whose_record',
    bankRefs: ['Q02'],
    section: 'start',
    scope: 'global',
    type: 'single',
    prompt: { en: 'Whose record are you looking into?', es: '¿De quién es el récord que busca?' },
    help: {
      en: 'This tool is for your own record, or for helping someone who asked for your help.',
      es: 'Esta herramienta es para su propio récord o para ayudar a alguien que se lo pidió.',
    },
    whyWeAsk: {
      en: 'Official record offices only release some records to the person themselves. We do not help look up other people without their permission.',
      es: 'Las oficinas oficiales solo entregan algunos registros a la propia persona. No ayudamos a buscar a otras personas sin su permiso.',
    },
    options: [
      { code: 'own', label: { en: 'My own record', es: 'Mi propio récord' } },
      { code: 'helping', label: { en: 'I\'m helping someone, with their permission', es: 'Ayudo a alguien, con su permiso' } },
      {
        code: 'someone_else',
        label: { en: 'Someone else\'s record (for example, screening a tenant or employee)', es: 'El récord de otra persona (por ejemplo, un inquilino o empleado)' },
      },
      { code: 'unsure', label: { en: 'Not sure / something else', es: 'No estoy seguro/a / otra cosa' }, kind: 'unknown' },
    ],
    unknownCode: 'unsure',
  },
  {
    id: 'goal',
    bankRefs: ['Q01'],
    section: 'start',
    scope: 'global',
    type: 'single',
    askIf: NOT_THIRD_PARTY,
    prompt: { en: 'What are you trying to do today?', es: '¿Qué quiere hacer hoy?' },
    help: { en: 'Pick the one that matters most right now. You can come back later for the rest.', es: 'Elija lo más importante ahora. Puede volver después.' },
    whyWeAsk: {
      en: 'Finding a case number, getting copies, and learning about clearing a record are different paths. Knowing your goal lets us skip questions you don\'t need.',
      es: 'Encontrar un número de caso, obtener copias y aprender a limpiar un récord son caminos distintos. Así evitamos preguntas innecesarias.',
    },
    options: [
      { code: 'find_case', label: { en: 'Find my case number', es: 'Encontrar mi número de caso' }, hint: { en: 'The ID the court gave your case', es: 'El número que el tribunal dio a su caso' } },
      { code: 'copies', label: { en: 'Get copies of court documents', es: 'Obtener copias de documentos del tribunal' }, hint: { en: 'Like the complaint, docket or minute orders', es: 'Como la denuncia, el registro o las minutas' } },
      { code: 'clearance_info', label: { en: 'Learn about ways to clear or seal a record', es: 'Aprender cómo limpiar o sellar un récord' }, hint: { en: 'Information only — not a decision about your case', es: 'Solo información, no una decisión sobre su caso' } },
      { code: 'existing_relief', label: { en: 'Check whether relief may already have happened', es: 'Ver si ya hubo algún alivio' }, hint: { en: 'For example, automatic relief or an old court order', es: 'Por ejemplo, alivio automático o una orden anterior' } },
      { code: 'unknown', label: { en: 'I\'m not sure — help me figure it out', es: 'No estoy seguro/a — ayúdeme a decidir' }, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['case_number', 'expungement', 'sealing', 'automatic_relief'],
  },
  // ================================================================ SCOPE
  {
    id: 'jurisdiction',
    bankRefs: ['Q03', 'Q06'],
    section: 'scope',
    scope: 'global',
    type: 'multi',
    askIf: { all: [NOT_THIRD_PARTY, { q: 'goal', answered: true }] },
    prompt: { en: 'Where was the case or arrest handled?', es: '¿Dónde se manejó el caso o el arresto?' },
    help: {
      en: 'Pick all that apply. If you know where the court case was filed, use that — it can differ from where something happened.',
      es: 'Elija todas las que apliquen. Si sabe dónde se presentó el caso, use eso.',
    },
    whyWeAsk: {
      en: 'Records are kept by the court that handled the case. This demo has detailed steps for Santa Clara County only; for other places we point you to the right official office.',
      es: 'Los registros los guarda el tribunal que manejó el caso. Esta demostración tiene pasos detallados solo para Santa Clara.',
    },
    options: [
      { code: 'santa_clara', label: { en: 'Santa Clara County court', es: 'Tribunal del Condado de Santa Clara' } },
      {
        code: 'sc_incident_only',
        label: { en: 'It happened in Santa Clara County, but I\'m not sure where the case was filed', es: 'Pasó en Santa Clara, pero no sé dónde se presentó el caso' },
      },
      { code: 'other_ca', label: { en: 'Another California county', es: 'Otro condado de California' } },
      { code: 'multi_ca', label: { en: 'Several California counties, or I don\'t know them all', es: 'Varios condados de California, o no los conozco todos' } },
      { code: 'other_state', label: { en: 'Another state', es: 'Otro estado' } },
      { code: 'federal', label: { en: 'Federal court', es: 'Tribunal federal' } },
      { code: 'juvenile', label: { en: 'Juvenile court (I was under 18)', es: 'Tribunal juvenil (era menor de 18)' } },
      { code: 'unknown', label: { en: 'I don\'t know', es: 'No lo sé' }, kind: 'unknown', exclusive: true },
    ],
    unknownCode: 'unknown',
    glossary: ['juvenile', 'federal_case'],
  },
  {
    id: 'case_count',
    bankRefs: ['Q05'],
    section: 'scope',
    scope: 'global',
    type: 'single',
    askIf: IS_SC,
    prompt: { en: 'How many Santa Clara County cases are you working on?', es: '¿Cuántos casos del Condado de Santa Clara tiene?' },
    whyWeAsk: {
      en: 'Each case has its own case number and its own records request. We\'ll keep them separate so nothing gets mixed up.',
      es: 'Cada caso tiene su propio número y su propia solicitud. Los mantenemos separados.',
    },
    options: [
      { code: 'one', label: { en: 'One case', es: 'Un caso' } },
      { code: 'two', label: { en: 'Two cases', es: 'Dos casos' } },
      { code: 'three_plus', label: { en: 'Three or more', es: 'Tres o más' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  {
    id: 'matter_status',
    bankRefs: ['Q18'],
    section: 'scope',
    scope: 'global',
    type: 'multi',
    askIf: {
      all: [
        { q: 'goal', in: ['clearance_info', 'existing_relief', 'unknown'] },
        { q: 'jurisdiction', in: ['santa_clara', 'sc_incident_only', 'unknown'] },
      ],
    },
    prompt: { en: 'How did the case end, as far as you know?', es: '¿Cómo terminó el caso, hasta donde sabe?' },
    help: {
      en: 'Pick all that apply if you have more than one case. We don\'t need details about what happened.',
      es: 'Elija todas las que apliquen. No necesitamos detalles de lo que pasó.',
    },
    whyWeAsk: {
      en: 'Arrests without a conviction and convictions use different official processes. "Convicted" means a judge entered a guilty finding or you pleaded guilty or no contest. An arrest alone is not a conviction.',
      es: 'Los arrestos sin condena y las condenas usan procesos distintos. "Condenado" significa que hubo un fallo o declaración de culpabilidad o "no contest". Un arresto no es una condena.',
    },
    options: [
      { code: 'arrest_only', label: { en: 'Arrested or cited, but never charged', es: 'Arrestado o citado, pero sin cargos' } },
      { code: 'dismissed', label: { en: 'Charges were dismissed or dropped', es: 'Los cargos fueron desestimados o retirados' } },
      { code: 'acquitted', label: { en: 'Found not guilty', es: 'Declarado no culpable' } },
      { code: 'convicted', label: { en: 'Convicted (including a guilty or no contest plea)', es: 'Condenado (incluye declararse culpable o "no contest")' } },
      { code: 'pending', label: { en: 'The case is still open', es: 'El caso sigue abierto' } },
      { code: 'unknown', label: { en: 'I don\'t know / not sure there was a court case', es: 'No lo sé / no sé si hubo caso en el tribunal' }, kind: 'unknown', exclusive: true },
    ],
    unknownCode: 'unknown',
    glossary: ['conviction', 'acquittal', 'arrest'],
  },
  {
    id: 'immigration',
    bankRefs: ['Q29'],
    section: 'scope',
    scope: 'global',
    type: 'single',
    askIf: { all: [GOAL_CLEARANCE, { q: 'jurisdiction', answered: true }] },
    prompt: {
      en: 'Could immigration status be affected — yours or the person you\'re helping?',
      es: '¿Podría afectarse un estatus migratorio, el suyo o el de la persona que ayuda?',
    },
    help: { en: 'You can choose "prefer not to say."', es: 'Puede elegir "prefiero no decir".' },
    whyWeAsk: {
      en: 'Record-clearing steps can interact with immigration law in ways that need a specialist. If this applies, we\'ll show immigration-qualified help first. We don\'t record anything about your status.',
      es: 'Limpiar un récord puede afectar asuntos migratorios. Si aplica, mostraremos primero ayuda especializada. No guardamos nada sobre su estatus.',
    },
    options: [
      { code: 'yes', label: { en: 'Yes', es: 'Sí' } },
      { code: 'unsure', label: unsure, kind: 'unknown' },
      { code: 'no', label: { en: 'No (U.S. citizen)', es: 'No (ciudadano/a de EE. UU.)' } },
      { code: 'prefer_not', label: { en: 'Prefer not to say', es: 'Prefiero no decir' }, kind: 'prefer_not' },
    ],
    unknownCode: 'unsure',
  },
  // ================================================================ RECORDS (per case)
  {
    id: 'sc_case_number',
    bankRefs: ['Q08', 'Q10'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: IS_SC,
    prompt: { en: 'Do you know the court case number?', es: '¿Sabe el número de caso del tribunal?' },
    help: {
      en: 'Don\'t type it here — just tell us if you have it. It\'s often on court notices or other court paperwork.',
      es: 'No lo escriba aquí, solo díganos si lo tiene. Suele estar en avisos u otros papeles del tribunal.',
    },
    whyWeAsk: {
      en: 'With a case number you can usually skip searching and go straight to requesting records. Without one, the first step is finding it.',
      es: 'Con el número de caso puede ir directo a pedir documentos. Sin él, el primer paso es encontrarlo.',
    },
    options: [
      { code: 'yes', label: { en: 'Yes, I have it', es: 'Sí, lo tengo' } },
      { code: 'paperwork', label: { en: 'I have old court paperwork that might show it', es: 'Tengo papeles del tribunal que podrían mostrarlo' } },
      { code: 'no', label: { en: 'No', es: 'No' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['case_number'],
  },
  {
    id: 'sc_still_missing',
    bankRefs: ['Q13'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: { all: [{ q: 'goal', in: ['find_case'] }, { q: 'sc_case_number', in: ['yes'], scope: 'case' }] },
    prompt: { en: 'You already have the number. What\'s still missing?', es: 'Ya tiene el número. ¿Qué le falta?' },
    whyWeAsk: {
      en: 'If you already have the number, you don\'t need to search for it. We\'ll point you to the next useful step instead.',
      es: 'Si ya tiene el número, no necesita buscarlo. Le indicaremos el siguiente paso útil.',
    },
    options: [
      { code: 'confirm_only', label: { en: 'Nothing — I just want to confirm it', es: 'Nada, solo quiero confirmarlo' } },
      { code: 'status', label: { en: 'Basic case information or status', es: 'Información o estado del caso' } },
      { code: 'copies', label: { en: 'Copies of documents', es: 'Copias de documentos' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  {
    id: 'sc_filing_era',
    bankRefs: ['Q09'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: { all: [IS_SC, NUMBER_NOT_KNOWN] },
    prompt: { en: 'About when was the case filed?', es: '¿Aproximadamente cuándo se presentó el caso?' },
    help: { en: 'A rough guess is fine.', es: 'Un cálculo aproximado está bien.' },
    whyWeAsk: {
      en: 'The court\'s online index only covers cases filed in 2004 or later, and it\'s updated every few months. Older cases need the Clerk\'s help.',
      es: 'El índice en línea solo cubre casos desde 2004 y se actualiza cada pocos meses. Los casos anteriores requieren ayuda del Secretario.',
    },
    options: [
      { code: 'from_2004', label: { en: '2004 or later', es: '2004 o después' } },
      { code: 'recent', label: { en: 'Very recently (the last few months)', es: 'Muy recientemente (últimos meses)' } },
      { code: 'pre_2004', label: { en: 'Before 2004', es: 'Antes de 2004' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  {
    id: 'sc_index_tried',
    bankRefs: ['Q11', 'Q37', 'Q39'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: { all: [IS_SC, NUMBER_NOT_KNOWN, { q: 'sc_filing_era', in: ['from_2004', 'recent', 'unknown'], scope: 'case' }] },
    prompt: { en: 'Have you already tried the court\'s online case search?', es: '¿Ya probó la búsqueda de casos en línea del tribunal?' },
    whyWeAsk: {
      en: 'If you already tried, we can skip ahead to what to do next — including what a "no match" does and doesn\'t mean.',
      es: 'Si ya lo intentó, pasamos al siguiente paso, incluido qué significa "sin resultados".',
    },
    options: [
      { code: 'not_tried', label: { en: 'Not yet', es: 'Todavía no' } },
      { code: 'found', label: { en: 'Yes — I found a case that may be mine', es: 'Sí, encontré un caso que puede ser mío' } },
      { code: 'no_match', label: { en: 'Yes — but nothing came up', es: 'Sí, pero no apareció nada' } },
      { code: 'access_problem', label: { en: 'I couldn\'t use it (sign-in, errors, no internet)', es: 'No pude usarlo (inicio de sesión, errores, sin internet)' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['index'],
  },
  {
    id: 'sc_namesake',
    bankRefs: ['Q12'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: { q: 'sc_index_tried', in: ['found'], scope: 'case' },
    prompt: { en: 'Are you confident that case is yours?', es: '¿Está seguro/a de que ese caso es suyo?' },
    whyWeAsk: {
      en: 'Many people share names. The index can\'t prove a case belongs to you — only the court can confirm that.',
      es: 'Muchas personas comparten nombre. El índice no prueba que un caso sea suyo; solo el tribunal puede confirmarlo.',
    },
    options: [
      { code: 'sure', label: { en: 'Yes, the details match', es: 'Sí, los datos coinciden' } },
      { code: 'several_similar', label: { en: 'There were several similar names', es: 'Había varios nombres parecidos' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  {
    id: 'sc_courthouse',
    bankRefs: ['Q04'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: {
      all: [
        IS_SC,
        {
          any: [
            { q: 'goal', in: ['copies', 'clearance_info', 'existing_relief'] },
            { q: 'sc_still_missing', in: ['copies'], scope: 'case' },
          ],
        },
      ],
    },
    prompt: { en: 'Do you know which courthouse handled the case?', es: '¿Sabe qué tribunal manejó el caso?' },
    whyWeAsk: {
      en: 'Copies come from the courthouse where the case was filed — not necessarily the closest one, and not the police station.',
      es: 'Las copias vienen del tribunal donde se presentó el caso, no necesariamente el más cercano ni la estación de policía.',
    },
    options: [
      { code: 'hoj', label: { en: 'Hall of Justice (San Jose)', es: 'Hall of Justice (San José)' } },
      { code: 'palo_alto', label: { en: 'Palo Alto Courthouse', es: 'Tribunal de Palo Alto' } },
      { code: 'south_county', label: { en: 'South County Courthouse (Morgan Hill)', es: 'Tribunal de South County (Morgan Hill)' } },
      { code: 'unknown', label: { en: 'I don\'t know', es: 'No lo sé' }, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  {
    id: 'sc_area',
    bankRefs: ['Q07'],
    section: 'records',
    scope: 'case',
    type: 'single',
    askIf: { q: 'sc_courthouse', in: ['unknown'], scope: 'case' },
    prompt: { en: 'Roughly where in the county did it happen?', es: '¿En qué parte del condado pasó, más o menos?' },
    help: { en: 'Only used to suggest a likely courthouse. You\'ll still confirm with the Clerk.', es: 'Solo para sugerir un tribunal probable. Lo confirmará con el Secretario.' },
    whyWeAsk: {
      en: 'The court assigns cities to courthouses. This gives a starting point — it isn\'t proof of where your case was filed.',
      es: 'El tribunal asigna ciudades a cada sede. Es un punto de partida, no una prueba.',
    },
    options: [
      { code: 'central', label: { en: 'San Jose, Milpitas, Santa Clara, Los Gatos, Saratoga or Monte Sereno', es: 'San José, Milpitas, Santa Clara, Los Gatos, Saratoga o Monte Sereno' } },
      { code: 'north', label: { en: 'Palo Alto, Mountain View, Sunnyvale or Cupertino', es: 'Palo Alto, Mountain View, Sunnyvale o Cupertino' } },
      { code: 'south', label: { en: 'Morgan Hill, Gilroy or San Martin', es: 'Morgan Hill, Gilroy o San Martin' } },
      { code: 'unknown', label: { en: 'Somewhere else / not sure', es: 'Otro lugar / no estoy seguro/a' }, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  // ================================================================ RECORDS (global, after case block)
  {
    id: 'copy_type',
    bankRefs: ['Q13', 'Q15', 'Q38'],
    section: 'records',
    scope: 'global',
    type: 'single',
    askIf: { all: [IS_SC, { any: [{ q: 'goal', in: ['copies'] }, { q: 'sc_still_missing', in: ['copies'] }] }] },
    prompt: { en: 'What kind of copies do you need?', es: '¿Qué tipo de copias necesita?' },
    help: { en: 'If someone asked you for documents, check whether they said "certified."', es: 'Si alguien le pidió documentos, revise si dijo "certificadas".' },
    whyWeAsk: {
      en: 'Plain copies are cheaper. Certified copies carry an official court stamp and cost more — only get them if the person or agency asking for them requires it.',
      es: 'Las copias simples son más baratas. Las certificadas llevan sello oficial y cuestan más; pídalas solo si se las exigen.',
    },
    options: [
      { code: 'plain', label: { en: 'Plain copies are fine', es: 'Copias simples' } },
      { code: 'certified', label: { en: 'Certified copies (someone requires them)', es: 'Copias certificadas (me las exigen)' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['certified_copy', 'docket', 'minute_order', 'complaint'],
  },
  {
    id: 'completeness',
    bankRefs: ['Q17'],
    section: 'records',
    scope: 'global',
    type: 'single',
    askIf: {
      all: [IS_SC, { any: [{ q: 'case_count', in: ['three_plus', 'unknown'] }, { q: 'jurisdiction', in: ['sc_incident_only'] }] }],
    },
    prompt: {
      en: 'Do you also want to check for California cases you might not know about?',
      es: '¿También quiere revisar si hay casos en California que no conozca?',
    },
    whyWeAsk: {
      en: 'Searching county by county works when you know your cases. If you\'re unsure you know them all, a statewide record review is one option — it uses fingerprints and has a fee.',
      es: 'Buscar condado por condado funciona si conoce sus casos. Si no está seguro/a, una revisión estatal es una opción; usa huellas y tiene costo.',
    },
    options: [
      { code: 'yes', label: { en: 'Yes', es: 'Sí' } },
      { code: 'no', label: { en: 'No, I know my cases', es: 'No, conozco mis casos' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['rap_sheet', 'live_scan'],
  },
  // ================================================================ CLEARANCE CONTEXT (only for clearance goals)
  {
    id: 'conviction_class',
    bankRefs: ['Q20'],
    section: 'clearance',
    scope: 'global',
    type: 'multi',
    askIf: { all: [IS_SC, GOAL_CLEARANCE, CONVICTED] },
    prompt: { en: 'Was the conviction a misdemeanor, felony or infraction?', es: '¿La condena fue por delito menor, grave o infracción?' },
    help: { en: 'Pick all that apply. "Not sure" is a fine answer.', es: 'Elija todas las que apliquen. "No estoy seguro/a" está bien.' },
    whyWeAsk: {
      en: 'Different official information pages apply, and some felony situations have special rules that need a lawyer. We don\'t use this to decide anything about you.',
      es: 'Aplican páginas oficiales distintas, y algunos delitos graves tienen reglas especiales. No decidimos nada con esto.',
    },
    options: [
      { code: 'misdemeanor', label: { en: 'Misdemeanor', es: 'Delito menor (misdemeanor)' } },
      { code: 'felony', label: { en: 'Felony', es: 'Delito grave (felony)' } },
      { code: 'infraction', label: { en: 'Infraction', es: 'Infracción' } },
      { code: 'unknown', label: unsure, kind: 'unknown', exclusive: true },
    ],
    unknownCode: 'unknown',
    glossary: ['misdemeanor', 'felony', 'infraction'],
  },
  {
    id: 'state_prison',
    bankRefs: ['Q27'],
    section: 'clearance',
    scope: 'global',
    type: 'single',
    askIf: { all: [IS_SC, GOAL_CLEARANCE, CONVICTED, { q: 'conviction_class', in: ['felony', 'unknown'] }] },
    prompt: { en: 'Did the sentence include time in state prison?', es: '¿La sentencia incluyó tiempo en prisión estatal?' },
    whyWeAsk: {
      en: 'Cases with a state prison sentence can follow different, specialized rules. If so, we\'ll point you to legal help instead of general information.',
      es: 'Los casos con prisión estatal pueden seguir reglas especiales. Si aplica, le indicaremos ayuda legal.',
    },
    options: [
      { code: 'yes', label: { en: 'Yes', es: 'Sí' } },
      { code: 'no', label: { en: 'No (for example county jail or probation only)', es: 'No (por ejemplo, cárcel del condado o solo libertad condicional)' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
  {
    id: 'supervision',
    bankRefs: ['Q21'],
    section: 'clearance',
    scope: 'global',
    type: 'single',
    askIf: { all: [IS_SC, GOAL_CLEARANCE, CONVICTED] },
    prompt: { en: 'Is probation, parole or a diversion program still going on?', es: '¿Sigue en libertad condicional, libertad bajo palabra o un programa de diversión?' },
    whyWeAsk: {
      en: 'You can always get your records. But record-clearing options often depend on whether supervision is finished, and there may be a way to ask about ending it early.',
      es: 'Siempre puede obtener sus registros. Pero las opciones de limpieza suelen depender de si terminó la supervisión.',
    },
    options: [
      { code: 'yes', label: { en: 'Yes, still going', es: 'Sí, sigue' } },
      { code: 'no', label: { en: 'No, it\'s finished', es: 'No, ya terminó' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['probation', 'parole', 'diversion'],
  },
  {
    id: 'open_matters',
    bankRefs: ['Q22', 'Q23'],
    section: 'clearance',
    scope: 'global',
    type: 'multi',
    optional: true,
    askIf: { all: [IS_SC, GOAL_CLEARANCE, { q: 'matter_status', answered: true }, { not: { q: 'matter_status', only: ['pending'] } }] },
    prompt: { en: 'Is either of these true right now, anywhere?', es: '¿Alguna de estas cosas aplica ahora, en cualquier lugar?' },
    help: { en: 'Optional. You can skip this.', es: 'Opcional. Puede omitirla.' },
    whyWeAsk: {
      en: 'An open case or warrant anywhere usually needs a lawyer\'s advice before you file anything. We\'ll show safe next steps — never advice to avoid a court.',
      es: 'Un caso abierto o una orden de arresto suele requerir consejo legal antes de presentar algo.',
    },
    options: [
      { code: 'pending_case', label: { en: 'A criminal case is still open (any state or court)', es: 'Hay un caso penal abierto (en cualquier lugar)' } },
      { code: 'warrant', label: { en: 'There may be an unresolved warrant', es: 'Puede haber una orden de arresto pendiente' } },
      { code: 'none', label: { en: 'Neither', es: 'Ninguna' }, exclusive: true, kind: 'none' },
      { code: 'unknown', label: unsure, kind: 'unknown', exclusive: true },
      { code: 'prefer_not', label: { en: 'Prefer not to say', es: 'Prefiero no decir' }, kind: 'prefer_not', exclusive: true },
    ],
    unknownCode: 'unknown',
    glossary: ['warrant'],
  },
  {
    id: 'obligations',
    bankRefs: ['Q24', 'Q25'],
    section: 'clearance',
    scope: 'global',
    type: 'single',
    optional: true,
    askIf: { all: [IS_SC, GOAL_CLEARANCE, CONVICTED, { q: 'supervision', in: ['no', 'unknown'] }] },
    prompt: {
      en: 'Have the court\'s requirements been completed (classes, community service, fines or restitution)?',
      es: '¿Se cumplieron los requisitos del tribunal (clases, servicio comunitario, multas o restitución)?',
    },
    help: { en: 'Optional. Unpaid amounts don\'t automatically rule out every option.', es: 'Opcional. Montos pendientes no descartan automáticamente todas las opciones.' },
    whyWeAsk: {
      en: 'This helps us show the right questions to bring to a lawyer or the court. It is not a yes/no test.',
      es: 'Nos ayuda a mostrar qué preguntar a un abogado o al tribunal. No es una prueba de sí o no.',
    },
    options: [
      { code: 'all_done', label: { en: 'All done', es: 'Todo cumplido' } },
      { code: 'some_open', label: { en: 'Some things are still open', es: 'Algunas cosas siguen pendientes' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['restitution'],
  },
  {
    id: 'relief_status',
    bankRefs: ['Q26'],
    section: 'clearance',
    scope: 'global',
    type: 'single',
    askIf: { all: [IS_SC, GOAL_CLEARANCE] },
    prompt: {
      en: 'As far as you know, has a court or the California DOJ already given relief on this record?',
      es: 'Hasta donde sabe, ¿un tribunal o el DOJ de California ya dio algún alivio sobre este récord?',
    },
    whyWeAsk: {
      en: 'Some records get automatic relief without anyone filing. If that may have happened, the next step is confirming it — not starting over.',
      es: 'Algunos registros reciben alivio automático. Si pudo pasar, el siguiente paso es confirmarlo.',
    },
    options: [
      { code: 'court_order', label: { en: 'Yes — a court dismissed or sealed it', es: 'Sí, un tribunal lo desestimó o selló' } },
      { code: 'auto_relief', label: { en: 'Yes — my DOJ record shows "relief granted"', es: 'Sí, mi récord del DOJ dice "relief granted"' } },
      { code: 'none_known', label: { en: 'Not that I know of', es: 'No que yo sepa' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
    glossary: ['automatic_relief', 'expungement', 'sealing'],
  },
  {
    id: 'existing_reports',
    bankRefs: ['Q16'],
    section: 'clearance',
    scope: 'global',
    type: 'multi',
    optional: true,
    askIf: { any: [{ all: [IS_SC, GOAL_CLEARANCE] }, { q: 'jurisdiction', in: ['multi_ca', 'unknown'] }] },
    prompt: { en: 'Do you already have any of these?', es: '¿Ya tiene alguno de estos?' },
    help: { en: 'Optional. Pick all that apply.', es: 'Opcional. Elija todas las que apliquen.' },
    whyWeAsk: {
      en: 'If you already have a record report, you may not need to order another — though older reports can be out of date.',
      es: 'Si ya tiene un informe, quizá no necesite otro, aunque los informes viejos pueden estar desactualizados.',
    },
    options: [
      { code: 'doj_report', label: { en: 'A California DOJ record (RAP sheet)', es: 'Un récord del DOJ de California (RAP sheet)' } },
      { code: 'fbi_summary', label: { en: 'An FBI Identity History Summary', es: 'Un resumen del FBI' } },
      { code: 'court_order', label: { en: 'A court order about my record', es: 'Una orden del tribunal sobre mi récord' } },
      { code: 'none', label: { en: 'None of these', es: 'Ninguno' }, exclusive: true, kind: 'none' },
      { code: 'unknown', label: unsure, kind: 'unknown', exclusive: true },
    ],
    unknownCode: 'unknown',
    glossary: ['rap_sheet', 'identity_history_summary'],
  },
  {
    id: 'purpose',
    bankRefs: ['Q28'],
    section: 'clearance',
    scope: 'global',
    type: 'multi',
    optional: true,
    askIf: { all: [IS_SC, GOAL_CLEARANCE] },
    prompt: { en: 'What\'s the main reason you\'re looking into this?', es: '¿Cuál es la razón principal?' },
    help: { en: 'Optional. This only changes which extra resources we show.', es: 'Opcional. Solo cambia los recursos adicionales.' },
    whyWeAsk: {
      en: 'Some goals — like firearm rights or professional licenses — involve separate rules that ordinary record clearing may not resolve.',
      es: 'Algunas metas, como derechos de armas o licencias, tienen reglas aparte.',
    },
    options: [
      { code: 'work_housing', label: { en: 'Work or housing', es: 'Trabajo o vivienda' } },
      { code: 'school_license', label: { en: 'School or a professional license', es: 'Escuela o licencia profesional' } },
      { code: 'firearms', label: { en: 'Firearm rights', es: 'Derechos sobre armas' } },
      { code: 'other', label: { en: 'Something else', es: 'Otra cosa' } },
      { code: 'prefer_not', label: { en: 'Prefer not to say', es: 'Prefiero no decir' }, kind: 'prefer_not', exclusive: true },
    ],
    unknownCode: 'prefer_not',
  },
  {
    id: 'lawyer_advised',
    bankRefs: ['Q30'],
    section: 'clearance',
    scope: 'global',
    type: 'single',
    optional: true,
    askIf: { all: [IS_SC, GOAL_CLEARANCE] },
    prompt: { en: 'Has a lawyer or legal aid group already looked at your situation?', es: '¿Un abogado o grupo de ayuda legal ya revisó su situación?' },
    help: { en: 'Optional.', es: 'Opcional.' },
    whyWeAsk: {
      en: 'If someone is already helping you, your plan will focus on getting them the records they need.',
      es: 'Si alguien ya le ayuda, el plan se enfoca en conseguirle los documentos que necesita.',
    },
    options: [
      { code: 'yes', label: { en: 'Yes', es: 'Sí' } },
      { code: 'no', label: { en: 'No', es: 'No' } },
      { code: 'prefer_not', label: { en: 'Prefer not to say', es: 'Prefiero no decir' }, kind: 'prefer_not' },
    ],
    unknownCode: 'prefer_not',
  },
  // ================================================================ PRACTICAL
  {
    id: 'practical',
    bankRefs: ['Q14', 'Q31', 'Q32', 'Q33', 'Q39'],
    section: 'practical',
    scope: 'global',
    type: 'multi',
    optional: true,
    askIf: IS_SC,
    prompt: { en: 'What would make this easier for you?', es: '¿Qué le facilitaría esto?' },
    help: { en: 'Optional. Pick all that apply — we\'ll put the best-fitting option first.', es: 'Opcional. Elija todas las que apliquen.' },
    whyWeAsk: {
      en: 'Some steps can be done from home, some by mail, some only in person. We\'ll be honest about which is which.',
      es: 'Algunos pasos se hacen desde casa, otros por correo y otros solo en persona. Le diremos cuál es cuál.',
    },
    options: [
      { code: 'from_home', label: { en: 'Start from home (online or phone)', es: 'Empezar desde casa (en línea o teléfono)' } },
      { code: 'mail_ok', label: { en: 'Mail is fine', es: 'Por correo está bien' } },
      { code: 'in_person_ok', label: { en: 'I can go in person', es: 'Puedo ir en persona' } },
      { code: 'no_travel', label: { en: 'Travel, work, childcare or mobility make trips hard', es: 'Viajar es difícil (trabajo, cuidado de niños, movilidad)' } },
      { code: 'no_printer', label: { en: 'No printer', es: 'Sin impresora' } },
      { code: 'tight_budget', label: { en: 'Tight budget', es: 'Presupuesto limitado' } },
      { code: 'limited_internet', label: { en: 'Limited internet or phone', es: 'Internet o teléfono limitado' } },
      { code: 'no_pref', label: { en: 'No preference', es: 'Sin preferencia' }, kind: 'unknown', exclusive: true },
    ],
    unknownCode: 'no_pref',
  },
  {
    id: 'clerk_contacted',
    bankRefs: ['Q36'],
    section: 'practical',
    scope: 'global',
    type: 'single',
    optional: true,
    askIf: {
      any: [
        { q: 'sc_index_tried', in: ['no_match', 'access_problem'] },
        { q: 'sc_filing_era', in: ['pre_2004'] },
      ],
    },
    prompt: { en: 'Have you already contacted the court Clerk about this?', es: '¿Ya contactó al Secretario del tribunal?' },
    help: { en: 'Optional.', es: 'Opcional.' },
    whyWeAsk: {
      en: 'If you\'ve already reached out, we\'ll suggest how to follow up instead of starting over.',
      es: 'Si ya se comunicó, le sugeriremos cómo dar seguimiento.',
    },
    options: [
      { code: 'not_tried', label: { en: 'Not yet', es: 'Todavía no' } },
      { code: 'no_response', label: { en: 'Yes, but no response yet', es: 'Sí, pero sin respuesta' } },
      { code: 'needs_clarification', label: { en: 'Yes, they asked for more information', es: 'Sí, pidieron más información' } },
      { code: 'unknown', label: unsure, kind: 'unknown' },
    ],
    unknownCode: 'unknown',
  },
];

export const QUESTION_BY_ID: Record<string, QuestionNode> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): QuestionNode {
  const q = QUESTION_BY_ID[id];
  if (!q) throw new Error(`Unknown question id: ${id}`);
  return q;
}

/**
 * Bank entries intentionally handled outside the question flow:
 *  Q34 language   -> header language switcher (EN / ES)
 *  Q35 glossary   -> glossary terms are always available on every screen
 *  Q40 printable  -> every plan has Print / Save as PDF and Copy checklist
 */
export const BANK_HANDLED_IN_UI = ['Q34', 'Q35', 'Q40'];

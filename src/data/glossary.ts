import type { LText } from '../domain/types';

/**
 * Curated plain-language glossary. These are the ONLY explanations shown for terms
 * (the future AI helper may rephrase them, but may not add legal claims).
 * Definitions are general descriptions, not legal advice; Spanish pending review.
 */
export interface GlossaryTerm {
  id: string;
  term: LText;
  definition: LText;
  example?: LText;
  sourceIds: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'case_number',
    term: { en: 'Case number', es: 'Número de caso' },
    definition: { en: 'The ID a court gives a case. Each case has its own number.', es: 'El identificador que el tribunal da a un caso.' },
    example: { en: 'You might find it on a court notice or other court paperwork.', es: 'Puede estar en un aviso del tribunal.' },
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'index',
    term: { en: 'Case index', es: 'Índice de casos' },
    definition: {
      en: 'A searchable list of court cases (names, case numbers, filing dates). It helps you find a case number. It is not your full record and usually doesn\'t include documents.',
      es: 'Una lista de casos para encontrar el número. No es su récord completo.',
    },
    sourceIds: ['sc_criminal_records', 'sc_case_info_online'],
  },
  {
    id: 'docket',
    term: { en: 'Docket', es: 'Registro del caso (docket)' },
    definition: { en: 'The court\'s list of what happened in a case and when.', es: 'La lista de lo que pasó en un caso y cuándo.' },
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'minute_order',
    term: { en: 'Minute order', es: 'Minuta (minute order)' },
    definition: { en: 'A short court record of what happened at one hearing on one date.', es: 'Registro breve de lo que pasó en una audiencia.' },
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'complaint',
    term: { en: 'Complaint', es: 'Denuncia (complaint)' },
    definition: { en: 'The document that starts a criminal case by listing the charges.', es: 'El documento que inicia un caso penal con los cargos.' },
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'disposition',
    term: { en: 'Disposition', es: 'Resolución (disposition)' },
    definition: { en: 'How a case or charge ended — for example dismissed, not guilty, or convicted.', es: 'Cómo terminó un caso o cargo.' },
    sourceIds: ['ca_clean_record'],
  },
  {
    id: 'certified_copy',
    term: { en: 'Certified copy', es: 'Copia certificada' },
    definition: { en: 'A copy with an official court stamp saying it\'s a true copy. Costs more. Only needed if someone requires it.', es: 'Copia con sello oficial. Cuesta más; solo si se la exigen.' },
    sourceIds: ['sc_case_info_online'],
  },
  {
    id: 'rap_sheet',
    term: { en: 'RAP sheet (DOJ record)', es: 'RAP sheet (récord del DOJ)' },
    definition: {
      en: 'A summary of your California criminal history kept by the state Department of Justice. You request it with fingerprints. It\'s different from court documents.',
      es: 'Resumen de su historial penal en California, del DOJ. Se pide con huellas.',
    },
    sourceIds: ['doj_record_review'],
  },
  {
    id: 'live_scan',
    term: { en: 'Live Scan', es: 'Live Scan' },
    definition: { en: 'Electronic fingerprinting done at an approved site. Used to request your DOJ record.', es: 'Huellas electrónicas en un sitio autorizado.' },
    sourceIds: ['doj_record_review'],
  },
  {
    id: 'identity_history_summary',
    term: { en: 'FBI Identity History Summary', es: 'Resumen de historial del FBI' },
    definition: { en: 'A national, fingerprint-based summary from the FBI. Separate from California records; may not be complete.', es: 'Resumen nacional del FBI basado en huellas.' },
    sourceIds: ['fbi_ihs_faq'],
  },
  {
    id: 'expungement',
    term: { en: '"Expungement" (dismissal)', es: '"Expungement" (desestimación)' },
    definition: {
      en: 'People often say "expungement." In California it usually means asking a court to dismiss a conviction. It doesn\'t erase the record or every consequence.',
      es: 'En California suele significar pedir que se desestime una condena. No borra el récord.',
    },
    sourceIds: ['ca_clean_record'],
  },
  {
    id: 'sealing',
    term: { en: 'Sealing', es: 'Sellado' },
    definition: { en: 'Limiting who can see a record. Some government agencies can still see sealed records.', es: 'Limitar quién puede ver un registro.' },
    sourceIds: ['ca_arrest_no_conviction'],
  },
  {
    id: 'automatic_relief',
    term: { en: 'Automatic relief', es: 'Alivio automático' },
    definition: {
      en: 'Relief the California DOJ applies to some records without a petition. It is not a dismissal, sealing or expungement.',
      es: 'Alivio que el DOJ aplica sin petición. No es desestimación ni sellado.',
    },
    sourceIds: ['doj_automatic_relief'],
  },
  {
    id: 'conviction',
    term: { en: 'Conviction', es: 'Condena' },
    definition: { en: 'A guilty finding, or a guilty or no contest plea. An arrest alone is not a conviction.', es: 'Un fallo o declaración de culpabilidad. Un arresto no es una condena.' },
    sourceIds: ['ca_clean_record'],
  },
  {
    id: 'arrest',
    term: { en: 'Arrest', es: 'Arresto' },
    definition: { en: 'When police take someone into custody or cite them. It may or may not lead to a court case.', es: 'Cuando la policía detiene o cita a alguien.' },
    sourceIds: ['ca_arrest_no_conviction'],
  },
  {
    id: 'acquittal',
    term: { en: 'Acquittal', es: 'Absolución' },
    definition: { en: 'Being found not guilty.', es: 'Ser declarado no culpable.' },
    sourceIds: ['ca_arrest_no_conviction'],
  },
  {
    id: 'misdemeanor',
    term: { en: 'Misdemeanor', es: 'Delito menor' },
    definition: { en: 'A less serious crime than a felony, usually punishable by up to a year in county jail.', es: 'Un delito menos grave.' },
    sourceIds: ['ca_misdemeanors'],
  },
  {
    id: 'felony',
    term: { en: 'Felony', es: 'Delito grave' },
    definition: { en: 'A more serious crime. Some felony cases have different record-clearing rules.', es: 'Un delito más grave.' },
    sourceIds: ['ca_felony'],
  },
  {
    id: 'infraction',
    term: { en: 'Infraction', es: 'Infracción' },
    definition: { en: 'A minor violation, like many traffic tickets.', es: 'Una falta menor.' },
    sourceIds: ['ca_clean_record'],
  },
  {
    id: 'probation',
    term: { en: 'Probation', es: 'Libertad condicional (probation)' },
    definition: { en: 'Court-ordered supervision in the community instead of, or after, jail.', es: 'Supervisión ordenada por el tribunal.' },
    sourceIds: ['sc_probation_clearance'],
  },
  {
    id: 'parole',
    term: { en: 'Parole', es: 'Libertad bajo palabra (parole)' },
    definition: { en: 'Supervision after release from state prison.', es: 'Supervisión tras salir de prisión estatal.' },
    sourceIds: ['ca_felony'],
  },
  {
    id: 'diversion',
    term: { en: 'Diversion', es: 'Programa de diversión' },
    definition: { en: 'A program that can lead to charges being dismissed after you complete it.', es: 'Programa que puede llevar a desestimar cargos.' },
    sourceIds: ['ca_arrest_no_conviction'],
  },
  {
    id: 'warrant',
    term: { en: 'Warrant', es: 'Orden de arresto' },
    definition: { en: 'A court order, for example to bring someone to court. A lawyer can explain how to resolve one.', es: 'Una orden del tribunal. Un abogado puede explicar cómo resolverla.' },
    sourceIds: ['sc_pd_post_conviction'],
  },
  {
    id: 'restitution',
    term: { en: 'Restitution', es: 'Restitución' },
    definition: { en: 'Money a court orders paid to a victim for losses.', es: 'Dinero que el tribunal ordena pagar a una víctima.' },
    sourceIds: ['ca_clean_record'],
  },
  {
    id: 'juvenile',
    term: { en: 'Juvenile case', es: 'Caso juvenil' },
    definition: { en: 'A case handled in juvenile court because the person was under 18. Kept separately from adult records.', es: 'Caso en el tribunal juvenil por ser menor de 18.' },
    sourceIds: ['sc_juvenile_faqs'],
  },
  {
    id: 'federal_case',
    term: { en: 'Federal case', es: 'Caso federal' },
    definition: { en: 'A case in a U.S. (federal) court under federal law — not a California state court.', es: 'Caso en un tribunal federal de EE. UU.' },
    sourceIds: ['cand_san_jose'],
  },
  {
    id: 'clerk',
    term: { en: 'Clerk\'s Office', es: 'Oficina del Secretario' },
    definition: { en: 'The court office that keeps case files and handles record requests. Clerks can explain procedures but can\'t give legal advice.', es: 'La oficina del tribunal que guarda los expedientes.' },
    sourceIds: ['sc_contacts'],
  },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));

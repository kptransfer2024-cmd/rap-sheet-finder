import type { Fact } from '../domain/types';

/**
 * Procedural claims shown in the UI, each tied to sources and an honest status.
 * Steps reference facts by id; a step's displayed verification badge is the
 * weakest status among its facts and resources.
 *
 *  verified      — this build re-read the claim on the official page on `checkedAt`.
 *  partial       — from earlier research (Nov 7 matrix / Nov 22 handoff) or only
 *                  partly confirmed; shown with "confirm before relying on it".
 *  needs_review  — unknown, conflicting or unpublished. The UI must never state it as fact.
 */
const C = '2026-11-22';

export const FACTS: Fact[] = [
  // ---------------------------------------------------------- Index / portal
  {
    id: 'sc_index_coverage',
    statement: {
      en: 'The court\'s online criminal case index covers cases filed in 2004 or later.',
      es: 'El índice penal en línea del tribunal cubre casos presentados en 2004 o después.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_records', 'sc_criminal_faqs'],
  },
  {
    id: 'sc_index_search_keys',
    statement: {
      en: 'The court describes two ways to search the index: the defendant\'s name plus date of birth, or the name plus the month and year the case was filed.',
      es: 'El tribunal describe dos formas de buscar: nombre y fecha de nacimiento, o nombre y mes y año en que se presentó el caso.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_records', 'sc_criminal_faqs'],
  },
  {
    id: 'sc_index_quarterly',
    statement: {
      en: 'The online criminal index is updated quarterly, so very recent cases may not appear yet.',
      es: 'El índice se actualiza cada trimestre; los casos muy recientes quizá aún no aparezcan.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_faqs'],
  },
  {
    id: 'sc_no_documents_online',
    statement: {
      en: 'Court case documents (filings) are generally NOT available online. The index helps you find a case number; copies come from the Clerk.',
      es: 'Los documentos del caso generalmente NO están en línea. El índice ayuda a encontrar el número; las copias vienen del Secretario.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_case_info_online'],
  },
  {
    id: 'sc_portal_login',
    kind: 'caveat',
    statement: {
      en: 'Whether the portal requires an account to see results is not confirmed. If it asks you to sign in, that is expected — use the Clerk options instead if you prefer.',
      es: 'No está confirmado si el portal pide una cuenta. Si le pide iniciar sesión, puede usar las opciones del Secretario.',
    },
    status: 'needs_review',
    sourceIds: ['sc_portal', 'sc_case_info_online'],
    note: 'Pending workbook (row 13): search page shows fields without a sign-in prompt; result/detail views untested.',
  },
  {
    id: 'sc_index_not_rap_sheet',
    statement: {
      en: 'An index result is not a full criminal history and not a RAP sheet. A "no match" does not prove that no case exists.',
      es: 'Un resultado del índice no es un historial penal completo. "Sin resultados" no prueba que no exista un caso.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_records', 'sc_criminal_faqs'],
    note: 'Reasoned from verified facts: index covers 2004+ only, quarterly updates, some records restricted.',
  },
  // ---------------------------------------------------------- Pre-2004
  {
    id: 'sc_pre2004_clerk',
    statement: {
      en: 'For cases filed before 2004, the court says to ask the Clerk to do a name search — in person, or by letter with the name, date of birth and the years to search.',
      es: 'Para casos anteriores a 2004, el tribunal indica pedir al Secretario una búsqueda por nombre, en persona o por carta.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_faqs', 'sc_criminal_records'],
  },
  {
    id: 'sc_microfiche_conflict',
    kind: 'caveat',
    statement: {
      en: 'Court pages disagree about microfiche: the FAQ says public microfiche is no longer provided. Do not plan on searching microfiche yourself — ask the Clerk.',
      es: 'Las páginas del tribunal no coinciden sobre microfichas. No cuente con buscarlas usted; pregunte al Secretario.',
    },
    status: 'needs_review',
    sourceIds: ['sc_criminal_faqs', 'sc_criminal_records'],
    conflict: 'Criminal Case Records page still says "search the microfiche"; Criminal FAQs say "the Court no longer provides criminal public records on microfiche" (both re-read 2026-11-22).',
  },
  // ---------------------------------------------------------- Courthouse routing
  {
    id: 'sc_courthouse_by_city',
    statement: {
      en: 'Records are kept at the courthouse where the case was filed. The court lists: Hall of Justice — San Jose, Milpitas, Los Gatos, Saratoga, Monte Sereno, Santa Clara; Palo Alto — Cupertino, Mountain View, Palo Alto, Sunnyvale; South County (Morgan Hill) — San Martin, Morgan Hill, Gilroy.',
      es: 'Los expedientes están en el tribunal donde se presentó el caso. HOJ: San José, Milpitas, Los Gatos, Saratoga, Monte Sereno, Santa Clara; Palo Alto: Cupertino, Mountain View, Palo Alto, Sunnyvale; South County: San Martin, Morgan Hill, Gilroy.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'sc_felony_hoj',
    statement: {
      en: 'County Probation guidance says felonies are handled at the Hall of Justice, with Palo Alto and South County handling misdemeanors for their areas. Confirm the filing courthouse with the Clerk.',
      es: 'Según Libertad Condicional, los delitos graves se manejan en el Hall of Justice. Confirme con el Secretario.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
    conflict: 'Court page only says "criminal matters" for each courthouse; Probation page (not reachable by this build) specifies felonies = HOJ.',
  },
  {
    id: 'hoj_records_counter_location',
    kind: 'caveat',
    statement: {
      en: 'The floor, room or window of the criminal records counter is NOT published online. Call the Clerk before you go.',
      es: 'El piso, sala o ventanilla del mostrador de expedientes NO está publicado. Llame antes de ir.',
    },
    status: 'needs_review',
    sourceIds: ['sc_hoj'],
    note: 'HOJ has East and West buildings. Never invent a floor/room/window.',
  },
  {
    id: 'sc_clerk_hours',
    statement: {
      en: 'Clerk\'s Office & phone hours: Mon–Thu 8:30 a.m.–3:00 p.m.; Fri 8:30 a.m.–12:00 p.m. (noon). Buildings open Mon–Fri 8:00 a.m.–5:00 p.m. Closed on court holidays.',
      es: 'Horario del Secretario y teléfonos: lun–jue 8:30–15:00; vie 8:30–12:00. Edificios: lun–vie 8:00–17:00. Cerrado en días festivos del tribunal.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_contacts', 'sc_hoj'],
  },
  // ---------------------------------------------------------- Copies, fees, mail
  {
    id: 'sc_copy_fee',
    statement: { en: 'Copies from the Clerk: $0.50 per page. Fees can change.', es: 'Copias del Secretario: $0.50 por página. Las cuotas pueden cambiar.' },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_case_info_online'],
  },
  {
    id: 'sc_certified_fee',
    statement: {
      en: 'Certified copies cost more: research found $40 per document certified, plus $0.50 per page (statewide fee schedule). Confirm with the Clerk.',
      es: 'Las copias certificadas cuestan más: $40 por documento más $0.50 por página, según la investigación. Confirme con el Secretario.',
    },
    status: 'partial',
    sourceIds: ['sc_case_info_online'],
    note: 'Amount from the Nov 7 research matrix (Gov. Code 70626(a)(4), statewide fee schedule eff. 1/1/2026). The court page confirms certified copies carry fees but this build did not re-open the fee schedule PDF.',
  },
  {
    id: 'sc_search_fee',
    statement: {
      en: 'If the Clerk must search without the case number, case name, document title and filing date, a search fee may apply (research found $15 for searches over 10 minutes). Finding the case number first can avoid it.',
      es: 'Si el Secretario debe buscar sin el número de caso, puede haber una cuota de búsqueda (la investigación indica $15 si tarda más de 10 minutos).',
    },
    status: 'partial',
    sourceIds: ['sc_case_info_online', 'sc_criminal_records'],
    note: 'Court pages confirm a search fee exists; the $15 amount is from the Nov 7 research matrix.',
  },
  {
    id: 'sc_mail_request',
    statement: {
      en: 'Mail requests go to the courthouse where the case was filed. Include the case number, the names, which documents you want (and dates if known), payment, and a self-addressed stamped envelope.',
      es: 'Las solicitudes por correo van al tribunal donde se presentó el caso. Incluya número de caso, nombres, documentos deseados, pago y un sobre con su dirección y estampilla.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_case_info_online', 'sc_criminal_records'],
  },
  {
    id: 'sc_not_to_exceed',
    statement: {
      en: 'If you don\'t know the page count, the court suggests writing "not to exceed" an amount on the check (its example is $10.00) and putting the case number in the memo line.',
      es: 'Si no sabe cuántas páginas son, el tribunal sugiere escribir "no exceder" una cantidad en el cheque (ejemplo: $10.00) y el número de caso en el memo.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'sc_payee',
    kind: 'caveat',
    statement: {
      en: 'Payee wording differs between court pages ("Clerk of the Superior Court" on the records page, "Superior Court" elsewhere). Ask the Clerk which to use.',
      es: 'El nombre del beneficiario varía entre páginas del tribunal. Pregunte al Secretario cuál usar.',
    },
    status: 'partial',
    sourceIds: ['sc_criminal_records', 'sc_case_info_online'],
    conflict: 'Criminal Case Records: "Clerk of the Superior Court"; Case Information Online: "Superior Court" (both 2026-11-22).',
  },
  {
    id: 'sc_mail_payment',
    statement: {
      en: 'Research found that mailed payments are check or money order only (no cash); card payments are at the counter. There is no online payment for criminal record copies.',
      es: 'Por correo: solo cheque o giro postal (sin efectivo). No hay pago en línea para copias penales.',
    },
    status: 'partial',
    sourceIds: ['sc_case_info_online'],
    note: 'From Nov 7 matrix (court payment-methods page, not re-opened by this build).',
  },
  {
    id: 'sc_ab1524_photos',
    statement: {
      en: 'Since Jan 1, 2026 (AB 1524), people allowed to view a court record may photograph it with their own device as a way of copying it. Not allowed for confidential, sealed or restricted records, and not in some courthouse areas. A photo is not a certified copy.',
      es: 'Desde el 1 de enero de 2026 (AB 1524), quien puede ver un expediente puede fotografiarlo con su propio equipo. No aplica a registros confidenciales o sellados. Una foto no es copia certificada.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_case_info_online'],
  },
  {
    id: 'sc_restricted_documents',
    statement: {
      en: 'Not everything in a court file is public (for example probation reports, documents with victim contact details, criminal history information, financial or medical information).',
      es: 'No todo en un expediente es público (por ejemplo, informes de libertad condicional o datos de víctimas).',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['sc_criminal_records'],
  },
  {
    id: 'sc_relief_disclosure',
    statement: {
      en: 'Research found that convictions granted automatic relief can only be disclosed to the person or a criminal justice agency — so they may not appear in public views.',
      es: 'Según la investigación, las condenas con alivio automático solo se revelan a la persona o a agencias de justicia penal.',
    },
    status: 'partial',
    sourceIds: ['sc_criminal_records', 'doj_automatic_relief'],
    note: 'Nov 7 matrix; ask the Clerk how a person views their OWN relief-granted case.',
  },
  // ---------------------------------------------------------- Record clearance (Santa Clara)
  {
    id: 'sc_petition_no_fee',
    statement: {
      en: 'County guidance says Santa Clara charges no court filing fee for this kind of record-clearance petition, and Probation charges no application fee. Copies and other services can still cost money.',
      es: 'Según el condado, Santa Clara no cobra cuota de presentación por esta petición y Libertad Condicional no cobra por la solicitud. Las copias sí pueden costar.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
    note: 'Probation page returned 403 to this build; from Nov 7 matrix + Nov 22 handoff notes.',
  },
  {
    id: 'sc_petition_packet',
    statement: {
      en: 'County guidance for self-filing mentions forms CR-180, CR-181 and MC-031, filed at the courthouse where the case was heard, with copies served on the District Attorney and Probation.',
      es: 'La guía del condado menciona los formularios CR-180, CR-181 y MC-031, y la entrega de copias a la Fiscalía y a Libertad Condicional.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance', 'form_cr180', 'form_cr181', 'form_mc031'],
    note: 'Packet copy count (research: original + 5) and proof-of-service form are NOT shown as instructions; verify with Probation/Clerk.',
  },
  {
    id: 'sc_one_petition_per_case',
    statement: {
      en: 'Each case (docket) number generally needs its own petition.',
      es: 'Cada número de caso generalmente necesita su propia petición.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
  },
  {
    id: 'sc_probation_app_scope',
    statement: {
      en: 'Probation\'s own Record Clearance Application is described for certain recently discharged Probation clients; people more than about a year past discharge are pointed to other options. Confirm with Probation before using it.',
      es: 'La solicitud de Libertad Condicional es para ciertos clientes dados de alta recientemente. Confirme con Libertad Condicional.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
  },
  {
    id: 'sc_efiling_self_rep',
    kind: 'caveat',
    statement: {
      en: 'Whether a self-represented person can e-file a record-clearance petition in Santa Clara is NOT confirmed. Plan on filing with the Clerk unless the court tells you otherwise.',
      es: 'NO está confirmado si una persona sin abogado puede presentar electrónicamente esta petición.',
    },
    status: 'needs_review',
    sourceIds: ['sc_probation_clearance'],
  },
  {
    id: 'sc_selfhelp_no_criminal',
    statement: {
      en: 'Research found the court\'s general Self-Help Center does not handle criminal record clearance; use the Public Defender, legal aid or the state self-help pages instead.',
      es: 'El Centro de Autoayuda del tribunal no atiende limpieza de antecedentes penales, según la investigación.',
    },
    status: 'partial',
    sourceIds: ['sc_legal_help'],
  },
  {
    id: 'sc_pd_eligibility',
    statement: {
      en: 'The Public Defender\'s Reentry Expungement Program has financial eligibility rules.',
      es: 'El programa de la Defensoría Pública tiene requisitos económicos.',
    },
    status: 'partial',
    sourceIds: ['sc_pd_post_conviction', 'sc_probation_clearance'],
  },
  {
    id: 'sc_early_termination',
    statement: {
      en: 'County Probation\'s website discusses asking for early termination of probation in some situations. A lawyer can tell you whether it makes sense for you.',
      es: 'El sitio de Libertad Condicional menciona la terminación anticipada en algunos casos. Un abogado puede orientarle.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
  },
  // ---------------------------------------------------------- Statewide / DOJ
  {
    id: 'doj_record_review_process',
    statement: {
      en: 'California DOJ Record Review lets you request YOUR OWN statewide criminal history using Live Scan fingerprints (form BCIA 8016RR, "Record Review"). DOJ fee: $25, plus the fingerprint site\'s own fee. Third-party requests are not processed.',
      es: 'Con Record Review del DOJ usted pide SU PROPIO historial estatal con huellas Live Scan (formulario BCIA 8016RR). Cuota del DOJ: $25, más la cuota del sitio de huellas.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['doj_record_review'],
  },
  {
    id: 'doj_fee_waiver_distinct',
    statement: {
      en: 'The DOJ has its own fee waiver for the $25 Record Review fee (for eligible California residents). It is different from the court\'s FW-001 form, and the fingerprint site fee may still apply.',
      es: 'El DOJ tiene su propia exención de la cuota de $25. Es distinta del formulario FW-001 del tribunal.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['doj_fee_waiver', 'form_fw001'],
  },
  {
    id: 'doj_not_case_file',
    statement: {
      en: 'A DOJ record is a statewide summary. It is not the same as court case documents, may not answer every legal question, and may not list everything.',
      es: 'El récord del DOJ es un resumen estatal; no reemplaza los documentos del tribunal.',
    },
    status: 'partial',
    sourceIds: ['doj_record_review'],
  },
  {
    id: 'doj_challenge',
    statement: {
      en: 'If your DOJ record looks wrong or incomplete, DOJ provides a challenge form (BCIA 8706) with the response.',
      es: 'Si su récord del DOJ parece incorrecto, el DOJ incluye un formulario para impugnarlo (BCIA 8706).',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['doj_record_review'],
  },
  {
    id: 'doj_auto_relief_not_erasure',
    statement: {
      en: 'Automatic record relief is "not a dismissal, sealing or expungement." The record stays on your state history with a note that relief was granted, and some employers may still see it.',
      es: 'El alivio automático "no es una desestimación, sellado ni eliminación". El registro permanece con una nota.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['doj_automatic_relief'],
  },
  {
    id: 'doj_auto_relief_no_notice',
    statement: {
      en: 'DOJ does not notify individuals when automatic relief is granted; it notifies the court. To check, you can request your own DOJ record or contact the court.',
      es: 'El DOJ no avisa a las personas; avisa al tribunal. Puede pedir su récord del DOJ o contactar al tribunal.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['doj_automatic_relief'],
  },
  {
    id: 'arrest_sealing_options',
    statement: {
      en: 'For arrests that did not lead to a conviction, California self-help describes asking the court to seal the arrest with form CR-409 (order: CR-410), and notes the arrest may already have been sealed automatically by DOJ. Which option fits depends on the outcome and other details.',
      es: 'Para arrestos sin condena, la autoayuda de California describe el formulario CR-409 (orden: CR-410) y la posibilidad de sellado automático.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['ca_arrest_no_conviction', 'form_cr409'],
  },
  {
    id: 'sealing_motions_da',
    statement: {
      en: 'Research notes that Santa Clara Probation\'s FAQ says arrest-sealing motions are handled by the District Attorney\'s Office, not Probation.',
      es: 'Según la investigación, las mociones de sellado de arresto las maneja la Fiscalía, no Libertad Condicional.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
  },
  {
    id: 'immigration_caution',
    statement: {
      en: 'A criminal record can affect immigration status, and cleaning a record under California law does not necessarily remove immigration consequences. Talk to an immigration-qualified lawyer before filing anything.',
      es: 'Un récord penal puede afectar su estatus migratorio, y limpiarlo bajo la ley de California no necesariamente elimina esas consecuencias. Hable con un abogado de inmigración antes de presentar algo.',
    },
    status: 'verified',
    checkedAt: C,
    sourceIds: ['ca_non_citizens'],
  },
  // ---------------------------------------------------------- Federal / other state / juvenile
  {
    id: 'fbi_ihs_scope',
    statement: {
      en: 'The FBI Identity History Summary is a separate, fingerprint-based national record request. It is not the same as a California DOJ record or court documents and may not be complete.',
      es: 'El resumen del FBI es una solicitud nacional separada basada en huellas. No es lo mismo que el récord del DOJ ni los documentos del tribunal.',
    },
    status: 'needs_review',
    sourceIds: ['fbi_ihs_faq', 'fbi_edo'],
    note: 'FBI pages returned 403 to this build. Fees/processing times intentionally not shown.',
  },
  {
    id: 'federal_not_ca_process',
    statement: {
      en: 'Federal cases follow federal law. California forms like CR-180/CR-181 are not federal procedures. Federal expungement is rare, and a presidential pardon does not erase a conviction.',
      es: 'Los casos federales siguen la ley federal. Los formularios CR-180/CR-181 de California no aplican.',
    },
    status: 'partial',
    sourceIds: ['doj_pardon_faq', 'cand_san_jose'],
  },
  {
    id: 'out_of_state_contact',
    statement: {
      en: 'California courts cannot clear another state\'s convictions. Contact the court where that case was handled (unless it was transferred to Santa Clara).',
      es: 'Los tribunales de California no pueden limpiar condenas de otro estado. Contacte al tribunal de ese estado.',
    },
    status: 'partial',
    sourceIds: ['sc_probation_clearance'],
  },
  {
    id: 'juvenile_separate',
    statement: {
      en: 'Juvenile cases are handled at the Juvenile Justice Courthouse, separately from adult criminal records. Juvenile record sealing in Santa Clara runs through Juvenile Probation.',
      es: 'Los casos juveniles se manejan en el Tribunal de Justicia Juvenil, aparte de los expedientes de adultos. El sellado juvenil se tramita con Libertad Condicional Juvenil.',
    },
    status: 'partial',
    sourceIds: ['sc_juvenile_faqs', 'sc_juvenile_courthouse'],
  },
  {
    id: 'juvenile_request_own',
    statement: {
      en: 'Research found the person can request their own juvenile records in person with photo ID; out of town, by written request with a notarized signature. Others must petition the court.',
      es: 'La persona puede pedir sus registros juveniles en persona con identificación; desde fuera, por escrito con firma notariada.',
    },
    status: 'partial',
    sourceIds: ['sc_juvenile_faqs'],
  },
];

export const FACT_BY_ID: Record<string, Fact> = Object.fromEntries(FACTS.map((f) => [f.id, f]));

export function getFact(id: string): Fact {
  const f = FACT_BY_ID[id];
  if (!f) throw new Error(`Unknown fact id: ${id}`);
  return f;
}

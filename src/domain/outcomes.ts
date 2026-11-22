import type { Condition, LText, OutcomeDef } from './types';

/**
 * Terminal outcome definitions.
 *
 * Wording rules (enforced by tests/unit/safety.test.ts):
 *  - Never say a person is eligible/ineligible/cleared, that a record is erased,
 *    or that they have no record. Never promise a result or a processing time.
 *  - Court procedure claims cite facts (facts.ts) so their verification status shows.
 *  - Forms are "possible forms for a reviewed filing", never auto-completed.
 *
 * Spanish: titles and summaries are translated; detailed step text is English-only
 * in this MVP and the UI says so. Spanish copy needs native-speaker legal review.
 */

export const LEGAL_NOTICE: LText = {
  en: 'This is a research demonstration providing general information, not legal advice. It cannot determine eligibility or retrieve your private records. Please verify court procedures and seek qualified help for complex situations.',
  es: 'Esta es una demostración de investigación con información general, no asesoría legal. No puede determinar si usted califica ni obtener sus registros privados. Verifique los procedimientos del tribunal y busque ayuda calificada en situaciones complejas.',
};

const caseCond = (q: string, codes: string[]): Condition => ({ q, in: codes, scope: 'case' });
const NUMBER_NOT_KNOWN = caseCond('sc_case_number', ['paperwork', 'no', 'unknown']);
const NAMESAKE_RISK = caseCond('sc_namesake', ['several_similar', 'unknown']);
const SC_FILING_UNCLEAR: Condition = { q: 'jurisdiction', in: ['sc_incident_only'] };
const NO_TRAVEL: Condition = { q: 'practical', in: ['no_travel', 'from_home', 'limited_internet'] };

const NAMESAKE_FALLBACK: LText = {
  en: 'Several similar names? Don\'t guess. Ask the Clerk to confirm which case is yours — the index can\'t prove identity.',
  es: '¿Varios nombres parecidos? No adivine. Pida al Secretario que confirme cuál caso es suyo.',
};
const FREE_HELP_FALLBACK: LText = {
  en: 'Still stuck? Free or low-cost legal help is listed in the "Get help" section of this plan.',
  es: '¿Sigue sin poder? Hay ayuda legal gratuita o de bajo costo en la sección "Ayuda".',
};

export const OUTCOMES: OutcomeDef[] = [
  // ======================================================================= SC_INDEX_LOOKUP
  {
    id: 'SC_INDEX_LOOKUP',
    category: 'find_case',
    status: 'route_identified',
    shortTitle: { en: 'Start with Santa Clara\'s official case index', es: 'Empiece con el índice oficial de casos de Santa Clara' },
    summary: {
      en: 'Based on what you told us, you may be able to find the case number through the court\'s official online index — before paying for any statewide record. The index is not your full criminal history and usually doesn\'t include court documents. Once you have the case number, you can ask the Clerk for the exact documents you need.',
      es: 'Según lo que nos dijo, quizá pueda encontrar el número de caso en el índice oficial en línea del tribunal, antes de pagar por un récord estatal. El índice no es su historial completo y normalmente no incluye documentos. Con el número, puede pedir al Secretario los documentos exactos.',
    },
    steps: [
      {
        id: 'check_paperwork',
        when: caseCond('sc_case_number', ['paperwork']),
        title: { en: 'Check your paperwork first', es: 'Revise primero sus papeles' },
        instruction: {
          en: 'Look on court notices, minute orders, release papers or letters from the court for a case number. If you find it, you can skip the search.',
        },
        method: 'information',
        officialResources: [],
      },
      {
        id: 'search_index',
        title: { en: 'Search the court\'s case index — on the official portal', es: 'Busque en el índice del tribunal, en el portal oficial' },
        instruction: {
          en: 'Open the court\'s Case Information Portal. For criminal cases filed in 2004 or later, the court describes two ways to search: name + date of birth, or name + month and year filed. Type these details only on the official site — never into this tool. Try other names or spellings you\'ve used.',
        },
        method: 'online',
        requiredInformation: [
          { en: 'The name used in the case (and any other names you have used)' },
          { en: 'Your date of birth, OR the approximate month and year the case was filed' },
        ],
        officialResources: ['sc_portal', 'sc_criminal_records'],
        factIds: ['sc_index_coverage', 'sc_index_search_keys', 'sc_no_documents_online', 'sc_portal_login'],
        costs: { en: 'Searching the index yourself: no fee is listed by the court.' },
        accessibilityAlternative: {
          en: 'Can\'t get online? The Clerk\'s Office can help by phone or by letter. A search fee may apply if they search without a case number.',
        },
        tags: ['index_search'],
      },
      {
        id: 'recent_case',
        when: caseCond('sc_filing_era', ['recent']),
        title: { en: 'Very recent case? It may not be in the index yet', es: '¿Caso muy reciente? Quizá aún no esté en el índice' },
        instruction: {
          en: 'The court updates its criminal index quarterly. If you can\'t find a recent case, call the Clerk\'s Office instead of assuming there is no case.',
        },
        method: 'phone',
        officialResources: ['sc_criminal_faqs', 'sc_contacts'],
        factIds: ['sc_index_quarterly'],
        tags: ['clerk_search'],
      },
      {
        id: 'era_unknown',
        when: caseCond('sc_filing_era', ['unknown']),
        title: { en: 'Not sure of the year? Try the index, then ask the Clerk', es: '¿No sabe el año? Pruebe el índice y luego pregunte al Secretario' },
        instruction: {
          en: 'If the case was filed before 2004, the online index won\'t show it. If your search finds nothing, ask the Clerk for a name search rather than concluding there\'s no case.',
        },
        method: 'phone',
        officialResources: ['sc_criminal_faqs', 'sc_contacts'],
        factIds: ['sc_index_coverage', 'sc_pre2004_clerk', 'sc_search_fee'],
        tags: ['clerk_search'],
      },
      {
        id: 'note_result',
        title: { en: 'Write down the case number, filing date and courthouse', es: 'Anote el número, la fecha y el tribunal' },
        instruction: {
          en: 'If you find a case that looks like yours, note the case number and filing date. Keep them with your own papers — you don\'t need to enter them here.',
        },
        method: 'information',
        officialResources: [],
      },
      {
        id: 'then_copies',
        optional: true,
        title: { en: 'Then request only the documents you need', es: 'Luego pida solo los documentos que necesita' },
        instruction: {
          en: 'With the case number, the Clerk\'s copy request is straightforward. Plain copies are $0.50 per page.',
        },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee'],
      },
    ],
    documentsToLookFor: [
      { text: { en: 'Court notices or letters from the court' } },
      { text: { en: 'Minute orders, release papers or a citation' } },
      { text: { en: 'Any paper showing the court name and a case number' } },
    ],
    uncertainties: [
      { text: { en: 'Whether the portal needs an account to see results is not confirmed.' }, factIds: ['sc_portal_login'] },
      { text: { en: 'Many people share names. A result that looks like yours still needs confirming.' } },
      { text: { en: 'It may have been filed in a different county than where it happened. If the index has no match, that\'s one possible reason.' }, when: SC_FILING_UNCLEAR },
    ],
    fallbacks: [
      {
        text: {
          en: 'No match? That does NOT mean there\'s no case. It could be older than 2004, too recent for the index, filed under another name or spelling, in another county, or restricted from public view. Contact the Clerk.',
        },
        factIds: ['sc_index_not_rap_sheet'],
      },
      { text: NAMESAKE_FALLBACK },
      { text: FREE_HELP_FALLBACK },
    ],
    legalHelpReferralIds: ['sc_legal_help'],
    places: ['filing_courthouse'],
    clerkQuestions: [
      { en: 'I\'m trying to find the case number for a criminal case filed around [year]. What\'s the approved way to search?' },
      { en: 'I searched the online index and didn\'t find my case. Can the Clerk do a name search, and is there a fee?' },
    ],
  },
  // ======================================================================= SC_PRE_2004_CLERK
  {
    id: 'SC_PRE_2004_CLERK',
    category: 'find_case',
    status: 'route_identified',
    shortTitle: { en: 'Older case: ask the Clerk to search', es: 'Caso antiguo: pida al Secretario que busque' },
    summary: {
      en: 'Cases filed before 2004 aren\'t in the court\'s online index. The court says to ask the Clerk for a name search — in person or by letter. Don\'t plan on searching microfiche yourself: the court\'s FAQ says it no longer provides it.',
      es: 'Los casos anteriores a 2004 no están en el índice en línea. El tribunal indica pedir al Secretario una búsqueda por nombre, en persona o por carta. No cuente con buscar en microfichas usted mismo.',
    },
    steps: [
      {
        id: 'call_first',
        title: { en: 'Call the Clerk to ask how they handle older searches', es: 'Llame al Secretario para preguntar sobre búsquedas antiguas' },
        instruction: {
          en: 'Ask how to request a name search for an older case and whether a fee applies. Clerk phone hours: Mon–Thu 8:30 a.m.–3:00 p.m., Fri until noon.',
        },
        method: 'phone',
        officialResources: ['sc_contacts', 'sc_criminal_faqs'],
        factIds: ['sc_clerk_hours', 'sc_pre2004_clerk'],
        tags: ['clerk_search'],
      },
      {
        id: 'clerk_letter',
        title: { en: 'Send the Clerk a search request letter', es: 'Envíe al Secretario una carta de búsqueda' },
        instruction: {
          en: 'Write to the Clerk\'s Office at the courthouse that likely handled the case. The court asks for the name used in the case, the date of birth, and the years to search. Put these personal details only in your letter to the court.',
        },
        method: 'mail',
        requiredInformation: [
          { en: 'Name(s) used at the time of the case' },
          { en: 'Date of birth' },
          { en: 'The years you want searched' },
          { en: 'A self-addressed stamped envelope' },
        ],
        officialResources: ['sc_criminal_records', 'sc_criminal_faqs'],
        factIds: ['sc_pre2004_clerk', 'sc_search_fee', 'sc_mail_payment'],
        costs: { en: 'A search fee may apply if the search takes over 10 minutes (research found $15). Copies are $0.50 per page.' },
        accessibilityAlternative: {
          en: 'No printer? The court asks for a letter but doesn\'t say it must be typed — ask the Clerk whether a handwritten letter is OK.',
        },
        tags: ['clerk_search'],
      },
      {
        id: 'clerk_in_person',
        optional: true,
        title: { en: 'Or ask at the Clerk\'s counter', es: 'O pregunte en el mostrador del Secretario' },
        instruction: {
          en: 'Bring photo ID. The records counter location inside the courthouse isn\'t published — call first to ask where to go.',
        },
        method: 'in_person',
        officialResources: ['sc_hoj', 'sc_contacts'],
        factIds: ['sc_clerk_hours', 'hoj_records_counter_location'],
        contingency: { en: 'Friday counter hours end at noon, and courts close on court holidays.' },
      },
    ],
    documentsToLookFor: [
      { text: { en: 'Any old paperwork showing the court, the city, or a year' } },
      { text: { en: 'Names you used at the time' } },
    ],
    uncertainties: [
      { text: { en: 'Court pages disagree about microfiche; the newer FAQ says it\'s no longer provided.' }, factIds: ['sc_microfiche_conflict'] },
      { text: { en: 'Search fee amount is from research, not re-confirmed.' }, factIds: ['sc_search_fee'] },
    ],
    fallbacks: [
      { text: { en: 'Nothing found? Older files may be archived, or the case may be in another county. Ask the Clerk what else they can check.' } },
      { text: FREE_HELP_FALLBACK },
    ],
    legalHelpReferralIds: ['sc_legal_help'],
    places: ['filing_courthouse'],
    clerkQuestions: [
      { en: 'I\'m looking for a criminal case filed before 2004. How do I request a name search, and is there a fee?' },
    ],
  },
  // ======================================================================= SC_KNOWN_CASE_REQUEST
  {
    id: 'SC_KNOWN_CASE_REQUEST',
    category: 'find_case',
    status: 'route_identified',
    shortTitle: { en: 'You have the case number — confirm it and get basic information', es: 'Tiene el número de caso: confírmelo y obtenga información básica' },
    summary: {
      en: 'With a case number, you don\'t need to search by name. You can look the case up by number on the court\'s official portal, or ask the Clerk. The portal shows index information — not the court documents themselves.',
      es: 'Con el número de caso no necesita buscar por nombre. Puede buscarlo por número en el portal oficial o preguntar al Secretario. El portal muestra información del índice, no los documentos.',
    },
    steps: [
      {
        id: 'lookup_by_number',
        title: { en: 'Look up the case by number on the official portal', es: 'Busque el caso por número en el portal oficial' },
        instruction: { en: 'Open the court\'s Case Information Portal and search by case number. Enter the number on the official site only.' },
        method: 'online',
        requiredInformation: [{ en: 'Your case number' }],
        officialResources: ['sc_portal', 'sc_case_info_online'],
        factIds: ['sc_no_documents_online', 'sc_portal_login'],
        accessibilityAlternative: { en: 'No internet? Call the Clerk\'s Office during phone hours with the case number.' },
        tags: ['index_search'],
      },
      {
        id: 'verify_identity',
        when: NAMESAKE_RISK,
        title: { en: 'Confirm with the Clerk that the case is yours', es: 'Confirme con el Secretario que el caso es suyo' },
        instruction: { en: 'Because several similar names came up, ask the Clerk to confirm the case belongs to you before relying on it.' },
        method: 'phone',
        officialResources: ['sc_contacts'],
        factIds: ['sc_index_not_rap_sheet'],
      },
      {
        id: 'ask_clerk',
        title: { en: 'Or ask the Clerk directly', es: 'O pregunte directamente al Secretario' },
        instruction: { en: 'Call or email the Clerk\'s Office with your case number and ask for the basic case information you need.' },
        method: 'phone',
        officialResources: ['sc_contacts'],
        factIds: ['sc_clerk_hours'],
      },
      {
        id: 'later_copies',
        optional: true,
        title: { en: 'Need documents later? Request copies', es: '¿Necesita documentos después? Pida copias' },
        instruction: { en: 'Copies come from the Clerk at the courthouse where the case was filed — one request per case number.' },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee'],
      },
    ],
    documentsToLookFor: [{ text: { en: 'Your case number and the filing date' } }, { text: { en: 'Which courthouse handled it, if shown' } }],
    uncertainties: [{ text: { en: 'Portal sign-in rules are not confirmed.' }, factIds: ['sc_portal_login'] }],
    fallbacks: [
      { text: { en: 'The number doesn\'t bring up a case? Check it against your paperwork, then contact the Clerk — it may be restricted, older, or formatted differently.' } },
      { text: FREE_HELP_FALLBACK },
    ],
    legalHelpReferralIds: ['sc_legal_help'],
    places: ['filing_courthouse'],
    clerkQuestions: [{ en: 'I have a case number and want to confirm the case status. What\'s the best way to do that?' }],
  },
  // ======================================================================= SC_COURT_DOCUMENTS
  {
    id: 'SC_COURT_DOCUMENTS',
    category: 'request_copies',
    status: 'route_identified',
    shortTitle: { en: 'Request copies from the Clerk', es: 'Pida copias al Secretario' },
    summary: {
      en: 'Copies come from the Clerk at the courthouse where the case was filed. Ask only for the documents you need — each case number is a separate request. Plain copies are $0.50 per page; certified copies cost more and are only needed if someone requires them.',
      es: 'Las copias vienen del Secretario del tribunal donde se presentó el caso. Pida solo lo necesario; cada número de caso es una solicitud aparte. Copias simples: $0.50 por página; las certificadas cuestan más y solo si se las exigen.',
    },
    steps: [
      {
        id: 'find_number_first',
        when: { all: [NUMBER_NOT_KNOWN, { not: caseCond('sc_index_tried', ['found']) }] },
        title: { en: 'First, get the case number', es: 'Primero, obtenga el número de caso' },
        instruction: { en: 'Use the case-finding steps in this plan first. Requests with a case number are faster and can avoid a search fee.' },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_search_fee'],
      },
      {
        id: 'confirm_case_court',
        title: { en: 'Confirm the case and the filing courthouse', es: 'Confirme el caso y el tribunal donde se presentó' },
        instruction: {
          en: 'Records are kept at the courthouse where the case was filed — not necessarily the closest courthouse, and not the police station.',
        },
        method: 'information',
        officialResources: ['sc_criminal_records'],
        factIds: ['sc_courthouse_by_city'],
      },
      {
        id: 'verify_namesake',
        when: NAMESAKE_RISK,
        title: { en: 'Ask the Clerk to confirm the case is yours', es: 'Pida al Secretario que confirme que el caso es suyo' },
        instruction: { en: 'Several similar names came up. Confirm with the Clerk before ordering copies.' },
        method: 'phone',
        officialResources: ['sc_contacts'],
        factIds: ['sc_index_not_rap_sheet'],
      },
      {
        id: 'choose_documents',
        title: { en: 'Decide which documents you need', es: 'Decida qué documentos necesita' },
        instruction: {
          en: 'The court\'s guidance gives examples such as the complaint, the docket, the sentencing record, or a minute order for a specific date. A disposition or a court order may also matter. Not every case has every document. If someone is helping you with record clearance, ask which ones they want.',
        },
        method: 'information',
        officialResources: ['sc_case_info_online', 'sc_criminal_records'],
        factIds: ['sc_restricted_documents'],
      },
      {
        id: 'plain_copies',
        when: { not: { q: 'copy_type', in: ['certified'] } },
        title: { en: 'Plain copies are usually enough', es: 'Las copias simples suelen bastar' },
        instruction: {
          en: 'Plain copies are $0.50 per page. Certified copies (with an official stamp) cost more — only order them if the person or agency asking for documents requires certification.',
        },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee', 'sc_certified_fee'],
        tags: ['court_copies'],
      },
      {
        id: 'certified_copies',
        when: { q: 'copy_type', in: ['certified'] },
        title: { en: 'Ask specifically for certified copies', es: 'Pida específicamente copias certificadas' },
        instruction: {
          en: 'Say "certified copy" in your request and list each document to certify. Certification is charged per document on top of the per-page copy fee, so certify only what is required.',
        },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_certified_fee', 'sc_copy_fee'],
        tags: ['certified_copies'],
      },
      {
        id: 'request_by_mail',
        title: { en: 'Request by mail', es: 'Solicite por correo' },
        instruction: {
          en: 'Mail a letter to the Clerk at the filing courthouse (Hall of Justice mail goes to 191 N. First Street, San Jose, CA 95113). Include the case number, the names in the case, the documents you want (with dates, if known), a check or money order, and a self-addressed stamped envelope. Your personal details go only in this letter to the court.',
        },
        method: 'mail',
        requiredInformation: [
          { en: 'Case number' },
          { en: 'Names in the case' },
          { en: 'List of documents (and dates, if known)' },
          { en: 'Check or money order' },
          { en: 'Self-addressed stamped envelope' },
        ],
        officialResources: ['sc_case_info_online', 'sc_criminal_records'],
        factIds: ['sc_mail_request', 'sc_not_to_exceed', 'sc_payee', 'sc_mail_payment'],
        costs: {
          en: '$0.50 per page. If you don\'t know the page count, the court suggests writing "not to exceed" an amount on the check (its example: $10.00), with the case number in the memo line.',
        },
        accessibilityAlternative: {
          en: 'No printer? The court describes a letter but doesn\'t say it must be typed — ask the Clerk whether handwritten is OK.',
        },
        tags: ['court_copies'],
      },
      {
        id: 'request_in_person',
        optionalWhen: { q: 'practical', in: ['no_travel', 'from_home'] },
        title: { en: 'Or request at the Clerk\'s counter', es: 'O solicite en el mostrador del Secretario' },
        instruction: {
          en: 'Go to the Clerk\'s Office at the filing courthouse with your case number and photo ID. Call first: the records counter\'s floor/room isn\'t published, and Friday hours end at noon.',
        },
        method: 'in_person',
        officialResources: ['sc_hoj', 'sc_contacts'],
        factIds: ['sc_clerk_hours', 'hoj_records_counter_location'],
        accessibilityAlternative: { en: 'Hard to travel? Use the mail request instead.' },
        tags: ['court_copies'],
      },
      {
        id: 'photo_copies',
        optional: true,
        title: { en: 'Photograph public records yourself', es: 'Fotografiar registros públicos usted mismo' },
        instruction: {
          en: 'Since Jan 1, 2026 (AB 1524), if you\'re allowed to view a court record you may photograph it with your own phone as a way of copying it — not for confidential, sealed or restricted records, and not in some courthouse areas. A photo is not a certified copy.',
        },
        method: 'in_person',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_ab1524_photos'],
        tags: ['photo_copies'],
      },
      {
        id: 'contact_clerk',
        title: { en: 'Questions? Contact the Clerk', es: '¿Preguntas? Contacte al Secretario' },
        instruction: { en: 'Ask the page count and total cost before paying, and which payee name to write on the check.' },
        method: 'phone',
        officialResources: ['sc_contacts'],
        factIds: ['sc_clerk_hours', 'sc_payee'],
      },
    ],
    documentsToLookFor: [
      { text: { en: 'Complaint (the charging document)' } },
      { text: { en: 'Docket (the case\'s list of events)' } },
      { text: { en: 'Minute order for a specific date (for example, the sentencing date)' } },
      { text: { en: 'Disposition or court order, if relevant to your goal' } },
    ],
    uncertainties: [
      { text: { en: 'Payee wording differs across court pages.' }, factIds: ['sc_payee'] },
      { text: { en: 'Certified copy fee amount is from research and should be confirmed.' }, factIds: ['sc_certified_fee'] },
      { text: { en: 'Some documents in a court file are not public.' }, factIds: ['sc_restricted_documents'] },
    ],
    fallbacks: [
      { text: { en: 'The Clerk says a record is restricted or sealed? Ask how YOU can see your own record. Don\'t try to get around restrictions.' } },
      { text: { en: 'No reply to your letter? Call the Clerk during phone hours with your case number.' } },
      { text: { en: 'Can\'t travel? Use the mail request — no trip needed.' }, when: NO_TRAVEL },
      { text: FREE_HELP_FALLBACK },
    ],
    legalHelpReferralIds: ['sc_legal_help'],
    places: ['filing_courthouse'],
    clerkQuestions: [
      { en: 'For case number [your case number], how many pages are the complaint, docket and minute orders, and what is the total cost?' },
      { en: 'Should my check be payable to "Clerk of the Superior Court" or "Superior Court"?' },
    ],
  },
  // ======================================================================= DOCUMENT_ACCESS_FALLBACK
  {
    id: 'DOCUMENT_ACCESS_FALLBACK',
    category: 'find_case',
    status: 'more_info_needed',
    shortTitle: { en: 'Search came up empty or wouldn\'t work: the Clerk can help', es: 'La búsqueda no funcionó: el Secretario puede ayudar' },
    summary: {
      en: 'An empty search result does not prove there\'s no case, and it isn\'t a statement about your record. When the online index doesn\'t work for you, the Clerk\'s Office is the official next step.',
      es: 'Un resultado vacío no prueba que no haya caso, ni dice nada sobre su récord. Si el índice en línea no le funciona, el siguiente paso oficial es la Oficina del Secretario.',
    },
    steps: [
      {
        id: 'why_no_match',
        when: caseCond('sc_index_tried', ['no_match']),
        title: { en: 'Why a search can come up empty', es: 'Por qué una búsqueda puede no dar resultados' },
        instruction: {
          en: 'The case may be older than 2004, too recent for the quarterly-updated index, filed under a different name or spelling, filed in another county, or restricted from public view.',
        },
        method: 'information',
        officialResources: ['sc_criminal_faqs'],
        factIds: ['sc_index_not_rap_sheet', 'sc_index_quarterly', 'sc_index_coverage'],
      },
      {
        id: 'retry_variants',
        when: caseCond('sc_index_tried', ['no_match']),
        optional: true,
        title: { en: 'Try once more with variations', es: 'Intente otra vez con variaciones' },
        instruction: { en: 'Try other names or spellings you\'ve used, and the other search method (name + date of birth, or name + month/year filed).' },
        method: 'online',
        officialResources: ['sc_portal'],
        factIds: ['sc_index_search_keys'],
        tags: ['index_search'],
      },
      {
        id: 'access_problem',
        when: caseCond('sc_index_tried', ['access_problem']),
        title: { en: 'If the portal asks you to sign in or won\'t work', es: 'Si el portal pide iniciar sesión o no funciona' },
        instruction: {
          en: 'Whether the portal requires an account is not confirmed, so a sign-in screen may be expected. Don\'t try to get around sign-in or "I\'m not a robot" checks — use the Clerk options below instead.',
        },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_portal_login'],
      },
      {
        id: 'clerk_search',
        title: { en: 'Ask the Clerk to search', es: 'Pida al Secretario que busque' },
        instruction: {
          en: 'Call, email, or write to the Clerk\'s Office. For a name search the court asks for the name, date of birth, and years to search — give these only to the court.',
        },
        method: 'phone',
        requiredInformation: [{ en: 'Name(s) used' }, { en: 'Date of birth' }, { en: 'Years to search' }],
        officialResources: ['sc_contacts', 'sc_criminal_records'],
        factIds: ['sc_pre2004_clerk', 'sc_search_fee', 'sc_clerk_hours'],
        costs: { en: 'A search fee may apply for searches over 10 minutes (research found $15).' },
        tags: ['clerk_search'],
      },
      {
        id: 'follow_up',
        when: { q: 'clerk_contacted', in: ['no_response'] },
        title: { en: 'Follow up with the Clerk', es: 'Dé seguimiento con el Secretario' },
        instruction: { en: 'Call during phone hours (Mon–Thu 8:30 a.m.–3:00 p.m., Fri until noon), or email the criminal records inbox, and mention when you first wrote.' },
        method: 'phone',
        officialResources: ['sc_contacts'],
        factIds: ['sc_clerk_hours'],
      },
      {
        id: 'clarify',
        when: { q: 'clerk_contacted', in: ['needs_clarification'] },
        title: { en: 'Send exactly what the Clerk asked for', es: 'Envíe exactamente lo que pidió el Secretario' },
        instruction: { en: 'Reply with only the information they requested, and keep a copy for yourself.' },
        method: 'mail',
        officialResources: ['sc_contacts'],
      },
      {
        id: 'other_county',
        when: SC_FILING_UNCLEAR,
        title: { en: 'The case may have been filed in another county', es: 'El caso pudo presentarse en otro condado' },
        instruction: { en: 'Where something happened and where a case was filed can differ. Ask the Clerk, or check the county where the case may have gone.' },
        method: 'information',
        officialResources: ['ca_courts_find'],
      },
    ],
    optionalRoutes: [
      {
        text: {
          en: 'If you think there may be cases in several counties, a California DOJ Record Review (fingerprints, $25 DOJ fee + site fee, fee waiver available) can show your statewide history.',
        },
        when: { any: [SC_FILING_UNCLEAR, { q: 'case_count', in: ['three_plus', 'unknown'] }] },
        factIds: ['doj_record_review_process'],
      },
    ],
    uncertainties: [{ text: { en: 'Portal sign-in requirements are unverified.' }, factIds: ['sc_portal_login'] }],
    fallbacks: [{ text: NAMESAKE_FALLBACK }, { text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['sc_legal_help', 'ca_legal_help'],
    places: ['filing_courthouse'],
    clerkQuestions: [
      { en: 'I searched the online index and didn\'t find my case. Can the Clerk do a name search, and is there a fee?' },
      { en: 'The portal asked me to sign in. Is there another way to look up a criminal case number?' },
    ],
  },
  // ======================================================================= SC_NO_CONVICTION_INFO
  {
    id: 'SC_NO_CONVICTION_INFO',
    category: 'review_relief',
    status: 'avenue_to_explore',
    shortTitle: { en: 'Arrest without a conviction: options to look into', es: 'Arresto sin condena: opciones para investigar' },
    summary: {
      en: 'If an arrest didn\'t lead to a conviction, California has a process to ask a court to seal the arrest record, and some arrests are sealed automatically by the California DOJ. Which option — if any — fits depends on how the case ended and other details. This is a possible topic to review, not a decision about your case.',
      es: 'Si un arresto no terminó en condena, California tiene un proceso para pedir que se selle el registro, y algunos arrestos se sellan automáticamente. Qué opción aplica depende de cómo terminó el caso. Es un tema para revisar, no una decisión sobre su caso.',
    },
    steps: [
      {
        id: 'never_charged',
        when: { q: 'matter_status', in: ['arrest_only'] },
        title: { en: 'Never charged? There may be no court case', es: '¿Sin cargos? Puede que no haya caso en el tribunal' },
        instruction: {
          en: 'An arrest can be recorded without a court case ever being filed. The court index lists court cases only; a statewide DOJ record would show the arrest and any relief noted on it.',
        },
        method: 'information',
        officialResources: ['ca_arrest_no_conviction'],
        factIds: ['arrest_sealing_options'],
      },
      {
        id: 'get_disposition',
        when: { q: 'matter_status', in: ['dismissed', 'acquitted'] },
        title: { en: 'Get the case outcome from the court', es: 'Obtenga el resultado del caso del tribunal' },
        instruction: { en: 'A docket or minute order showing the dismissal or verdict is useful for any sealing request. See the copies steps in this plan.' },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee'],
      },
      {
        id: 'check_auto',
        optional: true,
        title: { en: 'Check whether relief already happened', es: 'Verifique si ya hubo alivio' },
        instruction: {
          en: 'You can request your own California DOJ record to see whether it notes that relief was granted. California self-help says this is optional — you don\'t have to get your record first.',
        },
        method: 'in_person',
        officialResources: ['doj_record_review', 'doj_fee_waiver', 'doj_automatic_relief'],
        factIds: ['doj_auto_relief_no_notice', 'doj_record_review_process'],
        costs: { en: '$25 DOJ fee (a DOJ fee waiver exists) plus the fingerprint site\'s fee.' },
        tags: ['automatic_relief_check', 'doj_record_review'],
      },
      {
        id: 'learn_sealing',
        title: { en: 'Read the official guide on sealing an arrest', es: 'Lea la guía oficial para sellar un arresto' },
        instruction: { en: 'The California Courts self-help page explains arrest sealing, automatic sealing, diversion-related sealing and factual innocence.' },
        method: 'information',
        officialResources: ['ca_arrest_no_conviction', 'form_cr409_info'],
        factIds: ['arrest_sealing_options'],
      },
      {
        id: 'forms_cr409',
        title: { en: 'Forms the court uses: CR-409 (petition) and CR-410 (order)', es: 'Formularios: CR-409 (petición) y CR-410 (orden)' },
        instruction: {
          en: 'CR-409 is the Petition to Seal Arrest and Related Records; CR-410 is the order a judge would use. These are possible forms to discuss with a legal helper — this tool doesn\'t fill them out. (CR-180/CR-181 are for convictions, not arrests.)',
        },
        method: 'information',
        officialResources: ['form_cr409', 'form_cr410'],
        factIds: ['arrest_sealing_options'],
        tags: ['form_cr409', 'form_cr410'],
      },
      {
        id: 'legal_help',
        title: { en: 'Talk to free legal help before filing', es: 'Hable con ayuda legal gratuita antes de presentar' },
        instruction: { en: 'A legal helper can tell you which option fits your situation. Research notes that in Santa Clara, arrest-sealing motions go through the District Attorney\'s Office, not Probation.' },
        method: 'phone',
        officialResources: ['sc_pd_post_conviction', 'ca_legal_help'],
        factIds: ['sealing_motions_da', 'sc_pd_eligibility'],
        tags: ['legal_help', 'public_defender'],
      },
    ],
    uncertainties: [
      { text: { en: 'The official page notes some government agencies can still see sealed records.' }, factIds: ['arrest_sealing_options'] },
      { text: { en: 'Which process applies depends on how the case ended — for example, never charged, dismissed, diversion, or a not-guilty verdict.' } },
    ],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['sc_pd_post_conviction', 'ca_legal_help', 'sc_legal_help'],
    places: ['sc_pd_reentry'],
    clerkQuestions: [{ en: 'How can I get a copy of the dismissal or final outcome for my case number?' }],
  },
  // ======================================================================= SC_ADULT_DISMISSAL_INFO
  {
    id: 'SC_ADULT_DISMISSAL_INFO',
    category: 'review_relief',
    status: 'avenue_to_explore',
    shortTitle: { en: 'Conviction record: official ways to explore clearing it', es: 'Récord de condena: formas oficiales de explorar su limpieza' },
    summary: {
      en: 'California has a court process to ask for dismissal of some convictions, and some convictions receive automatic relief. Santa Clara County describes several ways to start. Only a court — usually with help from a lawyer or legal aid — can decide what applies.',
      es: 'California tiene un proceso judicial para pedir la desestimación de algunas condenas, y algunas reciben alivio automático. El Condado de Santa Clara describe varias formas de empezar. Solo un tribunal, normalmente con ayuda legal, puede decidir qué aplica.',
    },
    steps: [
      {
        id: 'gather_records',
        title: { en: 'Gather your case records first', es: 'Reúna primero los documentos del caso' },
        instruction: {
          en: 'For each case, have the case number, the conviction date and the sentencing or minute order. A legal helper will ask for these. See the copies steps in this plan.',
        },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee'],
      },
      {
        id: 'overview_misdemeanor',
        when: { q: 'conviction_class', in: ['misdemeanor', 'infraction', 'unknown'] },
        title: { en: 'Read the official misdemeanor overview', es: 'Lea la guía oficial sobre delitos menores' },
        instruction: { en: 'California Courts self-help explains record-relief options for misdemeanors in plain language.' },
        method: 'information',
        officialResources: ['ca_misdemeanors', 'ca_clean_record'],
      },
      {
        id: 'overview_felony',
        when: { q: 'conviction_class', in: ['felony', 'unknown'] },
        title: { en: 'Read the official felony overview', es: 'Lea la guía oficial sobre delitos graves' },
        instruction: { en: 'Felonies can involve different options and exceptions. The state self-help page is the starting point; a lawyer should review the details.' },
        method: 'information',
        officialResources: ['ca_felony', 'ca_clean_record'],
      },
      {
        id: 'free_help',
        title: { en: 'Ask free legal help to review your situation', es: 'Pida a la ayuda legal gratuita que revise su situación' },
        instruction: {
          en: 'The Public Defender\'s Reentry Expungement Program helps with this kind of relief (financial eligibility applies). Legal aid groups can help too. The court\'s general Self-Help Center does not handle criminal record clearance.',
        },
        method: 'phone',
        officialResources: ['sc_pd_post_conviction', 'sc_legal_help', 'ca_legal_help'],
        factIds: ['sc_pd_eligibility', 'sc_selfhelp_no_criminal'],
        tags: ['public_defender', 'legal_help'],
      },
      {
        id: 'county_pathways',
        title: { en: 'Santa Clara County\'s ways to start', es: 'Las formas de empezar en Santa Clara' },
        instruction: {
          en: 'County Probation describes: filing yourself with the Superior Court; getting help from the Public Defender or legal aid; a Probation Record Clearance Application (only for certain recently discharged Probation clients — confirm with Probation first); and automatic DOJ relief.',
        },
        method: 'information',
        officialResources: ['sc_probation_clearance'],
        factIds: ['sc_probation_app_scope', 'sc_petition_no_fee'],
      },
      {
        id: 'forms_info',
        title: { en: 'Forms involved if a filing is appropriate', es: 'Formularios si corresponde presentar' },
        instruction: {
          en: 'County guidance mentions CR-180 (Petition for Dismissal), CR-181 (Order for Dismissal) and MC-031 (Attached Declaration), with copies served on the District Attorney and Probation. Each case generally needs its own petition. These are potential forms for a reviewed filing — this tool doesn\'t fill them out.',
        },
        method: 'information',
        officialResources: ['form_cr180', 'form_cr181', 'form_mc031'],
        factIds: ['sc_petition_packet', 'sc_one_petition_per_case', 'sc_efiling_self_rep'],
        tags: ['form_cr180', 'form_cr181', 'form_mc031'],
      },
      {
        id: 'no_fee',
        title: { en: 'No court filing fee is described for this petition', es: 'No se describe cuota de presentación para esta petición' },
        instruction: {
          en: 'County guidance says there\'s no filing fee, so a court fee waiver form (FW-001) isn\'t a default part of this petition. Copies of records still cost money. The DOJ record-review fee waiver is a different, separate process.',
        },
        method: 'information',
        officialResources: ['sc_probation_clearance'],
        factIds: ['sc_petition_no_fee', 'doj_fee_waiver_distinct'],
      },
      {
        id: 'confirm_supervision',
        when: { q: 'supervision', in: ['unknown'] },
        title: { en: 'Confirm whether probation is finished', es: 'Confirme si terminó la libertad condicional' },
        instruction: { en: 'Call the Probation main line to ask about your supervision status before planning a filing.' },
        method: 'phone',
        officialResources: ['sc_probation_clearance'],
      },
      {
        id: 'open_obligations',
        when: { q: 'obligations', in: ['some_open', 'unknown'] },
        title: { en: 'Bring open requirements to a lawyer', es: 'Lleve los requisitos pendientes a un abogado' },
        instruction: { en: 'Unfinished classes, fines or restitution don\'t automatically rule out every option, but a lawyer should look at them with you.' },
        method: 'information',
        officialResources: ['ca_legal_help'],
      },
      {
        id: 'relief_first',
        when: { q: 'relief_status', in: ['court_order', 'auto_relief', 'unknown'] },
        title: { en: 'Check for existing relief first', es: 'Verifique primero si ya hubo alivio' },
        instruction: { en: 'If relief may already exist, confirm it before starting a new request. See the relief-check steps in this plan.' },
        method: 'information',
        officialResources: ['doj_automatic_relief'],
        factIds: ['doj_auto_relief_no_notice'],
      },
      {
        id: 'per_case',
        when: { q: 'case_count', in: ['two', 'three_plus', 'unknown'] },
        title: { en: 'Each case is handled separately', es: 'Cada caso se maneja por separado' },
        instruction: { en: 'Keep each case number\'s documents together. Each case generally needs its own petition — not one petition for all.' },
        method: 'information',
        officialResources: ['sc_probation_clearance'],
        factIds: ['sc_one_petition_per_case'],
      },
    ],
    uncertainties: [
      { text: { en: 'E-filing for self-represented people is not confirmed.' }, factIds: ['sc_efiling_self_rep'] },
      { text: { en: 'If the sentence included state prison, different rules can apply — ask a lawyer.' }, when: { q: 'state_prison', in: ['unknown'] } },
      { text: { en: 'The number of packet copies and the proof-of-service form are not confirmed — ask the Clerk or Probation.' }, factIds: ['sc_petition_packet'] },
      { text: { en: 'A dismissal doesn\'t erase every legal consequence (for example for some jobs, licenses or immigration).' } },
    ],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['sc_pd_post_conviction', 'sc_legal_help', 'ca_legal_help'],
    places: ['sc_pd_reentry', 'sc_probation'],
    clerkQuestions: [
      { en: 'Where do I file a record-clearance petition for a case handled at this courthouse, and how many copies do you need?' },
    ],
  },
  // ======================================================================= SC_AUTOMATIC_RELIEF_CHECK
  {
    id: 'SC_AUTOMATIC_RELIEF_CHECK',
    category: 'review_relief',
    status: 'avenue_to_explore',
    shortTitle: { en: 'Check whether relief already happened', es: 'Verifique si ya hubo alivio' },
    summary: {
      en: 'The California DOJ grants some arrest and conviction relief automatically, without a petition — and it notifies the court, not you. If relief may have happened, confirm it through official records. Automatic relief is not a dismissal, sealing or expungement, and it doesn\'t remove every consequence.',
      es: 'El DOJ de California concede algunos alivios automáticamente, sin petición, y avisa al tribunal, no a usted. Si pudo pasar, confírmelo con registros oficiales. El alivio automático no es desestimación, sellado ni eliminación.',
    },
    steps: [
      {
        id: 'ask_court',
        title: { en: 'Ask the Clerk whether the court\'s record shows relief', es: 'Pregunte al Secretario si el registro muestra alivio' },
        instruction: {
          en: 'DOJ notifies the court with jurisdiction. The Clerk can tell you how a person can see their own record when relief has been granted, since those records may be limited in public views.',
        },
        method: 'phone',
        officialResources: ['sc_contacts', 'doj_automatic_relief'],
        factIds: ['doj_auto_relief_no_notice', 'sc_relief_disclosure'],
        tags: ['automatic_relief_check'],
      },
      {
        id: 'doj_own_record',
        optional: true,
        title: { en: 'Request your own California DOJ record', es: 'Pida su propio récord del DOJ' },
        instruction: {
          en: 'A DOJ Record Review (Live Scan fingerprints, form BCIA 8016RR marked "Record Review") shows your statewide record, including any note that relief was granted.',
        },
        method: 'in_person',
        officialResources: ['doj_record_review', 'doj_fee_waiver'],
        factIds: ['doj_record_review_process', 'doj_fee_waiver_distinct'],
        costs: { en: '$25 DOJ fee (DOJ fee waiver available for eligible residents) plus the fingerprint site\'s fee.' },
        tags: ['doj_record_review'],
      },
      {
        id: 'get_order',
        when: { any: [{ q: 'relief_status', in: ['court_order'] }, { q: 'existing_reports', in: ['court_order'] }] },
        title: { en: 'Get a copy of the court order', es: 'Obtenga una copia de la orden del tribunal' },
        instruction: {
          en: 'If a court already granted dismissal or sealing, keep a copy of that order. Order a certified copy only if someone requires one.',
        },
        method: 'mail',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee', 'sc_certified_fee'],
        tags: ['court_copies'],
      },
      {
        id: 'stale_report',
        when: { q: 'existing_reports', in: ['doj_report'] },
        title: { en: 'Have an older DOJ record? It may be out of date', es: '¿Tiene un récord del DOJ antiguo? Puede estar desactualizado' },
        instruction: { en: 'DOJ reviews records for automatic relief on an ongoing basis, so an older response may not show recent changes.' },
        method: 'information',
        officialResources: ['doj_automatic_relief'],
        factIds: ['doj_auto_relief_no_notice'],
      },
      {
        id: 'limits',
        title: { en: 'Know what relief does and doesn\'t do', es: 'Sepa lo que hace y no hace el alivio' },
        instruction: {
          en: 'DOJ says automatic relief is not a dismissal, sealing or expungement; the record stays on your state history with a note, and some employers may still see it. Further relief needs a separate petition.',
        },
        method: 'information',
        officialResources: ['doj_automatic_relief'],
        factIds: ['doj_auto_relief_not_erasure'],
      },
      {
        id: 'challenge',
        optional: true,
        title: { en: 'If your DOJ record looks wrong', es: 'Si su récord del DOJ parece incorrecto' },
        instruction: { en: 'DOJ includes a challenge form (BCIA 8706) with its response. A legal helper can help you use it.' },
        method: 'mail',
        officialResources: ['doj_record_review'],
        factIds: ['doj_challenge'],
      },
    ],
    uncertainties: [
      { text: { en: 'A prosecutor or Probation can object to some automatic relief; the result for any one case isn\'t predictable here.' } },
    ],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['sc_pd_post_conviction', 'ca_legal_help'],
    places: ['filing_courthouse'],
    clerkQuestions: [{ en: 'How can I see my own case record if automatic relief may have been granted?' }],
  },
  // ======================================================================= ACTIVE_CASE_LEGAL_HELP
  {
    id: 'ACTIVE_CASE_LEGAL_HELP',
    category: 'legal_help',
    status: 'legal_review_recommended',
    shortTitle: { en: 'Talk to a lawyer first — you can still get your records', es: 'Hable primero con un abogado; aún puede obtener sus registros' },
    summary: {
      en: 'Because something may still be open — probation, parole, diversion, a pending case or a possible warrant — get legal advice before filing anything. You can still request your own court records now. This is not a finding that relief is unavailable.',
      es: 'Como algo puede seguir abierto (libertad condicional, un caso pendiente o una posible orden de arresto), busque asesoría legal antes de presentar algo. Aún puede pedir sus registros. Esto no significa que el alivio no esté disponible.',
    },
    steps: [
      {
        id: 'records_ok',
        title: { en: 'You can still get your records', es: 'Aún puede obtener sus registros' },
        instruction: { en: 'Finding your case number and requesting copies is fine while a case or supervision is open. See the records steps in this plan.' },
        method: 'information',
        officialResources: ['sc_criminal_records'],
      },
      {
        id: 'lawyer',
        title: { en: 'Contact your lawyer or the Public Defender', es: 'Contacte a su abogado o a la Defensoría Pública' },
        instruction: { en: 'If you have a lawyer on an open case, ask them first. Otherwise, the Public Defender\'s office can explain your options.' },
        method: 'phone',
        officialResources: ['sc_pd_post_conviction'],
        factIds: ['sc_pd_eligibility'],
        tags: ['public_defender', 'legal_help'],
      },
      {
        id: 'early_termination',
        when: { q: 'supervision', in: ['yes'] },
        title: { en: 'Ask about early termination of probation', es: 'Pregunte por la terminación anticipada' },
        instruction: { en: 'County Probation\'s website discusses early termination in some situations. A lawyer can tell you whether to ask the court.' },
        method: 'information',
        officialResources: ['sc_probation_clearance'],
        factIds: ['sc_early_termination'],
        tags: ['early_termination_info'],
      },
      {
        id: 'warrant',
        when: { q: 'open_matters', in: ['warrant'] },
        title: { en: 'A possible warrant: talk to a lawyer about resolving it', es: 'Posible orden de arresto: hable con un abogado para resolverla' },
        instruction: {
          en: 'Don\'t ignore it. A defense lawyer or the Public Defender can explain how to address a warrant properly with the court.',
        },
        method: 'phone',
        officialResources: ['sc_pd_post_conviction'],
        tags: ['legal_help'],
      },
      {
        id: 'pending',
        when: { any: [{ q: 'matter_status', in: ['pending'] }, { q: 'open_matters', in: ['pending_case'] }] },
        title: { en: 'An open case: ask your current lawyer', es: 'Un caso abierto: pregunte a su abogado actual' },
        instruction: { en: 'Your lawyer on the open case is the best person to ask about records and any later record-clearing steps.' },
        method: 'information',
        officialResources: ['ca_legal_help'],
      },
      {
        id: 'later_info',
        optional: true,
        title: { en: 'For later: how record clearing works', es: 'Para después: cómo funciona la limpieza de récord' },
        instruction: { en: 'The state\'s overview explains the options so you can plan ahead.' },
        method: 'information',
        officialResources: ['ca_clean_record'],
      },
    ],
    uncertainties: [{ text: { en: 'What\'s possible depends on details only a lawyer can review.' } }],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['sc_pd_post_conviction', 'ca_legal_help', 'sc_legal_help'],
    places: ['sc_pd_reentry'],
  },
  // ======================================================================= SC_MULTI_CA_DOJ_OPTION
  {
    id: 'SC_MULTI_CA_DOJ_OPTION',
    category: 'statewide_record',
    status: 'avenue_to_explore',
    shortTitle: { en: 'Several California counties: a statewide record is one option', es: 'Varios condados: un récord estatal es una opción' },
    summary: {
      en: 'If you have cases in more than one county, or aren\'t sure you know them all, a California DOJ Record Review can show your statewide history in one place. It uses fingerprints and has a fee (a DOJ fee waiver exists). You can still work county by county if you already know your cases. It isn\'t the same as court documents.',
      es: 'Si tiene casos en varios condados o no los conoce todos, una revisión del DOJ puede mostrar su historial estatal. Usa huellas y tiene costo (hay exención del DOJ). Puede seguir condado por condado si ya conoce sus casos. No reemplaza los documentos del tribunal.',
    },
    steps: [
      {
        id: 'doj_request',
        optional: true,
        title: { en: 'Request your own DOJ record with Live Scan', es: 'Pida su récord del DOJ con Live Scan' },
        instruction: {
          en: 'Use form BCIA 8016RR and mark "Record Review." Take it to a Live Scan site (for example a police department, sheriff\'s office or public Live Scan location). Only you can request your own record.',
        },
        method: 'in_person',
        requiredInformation: [{ en: 'Form BCIA 8016RR (from the DOJ page)' }, { en: 'Photo ID for the Live Scan site' }],
        officialResources: ['doj_record_review'],
        factIds: ['doj_record_review_process'],
        costs: { en: '$25 DOJ fee, plus the Live Scan site\'s own fee.' },
        tags: ['doj_record_review'],
      },
      {
        id: 'doj_fee_waiver',
        optional: true,
        title: { en: 'Ask for the DOJ fee waiver if money is tight', es: 'Pida la exención del DOJ si el dinero es limitado' },
        instruction: {
          en: 'The DOJ has its own fee waiver for the $25 fee (for example for people on CalFresh or Medi-Cal, or with low income). This is NOT the court\'s FW-001 form.',
        },
        method: 'online',
        officialResources: ['doj_fee_waiver'],
        factIds: ['doj_fee_waiver_distinct'],
        tags: ['doj_fee_waiver'],
      },
      {
        id: 'county_by_county',
        title: { en: 'Or work county by county', es: 'O vaya condado por condado' },
        instruction: {
          en: 'Each county\'s superior court keeps its own records. For Santa Clara cases, use the Santa Clara steps in this plan; for other counties, contact that county\'s court.',
        },
        method: 'information',
        officialResources: ['ca_courts_find'],
        tags: ['other_county_court'],
      },
      {
        id: 'make_list',
        title: { en: 'Make a list of each case', es: 'Haga una lista de cada caso' },
        instruction: { en: 'Write down each county and case. Then request court documents from each county only as needed.' },
        method: 'information',
        officialResources: [],
      },
    ],
    uncertainties: [{ text: { en: 'A DOJ record is a summary and may not answer every question or list everything.' }, factIds: ['doj_not_case_file'] }],
    fallbacks: [
      { text: { en: 'Something on your DOJ record looks wrong? DOJ includes a challenge form (BCIA 8706).' }, factIds: ['doj_challenge'] },
      { text: FREE_HELP_FALLBACK },
    ],
    legalHelpReferralIds: ['ca_legal_help'],
  },
  // ======================================================================= MULTISTATE_FBI_OPTION
  {
    id: 'MULTISTATE_FBI_OPTION',
    category: 'federal_record',
    status: 'avenue_to_explore',
    shortTitle: { en: 'Another state: contact that state — the FBI summary is one option', es: 'Otro estado: contacte a ese estado; el resumen del FBI es una opción' },
    summary: {
      en: 'California courts can\'t clear another state\'s records. Contact the court where that case was handled. If you\'re unsure where all your records are across states, the FBI Identity History Summary is one national, fingerprint-based option to understand. It\'s separate from California DOJ and court records and may not be complete.',
      es: 'Los tribunales de California no pueden limpiar récords de otro estado. Contacte al tribunal que manejó ese caso. Si no sabe dónde están todos sus récords, el resumen del FBI es una opción nacional basada en huellas; es distinto del DOJ y puede no estar completo.',
    },
    steps: [
      {
        id: 'contact_state_court',
        title: { en: 'Contact the court in the other state', es: 'Contacte al tribunal del otro estado' },
        instruction: {
          en: 'That state\'s court clerk can explain how to get records there, and that state\'s rules decide any record clearing. (A case transferred to Santa Clara is different — ask the Santa Clara Clerk.)',
        },
        method: 'phone',
        officialResources: ['fbi_state_bureaus'],
        factIds: ['out_of_state_contact'],
        tags: ['other_state_court'],
      },
      {
        id: 'fbi_option',
        optional: true,
        title: { en: 'FBI Identity History Summary', es: 'Resumen de historial del FBI' },
        instruction: {
          en: 'You can request your own national summary from the FBI. It\'s separate from California DOJ records and court documents, may not be complete, and doesn\'t decide any legal question.',
        },
        method: 'online',
        officialResources: ['fbi_ihs_faq', 'fbi_edo'],
        factIds: ['fbi_ihs_scope'],
        tags: ['fbi_record'],
      },
      {
        id: 'california_continue',
        title: { en: 'Keep going with your California cases', es: 'Siga con sus casos de California' },
        instruction: { en: 'Steps for any Santa Clara case are elsewhere in this plan.' },
        method: 'information',
        officialResources: [],
      },
    ],
    uncertainties: [
      { text: { en: 'An open case or supervision in another state can affect California options — research flags this for legal review.' } },
      { text: { en: 'FBI pages could not be re-checked by this build; fees and timing are not shown.' }, factIds: ['fbi_ihs_scope'] },
    ],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['ca_legal_help'],
  },
  // ======================================================================= FEDERAL_HANDOFF
  {
    id: 'FEDERAL_HANDOFF',
    category: 'federal_record',
    status: 'outside_jurisdiction',
    shortTitle: { en: 'Federal case: separate federal rules apply', es: 'Caso federal: aplican reglas federales' },
    summary: {
      en: 'Federal cases follow federal law. California\'s dismissal forms (CR-180/CR-181) don\'t apply to federal convictions. Get records from the federal court that handled the case, and talk with a federal defense lawyer about any relief.',
      es: 'Los casos federales siguen la ley federal. Los formularios de California (CR-180/CR-181) no aplican a condenas federales. Pida los registros al tribunal federal y hable con un abogado federal.',
    },
    steps: [
      {
        id: 'federal_clerk',
        title: { en: 'Contact the federal court clerk', es: 'Contacte al secretario del tribunal federal' },
        instruction: {
          en: 'If the case was in the Northern District of California\'s San Jose courthouse, start with that clerk. If it was in another federal court, contact that court.',
        },
        method: 'phone',
        officialResources: ['cand_san_jose'],
        tags: ['federal_court'],
      },
      {
        id: 'federal_defender',
        title: { en: 'Talk with a federal defense lawyer', es: 'Hable con un abogado de defensa federal' },
        instruction: { en: 'The Federal Public Defender may be able to answer questions about federal records and relief.' },
        method: 'phone',
        officialResources: ['ndcal_fpd'],
        tags: ['legal_help'],
      },
      {
        id: 'federal_limits',
        title: { en: 'Know the limits', es: 'Conozca los límites' },
        instruction: {
          en: 'Research found the U.S. DOJ says federal expungement is rare and a presidential pardon does not erase a conviction. Any relief needs case-by-case review.',
        },
        method: 'information',
        officialResources: ['doj_pardon_faq'],
        factIds: ['federal_not_ca_process'],
      },
      {
        id: 'fbi_option',
        optional: true,
        title: { en: 'FBI Identity History Summary', es: 'Resumen del FBI' },
        instruction: { en: 'A national, fingerprint-based summary. It doesn\'t replace court documents or decide eligibility.' },
        method: 'online',
        officialResources: ['fbi_ihs_faq', 'fbi_edo'],
        factIds: ['fbi_ihs_scope'],
        tags: ['fbi_record'],
      },
    ],
    uncertainties: [{ text: { en: 'Federal court and defender contacts come from research marked partly confirmed.' }, factIds: ['federal_not_ca_process'] }],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['ndcal_fpd'],
    places: ['fed_cand_sj', 'fed_fpd_sj'],
  },
  // ======================================================================= JUVENILE_HANDOFF
  {
    id: 'JUVENILE_HANDOFF',
    category: 'other_jurisdiction',
    status: 'avenue_to_explore',
    shortTitle: { en: 'Juvenile case: a separate court and process', es: 'Caso juvenil: un tribunal y proceso aparte' },
    summary: {
      en: 'Juvenile records are kept separately from adult criminal records. In Santa Clara County they\'re at the Juvenile Justice Courthouse, and sealing juvenile records runs through Juvenile Probation. The adult Clerk steps in this tool don\'t apply to juvenile cases.',
      es: 'Los registros juveniles se guardan aparte de los de adultos. En Santa Clara están en el Tribunal de Justicia Juvenil, y el sellado se tramita con Libertad Condicional Juvenil. Los pasos para adultos no aplican.',
    },
    steps: [
      {
        id: 'juvenile_clerk',
        title: { en: 'Contact the Juvenile Clerk\'s Office', es: 'Contacte a la Oficina del Secretario Juvenil' },
        instruction: { en: 'Ask how to request your own juvenile records. Don\'t share confidential details with anyone but the court.' },
        method: 'phone',
        officialResources: ['sc_juvenile_courthouse', 'sc_contacts'],
        factIds: ['juvenile_separate'],
        tags: ['juvenile_court'],
      },
      {
        id: 'request_own',
        title: { en: 'Requesting your own juvenile records', es: 'Cómo pedir sus propios registros juveniles' },
        instruction: {
          en: 'Research found you can ask in person with photo ID, or — if out of town — by written request with a notarized signature, a copy of your ID and a self-addressed stamped envelope.',
        },
        method: 'in_person',
        officialResources: ['sc_juvenile_faqs'],
        factIds: ['juvenile_request_own'],
        accessibilityAlternative: { en: 'Out of town or can\'t travel: use the written, notarized request.' },
      },
      {
        id: 'sealing',
        title: { en: 'Ask Juvenile Probation about record sealing', es: 'Pregunte a Libertad Condicional Juvenil sobre el sellado' },
        instruction: { en: 'Juvenile Probation provides the sealing application and instructions.' },
        method: 'phone',
        officialResources: ['sc_juvenile_faqs'],
        factIds: ['juvenile_separate'],
      },
    ],
    uncertainties: [
      { text: { en: 'If the juvenile case was in another county, contact that county\'s juvenile court instead.' } },
      { text: { en: 'Specific juvenile sealing laws were not reviewed for this demo.' } },
    ],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['sc_legal_help'],
    places: ['sc_juvenile'],
  },
  // ======================================================================= UNKNOWN_JURISDICTION
  {
    id: 'UNKNOWN_JURISDICTION',
    category: 'find_case',
    status: 'more_info_needed',
    shortTitle: { en: 'Not sure where it was handled? Start by narrowing it down', es: '¿No sabe dónde se manejó? Empiece por acotarlo' },
    summary: {
      en: 'That\'s common, and it\'s fine. An arrest, a court case, and a statewide record are different things kept in different places. A few calm steps can usually narrow it down.',
      es: 'Es común y está bien. Un arresto, un caso judicial y un récord estatal son cosas distintas, guardadas en lugares distintos. Unos pasos sencillos suelen ayudar.',
    },
    steps: [
      {
        id: 'terms',
        title: { en: 'Know the difference', es: 'Conozca la diferencia' },
        instruction: {
          en: 'An ARREST is made by police. A COURT CASE exists only if charges were filed; it has a case number. A DOJ record (RAP sheet) is a statewide summary. An FBI summary is national. A police report is something else again.',
        },
        method: 'information',
        officialResources: ['ca_clean_record'],
      },
      {
        id: 'paperwork',
        title: { en: 'Look for any paperwork', es: 'Busque cualquier papel' },
        instruction: { en: 'Citations, release papers, court notices and letters usually name the police agency or the court.' },
        method: 'information',
        officialResources: [],
      },
      {
        id: 'doj_option',
        optional: true,
        title: { en: 'Request your own California DOJ record', es: 'Pida su propio récord del DOJ' },
        instruction: {
          en: 'If you\'re unsure which California counties are involved, a DOJ Record Review can list your statewide history. Fingerprints and a fee are required (a DOJ fee waiver exists).',
        },
        method: 'in_person',
        officialResources: ['doj_record_review', 'doj_fee_waiver'],
        factIds: ['doj_record_review_process'],
        tags: ['doj_record_review'],
      },
      {
        id: 'help',
        title: { en: 'Free legal help can help you sort it out', es: 'La ayuda legal gratuita puede orientarle' },
        instruction: { en: 'A legal helper can help figure out where your records are.' },
        method: 'phone',
        officialResources: ['ca_legal_help', 'sc_legal_help'],
        tags: ['legal_help'],
      },
      {
        id: 'come_back',
        title: { en: 'Once you know the county, come back', es: 'Cuando sepa el condado, regrese' },
        instruction: { en: 'Start over and choose the county to get specific steps.' },
        method: 'information',
        officialResources: [],
      },
    ],
    uncertainties: [{ text: { en: 'An empty search somewhere is not proof that no record exists.' }, factIds: ['sc_index_not_rap_sheet'] }],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['ca_legal_help', 'sc_legal_help'],
  },
  // ======================================================================= OTHER_CA_COUNTY
  {
    id: 'OTHER_CA_COUNTY',
    category: 'other_jurisdiction',
    status: 'outside_jurisdiction',
    shortTitle: { en: 'Another California county: contact that county\'s court', es: 'Otro condado de California: contacte a ese tribunal' },
    summary: {
      en: 'This demo has detailed steps for Santa Clara County only. Each county\'s superior court keeps its own criminal records and has its own search and request process. Statewide self-help information still applies.',
      es: 'Esta demostración tiene pasos detallados solo para Santa Clara. Cada tribunal de condado guarda sus registros y tiene su propio proceso. La información estatal de autoayuda sigue aplicando.',
    },
    steps: [
      {
        id: 'find_court',
        title: { en: 'Find that county\'s superior court', es: 'Encuentre el tribunal superior de ese condado' },
        instruction: { en: 'Look for its criminal records or criminal division page, and ask how to find a case number and request copies.' },
        method: 'online',
        officialResources: ['ca_courts_find'],
        tags: ['other_county_court'],
      },
      {
        id: 'statewide',
        title: { en: 'Statewide record-clearing information', es: 'Información estatal sobre limpieza de récord' },
        instruction: { en: 'State self-help pages and Judicial Council forms are the same in every California county.' },
        method: 'information',
        officialResources: ['ca_clean_record'],
      },
      {
        id: 'planned',
        optional: true,
        title: { en: 'San Francisco and Alameda guides are planned', es: 'Guías para San Francisco y Alameda en preparación' },
        instruction: { en: 'They aren\'t available yet, so this tool doesn\'t show their procedures.' },
        method: 'information',
        officialResources: ['sf_court', 'alameda_court'],
      },
    ],
    uncertainties: [{ text: { en: 'We have not researched this county\'s procedures.' } }],
    fallbacks: [{ text: FREE_HELP_FALLBACK }],
    legalHelpReferralIds: ['ca_legal_help'],
  },
  // ======================================================================= IMMIGRATION_COUNSEL
  {
    id: 'IMMIGRATION_COUNSEL',
    category: 'legal_help',
    status: 'legal_review_recommended',
    shortTitle: { en: 'Immigration: talk to an immigration-qualified lawyer first', es: 'Inmigración: hable primero con un abogado de inmigración' },
    summary: {
      en: 'A criminal record can affect immigration status, and cleaning a record under California law does not necessarily remove immigration consequences. Talk to an immigration-qualified lawyer before filing anything. Getting copies of your own records is still fine.',
      es: 'Un récord penal puede afectar el estatus migratorio, y limpiarlo bajo la ley de California no necesariamente elimina esas consecuencias. Hable con un abogado de inmigración antes de presentar algo. Obtener copias de sus registros sigue siendo posible.',
    },
    steps: [
      {
        id: 'read_page',
        title: { en: 'Read the official page for non-citizens', es: 'Lea la página oficial para personas no ciudadanas' },
        instruction: { en: 'California Courts explains how criminal records and record cleaning interact with immigration.' },
        method: 'information',
        officialResources: ['ca_non_citizens'],
        factIds: ['immigration_caution'],
      },
      {
        id: 'find_counsel',
        title: { en: 'Find immigration-qualified legal help', es: 'Busque ayuda legal de inmigración' },
        instruction: { en: 'Ask a legal aid group or the Public Defender for a referral to someone who handles both criminal and immigration issues.' },
        method: 'phone',
        officialResources: ['ca_legal_help', 'sc_legal_help'],
        tags: ['immigration_counsel', 'legal_help'],
      },
    ],
    uncertainties: [{ text: { en: 'This tool can\'t assess immigration consequences.' } }],
    legalHelpReferralIds: ['ca_legal_help', 'sc_legal_help'],
  },
  // ======================================================================= SPECIALIZED_REVIEW
  {
    id: 'SPECIALIZED_REVIEW',
    category: 'legal_help',
    status: 'legal_review_recommended',
    shortTitle: { en: 'Special rules may apply — get legal review', es: 'Pueden aplicar reglas especiales: busque revisión legal' },
    summary: {
      en: 'Some situations — such as a state prison sentence, firearm rights, sex-offense registration or professional licensing — follow special rules that general dismissal information may not cover. A lawyer or legal aid group should review them.',
      es: 'Algunas situaciones (prisión estatal, armas, registro o licencias profesionales) siguen reglas especiales. Un abogado debe revisarlas.',
    },
    steps: [
      {
        id: 'felony_page',
        when: { q: 'state_prison', in: ['yes', 'unknown'] },
        title: { en: 'Read the official felony overview', es: 'Lea la guía oficial sobre delitos graves' },
        instruction: { en: 'Cases with a state prison sentence can involve different statutes and exceptions.' },
        method: 'information',
        officialResources: ['ca_felony'],
      },
      {
        id: 'review',
        title: { en: 'Ask for a legal review', es: 'Pida una revisión legal' },
        instruction: { en: 'Bring your case documents to the Public Defender or a legal aid group and ask about your specific goal.' },
        method: 'phone',
        officialResources: ['sc_pd_post_conviction', 'ca_legal_help'],
        tags: ['legal_help'],
      },
    ],
    uncertainties: [{ text: { en: 'Ordinary dismissal or sealing doesn\'t automatically resolve these issues.' } }],
    legalHelpReferralIds: ['sc_pd_post_conviction', 'ca_legal_help'],
  },
  // ======================================================================= CLEARANCE_MORE_INFO_NEEDED
  {
    id: 'CLEARANCE_MORE_INFO_NEEDED',
    category: 'legal_help',
    status: 'more_info_needed',
    shortTitle: { en: 'First, find out how the case ended', es: 'Primero, averigüe cómo terminó el caso' },
    summary: {
      en: 'Which record-clearing process (if any) might be worth exploring depends on how the case ended — for example, whether there was a conviction. The court\'s docket or a minute order can tell you. Get that first, then review the official options.',
      es: 'Qué proceso explorar depende de cómo terminó el caso, por ejemplo si hubo condena. El registro del tribunal puede decírselo. Obténgalo primero.',
    },
    steps: [
      {
        id: 'get_outcome',
        title: { en: 'Get the docket or final minute order', es: 'Obtenga el registro o la minuta final' },
        instruction: { en: 'These show how the case ended. See the records steps in this plan.' },
        method: 'information',
        officialResources: ['sc_case_info_online'],
        factIds: ['sc_copy_fee'],
      },
      {
        id: 'overview',
        title: { en: 'Read the state\'s overview of options', es: 'Lea el resumen estatal de opciones' },
        instruction: { en: 'Arrests without a conviction and convictions have different processes.' },
        method: 'information',
        officialResources: ['ca_clean_record', 'ca_arrest_no_conviction'],
      },
      {
        id: 'help',
        title: { en: 'Free legal help can read the records with you', es: 'La ayuda legal gratuita puede revisar los registros con usted' },
        instruction: { en: 'A legal helper can explain what the documents mean.' },
        method: 'phone',
        officialResources: ['sc_pd_post_conviction', 'ca_legal_help'],
        tags: ['legal_help'],
      },
    ],
    legalHelpReferralIds: ['sc_pd_post_conviction', 'ca_legal_help'],
    places: ['filing_courthouse'],
  },
  // ======================================================================= THIRD_PARTY_NOT_SUPPORTED
  {
    id: 'THIRD_PARTY_NOT_SUPPORTED',
    category: 'other_jurisdiction',
    status: 'outside_jurisdiction',
    shortTitle: { en: 'This tool doesn\'t look up other people', es: 'Esta herramienta no busca a otras personas' },
    summary: {
      en: 'Rap Sheet Finder only helps people with their own records, or helpers working with someone\'s permission. Official offices limit who can get some records — for example, California DOJ processes Record Review requests only for the person themselves.',
      es: 'Rap Sheet Finder solo ayuda con récords propios o a quien ayuda con permiso. Las oficinas oficiales limitan quién puede obtener algunos registros.',
    },
    steps: [
      {
        id: 'own_only',
        title: { en: 'Record reviews are for the person themselves', es: 'Las revisiones de récord son para la propia persona' },
        instruction: { en: 'The California DOJ says third-party Record Review requests are not processed.' },
        method: 'information',
        officialResources: ['doj_record_review'],
        factIds: ['doj_record_review_process'],
      },
      {
        id: 'helper',
        title: { en: 'Helping someone with permission?', es: '¿Ayuda a alguien con su permiso?' },
        instruction: { en: 'Start over and choose "I\'m helping someone, with their permission." The person will still need to make some requests themselves.' },
        method: 'information',
        officialResources: [],
      },
      {
        id: 'background_checks',
        title: { en: 'Background checks have their own rules', es: 'Las verificaciones de antecedentes tienen sus propias reglas' },
        instruction: { en: 'Employers and landlords must follow the laws that apply to background checks. That\'s outside what this tool does.' },
        method: 'information',
        officialResources: ['sc_case_info_online'],
      },
    ],
    legalHelpReferralIds: [],
  },
  // ======================================================================= CANNOT_DETERMINE
  {
    id: 'CANNOT_DETERMINE',
    category: 'legal_help',
    status: 'more_info_needed',
    shortTitle: { en: 'We couldn\'t narrow this down — here\'s where to start', es: 'No pudimos acotarlo: por aquí puede empezar' },
    summary: {
      en: 'Based on your answers we can\'t point to one route, so here are the official starting points and free help.',
      es: 'Con sus respuestas no podemos indicar una ruta, así que estos son puntos de partida oficiales y ayuda gratuita.',
    },
    steps: [
      {
        id: 'clerk',
        title: { en: 'Ask the Santa Clara court Clerk', es: 'Pregunte al Secretario del tribunal de Santa Clara' },
        instruction: { en: 'For Santa Clara County cases, the Clerk\'s Office can explain how to find a case and request records.' },
        method: 'phone',
        officialResources: ['sc_contacts', 'sc_criminal_records'],
        factIds: ['sc_clerk_hours'],
      },
      {
        id: 'overview',
        title: { en: 'Read the state\'s record-clearing overview', es: 'Lea el resumen estatal' },
        instruction: { en: 'It explains the main options in plain language.' },
        method: 'information',
        officialResources: ['ca_clean_record'],
      },
      {
        id: 'help',
        title: { en: 'Contact free legal help', es: 'Contacte ayuda legal gratuita' },
        instruction: { en: 'A legal helper can look at your situation.' },
        method: 'phone',
        officialResources: ['ca_legal_help', 'sc_legal_help'],
        tags: ['legal_help'],
      },
    ],
    legalHelpReferralIds: ['ca_legal_help', 'sc_legal_help'],
  },
];

export const OUTCOME_BY_ID: Record<string, OutcomeDef> = Object.fromEntries(OUTCOMES.map((o) => [o.id, o]));

export function getOutcome(id: string): OutcomeDef {
  const o = OUTCOME_BY_ID[id];
  if (!o) throw new Error(`Unknown outcome id: ${id}`);
  return o;
}

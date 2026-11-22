import type { Place } from '../../domain/types';
import type { JurisdictionAdapter } from './types';

/**
 * Santa Clara County adapter (ACTIVE).
 * Addresses/phones re-checked against santaclara.courts.ca.gov on 2026-11-22 where noted.
 * NEVER add a records-counter floor, room or window here unless the court publishes it.
 */

const HOJ: Place = {
  id: 'sc_hoj',
  name: { en: 'Hall of Justice (HOJ) — Criminal Clerk\'s Office', es: 'Hall of Justice (HOJ) — Oficina del Secretario Penal' },
  kind: 'court',
  streetAddress: '190-200 West Hedding Street, San Jose, CA 95110',
  mailingAddress: '191 N. First Street, San Jose, CA 95113',
  phones: [
    { label: { en: 'Criminal Clerk', es: 'Secretario penal' }, number: '408-808-6611' },
    { label: { en: 'TDD / ADA', es: 'TDD / ADA' }, number: '408-808-6626', tty: true },
  ],
  emails: ['sscriminalrecords@scscourt.org', 'sscriminfo@scscourt.org'],
  hoursFactId: 'sc_clerk_hours',
  unknowns: [
    {
      en: 'Records counter floor / room / window: not published online. HOJ has East and West buildings — call the Clerk to ask where to go.',
      es: 'Piso / sala / ventanilla del mostrador: no publicado. HOJ tiene edificios Este y Oeste; llame al Secretario.',
    },
  ],
  notes: [
    { en: 'Mail goes to the mailing address (191 N. First St.), not the street address.', es: 'El correo va a la dirección postal (191 N. First St.), no a la dirección física.' },
    { en: 'Lobby drop box, Mon–Fri 8:00 a.m.–5:00 p.m. Paid parking in the Civic Center garage; transit help at 511.org.', es: 'Buzón en el vestíbulo, lun–vie 8:00–17:00. Estacionamiento de pago en el garaje del Civic Center; transporte: 511.org.' },
  ],
  sourceIds: ['sc_hoj', 'sc_contacts', 'sc_criminal_records'],
  status: 'verified',
};

const PALO_ALTO: Place = {
  id: 'sc_palo_alto',
  name: { en: 'Palo Alto Courthouse — Clerk\'s Office', es: 'Tribunal de Palo Alto — Oficina del Secretario' },
  kind: 'court',
  streetAddress: '270 Grant Avenue, Palo Alto, CA 94306',
  phones: [
    { label: { en: 'Clerk', es: 'Secretario' }, number: '650-462-3810' },
    { label: { en: 'TDD / ADA', es: 'TDD / ADA' }, number: '650-470-3921', tty: true },
  ],
  emails: ['sscriminfo@scscourt.org'],
  hoursFactId: 'sc_clerk_hours',
  unknowns: [
    { en: 'Records counter room / window: not published online. Call before you go.', es: 'Sala / ventanilla: no publicado. Llame antes de ir.' },
  ],
  sourceIds: ['sc_contacts', 'sc_criminal_records'],
  status: 'verified',
};

const SOUTH_COUNTY: Place = {
  id: 'sc_south_county',
  name: { en: 'South County Courthouse (Morgan Hill) — Clerk\'s Office', es: 'Tribunal de South County (Morgan Hill) — Oficina del Secretario' },
  kind: 'court',
  streetAddress: '301 Diana Avenue, Morgan Hill, CA 95037',
  phones: [
    { label: { en: 'Clerk', es: 'Secretario' }, number: '408-695-5014' },
    { label: { en: 'TDD / ADA', es: 'TDD / ADA' }, number: '408-695-5199', tty: true },
  ],
  emails: ['sscriminfo@scscourt.org'],
  hoursFactId: 'sc_clerk_hours',
  unknowns: [
    { en: 'Records counter room / window: not published online. Call before you go.', es: 'Sala / ventanilla: no publicado. Llame antes de ir.' },
  ],
  sourceIds: ['sc_contacts', 'sc_criminal_records'],
  status: 'verified',
};

const JUVENILE: Place = {
  id: 'sc_juvenile',
  name: { en: 'Juvenile Justice Courthouse — Clerk\'s Office', es: 'Tribunal de Justicia Juvenil — Oficina del Secretario' },
  kind: 'court',
  streetAddress: '840 Guadalupe Parkway, San Jose, CA 95110',
  mailingAddress: '191 N. First Street, San Jose, CA 95113',
  phones: [
    { label: { en: 'Juvenile Clerk', es: 'Secretario juvenil' }, number: '408-808-6211' },
    { label: { en: 'TDD / ADA', es: 'TDD / ADA' }, number: '408-808-6262', tty: true },
    { label: { en: 'Juvenile Probation (record sealing info)', es: 'Libertad Condicional Juvenil (sellado)' }, number: '408-278-5800' },
  ],
  emails: ['ssjuvinfo@scscourt.org'],
  hoursFactId: 'sc_clerk_hours',
  unknowns: [{ en: 'Separate building from the Hall of Justice. Confirm where to go before visiting.', es: 'Edificio distinto del Hall of Justice. Confirme antes de ir.' }],
  sourceIds: ['sc_contacts', 'sc_juvenile_courthouse', 'sc_juvenile_faqs'],
  status: 'partial',
};

const PROBATION: Place = {
  id: 'sc_probation',
  name: { en: 'Probation Dept. — Adult Services, Attn: Record Clearance', es: 'Libertad Condicional — Servicios para Adultos, Limpieza de Récord' },
  kind: 'probation',
  streetAddress: '2314 North First Street, San Jose, CA 95131',
  phones: [
    { label: { en: 'Record Clearance', es: 'Limpieza de récord' }, number: '408-435-2061' },
    { label: { en: 'Probation main line', es: 'Línea principal' }, number: '408-435-2000' },
  ],
  unknowns: [
    { en: 'This is NOT the court Clerk\'s Office. Its application service is for certain recently discharged Probation clients — call first.', es: 'NO es la oficina del Secretario del tribunal. Llame primero.' },
  ],
  sourceIds: ['sc_probation_clearance', 'sc_criminal_faqs'],
  status: 'partial',
};

const PUBLIC_DEFENDER: Place = {
  id: 'sc_pd_reentry',
  name: { en: 'Public Defender — Reentry Expungement Program (Re-entry Resource Center)', es: 'Defensoría Pública — Programa de Reingreso' },
  kind: 'legal_help',
  streetAddress: '151 W. Mission Street, San Jose, CA 95110',
  phones: [
    { label: { en: 'Program intake', es: 'Admisión' }, number: '408-535-4290' },
    { label: { en: 'Public Defender main office', es: 'Oficina principal' }, number: '408-299-7700' },
  ],
  unknowns: [{ en: 'Financial eligibility rules apply. Call to confirm current intake.', es: 'Aplican requisitos económicos. Llame para confirmar.' }],
  sourceIds: ['sc_pd_post_conviction', 'sc_probation_clearance', 'sc_criminal_faqs'],
  status: 'partial',
};

const FEDERAL_SJ: Place = {
  id: 'fed_cand_sj',
  name: { en: 'U.S. District Court (N.D. Cal.) — San Jose Clerk', es: 'Tribunal de Distrito de EE. UU. (N.D. Cal.) — San José' },
  kind: 'federal_court',
  streetAddress: 'Robert F. Peckham Federal Building, 280 South 1st Street, San Jose, CA 95113',
  phones: [{ label: { en: 'Clerk', es: 'Secretario' }, number: '408-535-5363' }],
  unknowns: [{ en: 'Only for cases filed in this federal court. Confirm details on the court\'s website.', es: 'Solo para casos de este tribunal federal.' }],
  notes: [{ en: 'Research lists the clerk at Room 2112 (2nd floor); confirm before visiting.', es: 'La investigación indica Sala 2112 (2.º piso); confirme.' }],
  sourceIds: ['cand_san_jose'],
  status: 'partial',
};

const FEDERAL_PD: Place = {
  id: 'fed_fpd_sj',
  name: { en: 'Federal Public Defender (N.D. Cal.) — San Jose', es: 'Defensoría Pública Federal (N.D. Cal.) — San José' },
  kind: 'federal_defender',
  streetAddress: '55 South Market Street, Suite 820, San Jose, CA 95113',
  phones: [{ label: { en: 'Office', es: 'Oficina' }, number: '408-291-7753' }],
  unknowns: [{ en: 'Ask whether they can help with your type of federal record question.', es: 'Pregunte si pueden ayudar con su consulta.' }],
  sourceIds: ['ndcal_fpd'],
  status: 'partial',
};

export const SANTA_CLARA: JurisdictionAdapter = {
  id: 'santa_clara',
  name: { en: 'Santa Clara County', es: 'Condado de Santa Clara' },
  status: 'active',
  courtResourceId: 'sc_criminal_records',
  places: [HOJ, PALO_ALTO, SOUTH_COUNTY, JUVENILE, PROBATION, PUBLIC_DEFENDER, FEDERAL_SJ, FEDERAL_PD],
  courthouseOptionToPlace: { hoj: 'sc_hoj', palo_alto: 'sc_palo_alto', south_county: 'sc_south_county' },
  areaToCourthouse: { central: 'sc_hoj', north: 'sc_palo_alto', south: 'sc_south_county' },
  onlineIndexFromYear: 2004,
  notes: {
    en: 'Active adapter. Facts re-checked 2026-11-22 where the source registry says so.',
    es: 'Adaptador activo.',
  },
};

export const PLACE_BY_ID: Record<string, Place> = Object.fromEntries(SANTA_CLARA.places.map((p) => [p.id, p]));
export const SC_COURTHOUSE_IDS = ['sc_hoj', 'sc_palo_alto', 'sc_south_county'];

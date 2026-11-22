/* Validates the decision graph. Exits non-zero on any error. Usage: npm run validate:graph */
import { validateGraph } from '../src/domain/validate';

const started = Date.now();
const report = validateGraph();
console.log('Rap Sheet Finder — decision graph validation');
console.log(JSON.stringify(report.stats, null, 2));
console.log(`Outcomes reached: ${[...report.reachedOutcomes].sort().join(', ')}`);
for (const w of report.warnings) console.log(`WARN  ${w}`);
for (const e of report.errors.slice(0, 50)) console.log(`ERROR ${e}`);
if (report.errors.length > 50) console.log(`... ${report.errors.length - 50} more errors`);
console.log(`Done in ${Date.now() - started} ms — ${report.errors.length} error(s), ${report.warnings.length} warning(s).`);
process.exit(report.errors.length ? 1 : 0);

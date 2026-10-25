/* Smoke test: seed globals, create a user, exercise core data paths. */

import { getDb, seedForUser } from '../lib/db/index';
import { searchOpportunities, getFacets, getOpportunityById, getCountsByStatus, getRecentQueries, saveSearchRecord } from '../lib/data/search';
import { listMonitors, createMonitor } from '../lib/data/monitors';
import { listCollections } from '../lib/data/collections';
import { listNotifications, countUnread } from '../lib/data/activity';
import { getKpis, getDiscoveries, getMarketVsListing, getTopMovers, getCategoryTrends } from '../lib/data/analytics';
import { getPlanForUser } from '../lib/data/misc';
import { createSessionValue, verifySessionValue } from '../lib/auth/session';
import { hashPassword, verifyPassword } from '../lib/auth/password';

const db = getDb();
db.exec('DELETE FROM users'); // fresh user table for the smoke run
const uid = 'usr-smoke-test-1';
db.prepare('INSERT OR REPLACE INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(
  uid, 'smoke@example.com', hashPassword('password123')
);
db.prepare('INSERT OR REPLACE INTO profiles (id, email, full_name) VALUES (?, ?, ?)').run(uid, 'smoke@example.com', 'Smoke Tester');
seedForUser(db, uid, 'pro');

const t = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`);
  if (!cond) process.exitCode = 1;
};

const oppCount = (db.prepare('SELECT COUNT(*) n FROM opportunities').get() as { n: number }).n;
t(`48 opportunities seeded (got ${oppCount})`, oppCount === 48);
const reCount = (db.prepare("SELECT COUNT(*) n FROM opportunities WHERE category='real_estate'").get() as { n: number }).n;
t(`>=10 real estate (got ${reCount})`, reCount >= 10);
const historyCount = (db.prepare('SELECT COUNT(*) n FROM price_history').get() as { n: number }).n;
t(`>=100 price history rows (got ${historyCount})`, historyCount >= 100);

const search = searchOpportunities(uid, { q: 'berlin', per_page: 10 });
t(`search "berlin" returns rows (${search.count})`, search.count > 0);
const search2 = searchOpportunities(uid, { category: 'watches', price_drop_only: true });
t(`watch price drops (${search2.count})`, search2.count > 0);
const search3 = searchOpportunities(uid, { category: 'real_estate', yield_min: 4, price_max: 400000 });
t(`real estate yield>=4 (count ${search3.count})`, search3.count > 0);
const empty = searchOpportunities(uid, { q: 'zzz-no-such-thing' });
t(`impossible query empty (${empty.count})`, empty.count === 0);

const facets = getFacets(uid);
t(`facets cities (${facets.cities.join(',')})`, facets.cities.length > 0);
const opp = getOpportunityById(uid, 'opp-001');
t('opp-001 detail with real_estate', !!opp?.real_estate && opp.real_estate.city === 'Berlin');
const counts = getCountsByStatus(uid);
t(`status counts all=${counts.all}`, counts.all > 40);

const monitors = listMonitors(uid);
t(`6 monitors seeded (${monitors.length})`, monitors.length === 6);
const created = createMonitor(uid, {
  name: 'Test monitor', description: 'A monitor created by the smoke test.', category: 'electronics',
  criteria: { keywords: ['test'], excluded_terms: [], required_attributes: {} },
  sensitivity: 'balanced', frequency_minutes: 30, notify_in_app: true, notify_email: false,
  digest_mode: false, price_drop_only: false,
});
t('monitor CRUD create', !!created.id);

const collections = listCollections(uid);
t(`4 collections (${collections.map(c=>c.name).join('|')})`, collections.length === 4 && collections.every(c => (c.item_count ?? 0) > 0));
const notifs = listNotifications(uid);
const unread = countUnread(uid);
t(`15 notifications, 5 unread (${notifs.length}/${unread})`, notifs.length === 15 && unread === 5);

const kpis = getKpis(uid, 20);
console.log('KPIs:', JSON.stringify(kpis));
t('kpis computed', kpis.active_monitors > 0 && kpis.estimated_savings > 0);
const discoveries = getDiscoveries(uid, 30);
t(`discoveries series (${discoveries.length} days)`, discoveries.length >= 10);
const mvl = getMarketVsListing(uid);
t(`market vs listing (${mvl.length} categories)`, mvl.length === 5);
const movers = getTopMovers(uid);
t(`top movers (${movers.length})`, movers.length >= 5);
const trends = getCategoryTrends(uid);
t(`category trends (${trends.length})`, trends.length === 5);

const plan = getPlanForUser(uid);
t(`plan pro for demo (${plan?.plan.name})`, plan?.plan.code === 'pro');

saveSearchRecord(uid, 'omega seamaster', 'watches');
t(`recent queries (${getRecentQueries(uid).join('|')})`, getRecentQueries(uid).includes('omega seamaster'));

void (async () => {
  const sessionValue = await createSessionValue(uid);
  const payload = await verifySessionValue(sessionValue);
  t('session roundtrip', payload?.uid === uid);
  t('bad session rejected', (await verifySessionValue(sessionValue + 'x')) === null);
  t('password roundtrip', verifyPassword('password123', hashPassword('password123')));
  t('wrong password rejected', !verifyPassword('nope', hashPassword('password123')));
  console.log('SMOKE DONE');
})();

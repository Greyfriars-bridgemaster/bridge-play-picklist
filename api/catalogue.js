// GET /api/catalogue  - everything in one go (public), for pages that show lessons, infographics and boards together.
// Also says which stores are switched on (ready), the seasons in use, and the current season.
import { json, readIndex, withUrl, seasonOf, currentSeason } from '../_lib/common.js';

export async function onRequestGet({ env }) {
  const [lessons, infographics, sets] = await Promise.all([
    env.LESSONS ? readIndex(env.LESSONS) : [],
    env.INFOGRAPHICS ? readIndex(env.INFOGRAPHICS) : [],
    env.BOARDS ? readIndex(env.BOARDS) : []
  ]);
  const boards = sets.map(s => ({ ...s, season: s.season || seasonOf(s.date), lessonId: s.lessonId || null }));
  const now = currentSeason();
  const seen = { [now]: 1 };
  [lessons, infographics, boards].forEach(l => l.forEach(i => { if (i.season) seen[i.season] = 1; }));
  return json({
    currentSeason: now,
    seasons: Object.keys(seen).sort().reverse(),
    ready: { boards: !!env.BOARDS, lessons: !!env.LESSONS, infographics: !!env.INFOGRAPHICS, schedules: !!env.SCHEDULES },
    lessons: withUrl('lessons', lessons),
    infographics: withUrl('infographics', infographics),
    sets: boards
  });
}

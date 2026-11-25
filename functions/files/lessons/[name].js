import { serveFile } from '../../_lib/serve.js';
export const onRequestGet = serveFile('LESSONS', 'lessons');

import { jsonResponse, checkAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (checkAdmin(context.env, body.pin)) {
      return jsonResponse({ ok: true });
    }
    return jsonResponse({ ok: false, error: 'PIN 错误' }, 403);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

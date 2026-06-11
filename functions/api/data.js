import { getData, jsonResponse } from './_lib.js';

export async function onRequestGet(context) {
  try {
    const data = await getData(context.env);
    return jsonResponse({ ok: true, data: data });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

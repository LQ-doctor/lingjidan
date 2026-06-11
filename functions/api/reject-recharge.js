import { getData, saveData, jsonResponse, checkAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (!checkAdmin(context.env, body.pin)) {
      return jsonResponse({ ok: false, error: 'PIN 错误，需要管理员确认' }, 403);
    }

    const data = await getData(context.env);
    const idx = data.pending.findIndex(function(p) { return p.id === body.pendingId; });
    if (idx === -1) return jsonResponse({ ok: false, error: '该申请不存在或已处理' }, 404);

    const removed = data.pending.splice(idx, 1)[0];
    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data, userName: removed.userName });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

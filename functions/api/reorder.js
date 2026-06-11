import { getData, saveData, jsonResponse, checkAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (!checkAdmin(context.env, body.pin)) {
      return jsonResponse({ ok: false, error: 'PIN 错误，只有琉Q可以调整顺序' }, 403);
    }

    const order = Array.isArray(body.order) ? body.order : null;
    if (!order) return jsonResponse({ ok: false, error: '顺序数据不正确' }, 400);

    const data = await getData(context.env);
    const byId = {};
    data.users.forEach(function(u) { byId[u.id] = u; });

    const reordered = [];
    const seen = {};
    order.forEach(function(id) {
      if (byId[id] && !seen[id]) {
        reordered.push(byId[id]);
        seen[id] = true;
      }
    });
    // 安全兜底：把没在 order 里出现的小伙伴追加到末尾，避免丢人
    data.users.forEach(function(u) {
      if (!seen[u.id]) reordered.push(u);
    });

    data.users = reordered;
    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

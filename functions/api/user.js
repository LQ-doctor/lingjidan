import { getData, saveData, jsonResponse, genId, checkAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (!checkAdmin(context.env, body.pin)) {
      return jsonResponse({ ok: false, error: 'PIN 错误，只有琉Q可以添加小伙伴' }, 403);
    }

    const name = (body.name == null ? '' : String(body.name)).trim();
    if (!name) return jsonResponse({ ok: false, error: '请输入名字' }, 400);
    if (name.length > 20) return jsonResponse({ ok: false, error: '名字太长啦（最多 20 个字）' }, 400);

    const data = await getData(context.env);
    const dup = data.users.some(function(u) { return u.name === name; });
    if (dup) return jsonResponse({ ok: false, error: '已经有同名的小伙伴啦' }, 400);

    data.users.push({
      id: genId(),
      name: name,
      balance: 0,
      totalRecharge: 0,
      totalClaim: 0,
      colorIdx: data.users.length
    });

    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

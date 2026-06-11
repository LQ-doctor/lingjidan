import { getData, saveData, jsonResponse, genId, RATE } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const money = parseFloat(body.money);
    if (!money || money <= 0) {
      return jsonResponse({ ok: false, error: '请输入正确的金额' }, 400);
    }
    const eggs = Math.floor(money * RATE);
    if (eggs <= 0) {
      return jsonResponse({ ok: false, error: '金额太少，至少要能换 1 个鸡蛋' }, 400);
    }

    const data = await getData(context.env);
    const user = data.users.find(function(u) { return u.id === body.userId; });
    if (!user) return jsonResponse({ ok: false, error: '找不到该小伙伴' }, 404);

    data.pending.unshift({
      id: genId(),
      userId: user.id,
      userName: user.name,
      money: money,
      eggs: eggs,
      requestedBy: (body.requestedBy ? String(body.requestedBy) : '').slice(0, 30),
      time: Date.now()
    });

    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data, userName: user.name, eggs: eggs });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

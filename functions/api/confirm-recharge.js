import { getData, saveData, jsonResponse, genId, checkAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (!checkAdmin(context.env, body.pin)) {
      return jsonResponse({ ok: false, error: 'PIN 错误，需要管理员确认' }, 403);
    }

    const data = await getData(context.env);
    const idx = data.pending.findIndex(function(p) { return p.id === body.pendingId; });
    if (idx === -1) return jsonResponse({ ok: false, error: '该申请不存在或已处理' }, 404);

    const req = data.pending[idx];
    const user = data.users.find(function(u) { return u.id === req.userId; });
    if (!user) {
      data.pending.splice(idx, 1);
      await saveData(context.env, data);
      return jsonResponse({ ok: false, error: '对应小伙伴已不存在，申请已移除' }, 404);
    }

    user.balance += req.eggs;
    user.totalRecharge += req.eggs;
    data.history.unshift({
      id: genId(),
      type: 'recharge',
      userId: user.id,
      userName: user.name,
      amount: req.eggs,
      money: req.money,
      time: Date.now(),
      requestedBy: req.requestedBy || ''
    });
    data.pending.splice(idx, 1);

    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data, userName: user.name, eggs: req.eggs });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

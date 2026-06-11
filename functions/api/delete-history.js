import { getData, saveData, jsonResponse, checkAdmin } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (!checkAdmin(context.env, body.pin)) {
      return jsonResponse({ ok: false, error: 'PIN 错误，只有琉Q可以删除记录' }, 403);
    }

    const data = await getData(context.env);
    const idx = data.history.findIndex(function(h) { return h.id === body.historyId; });
    if (idx === -1) return jsonResponse({ ok: false, error: '该记录不存在' }, 404);

    const h = data.history[idx];
    const user = data.users.find(function(u) { return u.id === h.userId; });
    if (user) {
      if (h.type === 'recharge') {
        // 撤销充值：扣回余额与累计充值
        user.balance -= h.amount;
        user.totalRecharge -= h.amount;
      } else if (h.type === 'claim') {
        // 撤销领取：把鸡蛋还回余额，并减少累计领取
        user.balance += h.amount;
        user.totalClaim -= h.amount;
      }
      if (user.balance < 0) user.balance = 0;
      if (user.totalRecharge < 0) user.totalRecharge = 0;
      if (user.totalClaim < 0) user.totalClaim = 0;
    }

    data.history.splice(idx, 1);
    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

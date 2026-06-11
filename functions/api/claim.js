import { getData, saveData, jsonResponse, genId } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const amount = parseInt(body.amount, 10);
    if (!amount || amount <= 0) {
      return jsonResponse({ ok: false, error: '请输入正确的数量' }, 400);
    }

    const data = await getData(context.env);
    const user = data.users.find(function(u) { return u.id === body.userId; });
    if (!user) return jsonResponse({ ok: false, error: '找不到该小伙伴' }, 404);

    if (amount > user.balance) {
      return jsonResponse({ ok: false, error: '余额不足，当前只剩 ' + user.balance + ' 个鸡蛋' }, 400);
    }

    user.balance -= amount;
    user.totalClaim += amount;
    data.history.unshift({
      id: genId(),
      type: 'claim',
      userId: user.id,
      userName: user.name,
      amount: amount,
      time: Date.now()
    });

    await saveData(context.env, data);
    return jsonResponse({ ok: true, data: data, userName: user.name });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

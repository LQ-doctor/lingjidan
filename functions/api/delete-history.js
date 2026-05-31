// Cloudflare Pages Function: POST /api/delete-history
// 删除历史记录（同步调整余额）

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { historyId } = body;

    if (!historyId) {
      return jsonResponse({ ok: false, error: '参数错误' }, 400);
    }

    const raw = await env.LINGJIDAN.get('data');
    const data = raw ? JSON.parse(raw) : { users: [], history: [] };

    const idx = data.history.findIndex(h => h.id === historyId);
    if (idx < 0) {
      return jsonResponse({ ok: false, error: '记录不存在' }, 404);
    }

    const h = data.history[idx];
    const user = data.users.find(u => u.id === h.userId);

    if (user) {
      if (h.type === 'recharge') {
        user.balance -= h.amount;
        user.totalRecharge -= h.amount;
        if (user.balance < 0) user.balance = 0;
        if (user.totalRecharge < 0) user.totalRecharge = 0;
      } else {
        user.balance += h.amount;
        user.totalClaim -= h.amount;
        if (user.totalClaim < 0) user.totalClaim = 0;
      }
    }

    data.history.splice(idx, 1);
    data.updatedAt = Date.now();
    await env.LINGJIDAN.put('data', JSON.stringify(data));

    return jsonResponse({ ok: true, data });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

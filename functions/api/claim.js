// Cloudflare Pages Function: POST /api/claim
// 登记领取鸡蛋

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || !amount || amount <= 0) {
      return jsonResponse({ ok: false, error: '参数错误' }, 400);
    }

    const raw = await env.LINGJIDAN.get('data');
    const data = raw ? JSON.parse(raw) : { users: [], history: [] };

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return jsonResponse({ ok: false, error: '用户不存在' }, 404);
    }

    if (amount > user.balance) {
      return jsonResponse({ ok: false, error: `余额不足！只有 ${user.balance} 个` }, 400);
    }

    user.balance -= amount;
    user.totalClaim += amount;

    data.history.unshift({
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: 'claim',
      userId: user.id,
      userName: user.name,
      amount: amount,
      time: Date.now()
    });

    data.updatedAt = Date.now();
    await env.LINGJIDAN.put('data', JSON.stringify(data));

    return jsonResponse({ ok: true, data, userName: user.name });
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

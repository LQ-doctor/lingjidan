// Cloudflare Pages Function: POST /api/recharge
// 给用户充值

const RATE = 1.5; // 2元 = 3个

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { userId, money } = body;

    if (!userId || !money || money <= 0) {
      return jsonResponse({ ok: false, error: '参数错误' }, 400);
    }

    const eggs = Math.floor(money * RATE);
    if (eggs <= 0) {
      return jsonResponse({ ok: false, error: '金额太少' }, 400);
    }

    const raw = await env.LINGJIDAN.get('data');
    const data = raw ? JSON.parse(raw) : { users: [], history: [] };

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return jsonResponse({ ok: false, error: '用户不存在' }, 404);
    }

    user.balance += eggs;
    user.totalRecharge += eggs;

    data.history.unshift({
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: 'recharge',
      userId: user.id,
      userName: user.name,
      amount: eggs,
      money: money,
      time: Date.now()
    });

    data.updatedAt = Date.now();
    await env.LINGJIDAN.put('data', JSON.stringify(data));

    return jsonResponse({ ok: true, data, eggs, userName: user.name });
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

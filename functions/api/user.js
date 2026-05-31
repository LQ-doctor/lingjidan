// Cloudflare Pages Function: POST /api/user
// 添加新用户

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return jsonResponse({ ok: false, error: '名字不能为空' }, 400);
    }

    const trimmedName = name.trim().slice(0, 20);
    const raw = await env.LINGJIDAN.get('data');
    const data = raw ? JSON.parse(raw) : { users: [], history: [] };

    if (data.users.some(u => u.name === trimmedName)) {
      return jsonResponse({ ok: false, error: '这个名字已经存在啦' }, 400);
    }

    data.users.push({
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: trimmedName,
      balance: 0,
      totalRecharge: 0,
      totalClaim: 0,
      colorIdx: data.users.length % 12
    });

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

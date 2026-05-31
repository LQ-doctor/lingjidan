// Cloudflare Pages Function: GET /api/data
// 从 KV 读取所有数据

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const raw = await env.LINGJIDAN.get('data');
    let data;

    if (!raw) {
      // 首次访问，初始化数据
      data = {
        users: [
          '美玲', '丽玲', '黎涛', '陈丽静', '陈栏灵',
          '那晓娜', '高兴', '晓菲', '张航', '罗号文',
          '罗罗罗🌀', '莫奉君'
        ].map((name, i) => ({
          id: 'u_init_' + i,
          name,
          balance: 0,
          totalRecharge: 0,
          totalClaim: 0,
          colorIdx: i % 12
        })),
        history: [],
        updatedAt: Date.now()
      };
      await env.LINGJIDAN.put('data', JSON.stringify(data));
    } else {
      data = JSON.parse(raw);
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

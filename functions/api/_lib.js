// ===== 公共库（不会被当成路由，因为文件名以 _ 开头）=====

const DATA_KEY = 'data';
export const RATE = 1.5; // 2元 = 3个鸡蛋

const INITIAL_USERS = ['美玲','丽玲','黎涛','陈丽静','陈栏灵','那晓娜','高兴','晓菲','张航','罗号文','罗罗罗🌀','莫奉君'];

export function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export function genId() {
  return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function makeInitialData() {
  const now = Date.now();
  return {
    users: INITIAL_USERS.map(function(name, i) {
      return {
        id: genId() + i,
        name: name,
        balance: 0,
        totalRecharge: 0,
        totalClaim: 0,
        colorIdx: i
      };
    }),
    history: [],
    pending: [],
    updatedAt: now
  };
}

export async function getData(env) {
  const raw = await env.LINGJIDAN.get(DATA_KEY);
  let data;
  if (!raw) {
    data = makeInitialData();
    await env.LINGJIDAN.put(DATA_KEY, JSON.stringify(data));
    return data;
  }
  data = JSON.parse(raw);
  // 兼容老数据：补齐缺失字段
  if (!Array.isArray(data.users)) data.users = [];
  if (!Array.isArray(data.history)) data.history = [];
  if (!Array.isArray(data.pending)) data.pending = [];
  data.users.forEach(function(u, i) {
    if (typeof u.colorIdx !== 'number') u.colorIdx = i;
    if (typeof u.balance !== 'number') u.balance = 0;
    if (typeof u.totalRecharge !== 'number') u.totalRecharge = 0;
    if (typeof u.totalClaim !== 'number') u.totalClaim = 0;
  });
  return data;
}

export async function saveData(env, data) {
  data.updatedAt = Date.now();
  await env.LINGJIDAN.put(DATA_KEY, JSON.stringify(data));
  return data;
}

export function getAdminPin(env) {
  return (env && env.ADMIN_PIN) ? String(env.ADMIN_PIN) : '1688';
}

export function checkAdmin(env, pin) {
  return String(pin == null ? '' : pin) === getAdminPin(env);
}

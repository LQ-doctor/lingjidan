
# 🥚 零鸡蛋小窝

琉Q 的可爱风鸡蛋分配管理网站，部署在 Cloudflare Pages，数据存在 Cloudflare KV，所有人实时同步。

## 项目结构

```
lingjidan/
├── index.html               # 主页面
├── functions/api/           # 后端 API
│   ├── data.js              # GET  /api/data           读取所有数据
│   ├── recharge.js          # POST /api/recharge       充值
│   ├── claim.js             # POST /api/claim          领取
│   ├── user.js              # POST /api/user           添加用户
│   └── delete-history.js    # POST /api/delete-history 删除记录
└── 部署教程.md               # 保姆级部署教程
```

## 功能特性

- 💰 充值（自动按 2 元 = 3 个换算）
- 🍳 领取登记
- 📊 余额、累计统计
- 📋 历史记录（按日期分组，可删除）
- ⭐ 今日小结
- ✨ 添加新小伙伴
- ☁️ Cloudflare KV 云端存储，所有人实时同步
- 🎨 马卡龙多彩可爱风格

## 部署

详见 **`部署教程.md`**

# 爱心链 LoveChain

> 一个 2 小时黑客松场景的**手绘温暖风**爱心接力 Demo — 纯静态前端，浏览器打开即用。

![style](https://img.shields.io/badge/UI-hand--drawn-ffb27e) ![stack](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-4fc3f7) ![pwa](https://img.shields.io/badge/PWA-installable-8fd19e) ![lang](https://img.shields.io/badge/lang-zh--CN-f06292)

## ✨ Demo 概念

从**发起**到**签收**再到**盖章认证**，一次爱心捐赠像游戏一样经过多个角色接力完成。整个流程被拆成 **7 步生命周期**，任何人都可以在首页地图上：
- 🎁 **发起爱心**：发布闲置捐赠或求助需求
- ⚖️ **爱心评审**：召集 **30 位随机评审员** 众评打分（美团评审风格）
- 🚚 **加入接力**：多程顺风车打卡拍照送物资
- 🏫 **接收爱心**：签收并拍下开箱瞬间
- 🎪 **围观大屏**：拼图式看整条链一格格亮起

流程结束后自动生成一张手绘风格的分享海报，附带二维码。

## 🌐 两种运行版本

打开首页 [`index.html`](./index.html) 会看到入口分流页：

| 版本 | 文件 | 定位 |
|---|---|---|
| 🖥️ **网页版** | [`web.html`](./web.html) | 桌面宽屏三栏：地图 + 任务网格 + 7 步生命周期时间线 + 众评实时直播 |
| 📱 **手机版 App** | [`app.html`](./app.html) | 手机竖屏 phone-shell，支持 **PWA 安装到桌面**、Service Worker 离线壳 |

访问任一版本时会根据 UA 自动分流（手机 → app / 桌面 → web），可用 URL 参数 `?force=web` 或 `?force=app` 强制指定并记住偏好。

## 🚀 本地跑起来

```bash
# 任一静态服务都行
python -m http.server 8765

# 或者
npx http-server -p 8765
```

浏览器打开 `http://localhost:8765/index.html` 即可开始演示。

## 🗺️ 页面地图

```
index.html ─── 入口分流页（网页版 / 手机版 选择 + QR）
├── web.html  ── 桌面版看板
├── app.html  ── 手机版 App (PWA)
├── action.html?role=xxx  ── 角色操作台（donor / carrier / receiver / judge）
├── screen.html  ── 3×3 拼图大屏（键盘 1-7 手动兜底 / R 重置）
├── story.html   ── 7 分镜自动播放 + 手绘海报生成
└── map.html     ── Leaflet 世界地图（备用视角）
```

## 🏗️ 架构（保持 DRY）

```
data.js         ── 唯一数据源：ROLES / TASK_STAGES / REVIEWER_POOL(30) / …
js/state.js     ── 跨页面 / 跨 tab 状态同步 (localStorage + storage 事件)
                    · ChainState    主任务 7 阶段进度
                    · UserTasks     用户发布的任务
                    · Reviews       30 人众评打分记录
js/board.js     ── 地图 & 任务看板共享逻辑（web/app 都调 LoveBoard.init）
js/ua-router.js ── UA 自动分流路由
css/style.css   ── 手绘变量 + 全部组件样式
sw.js           ── PWA Service Worker (核心资源预热 + 网络优先回退)
manifest.json   ── PWA 清单
```

## 🎨 视觉风格

- **字体**：ZCOOL KuaiLe / ZCOOL XiaoWei（Google Fonts）
- **调色板**：`#fff6ea` 米黄纸底 + `#3a2f2a` 深棕描边
- **风格**：4px 偏移黑棕影 · 2.5px 描边 · blob 头像 · 胶带 · 印章 · 虚线纸片
- **地图**：CSS/SVG 手绘游戏地图（草坪 / 沙滩 / 樱花 / 湖泊四色块 + 弯曲小路 + emoji 装饰）

## 📋 依赖

- [Leaflet](https://leafletjs.com/) — `map.html` 地图渲染
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) — 二维码
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — 大屏完成撒花

全部通过 CDN 引入，不需要打包工具。

## 📄 License

MIT — 黑客松 Demo，代码请随便用。

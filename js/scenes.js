/**
 * 爱心链 · 手绘小人场景插画 (DRY: story.html 分镜背景 + 海报主图共用)
 * 纯内联 SVG，无外部资源；风格与全站一致：
 *   深棕描边 #3a2f2a / 暖纸底 / 珊瑚粉·橙黄·天蓝色块 / 圆头小人
 * STAGE_SCENES[stageId] → 完整 SVG 字符串（竖版 360x480）
 */
(function (global) {
  const INK = '#3a2f2a';

  /* ---------- 可复用的小零件 ---------- */

  // 圆头小人：x,y 是脚底中心；c 身体色；flip 朝向；pose: wave|hold|walk|jump
  function figure(x, y, c, opts) {
    const o = Object.assign({ flip: false, pose: 'hold', skin: '#ffe0c7' }, opts);
    const s = o.flip ? -1 : 1;
    const arms = {
      hold: `<path d="M${x - 14 * s},${y - 52} q${-10 * s},8 ${-6 * s},18 M${x + 14 * s},${y - 52} q${10 * s},8 ${6 * s},18" />`,
      wave: `<path d="M${x - 14 * s},${y - 52} q${-12 * s},-6 ${-10 * s},-18 M${x + 14 * s},${y - 52} q${10 * s},8 ${6 * s},18" />`,
      walk: `<path d="M${x - 14 * s},${y - 52} q${-12 * s},10 ${-8 * s},20 M${x + 14 * s},${y - 52} q${14 * s},2 ${16 * s},14" />`,
      jump: `<path d="M${x - 14 * s},${y - 52} q${-14 * s},-10 ${-12 * s},-22 M${x + 14 * s},${y - 52} q${14 * s},-10 ${12 * s},-22" />`,
    }[o.pose];
    const legs = o.pose === 'walk'
      ? `<path d="M${x - 7},${y - 26} q-4,14 -10,24 M${x + 7},${y - 26} q6,12 4,26" />`
      : o.pose === 'jump'
        ? `<path d="M${x - 7},${y - 26} q-8,10 -12,16 M${x + 7},${y - 26} q8,10 12,16" />`
        : `<path d="M${x - 7},${y - 26} l-2,26 M${x + 7},${y - 26} l2,26" />`;
    return `
      <g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none">
        ${legs}${arms}
        <rect x="${x - 16}" y="${y - 58}" width="32" height="34" rx="14" fill="${c}" />
        <circle cx="${x}" cy="${y - 74}" r="17" fill="${o.skin}" />
        <circle cx="${x - 6 * s}" cy="${y - 76}" r="2" fill="${INK}" stroke="none" />
        <circle cx="${x + 5 * s}" cy="${y - 76}" r="2" fill="${INK}" stroke="none" />
        <path d="M${x - 4 * s},${y - 68} q${4 * s},4 ${8 * s},0" />
      </g>`;
  }

  function heart(x, y, r, c) {
    return `<path d="M${x},${y + r * 0.9}
      C${x - r * 1.3},${y - r * 0.3} ${x - r * 0.6},${y - r * 1.2} ${x},${y - r * 0.4}
      C${x + r * 0.6},${y - r * 1.2} ${x + r * 1.3},${y - r * 0.3} ${x},${y + r * 0.9} Z"
      fill="${c || '#ff8a7b'}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }

  function cloud(x, y, sc) {
    return `<g transform="translate(${x},${y}) scale(${sc || 1})" fill="#fff" stroke="${INK}" stroke-width="2">
      <ellipse cx="0" cy="0" rx="26" ry="13"/><ellipse cx="-16" cy="4" rx="14" ry="9"/><ellipse cx="17" cy="4" rx="15" ry="9"/>
    </g>`;
  }

  function sun(x, y) {
    return `<g stroke="${INK}" stroke-width="2.5">
      <circle cx="${x}" cy="${y}" r="20" fill="#f9b942"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return `<line x1="${x + Math.cos(r) * 27}" y1="${y + Math.sin(r) * 27}" x2="${x + Math.cos(r) * 35}" y2="${y + Math.sin(r) * 35}"/>`;
      }).join('')}
    </g>`;
  }

  // 每幕的统一外壳：天空渐变 + 纸纹点 + 地面 + 内容
  function scene(skyA, skyB, groundColor, inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${skyA}"/><stop offset="1" stop-color="${skyB}"/>
      </linearGradient></defs>
      <rect width="360" height="480" fill="url(#sky)"/>
      <g fill="${INK}" opacity="0.05">
        ${Array.from({ length: 6 }, (_, i) => `<circle cx="${(i * 97 + 40) % 340}" cy="${(i * 143 + 60) % 440}" r="2.5"/>`).join('')}
      </g>
      <path d="M-10,382 Q90,352 180,378 T370,372 L370,490 L-10,490 Z" fill="${groundColor}" stroke="${INK}" stroke-width="3"/>
      ${inner}
    </svg>`;
  }

  /* ---------- 七幕 + 结尾海报 ---------- */

  const STAGE_SCENES = {

    // ① 发布爱心：小林抱着礼盒，头顶飘出手写信和爱心
    posted: scene('#ffe9d6', '#fff6ea', '#ffd9a8', `
      ${sun(300, 72)}${cloud(80, 66, 0.9)}
      ${figure(150, 400, '#ff8a7b', { pose: 'hold' })}
      <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <rect x="120" y="330" width="60" height="44" rx="6" fill="#f9b942"/>
        <path d="M120 348 h60 M150 330 v44" />
        <path d="M138 330 q12,-18 24,0" fill="none"/>
      </g>
      <g stroke="${INK}" stroke-width="2.5">
        <rect x="212" y="270" width="66" height="46" rx="6" fill="#fff"/>
        <path d="M212 278 l33,22 33,-22" fill="none"/>
      </g>
      ${heart(245, 250, 9)}${heart(120, 270, 7, '#f06292')}${heart(200, 220, 6, '#ffb27e')}
    `),

    // ② 智能配对：两个小人隔着虚线牵起一颗大爱心
    matched: scene('#ffe3ec', '#fff6ea', '#f8c8d8', `
      ${cloud(70, 70, 0.8)}${cloud(290, 96, 1)}
      ${figure(90, 402, '#ff8a7b', { pose: 'wave' })}
      ${figure(270, 402, '#f06292', { pose: 'wave', flip: true })}
      <path d="M108 330 Q180 300 252 330" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/>
      ${heart(180, 292, 24)}
      <g font-family="sans-serif" font-size="13" fill="${INK}" text-anchor="middle" opacity="0.7">
        <text x="90" y="436">发起人</text><text x="270" y="436">接收方</text>
      </g>
    `),

    // ③ 众评审核：一排小评审举着星星牌子
    reviewed: scene('#fff2cf', '#fff6ea', '#ffe08a', `
      ${sun(52, 64)}
      ${figure(80, 396, '#f9b942')}
      ${figure(180, 402, '#4fc3f7')}
      ${figure(280, 396, '#8fd19e', { flip: true })}
      ${[80, 180, 280].map((x, i) => `
        <g stroke="${INK}" stroke-width="2.5">
          <rect x="${x - 26}" y="${i === 1 ? 288 : 282}" width="52" height="36" rx="6" fill="#fff"/>
          <path d="M${x},${i === 1 ? 324 : 318} v14" />
        </g>
        <path d="M${x},${i === 1 ? 297 : 291} l3.5,7.5 8,1 -6,5.8 1.5,8 -7,-4.2 -7,4.2 1.5,-8 -6,-5.8 8,-1 Z"
              fill="#f9b942" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      `).join('')}
      <g font-family="sans-serif" font-size="12" fill="${INK}" opacity="0.65" text-anchor="middle">
        <text x="180" y="448">30 位爱心评审员在线打分</text>
      </g>
    `),

    // ④ 接力第 1 程：小卡车翻山，车斗里装着爱心包裹
    leg1: scene('#d8ecfb', '#fff6ea', '#bfe3c0', `
      ${sun(310, 66)}${cloud(90, 82, 1)}
      <path d="M-10,382 L80,300 L150,382" fill="#a8d0a0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M60,382 L150,270 L250,382" fill="#8fbF95" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
        <rect x="176" y="330" width="84" height="46" rx="7" fill="#4fc3f7"/>
        <rect x="252" y="344" width="44" height="32" rx="6" fill="#fff"/>
        <circle cx="200" cy="382" r="13" fill="#fff"/><circle cx="272" cy="382" r="13" fill="#fff"/>
        <circle cx="200" cy="382" r="4" fill="${INK}"/><circle cx="272" cy="382" r="4" fill="${INK}"/>
      </g>
      <circle cx="270" cy="358" r="7" fill="${INK}" opacity="0.85"/>
      ${heart(218, 322, 10)}
      <path d="M40,420 h60 M120,432 h44" stroke="${INK}" stroke-width="2.5" stroke-dasharray="8 7" opacity="0.5"/>
    `),

    // ⑤ 接力第 2 程：滑板车小哥载着包裹冲坡
    leg2: scene('#dff1fd', '#fff6ea', '#cfe8f7', `
      ${cloud(60, 64, 0.9)}${cloud(280, 92, 1.1)}
      ${figure(196, 380, '#6bc0f8', { pose: 'walk' })}
      <g stroke="${INK}" stroke-width="3" stroke-linecap="round">
        <path d="M160,404 L232,404" />
        <circle cx="160" cy="404" r="11" fill="#fff"/><circle cx="232" cy="404" r="11" fill="#fff"/>
        <path d="M232,404 L232,352 L246,344" fill="none"/>
      </g>
      <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <rect x="130" y="332" width="40" height="34" rx="6" fill="#f9b942"/>
        <path d="M130 346 h40"/>
      </g>
      ${heart(150, 322, 8)}
      <path d="M60,392 q30,-8 56,4" stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 6" fill="none" opacity="0.5"/>
      <g font-family="sans-serif" font-size="12" fill="${INK}" opacity="0.65" text-anchor="middle">
        <text x="180" y="448">中转顺利，继续向前</text>
      </g>
    `),

    // ⑥ 签收开箱：小朋友跳起来，礼盒炸出爱心
    delivered: scene('#ffe3ec', '#fff6ea', '#ffd3e0', `
      ${sun(58, 70)}${cloud(280, 78, 1)}
      ${figure(120, 398, '#f06292', { pose: 'jump' })}
      ${figure(240, 402, '#8fd19e', { pose: 'wave', flip: true, skin: '#ffd9b8' })}
      <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <rect x="152" y="352" width="56" height="40" rx="6" fill="#f9b942"/>
        <path d="M148,352 h64 l-6,-12 h-52 Z" fill="#ffb27e"/>
      </g>
      ${heart(180, 310, 11)}${heart(150, 286, 8, '#f06292')}${heart(212, 280, 7, '#ffb27e')}${heart(182, 252, 6, '#4fc3f7')}
      <g font-family="sans-serif" font-size="12" fill="${INK}" opacity="0.65" text-anchor="middle">
        <text x="180" y="448">开箱瞬间，谢谢远方的你</text>
      </g>
    `),

    // ⑦ 盖章认证：评审官给证书盖上爱心大印
    certified: scene('#fff2cf', '#fff6ea', '#ffe4b8', `
      ${cloud(76, 70, 0.9)}${cloud(292, 60, 0.8)}
      ${figure(250, 398, '#f9b942', { flip: true })}
      <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <rect x="76" y="300" width="120" height="88" rx="8" fill="#fffdf5"/>
        <path d="M92 322 h88 M92 340 h88 M92 358 h56" opacity="0.5"/>
      </g>
      <g transform="rotate(-12 166 366)">
        <circle cx="166" cy="366" r="26" fill="none" stroke="#f06292" stroke-width="3.5"/>
        ${heart(166, 366, 11, '#f06292')}
      </g>
      ${heart(260, 300, 9)}${heart(300, 270, 7, '#ffb27e')}
      <g font-family="sans-serif" font-size="12" fill="${INK}" opacity="0.65" text-anchor="middle">
        <text x="180" y="448">全程留痕 · 爱心认证</text>
      </g>
    `),
  };

  // 结尾海报主图：一条爱心链把四位角色串起来
  STAGE_SCENES.finale = scene('#ffe9d6', '#fff0f4', '#ffd9a8', `
    ${sun(304, 60)}${cloud(70, 60, 0.9)}
    ${figure(60, 396, '#ff8a7b', { pose: 'wave' })}
    ${figure(146, 406, '#4fc3f7', { pose: 'walk' })}
    ${figure(226, 406, '#f06292', { pose: 'hold', flip: true })}
    ${figure(306, 396, '#f9b942', { pose: 'wave', flip: true })}
    <path d="M60,306 Q104,282 146,312 T226,312 T306,306"
          stroke="${INK}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/>
    ${heart(60, 300, 9)}${heart(146, 306, 9, '#4fc3f7')}${heart(226, 306, 9, '#f06292')}${heart(306, 300, 9, '#f9b942')}
    ${heart(180, 240, 20)}
    <g font-family="sans-serif" font-size="13" fill="${INK}" opacity="0.7" text-anchor="middle">
      <text x="180" y="448">一条爱心链，大家一起点亮</text>
    </g>
  `);

  /** 取某阶段的场景 SVG（找不到时退回 finale） */
  global.STAGE_SCENES = STAGE_SCENES;
  global.sceneFor = (stageId) => STAGE_SCENES[stageId] || STAGE_SCENES.finale;
})(window);

/**
 * 爱心链 Demo - 唯一数据源 (DRY)
 * 所有页面(首页游戏地图/角色台/大屏/故事页)共享同一份定义，
 * 避免每个页面里各写一套名单/颜色/文案。
 */

/* ============================================================
 * ① 身份角色 - 顶部小胶囊切换（不再独占首页）
 * ============================================================ */
const ROLES = [
  { id: 'donor',    name: '发起爱心', emoji: '🎁', sticker: '💌', color: '#FF8A7B', tagline: '发布你的闲置或需求', hint: '写一句心意，我们帮你找到需要的人' },
  { id: 'carrier',  name: '加入接力', emoji: '🚚', sticker: '🛴', color: '#4FC3F7', tagline: '路过顺手带一程',   hint: '沿途扫码打卡拍照，一程一程把爱送到' },
  { id: 'receiver', name: '接收爱心', emoji: '🏫', sticker: '🎈', color: '#F06292', tagline: '签收远方来的心意',  hint: '拍张开箱照，让爱心链留下最暖的一格' },
  { id: 'judge',    name: '爱心评审', emoji: '⚖️', sticker: '✨', color: '#F9B942', tagline: '召集大家一起评分',  hint: '30 位随机爱心评审员打分后自动通过' },
  { id: 'watcher',  name: '围观大屏', emoji: '🎪', sticker: '🎉', color: '#8FD19E', tagline: '看拼图一格格亮起',  hint: '大屏跟随所有人的操作实时点亮' },
];

/* ============================================================
 * ② 任务完整生命周期 - 7 阶段
 *    reviewed 阶段已升级为"30 人众评"（美团评审）
 * ============================================================ */
const TASK_STAGES = [
  { id: 'posted',    ownerRole: 'donor',    title: '发布爱心', verb: '发布了一份闲置捐赠', emoji: '💌', color: '#FF8A7B', actor: '小林',     avatar: '🧑', prompt: '写一句给远方的寄语吧' },
  { id: 'matched',   ownerRole: 'system',   title: '智能配对', verb: '和接收方完成配对',   emoji: '💞', color: '#FFB27E', actor: '系统',     avatar: '🤖', prompt: '匹配需求方中…' },
  { id: 'reviewed',  ownerRole: 'judge',    title: '众评审核', verb: '通过 30 人众评审核', emoji: '📝', color: '#F9B942', actor: '爱心评审团', avatar: '⚖️', prompt: '一键召集 30 位随机评审员打分' },
  { id: 'leg1',      ownerRole: 'carrier',  title: '接力第 1 程', verb: '在第一程扫码打卡', emoji: '🚚', color: '#4FC3F7', actor: '张师傅',   avatar: '🚚', prompt: '拍一张打卡照，证明物资到了中转点' },
  { id: 'leg2',      ownerRole: 'carrier',  title: '接力第 2 程', verb: '在第二程完成中转', emoji: '🛴', color: '#6BC0F8', actor: '李阿姨',   avatar: '🛴', prompt: '再拍一张，让接力链保持透明' },
  { id: 'delivered', ownerRole: 'receiver', title: '签收开箱', verb: '签收并拍下开箱瞬间', emoji: '🎁', color: '#F06292', actor: '希望小学', avatar: '🏫', prompt: '拍下开箱瞬间，写一句感谢' },
  { id: 'certified', ownerRole: 'judge',    title: '盖章认证', verb: '为整条爱心链盖章',   emoji: '✨', color: '#F9C784', actor: '评审官',   avatar: '⚖️', prompt: '所有环节已核实，可以颁发爱心勋章' },
];
const KEY_STAGES = ['posted', 'reviewed', 'leg1', 'delivered'];

/* ============================================================
 * ③ 游戏地图内置任务点 (Seed)
 *    真实用户发布的任务会追加到 USER_TASKS，共同渲染到地图上
 * ============================================================ */
const MAP_TASKS = [
  { id: 'T1', type: 'donation', title: '3件童装 · 待接力',      desc: '小林 · 朝阳区',   x: 42, y: 55, actor: '小林',     hero: true },
  { id: 'T2', type: 'need',     title: '希望小学 · 急需棉衣',   desc: '匹配中',          x: 68, y: 45, actor: '希望小学', urgent: true },
  { id: 'T3', type: 'carry',    title: '张师傅顺风车',           desc: '途经北四环',      x: 55, y: 20, actor: '张师傅' },
  { id: 'T4', type: 'donation', title: '一批课外读物',           desc: '待评审',          x: 24, y: 40, actor: '书香会' },
  { id: 'T5', type: 'need',     title: '偏远小学 · 缺文具',      desc: '寻接力人',        x: 20, y: 72, actor: '云溪小学' },
  { id: 'T6', type: 'completed',title: '爱心链已点亮',           desc: '48h 前完成',      x: 76, y: 78, actor: '暖暖' },
  { id: 'T7', type: 'carry',    title: '李阿姨拼车到郊区',       desc: '每周三下午',      x: 82, y: 30, actor: '李阿姨' },
  { id: 'T8', type: 'need',     title: '独居老人 · 需助浴',      desc: '待志愿者',        x: 33, y: 82, actor: '街道办' },
];

/* 任务类型元数据 - 全站共用 (DRY) */
const TASK_TYPE_META = {
  donation:  { emoji: '🎁', color: '#FF8A7B', label: '闲置捐赠', hint: '把家里的闲置送给需要的人' },
  need:      { emoji: '🙏', color: '#F06292', label: '需求求助', hint: '发布一个身边的求助需求' },
  carry:     { emoji: '🚚', color: '#4FC3F7', label: '顺风接力', hint: '路过顺手带一程物资' },
  completed: { emoji: '✨', color: '#F9C784', label: '已点亮',   hint: '过往完成的爱心链' },
  urgent:    { emoji: '🔥', color: '#EF5350', label: '紧急',     hint: '需要尽快响应的任务' },
};

/* ============================================================
 * ④ 众评评审员池 - 30 位（美团评审风格）
 *    随机取样 → 每人 4~5 星 + 一句短评 → 汇总平均分
 * ============================================================ */
const REVIEWER_POOL = [
  { id: 'r01', name: '小豆丁',  emoji: '🐣' }, { id: 'r02', name: '暖阳',   emoji: '🌞' },
  { id: 'r03', name: '木木',    emoji: '🌳' }, { id: 'r04', name: '奶盖',   emoji: '🥛' },
  { id: 'r05', name: '茉莉',    emoji: '🌼' }, { id: 'r06', name: '海豚',   emoji: '🐬' },
  { id: 'r07', name: '棉花糖',  emoji: '🍡' }, { id: 'r08', name: '小满',   emoji: '🌾' },
  { id: 'r09', name: '琥珀',    emoji: '🍯' }, { id: 'r10', name: '青柠',   emoji: '🍋' },
  { id: 'r11', name: '云朵',    emoji: '☁️' }, { id: 'r12', name: '橘子',   emoji: '🍊' },
  { id: 'r13', name: '布丁',    emoji: '🍮' }, { id: 'r14', name: '灯泡',   emoji: '💡' },
  { id: 'r15', name: '柚子',    emoji: '🍈' }, { id: 'r16', name: '小鹿',   emoji: '🦌' },
  { id: 'r17', name: '汤圆',    emoji: '🍥' }, { id: 'r18', name: '花卷',   emoji: '🥐' },
  { id: 'r19', name: '芋圆',    emoji: '🟣' }, { id: 'r20', name: '橙子',   emoji: '🍊' },
  { id: 'r21', name: '桃桃',    emoji: '🍑' }, { id: 'r22', name: '青苔',   emoji: '🌱' },
  { id: 'r23', name: '雪梨',    emoji: '🍐' }, { id: 'r24', name: '奶昔',   emoji: '🥤' },
  { id: 'r25', name: '西柚',    emoji: '🍇' }, { id: 'r26', name: '柠檬',   emoji: '🍋' },
  { id: 'r27', name: '小雏菊',  emoji: '🌻' }, { id: 'r28', name: '海苔',   emoji: '🍙' },
  { id: 'r29', name: '兔兔',    emoji: '🐰' }, { id: 'r30', name: '喵喵',   emoji: '🐱' },
];

const REVIEW_COMMENT_TEMPLATES = [
  '资料齐全，靠谱！', '双方信息核对无误，可以放行', '希望孩子们收到能开心 ❤️',
  '看起来是真的有需要，支持', '发起人小林之前也做过公益，信得过',
  '接收方资质截图清晰', '这份心意很贴心，通过', '物资和需求匹配度高',
  '路线合理，接力人靠谱', '关注一下，希望顺利送达', '干净整洁的闲置，好评',
  '我也是从这里毕业的孩子的家长', '很有仪式感的一次善意',
  '打卡照拍得走心，赞', '相信这条爱心链会走得很远', '好人一路平安',
];

/* 完整拼图集齐后，二维码指向的"暖心故事"页面 */
const STORY_URL = new URL('story.html', window.location.href).toString();

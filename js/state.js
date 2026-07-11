/**
 * 爱心链 Demo - 跨页面 / 跨标签页状态同步 (DRY)
 * - ChainState : 任务的 7 阶段进度（按 taskId 分容器，默认 T1 主任务）
 * - UserTasks  : 首页用户新发布的任务（游戏地图会自动多出图钉）
 * - Reviews    : 30 人众评的评分记录（同样按 taskId 分容器）
 * 全部用 localStorage + storage 事件 + 同页自定义事件模拟"实时联动"，无需后端
 *
 * 多任务：ChainState.use('T3') 之后所有读写都指向 T3 自己的链条，
 *         与其它任务互不干扰。T1 沿用旧 key，老进度不丢。
 */

const STORAGE_KEY = 'lovechain_progress_v2';
const USER_TASKS_KEY = 'lovechain_user_tasks_v1';
const REVIEWS_KEY = 'lovechain_reviews_v1';
const DEFAULT_TASK_ID = 'T1';

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch (e) { return fallback; }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key, value } }));
}

/** taskId → 该任务的存储 key；T1 沿用旧 key 保持向后兼容 */
function taskKey(base, taskId) {
  return (!taskId || taskId === DEFAULT_TASK_ID) ? base : `${base}:${taskId}`;
}

const ChainState = {
  taskId: DEFAULT_TASK_ID,

  /** 切换当前操作的任务；后续所有读写都落到这个任务自己的进度容器 */
  use(taskId) {
    this.taskId = taskId || DEFAULT_TASK_ID;
    return this;
  },
  key() { return taskKey(STORAGE_KEY, this.taskId); },

  /** 读任意任务的进度（不切换当前任务） */
  stagesOf(taskId) { return readJSON(taskKey(STORAGE_KEY, taskId), []); },

  getStages() { return readJSON(this.key(), []); },
  advance(stageId, payload) {
    const list = this.getStages();
    if (list.some((c) => c.id === stageId)) return list;
    list.push({ id: stageId, payload: payload || null, ts: Date.now() });
    writeJSON(this.key(), list);
    return list;
  },
  isDone(stageId) { return this.getStages().some((c) => c.id === stageId); },
  getNextStage() { return TASK_STAGES.find((s) => !this.isDone(s.id)) || null; },
  isAllDone() { return this.getStages().length >= TASK_STAGES.length; },
  getActionableStageForRole(roleId) {
    for (const s of TASK_STAGES) {
      if (this.isDone(s.id)) continue;
      if (s.ownerRole === roleId) return s;
      return null;
    }
    return null;
  },
  reset() {
    localStorage.removeItem(this.key());
    window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key: this.key() } }));
  },
  onChange(callback) {
    // 进度 key 带任务后缀，前缀匹配才能监听到所有任务的变化
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(STORAGE_KEY)) callback(this.getStages());
    });
    window.addEventListener('lovechain:update', (e) => {
      if (!e.detail || (e.detail.key || '').startsWith(STORAGE_KEY)) callback(this.getStages());
    });
  },
};

/** 用户在首页新发布的任务；结构与 MAP_TASKS 兼容，可以直接被地图渲染 */
const UserTasks = {
  all() { return readJSON(USER_TASKS_KEY, []); },
  post(task) {
    const list = this.all();
    const id = 'U' + (list.length + 1).toString().padStart(2, '0');
    const withMeta = Object.assign({ id, ts: Date.now(), userPosted: true }, task);
    list.push(withMeta);
    writeJSON(USER_TASKS_KEY, list);
    return withMeta;
  },
  reset() {
    localStorage.removeItem(USER_TASKS_KEY);
    window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key: USER_TASKS_KEY } }));
  },
  onChange(cb) {
    window.addEventListener('storage', (e) => { if (e.key === USER_TASKS_KEY) cb(this.all()); });
    window.addEventListener('lovechain:update', (e) => {
      if (!e.detail || e.detail.key === USER_TASKS_KEY) cb(this.all());
    });
  },
};

/** 30 人众评的评分记录；每人 = { reviewerId, stars, comment }，同样按任务分容器 */
const Reviews = {
  taskId: DEFAULT_TASK_ID,
  use(taskId) {
    this.taskId = taskId || DEFAULT_TASK_ID;
    return this;
  },
  key() { return taskKey(REVIEWS_KEY, this.taskId); },

  all() { return readJSON(this.key(), []); },
  push(review) {
    const list = this.all();
    list.push(review);
    writeJSON(this.key(), list);
    return list;
  },
  reset() {
    localStorage.removeItem(this.key());
    window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key: this.key() } }));
  },
  average() {
    const list = this.all();
    if (!list.length) return 0;
    return list.reduce((s, r) => s + r.stars, 0) / list.length;
  },
  passed() { return this.all().length >= 30 && this.average() >= 4.0; },
  onChange(cb) {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(REVIEWS_KEY)) cb(this.all());
    });
    window.addEventListener('lovechain:update', (e) => {
      if (!e.detail || (e.detail.key || '').startsWith(REVIEWS_KEY)) cb(this.all());
    });
  },
};

/** 通过 id 找任务（种子任务 + 用户发布的任务） */
function findTaskById(taskId) {
  if (!taskId) return null;
  return MAP_TASKS.find((t) => t.id === taskId)
      || UserTasks.all().find((t) => t.id === taskId)
      || null;
}

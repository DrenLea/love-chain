/**
 * 爱心链 Demo - 跨页面 / 跨标签页状态同步 (DRY)
 * - ChainState : 主任务 T1 的 7 阶段进度（原有）
 * - UserTasks  : 首页用户新发布的任务（游戏地图会自动多出图钉）
 * - Reviews    : 30 人众评的评分记录
 * 全部用 localStorage + storage 事件 + 同页自定义事件模拟"实时联动"，无需后端
 */

const STORAGE_KEY = 'lovechain_progress_v2';
const USER_TASKS_KEY = 'lovechain_user_tasks_v1';
const REVIEWS_KEY = 'lovechain_reviews_v1';

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch (e) { return fallback; }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key, value } }));
}

const ChainState = {
  getStages() { return readJSON(STORAGE_KEY, []); },
  advance(stageId, payload) {
    const list = this.getStages();
    if (list.some((c) => c.id === stageId)) return list;
    list.push({ id: stageId, payload: payload || null, ts: Date.now() });
    writeJSON(STORAGE_KEY, list);
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
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key: STORAGE_KEY } }));
  },
  onChange(callback) {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) callback(this.getStages());
    });
    window.addEventListener('lovechain:update', (e) => {
      if (!e.detail || e.detail.key === STORAGE_KEY) callback(this.getStages());
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

/** 30 人众评的评分记录；每人 = { reviewerId, stars, comment } */
const Reviews = {
  all() { return readJSON(REVIEWS_KEY, []); },
  push(review) {
    const list = this.all();
    list.push(review);
    writeJSON(REVIEWS_KEY, list);
    return list;
  },
  reset() {
    localStorage.removeItem(REVIEWS_KEY);
    window.dispatchEvent(new CustomEvent('lovechain:update', { detail: { key: REVIEWS_KEY } }));
  },
  average() {
    const list = this.all();
    if (!list.length) return 0;
    return list.reduce((s, r) => s + r.stars, 0) / list.length;
  },
  passed() { return this.all().length >= 30 && this.average() >= 4.0; },
  onChange(cb) {
    window.addEventListener('storage', (e) => { if (e.key === REVIEWS_KEY) cb(this.all()); });
    window.addEventListener('lovechain:update', (e) => {
      if (!e.detail || e.detail.key === REVIEWS_KEY) cb(this.all());
    });
  },
};

/**
 * 爱心链 · UA 分流路由 (DRY)
 * 在 web.html / app.html 顶部内联，浏览器根据 UA 自动跳到合适的版本：
 *   - 手机 UA 打开 web.html → 自动跳去 app.html
 *   - 桌面 UA 打开 app.html → 自动跳去 web.html
 * 用户可以通过：
 *   - URL 加 ?force=web 或 ?force=app 强制指定
 *   - 页面上的"切换到另一版本"按钮手动切
 * 一旦手动选择过，就写入 localStorage 记住偏好，之后不再自动跳
 */
(function () {
  const KEY = 'lovechain_view_pref'; // 'web' | 'app'
  const params = new URLSearchParams(location.search);

  // ① 强制指定 → 记住偏好，不跳转
  const force = params.get('force');
  if (force === 'web' || force === 'app') {
    try { localStorage.setItem(KEY, force); } catch (e) {}
    return;
  }

  // ② 已有偏好 → 尊重上一次的选择
  let pref = null;
  try { pref = localStorage.getItem(KEY); } catch (e) {}
  if (pref === 'web' || pref === 'app') return;

  // ③ UA + 触屏 + 屏宽三条组合判断
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|iPhone|iPod|IEMobile|BlackBerry|Opera Mini/i.test(ua);
  const smallScreen = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
  const isMobile = mobileUA || (smallScreen && 'ontouchstart' in window);

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (isMobile && page === 'web.html') {
    location.replace('app.html?auto=1');
  } else if (!isMobile && page === 'app.html') {
    location.replace('web.html?auto=1');
  }
})();

/**
 * 爱心链 · 任务看板 & 地图 & 发布逻辑 (DRY)
 * 同时被 app.html (手机版) 和 web.html (网页版) 复用。
 * scope 只用于日志区分，两版之间的核心行为一致。
 */
(function (global) {
  const LoveBoard = {
    state: { filter: 'all', selectedType: 'donation', scope: 'app' },

    init(opts) {
      Object.assign(this.state, opts || {});
      this.bindPostSheet();
      this.renderAll();
      // 数据源变更 → 全屏刷新
      ChainState.onChange(() => this.renderAll());
      UserTasks.onChange(() => this.renderAll());
      Reviews.onChange(() => this.renderLiveReviews && this.renderLiveReviews());
    },

    allTasks() { return [...MAP_TASKS, ...UserTasks.all()]; },

    renderAll() {
      this.renderHud();
      this.renderRolePills();
      this.renderFilters();
      this.renderMap();
      this.renderGrid();
      this.renderLifecycle && this.renderLifecycle();
      this.renderLiveReviews && this.renderLiveReviews();
    },

    renderHud() {
      const bar = document.getElementById('hudBar');
      const num = document.getElementById('hudNum');
      if (!bar || !num) return;
      const stages = ChainState.getStages();
      const total = TASK_STAGES.length;
      bar.style.width = (stages.length / total * 100) + '%';
      num.textContent = `${stages.length} / ${total}`;
    },

    renderRolePills() {
      const bar = document.getElementById('rolePillBar');
      if (!bar) return;
      bar.innerHTML = '';
      ROLES.forEach((role) => {
        const a = document.createElement('a');
        a.className = 'role-pill';
        a.href = role.id === 'watcher' ? 'screen.html' : `action.html?role=${role.id}`;
        a.style.setProperty('--pill-color', role.color);
        a.innerHTML = `<span>${role.emoji}</span>${role.name}`;
        bar.appendChild(a);
      });
    },

    renderMap() {
      const map = document.getElementById('gameMap');
      if (!map) return;
      map.querySelectorAll('.map-pin').forEach((el) => el.remove());
      this.allTasks()
        .filter((t) => this.state.filter === 'all' || t.type === this.state.filter)
        .forEach((t) => this.appendPin(map, t));
    },

    appendPin(map, t) {
      const key = t.urgent ? 'urgent' : t.type;
      const meta = TASK_TYPE_META[key] || TASK_TYPE_META.donation;
      const pin = document.createElement('div');
      pin.className = 'map-pin'
        + (t.hero ? ' hero' : '')
        + (t.urgent ? ' urgent' : '')
        + (t.userPosted ? ' user-posted' : '');
      pin.style.left = (t.x || 50) + '%';
      pin.style.top  = (t.y || 50) + '%';
      pin.style.setProperty('--pin-color', meta.color);
      pin.innerHTML = `
        <span class="tip">${t.title}</span>
        <div class="bubble">${meta.emoji}</div>
        <div class="stalk"></div>
      `;
      pin.addEventListener('click', () => this.openTaskDetail(t));
      map.appendChild(pin);
    },

    renderFilters() {
      const el = document.getElementById('filterChips');
      if (!el) return;
      const chips = [
        { key: 'all', label: '全部', emoji: '🌟', color: '#3a2f2a' },
        ...Object.entries(TASK_TYPE_META).map(([key, m]) => ({ key, label: m.label, emoji: m.emoji, color: m.color })),
      ];
      el.innerHTML = '';
      chips.forEach((c) => {
        const chip = document.createElement('div');
        chip.className = 'filter-chip' + (c.key === this.state.filter ? ' active' : '');
        chip.style.setProperty('--chip-color', c.color);
        chip.innerHTML = `${c.emoji} ${c.label}`;
        chip.addEventListener('click', () => {
          this.state.filter = c.key;
          this.renderFilters(); this.renderMap(); this.renderGrid();
        });
        el.appendChild(chip);
      });
    },

    renderGrid() {
      const grid = document.getElementById('taskGrid');
      if (!grid) return;
      const list = this.allTasks().filter((t) => this.state.filter === 'all' || t.type === this.state.filter);
      const counter = document.getElementById('taskCount');
      if (counter) counter.textContent = list.length;
      grid.innerHTML = '';
      list.forEach((t) => {
        const key = t.urgent ? 'urgent' : t.type;
        const meta = TASK_TYPE_META[key] || TASK_TYPE_META.donation;
        const div = document.createElement('div');
        div.className = 'task-cardlet' + (t.hero ? ' hero' : '');
        div.innerHTML = `
          <span class="tag" style="background:${meta.color}">${meta.emoji} ${meta.label}</span>
          <div class="t-title">${t.title}</div>
          <div class="t-actor">👤 ${t.actor || '匿名'} · ${t.desc || ''}</div>
          ${t.hero ? this.buildLifecycleMini() : ''}
        `;
        div.addEventListener('click', () => this.openTaskDetail(t));
        grid.appendChild(div);
      });
    },

    buildLifecycleMini() {
      const done = ChainState.getStages().map((s) => s.id);
      return `<div class="lifecycle-mini">` + TASK_STAGES.map((s, i) =>
        `<span class="${done.includes(s.id) ? 'done' : ''}" title="${s.title}">${done.includes(s.id) ? '✓' : (i+1)}</span>`
      ).join('') + `</div>`;
    },

    openTaskDetail(t) {
      let role = 'donor';
      if (t.type === 'need') role = 'receiver';
      else if (t.type === 'carry') role = 'carrier';
      location.href = `action.html?role=${role}&task=${t.id}`;
    },

    bindPostSheet() {
      const mask = document.getElementById('postMask');
      const fab = document.getElementById('fabPost');
      if (!mask || !fab) return;

      this.renderTypePicker();
      fab.addEventListener('click', () => mask.classList.add('show'));
      document.getElementById('cancelPost').addEventListener('click', () => mask.classList.remove('show'));
      mask.addEventListener('click', (e) => {
        if (e.target === mask) mask.classList.remove('show');
      });
      document.getElementById('submitPost').addEventListener('click', () => {
        const title = document.getElementById('postTitle').value.trim();
        const desc = document.getElementById('postDesc').value.trim();
        if (!title) { alert('先给任务写个标题吧 ✏️'); return; }
        UserTasks.post({
          type: this.state.selectedType,
          title,
          desc: desc || '刚发布',
          actor: '你',
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
        });
        document.getElementById('postTitle').value = '';
        document.getElementById('postDesc').value = '';
        mask.classList.remove('show');
      });
    },

    renderTypePicker() {
      const el = document.getElementById('typePicker');
      if (!el) return;
      el.innerHTML = '';
      ['donation', 'need', 'carry'].forEach((type) => {
        const meta = TASK_TYPE_META[type];
        const opt = document.createElement('div');
        opt.className = 'opt' + (type === this.state.selectedType ? ' active' : '');
        opt.style.setProperty('--opt-color', meta.color);
        opt.innerHTML = `<span class="em">${meta.emoji}</span>${meta.label}`;
        opt.addEventListener('click', () => {
          this.state.selectedType = type;
          this.renderTypePicker();
        });
        el.appendChild(opt);
      });
    },
  };

  global.LoveBoard = LoveBoard;
})(window);

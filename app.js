const quotes = [
    "每一个不曾起舞的日子，都是对生命的辜负。",
    "自律给我自由。",
    "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。",
    "今天的努力，是明天的骄傲。",
    "坚持就是胜利，放弃才是失败。",
    "优秀是一种习惯，而非一时的行为。",
    "你的坚持，终将美好。",
    "每天进步一点点，就是通往成功的最佳路径。",
    "自律的人，运气都不会太差。",
    "梦想不会逃跑，逃跑的永远是自己。",
    "行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。",
    "你现在的努力，是为了以后有更多的选择。",
    "不要等待机会，而要创造机会。",
    "把每一件简单的事做好就是不简单，把每一件平凡的事做好就是不平凡。",
    "最怕你一生碌碌无为，还安慰自己平凡可贵。"
];

const encourageMessages = [
    "太棒了！你正在成为更好的自己！🎉",
    "恭喜你完成今日计划！坚持就是胜利！💪",
    "优秀！你的自律正在改变你的人生！⭐",
    "完美！继续保持这份热情！🌟",
    "太厉害了！你比昨天更强大了！🚀",
    "做得好！成功的路上，你从未停歇！🏆",
    "恭喜！你的坚持终将绽放光芒！✨",
    "完美达成！你正在创造奇迹！🌈",
    "太赞了！你的努力不会被辜负！💫",
    "出色完成！自律的你最迷人！💖"
];

const reminderMessages = [
    "别灰心！昨天没完成的计划，今天继续加油！💪",
    "每一次跌倒都是为了更好地站起来！继续前进！🌟",
    "过去的已经过去，重要的是现在开始行动！🚀",
    "失败是成功之母，今天的你会更棒！💪",
    "不要被昨天影响，今天又是新的一天！✨",
    "坚持就是胜利，让我们一起重新出发！🌈"
];

class SelfDisciplineApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.plans = this.loadPlans();
        this.completions = this.loadCompletions();
        this.adjustHistory = this.loadAdjustHistory();
        this.pendingPlanData = null;
        this.currentPlanToComplete = null;
        this.currentAdjustPlan = null;
        this.currentTab = 'single';
        this.selectedPlans = new Set();
        this.currentPeriodicPlan = null;
        this.pendingDocPlans = null;
        this.analysisDate = new Date();
        this.filteredPlansForCancel = [];
        this.pendingCancelAll = false;
        
        this.init();
    }

    init() {
        try {
            this.cleanupOrphanedOverlays();
            this.updateTheme();
            this.updateQuote();
            this.renderCalendar();
            this.updateStats();
            this.bindEvents();
            this.renderPlansForDate(this.formatDate(new Date()));
            this.checkYesterdayReminder();
            
            setInterval(() => this.updateTheme(), 60000);
            console.log('✅ 自律打卡系统初始化成功');
        } catch (error) {
            console.error('❌ 初始化错误:', error);
        }
    }

    cleanupOrphanedOverlays() {
        document.querySelectorAll('.modal-overlay:not(#globalModalOverlay)').forEach(overlay => {
            const modals = overlay.querySelectorAll('.modal');
            modals.forEach(modal => document.body.appendChild(modal));
            overlay.remove();
        });
        console.log('✅ 已清理残留遮罩层');
    }

    updateTheme() {
        const hour = new Date().getHours();
        const body = document.body;
        
        body.classList.remove('theme-morning', 'theme-noon', 'theme-evening', 'theme-night');
        
        if (hour >= 6 && hour < 12) {
            body.classList.add('theme-morning');
        } else if (hour >= 12 && hour < 17) {
            body.classList.add('theme-noon');
        } else if (hour >= 17 && hour < 20) {
            body.classList.add('theme-evening');
        } else {
            body.classList.add('theme-night');
        }
    }

    updateQuote() {
        const quoteText = document.getElementById('quoteText');
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = `"${randomQuote}"`;
    }

    updateStats() {
        const today = new Date();
        const todayStr = this.formatDate(today);
        const todayPlans = this.getPlansForDate(todayStr);
        const completedPlans = this.getCompletedPlansForDate(todayStr);
        
        document.getElementById('todayTotal').textContent = todayPlans.length;
        document.getElementById('todayCompleted').textContent = completedPlans.length;
        
        const rate = todayPlans.length > 0 
            ? Math.round((completedPlans.length / todayPlans.length) * 100) 
            : 0;
        document.getElementById('todayRate').textContent = `${rate}%`;
        
        const streak = this.calculateStreak();
        document.getElementById('streakDays').textContent = `${streak}天`;
    }

    calculateStreak() {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = this.formatDate(checkDate);
            const dayPlans = this.getPlansForDate(dateStr);
            
            if (dayPlans.length === 0) {
                continue;
            }
            
            const allCompleted = dayPlans.every(plan => {
                const completionKey = `${dateStr}-${plan.id}`;
                return this.completions[completionKey];
            });
            
            if (allCompleted) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        document.getElementById('currentMonth').textContent = `${year}年${monthNames[month]}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const dayElement = this.createDayElement(day, true, new Date(year, month - 1, day));
            calendarGrid.appendChild(dayElement);
        }
        
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const dayElement = this.createDayElement(day, false, date, isToday);
            calendarGrid.appendChild(dayElement);
        }
        
        const remainingDays = 42 - (startDay + totalDays);
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = this.createDayElement(day, true, new Date(year, month + 1, day));
            calendarGrid.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth, date, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('empty');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        const dateStr = this.formatDate(date);
        const dayPlans = this.getPlansForDate(dateStr);
        const completedPlans = this.getCompletedPlansForDate(dateStr);
        
        if (dayPlans.length > 0) {
            if (dayPlans.length === completedPlans.length && dayPlans.length > 0) {
                dayElement.classList.add('completed');
            }
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        const dayInfo = document.createElement('div');
        dayInfo.className = 'calendar-day-info';
        
        if (dayPlans.length > 0) {
            const completionRate = dayPlans.length > 0 
                ? Math.round((completedPlans.length / dayPlans.length) * 100) 
                : 0;
            
            const completion = document.createElement('div');
            completion.className = 'calendar-day-completion';
            completion.textContent = `${completedPlans.length}/${dayPlans.length} · ${completionRate}%`;
            dayInfo.appendChild(completion);
            
            const plansDots = document.createElement('div');
            plansDots.className = 'calendar-day-plans';
            
            const displayDots = dayPlans.slice(0, 5);
            displayDots.forEach((plan, index) => {
                const dot = document.createElement('span');
                dot.className = 'calendar-day-plan-dot';
                const completionKey = `${dateStr}-${plan.id}`;
                if (this.completions[completionKey]) {
                    dot.classList.add('completed');
                }
                plansDots.appendChild(dot);
            });
            
            dayInfo.appendChild(plansDots);
        }
        
        dayElement.appendChild(dayInfo);
        
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                this.selectedDate = date;
                const dateStr = this.formatDate(date);
                
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                dayElement.classList.add('selected');
                
                this.showDayDetail(date);
            });
        }
        
        return dayElement;
    }

    formatDate(date) {
        if (!(date instanceof Date)) {
            if (typeof date === 'string') {
                date = new Date(date);
            } else {
                date = new Date();
            }
        }
        
        if (isNaN(date.getTime())) {
            date = new Date();
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getPlansForDate(dateStr) {
        return this.plans.filter(plan => {
            if (plan.isPeriodic) {
                const startDate = new Date(plan.startDate);
                const targetDate = new Date(dateStr);
                const diffTime = targetDate - startDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) return false;
                if (plan.endDate) {
                    const endDate = new Date(plan.endDate);
                    if (targetDate > endDate) return false;
                }
                
                return diffDays % plan.periodDays === 0;
            }
            return plan.date === dateStr;
        }).sort((a, b) => {
            if (a.order && b.order) {
                return a.order - b.order;
            }
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }

    getCompletedPlansForDate(dateStr) {
        const dayPlans = this.getPlansForDate(dateStr);
        return dayPlans.filter(plan => {
            const completionKey = `${dateStr}-${plan.id}`;
            return this.completions[completionKey];
        });
    }

    renderPlansForDate(dateStr) {
        const plansList = document.getElementById('plansList');
        const plansDate = document.getElementById('plansDate');
        const batchActionsBar = document.getElementById('batchActionsBar');
        const isBatchMode = document.getElementById('batchSelectAllPlans')?.checked || false;
        
        const date = new Date(dateStr);
        const dateDisplay = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        plansDate.textContent = dateDisplay;
        
        const dayPlans = this.getPlansForDate(dateStr);
        
        if (dayPlans.length === 0) {
            plansList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"></div>
                    <p>暂无计划，点击右上角添加</p>
                </div>
            `;
            batchActionsBar.style.display = 'none';
            return;
        }
        
        batchActionsBar.style.display = this.selectedPlans.size > 0 ? 'flex' : 'none';
        
        plansList.innerHTML = dayPlans.map(plan => {
            const completionKey = `${dateStr}-${plan.id}`;
            const isCompleted = this.completions[completionKey];
            const isSelected = this.selectedPlans.has(plan.id);
            const canComplete = this.canCompletePlan(new Date(dateStr));
            
            return `
                <div class="plan-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'plan-item-checkbox selected' : ''}" 
                     data-plan-id="${plan.id}">
                    <input type="checkbox" class="plan-checkbox" 
                           data-plan-id="${plan.id}" 
                           ${isSelected ? 'checked' : ''}
                           style="display: ${isBatchMode ? 'block' : 'none'}">
                    <div class="plan-body">
                        <div class="plan-item-header">
                            <span class="plan-item-title">${plan.title}</span>
                            <span class="plan-item-status priority-${plan.priority || 'medium'}">
                                ${isCompleted ? '已完成' : plan.priority === 'high' ? '高优先级' : plan.priority === 'low' ? '低优先' : '进行中'}
                            </span>
                        </div>
                        ${plan.content ? `<div class="plan-item-content">${plan.content}</div>` : ''}
                        ${plan.isPeriodic ? `<div class="plan-periodic">每${plan.periodDays}天重复${plan.endDate ? ` 至 ${plan.endDate}` : ''}</div>` : ''}
                        <div class="plan-item-actions">
                            ${!isCompleted ? `
                                <button class="btn-complete small" 
                                    data-plan-id="${plan.id}" 
                                    data-date="${dateStr}"
                                    ${!canComplete ? 'disabled' : ''}>
                                    ${canComplete ? '完成' : '未到日期'}
                                </button>
                            ` : ''}
                            <button class="btn-delete small" 
                                data-plan-id="${plan.id}">
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        plansList.querySelectorAll('.plan-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const planId = e.target.dataset.planId;
                const item = checkbox.closest('.plan-item');
                if (e.target.checked) {
                    this.selectedPlans.add(planId);
                    item.classList.add('selected');
                } else {
                    this.selectedPlans.delete(planId);
                    item.classList.remove('selected');
                }
                this.updateSelectedCount();
            });
        });
        
        plansList.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planId = e.target.dataset.planId;
                const date = e.target.dataset.date;
                this.confirmCompletePlan(planId, date);
            });
        });
        
        plansList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planId = e.target.dataset.planId;
                this.deletePlan(planId);
            });
        });
    }

    deletePlan(planId) {
        this.plans = this.plans.filter(p => p.id !== planId);
        this.savePlans();
        this.renderCalendar();
        this.updateStats();
        const dateForRender = this.selectedDate ? this.formatDate(this.selectedDate) : this.formatDate(new Date());
        this.renderPlansForDate(dateForRender);
        this.showToast('计划已删除');
    }

    confirmCompletePlan(planId, date) {
        const globalState = { planId, date };
        this.pendingCompletePlan = globalState;
        window.app = this;
        window.__PENDING_PLAN = globalState;
        window.pendingCompletePlan = globalState;
        
        const modal = document.getElementById('confirmModal');
        this.activateModal(modal);
        
        const cancelBtn = document.getElementById('cancelComplete');
        const confirmBtn = document.getElementById('confirmComplete');
        
        cancelBtn.disabled = true;
        confirmBtn.disabled = true;
        cancelBtn.setAttribute('disabled', 'disabled');
        confirmBtn.setAttribute('disabled', 'disabled');
        cancelBtn.classList.add('btn-disabled');
        confirmBtn.classList.add('btn-disabled');
        
        setTimeout(() => {
            cancelBtn.disabled = false;
            confirmBtn.disabled = false;
            cancelBtn.removeAttribute('disabled');
            confirmBtn.removeAttribute('disabled');
            cancelBtn.classList.remove('btn-disabled');
            confirmBtn.classList.remove('btn-disabled');
            
            cancelBtn.style.cssText = `
                pointer-events: auto !important;
                cursor: pointer !important;
                opacity: 1 !important;
            `;
            confirmBtn.style.cssText = `
                pointer-events: auto !important;
                cursor: pointer !important;
                opacity: 1 !important;
            `;
            
            cancelBtn.style.animation = 'none';
            confirmBtn.style.animation = 'none';
            cancelBtn.offsetHeight;
            confirmBtn.offsetHeight;
            cancelBtn.classList.add('btn-unlocked');
            confirmBtn.classList.add('btn-unlocked');
            
            console.log('✨ 按钮解禁完成，现在可以点击！');
            console.log('🔍 最终状态确认 - __PENDING_PLAN:', window.__PENDING_PLAN);
            
            setTimeout(() => {
                cancelBtn.classList.remove('btn-unlocked');
                confirmBtn.classList.remove('btn-unlocked');
            }, 600);
        }, 1500);
    }

    completePlan(planId, date) {
        console.log('📝 执行完成计划:', planId, date);
        const completionKey = `${date}-${planId}`;
        this.completions[completionKey] = true;
        this.saveCompletions();
        this.renderCalendar();
        this.updateStats();
        const renderDate = this.selectedDate ? this.formatDate(this.selectedDate) : this.formatDate(new Date());
        this.renderPlansForDate(renderDate);
        
        if (this.selectedDate) {
            this.showDayDetail(this.selectedDate);
        }
        
        const modal = document.getElementById('confirmModal');
        this.deactivateModal(modal);
        this.closeAllModals();
        
        this.showToast('太棒了！计划已完成 🎉');
        console.log('✅ 计划完成，弹窗关闭');
    }

    showDayDetail(date) {
        if (date instanceof Date) {
            this.selectedDate = date;
        } else if (typeof date === 'string') {
            this.selectedDate = new Date(date);
            if (isNaN(this.selectedDate.getTime())) {
                this.selectedDate = new Date();
            }
        } else {
            this.selectedDate = new Date();
        }
        
        const dateStr = this.formatDate(this.selectedDate);
        const dayPlans = this.getPlansForDate(dateStr);
        
        this.renderPlansForDate(dateStr);
        
        const modal = document.getElementById('dayDetailModal');
        const title = document.getElementById('dayDetailTitle');
        const plansContainer = document.getElementById('dayPlans');
        
        const completedCount = dayPlans.filter(p => this.completions[`${dateStr}-${p.id}`]).length;
        const pendingCount = dayPlans.length - completedCount;
        
        const dateDisplay = `${this.selectedDate.getFullYear()}年${this.selectedDate.getMonth() + 1}月${this.selectedDate.getDate()}日`;
        title.textContent = dateDisplay;
        
        if (dayPlans.length === 0) {
            plansContainer.innerHTML = `
                <div class="day-detail-plans-header">
                    <div class="day-detail-date">📅 ${dateDisplay}</div>
                    <div class="day-detail-stats">
                        <div class="day-stat-badge completed">✓ 已完成 0</div>
                        <div class="day-stat-badge pending">○ 待执行 0</div>
                    </div>
                </div>
                <div class="no-plans-state">
                    <div class="no-plans-icon"><span>✨</span></div>
                    <div class="no-plans-text">今天暂无计划安排</div>
                    <div class="no-plans-hint">点击下方添加计划开始你的自律之旅</div>
                </div>
            `;
        } else {
            const plansHtml = dayPlans.map(plan => {
                const completionKey = `${dateStr}-${plan.id}`;
                const isCompleted = this.completions[completionKey];
                const canComplete = this.canCompletePlan(this.selectedDate);
                
                return `
                    <div class="plan-item ${isCompleted ? 'completed' : ''}">
                        <div class="plan-item-header">
                            <span class="plan-item-title">${plan.title}</span>
                            <span class="plan-item-status ${isCompleted ? 'tag-success' : 'tag-warning'} tag">
                                ${isCompleted ? '✓ 已完成' : '○ 进行中'}
                            </span>
                        </div>
                        <div class="plan-item-content">${plan.content || ''}</div>
                        <div class="plan-item-actions">
                            ${!isCompleted ? `
                                <button class="btn-complete" 
                                    data-plan-id="${plan.id}" 
                                    data-date="${dateStr}"
                                    ${!canComplete ? 'disabled' : ''}>
                                    ${canComplete ? '标记完成' : '未到执行日期'}
                                </button>
                            ` : ''}
                            ${!plan.isPeriodic ? `
                                <button class="btn-edit" 
                                    data-plan-id="${plan.id}" 
                                    data-date="${dateStr}">
                                    调整日期
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            plansContainer.innerHTML = `
                <div class="day-detail-plans-header">
                    <div class="day-detail-date">📅 ${dateDisplay}</div>
                    <div class="day-detail-stats">
                        <div class="day-stat-badge completed">✓ 已完成 ${completedCount}</div>
                        <div class="day-stat-badge pending">○ 待执行 ${pendingCount}</div>
                    </div>
                </div>
                ${plansHtml}
            `;
            
            plansContainer.querySelectorAll('.btn-complete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const planId = e.target.dataset.planId;
                    const date = e.target.dataset.date;
                    this.confirmCompletePlan(planId, date);
                });
            });
            
            plansContainer.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const planId = e.target.dataset.planId;
                    const date = e.target.dataset.date;
                    this.openAdjustSingleModal(planId, date);
                });
            });
        }
        
        this.activateModal(modal);
    }

    canCompletePlan(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return targetDate <= today;
    }


    showEncourage() {
        const modal = document.getElementById('encourageModal');
        const randomMessage = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
        document.getElementById('encourageText').textContent = randomMessage;
        this.activateModal(modal);
    }

    checkYesterdayReminder() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.formatDate(yesterday);
        
        const yesterdayPlans = this.getPlansForDate(yesterdayStr);
        const hasIncompleteYesterday = yesterdayPlans.some(plan => {
            const completionKey = `${yesterdayStr}-${plan.id}`;
            return !this.completions[completionKey];
        });
        
        if (hasIncompleteYesterday) {
            const lastReminderKey = `reminder-${yesterdayStr}`;
            const lastReminder = this.safeLocalStorage('get', lastReminderKey);
            const todayStr = this.formatDate(today);
            
            if (lastReminder !== todayStr) {
                setTimeout(() => {
                    const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
                    document.getElementById('reminderText').textContent = randomMessage;
                    document.getElementById('reminderModal').classList.add('active');
                    this.safeLocalStorage('set', lastReminderKey, todayStr);
                }, 1000);
            }
        }
    }

    bindEventIfExists(elementId, handler) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('click', (e) => {
                    try {
                        handler(e);
                    } catch (error) {
                        console.error('❌ 按钮事件处理错误:', elementId, error);
                    }
                });
            }
        } catch (error) {
            console.error('❌ 绑定事件失败:', elementId, error);
        }
    }

    verifyFunctions() {
        const requiredFunctions = [
            'openImportModal',
            'openAdjustModal',
            'openHistoryModal',
            'openCancelModal',
            'openPeriodicManageModal',
            'openAnalysisModal',
            'showDayDetail',
            'renderCalendar'
        ];
        
        let allOk = true;
        requiredFunctions.forEach(funcName => {
            if (typeof this[funcName] !== 'function') {
                console.error('❌ 缺失关键函数:', funcName);
                allOk = false;
            }
        });
        
        if (allOk) {
            console.log('✅ 所有核心功能函数检查通过');
        }
    }

    bindCloseButtons() {
        const closeButtons = [
            'closeImportModal',
            'closeDayDetailModal',
            'closeAdjustModal',
            'closeAdjustSingleModal',
            'closeHistoryModal',
            'closeCancelModal',
            'closePeriodicModal',
            'closePeriodicAdjustModal'
        ];
        
        closeButtons.forEach(btnId => {
            this.bindEventIfExists(btnId, () => {
                const modal = document.getElementById(btnId).closest('.modal');
                if (modal) {
                    this.deactivateModal(modal);
                }
            });
        });
        
        this.bindEventIfExists('closeConfirm', () => {
            const modal = document.getElementById('confirmModal');
            modal.classList.remove('active');
        });
        
        this.bindEventIfExists('closeBatchConfirm', () => {
            const modal = document.getElementById('batchConfirmModal');
            modal.classList.remove('active');
        });
    }

    bindEvents() {
        const self = this;
        
        document.addEventListener('click', function(e) {
            try {
                const target = e.target.closest('button, [id]');
                if (!target) return;
                
                if (target.id === 'confirmComplete' || target.id === 'cancelComplete' || target.classList.contains('btn-complete')) {
                    return;
                }
                
                if (target.classList.contains('btn-edit')) {
                    const planId = target.dataset.planId;
                    const date = target.dataset.date;
                    self.openAdjustSingleModal(planId, date);
                    return;
                }
                
                if (target.classList.contains('btn-cancel-plan')) {
                    const planId = target.dataset.planId;
                    self.singleCancelPlan(planId);
                    return;
                }
                
                switch(target.id) {
                    case 'prevMonth':
                        self.currentDate.setMonth(self.currentDate.getMonth() - 1);
                        self.renderCalendar();
                        break;
                    case 'nextMonth':
                        self.currentDate.setMonth(self.currentDate.getMonth() + 1);
                        self.renderCalendar();
                        break;
                    case 'importPlanBtn':
                        self.openImportModal();
                        break;
                    case 'adjustPlanBtn':
                        self.openAdjustModal();
                        break;
                    case 'historyBtn':
                        self.openHistoryModal();
                        break;
                    case 'cancelPlanBtn':
                        self.openCancelModal();
                        break;
                    case 'periodicManageBtn':
                        self.openPeriodicManageModal();
                        break;
                    case 'analyticsBtn':
                        self.openAnalysisModal();
                        break;
                    case 'addPlanBtn':
                        self.showDayDetail(self.selectedDate || new Date());
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error('❌ 按钮点击处理错误:', error, 'ID:', e.target.id);
            }
        });
        
        console.log('✅ 全局事件委托绑定成功 - 所有按钮支持动态渲染');
        
        this.verifyFunctions();
        this.bindCloseButtons();
        
        this.bindEventIfExists('selectAllBtn', () => this.toggleSelectAll());
        this.bindEventIfExists('deselectAllBtn', () => this.deselectAllPlans());
        this.bindEventIfExists('batchCancelBtn', () => this.batchCancelPlans());
        this.bindEventIfExists('cancelAllPlansBtn', () => this.cancelAllPlans());
        this.bindEventIfExists('applyFilterBtn', () => this.applyCancelFilter());
        
        this.bindEventIfExists('batchCompleteBtn', () => this.batchCompletePlans());
        this.bindEventIfExists('batchDeleteBtn', () => this.batchDeletePlans());
        
        const batchSelectAllPlans = document.getElementById('batchSelectAllPlans');
        if (batchSelectAllPlans) {
            batchSelectAllPlans.addEventListener('change', (e) => {
                const batchSelectBtn = document.getElementById('batchSelectBtn');
                if (e.target.checked) {
                    batchSelectBtn.classList.add('active');
                    document.body.classList.add('batch-select-mode');
                } else {
                    batchSelectBtn.classList.remove('active');
                    document.body.classList.remove('batch-select-mode');
                    this.deselectAllPlans();
                }
                this.togglePlanCheckboxes(e.target.checked);
            });
        }
        
        const cancelDateFilter = document.getElementById('cancelDateFilter');
        if (cancelDateFilter) {
            cancelDateFilter.addEventListener('change', (e) => this.handleDateFilterChange(e));
        }
        
        this.bindEventIfExists('cancelBatchConfirm', () => {
            document.getElementById('batchConfirmModal')?.classList.remove('active');
        });
        this.bindEventIfExists('confirmBatchCancel', () => this.executeBatchCancel());
        this.bindEventIfExists('closeResultBtn', () => {
            document.getElementById('batchResultModal')?.classList.remove('active');
        });
        
        this.bindEventIfExists('uploadModeBtn', () => this.switchImportMode('upload'));
        this.bindEventIfExists('manualModeBtn', () => this.switchImportMode('manual'));
        this.bindEventIfExists('addAnotherPlan', () => this.addManualPlan(true));
        this.bindEventIfExists('confirmManualPlan', () => this.addManualPlan(false));
        this.bindEventIfExists('clearImportForm', () => this.clearImportForm());
        
        document.querySelectorAll('.import-type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchImportType(type);
            });
        });
        
        const manualIsPeriodic = document.getElementById('manualIsPeriodic');
        if (manualIsPeriodic) {
            manualIsPeriodic.addEventListener('change', (e) => {
                const periodicOptions = document.getElementById('manualPeriodicOptions');
                if (e.target.checked) {
                    periodicOptions.style.display = 'block';
                } else {
                    periodicOptions.style.display = 'none';
                }
            });
        }
        
        const analysisBtn = document.getElementById('analysisBtn');
        if (analysisBtn) {
            analysisBtn.addEventListener('click', () => {
                this.openAnalysisModal();
            });
        }
        
        this.bindEventIfExists('closeAnalysisModal', () => {
            document.getElementById('analysisModal')?.classList.remove('active');
        });
        this.bindEventIfExists('prevDayAnalysis', () => this.navigateAnalysisDate(-1));
        this.bindEventIfExists('nextDayAnalysis', () => this.navigateAnalysisDate(1));
        this.bindEventIfExists('closePeriodicModal', () => {
            document.getElementById('periodicManageModal')?.classList.remove('active');
        });
        this.bindEventIfExists('closePeriodicAdjustModal', () => {
            document.getElementById('periodicAdjustModal')?.classList.remove('active');
        });
        this.bindEventIfExists('cancelPeriodicAdjust', () => {
            document.getElementById('periodicAdjustModal')?.classList.remove('active');
            this.currentPeriodicPlan = null;
        });
        this.bindEventIfExists('confirmPeriodicAdjust', () => this.confirmPeriodicAdjust());
        
        this.bindEventIfExists('closeImportModal', () => this.closeImportModal());
        this.bindEventIfExists('closeDayDetailModal', () => {
            document.getElementById('dayDetailModal')?.classList.remove('active');
        });
        this.bindEventIfExists('closeCancelModal', () => {
            document.getElementById('cancelPlanModal')?.classList.remove('active');
        });
        this.bindEventIfExists('closeAdjustModal', () => {
            document.getElementById('adjustModal')?.classList.remove('active');
        });
        this.bindEventIfExists('closeHistoryModal', () => {
            document.getElementById('historyModal')?.classList.remove('active');
        });
        this.bindEventIfExists('closeAdjustSingleModal', () => {
            document.getElementById('adjustSingleModal')?.classList.remove('active');
        });
        
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--accent-color)';
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                const file = e.dataTransfer.files[0];
                if (file) this.handleFileUpload(file);
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.handleFileUpload(file);
            });
        }
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        this.bindEventIfExists('confirmImport', () => this.importPlan());
        
        this.bindEventIfExists('closeEncourage', () => {
            document.getElementById('encourageModal')?.classList.remove('active');
        });
        
        this.bindEventIfExists('closeReminder', () => {
            document.getElementById('reminderModal')?.classList.remove('active');
        });
        
        this.bindEventIfExists('cancelAdjust', () => {
            document.getElementById('adjustSingleModal')?.classList.remove('active');
            this.currentAdjustPlan = null;
        });
        
        this.bindEventIfExists('confirmAdjust', () => this.confirmAdjustPlan());
        
        document.querySelectorAll('.modal, .modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                    this.deactivateModal(e.target);
                }
            });
        });
        
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.deactivateModal(modal);
                }
            });
        });
    }

    openPeriodicManageModal() {
        const modal = document.getElementById('periodicManageModal');
        const periodicPlans = this.plans.filter(p => p.isPeriodic);
        const listContainer = document.getElementById('periodicPlanList');
        
        if (periodicPlans.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"></div>
                    <p>暂无周期性计划</p>
                </div>
            `;
        } else {
            listContainer.innerHTML = periodicPlans.map(plan => `
                <div class="periodic-plan-item">
                    <div class="periodic-plan-info">
                        <div class="periodic-plan-title">${plan.title}</div>
                        <div class="periodic-plan-detail">
                            每${plan.periodDays}天 | 开始: ${plan.startDate}
                            ${plan.endDate ? ` | 结束: ${plan.endDate}` : ''}
                        </div>
                    </div>
                    <button class="btn-adjust-periodic" data-plan-id="${plan.id}">调整</button>
                </div>
            `).join('');
            
            listContainer.querySelectorAll('.btn-adjust-periodic').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const planId = e.target.dataset.planId;
                    this.openPeriodicAdjustModal(planId);
                });
            });
        }
        
        this.activateModal(modal);
    }

    getOrCreateOverlay() {
        let overlay = document.getElementById('globalModalOverlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'globalModalOverlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        }
        
        return overlay;
    }

    activateModal(modalElement) {
        this.closeAllModals();
        
        const overlay = this.getOrCreateOverlay();
        overlay.appendChild(modalElement);
        
        modalElement.style.opacity = '0';
        modalElement.style.transform = 'scale(0.9)';
        modalElement.style.display = 'block';
        
        setTimeout(() => {
            overlay.classList.add('active');
            modalElement.style.opacity = '1';
            modalElement.style.transform = 'scale(1)';
        }, 50);
        
        this.currentOpenModal = modalElement;
    }

    deactivateModal(modalElement) {
        const overlay = document.getElementById('globalModalOverlay');
        if (overlay && overlay.contains(modalElement)) {
            document.body.appendChild(modalElement);
        }
        
        modalElement.style.display = 'none';
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        this.currentOpenModal = null;
    }

    closeAllModals() {
        const overlay = document.getElementById('globalModalOverlay');
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
            if (overlay && overlay.contains(modal)) {
                document.body.appendChild(modal);
            }
        });
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        this.currentOpenModal = null;
    }

    openPeriodicAdjustModal(planId) {
        const plan = this.plans.find(p => p.id === planId);
        if (!plan) return;
        
        this.currentPeriodicPlan = plan;
        const adjustModal = document.getElementById('periodicAdjustModal');
        
        document.getElementById('periodicPlanName').textContent = plan.title;
        document.getElementById('currentPeriod').textContent = `每${plan.periodDays}天 | 开始: ${plan.startDate}`;
        document.getElementById('newPeriodDays').value = plan.periodDays;
        document.getElementById('newStartDate').value = plan.startDate;
        
        this.closeAllModals();
        this.activateModal(adjustModal);
    }

    confirmPeriodicAdjust() {
        if (!this.currentPeriodicPlan) return;
        
        const newPeriodDays = parseInt(document.getElementById('newPeriodDays').value);
        const newStartDate = document.getElementById('newStartDate').value;
        const newEndDate = document.getElementById('newEndDate').value;
        
        if (!newStartDate) {
            this.showToast('请选择开始日期');
            return;
        }
        
        if (newPeriodDays < 1 || newPeriodDays > 365) {
            this.showToast('周期天数需在1-365之间');
            return;
        }
        
        this.currentPeriodicPlan.periodDays = newPeriodDays;
        this.currentPeriodicPlan.startDate = newStartDate;
        this.currentPeriodicPlan.endDate = newEndDate || null;
        
        this.savePlans();
        
        this.showToast('周期性计划已更新');
        document.getElementById('periodicAdjustModal').classList.remove('active');
        this.renderCalendar();
        this.updateStats();
        this.currentPeriodicPlan = null;
    }

    toggleSelectAll() {
        const cancelCheckboxes = document.querySelectorAll('.cancel-plan-checkbox');
        const planCheckboxes = document.querySelectorAll('.plan-checkbox');
        
        if (cancelCheckboxes.length > 0) {
            const plans = this.filteredPlansForCancel || this.plans;
            const allSelected = plans.every(p => this.selectedPlans.has(p.id));
            
            if (allSelected) {
                plans.forEach(p => this.selectedPlans.delete(p.id));
            } else {
                plans.forEach(p => this.selectedPlans.add(p.id));
            }
            
            cancelCheckboxes.forEach(cb => {
                const planId = cb.dataset.planId;
                cb.checked = this.selectedPlans.has(planId);
                const item = cb.closest('.cancel-plan-item');
                if (cb.checked) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
            
            this.updateSelectedCount();
        } else if (planCheckboxes.length > 0) {
            const allChecked = Array.from(planCheckboxes).every(cb => cb.checked);
            
            planCheckboxes.forEach(cb => {
                cb.checked = !allChecked;
                const planId = cb.dataset.planId;
                const item = cb.closest('.plan-item-checkbox');
                
                if (!allChecked) {
                    this.selectedPlans.add(planId);
                    item?.classList.add('selected');
                } else {
                    this.selectedPlans.delete(planId);
                    item?.classList.remove('selected');
                }
            });
            
            this.updateSelectedCount();
        } else {
            this.showToast('暂无可选择的计划');
        }
    }

    togglePlanCheckboxes(show) {
        const planItems = document.querySelectorAll('.plan-item');
        planItems.forEach(item => {
            const checkbox = item.querySelector('.plan-checkbox');
            if (checkbox) {
                checkbox.style.display = show ? 'block' : 'none';
            }
        });
    }

    batchCompletePlans() {
        if (this.selectedPlans.size === 0) {
            this.showToast('请先选择要完成的计划');
            return;
        }
        
        let completed = 0;
        this.selectedPlans.forEach(planId => {
            const plan = this.plans.find(p => p.id === planId);
            if (plan && !plan.completed) {
                plan.completed = true;
                plan.completedAt = new Date().toISOString();
                completed++;
            }
        });
        
        this.savePlans();
        this.renderCalendar();
        this.updateStats();
        const renderDate1 = this.selectedDate ? this.formatDate(this.selectedDate) : this.formatDate(new Date());
        this.renderPlansForDate(renderDate1);
        this.deselectAllPlans();
        
        document.getElementById('batchSelectAllPlans').checked = false;
        document.getElementById('batchSelectBtn').classList.remove('active');
        document.body.classList.remove('batch-select-mode');
        this.togglePlanCheckboxes(false);
        
        this.showToast(`已批量完成 ${completed} 个计划`);
        
        if (completed > 0) {
            this.checkAndShowEncourage();
        }
    }

    batchDeletePlans() {
        if (this.selectedPlans.size === 0) {
            this.showToast('请先选择要删除的计划');
            return;
        }
        
        const deleted = this.selectedPlans.size;
        this.plans = this.plans.filter(p => !this.selectedPlans.has(p.id));
        
        this.savePlans();
        this.renderCalendar();
        this.updateStats();
        const renderDate2 = this.selectedDate ? this.formatDate(this.selectedDate) : this.formatDate(new Date());
        this.renderPlansForDate(renderDate2);
        this.deselectAllPlans();
        
        document.getElementById('batchSelectAllPlans').checked = false;
        document.getElementById('batchSelectBtn').classList.remove('active');
        document.body.classList.remove('batch-select-mode');
        this.togglePlanCheckboxes(false);
        
        this.showToast(`已批量删除 ${deleted} 个计划`);
    }

    batchCancelPlans() {
        if (this.selectedPlans.size === 0) {
            this.showToast('请先选择要取消的计划');
            return;
        }
        
        const confirmModal = document.getElementById('batchConfirmModal');
        const confirmCount = document.getElementById('confirmCount');
        
        confirmCount.textContent = this.selectedPlans.size;
        confirmModal.classList.add('active');
    }

    executeBatchCancel() {
        const confirmModal = document.getElementById('batchConfirmModal');
        confirmModal.classList.remove('active');
        
        let planIdsToCancel;
        let canceledPlans = [];
        
        if (this.pendingCancelAll) {
            planIdsToCancel = this.plans.map(p => p.id);
            this.pendingCancelAll = false;
        } else {
            planIdsToCancel = Array.from(this.selectedPlans);
        }
        
        const cancelCount = planIdsToCancel.length;
        
        try {
            planIdsToCancel.forEach(planId => {
                const plan = this.plans.find(p => p.id === planId);
                if (plan) {
                    canceledPlans.push({
                        title: plan.title,
                        date: plan.date
                    });
                }
                
                const planIndex = this.plans.findIndex(p => p.id === planId);
                if (planIndex !== -1) {
                    this.plans.splice(planIndex, 1);
                }
                
                Object.keys(this.completions).forEach(key => {
                    if (key.includes(planId)) {
                        delete this.completions[key];
                    }
                });
            });
            
            this.savePlans();
            this.saveCompletions();
            
            this.selectedPlans.clear();
            this.filteredPlansForCancel = [...this.plans];
            
            this.showBatchResult(true, cancelCount, canceledPlans);
            
            this.renderCalendar();
            this.updateStats();
            
            const modal = document.getElementById('cancelPlanModal');
            if (modal) {
                modal.classList.remove('active');
            }
            
        } catch (error) {
            console.error('批量取消失败:', error);
            this.showBatchResult(false, 0, [], '操作过程中发生错误');
        }
    }

    showBatchResult(success, count, canceledPlans, errorMsg = '') {
        const resultModal = document.getElementById('batchResultModal');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultDetails = document.getElementById('resultDetails');
        const resultList = document.getElementById('resultList');
        
        if (success) {
            resultIcon.textContent = '✅';
            resultIcon.className = 'result-icon success';
            resultTitle.textContent = '批量取消成功';
            resultDetails.textContent = `已成功取消 ${count} 个计划`;
            
            if (canceledPlans.length > 0) {
                resultList.innerHTML = canceledPlans.slice(0, 10).map(plan => `
                    <div class="result-list-item">
                        <strong>${plan.date}</strong> - ${this.escapeHtml(plan.title)}
                    </div>
                `).join('');
                
                if (canceledPlans.length > 10) {
                    resultList.innerHTML += `
                        <div class="result-list-item" style="text-align: center; color: var(--text-secondary);">
                            还有 ${canceledPlans.length - 10} 个计划...
                        </div>
                    `;
                }
                resultList.style.display = 'block';
            } else {
                resultList.style.display = 'none';
            }
        } else {
            resultIcon.textContent = '❌';
            resultIcon.className = 'result-icon error';
            resultTitle.textContent = '操作失败';
            resultDetails.textContent = errorMsg || '批量取消过程中发生错误，请重试';
            resultList.style.display = 'none';
        }
        
        resultModal.classList.add('active');
    }

    openCancelModal() {
        const modal = document.getElementById('cancelPlanModal');
        
        this.selectedPlans.clear();
        this.filteredPlansForCancel = [...this.plans];
        this.updateSelectedCount();
        this.renderCancelPlanList();
        
        this.activateModal(modal);
    }

    singleCancelPlan(planId) {
        this.plans = this.plans.filter(p => p.id !== planId);
        
        Object.keys(this.completions).forEach(key => {
            if (key.includes(planId)) {
                delete this.completions[key];
            }
        });
        
        this.savePlans();
        this.saveCompletions();
        
        this.selectedPlans.delete(planId);
        this.filteredPlansForCancel = this.filteredPlansForCancel.filter(p => p.id !== planId);
        
        this.showToast('计划已取消');
        this.renderCalendar();
        this.updateStats();
        this.renderCancelPlanList();
        this.updateSelectedCount();
    }

    handleDateFilterChange(e) {
        const value = e.target.value;
        const customDateRange = document.getElementById('customDateRange');
        const customDateRangeEnd = document.getElementById('customDateRangeEnd');
        
        if (value === 'custom') {
            customDateRange.style.display = 'flex';
            customDateRangeEnd.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
            customDateRangeEnd.style.display = 'none';
        }
    }

    applyCancelFilter() {
        const dateFilter = document.getElementById('cancelDateFilter').value;
        const typeFilter = document.getElementById('cancelTypeFilter').value;
        const today = this.formatDate(new Date());
        
        let filtered = [...this.plans];
        
        switch (dateFilter) {
            case 'today':
                filtered = filtered.filter(p => p.date === today);
                break;
            case 'week':
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                filtered = filtered.filter(p => {
                    const planDate = new Date(p.date);
                    return planDate >= weekStart && planDate <= weekEnd;
                });
                break;
            case 'month':
                const monthStart = new Date();
                monthStart.setDate(1);
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
                filtered = filtered.filter(p => {
                    const planDate = new Date(p.date);
                    return planDate >= monthStart && planDate <= monthEnd;
                });
                break;
            case 'past':
                filtered = filtered.filter(p => p.date < today);
                break;
            case 'future':
                filtered = filtered.filter(p => p.date > today);
                break;
            case 'custom':
                const startDate = document.getElementById('cancelStartDate').value;
                const endDate = document.getElementById('cancelEndDate').value;
                if (startDate && endDate) {
                    filtered = filtered.filter(p => p.date >= startDate && p.date <= endDate);
                }
                break;
        }
        
        switch (typeFilter) {
            case 'single':
                filtered = filtered.filter(p => !p.isPeriodic);
                break;
            case 'periodic':
                filtered = filtered.filter(p => p.isPeriodic);
                break;
        }
        
        this.filteredPlansForCancel = filtered;
        this.selectedPlans.clear();
        this.updateSelectedCount();
        this.renderCancelPlanList();
    }

    renderCancelPlanList() {
        const planList = document.getElementById('cancelPlanList');
        const plans = this.filteredPlansForCancel || this.plans;
        
        const periodicCount = plans.filter(p => p.isPeriodic).length;
        const singleCount = plans.length - periodicCount;
        
        document.getElementById('filteredCount').textContent = plans.length;
        
        if (plans.length === 0) {
            planList.innerHTML = `
                <div class="cancel-list-header">
                    <div class="cancel-list-stats">
                        <div class="cancel-stat-item">
                            <span class="cancel-stat-value">${plans.length}</span>
                            <span class="cancel-stat-label">总计划</span>
                        </div>
                        <div class="cancel-stat-item">
                            <span class="cancel-stat-value">${singleCount}</span>
                            <span class="cancel-stat-label">单次任务</span>
                        </div>
                        <div class="cancel-stat-item">
                            <span class="cancel-stat-value">${periodicCount}</span>
                            <span class="cancel-stat-label">周期任务</span>
                        </div>
                    </div>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon"></div>
                    <p>没有符合条件的计划</p>
                </div>
            `;
            return;
        }
        
        const sortedPlans = [...plans].sort((a, b) => a.date.localeCompare(b.date));
        
        const itemsHtml = sortedPlans.map(plan => `
            <div class="cancel-plan-item ${this.selectedPlans.has(plan.id) ? 'selected' : ''}" data-plan-id="${plan.id}">
                <input type="checkbox" class="cancel-plan-checkbox" data-plan-id="${plan.id}" 
                    ${this.selectedPlans.has(plan.id) ? 'checked' : ''}>
                <div class="cancel-plan-info">
                    <div class="cancel-plan-title">${this.escapeHtml(plan.title)}</div>
                    <div class="cancel-plan-meta">
                        <span class="cancel-plan-date">📅 ${plan.date}</span>
                        <span class="cancel-plan-type ${plan.isPeriodic ? 'periodic' : ''} ${plan.isPeriodic ? 'tag-primary' : 'tag-success'} tag">
                            ${plan.isPeriodic ? `🔄 每${plan.periodDays}天` : '● 单次任务'}
                        </span>
                        ${plan.priority === 'high' ? '<span class="high-priority-badge">高优先级</span>' : ''}
                    </div>
                </div>
                <button class="btn-cancel-plan" data-plan-id="${plan.id}">取消</button>
            </div>
        `).join('');
        
        planList.innerHTML = `
            <div class="cancel-list-header">
                <div class="cancel-list-stats">
                    <div class="cancel-stat-item">
                        <span class="cancel-stat-value">${plans.length}</span>
                        <span class="cancel-stat-label">总计划</span>
                    </div>
                    <div class="cancel-stat-item">
                        <span class="cancel-stat-value">${singleCount}</span>
                        <span class="cancel-stat-label">单次任务</span>
                    </div>
                    <div class="cancel-stat-item">
                        <span class="cancel-stat-value">${periodicCount}</span>
                        <span class="cancel-stat-label">周期任务</span>
                    </div>
                </div>
                <div class="cancel-list-actions">
                    <span class="selected-count-badge">
                        已选择 ${this.selectedPlans.size} 项
                    </span>
                </div>
            </div>
            ${itemsHtml}
        `;
        
        planList.querySelectorAll('.cancel-plan-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const planId = e.target.dataset.planId;
                const item = e.target.closest('.cancel-plan-item');
                
                if (e.target.checked) {
                    this.selectedPlans.add(planId);
                    item.classList.add('selected');
                } else {
                    this.selectedPlans.delete(planId);
                    item.classList.remove('selected');
                }
                
                this.updateSelectedCount();
            });
        });
        
        planList.querySelectorAll('.btn-cancel-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planId = e.target.dataset.planId;
                this.cancelPlan(planId);
            });
        });
    }

    deselectAllPlans() {
        this.selectedPlans.clear();
        document.querySelectorAll('.cancel-plan-checkbox').forEach(cb => {
            cb.checked = false;
        });
        document.querySelectorAll('.cancel-plan-item').forEach(item => {
            item.classList.remove('selected');
        });
        this.updateSelectedCount();
    }

    cancelAllPlans() {
        const confirmModal = document.getElementById('batchConfirmModal');
        const confirmCount = document.getElementById('confirmCount');
        
        confirmCount.textContent = this.plans.length;
        confirmModal.classList.add('active');
        
        this.pendingCancelAll = true;
    }

    updateSelectedCount() {
        const countEl = document.getElementById('selectedCount');
        const countDisplay = document.getElementById('selectedCountDisplay');
        const batchBtn = document.getElementById('batchCancelBtn');
        const batchActionsBar = document.getElementById('batchActionsBar');
        
        if (countEl) {
            countEl.textContent = this.selectedPlans.size;
        }
        
        if (countDisplay) {
            countDisplay.textContent = this.selectedPlans.size;
        }
        
        if (batchActionsBar) {
            batchActionsBar.style.display = this.selectedPlans.size > 0 ? 'flex' : 'none';
        }
        
        if (batchBtn) {
            batchBtn.disabled = this.selectedPlans.size === 0;
        }
    }

    saveCompletions() {
        localStorage.setItem('selfDisciplineCompletions', JSON.stringify(this.completions));
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    openImportModal() {
        const modal = document.getElementById('importModal');
        const today = new Date().toISOString().split('T')[0];
        
        document.getElementById('batchStartDate').value = today;
        document.getElementById('periodicStartDate').value = today;
        document.getElementById('docStartDate').value = today;
        document.getElementById('goalStartDate').value = today;
        document.getElementById('manualPlanDate').value = today;
        document.getElementById('fileInput').value = '';
        document.getElementById('planPreview').style.display = 'none';
        document.getElementById('previewContent').textContent = '';
        document.getElementById('docPreview').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        this.pendingPlanData = null;
        this.pendingDocPlans = null;
        this.pendingManualPlans = [];
        
        this.switchImportMode('upload');
        this.switchImportType('batch');
        
        this.activateModal(modal);
    }

    switchImportType(type) {
        document.querySelectorAll('.import-type-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`.import-type-option[data-type="${type}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
            selectedOption.querySelector('input').checked = true;
        }
        
        const configSections = ['batchConfig', 'periodicConfig', 'smartdocConfig', 'longtermConfig'];
        configSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        const typeToConfig = {
            'batch': 'batchConfig',
            'periodic': 'periodicConfig',
            'smartdoc': 'smartdocConfig',
            'longterm': 'longtermConfig'
        };
        
        const configId = typeToConfig[type];
        if (configId) {
            const configSection = document.getElementById(configId);
            if (configSection) {
                configSection.style.display = 'block';
            }
        }
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            if (type === 'smartdoc') {
                uploadArea.style.display = 'block';
            } else {
                uploadArea.style.display = 'none';
            }
        }
        
        this.currentImportType = type;
    }

    clearImportForm() {
        document.getElementById('batchPlanContent').value = '';
        document.getElementById('periodicPlanContent').value = '';
        document.getElementById('goalName').value = '';
        document.getElementById('subTasks').value = '';
        document.getElementById('planPreview').style.display = 'none';
        document.getElementById('docPreview').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('fileInput').value = '';
        this.pendingPlanData = null;
        this.pendingDocPlans = null;
        this.showToast('表单已清空');
    }

    switchImportMode(mode) {
        const uploadBtn = document.getElementById('uploadModeBtn');
        const manualBtn = document.getElementById('manualModeBtn');
        const uploadArea = document.getElementById('uploadContentArea');
        const manualArea = document.getElementById('manualContentArea');
        const confirmBtn = document.getElementById('confirmImport');
        
        if (mode === 'upload') {
            uploadBtn.classList.add('active');
            manualBtn.classList.remove('active');
            uploadArea.style.display = 'block';
            manualArea.style.display = 'none';
            confirmBtn.style.display = 'block';
        } else {
            uploadBtn.classList.remove('active');
            manualBtn.classList.add('active');
            uploadArea.style.display = 'none';
            manualArea.style.display = 'block';
            confirmBtn.style.display = 'none';
        }
    }

    addManualPlan(continueAdding = false) {
        const date = document.getElementById('manualPlanDate').value;
        const title = document.getElementById('manualPlanTitle').value.trim();
        const content = document.getElementById('manualPlanContent').value.trim();
        const priority = document.getElementById('manualPlanPriority').value;
        const isPeriodic = document.getElementById('manualIsPeriodic').checked;
        const periodDays = parseInt(document.getElementById('manualPeriodDays').value) || 7;
        const periodEnd = document.getElementById('manualPeriodEnd').value;
        
        if (!date) {
            this.showToast('请选择计划日期');
            return false;
        }
        
        if (!title) {
            this.showToast('请输入任务标题');
            return false;
        }
        
        const plan = {
            id: Date.now().toString(),
            date: date,
            title: title,
            content: content || title,
            priority: priority,
            isPeriodic: isPeriodic,
            periodDays: isPeriodic ? periodDays : 0,
            periodEnd: isPeriodic ? periodEnd : null,
            completed: false
        };
        
        if (!this.pendingManualPlans) {
            this.pendingManualPlans = [];
        }
        
        this.pendingManualPlans.push(plan);
        this.renderPendingManualPlans();
        
        if (continueAdding) {
            document.getElementById('manualPlanTitle').value = '';
            document.getElementById('manualPlanContent').value = '';
            this.showToast('已添加到待添加列表，可继续添加');
        } else {
            this.confirmManualPlans();
        }
        
        return true;
    }

    renderPendingManualPlans() {
        const container = document.getElementById('pendingPlans');
        const listContainer = document.getElementById('manualPlansList');
        const countSpan = document.getElementById('pendingCount');
        
        if (!this.pendingManualPlans || this.pendingManualPlans.length === 0) {
            listContainer.style.display = 'none';
            return;
        }
        
        listContainer.style.display = 'block';
        countSpan.textContent = `(${this.pendingManualPlans.length})`;
        
        const priorityLabels = {
            'high': '高优先级',
            'medium': '普通',
            'low': '低优先级'
        };
        
        container.innerHTML = this.pendingManualPlans.map((plan, index) => `
            <div class="pending-plan-item">
                <div class="pending-plan-info">
                    <div class="pending-plan-title">${plan.title}</div>
                    <div class="pending-plan-meta">
                        <span>📅 ${plan.date}</span>
                        <span>🏷️ ${priorityLabels[plan.priority] || '普通'}</span>
                        ${plan.isPeriodic ? `<span>🔄 每${plan.periodDays}天</span>` : ''}
                    </div>
                </div>
                <button class="pending-plan-remove" onclick="app.removePendingManualPlan(${index})">删除</button>
            </div>
        `).join('');
    }

    removePendingManualPlan(index) {
        if (this.pendingManualPlans) {
            this.pendingManualPlans.splice(index, 1);
            this.renderPendingManualPlans();
        }
    }

    confirmManualPlans() {
        if (!this.pendingManualPlans || this.pendingManualPlans.length === 0) {
            this.showToast('请先添加计划');
            return;
        }
        
        let addedCount = 0;
        
        this.pendingManualPlans.forEach(plan => {
            const newPlan = {
                id: this.generateId(),
                date: plan.date,
                title: plan.title,
                content: plan.content,
                priority: plan.priority,
                completed: false,
                isPeriodic: plan.isPeriodic,
                periodDays: plan.periodDays,
                createdAt: new Date().toISOString()
            };
            
            if (!this.plans.some(p => p.date === newPlan.date && p.title === newPlan.title)) {
                this.plans.push(newPlan);
                addedCount++;
                
                if (plan.isPeriodic && plan.periodEnd) {
                    const endDate = new Date(plan.periodEnd);
                    let currentDate = new Date(plan.date);
                    currentDate.setDate(currentDate.getDate() + plan.periodDays);
                    
                    while (currentDate <= endDate) {
                        const cyclicPlan = {
                            ...newPlan,
                            id: this.generateId(),
                            date: this.formatDate(currentDate),
                            createdAt: new Date().toISOString()
                        };
                        
                        if (!this.plans.some(p => p.date === cyclicPlan.date && p.title === cyclicPlan.title)) {
                            this.plans.push(cyclicPlan);
                            addedCount++;
                        }
                        
                        currentDate.setDate(currentDate.getDate() + plan.periodDays);
                    }
                }
            }
        });
        
        this.savePlans();
        this.renderCalendar();
        this.updateStats();
        this.closeImportModal();
        this.showToast(`成功添加 ${addedCount} 个计划`);
        
        this.pendingManualPlans = [];
        document.getElementById('manualPlansList').style.display = 'none';
    }

    closeImportModal() {
        document.getElementById('importModal').classList.remove('active');
        this.pendingPlanData = null;
        this.pendingDocPlans = null;
    }

    handleFileUpload(file) {
        const fileName = file.name.toLowerCase();
        
        this.switchImportType('smartdoc');
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.display = 'none';
        }
        
        if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            this.handleTextFile(file);
        } else if (fileName.endsWith('.docx')) {
            this.handleDocxFile(file);
        } else if (fileName.endsWith('.pdf')) {
            this.handlePdfFile(file);
        } else {
            this.showToast('不支持的文件格式，请上传 .txt, .md, .docx 或 .pdf 文件');
            if (uploadArea) {
                uploadArea.style.display = 'block';
            }
        }
    }

    handleTextFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseSmartDocument(content);
        };
        reader.readAsText(file);
    }

    async handleDocxFile(file) {
        this.showToast('正在解析DOCX文件...');
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const text = await this.extractDocxText(arrayBuffer);
            this.parseSmartDocument(text);
        } catch (error) {
            console.error('DOCX解析错误:', error);
            this.showToast('DOCX文件解析失败，请尝试上传TXT格式');
        }
    }

    async handlePdfFile(file) {
        this.showToast('正在解析PDF文件...');
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const text = await this.extractPdfText(arrayBuffer);
            this.parseSmartDocument(text);
        } catch (error) {
            console.error('PDF解析错误:', error);
            this.showToast('PDF文件解析失败，请尝试上传TXT格式');
        }
    }

    async extractDocxText(arrayBuffer) {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const docXml = await zip.file('word/document.xml').async('text');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(docXml, 'text/xml');
        const paragraphs = doc.getElementsByTagName('w:t');
        
        let text = '';
        for (let i = 0; i < paragraphs.length; i++) {
            text += paragraphs[i].textContent;
        }
        
        return text;
    }

    async extractPdfText(arrayBuffer) {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            text += pageText + '\n';
        }
        
        return text;
    }

    tryParseTrainingPlan(lines) {
        const baseDateStr = document.getElementById('docStartDate')?.value;
        const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
        
        let hasTrainingFormat = false;
        for (const line of lines) {
            if (/第[一二三四五六七八九十\d]+天[：:]/.test(line) || 
                /\*\*第[一二三四五六七八九十\d]+天/.test(line) ||
                /第[一二三四五六七八九十\d]+天\s*[（(]/.test(line)) {
                hasTrainingFormat = true;
                break;
            }
        }
        
        if (!hasTrainingFormat) {
            return null;
        }
        
        const plans = [];
        const stats = {
            totalLines: lines.length,
            recognizedLines: 0,
            validLines: 0,
            skippedLines: 0,
            dateRecognized: 0,
            periodRecognized: 0,
            priorityRecognized: 0,
            trainingDays: 0,
            exercises: 0
        };
        
        let currentDay = 0;
        let currentDayTitle = '';
        let currentPhase = '';
        let currentDate = new Date(baseDate);
        
        const phasePatterns = [
            { pattern: /^【热身[^】]*】|热身激活$|^热身$/, name: '热身激活' },
            { pattern: /^【主训[^】]*】|主训$|^力量训练$|^训练$/, name: '主训练' },
            { pattern: /^【体态[^】]*】|体态收尾$|^体态$/, name: '体态收尾' },
            { pattern: /^【冷身[^】]*】|冷身拉伸$|^拉伸$|^放松$/, name: '拉伸放松' },
            { pattern: /^【全程[^】]*】|全程$/, name: '全程' }
        ];
        
        const skipPatterns = [
            /^总时长/,
            /^时长[：:]/,
            /^【[^】]*】$/
        ];
        
        const exercisePatterns = [
            /^(.+?)\s+(\d+\s*[组×xX]\s*\d+[-~]?\d*\s*次)/,
            /^(.+?)\s+(\d+\s*[组×xX]\s*\d+\s*次)/,
            /^(.+?)\s+(\d+)\s*分钟/,
            /^(.+?)\s+(\d+)\s*秒/,
            /^(.+?)\s+(\d+)\s*次/,
            /^(.+?)\s+(\d+\s*[组×xX]\s*\d+[-~]?\d*\s*次\s*[\/／]\s*侧)/,
            /^(.+?)\s+(\d+\s*[组×xX]\s*\d+\s*次\s*[\/／]\s*侧)/,
            /^(.+?)\s+(各\s*\d+\s*秒)/,
            /^(.+?)\s+(各\s*\d+\s*分钟)/,
            /^(.+?)\s+(\d+\s*[组×xX]\s*\d+[-~]?\d*\s*次\s*[\/／]\s*组)/,
            /^(.+?)\s+(\d+)\s*分钟\s*[×xX]\s*\d+\s*组/,
            /^(.+?)\s+(\d+)\s*秒\s*[×xX]\s*\d+\s*组/,
            /^(.+?)\s+(\d+)\s*秒\s*[×xX]\s*\d+\s*组\s*[\/／]\s*侧/,
            /^(.+?)\s+(\d+)\s*分钟\s*[×xX]\s*\d+\s*组\s*[\/／]\s*侧/,
            /^(.+?)\s+(\d+)\s*分钟\s*[×xX]\s*\d+\s*组/,
            /^(.+?)\s+(\d+)\s*秒\s*[×xX]\s*\d+\s*组/
        ];
        
        const simpleTimePattern = /^(.+?)\s+(\d+)\s*(分钟|秒|次)(?:\s*[×xX]\s*\d+\s*组)?(?:\s*[\/／]\s*(?:侧|组))?\s*$/;
        const timeWithGroupPattern = /^(.+?)\s+(\d+)\s*(分钟|秒)\s*[×xX]\s*\d+\s*组(?:\s*[\/／]\s*侧)?/;
        const looseTimePattern = /^(.+?)\s+(\d+)\s*(分钟|秒|次)\s*(?:[×xX]\s*\d+\s*组)?(?:\s*[\/／]\s*(?:侧|组))?\s*$/;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            line = line.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');
            line = line.replace(/\s+/g, ' ');
            if (!line) {
                stats.skippedLines++;
                continue;
            }
            
            const dayMatch = line.match(/第([一二三四五六七八九十\d]+)天/);
            
            if (dayMatch) {
                currentDay = this.chineseToNumber(dayMatch[1]);
                currentDayTitle = line.replace(/\*\*/g, '').trim();
                currentDate = new Date(baseDate);
                currentDate.setDate(currentDate.getDate() + currentDay - 1);
                stats.trainingDays++;
                stats.skippedLines++;
                continue;
            }
            
            if (currentDay === 0) {
                stats.skippedLines++;
                continue;
            }
            
            let foundPhase = false;
            for (const pp of phasePatterns) {
                if (pp.pattern.test(line)) {
                    currentPhase = pp.name;
                    foundPhase = true;
                    stats.skippedLines++;
                    break;
                }
            }
            
            if (foundPhase) continue;
            
            let shouldSkip = false;
            for (const sp of skipPatterns) {
                if (sp.test(line)) {
                    shouldSkip = true;
                    stats.skippedLines++;
                    break;
                }
            }
            
            if (shouldSkip) continue;
            
            stats.validLines++;
            
            const hasTimeUnit = line.includes('分钟') || line.includes('秒') || line.includes('次');
            
            if (hasTimeUnit) {
                const timeMatch = line.match(/(\d+)\s*(分钟|秒|次)/);
                if (timeMatch) {
                    const timePos = line.indexOf(timeMatch[0]);
                    let exerciseName = line.substring(0, timePos).trim();
                    
                    if (!exerciseName) {
                        exerciseName = line;
                    }
                    
                    let priority = 'medium';
                    if (currentPhase === '主训练' || currentPhase === '全程') {
                        priority = 'high';
                    } else if (currentPhase === '拉伸放松' || currentPhase === '休息恢复') {
                        priority = 'low';
                    }
                    
                    const plan = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        title: exerciseName,
                        content: line,
                        date: this.formatDate(currentDate),
                        priority: priority,
                        isPeriodic: false,
                        periodDays: null,
                        startDate: this.formatDate(currentDate),
                        createdAt: new Date().toISOString(),
                        dayNumber: currentDay,
                        dayTitle: currentDayTitle,
                        phase: currentPhase,
                        details: timeMatch[0],
                        recognitionInfo: {
                            dateFound: true,
                            periodFound: false,
                            priorityFound: true,
                            trainingPlan: true
                        }
                    };
                    
                    plans.push(plan);
                    stats.recognizedLines++;
                    stats.exercises++;
                    stats.dateRecognized++;
                    continue;
                }
            }
            
            if (line.length >= 4 && !/^[【】\s]+$/.test(line) && !line.includes('总时长') && !line.includes('时长：')) {
                const plan = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    title: line.substring(0, 50),
                    content: line,
                    date: this.formatDate(currentDate),
                    priority: 'medium',
                    isPeriodic: false,
                    periodDays: null,
                    startDate: this.formatDate(currentDate),
                    createdAt: new Date().toISOString(),
                    dayNumber: currentDay,
                    dayTitle: currentDayTitle,
                    phase: currentPhase,
                    recognitionInfo: {
                        dateFound: true,
                        periodFound: false,
                        priorityFound: false,
                        trainingPlan: true
                    }
                };
                
                plans.push(plan);
                stats.recognizedLines++;
                stats.exercises++;
            } else {
                stats.skippedLines++;
            }
        }
        
        if (plans.length === 0) {
            return null;
        }
        
        const accuracy = stats.validLines > 0 
            ? Math.min(100, Math.round((stats.recognizedLines / stats.validLines) * 100))
            : Math.min(100, Math.round((stats.recognizedLines / (stats.totalLines - stats.skippedLines)) * 100));
        
        return {
            plans: plans,
            stats: stats,
            accuracy: accuracy,
            isTrainingPlan: true
        };
    }

    parseSmartDocument(content) {
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            this.showToast('文档内容为空');
            return;
        }
        
        const result = this.extractPlansFromText(lines);
        
        if (result.plans.length === 0) {
            this.showToast('未能识别到有效计划，请检查文档格式');
            return;
        }
        
        this.pendingDocPlans = result.plans;
        this.displayDocPreview(result);
        this.showToast(`成功识别 ${result.plans.length} 个计划，准确率 ${result.accuracy}%`);
    }

    extractPlansFromText(lines) {
        const trainingPlanResult = this.tryParseTrainingPlan(lines);
        if (trainingPlanResult) {
            return trainingPlanResult;
        }
        
        const plans = [];
        const stats = {
            totalLines: lines.length,
            recognizedLines: 0,
            dateRecognized: 0,
            periodRecognized: 0,
            priorityRecognized: 0
        };
        
        const baseDateStr = document.getElementById('docStartDate')?.value;
        const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
        const defaultPeriodElement = document.getElementById('defaultPeriod');
        const defaultPeriod = defaultPeriodElement ? parseInt(defaultPeriodElement.value) : 7;
        const autoDetectPeriodElement = document.getElementById('autoDetectPeriod');
        const autoDetectPeriod = autoDetectPeriodElement ? autoDetectPeriodElement.checked : true;
        
        const datePatterns = [
            { pattern: /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/, type: 'full' },
            { pattern: /(\d{1,2})[-/月](\d{1,2})[日号]?/, type: 'short' },
            { pattern: /(今天|今日|当天)/, type: 'relative', offset: 0 },
            { pattern: /(明天|明日)/, type: 'relative', offset: 1 },
            { pattern: /(后天)/, type: 'relative', offset: 2 },
            { pattern: /(大后天)/, type: 'relative', offset: 3 },
            { pattern: /(周一|星期一)/, type: 'weekday', day: 1 },
            { pattern: /(周二|星期二)/, type: 'weekday', day: 2 },
            { pattern: /(周三|星期三)/, type: 'weekday', day: 3 },
            { pattern: /(周四|星期四)/, type: 'weekday', day: 4 },
            { pattern: /(周五|星期五)/, type: 'weekday', day: 5 },
            { pattern: /(周六|星期六)/, type: 'weekday', day: 6 },
            { pattern: /(周日|星期日|周天)/, type: 'weekday', day: 0 },
            { pattern: /第([一二三四五六七八九十百\d]+)天/, type: 'daynum' },
            { pattern: /Day\s*(\d+)/i, type: 'daynum' },
            { pattern: /D(\d+)/i, type: 'daynum' },
            { pattern: /(\d+)日/, type: 'monthday' }
        ];
        
        const periodPatterns = [
            { pattern: /每天|每日|天天|日常/, days: 1 },
            { pattern: /每周[一二三四五六七]|每星期[一二三四五六七]/, days: 7, specific: true },
            { pattern: /每周|每星期|周计划|周任务/, days: 7 },
            { pattern: /每(\d+)天/, days: null, extract: true },
            { pattern: /隔天|每隔一天|隔日/, days: 2 },
            { pattern: /每两周|隔周/, days: 14 },
            { pattern: /每月|每个月/, days: 30 },
            { pattern: /工作日|工作天/, days: 0, workday: true }
        ];
        
        const priorityPatterns = [
            { pattern: /【高优先级】|【紧急】|【重要】|【必做】|\[高\]|\[紧急\]|\[重要\]|\[必做\]|!!!|❗️|‼️|⭐{3,}|🔥/, priority: 'high' },
            { pattern: /【中优先级】|【一般】|【普通】|\[中\]|\[一般\]|\[普通\]|!!|⭐{2}/, priority: 'medium' },
            { pattern: /【低优先级】|【不急】|【可选】|\[低\]|\[不急\]|\[可选\]|!|⭐/, priority: 'low' }
        ];
        
        const taskPrefixPatterns = [
            /^[-*•··]\s*/,
            /^\d+[.、)\]]\s*/,
            /^[一二三四五六七八九十]+[.、)\]]\s*/,
            /^[（(]\d+[)）]\s*/,
            /^Task\s*\d*[:：]?\s*/i,
            /^任务\s*\d*[:：]?\s*/,
            /^计划[:：]\s*/
        ];
        
        let currentDate = new Date(baseDate);
        let dayOffset = 0;
        let lastExplicitDate = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.length < 2) continue;
            
            if (/^#{1,6}\s/.test(line) || /^={3,}$/.test(line) || /^-{3,}$/.test(line)) {
                continue;
            }
            
            let planDate = null;
            let periodDays = defaultPeriod > 0 ? defaultPeriod : 0;
            let priority = 'medium';
            let taskContent = line;
            let isPeriodic = defaultPeriod > 0;
            let dateFound = false;
            let periodFound = false;
            let priorityFound = false;
            
            for (const dp of datePatterns) {
                const match = line.match(dp.pattern);
                if (match) {
                    dateFound = true;
                    stats.dateRecognized++;
                    
                    if (dp.type === 'full') {
                        planDate = new Date(
                            parseInt(match[1]),
                            parseInt(match[2]) - 1,
                            parseInt(match[3])
                        );
                    } else if (dp.type === 'short') {
                        const month = parseInt(match[1]) - 1;
                        const day = parseInt(match[2]);
                        planDate = new Date(baseDate.getFullYear(), month, day);
                        if (planDate < baseDate) {
                            planDate.setFullYear(planDate.getFullYear() + 1);
                        }
                    } else if (dp.type === 'relative') {
                        planDate = new Date(baseDate);
                        planDate.setDate(planDate.getDate() + dp.offset);
                    } else if (dp.type === 'weekday') {
                        planDate = new Date(baseDate);
                        const currentDay = planDate.getDay();
                        let daysUntil = dp.day - currentDay;
                        if (daysUntil <= 0) daysUntil += 7;
                        planDate.setDate(planDate.getDate() + daysUntil);
                    } else if (dp.type === 'daynum') {
                        const dayNum = this.chineseToNumber(match[1]);
                        planDate = new Date(baseDate);
                        planDate.setDate(planDate.getDate() + dayNum - 1);
                    } else if (dp.type === 'monthday') {
                        const day = parseInt(match[1]);
                        planDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
                        if (planDate < baseDate) {
                            planDate.setMonth(planDate.getMonth() + 1);
                        }
                    }
                    
                    taskContent = line.replace(dp.pattern, '').trim();
                    lastExplicitDate = new Date(planDate);
                    break;
                }
            }
            
            if (!dateFound && lastExplicitDate) {
                planDate = new Date(lastExplicitDate);
            }
            
            if (autoDetectPeriod) {
                for (const pp of periodPatterns) {
                    if (pp.pattern.test(line)) {
                        periodFound = true;
                        stats.periodRecognized++;
                        
                        if (pp.extract) {
                            const extractMatch = line.match(pp.pattern);
                            if (extractMatch) {
                                periodDays = parseInt(extractMatch[1]);
                            }
                        } else if (pp.days !== undefined) {
                            periodDays = pp.days;
                        }
                        
                        if (periodDays > 0) {
                            isPeriodic = true;
                        }
                        taskContent = taskContent.replace(pp.pattern, '').trim();
                        break;
                    }
                }
            }
            
            for (const pp of priorityPatterns) {
                if (pp.pattern.test(line)) {
                    priorityFound = true;
                    stats.priorityRecognized++;
                    priority = pp.priority;
                    taskContent = taskContent.replace(pp.pattern, '').trim();
                    break;
                }
            }
            
            for (const prefix of taskPrefixPatterns) {
                taskContent = taskContent.replace(prefix, '');
            }
            
            taskContent = taskContent.trim();
            
            if (!taskContent || taskContent.length < 2) continue;
            
            if (!planDate) {
                planDate = new Date(baseDate);
                planDate.setDate(planDate.getDate() + dayOffset);
                dayOffset++;
            }
            
            const plan = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: taskContent.substring(0, 100),
                content: taskContent,
                date: this.formatDate(planDate),
                priority: priority,
                isPeriodic: isPeriodic,
                periodDays: isPeriodic ? periodDays : null,
                startDate: this.formatDate(planDate),
                createdAt: new Date().toISOString(),
                recognitionInfo: {
                    dateFound: dateFound,
                    periodFound: periodFound,
                    priorityFound: priorityFound
                }
            };
            
            plans.push(plan);
            stats.recognizedLines++;
        }
        
        const accuracy = stats.totalLines > 0 
            ? Math.round((stats.recognizedLines / stats.totalLines) * 100) 
            : 0;
        
        return {
            plans: plans,
            stats: stats,
            accuracy: accuracy
        };
    }

    parseDateFromText(dateStr, baseDate) {
        const today = new Date(baseDate);
        today.setHours(0, 0, 0, 0);
        
        const relativeDays = {
            '今天': 0, '今日': 0,
            '明天': 1, '明日': 1,
            '后天': 2,
            '大后天': 3
        };
        
        if (relativeDays[dateStr] !== undefined) {
            const result = new Date(today);
            result.setDate(result.getDate() + relativeDays[dateStr]);
            return result;
        }
        
        const weekDays = {
            '周一': 1, '星期一': 1,
            '周二': 2, '星期二': 2,
            '周三': 3, '星期三': 3,
            '周四': 4, '星期四': 4,
            '周五': 5, '星期五': 5,
            '周六': 6, '星期六': 6,
            '周日': 0, '星期日': 0
        };
        
        if (weekDays[dateStr] !== undefined) {
            const result = new Date(today);
            const targetDay = weekDays[dateStr];
            const currentDay = result.getDay();
            let daysUntil = targetDay - currentDay;
            if (daysUntil <= 0) daysUntil += 7;
            result.setDate(result.getDate() + daysUntil);
            return result;
        }
        
        const dayNumberMatch = dateStr.match(/第([一二三四五六七\d]+)天/);
        if (dayNumberMatch) {
            const dayNum = this.chineseToNumber(dayNumberMatch[1]);
            const result = new Date(today);
            result.setDate(result.getDate() + dayNum - 1);
            return result;
        }
        
        const dateMatch = dateStr.match(/(\d{1,2})[-/月](\d{1,2})[日号]?/);
        if (dateMatch) {
            const month = parseInt(dateMatch[1]) - 1;
            const day = parseInt(dateMatch[2]);
            const result = new Date(today.getFullYear(), month, day);
            if (result < today) {
                result.setFullYear(result.getFullYear() + 1);
            }
            return result;
        }
        
        const fullDateMatch = dateStr.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/);
        if (fullDateMatch) {
            return new Date(
                parseInt(fullDateMatch[1]),
                parseInt(fullDateMatch[2]) - 1,
                parseInt(fullDateMatch[3])
            );
        }
        
        return today;
    }

    chineseToNumber(str) {
        const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15, '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20, '三十': 30 };
        if (/^\d+$/.test(str)) return parseInt(str);
        
        if (str.includes('二十')) {
            const rest = str.replace('二十', '');
            return 20 + (map[rest] || 0);
        }
        if (str.includes('三十')) {
            const rest = str.replace('三十', '');
            return 30 + (map[rest] || 0);
        }
        
        return map[str] || 1;
    }

    displayDocPreview(result) {
        const docPreview = document.getElementById('docPreview');
        const previewStats = document.getElementById('previewStats');
        const previewTasks = document.getElementById('previewTasks');
        
        const plans = result.plans;
        const stats = result.stats;
        const accuracy = result.accuracy;
        
        const periodicCount = plans.filter(p => p.isPeriodic).length;
        const highPriorityCount = plans.filter(p => p.priority === 'high').length;
        
        const accuracyClass = accuracy >= 80 ? 'accuracy-high' : accuracy >= 50 ? 'accuracy-medium' : 'accuracy-low';
        
        if (result.isTrainingPlan) {
            previewStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${stats.trainingDays || plans.length}</div>
                    <div class="stat-label">训练天数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${plans.length}</div>
                    <div class="stat-label">训练项目</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number ${accuracyClass}">${accuracy}%</div>
                    <div class="stat-label">识别准确率</div>
                </div>
            `;
        } else {
            previewStats.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${plans.length}</div>
                    <div class="stat-label">总计划数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${periodicCount}</div>
                    <div class="stat-label">周期性计划</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number ${accuracyClass}">${accuracy}%</div>
                    <div class="stat-label">识别准确率</div>
                </div>
            `;
        }
        
        let recognitionDetails = `
            <div class="recognition-summary">
                <div class="summary-item">
                    <span class="summary-icon">📄</span>
                    <span>总行数: ${stats.totalLines}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon">✅</span>
                    <span>识别成功: ${stats.recognizedLines}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon">📅</span>
                    <span>日期识别: ${stats.dateRecognized}</span>
                </div>
        `;
        
        if (result.isTrainingPlan) {
            recognitionDetails += `
                <div class="summary-item">
                    <span class="summary-icon">🏃</span>
                    <span>训练天数: ${stats.trainingDays}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon">💪</span>
                    <span>训练项目: ${stats.exercises}</span>
                </div>
            `;
        } else {
            recognitionDetails += `
                <div class="summary-item">
                    <span class="summary-icon">🔄</span>
                    <span>周期识别: ${stats.periodRecognized}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon">⚡</span>
                    <span>优先级识别: ${stats.priorityRecognized}</span>
                </div>
            `;
        }
        
        recognitionDetails += `</div>`;
        
        if (result.isTrainingPlan) {
            const groupedByDay = {};
            plans.forEach(plan => {
                const key = `第${plan.dayNumber}天`;
                if (!groupedByDay[key]) {
                    groupedByDay[key] = {
                        date: plan.date,
                        title: plan.dayTitle || '',
                        exercises: []
                    };
                }
                groupedByDay[key].exercises.push(plan);
            });
            
            let tasksHtml = recognitionDetails;
            Object.entries(groupedByDay).forEach(([day, data]) => {
                tasksHtml += `
                    <div class="preview-day-group">
                        <div class="preview-day-header">
                            <span class="preview-day-title">${day}</span>
                            ${data.title ? `<span class="preview-day-subtitle">${this.escapeHtml(data.title)}</span>` : ''}
                            <span class="preview-day-date">${data.date}</span>
                        </div>
                        <div class="preview-day-tasks">
                            ${data.exercises.slice(0, 10).map(plan => `
                                <div class="preview-task-item training-task">
                                    ${plan.phase ? `<span class="preview-task-phase">${plan.phase}</span>` : ''}
                                    <div class="preview-task-content">${this.escapeHtml(plan.title)}</div>
                                    ${plan.priority === 'high' ? `<span class="preview-task-priority priority-high">高</span>` : ''}
                                </div>
                            `).join('')}
                            ${data.exercises.length > 10 ? `<div class="preview-task-more">还有 ${data.exercises.length - 10} 项...</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            previewTasks.innerHTML = tasksHtml;
        } else {
            previewTasks.innerHTML = recognitionDetails + plans.slice(0, 20).map(plan => `
                <div class="preview-task-item">
                    <div class="preview-task-date">${plan.date}</div>
                    <div class="preview-task-content">${this.escapeHtml(plan.title)}</div>
                    ${plan.priority !== 'medium' ? `
                        <span class="preview-task-priority priority-${plan.priority}">
                            ${plan.priority === 'high' ? '高' : '低'}
                        </span>
                    ` : ''}
                    ${plan.isPeriodic ? `
                        <span class="preview-task-periodic">每${plan.periodDays}天</span>
                    ` : ''}
                    ${plan.recognitionInfo && !plan.recognitionInfo.dateFound ? `
                        <span class="preview-task-auto" title="自动分配日期">🔄</span>
                    ` : ''}
                </div>
            `).join('');
            
            if (plans.length > 20) {
                previewTasks.innerHTML += `
                    <div class="preview-task-item" style="justify-content: center; color: var(--text-secondary);">
                        还有 ${plans.length - 20} 个计划...
                    </div>
                `;
            }
        }
        
        docPreview.style.display = 'block';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    parsePlanContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            this.showToast('文件内容为空');
            return;
        }
        
        const title = lines[0].replace(/^#+\s*/, '').replace(/^[-*]\s*/, '').trim() || '未命名计划';
        const planContent = lines.slice(1).join('\n').trim() || lines[0];
        
        this.pendingPlanData = {
            title,
            content: planContent
        };
        
        document.getElementById('previewContent').textContent = `${title}\n\n${planContent}`;
        document.getElementById('planPreview').style.display = 'block';
        
        if (this.currentTab === 'longterm') {
            const subTasks = lines.slice(1).filter(line => line.trim()).join('\n');
            document.getElementById('subTasks').value = subTasks;
            document.getElementById('goalName').value = title;
        }
        
        this.showToast('计划文件已解析成功');
    }

    importPlan() {
        if (this.currentImportType === 'batch') {
            this.importBatchPlans();
        } else if (this.currentImportType === 'periodic') {
            this.importPeriodicPlans();
        } else if (this.currentImportType === 'smartdoc') {
            this.importSmartDocPlans();
        } else if (this.currentImportType === 'longterm') {
            this.importLongtermGoal();
        }
    }

    importBatchPlans() {
        const startDate = document.getElementById('batchStartDate').value;
        const endDate = document.getElementById('batchEndDate').value;
        const content = document.getElementById('batchPlanContent').value.trim();
        const priority = document.getElementById('batchPriority').value;
        
        if (!startDate) {
            this.showToast('请选择开始日期');
            return;
        }
        
        if (!content) {
            this.showToast('请输入计划内容');
            return;
        }
        
        const tasks = content.split('\n').filter(line => line.trim());
        if (tasks.length === 0) {
            this.showToast('请输入至少一个任务');
            return;
        }
        
        let importedCount = 0;
        
        if (endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end < start) {
                this.showToast('结束日期不能早于开始日期');
                return;
            }
            
            const currentDate = new Date(start);
            while (currentDate <= end) {
                tasks.forEach(task => {
                    const plan = {
                        id: this.generateId(),
                        title: task.trim(),
                        content: task.trim(),
                        date: this.formatDate(currentDate),
                        priority: priority,
                        completed: false,
                        createdAt: new Date().toISOString()
                    };
                    
                    if (!this.plans.some(p => p.date === plan.date && p.title === plan.title)) {
                        this.plans.push(plan);
                        importedCount++;
                    }
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else {
            tasks.forEach(task => {
                const plan = {
                    id: this.generateId(),
                    title: task.trim(),
                    content: task.trim(),
                    date: startDate,
                    priority: priority,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                if (!this.plans.some(p => p.date === plan.date && p.title === plan.title)) {
                    this.plans.push(plan);
                    importedCount++;
                }
            });
        }
        
        this.savePlans();
        this.renderCalendar();
        this.updateStats();
        this.closeImportModal();
        this.showToast(`成功导入 ${importedCount} 个计划`);
    }

    importPeriodicPlans() {
        const startDate = document.getElementById('periodicStartDate').value;
        const endDate = document.getElementById('periodicEndDate').value;
        const periodDays = parseInt(document.getElementById('periodicDays').value);
        const content = document.getElementById('periodicPlanContent').value.trim();
        const priority = document.getElementById('periodicPriority').value;
        
        if (!startDate) {
            this.showToast('请选择开始日期');
            return;
        }
        
        if (!content) {
            this.showToast('请输入计划内容');
            return;
        }
        
        const tasks = content.split('\n').filter(line => line.trim());
        if (tasks.length === 0) {
            this.showToast('请输入至少一个任务');
            return;
        }
        
        let importedCount = 0;
        
        tasks.forEach(task => {
            const basePlan = {
                title: task.trim(),
                content: task.trim(),
                priority: priority,
                completed: false
            };
            
            if (endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                let currentDate = new Date(start);
                
                while (currentDate <= end) {
                    const plan = {
                        ...basePlan,
                        id: this.generateId(),
                        date: this.formatDate(currentDate),
                        isPeriodic: true,
                        periodDays: periodDays,
                        createdAt: new Date().toISOString()
                    };
                    
                    if (!this.plans.some(p => p.date === plan.date && p.title === plan.title)) {
                        this.plans.push(plan);
                        importedCount++;
                    }
                    
                    currentDate.setDate(currentDate.getDate() + periodDays);
                }
            } else {
                const plan = {
                    ...basePlan,
                    id: this.generateId(),
                    date: startDate,
                    isPeriodic: true,
                    periodDays: periodDays,
                    createdAt: new Date().toISOString()
                };
                
                if (!this.plans.some(p => p.date === plan.date && p.title === plan.title)) {
                    this.plans.push(plan);
                    importedCount++;
                }
            }
        });
        
        this.savePlans();
        this.renderCalendar();
        this.updateStats();
        this.closeImportModal();
        this.showToast(`成功导入 ${importedCount} 个周期性计划`);
    }

    importSmartDocPlans() {
        if (!this.pendingDocPlans || this.pendingDocPlans.length === 0) {
            this.showToast('请先上传并解析文档');
            return;
        }
        
        try {
            let importedCount = 0;
            const endDateStr = document.getElementById('docEndDate').value;
            const enableCyclic = document.getElementById('enableCyclic').checked;
            const defaultPeriod = parseInt(document.getElementById('defaultPeriod').value);
            
            this.pendingDocPlans.forEach(plan => {
                const existingPlan = this.plans.find(p => 
                    p.title === plan.title && p.date === plan.date
                );
                
                if (!existingPlan) {
                    this.plans.push(plan);
                    importedCount++;
                }
                
                if (endDateStr && enableCyclic && (plan.isPeriodic || defaultPeriod > 0)) {
                    const periodDays = plan.periodDays || defaultPeriod;
                    if (periodDays > 0) {
                        const endDate = new Date(endDateStr);
                        let currentDate = new Date(plan.date);
                        currentDate.setDate(currentDate.getDate() + periodDays);
                        
                        while (currentDate <= endDate) {
                            const dateStr = this.formatDate(currentDate);
                            const existingCyclicPlan = this.plans.find(p => 
                                p.title === plan.title && p.date === dateStr
                            );
                            
                            if (!existingCyclicPlan) {
                                const cyclicPlan = {
                                    ...plan,
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                    date: dateStr,
                                    startDate: dateStr,
                                    createdAt: new Date().toISOString()
                                };
                                this.plans.push(cyclicPlan);
                                importedCount++;
                            }
                            
                            currentDate.setDate(currentDate.getDate() + periodDays);
                        }
                    }
                }
            });
            
            this.savePlans();
            
            this.showToast(`成功导入 ${importedCount} 个计划`);
            this.closeImportModal();
            this.renderCalendar();
            this.updateStats();
            
            this.pendingDocPlans = null;
            
        } catch (error) {
            console.error('导入失败:', error);
            this.showToast('导入失败，请重试');
        }
    }

    importSinglePlan() {
        if (!this.pendingPlanData) {
            this.showToast('请先上传计划文件');
            return;
        }
        
        const planDate = document.getElementById('planDate').value;
        
        if (!planDate) {
            this.showToast('请选择计划日期');
            return;
        }
        
        const plan = {
            id: Date.now().toString(),
            title: this.pendingPlanData.title,
            content: this.pendingPlanData.content,
            date: planDate,
            isPeriodic: false,
            createdAt: new Date().toISOString()
        };
        
        this.plans.push(plan);
        this.savePlans();
        
        this.showToast('计划导入成功');
        this.closeImportModal();
        this.renderCalendar();
        this.updateStats();
    }

    importPeriodicPlan() {
        if (!this.pendingPlanData) {
            this.showToast('请先上传计划文件');
            return;
        }
        
        const periodDays = parseInt(document.getElementById('periodDays').value);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate) {
            this.showToast('请选择开始日期');
            return;
        }
        
        if (periodDays < 1 || periodDays > 365) {
            this.showToast('周期天数需在1-365之间');
            return;
        }
        
        const plan = {
            id: Date.now().toString(),
            title: this.pendingPlanData.title,
            content: this.pendingPlanData.content,
            isPeriodic: true,
            periodDays,
            startDate,
            endDate: endDate || null,
            createdAt: new Date().toISOString()
        };
        
        this.plans.push(plan);
        this.savePlans();
        
        this.showToast('周期性计划导入成功');
        this.closeImportModal();
        this.renderCalendar();
        this.updateStats();
    }

    importLongtermGoal() {
        const goalName = document.getElementById('goalName').value.trim();
        const startDate = document.getElementById('goalStartDate').value;
        const endDate = document.getElementById('goalEndDate').value;
        const taskPerDay = parseInt(document.getElementById('taskPerDay').value);
        const subTasksText = document.getElementById('subTasks').value.trim();
        
        if (!goalName) {
            this.showToast('请输入目标名称');
            return;
        }
        
        if (!startDate || !endDate) {
            this.showToast('请选择开始和结束日期');
            return;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end <= start) {
            this.showToast('结束日期必须晚于开始日期');
            return;
        }
        
        const subTasks = subTasksText.split('\n')
            .map(task => task.trim())
            .filter(task => task);
        
        if (subTasks.length === 0) {
            this.showToast('请输入至少一个子任务');
            return;
        }
        
        const diffTime = end - start;
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalTasks = subTasks.length;
        
        const smartTaskPerDay = this.calculateSmartTaskPerDay(totalTasks, totalDays, taskPerDay);
        
        const goalId = Date.now().toString();
        let taskIndex = 0;
        let currentDate = new Date(start);
        
        while (taskIndex < totalTasks && currentDate <= end) {
            const dateStr = this.formatDate(currentDate);
            const existingPlans = this.getPlansForDate(dateStr);
            
            if (existingPlans.length < smartTaskPerDay) {
                const tasksForToday = Math.min(
                    smartTaskPerDay - existingPlans.length,
                    totalTasks - taskIndex
                );
                
                for (let i = 0; i < tasksForToday && taskIndex < totalTasks; i++) {
                    const plan = {
                        id: `${goalId}-${taskIndex}`,
                        goalId,
                        title: `${goalName} - ${subTasks[taskIndex]}`,
                        content: subTasks[taskIndex],
                        date: dateStr,
                        isPeriodic: false,
                        isFromGoal: true,
                        goalName,
                        createdAt: new Date().toISOString()
                    };
                    
                    this.plans.push(plan);
                    taskIndex++;
                }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        this.savePlans();
        
        const assignedTasks = taskIndex;
        this.showToast(`长期目标已分解为 ${assignedTasks} 个每日任务`);
        this.closeImportModal();
        this.renderCalendar();
        this.updateStats();
    }

    calculateSmartTaskPerDay(totalTasks, totalDays, userPreference) {
        const minPerDay = Math.ceil(totalTasks / totalDays);
        const maxDailyLoad = 5;
        
        if (userPreference <= minPerDay) {
            return Math.min(minPerDay, maxDailyLoad);
        }
        
        return Math.min(userPreference, maxDailyLoad);
    }

    openAdjustModal() {
        const modal = document.getElementById('adjustModal');
        const adjustList = document.getElementById('adjustList');
        
        const nonPeriodicPlans = this.plans.filter(p => !p.isPeriodic);
        
        if (nonPeriodicPlans.length === 0) {
            adjustList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"></div>
                    <p>暂无可调整的计划</p>
                </div>
            `;
        } else {
            adjustList.innerHTML = nonPeriodicPlans.map(plan => `
                <div class="adjust-item">
                    <div class="adjust-item-info">
                        <div class="adjust-item-title">${plan.title}</div>
                        <div class="adjust-item-date">
                            当前日期: ${plan.date}
                            ${plan.isFromGoal ? ` | 目标: ${plan.goalName}` : ''}
                        </div>
                    </div>
                    <button class="btn-adjust" data-plan-id="${plan.id}" data-date="${plan.date}">
                        调整日期
                    </button>
                </div>
            `).join('');
            
            adjustList.querySelectorAll('.btn-adjust').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const planId = e.target.dataset.planId;
                    const date = e.target.dataset.date;
                    this.openAdjustSingleModal(planId, date);
                });
            });
        }
        
        this.activateModal(modal);
    }

    openAdjustSingleModal(planId, currentDate) {
        const plan = this.plans.find(p => p.id === planId);
        if (!plan) return;
        
        this.currentAdjustPlan = { plan, currentDate };
        const singleModal = document.getElementById('adjustSingleModal');
        
        document.getElementById('adjustTaskName').textContent = plan.title;
        document.getElementById('newDate').value = currentDate;
        document.getElementById('adjustReason').value = '';
        
        this.closeAllModals();
        this.activateModal(singleModal);
    }

    confirmAdjustPlan() {
        if (!this.currentAdjustPlan) return;
        
        const { plan, currentDate } = this.currentAdjustPlan;
        const newDate = document.getElementById('newDate').value;
        const reason = document.getElementById('adjustReason').value.trim();
        
        if (!newDate) {
            this.showToast('请选择新日期');
            return;
        }
        
        if (newDate === currentDate) {
            this.showToast('新日期与当前日期相同');
            return;
        }
        
        const completionKey = `${currentDate}-${plan.id}`;
        const wasCompleted = this.completions[completionKey];
        
        if (wasCompleted) {
            delete this.completions[completionKey];
        }
        
        const historyEntry = {
            id: Date.now().toString(),
            planId: plan.id,
            planTitle: plan.title,
            oldDate: currentDate,
            newDate: newDate,
            reason: reason || '未填写原因',
            adjustedAt: new Date().toISOString()
        };
        
        this.adjustHistory.push(historyEntry);
        
        plan.date = newDate;
        
        if (wasCompleted) {
            const newCompletionKey = `${newDate}-${plan.id}`;
            this.completions[newCompletionKey] = true;
        }
        
        this.savePlans();
        this.saveCompletions();
        this.saveAdjustHistory();
        
        this.showToast('任务日期已调整');
        document.getElementById('adjustSingleModal').classList.remove('active');
        this.renderCalendar();
        this.updateStats();
        this.currentAdjustPlan = null;
    }

    openHistoryModal() {
        const modal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        if (this.adjustHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"></div>
                    <p>暂无调整记录</p>
                </div>
            `;
        } else {
            const sortedHistory = [...this.adjustHistory].reverse();
            
            historyList.innerHTML = sortedHistory.map(entry => {
                const adjustedDate = new Date(entry.adjustedAt);
                const dateStr = `${adjustedDate.getFullYear()}-${String(adjustedDate.getMonth() + 1).padStart(2, '0')}-${String(adjustedDate.getDate()).padStart(2, '0')} ${String(adjustedDate.getHours()).padStart(2, '0')}:${String(adjustedDate.getMinutes()).padStart(2, '0')}`;
                
                return `
                    <div class="history-item">
                        <div class="history-item-info">
                            <div class="history-item-title">${entry.planTitle}</div>
                            <div class="history-item-detail">
                                ${entry.oldDate} → ${entry.newDate}
                            </div>
                            <div class="history-item-reason">
                                原因: ${entry.reason}
                            </div>
                            <div class="history-item-time">
                                调整时间: ${dateStr}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        this.activateModal(modal);
    }

    safeLocalStorage(action, key, value = null) {
        try {
            if (action === 'get') {
                const saved = localStorage.getItem(key);
                return saved ? JSON.parse(saved) : null;
            } else if (action === 'set') {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            }
        } catch (error) {
            console.warn('⚠️ localStorage操作失败:', error.message);
            if (action === 'get') {
                return null;
            }
            return false;
        }
    }

    loadPlans() {
        const saved = this.safeLocalStorage('get', 'selfDisciplinePlans');
        return saved || [];
    }

    savePlans() {
        this.safeLocalStorage('set', 'selfDisciplinePlans', this.plans);
    }

    loadCompletions() {
        const saved = this.safeLocalStorage('get', 'selfDisciplineCompletions');
        return saved || {};
    }

    saveCompletions() {
        this.safeLocalStorage('set', 'selfDisciplineCompletions', this.completions);
    }

    loadAdjustHistory() {
        const saved = this.safeLocalStorage('get', 'selfDisciplineAdjustHistory');
        return saved || [];
    }

    saveAdjustHistory() {
        this.safeLocalStorage('set', 'selfDisciplineAdjustHistory', this.adjustHistory);
    }

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    openAnalysisModal() {
        const modal = document.getElementById('analysisModal');
        this.analysisDate = new Date();
        this.updateAnalysisView();
        this.updateWeeklyReport();
        this.updateSuggestions();
        
        document.querySelectorAll('.analysis-tabs .analysis-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.analysis-tab');
                this.switchAnalysisTab(target.dataset.tab);
            });
        });
        
        this.activateModal(modal);
    }

    switchAnalysisTab(tabName) {
        document.querySelectorAll('.analysis-tabs .analysis-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('#analysisModal .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    navigateAnalysisDate(delta) {
        this.analysisDate.setDate(this.analysisDate.getDate() + delta);
        this.updateAnalysisView();
    }

    updateAnalysisView() {
        const dateStr = this.formatDate(this.analysisDate);
        document.getElementById('analysisDate').textContent = dateStr;
        
        const dayPlans = this.getPlansForDate(dateStr);
        const completedPlans = this.getCompletedPlansForDate(dateStr);
        const pendingPlans = dayPlans.filter(p => !completedPlans.includes(p));
        
        const rate = dayPlans.length > 0 
            ? Math.round((completedPlans.length / dayPlans.length) * 100) 
            : 0;
        
        document.getElementById('dayTotalTasks').textContent = dayPlans.length;
        document.getElementById('dayCompletedTasks').textContent = completedPlans.length;
        document.getElementById('dayPendingTasks').textContent = pendingPlans.length;
        document.getElementById('dayCompletionRate').textContent = `${rate}%`;
        
        document.getElementById('dailyProgressBar').style.width = `${rate}%`;
        document.getElementById('dailyProgressPercent').textContent = `${rate}%`;
        
        this.renderWeeklyChart();
        this.renderTaskTypeChart(dayPlans);
        this.renderDailySummary(dateStr, dayPlans, completedPlans, rate);
        this.renderTaskDetailList(dayPlans, completedPlans);
    }

    renderTaskTypeChart(plans) {
        const container = document.getElementById('taskTypeChart');
        
        const typeCount = {};
        plans.forEach(plan => {
            let type = '其他';
            if (plan.title.includes('热身') || plan.title.includes('激活')) {
                type = '热身激活';
            } else if (plan.title.includes('主训') || plan.title.includes('力量') || plan.title.includes('训练')) {
                type = '主训练';
            } else if (plan.title.includes('拉伸') || plan.title.includes('放松') || plan.title.includes('冷身')) {
                type = '拉伸放松';
            } else if (plan.title.includes('体态') || plan.title.includes('核心')) {
                type = '体态核心';
            } else if (plan.title.includes('休息') || plan.title.includes('恢复')) {
                type = '休息恢复';
            } else if (plan.isPeriodic) {
                type = '周期任务';
            }
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        if (Object.keys(typeCount).length === 0) {
            container.innerHTML = '<p class="summary-placeholder">暂无任务数据</p>';
            return;
        }
        
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        
        container.innerHTML = `<div class="type-chart">${
            Object.entries(typeCount).map(([type, count], index) => `
                <div class="type-chart-item">
                    <div class="type-chart-color" style="background: ${colors[index % colors.length]}"></div>
                    <span class="type-chart-name">${type}</span>
                    <span class="type-chart-count">${count}</span>
                </div>
            `).join('')
        }</div>`;
    }

    renderDailySummary(dateStr, allPlans, completedPlans) {
        const container = document.getElementById('dailySummary');
        
        if (allPlans.length === 0) {
            container.innerHTML = '<p class="summary-placeholder">该日期暂无计划安排</p>';
            return;
        }
        
        const rate = Math.round((completedPlans.length / allPlans.length) * 100);
        const pendingCount = allPlans.length - completedPlans.length;
        
        let summary = `<div class="summary-content">`;
        summary += `<p><strong>📅 ${dateStr}</strong></p>`;
        summary += `<p>今日共安排 <strong>${allPlans.length}</strong> 项任务，`;
        
        if (rate >= 80) {
            summary += `已完成 <strong style="color: #10b981">${completedPlans.length}</strong> 项，完成率 <strong style="color: #10b981">${rate}%</strong>，表现优秀！🎉</p>`;
        } else if (rate >= 50) {
            summary += `已完成 <strong style="color: #f59e0b">${completedPlans.length}</strong> 项，完成率 <strong style="color: #f59e0b">${rate}%</strong>，继续加油！💪</p>`;
        } else if (rate > 0) {
            summary += `已完成 <strong style="color: #ef4444">${completedPlans.length}</strong> 项，完成率 <strong style="color: #ef4444">${rate}%</strong>，需要更加努力！📈</p>`;
        } else {
            summary += `尚无已完成任务，请尽快开始执行！⏰</p>`;
        }
        
        if (pendingCount > 0) {
            summary += `<p>还有 <strong>${pendingCount}</strong> 项任务待完成。</p>`;
        }
        
        summary += `</div>`;
        container.innerHTML = summary;
    }

    renderTaskDetailList(plans, completedPlans) {
        const container = document.getElementById('taskDetailList');
        
        if (plans.length === 0) {
            container.innerHTML = '<p class="summary-placeholder">暂无任务详情</p>';
            return;
        }
        
        container.innerHTML = plans.map(plan => {
            const isCompleted = completedPlans.includes(plan);
            return `
                <div class="task-detail-item">
                    <div class="task-detail-status">${isCompleted ? '✅' : '⏳'}</div>
                    <div class="task-detail-content">
                        <div class="task-detail-title">${this.escapeHtml(plan.title)}</div>
                        <div class="task-detail-meta">
                            ${plan.isPeriodic ? `周期性 | 每${plan.periodDays}天` : '单次任务'}
                            ${plan.priority ? ` | 优先级: ${plan.priority === 'high' ? '高' : plan.priority === 'low' ? '低' : '中'}` : ''}
                        </div>
                    </div>
                    <span class="task-detail-type">${isCompleted ? '已完成' : '待完成'}</span>
                </div>
            `;
        }).join('');
    }

    updateWeeklyReport() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        document.getElementById('weekRange').textContent = 
            `${this.formatDate(weekStart)} 至 ${this.formatDate(weekEnd)}`;
        
        let weekTotalTasks = 0;
        let weekCompletedTasks = 0;
        const dailyStats = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = this.formatDate(date);
            const dayPlans = this.getPlansForDate(dateStr);
            const completedPlans = this.getCompletedPlansForDate(dateStr);
            
            weekTotalTasks += dayPlans.length;
            weekCompletedTasks += completedPlans.length;
            
            dailyStats.push({
                date: dateStr,
                total: dayPlans.length,
                completed: completedPlans.length,
                rate: dayPlans.length > 0 ? Math.round((completedPlans.length / dayPlans.length) * 100) : 0
            });
        }
        
        document.getElementById('weekTotalTasks').textContent = weekTotalTasks;
        document.getElementById('weekCompletedTasks').textContent = weekCompletedTasks;
        
        const weekRate = weekTotalTasks > 0 
            ? Math.round((weekCompletedTasks / weekTotalTasks) * 100) 
            : 0;
        document.getElementById('weekCompletionRate').textContent = `${weekRate}%`;
        
        const streak = this.calculateStreak();
        document.getElementById('weekStreak').textContent = streak;
        
        this.renderWeeklyTrendChart(dailyStats);
        this.renderWeeklySummary(weekTotalTasks, weekCompletedTasks, streak);
    }

    renderWeeklyTrendChart(dailyStats) {
        const container = document.getElementById('weeklyTrendChart');
        
        const maxRate = Math.max(...dailyStats.map(d => d.rate), 100);
        
        container.innerHTML = `
            <div class="chart-bar">
                ${dailyStats.map(day => `
                    <div class="chart-bar-item">
                        <div class="chart-bar-value">${day.rate}%</div>
                        <div class="chart-bar-fill" style="height: ${day.rate}%"></div>
                        <div class="chart-bar-label">${day.date.slice(5)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderWeeklySummary(total, completed, streak) {
        const container = document.getElementById('weeklySummary');
        
        if (total === 0) {
            container.innerHTML = '<p class="summary-placeholder">本周暂无计划数据</p>';
            return;
        }
        
        const rate = Math.round((completed / total) * 100);
        
        let summary = `<div class="summary-content">`;
        summary += `<p>本周共安排 <strong>${total}</strong> 项任务，已完成 <strong>${completed}</strong> 项。</p>`;
        summary += `<p>周完成率：<strong>${rate}%</strong></p>`;
        summary += `<p>连续打卡：<strong>${streak}</strong> 天</p>`;
        
        if (rate >= 80) {
            summary += `<p>🌟 本周表现优秀，继续保持！</p>`;
        } else if (rate >= 50) {
            summary += `<p>💪 本周表现良好，还有提升空间！</p>`;
        } else {
            summary += `<p>📈 本周需要加强执行力，下周加油！</p>`;
        }
        
        summary += `</div>`;
        container.innerHTML = summary;
    }

    renderWeeklyChart() {
        const container = document.getElementById('weeklyChartContent');
        const today = new Date();
        const weekData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            const plans = this.getPlansForDate(dateStr);
            const completed = this.getCompletedPlansForDate(dateStr);
            const rate = plans.length > 0 ? Math.round((completed.length / plans.length) * 100) : 0;
            
            weekData.push({
                day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
                rate,
                count: completed.length
            });
        }
        
        if (container) {
            container.innerHTML = `
                <div class="chart-container">
                    <div class="chart-title">本周完成趋势</div>
                    <div class="chart-bars">
                        ${weekData.map(d => `
                            <div class="chart-row">
                                <div class="chart-day-label">周${d.day}</div>
                                <div class="chart-bar-wrapper">
                                    <div class="chart-bar" style="width: ${d.rate}%"></div>
                                </div>
                                <div class="chart-value">${d.count}项</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    updateSuggestions() {
        const suggestions = this.generateSuggestions();
        const container = document.getElementById('suggestionsList');
        
        if (!container) return;
        
        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"></div>
                    <p>开始记录您的计划后，系统将为您生成个性化建议</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="suggestions-list">
                    ${suggestions.map(s => `
                        <div class="suggestion-item">
                            <div class="suggestion-title">${s.icon} ${s.title}</div>
                            <div class="suggestion-desc">${s.text}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        this.updateDisciplineScore();
    }

    generateSuggestions() {
        const suggestions = [];
        const today = new Date();
        const todayStr = this.formatDate(today);
        
        const todayPlans = this.getPlansForDate(todayStr);
        const todayCompleted = this.getCompletedPlansForDate(todayStr);
        const streak = this.calculateStreak();
        
        const totalPlans = this.plans.length;
        const totalCompletions = Object.keys(this.completions).length;
        const overallRate = totalPlans > 0 ? Math.round((totalCompletions / totalPlans) * 100) : 0;
        
        if (todayPlans.length === 0) {
            suggestions.push({
                icon: '📋',
                title: '添加今日计划',
                text: '您今天还没有安排任何计划。建议每天早上规划当天要完成的任务，培养良好的计划习惯。'
            });
        }
        
        if (todayPlans.length > 0 && todayCompleted.length < todayPlans.length) {
            const pending = todayPlans.length - todayCompleted.length;
            suggestions.push({
                icon: '⏰',
                title: '完成今日任务',
                text: `您今天还有 ${pending} 项任务未完成。建议合理安排时间，优先完成重要任务。`
            });
        }
        
        if (streak >= 7) {
            suggestions.push({
                icon: '🔥',
                title: '保持连续打卡',
                text: `太棒了！您已连续打卡 ${streak} 天，继续保持这个好习惯！`
            });
        } else if (streak > 0 && streak < 7) {
            suggestions.push({
                icon: '💪',
                title: '培养连续习惯',
                text: `您已连续打卡 ${streak} 天，坚持7天形成习惯，继续加油！`
            });
        }
        
        if (overallRate < 50 && totalPlans > 5) {
            suggestions.push({
                icon: '📊',
                title: '提高完成率',
                text: `您的整体完成率为 ${overallRate}%。建议减少每日任务数量，专注于最重要的任务，提高完成质量。`
            });
        }
        
        const periodicPlans = this.plans.filter(p => p.isPeriodic);
        if (periodicPlans.length === 0 && totalPlans > 0) {
            suggestions.push({
                icon: '🔄',
                title: '建立周期性计划',
                text: '建议添加一些周期性计划（如每日锻炼、每周复习），帮助建立稳定的自律习惯。'
            });
        }
        
        return suggestions.slice(0, 4);
    }

    updateDisciplineScore() {
        const score = this.calculateDisciplineScore();
        
        const scoreCircle = document.querySelector('#disciplineScore .score-number');
        if (scoreCircle) {
            scoreCircle.textContent = score.total;
        }
        
        const scoreDetails = document.getElementById('scoreDetails');
        if (scoreDetails) {
            scoreDetails.innerHTML = `
                <div class="score-item">
                    <span class="score-name">完成率</span>
                    <div class="score-bar"><div class="score-fill" style="width: ${score.completionRate}%"></div></div>
                    <span class="score-value">${score.completionScore}分</span>
                </div>
                <div class="score-item">
                    <span class="score-name">连续性</span>
                    <div class="score-bar"><div class="score-fill" style="width: ${score.streakRate}%"></div></div>
                    <span class="score-value">${score.streakScore}分</span>
                </div>
                <div class="score-item">
                    <span class="score-name">计划质量</span>
                    <div class="score-bar"><div class="score-fill" style="width: ${score.qualityRate}%"></div></div>
                    <span class="score-value">${score.qualityScore}分</span>
                </div>
            `;
        }
    }

    calculateDisciplineScore() {
        const streak = this.calculateStreak();
        const totalPlans = this.plans.length;
        const totalCompletions = Object.keys(this.completions).length;
        const completionRate = totalPlans > 0 ? (totalCompletions / totalPlans) * 100 : 0;
        
        const completionScore = Math.min(40, Math.round(completionRate * 0.4));
        const streakScore = Math.min(30, streak * 3);
        const qualityScore = Math.min(30, Math.round((totalPlans > 0 ? 30 : 0) * Math.min(1, totalPlans / 10)));
        
        return {
            total: completionScore + streakScore + qualityScore,
            completionScore: completionScore,
            completionRate: completionRate,
            streakScore: streakScore,
            streakRate: (streakScore / 30) * 100,
            qualityScore: qualityScore,
            qualityRate: (qualityScore / 30) * 100
        };
    }
}

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new SelfDisciplineApp();
    window.app = app;
    console.log('✅ 自律打卡系统初始化成功，app实例已暴露到全局');
});

let appInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    appInitialized = true;
});

document.addEventListener('click', (e) => {
    if (!appInitialized) return;
    
    const btnComplete = e.target.closest('.btn-complete');
    if (btnComplete) {
        if (btnComplete.disabled) {
            e.stopImmediatePropagation();
            return;
        }
        
        e.stopImmediatePropagation();
        const planId = btnComplete.dataset.planId;
        const date = btnComplete.dataset.date;
        console.log('标记完成按钮点击:', planId, date);
        
        const currentApp = window.app || app;
        if (currentApp) {
            currentApp.confirmCompletePlan(planId, date);
        } else {
            console.error('app实例未初始化');
        }
        return;
    }
    
    const target = e.target.closest('#confirmComplete, #cancelComplete');
    if (!target) return;
    
    const modal = document.getElementById('confirmModal');
    if (!modal || modal.style.display === 'none') return;
    
    e.stopImmediatePropagation();
    
    if (target.disabled) {
        console.log('按钮还在冷却中');
        return;
    }
    
    if (target.id === 'confirmComplete') {
        handleConfirmComplete();
    } else if (target.id === 'cancelComplete') {
        handleCancelComplete();
    }
}, true);

function handleConfirmComplete() {
    console.log('确认完成 - 状态检查');
    
    let finalPlan = window.__PENDING_PLAN || 
                   (window.app && window.app.pendingCompletePlan) || 
                   window.pendingCompletePlan;
    
    if (!finalPlan) {
        console.error('找不到待完成的计划');
        closeConfirmModal();
        return;
    }
    
    console.log('执行完成计划:', finalPlan);
    
    if (window.app) {
        window.app.completePlan(finalPlan.planId, finalPlan.date);
    }
    
    closeConfirmModal();
    
    window.__PENDING_PLAN = null;
    window.pendingCompletePlan = null;
    if (window.app) window.app.pendingCompletePlan = null;
}

function handleCancelComplete() {
    console.log('取消完成');
    closeConfirmModal();
    
    window.__PENDING_PLAN = null;
    window.pendingCompletePlan = null;
    if (window.app) window.app.pendingCompletePlan = null;
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const overlay = document.getElementById('globalModalOverlay');
    
    if (modal) {
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        modal.classList.remove('active');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
    }
    
    document.body.style.overflow = '';
}

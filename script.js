// Map initialization (deferred, guarded, with tile fallback)
function initLocationMap() {
    const el = document.getElementById('location-map');
    if (!el) return;
    if (!window.L || typeof L.map !== 'function') {
        showMapFallback();
        return;
    }
    try {
        if (el._leaflet_id) return; // already initialized
        const coords = [23.0225, 72.5714]; // Ahmedabad
        const map = L.map('location-map', {
            zoomControl: false,
            scrollWheelZoom: false,
            dragging: false,
            doubleClickZoom: false,
            touchZoom: false,
            attributionControl: false,
            keyboard: false
        }).setView(coords, 11);

        const primary = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        });
        const fallback = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        });
        let fellBack = false;
        primary.on('tileerror', () => {
            if (!fellBack) {
                fellBack = true;
                try { map.removeLayer(primary); } catch (e) { /* noop */ }
                fallback.addTo(map);
                // OSM tiles are light — force them dark via CSS so the map stays black
                el.classList.add('is-fallback-dark');
            }
        });
        primary.addTo(map);

        const customIcon = L.divIcon({
            className: 'custom-ping-marker',
            html: '<div class="map-ping-container"><div class="map-ping-dot"></div><div class="map-ping-animation"></div></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        L.marker(coords, { icon: customIcon, interactive: false, keyboard: false }).addTo(map);

        // Leaflet needs a size recalc after paint (sticky sidebars report 0 width otherwise)
        const refresh = () => { try { map.invalidateSize(); } catch (e) { /* noop */ } };
        setTimeout(refresh, 100);
        setTimeout(refresh, 600);
        window.addEventListener('resize', refresh);
    } catch (err) {
        console.warn('Map init failed:', err);
        showMapFallback();
    }
}

function showMapFallback() {
    const fb = document.getElementById('location-map-fallback');
    if (fb) fb.hidden = false;
}

// Back to Top functionality
document.addEventListener("DOMContentLoaded", () => {
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        });
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

// Theme Toggle functionality
const MOON_ICON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
const SUN_ICON = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';

function syncThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    const isBlue = document.documentElement.getAttribute('data-theme') === 'midnight-blue';
    themeIcon.innerHTML = isBlue ? SUN_ICON : MOON_ICON;
}

document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Check local storage for theme
    try {
        const currentTheme = localStorage.getItem('theme') || 'dark-black';
        if (currentTheme === 'midnight-blue') {
            document.documentElement.setAttribute('data-theme', 'midnight-blue');
        }
    } catch (e) { /* private mode: ignore */ }
    syncThemeIcon();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            try {
                if (theme === 'midnight-blue') {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'dark-black');
                } else {
                    document.documentElement.setAttribute('data-theme', 'midnight-blue');
                    localStorage.setItem('theme', 'midnight-blue');
                }
            } catch (e) {
                if (theme === 'midnight-blue') {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', 'midnight-blue');
                }
            }
            syncThemeIcon();
        });
    }

    // Initialize map + GitHub API Repos & Contributions (map failure must not break the rest)
    try { initLocationMap(); } catch (e) { console.warn('Map init threw:', e); showMapFallback(); }
    fetchAndRenderRepoStats();
    initGitHubContributionGraph();
});

/* ==========================================================================
   GitHub Repository Statistics (Stars & Forks) Engine
   ========================================================================== */
async function fetchAndRenderRepoStats() {
    const badges = document.querySelectorAll('.repo-stats-badge');
    if (!badges.length) return;

    // Show initial placeholders with SVG icons
    badges.forEach(badge => {
        badge.innerHTML = `
            <span class="stat-item" title="Stars">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span class="stat-value star-count">...</span>
            </span>
            <span class="stat-item" title="Forks">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>
                <span class="stat-value fork-count">...</span>
            </span>
        `;
    });

    try {
        let repoDataMap = {};
        const cacheKey = 'gh_repo_stats_cache_v2';
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < 1800000 && parsed.data) { // 30 min cache
                    repoDataMap = parsed.data;
                }
            } catch (e) {
                console.warn('Cache error:', e);
            }
        }

        if (Object.keys(repoDataMap).length === 0) {
            const response = await fetch('https://api.github.com/users/pandejesal/repos?per_page=100');
            if (response.ok) {
                const repos = await response.json();
                repos.forEach(repo => {
                    const fullName = repo.full_name.toLowerCase();
                    const shortName = repo.name.toLowerCase();
                    const stats = { stars: repo.stargazers_count || 0, forks: repo.forks_count || 0 };
                    repoDataMap[fullName] = stats;
                    repoDataMap[`pandejesal/${shortName}`] = stats;
                    repoDataMap[shortName] = stats;
                });
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: repoDataMap }));
                } catch (e) { /* storage full/private mode */ }
            } else if (response.status === 403) {
                console.warn('GitHub repo API rate-limited; showing cached/zero values.');
            }
        }

        badges.forEach(badge => {
            const repoPath = (badge.getAttribute('data-repo') || '').toLowerCase().trim();
            const stats = repoDataMap[repoPath] || repoDataMap[repoPath.replace('pandejesal/', '')] || { stars: 0, forks: 0 };

            const starEl = badge.querySelector('.star-count');
            const forkEl = badge.querySelector('.fork-count');
            if (starEl) starEl.textContent = stats.stars;
            if (forkEl) forkEl.textContent = stats.forks;
        });
    } catch (err) {
        console.warn('Failed to fetch GitHub repo stats:', err);
        badges.forEach(badge => {
            const starEl = badge.querySelector('.star-count');
            const forkEl = badge.querySelector('.fork-count');
            if (starEl && starEl.textContent === '...') starEl.textContent = '0';
            if (forkEl && forkEl.textContent === '...') forkEl.textContent = '0';
        });
    }
}

/* ==========================================================================
   GitHub Contribution Graph Engine (Year, Month, Day Breakdown)
   ========================================================================== */
let allContributionsData = null;
let currentSelectedYear = new Date().getFullYear().toString();
let currentSelectedMonth = 'all';

async function initGitHubContributionGraph() {
    const gridContainer = document.getElementById('heatmap-grid');
    if (!gridContainer) return;

    try {
        const res = await fetch('https://github-contributions-api.jogruber.de/v4/pandejesal');
        if (!res.ok) throw new Error('Contribution API returned ' + res.status);
        const data = await res.json();
        if (data && data.contributions && data.contributions.length > 0) {
            allContributionsData = data;
        } else {
            throw new Error('Empty contributions data received');
        }
    } catch (err) {
        console.warn('Primary Contribution API failed, attempting GitHub REST API fallback:', err);
        try {
            allContributionsData = await fetchGitHubEventsFallback();
        } catch (err2) {
            console.warn('GitHub REST API failed, showing empty honest state:', err2);
            allContributionsData = emptyContributions(currentSelectedYear);
        }
    }

    renderYearButtons();
    renderContributionGraph();

    const monthSelect = document.getElementById('month-filter-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', (e) => {
            currentSelectedMonth = e.target.value;
            filterHeatmapByMonth();
            renderMonthlyBars();
        });
    }
}

async function fetchGitHubEventsFallback() {
    // Honest fallback: only real public events from the last ~90 days.
    // Days without events stay at 0 — never synthesize activity.
    const res = await fetch('https://api.github.com/users/pandejesal/events?per_page=100');
    if (!res.ok) throw new Error('GitHub API ' + res.status);
    const events = await res.json();

    const dateCounts = {};
    if (Array.isArray(events)) {
        events.forEach(evt => {
            if (evt.created_at) {
                const dateStr = evt.created_at.slice(0, 10);
                dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
            }
        });
    }

    const currentYr = new Date().getFullYear().toString();
    const days = generateYearDays(currentYr);
    let totalCount = 0;

    days.forEach((day) => {
        if (dateCounts[day.date]) {
            day.count = dateCounts[day.date];
            day.level = Math.min(4, Math.ceil(day.count / 2));
            totalCount += day.count;
        }
    });

    return {
        total: { [currentYr]: totalCount },
        contributions: days,
        partial: true // REST events API only covers recent history
    };
}

function renderYearButtons() {
    const container = document.getElementById('year-filter-buttons');
    if (!container || !allContributionsData) return;

    let years = Object.keys(allContributionsData.total || {}).sort((a, b) => b - a);
    if (!years.length && allContributionsData.contributions) {
        const yearSet = new Set(allContributionsData.contributions.map(item => item.date.slice(0, 4)));
        years = Array.from(yearSet).sort((a, b) => b - a);
    }

    const defaultYear = new Date().getFullYear().toString();
    if (!years.length) years.push(defaultYear);

    if (!years.includes(currentSelectedYear)) {
        currentSelectedYear = years[0];
    }

    container.innerHTML = years.map(y => `
        <button class="year-pill ${y === currentSelectedYear ? 'active' : ''}" data-year="${y}">${y}</button>
    `).join('');

    container.querySelectorAll('.year-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedYear = btn.getAttribute('data-year');
            container.querySelectorAll('.year-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderContributionGraph();
        });
    });
}

function renderContributionGraph() {
    if (!allContributionsData) return;

    const list = (allContributionsData.contributions || []).filter(item => {
        return item.date && item.date.startsWith(currentSelectedYear);
    });

    const yearContributions = list.length > 0 ? list : generateYearDays(currentSelectedYear);

    // Calculate total, streaks, active days
    let totalCount = 0;
    let activeDays = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    yearContributions.forEach(item => {
        totalCount += item.count;
        if (item.count > 0) {
            activeDays++;
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
    });

    // Calculate current streak
    const sorted = [...yearContributions].sort((a,b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 0;
    for (let item of sorted) {
        if (item.count > 0) {
            currentStreak++;
        } else if (currentStreak > 0) {
            break;
        }
    }

    // Update summary metrics
    const totalEl = document.getElementById('contrib-total-count');
    const currentStreakEl = document.getElementById('contrib-current-streak');
    const maxStreakEl = document.getElementById('contrib-max-streak');
    const activeDaysEl = document.getElementById('contrib-active-days');

    if (totalEl) totalEl.textContent = totalCount.toLocaleString();
    if (currentStreakEl) currentStreakEl.textContent = `${currentStreak} days`;
    if (maxStreakEl) maxStreakEl.textContent = `${maxStreak} days`;
    if (activeDaysEl) activeDaysEl.textContent = activeDays;

    // Honest empty / partial states — never imply fake activity
    const inspectorCount = document.getElementById('inspector-count');
    if (allContributionsData && allContributionsData.empty && totalCount === 0 && inspectorCount) {
        inspectorCount.textContent = 'Live data unavailable — see the GitHub profile for full history';
    } else if (allContributionsData && allContributionsData.partial && inspectorCount) {
        inspectorCount.textContent = 'Recent public events only (last ~90 days) — see GitHub for full history';
    }

    // Build Heatmap Grid
    const grid = document.getElementById('heatmap-grid');
    const monthsHeader = document.getElementById('heatmap-months-header');
    if (!grid || !monthsHeader) return;

    grid.innerHTML = '';
    monthsHeader.innerHTML = '';

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthColSpans = Array(12).fill(0);

    yearContributions.forEach((day) => {
        const d = new Date(day.date + 'T00:00:00');
        const monthIdx = d.getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
            monthColSpans[monthIdx]++;
        }

        const cell = document.createElement('div');
        const lvl = day.level !== undefined ? day.level : Math.min(4, Math.floor(day.count / 3));
        cell.className = `day-cell level-${lvl}`;
        cell.setAttribute('data-date', day.date);
        cell.setAttribute('data-count', day.count);
        cell.setAttribute('data-month', monthIdx);

        cell.addEventListener('mouseenter', () => updateDayInspector(day));
        cell.addEventListener('click', () => {
            document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected-day'));
            cell.classList.add('selected-day');
            updateDayInspector(day);
        });

        grid.appendChild(cell);
    });

    monthNames.forEach((name, mIdx) => {
        const weeks = Math.max(1, Math.round(monthColSpans[mIdx] / 7));
        const monthLabel = document.createElement('span');
        monthLabel.className = 'month-col-label';
        monthLabel.style.gridColumn = `span ${weeks}`;
        monthLabel.textContent = name;
        monthsHeader.appendChild(monthLabel);
    });

    filterHeatmapByMonth();
    renderMonthlyBars(yearContributions);
}

function filterHeatmapByMonth() {
    const cells = document.querySelectorAll('.day-cell');
    cells.forEach(cell => {
        if (currentSelectedMonth === 'all') {
            cell.classList.remove('dimmed');
        } else {
            const cellMonth = cell.getAttribute('data-month');
            if (cellMonth === currentSelectedMonth) {
                cell.classList.remove('dimmed');
            } else {
                cell.classList.add('dimmed');
            }
        }
    });
}

function updateDayInspector(dayItem) {
    const dateEl = document.getElementById('inspector-date');
    const countEl = document.getElementById('inspector-count');
    if (!dateEl || !countEl) return;

    if (!dayItem || !dayItem.date) {
        dateEl.textContent = 'Hover or click any cell in the graph to inspect activity';
        countEl.textContent = 'Breakdown by year, month, and day';
        return;
    }

    const dateObj = new Date(dayItem.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    dateEl.textContent = formattedDate;
    const count = dayItem.count || 0;
    countEl.textContent = `${count} ${count === 1 ? 'contribution' : 'contributions'} on this day`;
}

function renderMonthlyBars(yearContributions = []) {
    const container = document.getElementById('monthly-bars-container');
    if (!container) return;

    // Use current list if not passed
    if (!yearContributions.length && allContributionsData) {
        yearContributions = (allContributionsData.contributions || []).filter(item => item.date && item.date.startsWith(currentSelectedYear));
    }

    const monthTotals = Array(12).fill(0);
    yearContributions.forEach(item => {
        const m = new Date(item.date + 'T00:00:00').getMonth();
        if (m >= 0 && m < 12) {
            monthTotals[m] += item.count;
        }
    });

    const maxVal = Math.max(...monthTotals, 1);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    container.innerHTML = monthTotals.map((tot, idx) => {
        const heightPct = Math.max(8, Math.round((tot / maxVal) * 100));
        const isActive = currentSelectedMonth === String(idx);
        return `
            <div class="monthly-bar-wrapper ${isActive ? 'active' : ''}" data-month="${idx}" title="${monthLabels[idx]}: ${tot} contributions">
                <div class="monthly-bar" style="height: ${heightPct}%;"></div>
                <span class="monthly-bar-label">${monthLabels[idx]}</span>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.monthly-bar-wrapper').forEach(bar => {
        bar.addEventListener('click', () => {
            const m = bar.getAttribute('data-month');
            const select = document.getElementById('month-filter-select');
            if (currentSelectedMonth === m) {
                currentSelectedMonth = 'all';
                if (select) select.value = 'all';
            } else {
                currentSelectedMonth = m;
                if (select) select.value = m;
            }
            filterHeatmapByMonth();
            renderMonthlyBars(yearContributions);
        });
    });
}

function generateYearDays(year) {
    const days = [];
    const yr = parseInt(year, 10) || new Date().getFullYear();
    const isLeap = (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);
    const totalDays = isLeap ? 366 : 365;
    const start = new Date(`${yr}-01-01T00:00:00`);

    for (let i = 0; i < totalDays; i++) {
        const curr = new Date(start);
        curr.setDate(start.getDate() + i);
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        days.push({
            date: `${yyyy}-${mm}-${dd}`,
            count: 0,
            level: 0
        });
    }
    return days;
}

function emptyContributions(year) {
    const targetYr = year || new Date().getFullYear().toString();
    return {
        total: { [targetYr]: 0 },
        contributions: generateYearDays(targetYr),
        empty: true
    };
}

// Legacy alias kept for compatibility — now returns an honest empty year.
function generateFallbackContributions(year) {
    return emptyContributions(year);
}

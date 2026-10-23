// ==========================================================================
// SITE & SUPERVISOR OPERATIONS SYSTEM
// Professional Enterprise Edition — 100% English UI
// Hierarchical Drilldown: Site -> Supervisor -> Date-Wise Labour, Machinery, Tools & Cash
// ==========================================================================

const db = new Dexie('EnterpriseSiteOpsDB');
db.version(1).stores({
  sites:        '++id, name, location, code, defaultSupervisor, status',
  supervisors:  '++id, name, phone, role, primarySite, status',
  reports:      '++id, date, siteName, siteStatus, supervisorName, supervisorAttendance, workDescription, totalManpowerCost, totalManpowerCount, remarks, createdBy',
  machinery:    '++id, date, machineName, regNo, siteName, supervisorName, ownership, billingType, hoursUsed, daysUsed, ratePerHour, ratePerDay, machineCost, fuelCost, totalCost, paidBy, status, remarks, createdBy',
  tools:        '++id, toolName, toolTag, category, costPrice, siteName, assignedTo, issueDate, returnDate, status, condition, remarks, createdBy',
  cashInflow:   '++id, date, supervisorName, siteName, amount, paymentMode, voucherNo, remarks, createdBy',
  expenses:     '++id, date, supervisorName, siteName, category, amount, fundingSource, paidTo, voucherNo, remarks, createdBy',
  auditLog:     '++id, timestamp, operator, action, module, details'
});

// App State
let currentOperator = localStorage.getItem('siteOps_operator') || 'Desktop Operator 1';
let selectedSiteName = '1378 Saharanpur';
let selectedSupervisorName = 'All';
let currentFundingSource = 'company';
let currentMachineBillingType = 'hourly';

// DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  updateOperatorUI();
  await initializeDatabaseWithSeedData();
  await populateGlobalDropdowns();
  setupDatePickers();
  showView('drilldown');
  selectSite(selectedSiteName);
});

// Setup current date defaults
function setupDatePickers() {
  const today = new Date().toISOString().split('T')[0];
  const dateFieldIds = ['report-date-input', 'mach-date-input', 'tool-date-input', 'inflow-date-input', 'exp-date-input'];
  dateFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = today;
  });
}

// Update Operator UI
function updateOperatorUI() {
  const nameEl = document.getElementById('sidebar-op-name');
  const avatarEl = document.getElementById('sidebar-op-avatar');
  if (nameEl) nameEl.textContent = currentOperator;
  if (avatarEl) {
    const parts = currentOperator.trim().split(' ');
    avatarEl.textContent = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  }
}

// Audit Logger
async function logAudit(action, module, details) {
  const now = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
  await db.auditLog.add({
    timestamp: now,
    operator: currentOperator,
    action,
    module,
    details
  });
}

// ==================== SEED DATABASE ====================
async function initializeDatabaseWithSeedData() {
  const count = await db.sites.count();
  if (count > 0) return;

  if (typeof SEED_DATA !== 'undefined') {
    await db.sites.bulkAdd(SEED_DATA.sites.map(s => ({ ...s, createdBy: 'System Setup' })));
    await db.supervisors.bulkAdd(SEED_DATA.supervisors.map(s => ({ ...s, createdBy: 'System Setup' })));
    await db.reports.bulkAdd(SEED_DATA.reports.map(r => ({ ...r, createdBy: 'System Setup' })));
    await db.machinery.bulkAdd(SEED_DATA.machinery.map(m => ({ ...m, createdBy: 'System Setup' })));
    await db.tools.bulkAdd(SEED_DATA.tools.map(t => ({ ...t, createdBy: 'System Setup' })));
    await db.cashInflow.bulkAdd(SEED_DATA.cashInflow.map(i => ({ ...i, createdBy: 'System Setup' })));
    await db.expenses.bulkAdd(SEED_DATA.expenses.map(e => ({ ...e, createdBy: 'System Setup' })));

    await logAudit('Database Initialized', 'System', 'Pre-seeded initial records from Accounts SOP & Day Book');
  }
}

// Mobile Sidebar Toggle
function toggleSidebar(forceState) {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  const isOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', isOpen);
  if (backdrop) backdrop.classList.toggle('active', isOpen);
}

// ==================== VIEW NAVIGATION ====================
function showView(viewId) {
  if (window.innerWidth <= 992) {
    toggleSidebar(false);
  }

  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById(`view-${viewId}`);
  if (viewEl) viewEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navEl) navEl.classList.add('active');

  const titles = {
    'drilldown': { title: 'Site & Supervisor Operations Explorer', desc: 'Select a Site and Supervisor to inspect date-wise labour, machinery, tools and imprest cash' },
    'morning-reports': { title: 'Daily Morning Reports Ledger', desc: 'Master register of all site progress reports submitted from the field' },
    'machinery': { title: 'Machinery & Heavy Assets Tracker', desc: 'Monitor running hours, daily rental rates, diesel fuel expenditure, and equipment health' },
    'tools': { title: 'Tools & Equipment Inventory', desc: 'Track issued tools, valuation, serial tags, current condition and return status' },
    'cash-flow': { title: 'Supervisor Cash Flow & Expense Ledger', desc: 'Audit company advances against actual expenditures with company fund vs own pocket tracking' },
    'audit-log': { title: 'Desktop Operator Audit Trail', desc: 'Complete history of data entered, modified or removed by desktop operators' }
  };

  const info = titles[viewId] || { title: 'Site Operations System', desc: '' };
  document.getElementById('topbar-page-title').textContent = info.title;
  document.getElementById('topbar-page-desc').textContent = info.desc;

  if (viewId === 'drilldown') renderDrilldownView();
  if (viewId === 'morning-reports') renderMorningReportsTable();
  if (viewId === 'machinery') renderAllMachineryTable();
  if (viewId === 'tools') renderAllToolsTable();
  if (viewId === 'cash-flow') renderCashFlowTables();
  if (viewId === 'audit-log') renderAuditTrailTable();
}

// ==================== GLOBAL DROPDOWNS ====================
async function populateGlobalDropdowns() {
  const sites = await db.sites.toArray();
  const supervisors = await db.supervisors.toArray();

  // Populate site dropdowns
  const siteSelectIds = [
    'drilldown-site-select', 'report-site-input', 'mach-site-input',
    'tool-site-input', 'inflow-site-input', 'exp-site-input',
    'filter-reports-site', 'filter-mach-site', 'filter-tools-site'
  ];

  siteSelectIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isFilter = id.startsWith('filter-');
    let html = isFilter ? '<option value="All">All Sites</option>' : '<option value="">-- Select Work Site --</option>';
    sites.forEach(s => {
      html += `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`;
    });
    el.innerHTML = html;
  });

  // Populate supervisor dropdowns
  const supSelectIds = [
    'drilldown-sup-select', 'report-sup-input', 'mach-sup-input',
    'inflow-sup-input', 'exp-sup-input', 'filter-reports-sup',
    'filter-mach-sup', 'filter-exp-sup'
  ];

  supSelectIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isFilter = id.startsWith('filter-') || id === 'drilldown-sup-select';
    let html = isFilter ? '<option value="All">All Supervisors</option>' : '<option value="">-- Select Supervisor --</option>';
    supervisors.forEach(s => {
      html += `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${escapeHtml(s.role)})</option>`;
    });
    el.innerHTML = html;
  });

  // Populate AssignedTo in Tool Modal
  const toolAssignSelect = document.getElementById('tool-assigned-input');
  if (toolAssignSelect) {
    let html = '<option value="">-- Choose Supervisor or Worker --</option>';
    supervisors.forEach(s => {
      html += `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (Supervisor)</option>`;
    });
    toolAssignSelect.innerHTML = html;
  }
}

// ==========================================================================
// DRILLDOWN SYSTEM (THE CORE CONCEPT: Site -> Supervisor -> Date-Wise Details)
// ==========================================================================

async function renderDrilldownView() {
  await renderSiteCardsCarousel();
  await updateDrilldownContent();
}

// Render the top interactive site cards
async function renderSiteCardsCarousel() {
  const container = document.getElementById('drilldown-sites-carousel');
  if (!container) return;

  const sites = await db.sites.toArray();
  const reports = await db.reports.toArray();

  let html = '';
  sites.forEach(s => {
    const isSelected = s.name === selectedSiteName;
    const siteReports = reports.filter(r => r.siteName === s.name);
    const lastReport = siteReports[siteReports.length - 1];

    let badgeClass = 'badge-running';
    if (s.status === 'On Hold') badgeClass = 'badge-hold';
    if (s.status === 'Closed') badgeClass = 'badge-closed';
    if (s.status === 'Completed') badgeClass = 'badge-completed';

    html += `
      <div class="site-card ${isSelected ? 'selected' : ''}" onclick="selectSite('${escapeHtml(s.name)}')">
        <div class="site-card-top">
          <div>
            <div class="site-card-title">${escapeHtml(s.name)}</div>
            <div class="site-card-sub"><i class="fas fa-location-dot"></i> ${escapeHtml(s.location || s.code)}</div>
          </div>
          <span class="badge ${badgeClass}">${escapeHtml(s.status)}</span>
        </div>
        <div class="site-card-meta">
          <span><i class="fas fa-user-tie"></i> ${escapeHtml(s.defaultSupervisor || 'Unassigned')}</span>
          <span><b>${siteReports.length}</b> Reports</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Site Selection Trigger
async function selectSite(siteName) {
  selectedSiteName = siteName;
  const siteSelect = document.getElementById('drilldown-site-select');
  if (siteSelect) siteSelect.value = siteName;

  // Refresh site cards UI
  document.querySelectorAll('.site-card').forEach(card => {
    const title = card.querySelector('.site-card-title')?.textContent?.trim();
    card.classList.toggle('selected', title === siteName);
  });

  // Filter supervisor dropdown to default or related supervisors
  const site = await db.sites.where('name').equals(siteName).first();
  if (site && site.defaultSupervisor) {
    selectedSupervisorName = site.defaultSupervisor;
    const supSelect = document.getElementById('drilldown-sup-select');
    if (supSelect) supSelect.value = site.defaultSupervisor;
  }

  await updateDrilldownContent();
}

// Dropdown change handlers
function onDrilldownSiteChange() {
  const select = document.getElementById('drilldown-site-select');
  if (select) selectSite(select.value);
}

function onDrilldownSupChange() {
  const select = document.getElementById('drilldown-sup-select');
  if (select) {
    selectedSupervisorName = select.value;
    updateDrilldownContent();
  }
}

// Update the detailed drilldown panels (Manpower, Machinery, Tools, Cash)
async function updateDrilldownContent() {
  const bannerSite = document.getElementById('banner-site-name');
  const bannerSup = document.getElementById('banner-sup-name');
  const bannerStatus = document.getElementById('banner-site-status');

  const site = await db.sites.where('name').equals(selectedSiteName).first();
  const status = site ? site.status : 'Running';

  if (bannerSite) bannerSite.textContent = selectedSiteName;
  if (bannerSup) bannerSup.textContent = selectedSupervisorName;
  if (bannerStatus) {
    bannerStatus.textContent = status;
    bannerStatus.className = `badge ${status === 'Running' ? 'badge-running' : status === 'On Hold' ? 'badge-hold' : 'badge-closed'}`;
  }

  // Fetch filtered data
  let reports = await db.reports.where('siteName').equals(selectedSiteName).toArray();
  let machinery = await db.machinery.where('siteName').equals(selectedSiteName).toArray();
  let tools = await db.tools.where('siteName').equals(selectedSiteName).toArray();
  let expenses = await db.expenses.where('siteName').equals(selectedSiteName).toArray();
  let inflows = await db.cashInflow.where('siteName').equals(selectedSiteName).toArray();

  if (selectedSupervisorName !== 'All') {
    reports = reports.filter(r => r.supervisorName === selectedSupervisorName);
    machinery = machinery.filter(m => m.supervisorName === selectedSupervisorName);
    tools = tools.filter(t => t.assignedTo === selectedSupervisorName || t.assignedTo?.includes(selectedSupervisorName));
    expenses = expenses.filter(e => e.supervisorName === selectedSupervisorName);
    inflows = inflows.filter(i => i.supervisorName === selectedSupervisorName);
  }

  // 1. Render Tab 1: Manpower & Daily Labour
  renderDrilldownManpower(reports);

  // 2. Render Tab 2: Machinery (Hourly & Daily)
  renderDrilldownMachinery(machinery);

  // 3. Render Tab 3: Tools & Equipment
  renderDrilldownTools(tools);

  // 4. Render Tab 4: Cash Flow & Imprest Reconciliation
  renderDrilldownImprest(inflows, expenses);
}

// Switch Drilldown Tabs
function switchDrillTab(tabId) {
  document.querySelectorAll('.drill-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.drill-tab-pane').forEach(p => p.classList.remove('active'));

  const tabBtn = document.getElementById(`tab-btn-${tabId}`);
  const pane = document.getElementById(`tab-pane-${tabId}`);

  if (tabBtn) tabBtn.classList.add('active');
  if (pane) pane.classList.add('active');
}

// -------------------------------------------------------------
// TAB 1: MANPOWER & DAILY LABOUR (Date-wise Count, Rate, Total)
// -------------------------------------------------------------
function renderDrilldownManpower(reports) {
  const tbody = document.getElementById('drill-manpower-tbody');
  const summaryEl = document.getElementById('drill-manpower-summary');
  if (!tbody) return;

  if (reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No manpower reports recorded for this Site &amp; Supervisor. Click "+ Record Morning Report" to add.</td></tr>';
    if (summaryEl) summaryEl.innerHTML = '';
    return;
  }

  let totalManpowerCostAllDays = 0;
  let totalHeadCount = 0;
  let html = '';

  reports.forEach(rep => {
    totalManpowerCostAllDays += (parseFloat(rep.totalManpowerCost) || 0);

    const manpowerList = rep.manpower || [];
    manpowerList.forEach((m, idx) => {
      totalHeadCount += (parseInt(m.count) || 0);
      const isFirst = idx === 0;

      html += `
        <tr>
          ${isFirst ? `<td rowspan="${manpowerList.length}"><b>${escapeHtml(rep.date)}</b></td>` : ''}
          ${isFirst ? `<td rowspan="${manpowerList.length}"><strong>${escapeHtml(rep.supervisorName)}</strong><br/><small class="badge badge-info">${escapeHtml(rep.supervisorAttendance || 'Present')}</small></td>` : ''}
          <td><strong>${escapeHtml(m.category)}</strong></td>
          <td><span class="badge ${m.type === 'Permanent' ? 'badge-company' : 'badge-self'}">${escapeHtml(m.type || '-')}</span> ${m.details ? `<small>(${escapeHtml(m.details)})</small>` : ''}</td>
          <td><b>${escapeHtml(m.count)}</b> Nos</td>
          <td>₹${parseFloat(m.rate).toLocaleString('en-US')} / head</td>
          <td><strong>₹${(parseFloat(m.total) || (m.count * m.rate)).toLocaleString('en-US')}</strong></td>
          ${isFirst ? `<td rowspan="${manpowerList.length}" style="max-width:280px;font-size:12px;color:var(--text-muted)">${escapeHtml(rep.workDescription || '-')}</td>` : ''}
        </tr>
      `;
    });
  });

  tbody.innerHTML = html;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:12px 16px;border-radius:8px;border:1px solid var(--border);margin-top:14px">
        <div>
          <span>Total Headcount Deployed: <b>${totalHeadCount} Workers</b></span>
          <span style="margin-left:20px">Total Reports: <b>${reports.length} Days</b></span>
        </div>
        <div style="font-size:15px">
          Total Manpower Wages: <strong style="color:var(--primary);font-size:18px">₹${totalManpowerCostAllDays.toLocaleString('en-US')}</strong>
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// TAB 2: MACHINERY LOG (Hourly System vs Daily Rate, Rent vs Own)
// -------------------------------------------------------------
function renderDrilldownMachinery(machinery) {
  const tbody = document.getElementById('drill-machinery-tbody');
  const summaryEl = document.getElementById('drill-machinery-summary');
  if (!tbody) return;

  if (machinery.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-muted)">No machinery deployed on this Site for this Supervisor. Click "+ Deploy Machine" to record machinery usage.</td></tr>';
    if (summaryEl) summaryEl.innerHTML = '';
    return;
  }

  let totalRentCost = 0;
  let totalFuelCost = 0;
  let html = '';

  machinery.forEach(m => {
    const mCost = parseFloat(m.machineCost) || 0;
    const fCost = parseFloat(m.fuelCost) || 0;
    const tCost = parseFloat(m.totalCost) || (mCost + fCost);

    totalRentCost += mCost;
    totalFuelCost += fCost;

    const isOwn = m.ownership === 'Own';
    const isHourly = m.billingType === 'Hourly System';

    html += `
      <tr>
        <td><b>${escapeHtml(m.date || '-')}</b></td>
        <td><strong><i class="fas fa-truck-monster" style="color:var(--teal)"></i> ${escapeHtml(m.machineName)}</strong> <small>(${escapeHtml(m.regNo || '-')})</small></td>
        <td><span class="badge ${isOwn ? 'badge-company' : 'badge-self'}">${escapeHtml(m.ownership)}</span></td>
        <td><span class="badge ${isHourly ? 'badge-info' : 'badge-running'}">${escapeHtml(m.billingType)}</span></td>
        <td><b>${isHourly ? `${m.hoursUsed} Hrs` : `${m.daysUsed} Day(s)`}</b></td>
        <td>${isHourly ? `₹${parseFloat(m.ratePerHour || 0).toLocaleString('en-US')} / hr` : `₹${parseFloat(m.ratePerDay || 0).toLocaleString('en-US')} / day`}</td>
        <td><b>₹${mCost.toLocaleString('en-US')}</b></td>
        <td><b>₹${fCost.toLocaleString('en-US')}</b></td>
        <td><strong style="color:var(--primary)">₹${tCost.toLocaleString('en-US')}</strong></td>
        <td><small>${escapeHtml(m.paidBy || '-')}</small></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:12px 16px;border-radius:8px;border:1px solid var(--border);margin-top:14px">
        <div>
          <span>Total Rental Cost: <b>₹${totalRentCost.toLocaleString('en-US')}</b></span>
          <span style="margin-left:20px">Total Diesel / Fuel Cost: <b>₹${totalFuelCost.toLocaleString('en-US')}</b></span>
        </div>
        <div style="font-size:15px">
          Combined Machinery Expenditure: <strong style="color:var(--primary);font-size:18px">₹${(totalRentCost + totalFuelCost).toLocaleString('en-US')}</strong>
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// TAB 3: TOOLS & EQUIPMENT (Tool Name, Tag, Cost Price, Status)
// -------------------------------------------------------------
function renderDrilldownTools(tools) {
  const tbody = document.getElementById('drill-tools-tbody');
  const summaryEl = document.getElementById('drill-tools-summary');
  if (!tbody) return;

  if (tools.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No tools currently tracked for this Site &amp; Supervisor. Click "+ Add / Issue Tool" to register tools.</td></tr>';
    if (summaryEl) summaryEl.innerHTML = '';
    return;
  }

  let totalToolValuation = 0;
  let html = '';

  tools.forEach(t => {
    const cost = parseFloat(t.costPrice) || 0;
    totalToolValuation += cost;

    let badgeClass = 'badge-running';
    if (t.status === 'Under Repair' || t.status === 'Damaged') badgeClass = 'badge-hold';
    if (t.status === 'Lost') badgeClass = 'badge-closed';

    html += `
      <tr>
        <td><strong><i class="fas fa-toolbox" style="color:var(--warning)"></i> ${escapeHtml(t.toolName)}</strong></td>
        <td><code>${escapeHtml(t.toolTag || '-')}</code></td>
        <td><span class="badge badge-info">${escapeHtml(t.category || 'General')}</span></td>
        <td><strong style="color:var(--primary)">₹${cost.toLocaleString('en-US')}</strong></td>
        <td><b><i class="fas fa-user-check"></i> ${escapeHtml(t.assignedTo || '-')}</b></td>
        <td>${escapeHtml(t.issueDate || '-')}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(t.status || 'Active')}</span></td>
        <td><small>${escapeHtml(t.remarks || t.condition || '-')}</small></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:12px 16px;border-radius:8px;border:1px solid var(--border);margin-top:14px">
        <div>
          <span>Total Tools Tracked: <b>${tools.length} Items</b></span>
        </div>
        <div style="font-size:15px">
          Total Tools Valuation: <strong style="color:var(--primary);font-size:18px">₹${totalToolValuation.toLocaleString('en-US')}</strong>
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// TAB 4: CASH FLOW & IMPREST RECONCILIATION (Company vs Own Pocket)
// -------------------------------------------------------------
function renderDrilldownImprest(inflows, expenses) {
  const container = document.getElementById('drill-imprest-container');
  if (!container) return;

  const totalAdvance = inflows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  const companySpent = expenses.filter(e => e.fundingSource === 'company').reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  const selfSpent = expenses.filter(e => e.fundingSource === 'self').reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  const netCompanyBalance = totalAdvance - companySpent;

  let balanceStatusBanner = '';
  if (netCompanyBalance >= 0) {
    balanceStatusBanner = `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:18px">
        <div style="font-size:24px;color:var(--success)"><i class="fas fa-circle-check"></i></div>
        <div>
          <h4 style="font-size:14px;font-weight:700;color:var(--success);margin-bottom:2px">Company Cash Remaining in Hand: ₹${netCompanyBalance.toLocaleString('en-US')}</h4>
          <p style="font-size:12px;color:#334155">The supervisor holds surplus company cash balance available for forthcoming site operations.</p>
        </div>
      </div>
    `;
  } else {
    balanceStatusBanner = `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:18px">
        <div style="font-size:24px;color:var(--danger)"><i class="fas fa-circle-exclamation"></i></div>
        <div>
          <h4 style="font-size:14px;font-weight:700;color:var(--danger);margin-bottom:2px">Deficit: Company Cash Overspent by ₹${Math.abs(netCompanyBalance).toLocaleString('en-US')}</h4>
          <p style="font-size:12px;color:#334155">Expenditures exceeded the total advance provided by company imprest.</p>
        </div>
      </div>
    `;
  }

  let selfReimburseBanner = '';
  if (selfSpent > 0) {
    selfReimburseBanner = `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:18px">
        <div style="font-size:24px;color:var(--warning)"><i class="fas fa-wallet"></i></div>
        <div>
          <h4 style="font-size:14px;font-weight:700;color:var(--warning);margin-bottom:2px">Reimbursement Due to Supervisor: ₹${selfSpent.toLocaleString('en-US')}</h4>
          <p style="font-size:12px;color:#334155">The supervisor funded emergency site expenses out of their own personal pocket. The company owes this reimbursement amount.</p>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Top KPI Cards -->
    <div class="kpi-row">
      <div class="kpi-card" style="border-left:4px solid var(--success)">
        <div class="kpi-icon-box" style="background:var(--success-light);color:var(--success)">
          <i class="fas fa-money-bill-transfer"></i>
        </div>
        <div class="kpi-meta">
          <h5>Total Company Advance</h5>
          <div class="kpi-num" style="color:var(--success)">₹${totalAdvance.toLocaleString('en-US')}</div>
          <div class="kpi-sub">Total cash given to supervisor</div>
        </div>
      </div>

      <div class="kpi-card" style="border-left:4px solid var(--primary)">
        <div class="kpi-icon-box" style="background:var(--primary-light);color:var(--primary)">
          <i class="fas fa-building-circle-check"></i>
        </div>
        <div class="kpi-meta">
          <h5>Spent from Company Cash</h5>
          <div class="kpi-num" style="color:var(--primary)">₹${companySpent.toLocaleString('en-US')}</div>
          <div class="kpi-sub">Paid from company imprest</div>
        </div>
      </div>

      <div class="kpi-card" style="border-left:4px solid var(--warning)">
        <div class="kpi-icon-box" style="background:var(--warning-light);color:var(--warning)">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="kpi-meta">
          <h5>Spent from Own Pocket</h5>
          <div class="kpi-num" style="color:var(--warning)">₹${selfSpent.toLocaleString('en-US')}</div>
          <div class="kpi-sub">Supervisor out-of-pocket (Due)</div>
        </div>
      </div>

      <div class="kpi-card" style="border-left:4px solid #0f172a">
        <div class="kpi-icon-box" style="background:#f1f5f9;color:#0f172a">
          <i class="fas fa-scale-balanced"></i>
        </div>
        <div class="kpi-meta">
          <h5>Net Cash in Hand</h5>
          <div class="kpi-num" style="color:${netCompanyBalance >= 0 ? 'var(--success)' : 'var(--danger)'}">
            ${netCompanyBalance >= 0 ? `₹${netCompanyBalance.toLocaleString('en-US')}` : `-₹${Math.abs(netCompanyBalance).toLocaleString('en-US')}`}
          </div>
          <div class="kpi-sub">${netCompanyBalance >= 0 ? 'Company cash balance' : 'Overspent advance'}</div>
        </div>
      </div>
    </div>

    ${balanceStatusBanner}
    ${selfReimburseBanner}

    <!-- Itemized Expenditures Table -->
    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <div class="card-title-group">
          <h3><i class="fas fa-receipt"></i> Itemized Expense Ledger (${expenses.length} Records)</h3>
          <p>Verified audit of expenditures funded from company imprest versus supervisor out-of-pocket</p>
        </div>
        <div class="card-controls">
          <button class="btn btn-secondary btn-sm" onclick="exportDrilldownExcel()">
            <i class="fas fa-file-excel"></i> Export Ledger (.xlsx)
          </button>
          <button class="btn btn-primary btn-sm" onclick="printSettlementSlip()">
            <i class="fas fa-print"></i> Print Hisaab Slip
          </button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Paid To / Purpose</th>
              <th>Voucher / Bill No</th>
              <th>Funding Source</th>
              <th>Amount (₹)</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No expenses recorded for this selection.</td></tr>' : expenses.map(e => `
              <tr>
                <td><b>${escapeHtml(e.date)}</b></td>
                <td><span class="badge badge-info">${escapeHtml(e.category)}</span></td>
                <td><b>${escapeHtml(e.paidTo || '-')}</b> <small style="display:block;color:var(--text-muted)">${escapeHtml(e.remarks || '')}</small></td>
                <td><code>${escapeHtml(e.voucherNo || '-')}</code></td>
                <td><span class="badge ${e.fundingSource === 'company' ? 'badge-company' : 'badge-self'}">${e.fundingSource === 'company' ? '🏢 Company Fund' : '👤 Own Pocket (Self)'}</span></td>
                <td><strong>₹${parseFloat(e.amount).toLocaleString('en-US')}</strong></td>
                <td><small><i class="fas fa-user-pen"></i> ${escapeHtml(e.createdBy || '-')}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Print Hisaab slip ready for desktop printing
function printSettlementSlip() {
  window.print();
}

// ==========================================================================
// MASTER TABLES (MORNING REPORTS, ALL MACHINERY, ALL TOOLS, AUDIT)
// ==========================================================================

async function renderMorningReportsTable() {
  const tbody = document.getElementById('morning-reports-tbody');
  if (!tbody) return;

  const siteFilter = document.getElementById('filter-reports-site')?.value || 'All';
  const supFilter = document.getElementById('filter-reports-sup')?.value || 'All';
  const search = (document.getElementById('filter-reports-search')?.value || '').toLowerCase().trim();

  let reports = await db.reports.toArray();

  const filtered = reports.filter(r => {
    if (siteFilter !== 'All' && r.siteName !== siteFilter) return false;
    if (supFilter !== 'All' && r.supervisorName !== supFilter) return false;
    if (search) {
      const match = (r.workDescription || '').toLowerCase().includes(search) || (r.siteName || '').toLowerCase().includes(search) || (r.supervisorName || '').toLowerCase().includes(search);
      if (!match) return false;
    }
    return true;
  });

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">No daily morning reports found matching filters.</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(r => {
    let statusBadge = 'badge-running';
    if (r.siteStatus === 'On Hold') statusBadge = 'badge-hold';
    if (r.siteStatus === 'Closed') statusBadge = 'badge-closed';

    html += `
      <tr>
        <td><b>${escapeHtml(r.date)}</b></td>
        <td><strong>${escapeHtml(r.siteName)}</strong></td>
        <td><span class="badge ${statusBadge}">${escapeHtml(r.siteStatus || 'Running')}</span></td>
        <td><b><i class="fas fa-user-tie"></i> ${escapeHtml(r.supervisorName)}</b></td>
        <td><span class="badge badge-info">${escapeHtml(r.totalManpowerCount || (r.manpower ? r.manpower.reduce((a, b) => a + b.count, 0) : 0))} Workers</span></td>
        <td><strong>₹${parseFloat(r.totalManpowerCost || 0).toLocaleString('en-US')}</strong></td>
        <td style="max-width:300px;font-size:12px">${escapeHtml(r.workDescription || '-')}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="drilldownFromReport('${escapeHtml(r.siteName)}', '${escapeHtml(r.supervisorName)}')">
            <i class="fas fa-folder-open"></i> Inspect
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function drilldownFromReport(siteName, supName) {
  selectedSiteName = siteName;
  selectedSupervisorName = supName;
  showView('drilldown');
  selectSite(siteName);
}

// Master Machinery Table
async function renderAllMachineryTable() {
  const tbody = document.getElementById('all-machinery-tbody');
  if (!tbody) return;

  const siteFilter = document.getElementById('filter-mach-site')?.value || 'All';
  const supFilter = document.getElementById('filter-mach-sup')?.value || 'All';

  let machinery = await db.machinery.toArray();

  const filtered = machinery.filter(m => {
    if (siteFilter !== 'All' && m.siteName !== siteFilter) return false;
    if (supFilter !== 'All' && m.supervisorName !== supFilter) return false;
    return true;
  });

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-muted)">No machinery records found.</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(m => {
    const isHourly = m.billingType === 'Hourly System';
    html += `
      <tr>
        <td><b>${escapeHtml(m.date || '-')}</b></td>
        <td><strong><i class="fas fa-truck-monster" style="color:var(--teal)"></i> ${escapeHtml(m.machineName)}</strong> <small>(${escapeHtml(m.regNo || '-')})</small></td>
        <td><b>${escapeHtml(m.siteName)}</b></td>
        <td>${escapeHtml(m.supervisorName)}</td>
        <td><span class="badge ${m.ownership === 'Own' ? 'badge-company' : 'badge-self'}">${escapeHtml(m.ownership)}</span></td>
        <td><span class="badge ${isHourly ? 'badge-info' : 'badge-running'}">${escapeHtml(m.billingType)}</span></td>
        <td><b>${isHourly ? `${m.hoursUsed} Hrs @ ₹${m.ratePerHour}/hr` : `${m.daysUsed} Day @ ₹${m.ratePerDay}/day`}</b></td>
        <td><b>₹${parseFloat(m.machineCost || 0).toLocaleString('en-US')}</b></td>
        <td><b>₹${parseFloat(m.fuelCost || 0).toLocaleString('en-US')}</b></td>
        <td><strong style="color:var(--primary)">₹${parseFloat(m.totalCost || 0).toLocaleString('en-US')}</strong></td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// Master Tools Table
async function renderAllToolsTable() {
  const tbody = document.getElementById('all-tools-tbody');
  if (!tbody) return;

  const siteFilter = document.getElementById('filter-tools-site')?.value || 'All';
  const search = (document.getElementById('filter-tools-search')?.value || '').toLowerCase().trim();

  let tools = await db.tools.toArray();

  const filtered = tools.filter(t => {
    if (siteFilter !== 'All' && t.siteName !== siteFilter) return false;
    if (search) {
      const match = (t.toolName || '').toLowerCase().includes(search) || (t.toolTag || '').toLowerCase().includes(search) || (t.assignedTo || '').toLowerCase().includes(search);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">No tools found.</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(t => {
    html += `
      <tr>
        <td><strong><i class="fas fa-toolbox" style="color:var(--warning)"></i> ${escapeHtml(t.toolName)}</strong></td>
        <td><code>${escapeHtml(t.toolTag || '-')}</code></td>
        <td><span class="badge badge-info">${escapeHtml(t.category || '-')}</span></td>
        <td><b>₹${parseFloat(t.costPrice || 0).toLocaleString('en-US')}</b></td>
        <td><b>${escapeHtml(t.siteName || '-')}</b></td>
        <td><b>${escapeHtml(t.assignedTo || '-')}</b></td>
        <td>${escapeHtml(t.issueDate || '-')}</td>
        <td><span class="badge ${t.status === 'Active on Site' ? 'badge-running' : 'badge-hold'}">${escapeHtml(t.status || 'Active')}</span></td>
        <td><small>${escapeHtml(t.remarks || t.condition || '-')}</small></td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// Cash Flow Table
async function renderCashFlowTables() {
  const tbody = document.getElementById('all-expenses-tbody');
  if (!tbody) return;

  const supFilter = document.getElementById('filter-exp-sup')?.value || 'All';
  const sourceFilter = document.getElementById('filter-exp-source')?.value || 'All';

  let expenses = await db.expenses.toArray();

  const filtered = expenses.filter(e => {
    if (supFilter !== 'All' && e.supervisorName !== supFilter) return false;
    if (sourceFilter !== 'All' && e.fundingSource !== sourceFilter) return false;
    return true;
  });

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">No expenses recorded.</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(e => {
    const isCompany = e.fundingSource === 'company';
    html += `
      <tr>
        <td><b>${escapeHtml(e.date)}</b></td>
        <td><strong>${escapeHtml(e.supervisorName)}</strong></td>
        <td>${escapeHtml(e.siteName)}</td>
        <td><span class="badge badge-info">${escapeHtml(e.category)}</span></td>
        <td><b>${escapeHtml(e.paidTo || '-')}</b> <small style="display:block;color:var(--text-muted)">${escapeHtml(e.remarks || '')}</small></td>
        <td><code>${escapeHtml(e.voucherNo || '-')}</code></td>
        <td><span class="badge ${isCompany ? 'badge-company' : 'badge-self'}">${isCompany ? '🏢 Company Fund' : '👤 Own Pocket'}</span></td>
        <td><strong>₹${parseFloat(e.amount).toLocaleString('en-US')}</strong></td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// Audit Trail Table
async function renderAuditTrailTable() {
  const tbody = document.getElementById('all-audit-tbody');
  if (!tbody) return;

  const search = (document.getElementById('filter-audit-search')?.value || '').toLowerCase().trim();
  let logs = await db.auditLog.toArray();

  const filtered = logs.filter(l => {
    if (search) {
      const match = (l.details || '').toLowerCase().includes(search) || (l.operator || '').toLowerCase().includes(search) || (l.action || '').toLowerCase().includes(search);
      if (!match) return false;
    }
    return true;
  });

  filtered.sort((a, b) => b.id - a.id);

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No audit logs found.</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(l => {
    html += `
      <tr>
        <td><code>${escapeHtml(l.timestamp)}</code></td>
        <td><strong><i class="fas fa-user-pen" style="color:var(--primary)"></i> ${escapeHtml(l.operator)}</strong></td>
        <td><span class="badge badge-info">${escapeHtml(l.action)}</span></td>
        <td><span class="badge badge-company">${escapeHtml(l.module)}</span></td>
        <td>${escapeHtml(l.details)}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// ==========================================================================
// MODAL DIALOGS & DATA PERSISTENCE
// ==========================================================================

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}

// Funding source toggle
function selectFundingSource(source) {
  currentFundingSource = source;
  document.getElementById('toggle-company').classList.toggle('selected', source === 'company');
  document.getElementById('toggle-self').classList.toggle('selected', source === 'self');
}

// Machine billing toggle
function selectMachineBilling(type) {
  currentMachineBillingType = type;
  document.getElementById('toggle-mach-hourly').classList.toggle('selected', type === 'hourly');
  document.getElementById('toggle-mach-daily').classList.toggle('selected', type === 'daily');

  document.getElementById('mach-hourly-inputs').style.display = type === 'hourly' ? 'grid' : 'none';
  document.getElementById('mach-daily-inputs').style.display = type === 'daily' ? 'grid' : 'none';
  recalcMachineCost();
}

function recalcMachineCost() {
  const fuel = parseFloat(document.getElementById('mach-fuel-input')?.value) || 0;
  let rent = 0;

  if (currentMachineBillingType === 'hourly') {
    const hours = parseFloat(document.getElementById('mach-hours-input')?.value) || 0;
    const rate = parseFloat(document.getElementById('mach-rate-hr-input')?.value) || 0;
    rent = hours * rate;
  } else {
    const days = parseFloat(document.getElementById('mach-days-input')?.value) || 1;
    const rate = parseFloat(document.getElementById('mach-rate-day-input')?.value) || 0;
    rent = days * rate;
  }

  const total = rent + fuel;
  const totalDisplay = document.getElementById('mach-total-preview');
  if (totalDisplay) totalDisplay.textContent = `₹${total.toLocaleString('en-US')}`;
}

// -------------------------------------------------------------
// 1. SAVE DAILY MORNING REPORT
// -------------------------------------------------------------
async function saveMorningReport() {
  const date = document.getElementById('report-date-input').value;
  const site = document.getElementById('report-site-input').value;
  const status = document.getElementById('report-status-input').value;
  const sup = document.getElementById('report-sup-input').value;
  const attendance = document.getElementById('report-attendance-input').value;
  const work = document.getElementById('report-work-input').value.trim();
  const remarks = document.getElementById('report-remarks-input').value.trim();

  // Manpower rows
  const masonCount = parseInt(document.getElementById('rep-mason-count').value) || 0;
  const masonRate = parseFloat(document.getElementById('rep-mason-rate').value) || 0;

  const labourCount = parseInt(document.getElementById('rep-labour-count').value) || 0;
  const labourRate = parseFloat(document.getElementById('rep-labour-rate').value) || 0;

  const painterCount = parseInt(document.getElementById('rep-painter-count').value) || 0;
  const painterRate = parseFloat(document.getElementById('rep-painter-rate').value) || 0;

  const contractorCount = parseInt(document.getElementById('rep-contractor-count').value) || 0;
  const contractorRate = parseFloat(document.getElementById('rep-contractor-rate').value) || 0;
  const contractorDetail = document.getElementById('rep-contractor-detail').value.trim();

  if (!date || !site || !sup) {
    showToast('Please specify Date, Work Site and Supervisor', 'error');
    return;
  }

  const manpower = [];
  if (masonCount > 0) manpower.push({ category: 'Mason', type: 'Chowk', count: masonCount, rate: masonRate, total: masonCount * masonRate });
  if (labourCount > 0) manpower.push({ category: 'Labour', type: 'Chowk', count: labourCount, rate: labourRate, total: labourCount * labourRate });
  if (painterCount > 0) manpower.push({ category: 'Painter', type: 'Contractor', count: painterCount, rate: painterRate, total: painterCount * painterRate });
  if (contractorCount > 0) manpower.push({ category: 'Other Contractor', type: 'Contractor', count: contractorCount, rate: contractorRate, details: contractorDetail || 'Specialist Contractor', total: contractorCount * contractorRate });

  const totalCost = manpower.reduce((a, b) => a + b.total, 0);
  const totalCount = manpower.reduce((a, b) => a + b.count, 0);

  await db.reports.add({
    date,
    siteName: site,
    siteStatus: status,
    supervisorName: sup,
    supervisorAttendance: attendance,
    workDescription: work || 'Daily construction & site maintenance',
    manpower,
    totalManpowerCost: totalCost,
    totalManpowerCount: totalCount,
    remarks,
    createdBy: currentOperator
  });

  // Auto-post wage expense entry
  if (totalCost > 0) {
    await db.expenses.add({
      date,
      supervisorName: sup,
      siteName: site,
      category: 'Labour Wages',
      amount: totalCost,
      fundingSource: 'company',
      paidTo: `Masons & Workers (${totalCount} Nos)`,
      voucherNo: `AUTO-REP-${Date.now().toString().slice(-4)}`,
      remarks: work || 'Daily labour payment as per morning report',
      createdBy: currentOperator
    });
  }

  await logAudit('Morning Report Recorded', 'Reports', `Recorded ${totalCount} workers (₹${totalCost.toLocaleString('en-US')}) at ${site} by ${sup}`);

  closeModal('modal-morning-report');
  showToast('Morning report successfully saved and wages posted!', 'success');
  updateDrilldownContent();
  renderMorningReportsTable();
}

// -------------------------------------------------------------
// 2. SAVE MACHINERY DEPLOYMENT
// -------------------------------------------------------------
async function saveMachineryEntry() {
  const date = document.getElementById('mach-date-input').value;
  const name = document.getElementById('mach-name-input').value.trim();
  const regNo = document.getElementById('mach-reg-input').value.trim();
  const site = document.getElementById('mach-site-input').value;
  const sup = document.getElementById('mach-sup-input').value;
  const ownership = document.getElementById('mach-owner-input').value;
  const fuel = parseFloat(document.getElementById('mach-fuel-input').value) || 0;
  const remarks = document.getElementById('mach-remarks-input').value.trim();

  let hoursUsed = 0;
  let daysUsed = 0;
  let ratePerHour = 0;
  let ratePerDay = 0;
  let machineCost = 0;

  if (currentMachineBillingType === 'hourly') {
    hoursUsed = parseFloat(document.getElementById('mach-hours-input').value) || 0;
    ratePerHour = parseFloat(document.getElementById('mach-rate-hr-input').value) || 0;
    machineCost = ownership === 'Own' ? 0 : (hoursUsed * ratePerHour);
  } else {
    daysUsed = parseFloat(document.getElementById('mach-days-input').value) || 1;
    ratePerDay = parseFloat(document.getElementById('mach-rate-day-input').value) || 0;
    machineCost = ownership === 'Own' ? 0 : (daysUsed * ratePerDay);
  }

  const totalCost = machineCost + fuel;

  if (!date || !name || !site || !sup) {
    showToast('Please fill all required machine details', 'error');
    return;
  }

  await db.machinery.add({
    date,
    machineName: name,
    regNo: regNo || 'N/A',
    siteName: site,
    supervisorName: sup,
    ownership,
    billingType: currentMachineBillingType === 'hourly' ? 'Hourly System' : 'Daily Rate',
    hoursUsed,
    daysUsed,
    ratePerHour,
    ratePerDay,
    machineCost,
    fuelCost: fuel,
    totalCost,
    paidBy: sup,
    status: 'Working',
    remarks,
    createdBy: currentOperator
  });

  // Auto-post rental and fuel expense
  if (machineCost > 0) {
    await db.expenses.add({
      date,
      supervisorName: sup,
      siteName: site,
      category: 'Machinery on Rent',
      amount: machineCost,
      fundingSource: 'company',
      paidTo: `${name} Operator / Vendor`,
      voucherNo: `MACH-${Date.now().toString().slice(-4)}`,
      remarks: `${currentMachineBillingType === 'hourly' ? `${hoursUsed} hrs @ ${ratePerHour}` : `${daysUsed} day @ ${ratePerDay}`}`,
      createdBy: currentOperator
    });
  }

  if (fuel > 0) {
    await db.expenses.add({
      date,
      supervisorName: sup,
      siteName: site,
      category: 'Machinery Fuel',
      amount: fuel,
      fundingSource: 'company',
      paidTo: 'Fuel Pump / Fuel Vendor',
      voucherNo: `PET-${Date.now().toString().slice(-4)}`,
      remarks: `Diesel/Fuel for ${name}`,
      createdBy: currentOperator
    });
  }

  await logAudit('Machine Deployed', 'Machinery', `Deployed ${name} at ${site} (${currentMachineBillingType}, Cost: ₹${totalCost})`);

  closeModal('modal-deploy-machine');
  showToast('Machinery deployment logged and expenses posted!', 'success');
  updateDrilldownContent();
  renderAllMachineryTable();
}

// -------------------------------------------------------------
// 3. SAVE TOOL ENTRY
// -------------------------------------------------------------
async function saveToolEntry() {
  const toolName = document.getElementById('tool-name-input').value.trim();
  const toolTag = document.getElementById('tool-tag-input').value.trim();
  const category = document.getElementById('tool-cat-input').value;
  const costPrice = parseFloat(document.getElementById('tool-cost-input').value) || 0;
  const site = document.getElementById('tool-site-input').value;
  const assignedTo = document.getElementById('tool-assigned-input').value.trim();
  const issueDate = document.getElementById('tool-date-input').value;
  const condition = document.getElementById('tool-condition-input').value;
  const remarks = document.getElementById('tool-remarks-input').value.trim();

  if (!toolName || !site || !assignedTo) {
    showToast('Tool Name, Site, and Assigned Person are required', 'error');
    return;
  }

  await db.tools.add({
    toolName,
    toolTag: toolTag || `TL-${Math.floor(Math.random() * 900 + 100)}`,
    category,
    costPrice,
    siteName: site,
    assignedTo,
    issueDate,
    returnDate: '',
    status: 'Active on Site',
    condition,
    remarks,
    createdBy: currentOperator
  });

  await logAudit('Tool Issued', 'Tools', `Issued tool ${toolName} (Valuation: ₹${costPrice}) to ${assignedTo} at ${site}`);

  closeModal('modal-add-tool');
  showToast('Tool registered and issued successfully!', 'success');
  updateDrilldownContent();
  renderAllToolsTable();
}

// -------------------------------------------------------------
// 4. SAVE CASH ADVANCE (INFLOW)
// -------------------------------------------------------------
async function saveCashInflow() {
  const date = document.getElementById('inflow-date-input').value;
  const sup = document.getElementById('inflow-sup-input').value;
  const site = document.getElementById('inflow-site-input').value;
  const amount = parseFloat(document.getElementById('inflow-amount-input').value) || 0;
  const mode = document.getElementById('inflow-mode-input').value;
  const voucher = document.getElementById('inflow-voucher-input').value.trim();
  const remarks = document.getElementById('inflow-remarks-input').value.trim();

  if (!date || !sup || !site || amount <= 0) {
    showToast('Please fill all required cash advance details', 'error');
    return;
  }

  await db.cashInflow.add({
    date,
    supervisorName: sup,
    siteName: site,
    amount,
    paymentMode: mode,
    voucherNo: voucher || 'ADV-' + Date.now().toString().slice(-4),
    remarks,
    createdBy: currentOperator
  });

  await logAudit('Cash Advance Given', 'Cash Flow', `Gave ₹${amount.toLocaleString('en-US')} advance to ${sup} for ${site} via ${mode}`);

  closeModal('modal-cash-inflow');
  showToast(`Cash advance of ₹${amount.toLocaleString('en-US')} recorded!`, 'success');
  updateDrilldownContent();
  renderCashFlowTables();
}

// -------------------------------------------------------------
// 5. SAVE EXPENSE (COMPANY VS OWN POCKET)
// -------------------------------------------------------------
async function saveExpenseEntry() {
  const date = document.getElementById('exp-date-input').value;
  const sup = document.getElementById('exp-sup-input').value;
  const site = document.getElementById('exp-site-input').value;
  const category = document.getElementById('exp-cat-input').value;
  const amount = parseFloat(document.getElementById('exp-amount-input').value) || 0;
  const paidTo = document.getElementById('exp-paid-to-input').value.trim();
  const voucher = document.getElementById('exp-voucher-input').value.trim();
  const remarks = document.getElementById('exp-remarks-input').value.trim();

  if (!date || !sup || !site || amount <= 0) {
    showToast('Please specify Date, Supervisor, Site, and a valid Amount', 'error');
    return;
  }

  await db.expenses.add({
    date,
    supervisorName: sup,
    siteName: site,
    category,
    amount,
    fundingSource: currentFundingSource,
    paidTo: paidTo || 'Local Vendor / Worker',
    voucherNo: voucher || 'EXP-' + Date.now().toString().slice(-4),
    remarks,
    createdBy: currentOperator
  });

  const sourceTitle = currentFundingSource === 'company' ? 'Company Fund' : 'Supervisor Own Pocket';
  await logAudit('Expense Recorded', 'Expense', `Recorded ₹${amount.toLocaleString('en-US')} (${sourceTitle}) for ${category} by ${sup}`);

  closeModal('modal-expense');
  showToast(`Expense of ₹${amount.toLocaleString('en-US')} recorded!`, 'success');
  updateDrilldownContent();
  renderCashFlowTables();
}

// -------------------------------------------------------------
// 6. OPERATOR PROFILE SWITCH
// -------------------------------------------------------------
function selectQuickOperator(name) {
  document.getElementById('operator-name-input').value = name;
}

function saveActiveOperator() {
  const name = document.getElementById('operator-name-input').value.trim();
  if (!name) {
    showToast('Please enter an operator name', 'error');
    return;
  }
  currentOperator = name;
  localStorage.setItem('siteOps_operator', name);
  updateOperatorUI();
  closeModal('modal-operator-switch');
  showToast(`Active operator set to "${name}"`, 'success');
}

// ==========================================================================
// EXCEL EXPORT (SHEETJS)
// ==========================================================================

async function exportDrilldownExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('SheetJS XLSX library not ready', 'error');
    return;
  }

  const reports = await db.reports.where('siteName').equals(selectedSiteName).toArray();
  const machinery = await db.machinery.where('siteName').equals(selectedSiteName).toArray();
  const tools = await db.tools.where('siteName').equals(selectedSiteName).toArray();
  const expenses = await db.expenses.where('siteName').equals(selectedSiteName).toArray();

  const wb = XLSX.utils.book_new();

  // Sheet 1: Manpower
  const manpowerRows = [];
  reports.forEach(r => {
    (r.manpower || []).forEach(m => {
      manpowerRows.push({
        'Date': r.date,
        'Site': r.siteName,
        'Supervisor': r.supervisorName,
        'Category': m.category,
        'Type': m.type,
        'Details': m.details || '-',
        'Headcount': m.count,
        'Rate (INR)': m.rate,
        'Total (INR)': m.total,
        'Work Description': r.workDescription || '-'
      });
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(manpowerRows), 'Manpower & Labour');

  // Sheet 2: Machinery
  const machRows = machinery.map(m => ({
    'Date': m.date,
    'Site': m.siteName,
    'Machine': m.machineName,
    'Reg No': m.regNo,
    'Ownership': m.ownership,
    'Billing Type': m.billingType,
    'Hours': m.hoursUsed,
    'Days': m.daysUsed,
    'Rental Cost (INR)': m.machineCost,
    'Fuel Cost (INR)': m.fuelCost,
    'Total Cost (INR)': m.totalCost,
    'Paid By': m.paidBy
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(machRows), 'Machinery Log');

  // Sheet 3: Tools
  const toolRows = tools.map(t => ({
    'Tool Name': t.toolName,
    'Tag No': t.toolTag,
    'Category': t.category,
    'Valuation (INR)': t.costPrice,
    'Site': t.siteName,
    'Assigned To': t.assignedTo,
    'Issue Date': t.issueDate,
    'Status': t.status
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(toolRows), 'Tools & Equipment');

  // Sheet 4: Expenses
  const expRows = expenses.map(e => ({
    'Date': e.date,
    'Supervisor': e.supervisorName,
    'Site': e.siteName,
    'Category': e.category,
    'Amount (INR)': e.amount,
    'Funding Source': e.fundingSource === 'company' ? 'Company Fund' : 'Supervisor Own Pocket',
    'Paid To': e.paidTo,
    'Voucher No': e.voucherNo,
    'Remarks': e.remarks
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expRows), 'Expenses');

  const safeSite = selectedSiteName.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Site_Ledger_${safeSite}_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast('Excel workbook exported successfully!', 'success');
}

// ==========================================================================
// TOAST NOTIFICATIONS & UTILITIES
// ==========================================================================

function showToast(message, type = 'info') {
  const tray = document.getElementById('toast-tray');
  if (!tray) return;

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check text-success' : type === 'error' ? 'fa-circle-xmark text-danger' : 'fa-circle-info'}"></i> <span>${escapeHtml(message)}</span>`;

  tray.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.25s ease-out';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

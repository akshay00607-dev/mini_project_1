const API_BASE = 'http://localhost:5002/api';
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;

const isLandingPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
const isHomePage = window.location.pathname.includes('home') || window.location.pathname === '/home';

if (isLandingPage && authToken) {
  window.location.href = 'home.html';
}

if (isHomePage && !authToken) {
  window.location.href = 'index.html';
}

if (isHomePage && !authToken) {
  window.location.href = 'index.html';
}

const serviceCategories = [
  { id: 'plumber', name: 'Plumber', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>', desc: 'Leaky pipes, tap fixes, fittings' },
  { id: 'electrician', name: 'Electrician', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>', desc: 'Wiring, fan repair, switches' },
  { id: 'cleaning', name: 'Cleaning', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>', desc: 'Deep home cleaning, mopping' },
  { id: 'carpenter', name: 'Carpenter', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9l3 3z"/><path d="M17.64 15c-1.33 0-2.61-.4-3.56-1.14L15 12l-.84-2.84c.67-1.14 1.83-1.89 3.09-1.99l1.62-.15c1.67-.16 3.19.98 3.52 2.62l.24 1.2c.2 1.09-.16 2.2-.97 2.92l-.89.79c-.74.67-1.74 1.05-2.77 1.05z"/></svg>', desc: 'Furniture repair, door fitting' },
  { id: 'ac-repair', name: 'AC Repair', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><path d="M20 16l-4-4 4-4"/><path d="M4 8l4 4-4 4"/><path d="M16 4l-4 4-4-4"/><path d="M8 20l4-4 4 4"/></svg>', desc: 'Servicing, cooling fixes' },
  { id: 'pest-control', name: 'Pest Control', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="11" r="2"/></svg>', desc: 'Safe pest & insect removal' },
  { id: 'other-works', name: 'Other Works', icon: '<svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', desc: 'Any other specialized tasks' },
];

let services = []; // Will be populated from API for search

const servicesGrid = document.getElementById('servicesGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const searchBtn = document.getElementById('searchBtn');
const noResults = document.getElementById('noResults');

const quickRequestForm = document.getElementById('quickRequestForm');
const requestMessage = document.getElementById('requestMessage');

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
const studentJobsGrid = document.getElementById('studentJobsGrid');
const jobPostForm = document.getElementById('jobPostForm');
const jobPostStatus = document.getElementById('jobPostStatus');
const workerRegisterForm = document.getElementById('workerRegisterForm');
const userRegisterForm = document.getElementById('userRegisterForm');
const workerRegisterStatus = document.getElementById('workerRegisterStatus');
const userRegisterStatus = document.getElementById('userRegisterStatus');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

const userInfoDiv = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name-display');

// Profile Dropdown Elements
const profileTrigger = document.getElementById('profileTrigger');
const profileDropdown = document.getElementById('profileDropdown');
const dropdownName = document.getElementById('dropdownName');
const dropdownRole = document.getElementById('dropdownRole');
const dropdownEmail = document.getElementById('dropdownEmail');
const menuLogoutBtn = document.getElementById('menuLogoutBtn');
const menuDashboardBtn = document.getElementById('menuDashboardBtn');
const menuMyProfileBtn = document.getElementById('menuMyProfile');
const menuEditProfileBtn = document.getElementById('menuEditProfileBtn');

// Edit Profile Modal
const editProfileModal = document.getElementById('editProfileModal');
const editProfileClose = document.getElementById('editProfileClose');
const editProfileCancelBtn = document.getElementById('editProfileCancelBtn');
const editProfileForm = document.getElementById('editProfileForm');
const editName = document.getElementById('editName');
const editPhone = document.getElementById('editPhone');
const editLocation = document.getElementById('editLocation');
const editSkills = document.getElementById('editSkills');
const editSkillsLabel = document.getElementById('editSkillsLabel');
const editProfileStatus = document.getElementById('editProfileStatus');

// Change Password Elements
const changePasswordForm = document.getElementById('changePasswordForm');
const oldPasswordInput = document.getElementById('oldPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
const changePasswordStatus = document.getElementById('changePasswordStatus');

// Change Password Toggle elements
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const changePasswordSection = document.getElementById('changePasswordSection');

const navRegister = document.getElementById('nav-register');
const workerDashboard = document.getElementById('worker-dashboard');
const quickRequestContainer = document.getElementById('quickRequestContainer');
const jobPostContainer = document.getElementById('jobPostContainer');
const workerDashboardRequests = document.getElementById('workerDashboardRequests');
const workerDashboardJobs = document.getElementById('workerDashboardJobs');
const workerDashboardBookings = document.getElementById('workerDashboardBookings');
const navWorkerDashboard = document.getElementById('nav-worker-dashboard');
const navStudentJobs = document.getElementById('nav-student-jobs');

const userDashboard = document.getElementById('user-dashboard');
const navUserDashboard = document.getElementById('nav-user-dashboard');
const userDashboardJobs = document.getElementById('userDashboardJobs');
const userDashboardBookings = document.getElementById('userDashboardBookings');

// Booking Modal
const bookingModal = document.getElementById('bookingModal');
const bookingModalClose = document.getElementById('bookingModalClose');
const bookingWorkerName = document.getElementById('bookingWorkerName');
const bookingForm = document.getElementById('bookingForm');
const bookingDetails = document.getElementById('bookingDetails');
const bookingStatus = document.getElementById('bookingStatus');
const bookingContact = document.getElementById('bookingContact');
let currentBookingWorkerId = null;

const workerListModal = document.getElementById('workerListModal');
const workerListModalClose = document.getElementById('workerListModalClose');
const workerListTitle = document.getElementById('workerListTitle');
const workerListGrid = document.getElementById('workerListGrid');

// Dashboard Stats Containers
const userStatsGrid = document.getElementById('user-stats');
const workerStatsGrid = document.getElementById('worker-stats');

if (workerListModalClose) {
  workerListModalClose.addEventListener('click', () => {
    workerListModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  });
}

if (bookingModalClose) {
  bookingModalClose.addEventListener('click', () => {
    bookingModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  });
}

// Global listener for clicking outside modal content
window.addEventListener('click', (e) => {
  if (e.target === workerListModal) {
    workerListModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
  if (e.target === bookingModal) {
    bookingModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
  if (e.target === editProfileModal) {
    closeEditProfile();
  }
});

async function loadWorkerDashboard() {
  try {
    const res = await fetch(`${API_BASE}/worker/requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      renderWorkerDashboard(data);
    }
  } catch (e) { }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle('active', show);
  overlay.classList.toggle('active', show);
  document.body.classList.toggle('modal-open', show);
}

window.toggleSidebar = toggleSidebar; // Export to global for inline scripts

function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('sidebar-close-btn');

  if (!toggleBtn || !sidebar || !overlay) {
    console.warn('Sidebar elements not found');
    return;
  }

  const toggle = (show) => {
    sidebar.classList.toggle('active', show);
    overlay.classList.toggle('active', show);
    document.body.classList.toggle('modal-open', show);
  };

  toggleBtn.addEventListener('click', () => toggle(true));
  overlay.addEventListener('click', () => toggle(false));
  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
}

function initSidebarNav() {
  const sidebarItems = document.querySelectorAll('.sidebar-nav-item');
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      const sectionId = item.getAttribute('data-section');
      let handled = false;

      // Handle Dashboard internal section switching
      if (sectionId) {
        e.preventDefault();
        handled = true;
        // Find visible dashboard (user or worker)
        const activeDashboard = currentUser?.role === 'worker' ? workerDashboard : userDashboard;
        if (activeDashboard) {
          const section = activeDashboard.querySelector(`#${sectionId}`);
          if (section) {
            // Remove active from peers in the same section
            item.parentElement.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Ensure the dashboard itself is visible
            activeDashboard.classList.remove('hidden');
            // Hide landing sections when in dashboard specific view
            const hero = document.querySelector('.hero');
            const servicesSection = document.getElementById('services');
            const studentJobsSection = document.getElementById('student-jobs');
            const contactSection = document.getElementById('contact');

            if (hero) hero.classList.add('hidden');
            if (servicesSection) servicesSection.classList.add('hidden');
            if (studentJobsSection) studentJobsSection.classList.add('hidden');
            if (contactSection) contactSection.classList.add('hidden');

            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }

      if (!handled && href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          // Ensure target and all main landing sections are visible
          const hero = document.querySelector('.hero');
          const servicesSection = document.getElementById('services');
          const studentJobsSection = document.getElementById('student-jobs');
          const contactSection = document.getElementById('contact');

          if (hero) hero.classList.remove('hidden');
          if (servicesSection) servicesSection.classList.remove('hidden');
          if (studentJobsSection) studentJobsSection.classList.remove('hidden');
          if (contactSection) contactSection.classList.remove('hidden');

          // Hide dashboards when navigating to landing sections
          const workerDashboardEl = document.getElementById('worker-dashboard');
          const userDashboardEl = document.getElementById('user-dashboard');
          if (workerDashboardEl) workerDashboardEl.classList.add('hidden');
          if (userDashboardEl) userDashboardEl.classList.add('hidden');

          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      // ALWAYS close sidebar after clicking
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  });

  // Special handlers for sidebar profile
  const sideNavProfile = document.getElementById('side-nav-profile');
  if (sideNavProfile) {
    sideNavProfile.onclick = (e) => {
      e.preventDefault();
      if (menuEditProfileBtn) menuEditProfileBtn.click();
    };
  }

  const sideNavHome = document.getElementById('side-nav-home');
  if (sideNavHome) {
    sideNavHome.onclick = (e) => {
      e.preventDefault();
      // Show landing page sections
      const hero = document.querySelector('.hero');
      const servicesSection = document.getElementById('services');
      const studentJobsSection = document.getElementById('student-jobs');
      const contactSection = document.getElementById('contact');

      if (hero) hero.classList.remove('hidden');
      if (servicesSection) servicesSection.classList.remove('hidden');
      if (studentJobsSection) studentJobsSection.classList.remove('hidden');
      if (contactSection) contactSection.classList.remove('hidden');

      // Hide dashboards
      if (typeof workerDashboard !== 'undefined' && workerDashboard) workerDashboard.classList.add('hidden');
      if (typeof userDashboard !== 'undefined' && userDashboard) userDashboard.classList.add('hidden');

      window.scrollTo({ top: 0, behavior: 'smooth' });
      toggleSidebar(false);
    };
  }
}

function logoutUser() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

function renderWorkerDashboard(data) {
  // 1. Calculate Stats
  const stats = {
    completed: data.activeJobs.filter(j => j.status === 'Completed').length + data.directBookings.filter(b => b.status === 'Completed').length,
    active: data.directBookings.filter(b => b.status === 'Accepted').length,
    pending: data.directBookings.filter(b => b.status === 'Requested' || b.status === 'Pending').length,
    requestedJobs: data.activeJobs.filter(j => j.status === 'Requested').length,
    acceptedJobs: data.activeJobs.filter(j => j.status === 'Accepted').length
  };

  if (workerStatsGrid) {
    workerStatsGrid.innerHTML = `
      <div class="stat-card">
        <span class="stat-card__label">Jobs Completed</span>
        <span class="stat-card__value">${stats.completed}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Active Services</span>
        <span class="stat-card__value">${stats.active}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Pending Requests</span>
        <span class="stat-card__value">${stats.pending}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Part-Time Applied</span>
        <span class="stat-card__value">${stats.requestedJobs}</span>
      </div>
    `;
  }

  if (workerDashboardRequests) {
    workerDashboardRequests.innerHTML = '';
    data.quickRequests.forEach(qr => {
      const div = document.createElement('div');
      div.className = 'service-card';
      div.innerHTML = `
        <div class="service-card__header">
          <h3>${qr.name}</h3>
          <span class="badge badge--pending">Quick Request</span>
        </div>
        <p style="margin-top:10px;">${qr.details}</p>
        <div class="service-card__footer">
          <div class="price">Contact: <span>${qr.contact}</span></div>
        </div>`;
      workerDashboardRequests.appendChild(div);
    });
    if (data.quickRequests.length === 0) workerDashboardRequests.innerHTML = '<p class="no-results" style="display:block;">No matching quick requests found.</p>';
  }

  if (workerDashboardJobs) {
    workerDashboardJobs.innerHTML = '';
    data.activeJobs.forEach(job => workerDashboardJobs.appendChild(createJobCard(job, true)));
    if (data.activeJobs.length === 0) workerDashboardJobs.innerHTML = '<p class="no-results" style="display:block;">No active jobs found.</p>';
  }

  if (workerDashboardBookings) {
    workerDashboardBookings.innerHTML = '';
    data.directBookings.forEach(b => {
      const div = document.createElement('div');
      div.className = 'service-card';
      const statusClass = getStatusBadgeClass(b.status);

      div.innerHTML = `
        <div class="service-card__header">
          <h3>${b.userName}</h3>
          <span class="badge ${statusClass}">${b.status}</span>
        </div>
        <div class="service-card__info" style="margin-top:10px;">
          <div class="info-row"><span>📍</span> ${b.location || 'Not specified'}</div>
          <div class="info-row"><span>📅</span> ${new Date(b.createdAt).toLocaleDateString()}</div>
        </div>
        <p style="margin-top:10px; font-size:0.85rem; color:var(--text-soft)">${b.details}</p>
        <div class="service-card__footer" style="margin-top:1rem;">
          ${b.status === 'Requested' ? `
            <div style="display:flex; gap:0.5rem; width:100%;">
              <button class="accept-booking-btn btn-primary" data-id="${b._id || b.id}" style="flex:1; font-size:0.75rem; padding:0.4rem;">Accept</button>
              <button class="decline-booking-btn btn-secondary" data-id="${b._id || b.id}" style="flex:1; font-size:0.75rem; padding:0.4rem;">Decline</button>
            </div>
          ` : b.status === 'Accepted' ? `
            <button class="complete-booking-btn btn-primary" data-id="${b._id || b.id}" style="width:100%;">Mark as Completed</button>
          ` : ''}
        </div>`;
      workerDashboardBookings.appendChild(div);
    });
    if (data.directBookings.length === 0) workerDashboardBookings.innerHTML = '<p class="no-results" style="display:block;">No direct bookings yet.</p>';

    // Bind Worker Booking Actions
    document.querySelectorAll('.accept-booking-btn').forEach(btn => btn.onclick = () => updateBookingStatus(btn.dataset.id, 'Accepted'));
    document.querySelectorAll('.decline-booking-btn').forEach(btn => btn.onclick = () => updateBookingStatus(btn.dataset.id, 'Cancelled'));
    document.querySelectorAll('.complete-booking-btn').forEach(btn => btn.onclick = () => updateBookingStatus(btn.dataset.id, 'Completed'));
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    const res = await fetch(`${API_BASE}/worker/booking/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) loadWorkerDashboard();
  } catch (e) { console.error(e); }
}

async function loadUserDashboard() {
  try {
    const res = await fetch(`${API_BASE}/user/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      renderUserDashboard(data);
    }
  } catch (e) { }
}

function renderUserDashboard(data) {
  // 1. Calculate Stats
  const stats = {
    totalRequests: data.directBookings.length,
    activeBookings: data.directBookings.filter(b => b.status === 'Accepted').length,
    completed: data.directBookings.filter(b => b.status === 'Completed').length,
    postedJobs: data.postedJobs.length
  };

  if (userStatsGrid) {
    userStatsGrid.innerHTML = `
      <div class="stat-card">
        <span class="stat-card__label">Total Requests</span>
        <span class="stat-card__value">${stats.totalRequests}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Active Bookings</span>
        <span class="stat-card__value">${stats.activeBookings}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Jobs Completed</span>
        <span class="stat-card__value">${stats.completed}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Posted Jobs</span>
        <span class="stat-card__value">${stats.postedJobs}</span>
      </div>
    `;
  }

  if (userDashboardJobs) {
    userDashboardJobs.innerHTML = '';
    data.postedJobs.forEach(job => {
      const card = document.createElement('article');
      card.className = 'service-card';
      const statusClass = job.status === 'Open' ? 'badge--accepted' : 'badge--pending';

      let appsHtml = '';
      job.applications.forEach(app => {
        const actualWorkerId = typeof app.workerId === 'object' ? app.workerId._id : app.workerId;
        appsHtml += `
          <div style="background: rgba(255, 255, 255, 0.03); padding:0.8rem; margin-top:0.8rem; border-radius:12px; border: 1px solid var(--border-subtle);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:var(--text);">${app.workerName}</strong>
              <span class="badge ${app.status === 'Accepted' ? 'badge--completed' : 'badge--pending'}">${app.status}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-soft); margin-top:0.3rem;">${app.workerEmail}</div>
            ${app.status === 'Requested' ? `
              <button class="accept-worker-btn btn-primary" data-jobid="${job._id || job.id}" data-workerid="${actualWorkerId}" style="margin-top:0.8rem; padding:0.4rem 0.8rem; font-size:0.8rem; width:100%;">Accept Worker</button>
            ` : ''}
          </div>`;
      });

      card.innerHTML = `
        <div class="service-card__header">
          <h3>${job.title}</h3>
          <span class="badge ${statusClass}">${job.status}</span>
        </div>
        <div class="service-card__meta">
          <span>📍 ${job.location}</span><span>•</span><span>💰 ${job.pay}</span>
        </div>
        <p style="margin-top:0.8rem; font-size:0.85rem; color:var(--text-soft)">${job.description}</p>
        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <h4 style="font-size:0.9rem; margin-bottom:0.5rem;">Applicants (${job.applications.length})</h4>
          ${job.applications.length === 0 ? '<p style="color:var(--text-soft); font-size:0.8rem;">No applications yet.</p>' : appsHtml}
        </div>
      `;
      userDashboardJobs.appendChild(card);
    });
    if (data.postedJobs.length === 0) userDashboardJobs.innerHTML = '<p class="no-results" style="display:block;">You have not posted any jobs yet.</p>';
  }

  if (userDashboardBookings) {
    userDashboardBookings.innerHTML = '';
    data.directBookings.forEach(b => {
      const div = document.createElement('div');
      div.className = 'service-card';
      const statusClass = getStatusBadgeClass(b.status);

      div.innerHTML = `
        <div class="service-card__header">
          <h3>${b.workerName}</h3>
          <span class="badge ${statusClass}">${b.status}</span>
        </div>
        <div class="service-card__info" style="margin-top:10px;">
          <div class="info-row"><span>🛠️</span> Service Requested</div>
          <div class="info-row"><span>📅</span> ${new Date(b.createdAt).toLocaleDateString()}</div>
        </div>
        <p style="margin-top:10px; font-size:0.85rem; color:var(--text-soft)">${b.details}</p>
        <div class="service-card__footer" style="margin-top:1rem;">
           <div class="price">Service Date: <span>${new Date(b.createdAt).toLocaleDateString()}</span></div>
        </div>`;
      userDashboardBookings.appendChild(div);
    });
    if (data.directBookings.length === 0) userDashboardBookings.innerHTML = '<p class="no-results" style="display:block;">You have no direct bookings.</p>';
  }

  // Bind Accept buttons
  document.querySelectorAll('.accept-worker-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const jobId = e.target.getAttribute('data-jobid');
      const workerId = e.target.getAttribute('data-workerid');
      try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}/select-worker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ workerId })
        });
        if (res.ok) {
          loadUserDashboard();
        } else {
          alert('Failed to accept worker.');
        }
      } catch (err) {
        alert('Network error.');
      }
    });
  });
}

function updateAuthUI() {
  console.log('updateAuthUI called, currentUser:', currentUser);
  const userInfoDiv = document.getElementById('user-info');
  const userNameDisplay = document.getElementById('user-name-display');
  const navRegister = document.getElementById('nav-register');
  const workerDashboard = document.getElementById('worker-dashboard');
  const userDashboard = document.getElementById('user-dashboard');
  const quickRequestContainer = document.getElementById('quickRequestContainer');
  const jobPostContainer = document.getElementById('jobPostContainer');

  // Sidebar Visibility Selectors
  const sidebarUserLinks = document.getElementById('sidebar-user-links');
  const sidebarWorkerLinks = document.getElementById('sidebar-worker-links');

  if (currentUser) {
    if (userInfoDiv) userInfoDiv.classList.remove('hidden');
    if (userNameDisplay) userNameDisplay.textContent = currentUser.name.split(' ')[0];
    if (dropdownName) dropdownName.textContent = currentUser.name;
    if (dropdownRole) dropdownRole.textContent = currentUser.role;
    if (dropdownEmail) dropdownEmail.textContent = currentUser.email || 'No email provided';
    if (navRegister) navRegister.classList.add('hidden');

    if (currentUser.role === 'worker') {
      if (workerDashboard) workerDashboard.classList.remove('hidden');
      if (userDashboard) userDashboard.classList.add('hidden');
      if (quickRequestContainer) quickRequestContainer.classList.add('hidden');
      if (jobPostContainer) jobPostContainer.classList.add('hidden');
      if (sidebarWorkerLinks) sidebarWorkerLinks.classList.remove('hidden');
      if (sidebarUserLinks) sidebarUserLinks.classList.add('hidden');
      loadWorkerDashboard();
    } else if (currentUser.role === 'user') {
      if (workerDashboard) workerDashboard.classList.add('hidden');
      if (userDashboard) userDashboard.classList.remove('hidden');
      if (quickRequestContainer) quickRequestContainer.classList.remove('hidden');
      if (jobPostContainer) jobPostContainer.classList.remove('hidden');
      if (sidebarWorkerLinks) sidebarWorkerLinks.classList.add('hidden');
      if (sidebarUserLinks) sidebarUserLinks.classList.remove('hidden');
      loadUserDashboard();
    }
  } else {
    if (userInfoDiv) userInfoDiv.classList.add('hidden');
    if (navRegister) navRegister.classList.remove('hidden');
    if (workerDashboard) workerDashboard.classList.add('hidden');
    if (userDashboard) userDashboard.classList.add('hidden');
    if (sidebarUserLinks) sidebarUserLinks.classList.add('hidden');
    if (sidebarWorkerLinks) sidebarWorkerLinks.classList.add('hidden');
  }

  // ALWAYS ensure landing sections are visible unless we're in a specific dashboard view that should hide them
  // For now, let's keep them visible by default on Home
  if (isHomePage) {
    const hero = document.querySelector('.hero');
    const servicesSection = document.getElementById('services');
    const studentJobsSection = document.getElementById('student-jobs');
    const contactSection = document.getElementById('contact');

    if (hero) hero.classList.remove('hidden');
    if (servicesSection) servicesSection.classList.remove('hidden');
    if (studentJobsSection) studentJobsSection.classList.remove('hidden');
    if (contactSection) contactSection.classList.remove('hidden');
  }

  initSidebarNav();
  if (isHomePage) {
    renderServices(services);
  }
}

// Remove redundant logout listeners

// Ensure Profile Dropdown Toggles On Click
if (profileTrigger) {
  profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents immediate close from document click
    userInfoDiv.classList.toggle('open');
    profileDropdown.classList.toggle('hidden');
  });
}

// Close Dropdown when clicking naturally outside
document.addEventListener('click', (e) => {
  if (profileDropdown && userInfoDiv) {
    if (!userInfoDiv.contains(e.target) && !profileDropdown.classList.contains('hidden')) {
      userInfoDiv.classList.remove('open');
      profileDropdown.classList.add('hidden');
    }
  }
});

// Dropdown Dashboard Routing 
if (menuDashboardBtn) {
  menuDashboardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    userInfoDiv.classList.remove('open');
    profileDropdown.classList.add('hidden');
    if (currentUser && currentUser.role === 'worker') {
      window.location.hash = '#worker-dashboard';
    } else {
      window.location.hash = '#user-dashboard';
    }
  });
}

// Open Edit Profile Modal
if (menuEditProfileBtn) {
  menuEditProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    userInfoDiv.classList.remove('open');
    profileDropdown.classList.add('hidden');

    // Inject existing user data safely
    if (currentUser) {
      editName.value = currentUser.name || '';
      editPhone.value = currentUser.phone || currentUser.email || '';
      editLocation.value = currentUser.location || '';

      if (currentUser.role === 'worker') {
        editSkillsLabel.classList.remove('hidden');
        editSkills.value = currentUser.service || '';
      } else {
        editSkillsLabel.classList.add('hidden');
      }
    }
    editProfileStatus.textContent = '';
    editProfileModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    if (changePasswordSection) changePasswordSection.classList.add('hidden'); // Reset to hidden
  });
}

// Close Edit Profile logic
function closeEditProfile() {
  editProfileModal.classList.add('hidden');
  editProfileStatus.textContent = '';
  document.body.classList.remove('modal-open');
}

if (editProfileClose) editProfileClose.addEventListener('click', closeEditProfile);
if (editProfileCancelBtn) editProfileCancelBtn.addEventListener('click', closeEditProfile);

// Update Profile and Change Password logic
if (editProfileForm) {
  editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      editProfileStatus.textContent = 'Updating...';
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: editName.value.trim(),
          phone: editPhone.value.trim(),
          location: editLocation.value.trim(),
          skills: editSkills.value.trim()
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      // Update local state and UI
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      updateAuthUI();

      editProfileStatus.textContent = 'Profile updated successfully!';
      editProfileStatus.className = 'form-message form-message--success';

      setTimeout(() => {
        closeEditProfile();
      }, 1000);
    } catch (err) {
      editProfileStatus.textContent = err.message;
      editProfileStatus.className = 'form-message form-message--error';
    }
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
      changePasswordStatus.textContent = 'New passwords do not match.';
      changePasswordStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      changePasswordStatus.textContent = 'Changing password...';
      const res = await fetch(`${API_BASE}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');

      changePasswordStatus.textContent = 'Password changed successfully!';
      changePasswordStatus.className = 'form-message form-message--success';
      changePasswordForm.reset();

      setTimeout(() => {
        closeEditProfile();
      }, 1500);
    } catch (err) {
      changePasswordStatus.textContent = err.message;
      changePasswordStatus.className = 'form-message form-message--error';
    }
  });
}

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    if (changePasswordSection) {
      changePasswordSection.classList.toggle('hidden');
    }
  });
}

let studentJobs = [
  {
    id: 'j1',
    title: 'Evening Café Helper',
    type: 'Hospitality',
    hours: '5pm – 9pm · 4 days/week',
    pay: '₹120–₹150 / hour',
    location: 'City Center',
    description: 'Assist with serving, billing and basic clean-up at a small café.',
    date: '2026-03-01',
    status: 'Open',
  },
  {
    id: 'j2',
    title: 'Weekend Maths Tutor',
    type: 'Tutoring',
    hours: 'Sat–Sun · 2–3 hours/day',
    pay: '₹400–₹600 / session',
    location: 'Nearby apartments',
    description: 'Teach school students (classes 6–10) basic maths concepts.',
    date: '2026-03-02',
    status: 'Open',
  },
  {
    id: 'j3',
    title: 'Delivery Partner (Cycle/Two-wheeler)',
    type: 'Delivery',
    hours: 'Flexible slots · Evening peak',
    pay: '₹8,000–₹12,000 / month (approx.)',
    location: 'Multiple local areas',
    description: 'Pick up and deliver food/groceries in your local area.',
    date: '2026-03-03',
    status: 'Open',
  },
  {
    id: 'j4',
    title: 'Data Entry – Remote',
    type: 'Remote',
    hours: '10–15 hours/week · flexible',
    pay: '₹8,000–₹10,000 / month (project)',
    location: 'Work from home',
    description: 'Enter and clean up spreadsheet data for a small business.',
    date: '2026-03-04',
    status: 'Open',
  },
  {
    id: 'j5',
    title: 'Event Volunteer',
    type: 'Events',
    hours: 'Weekend events · per event',
    pay: '₹600–₹900 / day',
    location: 'Colleges & local halls',
    description:
      'Help with registration, guiding guests and basic coordination in events.',
    date: '2026-03-05',
    status: 'Open',
  },
];

function createCategoryCard(cat, index = 0) {
  const card = document.createElement('article');
  card.className = 'service-card category-card';
  card.style.cursor = 'pointer';
  card.style.animationDelay = `${index * 0.1}s`;

  card.innerHTML = `
    <div class="service-icon-wrapper">
      ${cat.icon}
    </div>
    <div class="service-card__header">
      <h3>${cat.name}</h3>
    </div>
    <p>${cat.desc}</p>
    <div class="service-card__footer" style="margin-top: 1rem;">
      <button type="button" style="width: 100%;">View Workers</button>
    </div>
  `;

  card.addEventListener('click', () => {
    openWorkerListModal(cat);
  });

  return card;
}

function openWorkerListModal(category) {
  console.log('Opening worker list for:', category.name);
  if (!workerListModal || !workerListTitle || !workerListGrid) {
    console.error('Modal elements missing');
    return;
  }

  workerListTitle.textContent = `Verified ${category.name}s`;
  workerListGrid.innerHTML = '<div class="loading-spinner"></div><p>Finding local professionals...</p>';
  workerListModal.classList.remove('hidden');
  document.body.classList.add('modal-open');

  fetch(`${API_BASE}/services?category=${category.id === 'other-works' ? 'other works' : category.id}`)
    .then(res => res.json())
    .then(workers => {
      console.log(`Found ${workers.length} workers for ${category.name}`);
      renderWorkerListInModal(workers);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      workerListGrid.innerHTML = '<p class="error-text">Failed to load workers.</p>';
    });
}

function renderWorkerListInModal(workers) {
  if (!workerListGrid) return;
  workerListGrid.innerHTML = '';

  if (!workers || workers.length === 0) {
    workerListGrid.innerHTML = '<p class="no-results" style="display:block;">No professionals found in this category yet.</p>';
    return;
  }

  workers.forEach((w, index) => {
    const card = createWorkerCard(w, index);
    if (card) workerListGrid.appendChild(card);
  });
}

function createWorkerCard(worker, index = 0) {
  if (!worker) return null;
  const card = document.createElement('article');
  card.className = 'worker-card';
  card.style.animationDelay = `${index * 0.1}s`;

  // Defensive checks
  const name = worker.name || 'Anonymous Professional';
  const skills = worker.skills || 'General service';
  const location = worker.location || 'Local area';
  const availability = worker.availability || 'Contact for timing';
  const serviceType = worker.serviceType || 'Provider';

  card.innerHTML = `
    <div class="worker-card__profile">
      <div class="worker-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="worker-identity">
        <h3>${name}</h3>
        <span class="badge badge--accepted" style="font-size: 0.6rem;">${serviceType}</span>
      </div>
    </div>
    
    <div class="worker-card__info">
      <div class="info-row">
        <span>📍</span>
        <span>${location}</span>
      </div>
      <div class="info-row">
        <span>🕒</span>
        <span>${availability}</span>
      </div>
      <div class="info-row skills-preview" style="color:var(--primary); font-weight:500;">
        <span>${skills}</span>
      </div>
    </div>

    <div class="worker-card__footer" style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
      <button type="button" class="book-worker-btn btn-primary" style="width:100%;">Book Now</button>
    </div>
  `;

  const btn = card.querySelector('.book-worker-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!currentUser || currentUser.role !== 'user') {
      alert('Please log in as a user to book a worker.');
      return;
    }
    currentBookingWorkerId = worker._id || worker.id;
    bookingWorkerName.textContent = `Worker: ${name}`;
    bookingModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    bookingDetails.value = '';
    bookingContact.value = '';
    bookingStatus.textContent = '';
    bookingDetails.focus();
  });

  return card;
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentBookingWorkerId) return;

    const userContact = bookingContact.value.trim();
    const details = bookingDetails.value.trim();

    if (!userContact || !details) {
      bookingStatus.textContent = 'Please provide contact and details.';
      bookingStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/worker/${currentBookingWorkerId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ details, userContact })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        bookingStatus.textContent = 'Booking requested successfully!';
        bookingStatus.className = 'form-message form-message--success';
        setTimeout(() => {
          bookingModal.classList.add('hidden');
          workerListModal.classList.add('hidden');
          document.body.classList.remove('modal-open');
          loadUserDashboard();
        }, 1500);
      } else {
        bookingStatus.textContent = data.message || 'Error creating booking';
        bookingStatus.className = 'form-message form-message--error';
      }
    } catch (err) {
      bookingStatus.textContent = 'Network error.';
      bookingStatus.className = 'form-message form-message--error';
    }
  });
}

function renderServices(list) {
  if (!servicesGrid) {
    console.warn('servicesGrid not found');
    return;
  }
  servicesGrid.innerHTML = '';
  if (!serviceCategories || serviceCategories.length === 0) {
    console.warn('No service categories defined');
    return;
  }
  serviceCategories.forEach((cat, index) => {
    const card = createCategoryCard(cat, index);
    if (card) servicesGrid.appendChild(card);
  });
  console.log('Services rendered:', serviceCategories.length);
}

async function applyFilters() {
  const text = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const categoryId = categoryFilter ? categoryFilter.value : 'all';

  if (categoryId && categoryId !== 'all') {
    const cat = serviceCategories.find(c => c.id === categoryId);
    if (cat) {
      openWorkerListModal(cat);
    }
    return;
  }

  if (text) {
    workerListTitle.textContent = `Results for "${text}"`;
    workerListGrid.innerHTML = 'Searching...';
    workerListModal.classList.remove('hidden');
    document.body.classList.add('modal-open');

    try {
      const res = await fetch(`${API_BASE}/services`);
      if (res.ok) {
        const allWorkers = await res.json();
        const filtered = allWorkers.filter(w =>
          w.name.toLowerCase().includes(text) ||
          w.skills.toLowerCase().includes(text) ||
          w.location.toLowerCase().includes(text) ||
          w.serviceType.toLowerCase().includes(text)
        );
        renderWorkerListInModal(filtered);
      }
    } catch (e) {
      workerListGrid.innerHTML = 'Error searching.';
    }
    return;
  }

  renderServices();
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    applyFilters();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    applyFilters();
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    applyFilters();
  });
}

if (quickRequestForm) {
  quickRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reqName').value.trim();
    const contact = document.getElementById('reqContact').value.trim();
    const service = document.getElementById('reqService').value.trim();
    const details = document.getElementById('reqDetails').value.trim();

    if (!name || !contact || !service || !details) {
      requestMessage.textContent = 'Please fill in all fields.';
      requestMessage.className = 'form-message form-message--error';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/quick-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, service, details }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send request');
      }

      requestMessage.textContent = 'Request sent successfully.';
      requestMessage.className = 'form-message form-message--success';
      quickRequestForm.reset();
    } catch (err) {
      requestMessage.textContent = err.message;
      requestMessage.className = 'form-message form-message--error';
    }

    setTimeout(() => {
      requestMessage.textContent = '';
      requestMessage.className = 'form-message';
    }, 4000);
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      contactStatus.textContent = 'Please fill in all fields.';
      contactStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      contactStatus.textContent = 'Message sent to support team.';
      contactStatus.className = 'form-message form-message--success';
      contactForm.reset();
    } catch (err) {
      contactStatus.textContent = err.message;
      contactStatus.className = 'form-message form-message--error';
    }

    setTimeout(() => {
      contactStatus.textContent = '';
      contactStatus.className = 'form-message';
    }, 4000);
  });
}

const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

renderServices(services);

function getStatusBadgeClass(status) {
  const s = status.toLowerCase();
  if (s === 'pending' || s === 'requested' || s === 'open') return 'badge--pending';
  if (s === 'accepted' || s === 'active') return 'badge--accepted';
  if (s === 'completed' || s === 'closed') return 'badge--completed';
  if (s === 'cancelled' || s === 'rejected') return 'badge--cancelled';
  return 'badge--pending';
}

function createJobCard(job, hideRequestBtn = false) {
  const card = document.createElement('article');
  card.className = 'service-card';
  const statusClass = getStatusBadgeClass(job.status);

  card.innerHTML = `
    <div class="service-card__header">
      <h3>${job.title}</h3>
      <span class="badge ${statusClass}">${job.status}</span>
    </div>
    <div class="service-card__info" style="margin-top:0.8rem;">
      <div class="info-row"><span>📍</span> ${job.location}</div>
      <div class="info-row"><span>💰</span> ${job.pay}</div>
      ${job.date ? `<div class="info-row"><span>📅</span> ${new Date(job.date).toLocaleDateString()}</div>` : ''}
    </div>
    <p style="margin-top:0.8rem; font-size:0.85rem; color:var(--text-soft)">${job.description}</p>
    <div class="service-card__footer" style="margin-top:1.5rem; border-top: 1px solid var(--border-subtle); padding-top:1rem;">
      <div class="price" style="font-size:0.8rem; color:var(--text-soft)">
        ${job.hours}
      </div>
      ${hideRequestBtn ? '' : `
      <button type="button" class="job-request-btn btn-primary" style="padding:0.4rem 1rem; font-size:0.85rem;">
        Apply Now
      </button>`}
    </div>
  `;

  if (!hideRequestBtn) {
    const btn = card.querySelector('.job-request-btn');
    const statusEl = card.querySelector('.job-status-text');

    btn.addEventListener('click', async () => {
      if (!currentUser) {
        alert('Please login to apply for this job.');
        return;
      }

      if (job.status === 'Requested' || btn.textContent === 'Requested') return;

      try {
        console.log('Applying for job ID:', job.id);
        btn.disabled = true;
        btn.textContent = 'Requesting...';
        const res = await fetch(`${API_BASE}/jobs/${job.id}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          }
        });

        if (res.ok) {
          btn.textContent = 'Requested';
          if (statusEl) statusEl.textContent = 'Requested';
          if (currentUser.role === 'worker') loadWorkerDashboard();
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.message || 'Error applying for job. Check if already applied.');
          btn.disabled = false;
          btn.textContent = 'Request';
        }
      } catch (e) {
        alert('Network error.');
        btn.disabled = false;
        btn.textContent = 'Request';
      }
    });
  }

  return card;
}

function renderStudentJobs(list) {
  if (!studentJobsGrid) return;
  studentJobsGrid.innerHTML = '';
  list.forEach((job) => studentJobsGrid.appendChild(createJobCard(job)));
}

renderStudentJobs(studentJobs);

if (jobPostForm) {
  jobPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('jobTitle').value.trim();
    const location = document.getElementById('jobLocation').value.trim();
    const pay = document.getElementById('jobPay').value.trim();
    const date = document.getElementById('jobDate').value.trim();
    const hours = document.getElementById('jobHours').value.trim();
    const description = document.getElementById('jobDescription').value.trim();

    if (!title || !location || !pay || !date || !hours || !description) {
      jobPostStatus.textContent = 'Please fill in all fields.';
      jobPostStatus.className = 'form-message form-message--error';
      return;
    }

    if (!authToken || !currentUser || currentUser.role !== 'user') {
      jobPostStatus.textContent = 'Please log in as a user to post a job.';
      jobPostStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title,
          location,
          pay,
          hours,
          description,
          date,
          category: 'part-time',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to post job');
      }

      const job = await res.json();
      const converted = {
        id: job.id,
        title: job.title,
        type: job.category || 'Custom',
        hours: job.hours,
        pay: job.pay,
        location: job.location,
        description: job.description,
        date: job.date,
        status: job.status,
      };

      studentJobs.unshift(converted);
      renderStudentJobs(studentJobs);

      jobPostStatus.textContent = 'Job posted successfully.';
      jobPostStatus.className = 'form-message form-message--success';
      jobPostForm.reset();

      setTimeout(() => {
        jobPostStatus.textContent = '';
        jobPostStatus.className = 'form-message';
      }, 4000);
    } catch (err) {
      jobPostStatus.textContent = err.message;
      jobPostStatus.className = 'form-message form-message--error';
    }
  });
}

if (workerRegisterForm) {
  workerRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('workerName').value.trim();
    const userId = document.getElementById('workerUserId').value.trim();
    const contact = document.getElementById('workerContact').value.trim();
    const service = document.getElementById('workerService').value.trim();
    const location = document.getElementById('workerLocation').value.trim();
    const skills = document.getElementById('workerSkills').value.trim();
    const availability = document.getElementById('workerAvailability').value.trim();
    const password = document.getElementById('workerPassword').value.trim();

    if (!name || !userId || !contact || !service || !location || !skills || !availability || !password) {
      workerRegisterStatus.textContent = 'Please fill in all fields.';
      workerRegisterStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      workerRegisterStatus.textContent = 'Registering...';
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          email: contact,
          phone: contact,
          password,
          role: 'worker',
          location,
          skills,
          availability,
          serviceType: service.toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register worker');
      }

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      workerRegisterStatus.textContent = 'Success! Redirecting...';
      workerRegisterStatus.className = 'form-message form-message--success';
      workerRegisterForm.reset();
      window.location.href = 'home.html';
    } catch (err) {
      console.error('Registration Error:', err);
      workerRegisterStatus.textContent = err.message;
      workerRegisterStatus.className = 'form-message form-message--error';
    }
  });
}

if (userRegisterForm) {
  userRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('userName').value.trim();
    const userId = document.getElementById('userUserId').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const address = document.getElementById('userAddress').value.trim();
    const password = document.getElementById('userPassword').value.trim();

    if (!name || !userId || !email || !phone || !address || !password) {
      userRegisterStatus.textContent = 'Please fill in all fields.';
      userRegisterStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      userRegisterStatus.textContent = 'Registering...';
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          email,
          phone,
          password,
          role: 'user',
          location: address,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register user');
      }

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      userRegisterStatus.textContent = 'Success! Redirecting...';
      userRegisterStatus.className = 'form-message form-message--success';
      userRegisterForm.reset();
      window.location.href = 'home.html';
    } catch (err) {
      console.error('Registration Error:', err);
      userRegisterStatus.textContent = err.message;
      userRegisterStatus.className = 'form-message form-message--error';
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!identifier || !password) {
      loginStatus.textContent = 'Please enter your Email/User ID and password.';
      loginStatus.className = 'form-message form-message--error';
      return;
    }

    try {
      loginStatus.textContent = 'Logging in...';
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      loginStatus.textContent = 'Success! Redirecting...';
      loginStatus.className = 'form-message form-message--success';
      loginForm.reset();
      window.location.href = 'home.html';
    } catch (err) {
      console.error('Login Error:', err);
      loginStatus.textContent = err.message;
      loginStatus.className = 'form-message form-message--error';
    }
  });
}

async function loadFromBackend() {
  console.log('Fetching backend data...');
  try {
    // Load jobs
    const jobsRes = await fetch(`${API_BASE}/jobs`).catch(() => null);
    if (jobsRes && jobsRes.ok) {
      const jobsData = await jobsRes.json();
      studentJobs = jobsData.map((job) => ({
        id: job._id || job.id,
        title: job.title,
        type: job.category || 'Custom',
        hours: job.hours,
        pay: job.pay,
        location: job.location,
        description: job.description,
        status: job.status,
        applications: job.applications || []
      }));
      renderStudentJobs(studentJobs);
    }

    // Load workers as additional services
    const servicesRes = await fetch(`${API_BASE}/services`).catch(() => null);
    if (servicesRes && servicesRes.ok) {
      const workers = await servicesRes.json();
      const mapped = workers.map((w, index) => ({
        id: `api-${index}`,
        name: w.name,
        type: (w.serviceType || 'service').toLowerCase(),
        area: w.location || 'Local area',
        description: w.skills || 'Local service provider',
        priceFrom: 499,
        rating: 4.6,
        jobs: 'New',
        availability: w.availability || 'Available',
      }));
      // Only append if not already there to avoid duplicates on refresh
      const existingNames = new Set(services.map(s => s.name));
      mapped.forEach(m => {
        if (!existingNames.has(m.name)) services.push(m);
      });
      renderServices(services);
    }
  } catch (err) {
    console.error('Error loading backend data:', err);
  }
}

// Initializations
document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  loadFromBackend();

  const showLoginBtnNav = document.getElementById('showLoginBtnNav');
  if (showLoginBtnNav) {
    showLoginBtnNav.addEventListener('click', () => {
      const showLoginBtn = document.getElementById('showLoginBtn');
      if (showLoginBtn) showLoginBtn.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (isHomePage) {
    updateAuthUI();
  } else {
    // Landing pages or other pages
    renderServices(services);
    renderStudentJobs(studentJobs);
  }
});

document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('.logout-btn');
  if (logoutBtn) {
    e.preventDefault();
    logoutUser();
  }
});

// Password Visibility Toggle
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '🙈';
      } else {
        input.type = 'password';
        this.textContent = '👁️';
      }
    }
  });
});
renderServices(services);
initSidebarToggle();

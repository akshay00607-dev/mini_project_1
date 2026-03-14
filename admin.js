const API_BASE = 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');
let currentUser = JSON.parse(localStorage.getItem('adminUser'));

const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginStatus = document.getElementById('loginStatus');

const userInfoDiv = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtn = document.getElementById('logoutBtn');

const contactFeed = document.getElementById('contactFeed');
const quickRequestsFeed = document.getElementById('quickRequestsFeed');
const usersFeed = document.getElementById('usersFeed');
const jobsFeed = document.getElementById('jobsFeed');

function updateUI() {
    if (authToken && currentUser && currentUser.role === 'admin') {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        userInfoDiv.classList.remove('hidden');
        userNameDisplay.textContent = `Admin: ${currentUser.name}`;
        loadDashboardData();
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        userInfoDiv.classList.add('hidden');
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        updateUI();
    });
}

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            if (data.user.role !== 'admin') {
                throw new Error('Access denied. Admins only.');
            }

            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminUser', JSON.stringify(currentUser));

            loginStatus.textContent = '';
            updateUI();
        } catch (err) {
            loginStatus.textContent = err.message;
            loginStatus.className = 'form-message form-message--error';
        }
    });
}

async function loadDashboardData() {
    const headers = { Authorization: `Bearer ${authToken}` };

    try {
        // 1. Fetch Contact / Help Messages
        const contactRes = await fetch(`${API_BASE}/admin/contact`, { headers });
        if (contactRes.ok) {
            const contacts = await contactRes.json();
            renderFeed(contactFeed, contacts, (c) => `
        <span class="badge">Help Ticket</span>
        <strong>${c.name} (${c.email})</strong>
        <p style="margin:4px 0;">${c.message}</p>
        <small style="color:var(--text-soft)">${new Date(c.createdAt).toLocaleString()}</small>
      `, '/admin/contact');
        }

        // 2. Fetch Quick Requests
        const qrRes = await fetch(`${API_BASE}/admin/quick-requests`, { headers });
        if (qrRes.ok) {
            const qrs = await qrRes.json();
            renderFeed(quickRequestsFeed, qrs, (q) => `
        <span class="badge">${q.service}</span>
        <strong>${q.name} - ${q.contact}</strong>
        <p style="margin:4px 0;">${q.details}</p>
        <small style="color:var(--text-soft)">${new Date(q.createdAt).toLocaleString()}</small>
      `, '/admin/quick-requests');
        }

        // 3. Fetch Users
        const usersRes = await fetch(`${API_BASE}/admin/users`, { headers });
        if (usersRes.ok) {
            const usersList = await usersRes.json();
            const filteredUsers = usersList.filter(u => u.role !== 'admin'); // hide self
            renderFeed(usersFeed, filteredUsers, (u) => `
        <span class="badge">${u.role}</span>
        <strong>${u.name}</strong> 
        <span style="color:var(--text-soft)">(${u.email})</span>
        ${u.serviceType ? `<p style="margin:4px 0; font-size:0.8rem;">Type: ${u.serviceType}</p>` : ''}
      `, '/admin/users');
        }

        // 4. Fetch Jobs
        const jobsRes = await fetch(`${API_BASE}/admin/jobs`, { headers });
        if (jobsRes.ok) {
            const jobsList = await jobsRes.json();
            renderFeed(jobsFeed, jobsList, (j) => `
        <span class="badge">${j.status}</span>
        <strong>${j.title}</strong>
        <p style="margin:4px 0;">${j.location} • ${j.pay}</p>
        <small style="color:var(--text-soft)">Apps: ${j.applications.length}</small>
      `, '/admin/jobs');
        }
    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

function renderFeed(element, dataList, templateFn, deleteUrlPrefix) {
    element.innerHTML = '';
    if (dataList.length === 0) {
        element.innerHTML = '<p style="color:var(--text-soft)">No data available.</p>';
        return;
    }

    dataList.reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'data-item';
        div.style.position = 'relative';
        div.innerHTML = templateFn(item);

        // Add Delete Button 
        const delBtn = document.createElement('button');
        delBtn.innerText = 'Delete';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '10px';
        delBtn.style.right = '10px';
        delBtn.style.padding = '0.2rem 0.5rem';
        delBtn.style.fontSize = '0.7rem';
        delBtn.style.background = '#ef4444';
        delBtn.style.color = 'white';
        delBtn.style.border = 'none';
        delBtn.style.borderRadius = '4px';
        delBtn.style.cursor = 'pointer';

        delBtn.addEventListener('click', async () => {
            // TEST MODE: Bypassed window.confirm() so browser agent can click it cleanly
            try {
                const res = await fetch(`${API_BASE}${deleteUrlPrefix}/${item._id || item.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                if (res.ok) {
                    loadDashboardData(); // Refresh UI after delete
                } else {
                    const d = await res.json().catch(() => ({}));
                    alert(d.message || 'Error deleting record.');
                }
            } catch (e) {
                console.error(e);
                alert('Network error while deleting.');
            }
        });

        div.appendChild(delBtn);
        element.appendChild(div);
    });
}

// Init
updateUI();

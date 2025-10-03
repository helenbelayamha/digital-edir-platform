// User data
let userData = {
    name: "Alemayehu Mekonnen",
    email: "alemayehu@example.com",
    phone: "+251 91 234 5678",
    bio: "Community member interested in supporting local Edir groups.",
    hasGroups: false,
    myGroups: [],
    pendingGroups: [],
    settings: {
        darkMode: false,
        emailNotifications: true,
        pushNotifications: true,
        smsAlerts: false,
        language: "en",
        currency: "ETB",
        privacy: "members"
    },
    memberSince: "2023"
};

// Available groups to join
const availableGroups = [
    {
        id: "family-edir",
        name: "Family Support Edir",
        type: "family",
        description: "Monthly contributions for family support and emergency assistance.",
        members: 25,
        created: "2022",
        monthlyContribution: 150,
        location: "Addis Ababa",
        privacy: "public"
    },
    {
        id: "neighborhood-edir",
        name: "Bole Community Edir",
        type: "neighborhood",
        description: "Community support group for residents of Bole area.",
        members: 48,
        created: "2021",
        monthlyContribution: 100,
        location: "Bole, Addis Ababa",
        privacy: "public"
    },
    {
        id: "religious-edir",
        name: "St. Mary Church Edir",
        type: "religious",
        description: "Support group for members of St. Mary Church.",
        members: 120,
        created: "2020",
        monthlyContribution: 50,
        location: "Megenagna, Addis Ababa",
        privacy: "public"
    },
    {
        id: "cultural-edir",
        name: "Gurage Cultural Edir",
        type: "cultural",
        description: "Cultural preservation and support for Gurage community.",
        members: 75,
        created: "2019",
        monthlyContribution: 75,
        location: "Addis Ababa",
        privacy: "public"
    },
    {
        id: "professional-edir",
        name: "Tech Professionals Edir",
        type: "professional",
        description: "Support group for technology professionals in Addis Ababa.",
        members: 15,
        created: "2023",
        monthlyContribution: 200,
        location: "Addis Ababa",
        privacy: "private"
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    checkUserView();
    renderDiscoverGroups();
    setupEventListeners();
});

// Load user data from localStorage or use default
function loadUserData() {
    const savedData = localStorage.getItem('edirUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
    
    // Update UI with user data
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('profileUserName').textContent = userData.name;
    document.getElementById('profileUserEmail').textContent = userData.email;
    document.getElementById('profileUserPhone').textContent = userData.phone;
    document.getElementById('profileFullName').value = userData.name;
    document.getElementById('profileEmail').value = userData.email;
    document.getElementById('profilePhone').value = userData.phone;
    document.getElementById('profileBio').value = userData.bio;
    document.getElementById('profileMemberSince').textContent = userData.memberSince;
    
    // Apply settings
    applySettings();
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('edirUserData', JSON.stringify(userData));
}

// Apply user settings to the UI
function applySettings() {
    const settings = userData.settings;
    
    // Dark mode
    document.getElementById('darkModeToggle').checked = settings.darkMode;
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Other settings
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('pushNotifications').checked = settings.pushNotifications;
    document.getElementById('smsAlerts').checked = settings.smsAlerts;
    document.getElementById('languageSelect').value = settings.language;
    document.getElementById('currencySelect').value = settings.currency;
    document.getElementById('privacySelect').value = settings.privacy;
}

// Check which view to show (discovery or dashboard)
function checkUserView() {
    const discoveryPage = document.getElementById('discovery-page');
    const dashboardPage = document.getElementById('dashboard-page');
    
    if (userData.hasGroups && userData.myGroups.length > 0) {
        // User has groups, show dashboard
        showPage('dashboard');
        renderDashboard();
    } else {
        // User has no groups, show discovery
        showPage('discovery');
    }
}

// Show a specific page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Close dropdown if open
    document.getElementById('userDropdown').classList.remove('show');
    
    // If showing dashboard, make sure it's properly rendered
    if (pageId === 'dashboard' && userData.myGroups.length > 0) {
        renderDashboard();
    }
    
    // If showing profile, render profile data
    if (pageId === 'profile') {
        renderProfile();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('change', function() {
        userData.settings.darkMode = this.checked;
        applySettings();
        saveUserData();
    });
    
    // Other setting toggles
    document.getElementById('emailNotifications').addEventListener('change', function() {
        userData.settings.emailNotifications = this.checked;
        saveUserData();
    });
    
    document.getElementById('pushNotifications').addEventListener('change', function() {
        userData.settings.pushNotifications = this.checked;
        saveUserData();
    });
    
    document.getElementById('smsAlerts').addEventListener('change', function() {
        userData.settings.smsAlerts = this.checked;
        saveUserData();
    });
    
    // Select elements
    document.getElementById('languageSelect').addEventListener('change', function() {
        userData.settings.language = this.value;
        saveUserData();
    });
    
    document.getElementById('currencySelect').addEventListener('change', function() {
        userData.settings.currency = this.value;
        saveUserData();
    });
    
    document.getElementById('privacySelect').addEventListener('change', function() {
        userData.settings.privacy = this.value;
        saveUserData();
    });

    // Search functionality
    document.getElementById('groupSearch').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchGroups();
        }
    });
}

// Search groups
function searchGroups() {
    const searchTerm = document.getElementById('groupSearch').value.toLowerCase();
    renderDiscoverGroups(searchTerm);
}

// Render discoverable groups
function renderDiscoverGroups(searchTerm = '') {
    const container = document.getElementById('discoverGroupsGrid');
    container.innerHTML = '';
    
    // Filter out groups user is already in or pending
    const userGroupIds = [
        ...userData.myGroups.map(g => g.id),
        ...userData.pendingGroups.map(g => g.id)
    ];
    
    let availableToJoin = availableGroups.filter(group => !userGroupIds.includes(group.id));
    
    // Apply search filter
    if (searchTerm) {
        availableToJoin = availableToJoin.filter(group => 
            group.name.toLowerCase().includes(searchTerm) ||
            group.type.toLowerCase().includes(searchTerm) ||
            group.location.toLowerCase().includes(searchTerm) ||
            group.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (availableToJoin.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-compass"></i>
                <h3>No Groups Found</h3>
                <p>${searchTerm ? 'No groups match your search criteria.' : 'You\'ve already joined all available Edir groups. Check back later for new groups or create your own.'}</p>
            </div>
        `;
        return;
    }
    
    // Add available groups
    availableToJoin.forEach(group => {
        container.innerHTML += createDiscoverGroupCard(group);
    });
}

// Create a discover group card HTML
function createDiscoverGroupCard(group) {
    return `
        <div class="group-card">
            <div class="group-header">
                <div class="group-icon">
                    <i class="fas ${getGroupIcon(group.type)}"></i>
                </div>
                <div class="group-info">
                    <h3>${group.name}</h3>
                    <span class="group-type">${getGroupTypeName(group.type)} Edir</span>
                    <div class="group-meta">
                        <span><i class="fas fa-users"></i> ${group.members} members</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${group.location}</span>
                    </div>
                </div>
            </div>
            <p>${group.description}</p>
            <div class="group-stats">
                <div class="stat">
                    <div class="stat-value">ETB ${group.monthlyContribution}</div>
                    <div class="stat-label">Monthly</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${group.privacy === 'public' ? 'Public' : 'Private'}</div>
                    <div class="stat-label">Access</div>
                </div>
            </div>
            <button class="join-btn" onclick="joinGroup('${group.id}')">
                ${group.privacy === 'public' ? 'Join Group' : 'Request to Join'}
            </button>
        </div>
    `;
}

// Get group icon based on type
function getGroupIcon(type) {
    const icons = {
        family: 'fa-home',
        neighborhood: 'fa-building',
        professional: 'fa-briefcase',
        religious: 'fa-church',
        cultural: 'fa-globe-africa'
    };
    return icons[type] || 'fa-users';
}

// Get group type display name
function getGroupTypeName(type) {
    const names = {
        family: 'Family',
        neighborhood: 'Neighborhood',
        professional: 'Professional',
        religious: 'Religious',
        cultural: 'Cultural'
    };
    return names[type] || 'Community';
}

// Join a group
function joinGroup(groupId) {
    const group = availableGroups.find(g => g.id === groupId);
    if (group) {
        if (group.privacy === 'public') {
            // Add to user's groups immediately for public groups
            userData.myGroups.push({
                ...group,
                role: 'member',
                paidThisMonth: 0,
                totalMembers: group.members + 1,
                upcomingEvents: 0
            });
            userData.hasGroups = true;
        } else {
            // Add to pending for private groups
            userData.pendingGroups.push({
                ...group,
                role: 'pending'
            });
        }
        
        saveUserData();
        checkUserView();
        renderDiscoverGroups();
        
        if (group.privacy === 'public') {
            alert(`You have successfully joined ${group.name}!`);
        } else {
            alert(`Join request sent to ${group.name}. The admin will review your request.`);
        }
    }
}

// Render the dashboard
function renderDashboard() {
    renderSidebarGroups();
    if (userData.myGroups.length > 0) {
        switchGroup(userData.myGroups[0].id);
    }
    setupTabListeners();
}

// Render groups in sidebar
function renderSidebarGroups() {
    const container = document.getElementById('sidebarGroupsList');
    container.innerHTML = '';
    
    // Add user's groups
    userData.myGroups.forEach(group => {
        container.innerHTML += createSidebarGroupItem(group);
    });
    
    // Add pending groups
    userData.pendingGroups.forEach(group => {
        container.innerHTML += createSidebarGroupItem(group);
    });
}

// Create sidebar group item
function createSidebarGroupItem(group) {
    const isPending = group.role === 'pending';
    return `
        <div class="group-item ${!isPending ? 'active' : ''}" data-group="${group.id}" onclick="switchGroup('${group.id}')">
            <div class="group-item-icon">
                <i class="fas ${getGroupIcon(group.type)}"></i>
            </div>
            <div class="group-item-info">
                <h3>${group.name}</h3>
                <p>${group.members} members • ${isPending ? 'Pending' : (group.role === 'admin' ? 'You: Admin' : 'You: Member')}</p>
            </div>
        </div>
    `;
}

// Switch between groups in dashboard
function switchGroup(groupId) {
    // Update active group item
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-group="${groupId}"]`).classList.add('active');
    
    // Find the group data
    let group = userData.myGroups.find(g => g.id === groupId);
    if (!group) {
        group = userData.pendingGroups.find(g => g.id === groupId);
    }
    
    if (group) {
        // Update header with group info
        document.getElementById('activeGroupName').textContent = group.name;
        document.getElementById('activeGroupDescription').textContent = group.description;
        
        // Update user role display
        document.getElementById('userRole').textContent = group.role === 'admin' ? 'Admin' : 
            group.role === 'pending' ? 'Pending' : 'Member';
        
        // Show/hide admin features
        if (group.role === 'admin') {
            document.body.classList.add('is-admin');
        } else {
            document.body.classList.remove('is-admin');
        }
        
        // Update overview stats
        document.getElementById('totalMembers').textContent = group.totalMembers || group.members;
        document.getElementById('collectedAmount').textContent = `ETB ${(group.monthlyContribution * (group.paidThisMonth || 0)).toLocaleString()}`;
        document.getElementById('pendingPayments').textContent = (group.totalMembers || group.members) - (group.paidThisMonth || 0);
        document.getElementById('upcomingEvents').textContent = group.upcomingEvents || 0;
        
        // Render group-specific content
        renderGroupMembers(group);
        renderGroupContributions(group);
        renderGroupEvents(group);
        renderGroupRequests(group);
        renderRecentActivity(group);
        renderUpcomingEvents(group);
    }
}

// Setup tab listeners for dashboard
function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Show active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Render group members
function renderGroupMembers(group) {
    const container = document.getElementById('membersGrid');
    const countElement = document.getElementById('membersCount');
    
    // For demo, create sample members
    const members = [
        { id: 1, name: "Alemayehu Mekonnen", role: group.role === 'admin' ? "Admin" : "Member", status: "paid", lastPayment: "Oct 5, 2023" },
        { id: 2, name: "Eyerusalem Tesfaye", role: "Member", status: "paid", lastPayment: "Oct 7, 2023" },
        { id: 3, name: "Kaleb Mesfin", role: "Member", status: "paid", lastPayment: "Oct 8, 2023" },
        { id: 4, name: "Meron Abebe", role: "Member", status: "pending", lastPayment: "Sep 28, 2023" },
        { id: 5, name: "Dawit Haile", role: "Member", status: "paid", lastPayment: "Oct 10, 2023" }
    ];
    
    countElement.textContent = members.length;
    container.innerHTML = '';
    
    members.forEach(member => {
        const initials = member.name.split(' ').map(n => n[0]).join('');
        container.innerHTML += `
            <div class="member-card">
                <div class="member-avatar">${initials}</div>
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>${member.role} • Last payment: ${member.lastPayment}</p>
                    <span class="member-status status-${member.status}">
                        ${member.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                </div>
                ${group.role === 'admin' ? `
                    <div class="member-actions">
                        <button class="action-btn" title="Message">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="action-btn" title="Remove">
                            <i class="fas fa-user-times"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
}

// Render group contributions
function renderGroupContributions(group) {
    const container = document.getElementById('contributionsTable');
    
    // For demo, create sample contributions
    const contributions = [
        { member: "Alemayehu Mekonnen", amount: "ETB 150", date: "Oct 5, 2023", status: "Paid" },
        { member: "Eyerusalem Tesfaye", amount: "ETB 150", date: "Oct 7, 2023", status: "Paid" },
        { member: "Kaleb Mesfin", amount: "ETB 150", date: "Oct 8, 2023", status: "Paid" },
        { member: "Meron Abebe", amount: "ETB 150", date: "Pending", status: "Pending" },
        { member: "Dawit Haile", amount: "ETB 150", date: "Oct 10, 2023", status: "Paid" }
    ];
    
    container.innerHTML = '';
    
    contributions.forEach(contribution => {
        container.innerHTML += `
            <div class="table-row">
                <div>${contribution.member}</div>
                <div>${contribution.amount}</div>
                <div>${contribution.date}</div>
                <div>
                    <span class="member-status ${contribution.status === 'Paid' ? 'status-paid' : 'status-pending'}">
                        ${contribution.status}
                    </span>
                </div>
            </div>
        `;
    });
}

// Render group events
function renderGroupEvents(group) {
    const container = document.getElementById('eventsList');
    
    // For demo, create sample events
    const events = [
        { title: "Monthly Meeting", date: "15", month: "OCT", location: "Community Center", description: "Monthly gathering to discuss Edir matters" },
        { title: "Community Dinner", date: "10", month: "NOV", location: "Cultural Restaurant", description: "Social event for all members" },
        { title: "Financial Review", date: "25", month: "OCT", location: "Online", description: "Review of this month's finances" }
    ];
    
    container.innerHTML = '';
    
    events.forEach(event => {
        container.innerHTML += `
            <div class="event-card">
                <div class="event-date">
                    <div class="day">${event.date}</div>
                    <div class="month">${event.month}</div>
                </div>
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                    <div class="event-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                        <span><i class="fas fa-clock"></i> 2:00 PM</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Render group requests (admin only)
function renderGroupRequests(group) {
    const container = document.getElementById('requestsList');
    const countElement = document.getElementById('requestsCount');
    
    if (group.role !== 'admin') {
        container.innerHTML = '<p>Only admins can view join requests.</p>';
        return;
    }
    
    // For demo, create sample requests
    const requests = [
        { id: 1, name: "Sara Mohammed", reason: "Family friend recommended" },
        { id: 2, name: "Yonas Tadesse", reason: "Interested in community support" },
        { id: 3, name: "Hana Girma", reason: "Looking to join a family Edir" }
    ];
    
    countElement.textContent = requests.length;
    container.innerHTML = '';
    
    requests.forEach(request => {
        const initials = request.name.split(' ').map(n => n[0]).join('');
        container.innerHTML += `
            <div class="request-card">
                <div class="request-info">
                    <div class="request-avatar">${initials}</div>
                    <div class="request-details">
                        <h4>${request.name}</h4>
                        <p>${request.reason}</p>
                    </div>
                </div>
                <div class="request-actions">
                    <button class="approve-btn" onclick="approveRequest(${request.id})">Approve</button>
                    <button class="deny-btn" onclick="denyRequest(${request.id})">Deny</button>
                </div>
            </div>
        `;
    });
}

// Render recent activity
function renderRecentActivity(group) {
    const container = document.getElementById('recentActivityList');
    
    // For demo, create sample activity
    const activities = [
        { icon: "fa-user-check", text: "Kaleb Mesfin joined the Edir", time: "2 hours ago" },
        { icon: "fa-money-check-alt", text: "Eyerusalem Tesfaye paid monthly contribution", time: "5 hours ago" },
        { icon: "fa-calendar-plus", text: "Monthly meeting scheduled for next Saturday", time: "1 day ago" }
    ];
    
    container.innerHTML = '';
    
    activities.forEach(activity => {
        container.innerHTML += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div>
                    <p style="font-weight: 500;">${activity.text}</p>
                    <small style="color: var(--gray);">${activity.time}</small>
                </div>
            </div>
        `;
    });
}

// Render upcoming events for overview
function renderUpcomingEvents(group) {
    const container = document.getElementById('upcomingEventsList');
    
    // For demo, create sample events
    const events = [
        { title: "Monthly Meeting", location: "Community center", date: "Sat, Oct 15, 2023" },
        { title: "Community Dinner", location: "Cultural restaurant", date: "Fri, Nov 10, 2023" }
    ];
    
    container.innerHTML = '';
    
    events.forEach(event => {
        container.innerHTML += `
            <div style="margin-bottom: 15px;">
                <h4 style="font-weight: 600; margin-bottom: 5px;">${event.title}</h4>
                <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 5px;">${event.location}</p>
                <small style="color: var(--primary);"><i class="far fa-calendar"></i> ${event.date}</small>
            </div>
        `;
    });
}

// Render profile page
function renderProfile() {
    // Update profile stats
    document.getElementById('profileGroupsCount').textContent = userData.myGroups.length;
    document.getElementById('profileAdminCount').textContent = userData.myGroups.filter(g => g.role === 'admin').length;
    
    // Render user's groups in profile
    const container = document.getElementById('profileGroupsGrid');
    container.innerHTML = '';
    
    if (userData.myGroups.length === 0 && userData.pendingGroups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Edir Groups Yet</h3>
                <p>You haven't joined any Edir groups yet. Join an existing group or create your own to get started.</p>
                <button class="btn btn-primary" onclick="showPage('discovery')">Discover Groups</button>
            </div>
        `;
        return;
    }
    
    // Add user's groups
    userData.myGroups.forEach(group => {
        container.innerHTML += createProfileGroupCard(group);
    });
    
    // Add pending groups
    userData.pendingGroups.forEach(group => {
        container.innerHTML += createProfileGroupCard(group);
    });
}

// Create profile group card
function createProfileGroupCard(group) {
    const isPending = group.role === 'pending';
    return `
        <div class="group-card">
            <div class="group-header">
                <div class="group-icon">
                    <i class="fas ${getGroupIcon(group.type)}"></i>
                </div>
                <div class="group-info">
                    <h3>${group.name}</h3>
                    <span class="group-type">${getGroupTypeName(group.type)} Edir</span>
                    <div class="group-meta">
                        <span><i class="fas fa-users"></i> ${group.members} members</span>
                        <span><i class="fas fa-calendar"></i> Created ${group.created}</span>
                    </div>
                </div>
                <div class="role-badge ${group.role === 'admin' ? 'role-admin' : group.role === 'pending' ? 'role-pending' : 'role-member'}">
                    ${group.role === 'admin' ? 'Admin' : group.role === 'pending' ? 'Pending' : 'Member'}
                </div>
            </div>
            <p>${group.description}</p>
            ${!isPending ? `
                <div class="group-stats">
                    <div class="stat">
                        <div class="stat-value">ETB ${group.monthlyContribution}</div>
                        <div class="stat-label">Monthly</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${group.privacy === 'public' ? 'Public' : 'Private'}</div>
                        <div class="stat-label">Access</div>
                    </div>
                </div>
                <button class="join-btn" onclick="switchToGroup('${group.id}')">Open Group</button>
            ` : `
                <button class="join-btn" disabled>Request Pending</button>
            `}
        </div>
    `;
}

// Switch to a specific group from profile
function switchToGroup(groupId) {
    showPage('dashboard');
    setTimeout(() => {
        switchGroup(groupId);
    }, 100);
}

// Modal Functions
function openCreateModal() {
    document.getElementById('createModal').style.display = 'flex';
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
}

// Create New Group
function createNewGroup() {
    const groupName = document.getElementById('groupName').value;
    const groupType = document.getElementById('groupType').value;
    
    if (!groupName || !groupType) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newGroup = {
        id: groupName.toLowerCase().replace(/\s+/g, '-'),
        name: groupName,
        type: groupType,
        description: document.getElementById('groupDescription').value || 'A new Edir group for community support.',
        members: 1,
        created: new Date().getFullYear().toString(),
        monthlyContribution: parseInt(document.getElementById('monthlyContribution').value) || 100,
        paidThisMonth: 1,
        totalMembers: 1,
        upcomingEvents: 0,
        role: 'admin',
        location: 'Addis Ababa',
        privacy: document.getElementById('groupPrivacy').value
    };
    
    // Add to user's groups
    userData.myGroups.push(newGroup);
    userData.hasGroups = true;
    saveUserData();
    checkUserView();
    closeCreateModal();
    
    // Reset form
    document.getElementById('groupName').value = '';
    document.getElementById('groupType').value = '';
    document.getElementById('groupDescription').value = '';
    document.getElementById('monthlyContribution').value = '100';
    document.getElementById('groupPrivacy').value = 'public';
    
    alert(`New Edir "${groupName}" created successfully! You are the admin of this group.`);
}

// Save profile changes
function saveProfile() {
    userData.name = document.getElementById('profileFullName').value;
    userData.email = document.getElementById('profileEmail').value;
    userData.phone = document.getElementById('profilePhone').value;
    userData.bio = document.getElementById('profileBio').value;
    
    // Update UI
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('profileUserName').textContent = userData.name;
    document.getElementById('profileUserEmail').textContent = userData.email;
    document.getElementById('profileUserPhone').textContent = userData.phone;
    saveUserData();
    
    alert('Profile updated successfully!');
    showPage('discovery');
}

// Save settings
function saveSettings() {
    // Settings are already saved via event listeners
    alert('Settings saved successfully!');
    showPage('discovery');
}

// Request actions
function approveRequest(requestId) {
    alert(`Request ${requestId} approved!`);
    // In a real app, update the UI and send to backend
}

function denyRequest(requestId) {
    if (confirm('Are you sure you want to deny this request?')) {
        alert(`Request ${requestId} denied.`);
        // In a real app, update the UI and send to backend
    }
}

// Toggle user dropdown
function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const avatar = document.querySelector('.user-avatar');
    
    if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real app, this would clear session and redirect to login
        alert('Logged out successfully!');
        window.location.href = 'login.html';
    }
}

// Delete account function
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            // In a real app, this would send a delete request to the server
            alert('Account deletion requested. You will be logged out.');
            logout();
        }
    }
}

// Placeholder functions for other modals
function openInviteModal() {
    alert('Invite Member modal would open here');
}

function openNotifyModal() {
    alert('Notify Members modal would open here');
}

function openEventModal() {
    alert('Create Event modal would open here');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createModal');
    if (event.target === modal) {
        closeCreateModal();
    }
}
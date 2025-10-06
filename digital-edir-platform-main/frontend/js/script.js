// API Configuration
const API_BASE = 'http://localhost:5000/api';

// Global user data
let currentUser = null;
let currentToken = null;
let userGroups = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentToken = token;
        currentUser = JSON.parse(user);
        loadUserData();
        checkUserView();
        setupEventListeners();
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

// Load user data from backend
async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                currentUser = data.data;
                localStorage.setItem('user', JSON.stringify(currentUser));
                updateUIWithUserData();
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading user data', 'error');
    }
}

// Update UI with real user data
function updateUIWithUserData() {
    // Update user name everywhere
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('profileUserName').textContent = currentUser.fullName;
    document.getElementById('profileUserEmail').textContent = currentUser.email;
    document.getElementById('profileUserPhone').textContent = currentUser.phone;
    
    // Update profile form
    document.getElementById('profileFullName').value = currentUser.fullName;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone;
    document.getElementById('profileBio').value = currentUser.bio || '';
    document.getElementById('profileMemberSince').textContent = new Date(currentUser.memberSince).getFullYear();
}

// Check which view to show (discovery or dashboard)
async function checkUserView() {
    try {
        const response = await fetch(`${API_BASE}/groups/my-groups`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                userGroups = data.data;
                showPage('dashboard');
                renderDashboard();
            } else {
                showPage('discovery');
                renderDiscoverGroups();
            }
        }
    } catch (error) {
        console.error('Error checking user view:', error);
        showPage('discovery');
        renderDiscoverGroups();
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
    
    // Load page-specific data
    if (pageId === 'discovery') {
        renderDiscoverGroups();
    } else if (pageId === 'dashboard') {
        renderDashboard();
    } else if (pageId === 'profile') {
        renderProfile();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('groupSearch').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchGroups();
        }
    });
    
    // Dashboard tab listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// Render discoverable groups from backend
async function renderDiscoverGroups(searchTerm = '') {
    const container = document.getElementById('discoverGroupsGrid');
    container.innerHTML = '<div class="loading">Loading groups...</div>';
    
    try {
        let url = `${API_BASE}/groups`;
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            container.innerHTML = '';
            
            if (data.success && data.data.groups.length > 0) {
                data.data.groups.forEach(group => {
                    // Don't show groups user is already a member of
                    const isMember = userGroups.some(userGroup => 
                        userGroup._id === group._id
                    );
                    
                    if (!isMember) {
                        container.innerHTML += createDiscoverGroupCard(group);
                    }
                });
                
                // If all groups are filtered out, show message
                if (container.innerHTML === '') {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-compass"></i>
                            <h3>No Groups Found</h3>
                            <p>${searchTerm ? 'No groups match your search criteria.' : 'You are already a member of all available groups.'}</p>
                        </div>
                    `;
                }
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-compass"></i>
                        <h3>No Groups Available</h3>
                        <p>There are no Edir groups available to join at the moment.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading groups:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Groups</h3>
                <p>Unable to load groups. Please try again later.</p>
            </div>
        `;
    }
}

// Create discover group card HTML
function createDiscoverGroupCard(group) {
    const isPrivate = group.privacy === 'private';
    
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
                        <span><i class="fas fa-users"></i> ${group.totalMembers} members</span>
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
                    <div class="stat-value">${isPrivate ? 'Private' : 'Public'}</div>
                    <div class="stat-label">Access</div>
                </div>
            </div>
            <button class="join-btn" onclick="joinGroup('${group._id}')">
                ${isPrivate ? 'Request to Join' : 'Join Group'}
            </button>
        </div>
    `;
}

// Join a group
async function joinGroup(groupId) {
    try {
        const response = await fetch(`${API_BASE}/groups/${groupId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'I would like to join this Edir group'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            // Refresh the groups display
            renderDiscoverGroups();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error joining group:', error);
        showToast('Error joining group', 'error');
    }
}

// Search groups
function searchGroups() {
    const searchTerm = document.getElementById('groupSearch').value;
    renderDiscoverGroups(searchTerm);
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

// Render the dashboard
async function renderDashboard() {
    await loadUserGroups();
    renderSidebarGroups();
    
    if (userGroups.length > 0) {
        switchGroup(userGroups[0]._id);
    } else {
        // No groups, show empty state
        document.getElementById('dashboard-page').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Groups Yet</h3>
                <p>You haven't joined any Edir groups yet. Join an existing group or create your own to get started.</p>
                <button class="btn btn-primary" onclick="showPage('discovery')">Discover Groups</button>
            </div>
        `;
    }
}

// Load user's groups from backend
async function loadUserGroups() {
    try {
        const response = await fetch(`${API_BASE}/groups/my-groups`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                userGroups = data.data;
            }
        }
    } catch (error) {
        console.error('Error loading user groups:', error);
        showToast('Error loading your groups', 'error');
    }
}

// Render groups in sidebar
function renderSidebarGroups() {
    const container = document.getElementById('sidebarGroupsList');
    container.innerHTML = '';
    
    userGroups.forEach(group => {
        const userMember = group.members.find(member => 
            member.user._id === currentUser._id
        );
        
        container.innerHTML += `
            <div class="group-item" data-group="${group._id}" onclick="switchGroup('${group._id}')">
                <div class="group-item-icon">
                    <i class="fas ${getGroupIcon(group.type)}"></i>
                </div>
                <div class="group-item-info">
                    <h3>${group.name}</h3>
                    <p>${group.totalMembers} members • You: ${userMember?.role === 'admin' ? 'Admin' : 'Member'}</p>
                </div>
            </div>
        `;
    });
}

// Switch between groups in dashboard
async function switchGroup(groupId) {
    // Update active group item
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-group="${groupId}"]`).classList.add('active');
    
    try {
        const response = await fetch(`${API_BASE}/groups/${groupId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const group = data.data;
                updateGroupDashboard(group);
            }
        }
    } catch (error) {
        console.error('Error loading group details:', error);
        showToast('Error loading group details', 'error');
    }
}

// Update dashboard with group data
function updateGroupDashboard(group) {
    // Update header with group info
    document.getElementById('activeGroupName').textContent = group.name;
    document.getElementById('activeGroupDescription').textContent = group.description;
    
    // Find current user's role in this group
    const userMember = group.members.find(member => 
        member.user._id === currentUser._id
    );
    
    // Update user role display
    document.getElementById('userRole').textContent = userMember?.role === 'admin' ? 'Admin' : 'Member';
    
    // Show/hide admin features
    if (userMember?.role === 'admin') {
        document.body.classList.add('is-admin');
    } else {
        document.body.classList.remove('is-admin');
    }
    
    // Update overview stats
    document.getElementById('totalMembers').textContent = group.totalMembers;
    
    // For demo - in real app, you'd calculate these from contributions
    const paidCount = Math.floor(group.totalMembers * 0.8); // 80% paid for demo
    document.getElementById('collectedAmount').textContent = `ETB ${(group.monthlyContribution * paidCount).toLocaleString()}`;
    document.getElementById('pendingPayments').textContent = group.totalMembers - paidCount;
    document.getElementById('upcomingEvents').textContent = '0'; // You'll implement events later
    
    // Render group members
    renderGroupMembers(group);
    
    // For now, use demo data for other tabs
    renderGroupContributions(group);
    renderGroupEvents(group);
    renderGroupRequests(group);
    renderRecentActivity(group);
    renderUpcomingEvents(group);
}

// Render group members
function renderGroupMembers(group) {
    const container = document.getElementById('membersGrid');
    const countElement = document.getElementById('membersCount');
    
    countElement.textContent = group.members.length;
    container.innerHTML = '';
    
    group.members.forEach(member => {
        const user = member.user;
        const initials = user.fullName.split(' ').map(n => n[0]).join('');
        
        container.innerHTML += `
            <div class="member-card">
                <div class="member-avatar">${initials}</div>
                <div class="member-info">
                    <h4>${user.fullName}</h4>
                    <p>${member.role} • ${user.phone}</p>
                    <span class="member-status status-paid">
                        Active
                    </span>
                </div>
                ${group.members.find(m => m.user._id === currentUser._id)?.role === 'admin' ? `
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

// Demo functions for other tabs (you'll implement these with real data later)
function renderGroupContributions(group) {
    const container = document.getElementById('contributionsTable');
    container.innerHTML = `
        <div class="table-row">
            <div>Real contributions data will appear here</div>
            <div>ETB ${group.monthlyContribution}</div>
            <div>Pending</div>
            <div><span class="member-status status-pending">Pending</span></div>
        </div>
    `;
}

function renderGroupEvents(group) {
    const container = document.getElementById('eventsList');
    container.innerHTML = `
        <div class="event-card">
            <div class="event-date">
                <div class="day">15</div>
                <div class="month">OCT</div>
            </div>
            <div class="event-info">
                <h4>Monthly Meeting</h4>
                <p>Real events will appear here when implemented</p>
                <div class="event-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${group.location}</span>
                    <span><i class="fas fa-clock"></i> 2:00 PM</span>
                </div>
            </div>
        </div>
    `;
}

function renderGroupRequests(group) {
    const container = document.getElementById('requestsList');
    const countElement = document.getElementById('requestsCount');
    
    // Only show requests for admins
    const userMember = group.members.find(member => 
        member.user._id === currentUser._id
    );
    
    if (userMember?.role !== 'admin') {
        container.innerHTML = '<p>Only admins can view join requests.</p>';
        return;
    }
    
    countElement.textContent = '0';
    container.innerHTML = '<p>No pending requests</p>';
}

function renderRecentActivity(group) {
    const container = document.getElementById('recentActivityList');
    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                <i class="fas fa-info-circle"></i>
            </div>
            <div>
                <p style="font-weight: 500;">Real activity will appear here</p>
                <small style="color: var(--gray);">Just now</small>
            </div>
        </div>
    `;
}

function renderUpcomingEvents(group) {
    const container = document.getElementById('upcomingEventsList');
    container.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h4 style="font-weight: 600; margin-bottom: 5px;">Real events coming soon</h4>
            <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 5px;">${group.location}</p>
            <small style="color: var(--primary);"><i class="far fa-calendar"></i> Coming soon</small>
        </div>
    `;
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

// Render profile page
async function renderProfile() {
    // Update profile stats
    document.getElementById('profileGroupsCount').textContent = userGroups.length;
    document.getElementById('profileAdminCount').textContent = userGroups.filter(group => 
        group.members.some(member => 
            member.user._id === currentUser._id && member.role === 'admin'
        )
    ).length;
    
    // Render user's groups in profile
    const container = document.getElementById('profileGroupsGrid');
    container.innerHTML = '';
    
    if (userGroups.length === 0) {
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
    userGroups.forEach(group => {
        const userMember = group.members.find(member => 
            member.user._id === currentUser._id
        );
        
        container.innerHTML += `
            <div class="group-card">
                <div class="group-header">
                    <div class="group-icon">
                        <i class="fas ${getGroupIcon(group.type)}"></i>
                    </div>
                    <div class="group-info">
                        <h3>${group.name}</h3>
                        <span class="group-type">${getGroupTypeName(group.type)} Edir</span>
                        <div class="group-meta">
                            <span><i class="fas fa-users"></i> ${group.totalMembers} members</span>
                            <span><i class="fas fa-calendar"></i> Created ${new Date(group.createdAt).getFullYear()}</span>
                        </div>
                    </div>
                    <div class="role-badge ${userMember?.role === 'admin' ? 'role-admin' : 'role-member'}">
                        ${userMember?.role === 'admin' ? 'Admin' : 'Member'}
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
                <button class="join-btn" onclick="switchToGroup('${group._id}')">Open Group</button>
            </div>
        `;
    });
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
async function createNewGroup() {
    const groupName = document.getElementById('groupName').value;
    const groupType = document.getElementById('groupType').value;
    
    if (!groupName || !groupType) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: groupName,
                description: document.getElementById('groupDescription').value || 'A new Edir group for community support.',
                type: groupType,
                monthlyContribution: parseInt(document.getElementById('monthlyContribution').value) || 100,
                location: 'Addis Ababa',
                privacy: 'private' // All groups are private as requested
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Group created successfully!', 'success');
            closeCreateModal();
            
            // Reset form
            document.getElementById('groupName').value = '';
            document.getElementById('groupType').value = '';
            document.getElementById('groupDescription').value = '';
            document.getElementById('monthlyContribution').value = '100';
            
            // Refresh the dashboard
            checkUserView();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        showToast('Error creating group', 'error');
    }
}

// Save profile changes
async function saveProfile() {
    const fullName = document.getElementById('profileFullName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const bio = document.getElementById('profileBio').value;
    
    try {
        // In a real app, you'd send this to your backend
        // For now, we'll just update local storage
        currentUser.fullName = fullName;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.bio = bio;
        
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUIWithUserData();
        
        showToast('Profile updated successfully!', 'success');
        showPage('discovery');
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error saving profile', 'error');
    }
}

// Save settings
function saveSettings() {
    // Settings are already saved via event listeners
    showToast('Settings saved successfully!', 'success');
    showPage('discovery');
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Show toast notification
function showToast(message, type) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span class="toast-message">${message}</span>
        `;
        document.body.appendChild(toast);
    }
    
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else {
        toastIcon.className = 'fas fa-exclamation-circle';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createModal');
    if (event.target === modal) {
        closeCreateModal();
    }
}

// Placeholder functions for other modals
function openInviteModal() {
    showToast('Invite feature coming soon!', 'info');
}

function openNotifyModal() {
    showToast('Notify feature coming soon!', 'info');
}

function openEventModal() {
    showToast('Event creation coming soon!', 'info');
}
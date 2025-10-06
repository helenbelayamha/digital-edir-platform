document.addEventListener('DOMContentLoaded', function() {
    // API Base URL - point to your backend
    const API_BASE = 'http://localhost:5000/api';
    
    // DOM Elements
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const forms = document.querySelectorAll('.form');
    const switchFormLinks = document.querySelectorAll('.switch-form');
    const toast = document.getElementById('toast');
    const successModal = document.getElementById('successModal');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLinks = document.querySelectorAll('.back-to-login-link');
    const goToLoginBtn = document.getElementById('go-to-login');

    // Toggle between login and register forms
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const formToShow = this.getAttribute('data-form');
            showForm(formToShow);
        });
    });

    // Switch forms from links
    switchFormLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const formToShow = this.getAttribute('data-form');
            showForm(formToShow);
        });
    });

    // Show specific form
    function showForm(formName) {
        toggleBtns.forEach(b => {
            b.classList.remove('active');
            if (b.getAttribute('data-form') === formName) {
                b.classList.add('active');
            }
        });
        
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${formName}-form`) {
                form.classList.add('active');
            }
        });
    }

    // Login Form Submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save user data and token
                localStorage.setItem('user', JSON.stringify(data.data));
                localStorage.setItem('token', data.data.token);
                
                showToast('Login successful! Redirecting...', 'success');
                
                // Redirect to main app after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    });

    // Register Form Submission - SIMPLIFIED VERSION
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        
        console.log('Trying to register:', { fullName, email });
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, phone, password })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                // Save user data and token
                localStorage.setItem('user', JSON.stringify(data.data));
                localStorage.setItem('token', data.data.token);
                
                showToast('Registration successful! Redirecting...', 'success');
                
                // Redirect to main app after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    });

    // Show toast notification
    function showToast(message, type) {
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

    // Forgot Password Link
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForm('forgot-password');
    });

    // Back to Login Links
    backToLoginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showForm('login');
        });
    });

    // Go to Login from Success Modal
    goToLoginBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        showForm('login');
    });

    // Check if user is already logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            // User is already logged in, redirect to main app
            window.location.href = 'index.html';
        }
    }

    // Check auth status when page loads
    checkAuthStatus();

    // Remove password strength disabling (enable register button)
    const passwordInput = document.getElementById('register-password');
    const registerBtn = document.getElementById('register-btn');
    
    if (passwordInput && registerBtn) {
        // Enable the button immediately
        registerBtn.disabled = false;
        
        // Remove any password strength listeners that disable the button
        passwordInput.addEventListener('input', function() {
            registerBtn.disabled = false;
        });
    }
});
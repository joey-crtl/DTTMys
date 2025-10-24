// -------------------- Window control buttons --------------------
document.getElementById("min-btn").addEventListener("click", () => {
    window.api.minimize();
});

document.getElementById("max-btn").addEventListener("click", () => {
    window.api.maximize();
});

document.getElementById("close-btn").addEventListener("click", () => {
    window.api.close();
});

// -------------------- Sign In Form --------------------
const signInForm = document.getElementById('signInForm');
const errorMessage = document.getElementById('error-message');

signInForm.addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    errorMessage.textContent = '';

    if (!username || !password) {
        errorMessage.textContent = 'Please fill in both fields.';
        return;
    }

    const result = await window.api.login(username, password);

    if (result.success) {
        const container = document.querySelector('.container');
        container.style.transition = 'all 0.5s ease';
        container.style.transform = 'scale(1.05)';
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    } else {
        errorMessage.textContent = result.message || 'Login failed.';
    }
});

// -------------------- Toggle password visibility --------------------
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

// -------------------- Hidden Admin Registration --------------------
let clickCount = 0;
let clickTimer;

const titleElement = document.querySelector(".form-header h2"); // Title element
const adminModal = document.getElementById("adminRegisterModal");
const closeAdminBtn = document.getElementById("closeAdminModal");
const registerAdminBtn = document.getElementById("registerAdminBtn");

// 🔹 Use pointerdown instead of mousedown for better reliability
titleElement.addEventListener("pointerdown", (e) => {
    e.preventDefault(); // Prevent text selection
    clickCount++;

    clearTimeout(clickTimer); // Reset previous timer

    if (clickCount === 3) {
        adminModal.style.display = "flex"; // Show modal
        adminModal.style.zIndex = "2000"; // Ensure it's above other UI
        clickCount = 0;
    } else {
        // Reset click count if triple-click not completed within 1s
        clickTimer = setTimeout(() => clickCount = 0, 1000);
    }
});

// Close modal when clicking close button
closeAdminBtn.addEventListener("click", () => {
    adminModal.style.display = "none";
});

// Close modal when clicking outside modal content
window.addEventListener("click", (e) => {
    if (e.target === adminModal) adminModal.style.display = "none";
});

// Admin registration
registerAdminBtn.addEventListener("click", async () => {
    const username = document.getElementById("newAdminUsername").value.trim();
    const password = document.getElementById("newAdminPassword").value.trim();
    if (!username || !password) return alert("Enter both username and password");

    try {
        const res = await window.api.createAdmin({ username, password });
        if (res.success) {
            alert("Admin registered successfully!");
            adminModal.style.display = "none";
        } else {
            alert("Failed to register admin: " + res.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error registering admin");
    }
});

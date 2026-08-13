const STORAGE_KEYS = {
  users: "receipt_users",
  currentUser: "receipt_current_user",
  receipts: "receipt_data"
};

const DEMO_ADMIN = {
  email: "admin@receiptsystem.com",
  password: "admin123",
  isAdmin: true
};

const demoReceipts = [
  {
    id: "receipt-1",
    customerName: "John Doe",
    customerId: "CUST-001",
    imei: "123456789012345",
    nextOfKin: "Jane Doe",
    paymentMethod: "Cash",
    date: "2026-08-10",
    createdBy: "demo@receiptsystem.com"
  },
  {
    id: "receipt-2",
    customerName: "Sarah Smith",
    customerId: "CUST-002",
    imei: "987654321098765",
    nextOfKin: "Tom Smith",
    paymentMethod: "Credit Card",
    date: "2026-08-11",
    createdBy: "demo@receiptsystem.com"
  },
  {
    id: "receipt-3",
    customerName: "Mike Johnson",
    customerId: "CUST-003",
    imei: "456789123456789",
    nextOfKin: "Emma Johnson",
    paymentMethod: "Mobile Money",
    date: "2026-08-12",
    createdBy: "demo@receiptsystem.com"
  }
];

const authForm = document.querySelector("#auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginBtn = document.querySelector("#login-btn");
const registerBtn = document.querySelector("#register-btn");
const logoutBtn = document.querySelector("#logout-btn");
const authStatus = document.querySelector("#auth-status");
const phoneForm = document.querySelector("#phone-form");
const searchInput = document.querySelector("#search-input");

// Helper to get the active phone-list
function getActivePhoneList() {
  const userFormSection = document.querySelector("#user-form-section");
  if (userFormSection && !userFormSection.classList.contains("hidden")) {
    return document.querySelector("#phone-list-user");
  }
  return document.querySelector("#phone-list");
}

let allReceipts = getStoredReceipts();

function getStoredReceipts() {
  const stored = localStorage.getItem(STORAGE_KEYS.receipts);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(demoReceipts));
    return [...demoReceipts];
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(demoReceipts));
    return [...demoReceipts];
  }
}

function saveReceipts() {
  localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(allReceipts));
}

function getUsers() {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  let users = stored ? JSON.parse(stored) : [];
  
  // Ensure demo admin exists
  const adminExists = users.some(u => u.email === DEMO_ADMIN.email);
  if (!adminExists) {
    users = [DEMO_ADMIN, ...users];
    saveUsers(users);
  }
  
  return users;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
  return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function setAuthStatus(message) {
  authStatus.textContent = message;
}

function updateAuthUI(user) {
  const signedIn = Boolean(user);

  emailInput.disabled = signedIn;
  passwordInput.disabled = signedIn;
  loginBtn.disabled = signedIn;
  registerBtn.disabled = signedIn;
  logoutBtn.classList.toggle("hidden", !signedIn);

  const submitButton = phoneForm.querySelector('button[type="submit"]');
  submitButton.disabled = !signedIn;

  const adminViewBtn = document.querySelector("#admin-view-btn");
  const userViewBtn = document.querySelector("#user-view-btn");
  if (adminViewBtn && userViewBtn) {
    const isAdmin = user && user.isAdmin;
    adminViewBtn.classList.toggle("hidden", !isAdmin);
    userViewBtn.classList.toggle("hidden", isAdmin);
  }

  if (signedIn) {
    const adminLabel = user.isAdmin ? " (Admin)" : "";
    setAuthStatus(`Logged in as ${user.email}${adminLabel}`);
  } else {
    setAuthStatus("Logged out");
  }
}

function renderReceipts(receipts) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const user = getCurrentUser();
  const phoneList = getActivePhoneList();
  
  if (!phoneList) return;
  
  // Filter by user role
  let filteredReceipts = filterReceiptsByView(receipts);
  
  // Filter by search term
  filteredReceipts = filteredReceipts.filter((receipt) => {
    const fullText = `${receipt.customerName} ${receipt.customerId} ${receipt.imei}`.toLowerCase();
    return fullText.includes(searchTerm);
  });

  if (!filteredReceipts.length) {
    phoneList.innerHTML = '<div class="empty-state">No receipts found.</div>';
    return;
  }

  phoneList.innerHTML = filteredReceipts
    .map(
      (receipt) => `
        <article class="phone-card">
          <div class="card-body">
            <div class="card-top">
              <span class="card-brand">${receipt.customerId}</span>
              <span class="card-price">${receipt.paymentMethod}</span>
            </div>
            <h3>${receipt.customerName}</h3>
            <p>IMEI: ${receipt.imei}</p>
            <div class="meta">
              <span>Next of Kin: ${receipt.nextOfKin}</span>
              <span>Date: ${receipt.date}</span>
              ${user && user.isAdmin ? `<span>Created by: ${receipt.createdBy}</span>` : ''}
            </div>
            <div class="card-actions">
              <button class="buy-btn" data-view-id="${receipt.id}">View</button>
              <button class="delete-btn" data-delete-id="${receipt.id}">Delete</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function handleLogin(event) {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  const users = getUsers();
  const user = users.find((entry) => entry.email === email && entry.password === password);

  if (!user) {
    alert("Invalid email or password. Register first if needed.");
    return;
  }

  setCurrentUser({ email: user.email, isAdmin: user.isAdmin || false });
  authForm.reset();
  updateAuthUI(getCurrentUser());
}

function handleRegister() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password to register.");
    return;
  }

  const users = getUsers();
  const exists = users.some((entry) => entry.email === email);

  if (exists) {
    alert("This user already exists. Please log in instead.");
    return;
  }

  const updatedUsers = [...users, { email, password, isAdmin: false }];
  saveUsers(updatedUsers);
  setCurrentUser({ email, isAdmin: false });
  authForm.reset();
  updateAuthUI(getCurrentUser());
}

function handleLogout() {
  setCurrentUser(null);
  updateAuthUI(null);
}

function handleReceiptSubmit(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    alert("Please log in before creating a receipt.");
    return;
  }

  const formData = new FormData(phoneForm);
  const receipt = {
    id: `receipt-${Date.now()}`,
    customerName: String(formData.get("customerName") || "").trim(),
    customerId: String(formData.get("customerId") || "").trim(),
    imei: String(formData.get("imei") || "").trim(),
    nextOfKin: String(formData.get("nextOfKin") || "").trim(),
    paymentMethod: String(formData.get("paymentMethod") || "").trim(),
    date: String(formData.get("date") || "").trim(),
    createdBy: user.email
  };

  if (!receipt.customerName || !receipt.customerId || !receipt.imei || !receipt.nextOfKin || !receipt.paymentMethod || !receipt.date) {
    alert("Please complete all required fields.");
    return;
  }

  allReceipts = [receipt, ...allReceipts];
  saveReceipts();
  renderReceipts(allReceipts);
  phoneForm.reset();
  alert("Receipt created successfully!");
}

function handleViewReceipt(receiptId) {
  const receipt = allReceipts.find((item) => item.id === receiptId);
  if (!receipt) return;

  const details = `
Receipt ID: ${receipt.id}
Customer: ${receipt.customerName}
Customer ID: ${receipt.customerId}
IMEI: ${receipt.imei}
Next of Kin: ${receipt.nextOfKin}
Payment Method: ${receipt.paymentMethod}
Date: ${receipt.date}
Created By: ${receipt.createdBy}
  `;
  alert(details);
}

function handleDeleteReceipt(receiptId) {
  const user = getCurrentUser();
  if (!user) {
    alert("Please sign in to delete receipts.");
    return;
  }

  const confirmed = window.confirm("Delete this receipt?");
  if (!confirmed) return;

  allReceipts = allReceipts.filter((item) => item.id !== receiptId);
  saveReceipts();
  renderReceipts(allReceipts);
}

function filterReceiptsByView(receipts) {
  const user = getCurrentUser();
  if (!user) return [];
  if (user.isAdmin) return receipts;
  return receipts.filter((r) => r.createdBy === user.email);
}

function switchToAdminView() {
  document.querySelector("#user-form-section").classList.add("hidden");
  document.querySelector("#user-listing-panel").classList.add("hidden");
  document.querySelector("#admin-view-section").classList.remove("hidden");
  renderReceipts(allReceipts);
}

function switchToUserView() {
  document.querySelector("#user-form-section").classList.remove("hidden");
  document.querySelector("#user-listing-panel").classList.remove("hidden");
  document.querySelector("#admin-view-section").classList.add("hidden");
  renderReceipts(allReceipts);
}

authForm.addEventListener("submit", handleLogin);
registerBtn.addEventListener("click", handleRegister);
logoutBtn.addEventListener("click", handleLogout);
phoneForm.addEventListener("submit", handleReceiptSubmit);
searchInput.addEventListener("input", () => renderReceipts(allReceipts));

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view-id]");
  const deleteButton = event.target.closest("[data-delete-id]");
  const adminViewBtn = event.target.closest("[data-admin-view]");
  const userViewBtn = event.target.closest("[data-user-view]");

  if (viewButton) {
    handleViewReceipt(viewButton.dataset.viewId);
  }

  if (deleteButton) {
    handleDeleteReceipt(deleteButton.dataset.deleteId);
  }

  if (adminViewBtn) {
    switchToAdminView();
  }

  if (userViewBtn) {
    switchToUserView();
  }
});

updateAuthUI(getCurrentUser());
renderReceipts(allReceipts);

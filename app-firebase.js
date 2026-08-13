import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Enable persistence
setPersistence(auth, browserLocalPersistence);

const ADMIN_EMAIL = "admin@receiptsystem.com";
const ADMIN_PASSWORD = "admin123";

// DOM Elements
const authForm = document.querySelector("#auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginBtn = document.querySelector("#login-btn");
const registerBtn = document.querySelector("#register-btn");
const logoutBtn = document.querySelector("#logout-btn");
const authStatus = document.querySelector("#auth-status");
const phoneForm = document.querySelector("#phone-form");
const searchInput = document.querySelector("#search-input");

let currentUser = null;
let allReceipts = [];

// Helper to get active phone list
function getActivePhoneList() {
  const userFormSection = document.querySelector("#user-form-section");
  if (userFormSection && !userFormSection.classList.contains("hidden")) {
    return document.querySelector("#phone-list-user");
  }
  return document.querySelector("#phone-list");
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
    const isAdmin = user && user.email === ADMIN_EMAIL;
    adminViewBtn.classList.toggle("hidden", !isAdmin);
    userViewBtn.classList.toggle("hidden", isAdmin);
  }

  if (signedIn) {
    const adminLabel = user.email === ADMIN_EMAIL ? " (Admin)" : "";
    setAuthStatus(`Logged in as ${user.email}${adminLabel}`);
  } else {
    setAuthStatus("Logged out");
  }
}

async function initializeAdminUser() {
  try {
    const userRef = doc(db, "users", ADMIN_EMAIL);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: ADMIN_EMAIL,
        isAdmin: true,
        createdAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    authForm.reset();
    // Auth state listener will handle UI update
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

async function handleRegister() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password to register.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store user info in Firestore
    await setDoc(doc(db, "users", email), {
      email: email,
      isAdmin: false,
      createdAt: Timestamp.now()
    });
    
    authForm.reset();
    // Auth state listener will handle UI update
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    alert("Logout failed: " + error.message);
  }
}

async function loadReceipts() {
  try {
    if (!currentUser) {
      allReceipts = [];
      renderReceipts();
      return;
    }

    let q;
    if (currentUser.email === ADMIN_EMAIL) {
      // Admin sees all receipts
      q = query(collection(db, "receipts"));
    } else {
      // Users see only their receipts
      q = query(collection(db, "receipts"), where("createdBy", "==", currentUser.email));
    }

    const querySnapshot = await getDocs(q);
    allReceipts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    renderReceipts();
  } catch (error) {
    console.error("Error loading receipts:", error);
  }
}

function renderReceipts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const phoneList = getActivePhoneList();
  
  if (!phoneList) return;
  
  // Filter by search term
  let filteredReceipts = allReceipts.filter((receipt) => {
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
              ${currentUser && currentUser.email === ADMIN_EMAIL ? `<span>Created by: ${receipt.createdBy}</span>` : ''}
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

async function handleDeleteReceipt(receiptId) {
  if (!currentUser) {
    alert("Please sign in to delete receipts.");
    return;
  }

  const confirmed = window.confirm("Delete this receipt?");
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "receipts", receiptId));
    await loadReceipts();
  } catch (error) {
    alert("Error deleting receipt: " + error.message);
  }
}

async function handleReceiptSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    alert("Please log in before creating a receipt.");
    return;
  }

  const formData = new FormData(phoneForm);
  const receipt = {
    customerName: String(formData.get("customerName") || "").trim(),
    customerId: String(formData.get("customerId") || "").trim(),
    imei: String(formData.get("imei") || "").trim(),
    nextOfKin: String(formData.get("nextOfKin") || "").trim(),
    paymentMethod: String(formData.get("paymentMethod") || "").trim(),
    date: String(formData.get("date") || "").trim(),
    createdBy: currentUser.email,
    createdAt: Timestamp.now()
  };

  if (!receipt.customerName || !receipt.customerId || !receipt.imei || !receipt.nextOfKin || !receipt.paymentMethod || !receipt.date) {
    alert("Please complete all required fields.");
    return;
  }

  try {
    await addDoc(collection(db, "receipts"), receipt);
    phoneForm.reset();
    alert("Receipt created successfully!");
    await loadReceipts();
  } catch (error) {
    alert("Error creating receipt: " + error.message);
  }
}

function switchToAdminView() {
  document.querySelector("#user-form-section").classList.add("hidden");
  document.querySelector("#user-listing-panel").classList.add("hidden");
  document.querySelector("#admin-view-section").classList.remove("hidden");
  renderReceipts();
}

function switchToUserView() {
  document.querySelector("#user-form-section").classList.remove("hidden");
  document.querySelector("#user-listing-panel").classList.remove("hidden");
  document.querySelector("#admin-view-section").classList.add("hidden");
  renderReceipts();
}

// Event Listeners
authForm.addEventListener("submit", handleLogin);
registerBtn.addEventListener("click", handleRegister);
logoutBtn.addEventListener("click", handleLogout);
phoneForm.addEventListener("submit", handleReceiptSubmit);
searchInput.addEventListener("input", () => renderReceipts());

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

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    updateAuthUI(user);
    await loadReceipts();
  } else {
    currentUser = null;
    updateAuthUI(null);
    allReceipts = [];
    renderReceipts();
  }
});

// Initialize
initializeAdminUser();

const STORAGE_KEYS = {
  users: "cellex_users",
  currentUser: "cellex_current_user",
  phones: "cellex_phones"
};

const demoPhones = [
  {
    id: "demo-1",
    brand: "Apple",
    model: "iPhone 15 Pro",
    title: "Unlocked iPhone 15 Pro 256GB",
    price: 899,
    storage: "256GB",
    condition: "Excellent",
    imageUrl: "https://images.unsplash.com/photo-1672235470220-487ca5a4621b?auto=format&fit=crop&w=900&q=80",
    seller: "demo@cellexmarket.com"
  },
  {
    id: "demo-2",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    title: "Samsung Galaxy S24 Ultra 512GB",
    price: 1049,
    storage: "512GB",
    condition: "Brand new",
    imageUrl: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=900&q=80",
    seller: "demo@cellexmarket.com"
  },
  {
    id: "demo-3",
    brand: "Google",
    model: "Pixel 8 Pro",
    title: "Google Pixel 8 Pro 128GB",
    price: 699,
    storage: "128GB",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    seller: "demo@cellexmarket.com"
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
const phoneList = document.querySelector("#phone-list");
const searchInput = document.querySelector("#search-input");

let allPhones = getStoredPhones();

function getStoredPhones() {
  const stored = localStorage.getItem(STORAGE_KEYS.phones);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.phones, JSON.stringify(demoPhones));
    return [...demoPhones];
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEYS.phones, JSON.stringify(demoPhones));
    return [...demoPhones];
  }
}

function savePhones() {
  localStorage.setItem(STORAGE_KEYS.phones, JSON.stringify(allPhones));
}

function getUsers() {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  return stored ? JSON.parse(stored) : [];
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

  if (signedIn) {
    setAuthStatus(`Logged in as ${user.email}`);
  } else {
    setAuthStatus("Logged out");
  }
}

function renderPhones(phones) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filtered = phones.filter((phone) => {
    const fullText = `${phone.brand} ${phone.model} ${phone.title}`.toLowerCase();
    return fullText.includes(searchTerm);
  });

  if (!filtered.length) {
    phoneList.innerHTML = '<div class="empty-state">No phones match your search yet.</div>';
    return;
  }

  phoneList.innerHTML = filtered
    .map(
      (phone) => `
        <article class="phone-card">
          <img src="${phone.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"}" alt="${phone.title}" />
          <div class="card-body">
            <div class="card-top">
              <span class="card-brand">${phone.brand}</span>
              <span class="card-price">$${Number(phone.price).toFixed(2)}</span>
            </div>
            <h3>${phone.title}</h3>
            <p>${phone.model}</p>
            <div class="meta">
              <span>${phone.condition}</span>
              <span>${phone.storage}</span>
            </div>
            <div class="card-actions">
              <button class="buy-btn" data-buy-id="${phone.id}">Buy now</button>
              <button class="delete-btn" data-delete-id="${phone.id}">Delete</button>
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

  setCurrentUser({ email: user.email });
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

  const updatedUsers = [...users, { email, password }];
  saveUsers(updatedUsers);
  setCurrentUser({ email });
  authForm.reset();
  updateAuthUI(getCurrentUser());
}

function handleLogout() {
  setCurrentUser(null);
  updateAuthUI(null);
}

function handlePhoneSubmit(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    alert("Please log in before listing a phone.");
    return;
  }

  const formData = new FormData(phoneForm);
  const phone = {
    id: `item-${Date.now()}`,
    brand: String(formData.get("brand") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    price: Number(formData.get("price") || 0),
    storage: String(formData.get("storage") || "").trim(),
    condition: String(formData.get("condition") || "").trim(),
    imageUrl: String(formData.get("imageUrl") || "").trim(),
    seller: user.email
  };

  if (!phone.brand || !phone.model || !phone.title || phone.price <= 0) {
    alert("Please complete all required phone details before saving.");
    return;
  }

  allPhones = [phone, ...allPhones];
  savePhones();
  renderPhones(allPhones);
  phoneForm.reset();
}

function handleBuy(phoneId) {
  const phone = allPhones.find((item) => item.id === phoneId);
  if (!phone) return;

  alert(`Order placed for ${phone.title}. A sales agent will contact you soon.`);
}

function handleDelete(phoneId) {
  const user = getCurrentUser();
  if (!user) {
    alert("Please sign in to remove listings.");
    return;
  }

  const confirmed = window.confirm("Delete this phone listing?");
  if (!confirmed) return;

  allPhones = allPhones.filter((item) => item.id !== phoneId);
  savePhones();
  renderPhones(allPhones);
}

authForm.addEventListener("submit", handleLogin);
registerBtn.addEventListener("click", handleRegister);
logoutBtn.addEventListener("click", handleLogout);
phoneForm.addEventListener("submit", handlePhoneSubmit);
searchInput.addEventListener("input", () => renderPhones(allPhones));

document.addEventListener("click", (event) => {
  const buyButton = event.target.closest("[data-buy-id]");
  const deleteButton = event.target.closest("[data-delete-id]");

  if (buyButton) {
    handleBuy(buyButton.dataset.buyId);
  }

  if (deleteButton) {
    handleDelete(deleteButton.dataset.deleteId);
  }
});

updateAuthUI(getCurrentUser());
renderPhones(allPhones);

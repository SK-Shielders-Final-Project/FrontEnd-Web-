const KEY = "admin_logged_in";

export function isAdminLoggedIn() {
  return localStorage.getItem(KEY) === "true";
}

export function setAdminLoggedIn(value) {
  localStorage.setItem(KEY, value ? "true" : "false");
}

export function adminLogout() {
  localStorage.removeItem(KEY);
}

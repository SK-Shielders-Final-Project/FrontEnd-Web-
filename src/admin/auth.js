import { getCookie, setCookie, removeCookie } from '../utils/cookie';

const KEY = "admin_logged_in";

export function isAdminLoggedIn() {
  return getCookie(KEY) === "true";
}

export function setAdminLoggedIn(value) {
  setCookie(KEY, value ? "true" : "false", 1);
}

export function adminLogout() {
  removeCookie(KEY);
}

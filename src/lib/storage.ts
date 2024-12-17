// Local storage utilities
const STORAGE_KEYS = {
  USER: 'maou_user',
  TOKEN: 'maou_token',
} as const;

export function saveUserData(userData: { userId: string; username: string; token: string }) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ 
    userId: userData.userId, 
    username: userData.username 
  }));
  localStorage.setItem(STORAGE_KEYS.TOKEN, userData.token);
}

export function getUserData() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function clearUserData() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}
<<<<<<< Updated upstream
import { removeCookie } from '../utils/cookie';

export const logoutUser = () => {
    removeCookie('token');
    removeCookie('refreshToken');
    removeCookie('userId');
=======
export const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const deleteCookie = (name) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    deleteCookie('userId'); // userId를 쿠키에서 제거
>>>>>>> Stashed changes
    window.location.href = '/login';
};

export const logoutAdmin = () => {
    removeCookie('adminToken');
    removeCookie('adminRefreshToken');
    removeCookie('adminId');
    window.location.href = '/admin/login';
};

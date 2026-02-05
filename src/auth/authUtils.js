import { removeCookie } from '../utils/cookie';

export const logoutUser = () => {
    removeCookie('token');
    removeCookie('refreshToken');
    removeCookie('userId');
    window.location.href = '/login';
};

export const logoutAdmin = () => {
    removeCookie('adminToken');
    removeCookie('adminRefreshToken');
    removeCookie('adminId');
    window.location.href = '/admin/login';
};

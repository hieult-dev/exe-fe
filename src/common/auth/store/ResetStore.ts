import { useUserStore } from '@/apps/user/store/UserStore';

export function resetStoreAndRedirectToLogin() {
    resetStore();
    window.location.replace('/login');
}
export function resetStore() {
    useUserStore.getState().resetUserStore();
}

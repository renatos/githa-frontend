/**
 * Toast service bridge for non-component modules.
 * Replaces the window.$toast anti-pattern with a module-scoped setter.
 */
let _toast = null;

export const toastBridge = {
    setToast(toastInstance) {
        _toast = toastInstance;
    },
    getToast() {
        return _toast;
    },
};

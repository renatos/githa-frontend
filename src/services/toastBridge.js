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
    success(summary, detail = '', life = 3000) {
        _toast?.add({ severity: 'success', summary, detail, life });
    },
    error(summary, detail = '', life = 5000) {
        _toast?.add({ severity: 'error', summary, detail, life });
    },
    warn(summary, detail = '', life = 4000) {
        _toast?.add({ severity: 'warn', summary, detail, life });
    },
    info(summary, detail = '', life = 3000) {
        _toast?.add({ severity: 'info', summary, detail, life });
    }
};

import { onMounted, onUnmounted, watch, isRef } from 'vue';

const activeHandlers = [];
let isEscapeListenerActive = false;
let scrollLockCount = 0;

const globalEscapeHandler = (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
        if (activeHandlers.length > 0) {
            // Execute only the last handler in the stack (the topmost open modal)
            const topmostHandler = activeHandlers[activeHandlers.length - 1];
            topmostHandler(event);
        }
    }
};

export function registerEscapeHandler(callback) {
    const existingIndex = activeHandlers.indexOf(callback);
    if (existingIndex > -1) {
        activeHandlers.splice(existingIndex, 1);
    }
    activeHandlers.push(callback);

    if (!isEscapeListenerActive && typeof document !== 'undefined') {
        document.addEventListener('keydown', globalEscapeHandler);
        isEscapeListenerActive = true;
    }
}

export function unregisterEscapeHandler(callback) {
    const index = activeHandlers.indexOf(callback);
    if (index > -1) {
        activeHandlers.splice(index, 1);
    }

    if (activeHandlers.length === 0 && isEscapeListenerActive && typeof document !== 'undefined') {
        document.removeEventListener('keydown', globalEscapeHandler);
        isEscapeListenerActive = false;
    }
}

export function lockBodyScroll() {
    scrollLockCount++;
    if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = 'hidden';
    }
}

export function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0 && typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
    }
}

export function resetModalStackForTests() {
    activeHandlers.length = 0;
    scrollLockCount = 0;
    if (isEscapeListenerActive && typeof document !== 'undefined') {
        document.removeEventListener('keydown', globalEscapeHandler);
        isEscapeListenerActive = false;
    }
    if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
    }
}

/**
 * Composable to handle ESC key press with LIFO stack support.
 * @param {Function} callback - Function to call when ESC is pressed
 * @param {import('vue').Ref<boolean>|Function} [activeSource] - Optional reactive boolean or getter indicating if modal is currently open
 */
export function useEscapeKey(callback, activeSource) {
    if (activeSource !== undefined) {
        watch(
            isRef(activeSource) ? activeSource : activeSource,
            (isActive) => {
                if (isActive) {
                    registerEscapeHandler(callback);
                } else {
                    unregisterEscapeHandler(callback);
                }
            },
            { immediate: true }
        );

        onUnmounted(() => {
            unregisterEscapeHandler(callback);
        });
        return;
    }

    onMounted(() => {
        registerEscapeHandler(callback);
    });

    onUnmounted(() => {
        unregisterEscapeHandler(callback);
    });
}


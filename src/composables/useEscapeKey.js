import { onMounted, onUnmounted } from 'vue';

const activeHandlers = [];
let isEscapeListenerActive = false;

const globalEscapeHandler = (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
        if (activeHandlers.length > 0) {
            // Execute the last handler in the stack (the topmost modal)
            const topmostHandler = activeHandlers[activeHandlers.length - 1];
            topmostHandler();
        }
    }
};

/**
 * Composable to handle ESC key press
 * @param {Function} callback - Function to call when ESC is pressed
 */
export function useEscapeKey(callback) {
    onMounted(() => {
        activeHandlers.push(callback);

        if (!isEscapeListenerActive) {
            document.addEventListener('keydown', globalEscapeHandler);
            isEscapeListenerActive = true;
        }
    });

    onUnmounted(() => {
        const index = activeHandlers.indexOf(callback);
        if (index > -1) {
            activeHandlers.splice(index, 1);
        }

        if (activeHandlers.length === 0 && isEscapeListenerActive) {
            document.removeEventListener('keydown', globalEscapeHandler);
            isEscapeListenerActive = false;
        }
    });
}

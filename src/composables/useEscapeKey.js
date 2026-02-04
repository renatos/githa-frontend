import { onMounted, onUnmounted } from 'vue';

/**
 * Composable to handle ESC key press
 * @param {Function} callback - Function to call when ESC is pressed
 */
export function useEscapeKey(callback) {
    const handleEscape = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            callback();
        }
    };

    onMounted(() => {
        document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape);
    });
}

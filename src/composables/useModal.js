import { onMounted, onUnmounted } from 'vue';

export function useModal(emit) {
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            emit('close');
        }
    };

    onMounted(() => {
        document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape);
    });
}

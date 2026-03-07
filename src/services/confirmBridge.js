import { reactive } from 'vue';

const state = reactive({
    show: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    type: 'info', // 'info', 'warning', 'danger'
    onConfirm: null,
    onCancel: null
});

export const confirmBridge = {
    state,
    
    confirm({ title, message, confirmLabel, cancelLabel, type = 'warning', onConfirm, onCancel }) {
        state.title = title || 'Confirmação';
        state.message = message || 'Tem certeza que deseja realizar esta ação?';
        state.confirmLabel = confirmLabel || 'Confirmar';
        state.cancelLabel = cancelLabel || 'Cancelar';
        state.type = type;
        state.onConfirm = onConfirm;
        state.onCancel = onCancel;
        state.show = true;
    },

    alert({ title, message, type = 'info', onConfirm }) {
        this.confirm({
            title: title || 'Aviso',
            message: message,
            confirmLabel: 'OK',
            cancelLabel: null,
            type,
            onConfirm
        });
    },

    close(isConfirm) {
        if (isConfirm && state.onConfirm) {
            state.onConfirm();
        } else if (!isConfirm && state.onCancel) {
            state.onCancel();
        }
        state.show = false;
        // Reset state after closing
        setTimeout(() => {
            state.onConfirm = null;
            state.onCancel = null;
        }, 200);
    }
};

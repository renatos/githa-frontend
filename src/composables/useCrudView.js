import { ref } from 'vue';

/**
 * Composable that encapsulates common CRUD View logic.
 *
 * @param {Object} service - The API service object (must have create, update, delete methods)
 * @param {Object} labels - Entity labels for messages { singular: 'Serviço', plural: 'Serviços' }
 * @returns {Object} - Reactive state and CRUD functions
 */
export function useCrudView(service, labels) {
    const listRef = ref(null);
    const showForm = ref(false);
    const editingItem = ref({});
    const alert = ref({ type: 'info', message: '' });

    const showAlert = (type, message) => {
        alert.value = { type, message };
        setTimeout(() => (alert.value.message = ''), 3000);
    };

    const openForm = (item = {}) => {
        editingItem.value = { ...item };
        showForm.value = true;
    };

    const closeForm = () => {
        showForm.value = false;
        editingItem.value = {};
    };

    const refreshList = () => {
        listRef.value?.refresh?.();
        // Also support 'loadData' used by GenericTable directly
        if (!listRef.value?.refresh) {
            listRef.value?.loadData?.();
        }
    };

    const saveItem = async (data) => {
        try {
            if (data.id) {
                await service.update(data.id, data);
                showAlert('success', `${labels.singular} atualizado(a) com sucesso!`);
            } else {
                await service.create(data);
                showAlert('success', `${labels.singular} criado(a) com sucesso!`);
            }
            refreshList();
            closeForm();
        } catch (error) {
            console.error(`Error saving ${labels.singular.toLowerCase()}:`, error);
            showAlert('error', `Erro ao salvar ${labels.singular.toLowerCase()}.`);
        }
    };

    const deleteItem = async (id) => {
        if (confirm(`Tem certeza que deseja excluir este(a) ${labels.singular.toLowerCase()}?`)) {
            try {
                await service.delete(id);
                showAlert('success', `${labels.singular} excluído(a) com sucesso!`);
                refreshList();
            } catch (error) {
                console.error(`Error deleting ${labels.singular.toLowerCase()}:`, error);
                showAlert('error', `Erro ao excluir ${labels.singular.toLowerCase()}.`);
            }
        }
    };

    return {
        listRef,
        showForm,
        editingItem,
        alert,
        showAlert,
        openForm,
        closeForm,
        refreshList,
        saveItem,
        deleteItem,
    };
}

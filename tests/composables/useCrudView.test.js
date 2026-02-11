import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCrudView } from '../../src/composables/useCrudView';

describe('useCrudView', () => {
    let service;

    beforeEach(() => {
        service = {
            create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
            update: vi.fn().mockResolvedValue({ data: { id: 1 } }),
            delete: vi.fn().mockResolvedValue({}),
        };
    });

    const labels = { singular: 'Serviço', plural: 'Serviços' };

    it('should initialize with correct defaults', () => {
        const { showForm, editingItem, alert } = useCrudView(service, labels);

        expect(showForm.value).toBe(false);
        expect(editingItem.value).toEqual({});
        expect(alert.value.message).toBe('');
    });

    it('openForm should set editingItem and showForm', () => {
        const { openForm, showForm, editingItem } = useCrudView(service, labels);

        openForm({ id: 1, name: 'Test' });

        expect(showForm.value).toBe(true);
        expect(editingItem.value).toEqual({ id: 1, name: 'Test' });
    });

    it('openForm without args should open empty form', () => {
        const { openForm, showForm, editingItem } = useCrudView(service, labels);

        openForm();

        expect(showForm.value).toBe(true);
        expect(editingItem.value).toEqual({});
    });

    it('closeForm should reset state', () => {
        const { openForm, closeForm, showForm, editingItem } = useCrudView(service, labels);

        openForm({ id: 1, name: 'Test' });
        closeForm();

        expect(showForm.value).toBe(false);
        expect(editingItem.value).toEqual({});
    });

    it('saveItem should call service.create for new items', async () => {
        const { saveItem } = useCrudView(service, labels);

        await saveItem({ name: 'New Service' });

        expect(service.create).toHaveBeenCalledWith({ name: 'New Service' });
        expect(service.update).not.toHaveBeenCalled();
    });

    it('saveItem should call service.update for existing items', async () => {
        const { saveItem } = useCrudView(service, labels);

        await saveItem({ id: 1, name: 'Updated Service' });

        expect(service.update).toHaveBeenCalledWith(1, { id: 1, name: 'Updated Service' });
        expect(service.create).not.toHaveBeenCalled();
    });

    it('saveItem should close form after successful save', async () => {
        const { saveItem, openForm, showForm } = useCrudView(service, labels);

        openForm({ id: 1 });
        expect(showForm.value).toBe(true);

        await saveItem({ id: 1, name: 'Updated' });
        expect(showForm.value).toBe(false);
    });

    it('saveItem should show success alert on create', async () => {
        const { saveItem, alert } = useCrudView(service, labels);

        await saveItem({ name: 'New' });

        expect(alert.value.type).toBe('success');
        expect(alert.value.message).toContain('criado');
    });

    it('saveItem should show success alert on update', async () => {
        const { saveItem, alert } = useCrudView(service, labels);

        await saveItem({ id: 1, name: 'Updated' });

        expect(alert.value.type).toBe('success');
        expect(alert.value.message).toContain('atualizado');
    });

    it('saveItem should show error alert on failure', async () => {
        service.create.mockRejectedValue(new Error('Server error'));
        const { saveItem, alert } = useCrudView(service, labels);

        await saveItem({ name: 'Fail' });

        expect(alert.value.type).toBe('error');
        expect(alert.value.message).toContain('Erro');
    });

    it('deleteItem should call service.delete after confirmation', async () => {
        // Stub confirm in happy-dom
        globalThis.confirm = vi.fn(() => true);

        const { deleteItem } = useCrudView(service, labels);

        await deleteItem(1);

        expect(service.delete).toHaveBeenCalledWith(1);
        delete globalThis.confirm;
    });

    it('deleteItem should NOT call service.delete when confirmation is cancelled', async () => {
        globalThis.confirm = vi.fn(() => false);

        const { deleteItem } = useCrudView(service, labels);

        await deleteItem(1);

        expect(service.delete).not.toHaveBeenCalled();
        delete globalThis.confirm;
    });

    it('showAlert should set alert values', () => {
        const { showAlert, alert } = useCrudView(service, labels);

        showAlert('warning', 'Test warning');

        expect(alert.value.type).toBe('warning');
        expect(alert.value.message).toBe('Test warning');
    });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseModal from '../../src/components/common/BaseModal.vue';
import { resetModalStackForTests } from '../../src/composables/useEscapeKey';

describe('BaseModal — LIFO Escape stack & scroll-lock reference counting', () => {
    beforeEach(() => {
        resetModalStackForTests();
    });

    it('locks body scroll when opened and unlocks when closed', async () => {
        const wrapper = mount(BaseModal, {
            props: { show: true, title: 'Modal 1' }
        });

        expect(document.body.style.overflow).toBe('hidden');

        await wrapper.setProps({ show: false });
        expect(document.body.style.overflow).toBe('');
        wrapper.unmount();
    });

    it('does not intercept Escape when mounted with show=false', () => {
        const openModal = mount(BaseModal, {
            props: { show: true, title: 'Open Modal' }
        });
        const hiddenGlobalModal = mount(BaseModal, {
            props: { show: false, title: 'Hidden Confirm Modal' }
        });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(openModal.emitted('close')).toHaveLength(1);
        expect(hiddenGlobalModal.emitted('close')).toBeUndefined();

        openModal.unmount();
        hiddenGlobalModal.unmount();
    });

    it('closes only the topmost modal on Escape and preserves body scroll-lock while parent modal remains open', async () => {
        // ConfirmModal is mounted globally first with show=false
        const confirmModal = mount(BaseModal, {
            props: { show: false, title: 'Confirm Delete' }
        });

        // Parent modal opens
        const parentModal = mount(BaseModal, {
            props: { show: true, title: 'Parent Form Modal' }
        });
        expect(document.body.style.overflow).toBe('hidden');

        // ConfirmModal opens on top of parentModal
        await confirmModal.setProps({ show: true });
        expect(document.body.style.overflow).toBe('hidden');

        // First Escape press: only ConfirmModal should emit 'close'
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(confirmModal.emitted('close')).toHaveLength(1);
        expect(parentModal.emitted('close')).toBeUndefined();

        // ConfirmModal closes; parentModal is still open so body scroll must remain locked
        await confirmModal.setProps({ show: false });
        expect(document.body.style.overflow).toBe('hidden');

        // Second Escape press: now parentModal should emit 'close'
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(parentModal.emitted('close')).toHaveLength(1);

        await parentModal.setProps({ show: false });
        expect(document.body.style.overflow).toBe('');

        confirmModal.unmount();
        parentModal.unmount();
    });
});

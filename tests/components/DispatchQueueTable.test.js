import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DispatchQueueTable from '@/components/messages/DispatchQueueTable.vue';

describe('DispatchQueueTable.vue', () => {
  const normalHighPriorityMessage = {
    id: 31,
    targetName: 'Helenice De Paula Silva',
    targetPhone: '31988442954',
    originType: 'REBOOKING',
    targetType: 'CLIENT',
    status: 'SENT',
    priority: 600, // Service price was R$ 600,00
    messageText: 'Olá Helenice, tudo bem? Vamos agendar seu skyn...',
    approvedByProfessionalId: 1,
    approvedAt: '2026-09-24T10:41:45',
    sentAt: '2026-09-24T10:44:00',
    metadata: JSON.stringify({
      clientId: 559,
      serviceName: 'skyn booster'
    })
  };

  const trueOverflowMessage = {
    id: 32,
    targetName: 'Cliente Transbordo',
    targetPhone: '31999999999',
    originType: 'REBOOKING',
    targetType: 'CLIENT',
    status: 'SCHEDULED',
    priority: 10600,
    messageText: 'Olá! Mensagem rolada para o dia seguinte.',
    overflow: true,
    metadata: JSON.stringify({
      overflow: true
    })
  };

  it('does NOT render TRANSBORDO badge for regular messages even if priority >= 10', () => {
    const wrapper = mount(DispatchQueueTable, {
      props: {
        messages: [normalHighPriorityMessage]
      }
    });

    expect(wrapper.text()).toContain('Helenice De Paula Silva');
    expect(wrapper.text()).not.toContain('TRANSBORDO');
  });

  it('renders TRANSBORDO badge only when message is actually marked with overflow', () => {
    const wrapper = mount(DispatchQueueTable, {
      props: {
        messages: [trueOverflowMessage]
      }
    });

    expect(wrapper.text()).toContain('Cliente Transbordo');
    expect(wrapper.text()).toContain('TRANSBORDO');
  });

  it('emits view event when clicking the "Ver" action button', async () => {
    const wrapper = mount(DispatchQueueTable, {
      props: {
        messages: [normalHighPriorityMessage]
      }
    });

    const viewBtn = wrapper.find('button[title="Visualizar Detalhes"]');
    expect(viewBtn.exists()).toBe(true);

    await viewBtn.trigger('click');
    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')[0][0].id).toBe(31);
  });

  it('emits view event when clicking the table row', async () => {
    const wrapper = mount(DispatchQueueTable, {
      props: {
        messages: [normalHighPriorityMessage]
      }
    });

    const row = wrapper.find(`#dispatch-row-${normalHighPriorityMessage.id}`);
    expect(row.exists()).toBe(true);

    await row.trigger('click');
    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')[0][0].id).toBe(31);
  });
});

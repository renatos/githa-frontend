import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DispatchMessageCard from '@/components/messages/DispatchMessageCard.vue';

vi.mock('@/services/enumService', () => ({
  enumService: {
    getDescription: vi.fn().mockResolvedValue('Retorno / Rebooking')
  }
}));

describe('DispatchMessageCard.vue', () => {
  const baseMessage = {
    id: 1,
    targetName: 'Ana Paula Silva',
    targetPhone: '31993245157',
    originType: 'REBOOKING',
    status: 'PENDING_APPROVAL',
    messageText: 'Olá Ana Paula! Está quase na hora do retorno.',
    metadata: {
      clientId: 10,
      serviceId: 20,
      serviceName: 'Design de Sobrancelhas',
      displayTags: [
        { label: 'Última Visita', value: '15/08/2026 (há 39 dias)' },
        { label: 'Procedimento', value: 'Design de Sobrancelhas' },
        { label: 'Valor Previsto', value: 'R$ 85,00' }
      ]
    }
  };

  it('renders dynamic displayTags when present in metadata', () => {
    const wrapper = mount(DispatchMessageCard, {
      props: {
        message: baseMessage,
        professionals: []
      }
    });

    const tags = wrapper.findAll('.flex.flex-wrap.gap-2 span.inline-flex');
    expect(tags.length).toBe(3);

    expect(wrapper.text()).toContain('Última Visita:');
    expect(wrapper.text()).toContain('15/08/2026 (há 39 dias)');
    expect(wrapper.text()).toContain('Procedimento:');
    expect(wrapper.text()).toContain('Design de Sobrancelhas');
    expect(wrapper.text()).toContain('Valor Previsto:');
    expect(wrapper.text()).toContain('R$ 85,00');
  });

  it('renders dynamic displayTags when metadata is a JSON string', () => {
    const messageWithStringMetadata = {
      ...baseMessage,
      metadata: JSON.stringify(baseMessage.metadata)
    };

    const wrapper = mount(DispatchMessageCard, {
      props: {
        message: messageWithStringMetadata,
        professionals: []
      }
    });

    expect(wrapper.text()).toContain('Valor Previsto:');
    expect(wrapper.text()).toContain('R$ 85,00');
  });

  it('does not render displayTags container when displayTags is empty or missing', () => {
    const messageWithoutTags = {
      ...baseMessage,
      metadata: {
        clientId: 10,
        serviceName: 'Design de Sobrancelhas'
      }
    };

    const wrapper = mount(DispatchMessageCard, {
      props: {
        message: messageWithoutTags,
        professionals: []
      }
    });

    expect(wrapper.find('.flex.flex-wrap.gap-2.mt-2').exists()).toBe(false);
  });

  it('renders dynamic origin label for FOLLOW_UP', () => {
    const followUpMessage = {
      ...baseMessage,
      originType: 'FOLLOW_UP'
    };

    const wrapper = mount(DispatchMessageCard, {
      props: {
        message: followUpMessage,
        professionals: []
      }
    });

    expect(wrapper.text()).toContain('Acompanhamento');
  });

  it('updates origin label when enumService returns description', async () => {
    const wrapper = mount(DispatchMessageCard, {
      props: {
        message: baseMessage,
        professionals: []
      }
    });

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Retorno / Rebooking');
    });
  });

  it('emits approve event with message id and text', async () => {
    const wrapper = mount(DispatchMessageCard, {
      props: {
        message: baseMessage,
        professionals: []
      }
    });

    const approveBtn = wrapper.findAll('button').find(b => b.text().includes('Aprovar'));
    expect(approveBtn).toBeDefined();

    await approveBtn.trigger('click');

    await vi.waitFor(() => {
      expect(wrapper.emitted('approve')).toBeTruthy();
    });
    expect(wrapper.emitted('approve')[0][0].id).toBe(1);
    expect(wrapper.emitted('approve')[0][0].customMessageText).toBe('Olá Ana Paula! Está quase na hora do retorno.');
  });
});

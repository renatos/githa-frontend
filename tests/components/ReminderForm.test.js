import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReminderForm from '@/components/dashboard/ReminderForm.vue';
import { dispatchMessageService } from '@/services/dispatchMessageService';
import { messageTemplateService } from '@/services/messageTemplateService';
import { professionalService } from '@/services/professionalService';
import { enumService } from '@/services/enumService';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('ReminderForm.vue - Fase 2 Unification', () => {
  const mockReminder = {
    id: 101,
    type: 'FOLLOW_UP',
    status: 'NEW',
    message: 'Mensagem inicial de acompanhamento',
    client: {
      id: 5,
      name: 'Márcia Silva',
      phone: '31999998888',
      personalData: { gender: 'FEMALE' }
    },
    service: {
      id: 12,
      name: 'Design de Sobrancelhas',
      followUpDays: 7,
      idealReturnDays: 30
    },
    contactResponsible: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(professionalService, 'getAll').mockResolvedValue({ data: [] });
    vi.spyOn(enumService, 'getOptions').mockResolvedValue([
      { name: 'NEW', description: 'Novo' },
      { name: 'NOTIFIED', description: 'Notificado' },
      { name: 'DECLINED', description: 'Declinado' }
    ]);
    vi.spyOn(messageTemplateService, 'getAll').mockResolvedValue([
      {
        id: 'tmpl-1',
        name: 'Pós-Design Satisfação',
        content: 'Olá {nome}! Já fazem {dias} dias do seu {servico}. Ficou {satisfacao}? Avalie: {link_avaliacao}',
        isDefault: true,
        originType: 'FOLLOW_UP'
      }
    ]);
  });

  it('does NOT render legacy BaseWhatsAppButton', async () => {
    vi.spyOn(dispatchMessageService, 'getHistoryByOrigin').mockResolvedValue([]);
    const wrapper = mount(ReminderForm, {
      props: { reminder: mockReminder },
      global: {
        stubs: {
          teleport: true
        }
      }
    });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'BaseWhatsAppButton' }).exists()).toBe(false);
  });

  it('renders "Enfileirar no Hub" button when reminder is not yet queued', async () => {
    vi.spyOn(dispatchMessageService, 'getHistoryByOrigin').mockResolvedValue([]);
    const wrapper = mount(ReminderForm, {
      props: { reminder: mockReminder },
      global: {
        stubs: {
          teleport: true
        }
      }
    });
    await flushPromises();

    const enqueueBtn = wrapper.findAll('button').find(b => b.text().includes('Enfileirar no Hub'));
    expect(enqueueBtn).toBeDefined();
    expect(enqueueBtn.attributes('disabled')).toBeUndefined();
  });

  it('calls enqueueFromReminder and updates activeDispatch when clicking "Enfileirar no Hub"', async () => {
    vi.spyOn(dispatchMessageService, 'getHistoryByOrigin').mockResolvedValue([]);
    const enqueueSpy = vi.spyOn(dispatchMessageService, 'enqueueFromReminder').mockResolvedValue({
      dispatchMessage: {
        id: 777,
        status: 'PENDING_APPROVAL',
        scheduledAt: null
      },
      alreadyQueued: false
    });

    const wrapper = mount(ReminderForm, {
      props: { reminder: mockReminder },
      global: {
        stubs: {
          teleport: true
        }
      }
    });
    await flushPromises();

    const enqueueBtn = wrapper.findAll('button').find(b => b.text().includes('Enfileirar no Hub'));
    await enqueueBtn.trigger('click');
    await flushPromises();

    expect(enqueueSpy).toHaveBeenCalledWith(101, {
      customMessageText: 'Mensagem inicial de acompanhamento'
    });

    const queuedBtn = wrapper.findAll('button').find(b => b.text().includes('Na Fila do Hub'));
    expect(queuedBtn).toBeDefined();
    expect(wrapper.text()).toContain('Mensagem aguardando aprovação no Hub');
  });

  it('displays status banner and queued button if reminder is already queued in Hub', async () => {
    vi.spyOn(dispatchMessageService, 'getHistoryByOrigin').mockResolvedValue([
      {
        id: 55,
        status: 'SCHEDULED',
        scheduledAt: '2026-09-23T16:00:00Z'
      }
    ]);

    const wrapper = mount(ReminderForm, {
      props: { reminder: mockReminder },
      global: {
        stubs: {
          teleport: true
        }
      }
    });
    await flushPromises();

    expect(wrapper.text()).toContain('Envio agendado na fila do Hub');
    const queuedBtn = wrapper.findAll('button').find(b => b.text().includes('Na Fila do Hub'));
    expect(queuedBtn).toBeDefined();
  });

  it('interpolates template placeholders when selecting a Hub template', async () => {
    vi.spyOn(dispatchMessageService, 'getHistoryByOrigin').mockResolvedValue([]);
    const wrapper = mount(ReminderForm, {
      props: { reminder: mockReminder },
      global: {
        stubs: {
          teleport: true
        }
      }
    });
    await flushPromises();

    const select = wrapper.find('select[title="Aplicar modelo de mensagem cadastrado no Hub"]');
    expect(select.exists()).toBe(true);

    await select.setValue('tmpl-1');

    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toContain('Olá Márcia!');
    expect(textarea.element.value).toContain('7 dias');
    expect(textarea.element.value).toContain('Design de Sobrancelhas');
    expect(textarea.element.value).toContain('satisfeita');
    expect(textarea.element.value).toContain('https://g.page/r/CW-rcCV825eOEBM/review');
  });

  it('navigates to /messages when clicking "Ver no Hub"', async () => {
    vi.spyOn(dispatchMessageService, 'getHistoryByOrigin').mockResolvedValue([
      {
        id: 55,
        status: 'PENDING_APPROVAL'
      }
    ]);

    const wrapper = mount(ReminderForm, {
      props: { reminder: mockReminder },
      global: {
        stubs: {
          teleport: true
        }
      }
    });
    await flushPromises();

    const viewHubBtn = wrapper.findAll('button').find(b => b.text().includes('Ver no Hub'));
    expect(viewHubBtn).toBeDefined();

    await viewHubBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith('/messages');
  });
});

import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppointmentForm from '../../src/components/AppointmentForm.vue';
import { confirmBridge } from '../../src/services/confirmBridge';
import { authService } from '../../src/services/authService';
import { enumService } from '../../src/services/enumService';
import { appointmentService } from '../../src/services/appointmentService';
import { serviceService } from '../../src/services/serviceService';
import { clientService } from '../../src/services/clientService';

vi.mock('../../src/services/confirmBridge', () => ({
  confirmBridge: {
    alert: vi.fn(),
    confirm: vi.fn()
  }
}));

vi.mock('../../src/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(() => ({ roles: ['ADMIN'], email: 'admin@githa.com' }))
  }
}));

vi.mock('../../src/services/enumService', () => ({
  enumService: {
    getOptions: vi.fn(() => Promise.resolve([
      { name: 'SCHEDULED', description: 'Agendado' },
      { name: 'CONFIRMED', description: 'Confirmado' },
      { name: 'COMPLETED', description: 'Concluído' },
      { name: 'CANCELED', description: 'Cancelado' },
      { name: 'MISSED', description: 'Não compareceu' }
    ]))
  }
}));

vi.mock('../../src/services/appointmentService', () => ({
  appointmentService: {
    getById: vi.fn(() => Promise.resolve({ data: null })),
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  }
}));

vi.mock('../../src/services/serviceService', () => ({
  serviceService: {
    getById: vi.fn(() => Promise.resolve({ data: null }))
  }
}));

vi.mock('../../src/services/clientService', () => ({
  clientService: {
    getById: vi.fn(() => Promise.resolve({ data: null })),
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  }
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

describe('AppointmentForm.vue - Transaction Status Lock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('locks status select and displays transaction badge when transactionId is present', async () => {
    const appointment = {
      id: 50,
      clientId: 10,
      clientName: 'Cliente Teste',
      serviceId: 2,
      serviceName: 'Limpeza',
      professionalId: 3,
      professionalName: 'Dra. Maria',
      startTime: '2026-10-15T14:00:00',
      endTime: '2026-10-15T15:00:00',
      status: 'COMPLETED',
      price: 150,
      transactionId: 2120
    };

    appointmentService.getById.mockResolvedValueOnce({
      data: { ...appointment }
    });

    const wrapper = mount(AppointmentForm, {
      props: { appointment },
      global: {
        stubs: {
          BaseModal: {
            template: '<div><slot name="header-content"></slot><slot></slot><slot name="footer"></slot></div>'
          },
          BaseLookup: true,
          TransactionDiscountModal: true,
          AppointmentGroupStatusModal: true,
          ClientForm: true,
          ProfessionalForm: true,
          ServiceForm: true
        }
      }
    });

    // Wait for onMounted
    await new Promise(r => setTimeout(r, 20));

    expect(wrapper.text()).toContain('Vinculado à Transação #2120');
    expect(wrapper.text()).toContain('Transação vinculada #2120');
    expect(wrapper.text()).toContain('Status bloqueado: Este agendamento possui a transação financeira #2120 vinculada');

    const select = wrapper.find('select');
    expect(select.attributes('disabled')).toBeDefined();
  });

  it('prevents saving if status is downgraded away from COMPLETED on transaction-linked appointment', async () => {
    const appointment = {
      id: 50,
      clientId: 10,
      clientName: 'Cliente Teste',
      serviceId: 2,
      serviceName: 'Limpeza',
      professionalId: 3,
      professionalName: 'Dra. Maria',
      startTime: '2026-10-15T14:00:00',
      endTime: '2026-10-15T15:00:00',
      status: 'COMPLETED',
      price: 150,
      transactionId: 2120
    };

    appointmentService.getById.mockResolvedValueOnce({
      data: { ...appointment }
    });

    const wrapper = mount(AppointmentForm, {
      props: { appointment },
      global: {
        stubs: {
          BaseModal: {
            template: '<div><slot name="header-content"></slot><slot></slot><slot name="footer"></slot></div>'
          },
          BaseLookup: true,
          TransactionDiscountModal: true,
          AppointmentGroupStatusModal: true,
          ClientForm: true,
          ProfessionalForm: true,
          ServiceForm: true
        }
      }
    });

    await new Promise(r => setTimeout(r, 20));

    // Forcefully try to set form.status to SCHEDULED
    wrapper.vm.form.status = 'SCHEDULED';
    await wrapper.vm.save();

    expect(confirmBridge.alert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Status Bloqueado'
    }));
    expect(wrapper.emitted('save')).toBeUndefined();
  });

  it('emits single appointment DTO with groupId: null when user chooses SINGLE on session status change', async () => {
    const groupId = '11111111-2222-3333-4444-555555555555';
    const appt1 = {
      id: 1692,
      groupId,
      clientId: 10,
      clientName: 'Daniel Resende',
      serviceId: 2,
      serviceName: 'Limpeza de Pele',
      professionalId: 3,
      professionalName: 'Thaís',
      startTime: '2026-10-22T09:00:00',
      endTime: '2026-10-22T10:30:00',
      status: 'PENDING_BILLING',
      price: 150
    };
    const appt2 = {
      id: 1693,
      groupId,
      clientId: 10,
      clientName: 'Daniel Resende',
      serviceId: 3,
      serviceName: 'Remoção',
      professionalId: 4,
      professionalName: 'Giselle',
      startTime: '2026-10-22T10:30:00',
      endTime: '2026-10-22T11:00:00',
      status: 'PENDING_BILLING',
      price: 80
    };

    appointmentService.getById.mockResolvedValueOnce({ data: { ...appt1 } });
    appointmentService.getAll.mockResolvedValueOnce({ data: { content: [appt1, appt2] } });

    const wrapper = mount(AppointmentForm, {
      props: { appointment: appt1 },
      global: {
        stubs: {
          BaseModal: {
            template: '<div><slot name="header-content"></slot><slot></slot><slot name="footer"></slot></div>'
          },
          BaseLookup: true,
          TransactionDiscountModal: true,
          AppointmentGroupStatusModal: true,
          ClientForm: true,
          ProfessionalForm: true,
          ServiceForm: true
        }
      }
    });

    await new Promise(r => setTimeout(r, 20));

    wrapper.vm.form.status = 'COMPLETED';
    wrapper.vm.handleGroupStatusChoice('SINGLE');

    const emitted = wrapper.emitted('save');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual(expect.objectContaining({
      id: 1692,
      groupId: null,
      status: 'COMPLETED'
    }));
    expect(emitted[0][0].items).toBeUndefined();
  });

  it('emits single appointment DTO with session groupId when user chooses ALL on session status change', async () => {
    const groupId = '11111111-2222-3333-4444-555555555555';
    const appt1 = {
      id: 1692,
      groupId,
      clientId: 10,
      clientName: 'Daniel Resende',
      serviceId: 2,
      serviceName: 'Limpeza de Pele',
      professionalId: 3,
      professionalName: 'Thaís',
      startTime: '2026-10-22T09:00:00',
      endTime: '2026-10-22T10:30:00',
      status: 'PENDING_BILLING',
      price: 150
    };
    const appt2 = {
      id: 1693,
      groupId,
      clientId: 10,
      clientName: 'Daniel Resende',
      serviceId: 3,
      serviceName: 'Remoção',
      professionalId: 4,
      professionalName: 'Giselle',
      startTime: '2026-10-22T10:30:00',
      endTime: '2026-10-22T11:00:00',
      status: 'PENDING_BILLING',
      price: 80
    };

    appointmentService.getById.mockResolvedValueOnce({ data: { ...appt1 } });
    appointmentService.getAll.mockResolvedValueOnce({ data: { content: [appt1, appt2] } });

    const wrapper = mount(AppointmentForm, {
      props: { appointment: appt1 },
      global: {
        stubs: {
          BaseModal: {
            template: '<div><slot name="header-content"></slot><slot></slot><slot name="footer"></slot></div>'
          },
          BaseLookup: true,
          TransactionDiscountModal: true,
          AppointmentGroupStatusModal: true,
          ClientForm: true,
          ProfessionalForm: true,
          ServiceForm: true
        }
      }
    });

    await new Promise(r => setTimeout(r, 20));

    wrapper.vm.form.status = 'COMPLETED';
    wrapper.vm.handleGroupStatusChoice('ALL');

    const emitted = wrapper.emitted('save');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual(expect.objectContaining({
      id: 1692,
      groupId,
      status: 'COMPLETED'
    }));
    expect(emitted[0][0].items).toBeUndefined();
  });
});

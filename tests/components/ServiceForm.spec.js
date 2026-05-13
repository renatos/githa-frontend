import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ServiceForm from '../../src/components/ServiceForm.vue';

describe('ServiceForm.vue Component', () => {
  it('renders procedure details textarea and binds reactive state', async () => {
    const service = {
      id: 1,
      name: 'Limpeza de Pele',
      procedureDetails: 'Passo 1: Higienização\nPasso 2: Esfoliação',
      price: 100,
      durationMinutes: 45
    };

    const wrapper = mount(ServiceForm, {
      props: { service },
      global: {
        stubs: {
          BaseModal: {
            template: '<div><slot name="sub-header"></slot><slot></slot><slot name="footer"></slot></div>'
          },
          CurrencyInput: true,
          TabNavigation: true
        }
      }
    });

    expect(wrapper.vm.form.procedureDetails).toBe('Passo 1: Higienização\nPasso 2: Esfoliação');

    wrapper.vm.form.procedureDetails = 'Nova instrução técnica';
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted()).toHaveProperty('save');
    expect(wrapper.emitted('save')[0][0].procedureDetails).toBe('Nova instrução técnica');
  });
});

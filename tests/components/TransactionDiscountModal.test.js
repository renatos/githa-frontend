import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TransactionDiscountModal from '@/components/financial/TransactionDiscountModal.vue';

describe('TransactionDiscountModal.vue', () => {
  const sampleItems = [
    {
      id: 1,
      type: 'SERVICE',
      serviceName: 'Despig. quí. de Sobran.',
      unitPrice: 150.00,
      quantity: 1,
      subtotal: 150.00,
      discountAmount: 0,
      netAmount: 150.00
    }
  ];

  const mountModal = (props) => {
    return mount(TransactionDiscountModal, {
      props,
      global: {
        stubs: {
          teleport: true
        }
      }
    });
  };

  it('deve inicializar com o subtotal correto quando repassado via prop items', () => {
    const wrapper = mountModal({
      show: true,
      items: sampleItems
    });

    expect(wrapper.text()).toContain('R$\xa0150,00');
    expect(wrapper.text()).toContain('Subtotal Original');
  });

  it('deve aceitar prop alternativa saleItems por compatibilidade', () => {
    const wrapper = mountModal({
      show: true,
      saleItems: sampleItems
    });

    expect(wrapper.text()).toContain('R$\xa0150,00');
  });

  it('deve aplicar desconto total em valor monetário e emitir evento apply', async () => {
    const wrapper = mountModal({
      show: true,
      items: sampleItems
    });

    const buttons = wrapper.findAll('button');
    const applyButton = buttons.find(b => b.text().includes('Aplicar Desconto'));
    expect(applyButton).toBeDefined();

    await applyButton.trigger('click');

    expect(wrapper.emitted('apply')).toBeTruthy();
    const appliedData = wrapper.emitted('apply')[0][0];
    expect(appliedData.finalAmount).toBe(150.00);
    expect(appliedData.itemsWithDiscount).toHaveLength(1);
    expect(appliedData.itemsWithDiscount[0].id).toBe(1);
  });

  it('deve emitir remove e clear ao remover desconto', async () => {
    const wrapper = mountModal({
      show: true,
      items: sampleItems,
      currentDiscount: {
        mode: 'TOTAL',
        type: 'CURRENCY',
        value: 15.00,
        totalDiscountAmount: 15.00,
        totalDiscountPercentage: 10.00
      }
    });

    const buttons = wrapper.findAll('button');
    const removeButton = buttons.find(b => b.text().includes('Remover Desconto'));
    expect(removeButton).toBeDefined();

    await removeButton.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('clear')).toBeTruthy();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('deve exibir subtítulo customizado quando repassado', () => {
    const wrapper = mountModal({
      show: true,
      items: sampleItems,
      subtitle: 'Sessão de Procedimentos'
    });

    expect(wrapper.text()).toContain('Sessão de Procedimentos');
  });
});

import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useSaleTransaction } from '@/composables/useSaleTransaction';

describe('useSaleTransaction Discount Management', () => {
  it('deve reconstruir desconto no TOTAL quando transação possui originalAmount maior que amount', () => {
    const form = ref({
      amount: 48.89,
      originalAmount: 50.00,
      discountPercentage: 2.22
    });
    const paymentSplits = ref([{ amount: 48.89, originalAmount: 50.00 }]);
    const isSplitPayment = ref(false);
    const saleTransactionRef = ref(null);
    const emit = () => {};

    const {
      saleItems,
      discountSummary,
      initDiscountFromTransaction
    } = useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit);

    // Itens carregados da venda existente
    saleItems.value = [
      {
        id: 1,
        type: 'SERVICE',
        serviceName: 'Corte de Cabelo Masculino',
        unitPrice: 50.00,
        quantity: 1,
        subtotal: 50.00,
        discountAmount: 0,
        netAmount: 50.00
      }
    ];

    initDiscountFromTransaction({
      originalAmount: 50.00,
      amount: 48.89,
      discountPercentage: 2.22
    });

    expect(discountSummary.value).not.toBeNull();
    expect(discountSummary.value.mode).toBe('TOTAL');
    expect(discountSummary.value.totalDiscountAmount).toBe(1.11);
    expect(discountSummary.value.totalDiscountPercentage).toBe(2.22);
    expect(saleItems.value[0].discountAmount).toBe(1.11);
    expect(saleItems.value[0].netAmount).toBe(48.89);
  });

  it('deve reconstruir desconto por ITEM quando itens possuem discountAmount > 0', () => {
    const form = ref({
      amount: 40.00,
      originalAmount: 50.00
    });
    const paymentSplits = ref([{ amount: 40.00 }]);
    const isSplitPayment = ref(false);
    const saleTransactionRef = ref(null);
    const emit = () => {};

    const {
      saleItems,
      discountSummary,
      initDiscountFromTransaction
    } = useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit);

    saleItems.value = [
      {
        id: 1,
        type: 'SERVICE',
        serviceName: 'Barba',
        unitPrice: 50.00,
        quantity: 1,
        subtotal: 50.00,
        discountAmount: 10.00,
        netAmount: 40.00
      }
    ];

    initDiscountFromTransaction({
      originalAmount: 50.00,
      amount: 40.00
    });

    expect(discountSummary.value).not.toBeNull();
    expect(discountSummary.value.mode).toBe('ITEM');
    expect(discountSummary.value.totalDiscountAmount).toBe(10.00);
    expect(discountSummary.value.totalDiscountPercentage).toBe(20.00);
  });

  it('deve manter discountSummary como null quando não há nenhum desconto', () => {
    const form = ref({
      amount: 50.00,
      originalAmount: 50.00
    });
    const paymentSplits = ref([{ amount: 50.00 }]);
    const isSplitPayment = ref(false);
    const saleTransactionRef = ref(null);
    const emit = () => {};

    const {
      saleItems,
      discountSummary,
      initDiscountFromTransaction
    } = useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit);

    saleItems.value = [
      {
        id: 1,
        type: 'SERVICE',
        serviceName: 'Corte',
        unitPrice: 50.00,
        quantity: 1,
        subtotal: 50.00,
        discountAmount: 0,
        netAmount: 50.00
      }
    ];

    initDiscountFromTransaction({
      originalAmount: 50.00,
      amount: 50.00
    });

    expect(discountSummary.value).toBeNull();
  });

  it('deve remover desconto e restaurar valores brutos ao chamar removeDiscount', () => {
    const form = ref({
      amount: 45.00,
      originalAmount: 50.00
    });
    const paymentSplits = ref([{ amount: 45.00, originalAmount: 50.00 }]);
    const isSplitPayment = ref(false);
    const saleTransactionRef = ref(null);
    const emit = () => {};

    const {
      saleItems,
      discountSummary,
      initDiscountFromTransaction,
      removeDiscount
    } = useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit);

    saleItems.value = [
      {
        id: 1,
        type: 'PRODUCT',
        productName: 'Pomada',
        unitPrice: 50.00,
        quantity: 1,
        subtotal: 50.00,
        discountAmount: 5.00,
        netAmount: 45.00
      }
    ];

    initDiscountFromTransaction({ originalAmount: 50.00, amount: 45.00 });
    expect(discountSummary.value).not.toBeNull();

    removeDiscount();

    expect(discountSummary.value).toBeNull();
    expect(saleItems.value[0].discountAmount).toBe(0);
    expect(saleItems.value[0].netAmount).toBe(50.00);
    expect(form.value.amount).toBe(50.00);
    expect(form.value.originalAmount).toBe(50.00);
  });
});

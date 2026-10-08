import { ref } from 'vue';
import productService from '@/services/productService';
import { appointmentService } from '@/services/appointmentService';
import { saleService } from '@/services/saleService';
import { confirmBridge } from '@/services/confirmBridge';
import { Money } from '@/utils/Money';

export function useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit) {
  const saleItems = ref([]);
  const autoFilledMessage = ref('');
  const discountSummary = ref(null);
  const isDiscountModalOpen = ref(false);

  const calculateAmountFromItems = () => {
    const grossTotal = saleItems.value.reduce(
      (acc, item) => acc.plus(Money.of(item.unitPrice).times(item.quantity || 1)),
      Money.zero()
    );
    form.value.originalAmount = grossTotal.toNumber();

    if (discountSummary.value && discountSummary.value.totalDiscountAmount > 0) {
      const discount = Money.of(discountSummary.value.totalDiscountAmount);
      const finalAmount = grossTotal.applyDiscount(discount);
      form.value.amount = finalAmount.toNumber();
      form.value.discountPercentage = grossTotal.calculateDiscountPercentage(discount);
    } else {
      form.value.amount = grossTotal.toNumber();
      form.value.discountPercentage = null;
    }
  };

  const addSaleItem = (item) => {
    const unitPrice = Money.of(item.unitPrice);
    const subtotal = unitPrice.times(item.quantity || 1);
    saleItems.value.push({
      ...item,
      id: Date.now(),
      unitPrice: unitPrice.toNumber(),
      discountAmount: 0,
      netAmount: subtotal.toNumber()
    });
    autoFilledMessage.value = '';
    calculateAmountFromItems();
  };

  const removeSaleItem = (index) => {
    saleItems.value.splice(index, 1);
    if (saleItems.value.length === 0) {
      discountSummary.value = null;
    }
    calculateAmountFromItems();
  };

  const openDiscountModal = () => {
    if (saleItems.value.length === 0) {
      confirmBridge.alert({
        title: 'Nenhum item na venda',
        message: 'Adicione pelo menos um produto ou serviço à venda antes de aplicar descontos.',
        type: 'warning'
      });
      return;
    }
    isDiscountModalOpen.value = true;
  };

  const closeDiscountModal = () => {
    isDiscountModalOpen.value = false;
  };

  const applyDiscount = (discountData) => {
    discountSummary.value = discountData;
    if (discountData.itemsWithDiscount && discountData.itemsWithDiscount.length > 0) {
      discountData.itemsWithDiscount.forEach(updatedItem => {
        const target = saleItems.value.find(it => it.id === updatedItem.id);
        if (target) {
          target.discountAmount = updatedItem.discountAmount;
          target.netAmount = updatedItem.netAmount;
        }
      });
    }
    calculateAmountFromItems();

    if (!isSplitPayment.value && paymentSplits.value && paymentSplits.value.length === 1) {
      paymentSplits.value[0].amount = form.value.amount;
      paymentSplits.value[0].originalAmount = form.value.amount;
    }
  };

  const removeDiscount = () => {
    discountSummary.value = null;
    saleItems.value.forEach(item => {
      item.discountAmount = 0;
      item.netAmount = Money.of(item.unitPrice).times(item.quantity || 1).toNumber();
    });
    calculateAmountFromItems();

    if (!isSplitPayment.value && paymentSplits.value && paymentSplits.value.length === 1) {
      paymentSplits.value[0].amount = form.value.amount;
      paymentSplits.value[0].originalAmount = form.value.amount;
    }
  };

  const initDiscountFromTransaction = (transaction) => {
    if (!transaction) return;

    const grossTotal = saleItems.value.reduce(
      (acc, item) => acc.plus(Money.of(item.unitPrice).times(item.quantity || 1)),
      Money.zero()
    );

    // 1. Checa se há descontos explícitos nos itens
    const hasItemDiscount = saleItems.value.some(it => it.discountAmount && Money.of(it.discountAmount).isPositive());

    if (hasItemDiscount) {
      const totalDisc = saleItems.value.reduce(
        (acc, it) => acc.plus(Money.of(it.discountAmount || 0)),
        Money.zero()
      );
      const totalPct = grossTotal.isPositive() ? grossTotal.calculateDiscountPercentage(totalDisc) : 0;
      
      discountSummary.value = {
        mode: 'ITEM',
        type: 'CURRENCY',
        value: totalDisc.toNumber(),
        totalDiscountAmount: totalDisc.toNumber(),
        totalDiscountPercentage: totalPct,
        itemsWithDiscount: saleItems.value.map(it => {
          const subtotal = Money.of(it.unitPrice).times(it.quantity || 1);
          const disc = Money.of(it.discountAmount || 0);
          return {
            ...it,
            discountAmount: disc.toNumber(),
            netAmount: it.netAmount ? Money.of(it.netAmount).toNumber() : subtotal.applyDiscount(disc).toNumber()
          };
        }),
        finalAmount: grossTotal.applyDiscount(totalDisc).toNumber()
      };
      return;
    }

    // 2. Checa se há desconto comercial geral na transação
    const origMoney = transaction.originalAmount ? Money.of(transaction.originalAmount) : grossTotal;
    const currentAmount = transaction.amount != null ? Money.of(transaction.amount) : null;

    let totalDiscountAmount = Money.zero();
    let discountPct = transaction.discountPercentage || 0;

    if (currentAmount && origMoney.isGreaterThan(currentAmount)) {
      totalDiscountAmount = origMoney.minus(currentAmount);
      if (!discountPct && origMoney.isPositive()) {
        discountPct = origMoney.calculateDiscountPercentage(totalDiscountAmount);
      }
    } else if (discountPct > 0 && origMoney.isPositive()) {
      totalDiscountAmount = origMoney.discountAmount(discountPct);
    }

    if (totalDiscountAmount.isPositive()) {
      const totalDiscNum = totalDiscountAmount.toNumber();
      saleItems.value.forEach(item => {
        const itemSubtotal = Money.of(item.unitPrice).times(item.quantity || 1);
        if (origMoney.isPositive() && totalDiscNum > 0) {
          const ratio = itemSubtotal.toNumber() / origMoney.toNumber();
          const itemDisc = totalDiscountAmount.times(ratio);
          item.discountAmount = itemDisc.toNumber();
          item.netAmount = itemSubtotal.applyDiscount(itemDisc).toNumber();
        } else {
          item.discountAmount = 0;
          item.netAmount = itemSubtotal.toNumber();
        }
      });

      discountSummary.value = {
        mode: 'TOTAL',
        type: 'CURRENCY',
        value: totalDiscNum,
        totalDiscountAmount: totalDiscNum,
        totalDiscountPercentage: discountPct,
        itemsWithDiscount: saleItems.value.map(it => ({ ...it })),
        finalAmount: origMoney.applyDiscount(totalDiscountAmount).toNumber()
      };

      form.value.originalAmount = origMoney.toNumber();
      form.value.amount = origMoney.applyDiscount(totalDiscountAmount).toNumber();
      form.value.discountPercentage = discountPct;
    } else {
      discountSummary.value = null;
    }
  };

  const onClientSelect = (item) => {
    form.value.clientId = item.id;
    form.value.clientName = item.name;
    if (!form.value.description) form.value.description = `Venda para ${item.name}`;
    checkForUnbilledAppointments();
  };

  const checkForUnbilledAppointments = async () => {
    autoFilledMessage.value = '';
    if (form.value.clientId) {
      try {
        const response = await appointmentService.getAll({
          'client.id': form.value.clientId,
          status: 'COMPLETED',
          size: 50
        });
        const unbilled = response.data.content.filter(apt =>
          !apt.transactionId && !saleItems.value.some(added => added.appointmentId === apt.id)
        );

        if (unbilled.length > 0) {
          const apt = unbilled[0];
          saleTransactionRef.value?.saleItemsTableRef?.setItemData({
            type: 'SERVICE',
            serviceId: apt.serviceId,
            serviceName: apt.serviceName,
            professionalId: apt.professionalId,
            professionalName: apt.professionalName,
            unitPrice: apt.price || apt.servicePrice || 0,
            appointmentId: apt.id
          });
          autoFilledMessage.value = `Dados preenchidos automaticamente referentes a um agendamento para ${form.value.clientName.split(' ')[0]}.`;
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const saveSale = async (transactionProps) => {
    if (!form.value.clientId) {
      confirmBridge.alert({ title: 'Campo Obrigatório', message: 'O cliente é obrigatório para realizar uma venda.', type: 'warning' });
      return;
    }
    if (saleItems.value.length === 0) {
      confirmBridge.alert({ title: 'Nenhum Item Adicionado', message: 'Adicione pelo menos um produto ou serviço à venda.', type: 'warning' });
      return;
    }

    try {
      const payload = {
        sale: {
          id: form.value.saleId || transactionProps?.id || transactionProps?.saleId || transactionProps?.sale?.id,
          clientId: form.value.clientId,
          notes: form.value.description,
          items: saleItems.value.map(item => ({
            id: typeof item.id === 'number' && item.id > 1700000000000 ? null : item.id,
            type: item.type,
            productId: item.productId,
            serviceId: item.serviceId,
            professionalId: item.professionalId,
            appointmentId: item.appointmentId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            netAmount: item.netAmount || Money.of(item.unitPrice).times(item.quantity || 1).toNumber()
          }))
        },
        transactions: paymentSplits.value.map(split => {
          let baseDesc = form.value.description || `Venda para ${form.value.clientName}`;
          // Clean up any existing payment method tag from the end to avoid duplication
          baseDesc = baseDesc.replace(/\s*\[[^\]]+\]\s*$/, '').trim();

          return {
            ...form.value,
            id: split.id || null,
            description: baseDesc,
            nature: 'INCOME',
            paymentMethodId: split.paymentMethodId,
            paymentMethodName: split.paymentMethodName,
            amount: split.amount,
            originalAmount: isSplitPayment.value ? split.amount : (form.value.originalAmount || split.amount),
            discountPercentage: form.value.discountPercentage || split.discountPercentage || null,
            status: form.value.status
          };
        })
      };
      await saleService.launchSale(payload);
      emit('save', { refresh: true });
    } catch (error) {
      confirmBridge.alert({
        title: 'Erro ao Lançar Venda',
        message: error.response?.data?.message || error.message,
        type: 'danger'
      });
    }
  };

  // Product lookup adapter
  const productServiceAdapter = {
    getAll: async (params) => {
      const response = await productService.getAll(params);
      let data = Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
      data = data.filter(p => p.active);
      if (params?.name) {
        const lower = params.name.toLowerCase();
        data = data.filter(p => p.name.toLowerCase().includes(lower));
      }
      const enriched = data.map(p => ({
        ...p,
        name: `${p.name} (Estoque: ${p.stockQuantity ?? 0})`
      }));
      return { data: { content: enriched, totalElements: enriched.length } };
    },
    getById: async (id) => {
      const response = await productService.getById(id);
      const p = response.data;
      if (p) p.name = `${p.name} (Estoque: ${p.stockQuantity ?? 0})`;
      return { data: p };
    }
  };

  return {
    saleItems,
    autoFilledMessage,
    discountSummary,
    isDiscountModalOpen,
    openDiscountModal,
    closeDiscountModal,
    applyDiscount,
    removeDiscount,
    initDiscountFromTransaction,
    addSaleItem,
    removeSaleItem,
    calculateAmountFromItems,
    onClientSelect,
    checkForUnbilledAppointments,
    saveSale,
    productServiceAdapter
  };
}

import { ref } from 'vue';
import productService from '@/services/productService';
import { appointmentService } from '@/services/appointmentService';
import { saleService } from '@/services/saleService';
import { confirmBridge } from '@/services/confirmBridge';

export function useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit) {
  const saleItems = ref([]);
  const autoFilledMessage = ref('');

  const addSaleItem = (item) => {
    saleItems.value.push({ ...item, id: Date.now() });
    autoFilledMessage.value = '';
    calculateAmountFromItems();
  };

  const removeSaleItem = (index) => {
    saleItems.value.splice(index, 1);
    calculateAmountFromItems();
  };

  const calculateAmountFromItems = () => {
    const total = saleItems.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    form.value.amount = total;
    form.value.originalAmount = total;
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
            unitPrice: item.unitPrice
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
            originalAmount: split.amount,
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
    addSaleItem,
    removeSaleItem,
    calculateAmountFromItems,
    onClientSelect,
    checkForUnbilledAppointments,
    saveSale,
    productServiceAdapter
  };
}

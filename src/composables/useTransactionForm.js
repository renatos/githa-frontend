import { ref, computed, watch, onMounted } from 'vue';
import financialService from '@/services/financialService';
import { authService } from '@/services/authService';
import { confirmBridge } from '@/services/confirmBridge';
import paymentMethodService from '@/services/paymentMethodService';
import { enumService } from '@/services/enumService';
import creditCardService from '@/services/creditCardService';
import { round2, formatCurrency } from '@/utils/formatters';

export function useTransactionForm(props, emit, form, selectedPaymentMethod, splits, sale) {
  const {
    paymentSplits,
    isSplitPayment,
    splitsSum,
    isSplitsBalanced,
    hasDuplicatePaymentMethods,
    updatePreviousAmounts,
    setIsUpdatingSplits
  } = splits;

  const {
    saleItems,
    saveSale
  } = sale;

  const isAdmin = ref(false);
  const originalStatus = ref('');
  const transactionStatuses = ref([]);
  const accountNatures = ref([]);
  const saleItemTypes = ref([]);
  
  const activeCards = ref([]);
  const selectedSourceCardId = ref(null);
  const cardInstallmentCount = ref(1);

  const launchMode = ref('SALE'); // 'MANUAL' or 'SALE'
  const accountGroups = ref([]);


  const checkUserRole = () => {
    const user = authService.getCurrentUser();
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
  };

  const isAppointmentTransaction = computed(() => !!form.value.appointmentId);

  const canSave = computed(() => {
    if (!props.transaction?.id) return true;
    if (originalStatus.value === 'PAID' && !isAdmin.value) return false;
    return true;
  });

  const isFormValid = computed(() => {
    if (!canSave.value) return false;
    if (launchMode.value === 'SALE') {
      if (isSplitPayment.value) {
        if (!isSplitsBalanced.value || hasDuplicatePaymentMethods.value) return false;
        if (paymentSplits.value.some(s => !s.paymentMethodId)) return false;
      } else {
        if (form.value.status === 'PAID' && !form.value.paymentMethodId) return false;
      }
    }
    if (launchMode.value === 'MANUAL') {
      if (!form.value.description) return false;
    }
    return true;
  });

  const saveTooltip = computed(() => {
    if (!canSave.value) {
      return 'Transação paga, apenas ADMIN pode salvar alterações.';
    }
    if (!isFormValid.value) {
      if (launchMode.value === 'SALE') {
        if (isSplitPayment.value) {
          if (!isSplitsBalanced.value) {
            return `A soma das formas de pagamento (${formatCurrency(splitsSum.value)}) não corresponde ao total da venda (${formatCurrency(form.value.amount || 0)}).`;
          }
          if (hasDuplicatePaymentMethods.value) {
            return 'Existem formas de pagamento duplicadas.';
          }
          if (paymentSplits.value.some(s => !s.paymentMethodId)) {
            return 'Selecione a forma de pagamento para todas as divisões.';
          }
        } else {
          if (form.value.status === 'PAID' && !form.value.paymentMethodId) {
            return 'Selecione a forma de pagamento para a transação paga.';
          }
        }
      }
      if (launchMode.value === 'MANUAL' && !form.value.description) {
        return 'A descrição é obrigatória para lançamentos manuais.';
      }
    }
    return '';
  });

  const onAccountGroupSelect = (item) => {
    form.value.accountGroupId = item?.id;
    form.value.accountGroupName = item?.name || '';
    if (item?.nature) form.value.nature = item.nature;
    if (item && !form.value.description) form.value.description = item.name;
  };

  const onPaymentMethodSelect = (item) => {
    selectedPaymentMethod.value = item;
    form.value.paymentMethodId = item?.id;
    form.value.paymentMethodName = item?.name || '';
    
    if (paymentSplits.value.length === 1) {
      paymentSplits.value[0].paymentMethodId = item?.id;
      paymentSplits.value[0].paymentMethodName = item?.name || '';
      paymentSplits.value[0].amount = form.value.amount;
      paymentSplits.value[0].discountPercentage = item?.discountPercentage;
    }
  };

  const viewAppointment = () => {
    if (form.value.appointmentId) emit('view-appointment', form.value.appointmentId);
  };

  onMounted(async () => {
    checkUserRole();
    transactionStatuses.value = await enumService.getOptions('TransactionStatus');
    accountNatures.value = await enumService.getOptions('AccountNature');
    saleItemTypes.value = await enumService.getOptions('SaleItemType');

    const groupsResponse = await financialService.getAccountGroups();
    const rawGroups = groupsResponse.data || [];
    accountGroups.value = rawGroups.filter(g => g.active && g.classification !== 'CREDIT_CARD');

    try {
      const cardsRes = await creditCardService.getAll();
      activeCards.value = (cardsRes.data || []).filter(c => c.active);
    } catch {
      activeCards.value = [];
    }

    if (props.transaction?.id) {
      form.value = { ...props.transaction };
      originalStatus.value = props.transaction.status;

      if (form.value.description) {
        form.value.description = form.value.description.replace(/\s*\[[^\]]+\]\s*$/, '').trim();
      }

      if (props.transaction.saleId || props.transaction.sale) {
        launchMode.value = 'SALE';
        if (props.transaction.sale?.items) {
          saleItems.value = props.transaction.sale.items.map(item => ({
            ...item,
            type: item.type || (item.productId ? 'PRODUCT' : 'SERVICE')
          }));
        }

        const sId = props.transaction.saleId || props.transaction.sale?.id;
        if (sId) {
          try {
            const res = await financialService.getTransactionsBySaleId(sId);
            if (res.data && res.data.length > 0) {
              const splitsData = res.data.map(tx => ({
                id: tx.id,
                paymentMethodId: tx.paymentMethodId,
                paymentMethodName: tx.paymentMethodName,
                amount: tx.amount,
                discountPercentage: tx.discountPercentage
              }));
              
              for (const split of splitsData) {
                if (split.paymentMethodId && (split.discountPercentage === undefined || split.discountPercentage === null)) {
                  try {
                    const pmRes = await paymentMethodService.getById(split.paymentMethodId);
                    if (pmRes.data) {
                      split.discountPercentage = pmRes.data.discountPercentage;
                    }
                  } catch (err) {
                    console.error('Error fetching payment method for split:', err);
                  }
                }
              }
              
              setIsUpdatingSplits(true);
              paymentSplits.value = splitsData;
              
              if (paymentSplits.value.length > 1) {
                isSplitPayment.value = true;
              } else {
                isSplitPayment.value = false;
                const single = paymentSplits.value[0];
                if (single.paymentMethodId && !form.value.paymentMethodId) {
                  form.value.paymentMethodId = single.paymentMethodId;
                  form.value.paymentMethodName = single.paymentMethodName;
                }
              }
              updatePreviousAmounts();
              setIsUpdatingSplits(false);
            }
          } catch (err) {
            console.error('Error loading payment splits:', err);
          }
        }
      } else {
        launchMode.value = 'MANUAL';
      }

      if (form.value.saleId && form.value.saleTotal) {
        form.value.amount = form.value.saleTotal;
      } else if (form.value.originalAmount) {
        form.value.amount = form.value.originalAmount;
      }
      if (form.value.paymentDate?.length > 16) form.value.paymentDate = form.value.paymentDate.substring(0, 19);

      if (form.value.paymentMethodId) {
        const pmRes = await paymentMethodService.getById(form.value.paymentMethodId);
        if (pmRes.data) {
          selectedPaymentMethod.value = pmRes.data;
          form.value.paymentMethodName = pmRes.data.name;
        }
      }

      if (form.value.accountGroupId) {
        const group = rawGroups.find(g => g.id === form.value.accountGroupId);
        if (group) form.value.accountGroupName = group.name;
      }
    } else {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      form.value.paymentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    if (!props.transaction?.id) {
      setIsUpdatingSplits(true);
      paymentSplits.value[0].amount = round2(form.value.amount);
      updatePreviousAmounts();
      setIsUpdatingSplits(false);
    }
  });

  const save = async () => {
    if (form.value.status === 'PAID' && !form.value.accountGroupId && !form.value.appointmentId && launchMode.value === 'MANUAL') {
      confirmBridge.alert({
        title: 'Grupo de Contas Obrigatório',
        message: 'Selecione um Grupo de Contas para transações Pagas.',
        type: 'warning'
      });
      return;
    }

    const isPaidSaleEdit = props.transaction?.id && (props.transaction.saleId || props.transaction.sale) && originalStatus.value === 'PAID';

    if (launchMode.value === 'MANUAL' || (props.transaction?.id && !props.transaction.saleId) || isPaidSaleEdit) {
      if (launchMode.value === 'MANUAL' && !form.value.description) {
        confirmBridge.alert({
          title: 'Descrição Obrigatória',
          message: 'A descrição é obrigatória para lançamentos manuais.',
          type: 'warning'
        });
        return;
      }

      if (selectedSourceCardId.value !== null && form.value.nature === 'EXPENSE') {
        try {
          const purchaseDate = form.value.paymentDate
            ? form.value.paymentDate.substring(0, 10)
            : new Date().toISOString().substring(0, 10);
          await creditCardService.createExpense(selectedSourceCardId.value, {
            description: form.value.description,
            totalAmount: form.value.amount,
            installmentCount: cardInstallmentCount.value || 1,
            purchaseDate,
            category: form.value.category || null,
            accountGroupId: form.value.accountGroupId || null,
          });
          emit('save', { refresh: true });
        } catch (error) {
          confirmBridge.alert({
            title: 'Erro ao Lançar no Cartão',
            message: error.response?.data?.message || 'Não foi possível lançar o gasto no cartão.',
            type: 'danger'
          });
        }
        return;
      }

      if (form.value.status === 'PAID' && !form.value.accountGroupId && !form.value.appointmentId) {
        confirmBridge.alert({
          title: 'Grupo de Contas Obrigatório',
          message: 'Selecione um Grupo de Contas para transações Pagas.',
          type: 'warning'
        });
        return;
      }

      emit('save', form.value);
      return;
    }

    if (launchMode.value === 'SALE') {
      await saveSale(props.transaction);
    }
  };

  const accountGroupServiceAdapter = {
    getAll: async (params) => {
      const response = await financialService.getAccountGroups();
      let data = response.data.filter(group => group.active && group.classification !== 'CREDIT_CARD');
      if (params.name) {
        data = data.filter(g => g.name.toLowerCase().includes(params.name.toLowerCase()));
      }
      return { data: { content: data, totalElements: data.length } };
    },
    getById: async (id) => {
      const response = await financialService.getAccountGroups();
      return { data: response.data.find(g => g.id == id) };
    }
  };

  watch(() => form.value.status, (newVal) => {
    if (launchMode.value === 'MANUAL' && newVal !== 'PAID') {
      form.value.paymentMethodId = undefined;
      form.value.paymentMethodName = '';
      selectedPaymentMethod.value = null;
    }
  });

  watch(() => form.value.paymentMethodId, (newId) => {
    if (!isSplitPayment.value && paymentSplits.value.length === 1) {
      paymentSplits.value[0].paymentMethodId = newId;
      paymentSplits.value[0].paymentMethodName = form.value.paymentMethodName;
    }
  });

  watch(launchMode, (newVal) => {
    if (newVal === 'SALE') {
      form.value.nature = 'INCOME';
      isSplitPayment.value = false;
    } else if (!form.value.accountGroupId && !form.value.id) {
      form.value.nature = 'EXPENSE';
    }
    selectedSourceCardId.value = null;
    cardInstallmentCount.value = 1;
  });

  watch(() => form.value.nature, (newVal) => {
    selectedSourceCardId.value = null;
    cardInstallmentCount.value = 1;
    if (newVal === 'INCOME') {
      form.value.paymentMethodId = undefined;
      form.value.paymentMethodName = '';
      selectedPaymentMethod.value = null;
    }
  });

  watch(() => form.value.appointmentId, (newVal) => {
    if (newVal) form.value.nature = 'INCOME';
  }, { immediate: true });

  watch([() => form.value.clientName, () => paymentSplits.value.length], ([clientName, splitsCount]) => {
    if (launchMode.value === 'SALE' && clientName) {
      const defaultPattern = new RegExp(`^Venda para ${clientName}( com \\d+ formas? de pgto)?$`);
      if (!form.value.description || defaultPattern.test(form.value.description)) {
        if (splitsCount > 1) {
          form.value.description = `Venda para ${clientName} com ${splitsCount} formas de pgto`;
        } else {
          form.value.description = `Venda para ${clientName}`;
        }
      }
    }
  }, { immediate: true, deep: true });

  return {
    isAdmin,
    originalStatus,
    transactionStatuses,
    accountNatures,
    activeCards,
    selectedSourceCardId,
    cardInstallmentCount,
    launchMode,
    accountGroups,
    isAppointmentTransaction,
    canSave,
    isFormValid,
    saveTooltip,
    onAccountGroupSelect,
    onPaymentMethodSelect,
    viewAppointment,
    save,
    accountGroupServiceAdapter,
    saleItemTypes
  };
}

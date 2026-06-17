import { ref, computed, watch } from 'vue';
import { round2 } from '@/utils/formatters';

export function usePaymentSplits(form, paymentMethodService, selectedPaymentMethod) {
  const isSplitPayment = ref(false);
  const paymentSplits = ref([
    { paymentMethodId: undefined, paymentMethodName: '', amount: 0, status: 'PAID' }
  ]);

  let isUpdatingSplits = false;
  let previousAmounts = [];

  const updatePreviousAmounts = () => {
    previousAmounts = paymentSplits.value.map(s => round2(s.amount));
  };

  const splitsSum = computed(() => {
    return round2(paymentSplits.value.reduce((sum, s) => sum + round2(s.amount), 0));
  });

  const isSplitsBalanced = computed(() => {
    return round2(splitsSum.value) === round2(form.value.amount);
  });

  const splitsDiff = computed(() => {
    return round2(Math.abs(round2(form.value.amount) - round2(splitsSum.value)));
  });

  const hasDuplicatePaymentMethods = computed(() => {
    if (!isSplitPayment.value) return false;
    const ids = paymentSplits.value
      .map(s => s.paymentMethodId)
      .filter(id => id !== undefined && id !== null);
    return new Set(ids).size !== ids.length;
  });

  const enableSplitPayment = () => {
    isUpdatingSplits = true;
    isSplitPayment.value = true;
    if (paymentSplits.value.length === 1) {
      paymentSplits.value[0].paymentMethodId = form.value.paymentMethodId;
      paymentSplits.value[0].paymentMethodName = form.value.paymentMethodName;
      paymentSplits.value[0].amount = round2(form.value.amount);
      
      paymentSplits.value.push({
        paymentMethodId: undefined,
        paymentMethodName: '',
        amount: 0,
        status: 'PAID'
      });
    }
    updatePreviousAmounts();
    isUpdatingSplits = false;
  };

  const addPaymentSplit = () => {
    isUpdatingSplits = true;
    const currentSum = splitsSum.value;
    const remaining = Math.max(0, round2(form.value.amount - currentSum));
    paymentSplits.value.push({
      paymentMethodId: undefined,
      paymentMethodName: '',
      amount: remaining,
      status: 'PAID'
    });
    updatePreviousAmounts();
    isUpdatingSplits = false;
  };

  const removePaymentSplit = (index) => {
    isUpdatingSplits = true;
    if (paymentSplits.value.length > 1) {
      const removedAmount = round2(paymentSplits.value[index].amount || 0);
      paymentSplits.value.splice(index, 1);
      
      if (paymentSplits.value.length > 0) {
        const recipientIndex = index > 0 ? index - 1 : 0;
        paymentSplits.value[recipientIndex].amount = round2((paymentSplits.value[recipientIndex].amount || 0) + removedAmount);
      }
    }
    
    if (paymentSplits.value.length === 1) {
      isSplitPayment.value = false;
      const remaining = paymentSplits.value[0];
      form.value.paymentMethodId = remaining.paymentMethodId;
      form.value.paymentMethodName = remaining.paymentMethodName;
      remaining.amount = round2(form.value.amount);
      
      if (remaining.paymentMethodId) {
        paymentMethodService.getById(remaining.paymentMethodId).then(res => {
          if (res.data) {
            selectedPaymentMethod.value = res.data;
          }
        }).catch(err => {
          console.error('Error fetching payment method:', err);
        });
      } else {
        selectedPaymentMethod.value = null;
      }
    }
    updatePreviousAmounts();
    isUpdatingSplits = false;
  };

  // Watcher on paymentSplits to handle N+1 reconciliation
  watch(paymentSplits, (newSplits) => {
    if (isUpdatingSplits) return;
    if (!isSplitPayment.value || newSplits.length <= 1) {
      updatePreviousAmounts();
      return;
    }

    isUpdatingSplits = true;
    try {
      const totalAmount = round2(form.value.amount);
      
      let modifiedIndex = -1;
      for (let i = 0; i < newSplits.length; i++) {
        const currentVal = round2(newSplits[i]?.amount);
        const prevVal = previousAmounts[i] !== undefined ? previousAmounts[i] : 0;
        if (currentVal !== prevVal) {
          modifiedIndex = i;
          break;
        }
      }

      if (modifiedIndex !== -1) {
        const lastIndex = newSplits.length - 1;
        
        if (modifiedIndex === lastIndex) {
          const currentLastVal = round2(newSplits[lastIndex].amount);
          const prevLastVal = previousAmounts[lastIndex] !== undefined ? previousAmounts[lastIndex] : 0;
          
          if (currentLastVal < prevLastVal) {
            const currentSum = round2(newSplits.reduce((sum, s) => sum + round2(s.amount), 0));
            if (currentSum < totalAmount) {
              const remaining = round2(totalAmount - currentSum);
              newSplits.push({
                paymentMethodId: undefined,
                paymentMethodName: '',
                amount: remaining,
                status: 'PAID'
              });
            }
          }
        } else {
          const sumExceptLast = newSplits.slice(0, -1).reduce((sum, s) => sum + round2(s.amount), 0);
          const roundedSumExceptLast = round2(sumExceptLast);
          const remaining = Math.max(0, round2(totalAmount - roundedSumExceptLast));
          
          newSplits[lastIndex].amount = remaining;
        }
      }
    } finally {
      updatePreviousAmounts();
      isUpdatingSplits = false;
    }
  }, { deep: true });

  // Watcher on form.amount to adjust splits when total changes
  watch(() => form.value.amount, (newVal) => {
    const roundedNewVal = round2(newVal);
    if (paymentSplits.value.length === 1) {
      isUpdatingSplits = true;
      paymentSplits.value[0].amount = roundedNewVal;
      updatePreviousAmounts();
      isUpdatingSplits = false;
    } else if (paymentSplits.value.length > 1) {
      isUpdatingSplits = true;
      const sumExceptLast = paymentSplits.value.slice(0, -1).reduce((sum, s) => sum + round2(s.amount), 0);
      const roundedSumExceptLast = round2(sumExceptLast);
      const remaining = Math.max(0, round2(roundedNewVal - roundedSumExceptLast));
      paymentSplits.value[paymentSplits.value.length - 1].amount = remaining;
      updatePreviousAmounts();
      isUpdatingSplits = false;
    }
  });

  const setIsUpdatingSplits = (val) => {
    isUpdatingSplits = val;
  };

  return {
    paymentSplits,
    isSplitPayment,
    splitsSum,
    isSplitsBalanced,
    hasDuplicatePaymentMethods,
    splitsDiff,
    enableSplitPayment,
    addPaymentSplit,
    removePaymentSplit,
    updatePreviousAmounts,
    setIsUpdatingSplits
  };
}

<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ transaction.id ? 'Editar Transação' : 'Nova Transação' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-group">
          <label>Descrição</label>
          <input v-model="form.description" required />
        </div>

        <div class="form-row">
           <div class="form-group">
            <label>Tipo</label>
            <select v-model="form.type" required>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>

          <div class="form-group">
            <label>Valor</label>
            <input type="number" step="0.01" v-model="form.amount" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Categoria</label>
            <input v-model="form.category" />
          </div>
          
           <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" required>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Conta Bancária / Caixa</label>
            <select v-model="form.bankAccountId">
              <option :value="undefined">Selecione uma conta...</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Vencimento</label>
            <input type="date" v-model="form.dueDate" />
          </div>

          <div class="form-group">
            <label>Pagamento</label>
             <input type="date" v-model="form.paymentDate" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import financialService from '../../services/financialService';

const props = defineProps({
  transaction: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  description: '',
  amount: 0,
  type: 'EXPENSE',
  status: 'PENDING',
  category: '',
  dueDate: new Date().toISOString().split('T')[0],
  paymentDate: '',
  bankAccountId: undefined,
  active: true
});

const accounts = ref([]);

onMounted(async () => {
  try {
    const response = await financialService.getAccounts();
    accounts.value = response.data.filter(a => a.active);
  } catch (error) {
    console.error('Error loading accounts:', error);
  }

  if (props.transaction && props.transaction.id) {
    form.value = { ...props.transaction };
  }
});

const save = () => {
  if (form.value.status === 'PAID' && !form.value.bankAccountId) {
    alert('Por favor, selecione uma Conta Bancária para transações Pagas.');
    return;
  }
  emit('save', form.value);
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-card, #fff);
  padding: 2rem;
  border-radius: var(--radius-md);
  width: 500px;
  max-width: 95%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
    margin: 0;
    color: var(--color-text-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.form-group {
  margin-bottom: 1rem;
  flex: 1;
}

.form-row {
    display: flex;
    gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-main);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>

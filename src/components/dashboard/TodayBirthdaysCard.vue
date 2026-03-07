<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
      <span>🎂</span> Aniversariantes (Mês Atual)
    </h2>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8">
      <button @click="fetchBirthdays" class="text-sm text-red-500 hover:text-red-400 transition-colors">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="clients.length === 0" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum aniversariante este mês.
    </div>

    <div v-else class="space-y-5 flex-1">
      <div v-for="client in clients" :key="client.id">
        <div class="flex items-center gap-3 mb-3 cursor-pointer" @click="goToClient(client)">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
               :class="getAvatarColor(client.name)">
            {{ getInitials(client.name) }}
          </div>
          <div>
            <p class="text-gray-800 dark:text-white font-medium">
              {{ client.name }}
              <span v-if="client.birthday" class="text-gray-400 dark:text-slate-500 text-sm"> - {{ extractDay(client.birthday) }}/{{ extractMonthNum(client.birthday) }}</span>
            </p>
          </div>
        </div>
        <a v-if="client.phone"
           :href="'https://wa.me/55' + cleanPhone(client.phone)"
           target="_blank"
           class="w-full py-2 px-4 border border-gray-300 dark:border-slate-600 hover:border-green-500 hover:text-green-500 text-gray-500 dark:text-slate-300 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm no-underline">
          <i class="fa-brands fa-whatsapp"></i> Enviar Mensagem
        </a>
        <div v-else class="text-xs text-gray-400 dark:text-slate-500 italic text-center">Sem telefone cadastrado</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const router = useRouter();
const loading = ref(true);
const error = ref(false);
const clients = ref([]);

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500'];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const extractDay = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('-')[2] || '';
};

const extractMonthNum = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('-')[1] || '';
};

const cleanPhone = (phone) => {
  return ('' + phone).replace(/\D/g, '');
};

const goToClient = (client) => {
  if (!client || !client.id) return;
  router.push({ name: 'client-detail', params: { id: client.id } });
};

const fetchBirthdays = async () => {
  loading.value = true;
  error.value = false;
  try {
    const currentMonth = new Date().getMonth() + 1;
    const response = await api.get('/clients', { params: { size: 200, sort: 'name,asc' } });
    const content = response?.data?.content || response?.data || [];
    const allClients = Array.isArray(content) ? content : [];
    const birthdaysThisMonth = allClients.filter(client => {
      if (!client.birthday) return false;
      const parts = client.birthday.split('-');
      return parts.length === 3 && parseInt(parts[1], 10) === currentMonth;
    });
    birthdaysThisMonth.sort((a, b) => {
      const dayA = parseInt(a.birthday.split('-')[2], 10);
      const dayB = parseInt(b.birthday.split('-')[2], 10);
      return dayA - dayB;
    });
    clients.value = birthdaysThisMonth.slice(0, 5);
  } catch (err) {
    console.error('Failed to fetch birthdays:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBirthdays();
});
</script>

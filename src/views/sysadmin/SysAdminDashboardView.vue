<template>
  <div class="sys-admin-dashboard p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Administração do Sistema</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">
          Painel de controle para gerenciar usuários, parâmetros, auditorias, logs e conexões em tempo real.
        </p>
      </div>
    </header>

    <!-- Tab Navigation -->
    <TabNavigation v-model="activeTab" :tabs="tabs" />

    <!-- Tab Contents -->
    <div class="tab-content flex-grow">
      <div v-show="activeTab === 0">
        <UserTab />
      </div>
      <div v-show="activeTab === 1">
        <SystemParameterTab />
      </div>
      <div v-show="activeTab === 2">
        <AuditLogTab />
      </div>
      <div v-show="activeTab === 3">
        <NotificationLogTab />
      </div>
      <div v-show="activeTab === 4">
        <WebSocketConnectionsTab />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TabNavigation from '../../components/common/TabNavigation.vue';
import UserTab from '../../components/sysadmin/UserTab.vue';
import SystemParameterTab from '../../components/sysadmin/SystemParameterTab.vue';
import AuditLogTab from '../../components/sysadmin/AuditLogTab.vue';
import NotificationLogTab from '../../components/sysadmin/NotificationLogTab.vue';
import WebSocketConnectionsTab from '../../components/sysadmin/WebSocketConnectionsTab.vue';

const activeTab = ref(0);

const tabs = [
  { label: 'Usuários', icon: 'group' },
  { label: 'Parâmetros', icon: 'settings' },
  { label: 'Auditoria', icon: 'history' },
  { label: 'Logs de Notificações', icon: 'chat' },
  { label: 'Conexões WebSocket', icon: 'cloud' }
];
</script>

<style scoped>
.sys-admin-dashboard {
  min-height: 100%;
}
</style>

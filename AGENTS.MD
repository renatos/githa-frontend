# AGENTS.MD — Githa Frontend

> Instruções para modelos de linguagem que interagem com este projeto.

## Visão Geral

**Githa Frontend** é a interface do sistema de gestão para clínicas de estética. Construído com:

| Tecnologia | Versão |
|---|---|
| Vue.js | 3.5+ (Composition API) |
| Vite | 7.2+ |
| PrimeVue | 4.5+ (tema Material) |
| Axios | 1.13+ |
| Vue Router | 4.6+ |
| vue-currency-input | 3.2+ |

## Estrutura do Projeto

```
src/
├── main.js                  # Bootstrap da app (Vue, PrimeVue, Router, ConfigService)
├── App.vue                  # Componente raiz (layout dinâmico + Toast global)
│
├── views/                   # Páginas/Views (composição de componentes)
│   ├── ClientView.vue       # Clientes
│   ├── ClientDetailView.vue # Detalhe do cliente
│   ├── AppointmentView.vue  # Agendamentos
│   ├── ProfessionalView.vue # Profissionais
│   ├── ServiceView.vue      # Procedimentos
│   ├── UserView.vue         # Usuários
│   ├── StrategicClientsView.vue  # Clientes estratégicos
│   ├── SystemParametersView.vue  # Parâmetros do sistema (ADMIN)
│   ├── ProfileView.vue      # Perfil do usuário
│   ├── LoginView.vue        # Login
│   ├── GoogleCallbackView.vue    # Callback OAuth do Google
│   ├── HomeView.vue         # Página inicial
│   └── financial/           # Módulo financeiro
│       ├── FinancialDashboard.vue
│       ├── AccountView.vue
│       └── OperatingExpenseList.vue
│
├── components/              # Componentes reutilizáveis
│   ├── ClientList.vue       # Lista de clientes (usa GenericTable)
│   ├── ClientForm.vue       # Formulário de cliente (modal)
│   ├── AppointmentList.vue  # Lista de agendamentos
│   ├── AppointmentForm.vue  # Formulário de agendamento
│   ├── AppointmentCancellationModal.vue
│   ├── ProfessionalList.vue / ProfessionalForm.vue
│   ├── ServiceList.vue / ServiceForm.vue
│   ├── UserList.vue / UserForm.vue
│   ├── common/              # Componentes genéricos
│   │   ├── GenericTable.vue      # Tabela paginada, filtrável, ordenável
│   │   ├── BaseModal.vue / BaseLookup.vue
│   │   ├── CurrencyInput.vue     # Input monetário (R$)
│   │   ├── ErrorModal.vue        # Modal de erros
│   │   ├── AlertMessage.vue      # Mensagens de alerta
│   │   ├── GoogleLoginButton.vue # Botão login Google
│   │   └── GoogleContactsModal.vue
│   └── financial/           # Componentes financeiros
│       └── OperatingExpenseForm.vue
│
├── services/                # Camada de comunicação com API
│   ├── api.js               # Instância Axios (baseURL: /api, JWT interceptor)
│   ├── authService.js       # Autenticação (login, Google OAuth)
│   ├── clientService.js     # CRUD de clientes
│   ├── appointmentService.js # CRUD de agendamentos
│   ├── professionalService.js
│   ├── serviceService.js
│   ├── userService.js
│   ├── financialService.js  # Dashboard financeiro
│   ├── systemParameterService.js
│   ├── configService.js     # Carregamento de config do backend
│   └── errorHandler.js      # Handler global de erros HTTP
│
├── composables/             # Composables Vue (lógica reutilizável)
│   ├── useErrorHandler.js   # Estado de erro (show, title, message, details)
│   ├── useEscapeKey.js      # Listener de tecla Escape
│   ├── useModal.js          # Controle de visibilidade de modais
│   └── useTheme.js          # Tema claro/escuro
│
├── router/
│   └── index.js             # Vue Router (rotas com meta: requiresAuth, roles)
│
├── constants/               # Constantes da aplicação
├── utils/                   # Funções utilitárias
├── layouts/                 # Layouts da aplicação
│   ├── MainLayout.vue       # Layout principal (sidebar, header)
│   └── AuthLayout.vue       # Layout de autenticação (login)
│
└── assets/                  # CSS e recursos estáticos
    ├── base.css             # Variáveis CSS, reset, estilos globais
    ├── forms.css            # Estilos de formulários
    └── modal.css            # Estilos de modais
```

## Padrões e Convenções

### Padrão View → List + Form

Cada entidade segue o padrão **View + List + Form**:

```
View (orquestra)
├── List (GenericTable, emite @new, @edit, @delete)
└── Form (BaseModal, recebe :entity, emite @close, @save)
```

**View** (`views/ClientView.vue`):
- Importa `List` e `Form`
- Gerencia estado: `showForm`, `editingClient`
- Implementa: `openForm()`, `closeForm()`, `saveClient()`, `deleteClient()`
- Usa `useErrorHandler` para erros

**List** (`components/ClientList.vue`):
- Usa `GenericTable` com `fetchData`, `columns`, paginação
- Emite eventos: `@new`, `@edit`, `@delete`
- Não faz chamadas de API diretamente — delega ao View

**Form** (`components/ClientForm.vue`):
- Renderiza dentro de modal (CSS modal-overlay)
- Recebe prop da entidade
- Emite `@close` e `@save`
- Validação local antes de emitir save

### Services

Cada service segue o padrão CRUD:

```javascript
import api from './api';

export const clientService = {
    getAll: (params) => api.get('/clients', { params }),
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
};
```

### API Layer (`api.js`)

- Base URL: `/api` (proxy do Vite redireciona para `localhost:8080`)
- **Request interceptor**: adiciona `Authorization: Bearer <token>` do `localStorage`
- **Response interceptor**: trata erros globais, redireciona para `/login` em 401/403
- Toast global via `window.$toast`

### Composables

- Prefixo `use` (ex: `useErrorHandler`, `useModal`)
- Retornam objetos reativos e funções
- Encapsulam lógica reutilizável entre componentes

### Router

- Rotas protegidas: `meta: { requiresAuth: true }`
- Rotas com role: `meta: { roles: ['ADMIN'] }`
- Rotas públicas: `meta: { public: true }`
- Guard no `beforeEach`: verifica token no `localStorage`
- Layouts dinâmicos: `meta: { layout: 'auth' }` → `AuthLayout`, default → `MainLayout`

### Composition API

- Todos componentes usam `<script setup>`
- Imports do Vue: `ref`, `computed`, `onMounted`, `watch`
- Sem Options API

### UI Framework (PrimeVue)

- Tema: **Material** (configurado em `main.js`)
- Componentes comuns: `Toast`, `DataTable`, `Dialog`, `Button`, `InputText`
- Toast global: `useToast()` no `App.vue`, armazenado em `window.$toast`

## Fluxo de Autenticação

```
LoginView → authService.loginWithGoogle() → Google OAuth
  → GoogleCallbackView → authService.handleCallback(code)
    → Backend /api/auth/google/callback
      → JWT Token → localStorage('token')
        → Redirect para Home
```

## Temas CSS

- Variáveis CSS definidas em `assets/base.css`
- Tema escuro/claro via `useTheme` composable
- Estilos de formulários centralizados em `assets/forms.css`
- Estilos de modais centralizados em `assets/modal.css`

## Comandos Úteis

```bash
# Desenvolvimento (porta 5173, proxy para backend em 8080)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Configuração

- Proxy dev: `vite.config.js` redireciona `/api` → `http://localhost:8080`
- Variáveis de ambiente: `.env` (template em `.env.example`)
- Config dinâmica do backend: `configService.loadConfig()` no boot

## Ao Adicionar Nova Feature (Checklist)

1. [ ] **Service**: criar `src/services/{entity}Service.js` seguindo padrão CRUD
2. [ ] **List Component**: criar `src/components/{Entity}List.vue` com `GenericTable`
3. [ ] **Form Component**: criar `src/components/{Entity}Form.vue` com modal
4. [ ] **View**: criar `src/views/{Entity}View.vue` orquestrando List + Form
5. [ ] **Router**: adicionar rota em `src/router/index.js` com `meta: { requiresAuth: true }`
6. [ ] **Navegação**: adicionar item no menu em `MainLayout.vue`

## Componentes Genéricos Reutilizáveis

| Componente | Uso |
|---|---|
| `GenericTable` | Tabela com paginação, filtros, ordenação, ações |
| `BaseLookup` | Campo de busca com autocomplete |
| `CurrencyInput` | Input de valores monetários (R$) |
| `ErrorModal` | Modal para exibição de erros detalhados |
| `AlertMessage` | Mensagens de alerta inline |
| `GoogleLoginButton` | Botão de login com Google |

## Erros Comuns e Soluções

| Erro | Causa | Solução |
|---|---|---|
| CORS blocked | Backend não configurou CORS | Verificar config CORS no backend |
| 401 após login | Token expirado ou inválido | Verificar `localStorage.token` |
| Componente PrimeVue não renderiza | Falta registro | PrimeVue 4 usa auto-import |
| Toast não aparece | `window.$toast` não inicializado | Garantir `App.vue` montou corretamente |
| Proxy não funciona | Vite dev server não rodando | Verificar `npm run dev` |

## Idioma da UI

A interface é em **português brasileiro (pt-BR)**. Todos os labels, mensagens de erro, confirmações e textos devem estar em português. Exemplos:
- "Tem certeza que deseja excluir?"
- "Erro ao salvar cliente"
- "Novo Agendamento"

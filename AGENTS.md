# AGENTS.MD — Githa Frontend

> Instruções para modelos de linguagem que interagem com este projeto.

## Visão Geral

**Githa Frontend** é a interface do sistema de gestão para clínicas de estética. O projeto passou por uma modernização recente para utilizar **Tailwind CSS**.

| Tecnologia   | Versão                   |
|--------------|--------------------------|
| Vue.js       | 3.5+ (Composition API)   |
| Vite         | 7.2+                     |
| Tailwind CSS | 3.4+                     |
| Axios        | 1.13+                    |
| Vue Router   | 4.6+                     |

## Estrutura do Projeto

```
src/
├── main.js                  # Bootstrap da app (Vue, Router, ConfigService)
├── App.vue                  # Componente raiz
│
├── views/                   # Páginas/Views (composição de componentes)
│   ├── clients/             
│   │   ├── ClientList.vue   # Lista de clientes (usa GenericTable)
│   │   ├── ClientForm.vue   # Formulário em modal (Tailwind)
│   ├── ClientDetailView.vue # Detalhe do cliente
│   ├── AppointmentView.vue  # Agendamentos (usa calendário customizado)
│   ├── StrategicClientsView.vue  # Clientes estratégicos
│   ├── SystemParametersView.vue  # Parâmetros do sistema (ADMIN)
│   ├── LoginView.vue        # Login
│   ├── GoogleCallbackView.vue    # Callback OAuth do Google
│   └── HomeView.vue         # Dashboard inicial
│
├── components/              # Componentes reutilizáveis
│   ├── common/              # Componentes genéricos da nova arquitetura
│   │   ├── GenericTable.vue      # Tabela flexível com paginação, filtros e mobile cards
│   │   ├── BaseModal.vue         # Modal base em Tailwind (Padrão para todos os forms modais)
│   │   ├── BaseLookup.vue        # Componente de autocomplete/lookup
│   │   ├── AiContextBadge.vue    # Badge antigo de IA (Legacy)
│   │   ├── AiInsightsBanner.vue  # Novo banner interativo de insights gerados por IA
│   │   └── GoogleContactsModal.vue
│   │
│   ├── dashboard/           # Componentes do Dashboard inicial (Estilizado com Tailwind)
│   └── financial/           # Componentes financeiros
│
├── services/                # Camada de comunicação com API (Axios)
│   ├── api.js               # Instância base com interceptors (JWT)
│   ├── authService.js       # Autenticação (Google OAuth, JWT parsing)
│   ├── clientService.js     
│   ├── appointmentService.js 
│   ├── aiService.js         # Integração com a central de IA do Githa
│   ├── financialService.js
│   └── configService.js     # ConfigURAÇÕES estáticas do backend
│
├── composables/             # Composables Vue (lógica reutilizável)
│   ├── useModal.js          # Controle para bloquear scroll quando modals abrem (crucial)
│   └── useEscapeKey.js      # Listener de tecla Escape para fechar apenas o último modal aberto
│
├── router/

**Para Views com lógica extra** (ex: `AppointmentView`), desestruture e estenda:
```javascript
const { saveItem: baseSave, ...rest } = useCrudView(service, labels);
const saveItem = async (data) => {
  // lógica customizada
  await baseSave(data);
};
```

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
- Toast via `toastBridge` (módulo isolado, sem poluir escopo global)

### Toast Bridge (`toastBridge.js`)

Substitui o anti-pattern `window.$toast`. O `App.vue` registra o toast via `toastBridge.setToast(toast)` e o `api.js` acessa via `toastBridge.getToast()`. Isso mantém o toast acessível fora de componentes Vue sem poluir o escopo global.

### Composables

- Prefixo `use` (ex: `useCrudView`, `useErrorHandler`, `useModal`)
- Retornam objetos reativos e funções
- Encapsulam lógica reutilizável entre componentes
- `useCrudView` é o principal — deve ser usado para **toda View CRUD**

### Router

- Rotas protegidas: `meta: { requiresAuth: true }`
- Rotas com role: `meta: { roles: ['ADMIN'] }`
- Rotas públicas: `meta: { public: true }`
- Guard no `beforeEach`:
  1. Permite rotas públicas
  2. Redireciona para `/login` se não autenticado
  3. **Verifica roles** via `authService.getCurrentUser()` — bloqueia acesso não autorizado
- Layouts dinâmicos: `meta: { layout: 'auth' }` → `AuthLayout`, default → `MainLayout`

### Composition API

- Todos componentes usam `<script setup>`
- Imports do Vue: `ref`, `computed`, `onMounted`, `watch`
- Sem Options API
- Imports sempre no topo do `<script setup>`

### Integrações com Bibliotecas Externas

- **Gráficos**: Chart.js configurado no `FinancialDashboard`
- **Ícones**: Material Symbols Outlined (Google Fonts)
- **Toast**: Sistema customizado via `App.vue` e `toastBridge.js`

```
LoginView → authService.loginWithGoogle() → Google OAuth
  → GoogleCallbackView → authService.handleCallback(code)
    → Backend /api/auth/google/callback
      → JWT Token → localStorage('token')
        → authService.extractRoles(token) → localStorage('user')
          → Redirect para Home
```

Roles são extraídas do JWT (`groups` claim) e armazenadas em `localStorage('user')`. O formato `ROLE_ADMIN` é normalizado para `ADMIN`.

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

# Lint (análise estática)
npm run lint

# Lint com correção automática
npm run lint:fix

# Formatação de código
npm run format

# Testes (execução única)
npm run test

# Testes (modo watch)
npm run test:watch
```

## Qualidade de Código

### ESLint (`eslint.config.js` — flat config)
- Base: `@eslint/js` recomendado + `eslint-plugin-vue` flat/recommended
- Integrado com Prettier via `eslint-config-prettier`
- Regra `no-console`: warn (permite `console.warn` e `console.error`)
- `vue/multi-word-component-names`: desabilitado

### Prettier (`.prettierrc`)
- Single quotes, semicolons, trailing commas
- Print width: 100, tab width: 2

### Testes (`tests/`)
- Framework: **Vitest** com ambiente **happy-dom**
- Globals habilitados (`describe`, `it`, `expect` sem imports)
- `@vue/test-utils` para testes de componentes
- Estrutura de pastas espelha `src/` (`tests/composables/`, `tests/services/`)

## Configuração

- Proxy dev: `vite.config.js` redireciona `/api` → `http://localhost:8080`
- Variáveis de ambiente: `.env` (template em `.env.example`)
- Config dinâmica do backend: `configService.loadConfig()` no boot
- Vitest: configurado em `vite.config.js` (seção `test`)

## Ao Adicionar Nova Feature (Checklist)

1. [ ] **Service**: criar `src/services/{entity}Service.js` seguindo padrão CRUD
2. [ ] **List Component**: criar `src/components/{Entity}List.vue` com `GenericTable`
3. [ ] **Form Component**: criar `src/components/{Entity}Form.vue` com modal
4. [ ] **View**: criar `src/views/{Entity}View.vue` usando `useCrudView(service, labels)`
5. [ ] **Router**: adicionar rota em `src/router/index.js` com `meta: { requiresAuth: true }`
6. [ ] **Navegação**: adicionar item no menu em `MainLayout.vue`
7. [ ] **Testes**: criar testes em `tests/` para o novo service e composables

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
| Toast não aparece | `toastBridge` não inicializado | Garantir `App.vue` montou e registrou via `toastBridge.setToast()` |
| Proxy não funciona | Vite dev server não rodando | Verificar `npm run dev` |
| Testes falham com `confirm` | `happy-dom` não define `confirm` | Usar `globalThis.confirm = vi.fn()` |

## Idioma da UI

A interface é em **português brasileiro (pt-BR)**. Todos os labels, mensagens de erro, confirmações e textos devem estar em português. Exemplos:
- "Tem certeza que deseja excluir?"
- "Erro ao salvar cliente"
- "Novo Agendamento"

## Uso Obrigatório do MCP th0th (Obrigatório)

O uso do servidor MCP `th0th-brain` é **obrigatório** para todas as interações de longo prazo e pesquisas no código:
- **Indexação Semântica**: Utilize `th0th_search` ou `th0th_optimized_context` para entender o contexto do código antes de propor mudanças complexas.
- **Reindexação Periódica**: Execute `th0th_index` (com `forceReindex: true` se necessário) de tempos em tempos para garantir que a base de conhecimento reflita as mudanças mais recentes do código.
- **Memória Hierárquica**: Utilize `th0th_remember` para registrar decisões arquiteturais importantes tomadas durante a conversa e `th0th_recall` para recuperar contexto de conversas passadas.
- **Eficiência de Tokens**: Prefira ferramentas do `th0th` para busca em vez de ler arquivos inteiros repetidamente.

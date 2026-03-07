# Google Stitch — Prompts para Módulo de Clientes

> Documento de referência para gerar telas no Google Stitch mantendo consistência visual com o sistema Githa.

---

## 🎨 Design System de Referência (incluir em todos os prompts)

Ao gerar qualquer tela no Stitch, inclua este contexto no início de cada prompt para garantir coerência visual:

```
DESIGN SYSTEM CONTEXT — Githa Clinic Management App:

Typography: "Inter" font-family (Google Fonts), font-smoothing antialiased.
Icon Library: Font Awesome 6 (fa-solid, fa-regular).

COLOR PALETTE:
- Primary/Brand: #6366f1 (indigo-500, used for CTA buttons, active states, selected tabs, toggle switches ON, focus rings)
- Primary hover: #4f46e5 (indigo-600)
- Success: #10B981 (emerald-500)
- Danger: #EF4444 (red-500)
- Warning: #f1c40f (yellow)
- Active sidebar link: #484cb0 (indigo/purple, white text, shadow-md)

LIGHT MODE:
- Body bg: #f4f6f8
- Card/Surface bg: #ffffff
- Text primary: #2c3e50
- Text muted: #64748b (slate-500)
- Borders: #e2e8f0 (slate-200)

DARK MODE:
- Body bg: #0f172a (slate-900) or #151921
- Card/Surface bg: #1e293b (slate-800) or #1E222B
- Sidebar bg: #1f2937 (gray-800)
- Text primary: #f1f5f9 (slate-100)
- Text muted: #94a3b8 (slate-400)
- Borders: #334155 (slate-700)

COMPONENT PATTERNS:
- Buttons: rounded-md (6px), font-medium, 0.5rem 1rem padding, transition-all 200ms
- Primary button: bg-[#6366f1] text-white, hover bg-[#4f46e5]
- Secondary button: transparent bg, 1px solid border-color, text matches main text
- Danger button: red-500 border, red-500 text, hover bg-red-50
- Inputs: 1px solid border-color, rounded-md, 0.5rem padding, bg matches card bg, focus ring 2px #6366f1
- Select dropdowns: same style as inputs, bg matches card bg in dark mode
- Toggle switches: 44px x 24px, rounded-full, OFF gray #ccc, ON #6366f1, white knob 18px
- Modals: max-height 90vh, bg card color, rounded-lg, shadow-lg, 1px solid border. Mobile: full-screen, no rounded.
- Cards: bg card color, rounded-md, shadow-sm, 1.5rem padding
- Tabs (scrollable): transparent bg, muted text when inactive, #6366f1 text + bottom border when active, horizontal scroll with arrow buttons on overflow
- Tables: header bg slightly darker, sortable columns, filterable inputs inside header, row hover effect, alternating actions column
- Pagination: "Mostrando X a Y de Z registros" + "< Anterior | Página X de Y | Próximo >"
- Badges/Pills: rounded-full, padding 0.25rem 0.6rem, font-size 0.8rem, colored backgrounds (green for success, purple for special, yellow/orange for warning)
- Chip/Pill selectors: rounded-full, 6px 12px padding, light gray bg unselected, #6366f1 bg with indigo text when selected
- Mobile: cards layout instead of table, hamburger menu, bottom navigation bar
- Status indicators: colored dot (12px circle) + label text

LAYOUT:
- Left sidebar 260px with logo on top, nav links with FA icons, user info + theme toggle at bottom
- Main content max-width 1200px, centered with auto margins
- Content padding: 1rem (md), 1.5rem (lg)

All labels, text, messages in PORTUGUESE (pt-BR).
```

---

## Prompt 1: Lista de Clientes

```
DESIGN SYSTEM CONTEXT — [copiar bloco acima]

---

Design a responsive client list page for a clinic management app using Tailwind CSS.
Must support both Light and Dark modes. Fully responsive for desktop, tablet, and mobile.

PAGE STRUCTURE:
1. Header row:
   - Left: "Clientes" as h2 heading + small AI badge "Insights: Clientes" (muted text, subtle bg pill)
   - Right: "Importar do Google" secondary button + "+ Novo Cliente" primary button (#6366f1)

2. Status legend filters (horizontally aligned, wrapping):
   - Each filter is a clickable pill/chip with a colored dot (12px circle) + label text
   - Items: "VIP / Alta Frequência" (green dot #dcfce7), "Em Risco / Ausente" (red dot #fee2e2), "Novo Cliente" (blue dot #e0f2fe), "Ativo" (neutral dot), "Inativo" (dimmed dot)
   - Unselected: opacity 0.7, transparent border. Selected: opacity 1, border-color, subtle shadow, font-weight 600
   - Clicking a filter toggles it (multiple can be active)

3. Data table (desktop):
   - Columns: # (ID, 50px), Nome (sortable/filterable), Email (sortable/filterable), Telefone (filterable, format "(DD) 99999-9999"), Indicado Por (link style if has value), Ações
   - Each filterable column has a small text input inside the header cell (placeholder "Filtrar...")
   - Sortable columns show sort icon indicator on click (ascending/descending)
   - Row hover: bg-slate-700 (dark) / bg-slate-100 (light)
   - Row coloring by status: VIP rows get subtle green background (#dcfce7 light / green-900/10 dark), AT_RISK rows red (#fee2e2 light), NEW rows blue (#e0f2fe light)
   - Actions column: WhatsApp icon button (💬, grayscale by default, color on hover, opens wa.me link) + Delete button (✕, red border, red text, hover bg-red-50)
   - Clicking a row opens the edit modal

4. Mobile view (< 768px):
   - Replace table with card layout
   - Each card shows: Nome (bold), Telefone, Email (muted), status badge
   - Mobile search: dropdown to select field + text input + search button
   - Mobile sort: dropdown to select sort field + toggle asc/desc button
   - Cards are clickable (same as row click)

5. Pagination footer:
   - "Mostrando X a Y de Z registros"
   - "< Anterior | Página X de Y | Próximo >"

Empty state: centered "Nenhum registro encontrado." text.

Dark theme: body bg-slate-900, table bg-slate-800, borders border-slate-700, text slate-100.
Light theme: body bg-[#f4f6f8], table bg-white, borders slate-200, text slate-800.
Portuguese labels throughout.
```

---

## Prompt 2: Formulário de Cliente (Modal com Tabs)

```
DESIGN SYSTEM CONTEXT — [copiar bloco acima]

---

Design a responsive modal form for creating/editing a client in a clinic management app using Tailwind CSS.
Must support both Light and Dark modes. Mobile: full-screen modal, scrollable content.

MODAL STRUCTURE:
- Overlay: fixed, bg-black/50, centered content
- Modal: max-width 800px, bg card color (#fff light / #1e293b dark), rounded-lg, shadow-lg, 1px solid border, max-height 90vh, flex column layout
- Mobile: 100% width, 100% height, no rounded corners, no border

HEADER:
- "Editar Cliente" (or "Novo Cliente" based on context) as h3
- "×" close button on the right (muted text, hover darker)

BODY — SCROLLABLE TABBED INTERFACE:
- Horizontal scrollable tab bar (transparent bg, arrow buttons when overflow)
- Inactive tabs: muted text (#94a3b8 dark / #64748b light)
- Active tab: #6366f1 text + bottom border #6366f1
- 6 tabs total (last 2 only visible when editing an existing client):

**Tab 1 — "Dados Gerais":**
- Nome: text input with autocomplete dropdown (when typing in "new" mode, shows matching clients from API with name + phone, selectable to load full client data)
- Email: email input
- Telefone: tel input, placeholder "(DD) 99999-9999", auto-formatted mask
- Data de Nascimento: date input (max = today)
- Observações: text input
- Indicado Por: lookup/autocomplete field with client search (shows client ID + name in dropdown, selected shows as "ID | Name")

**Tab 2 — "Dados Pessoais":**
- Gênero: select dropdown (options: Feminino, Masculino, Outro, Não Informado)
- Endereço Completo: text input (full address in one field)
- Objetivo Principal: select dropdown (options like "Limpeza de Pele", "Design de Sobrancelha", "Micropigmentação", "Peeling", "Laminação", "Lifting de Cílios", "Microagulhamento", "Outro")
- If "Outro" selected: show additional text input "Descreva qual o objetivo principal"

**Tab 3 — "Condições de Saúde":**
- Grid layout (1 col mobile, 2 cols desktop) with toggle switches
- Each toggle: label text on left, switch on right (44x24px, OFF #ccc, ON #6366f1)
- Toggle items:
  1. "Está grávida ou amamentando?"
  2. "Possui alergias conhecidas?" → if ON, show text input "Quais?"
  3. "Possui problemas de pele (rosácea, dermatite, psoríase, etc.)?" → if ON, show text input "Quais?"
  4. "Tem diabetes, hipertensão ou outra condição crônica?"
  5. "Faz uso de medicamentos contínuos?" → if ON, show text input "Quais?"
  6. "Está usando ácidos, antibióticos ou isotretinoína (Roacutan)?" → if ON, show text input "Quais?"
  7. "Realizou cirurgias ou procedimentos estéticos recentes?" → if ON, show text input "Quais?"
- Conditional text inputs appear with a left border accent (2px solid #6366f1, padding-left)

**Tab 4 — "Hábitos":**
- Same grid layout as Tab 3
- Toggle items:
  1. "Usa protetor solar diariamente"
  2. "Costuma se maquiar todos os dias"
  3. "Tem rotina de skincare"
  4. "Usa produtos manipulados/prescritos"

**Tab 5 — "Anamneses" (only if editing existing client):**
- Header area: "+ Nova Anamnese" primary button aligned right
- Data table with columns: Data (date formatted DD/MM/YYYY), Tipo (colored badge), Observações, Ações
- Type badges with emoji + text:
  - "💆‍♀️ Facial" → green badge (bg #dcfce7, text #166534)
  - "👁️ Extensão de Cílios" → purple badge (bg #f3e8ff, text #7e22ce)
  - "🖊️ Micropigmentação" → yellow/orange badge (bg #fef9c3, text #854d0e)
- Action: delete button (✕, red)
- Clicking a row opens the Anamnesis detail modal (read-only view)
- Pagination on this embedded table

**Tab 6 — "Histórico" (only if editing existing client):**
- Embedded sales/transaction history table
- Columns: Data (formatted DD/MM/YYYY HH:mm), Itens (list of "[S] ServiceName" or "[P] ProductName"), Valor Total (R$ formatted, right-aligned)
- Alternating row shading
- Pagination on this embedded table

FOOTER:
- Fixed at bottom of modal (not scrolled)
- "Cancelar" secondary button + "Salvar" primary button (#6366f1)
- Border-top 1px solid border-color, padding 1rem

Dark theme: modal bg #1e293b, borders #334155, inputs bg same as card.
Light theme: modal bg #ffffff, borders #e2e8f0.
Portuguese labels throughout.
```

---

## Prompt 3: Ficha de Anamnese (Modal)

```
DESIGN SYSTEM CONTEXT — [copiar bloco acima]

---

Design a responsive anamnesis (clinical intake form) modal for a facial treatment clinic using Tailwind CSS.
Must support both Light and Dark modes. Fully usable on mobile and tablets.

MODAL STRUCTURE:
- Overlay: fixed, bg-black/50, scroll-y on overlay (content starts from top with 2rem padding)
- Modal: max-width 800px, bg card color, rounded-lg, shadow-xl, flex column layout
- Mobile: 100% width, full height

HEADER:
- "Ficha de Anamnese - {Tipo}" as h2 (e.g., "Ficha de Anamnese - Facial")
- "×" close button
- If read-only mode: blue info banner below header "ℹ️ Ficha de Anamnese — Apenas Leitura" (bg light blue #e0f2fe, text #0369a1)

BODY — SCROLLABLE (max-height calc(100vh - 200px)):
- Content organized in visual sections with cards (bg card, rounded-md, 1px solid border, 1rem padding)
- Each section has a colored title with emoji icon, underlined with border-bottom

**Section: Type Selector (only on creation, hidden on edit/view):**
- "Tipo de Anamnese *" label
- Select dropdown with options: "Selecione o tipo de anamnese", "Facial", "Extensão de Cílios", "Micropigmentação"
- Once selected, show remaining form sections

**Section: Common Fields:**
- "Data do Atendimento": date input (required)

**Section: Dynamic form based on selected type.**
For "Facial" type specifically:

  **Sub-section "👩 Dados da Cliente":**
  - "Queixa Principal / Motivo da Consulta": textarea (2 rows)
  - "Profissão": text input

  **Sub-section "🧴 Rotina de Cuidados":**
  - Grid (2 cols desktop, 1 col mobile) with toggle switches (same style: 44x24px, OFF #ccc, ON #6366f1):
    - "Usa protetor solar diariamente?"
    - "Usa maquiagem com frequência?"
    - "Faz uso de cosméticos/ácidos?" → if ON: show text input "Quais cosméticos/ácidos?" with left indigo border accent
  
  **Sub-section "⚠️ Histórico Clínico e Saúde":**
  - Grid of toggle switches:
    - "Possui diabetes, hipertensão ou doença autoimune?" → if ON: detail text input
    - "Faz uso de anticoagulantes?"
    - "Realizou procedimentos faciais anteriores?" → if ON: detail text input
    - "Usa sabonete facial?"
    - "Usa hidratante?"
    - "Fumante?"
  - Conditional text inputs appear with left border accent (2px solid #6366f1, padding-left)

  **Sub-section "🔍 Avaliação Profissional":**
  - "Tipos e Características da Pele": chip/pill multi-select (can select multiple)
    - Options: "Normal", "Oleosa", "Seca", "Mista", "Envelhecida", "Sensível", "Acneica", "Desidratada"
    - Unselected: light gray bg (#f1f5f9), slate border (#cbd5e1), dark text
    - Selected: indigo-50 bg (#e0e7ff), #6366f1 border, indigo-900 text, font-weight 500
    - Dark mode: unselected bg #1e293b border #475569, selected bg indigo-900/30 border #6366f1
  - "Tratamentos Sugeridos": textarea (2 rows)

**Section: Common Observables:**
- "Observações da Profissional": textarea (3 rows), placeholder "Adicione notas visíveis apenas para a clínica..."
- Horizontal divider (1px solid border-color)

**Section: Consent (inside a highlighted card with body bg, rounded-md, 1px border):**
- Checkbox: "Declaro que as informações fornecidas são verdadeiras e estou ciente dos procedimentos, riscos e cuidados necessários. *" (required)
- Checkbox: "Autorizo registro fotográfico e divulgação nas mídias sociais."
- Checkboxes have label text wrapping, flex-start alignment

FOOTER:
- Fixed at bottom
- "Cancelar" secondary button (or "Fechar" if read-only mode)
- "Salvar" primary button (#6366f1, disabled if consent not checked or if read-only mode)
- In read-only mode: only "Fechar" button visible

All form controls disabled in read-only mode (opacity 0.6, cursor not-allowed on toggles).
Dark theme consistent with design system.
Portuguese labels throughout.
```

---

## Prompt 4: Aba "Condições de Saúde" (Usando Imagem de Referência)

**Instrução para o Stitch:** Faça o upload da imagem de referência (screenshot da aba Condições de Saúde escuro/roxa) e envie este prompt.

```
DESIGN SYSTEM CONTEXT — [copiar bloco acima]

---

Design the "Condições de Saúde" tab content for the Client Edit Modal using Tailwind CSS.
Use the provided image as an structural layout reference, but strictly apply the styling rules from the DESIGN SYSTEM CONTEXT.
Must support both Light and Dark modes. Generate the Dark Mode version to match the reference.

CONTENT AND LAYOUT REQUIREMENTS (Based on reference image):
- The layout is a centered list of "Yes/No" questions.
- Each item consists of a question text centered above a toggle switch.
- The toggle switches must follow the Design System (44x24px, OFF #ccc, ON #6366f1, white knob).
- In the reference image, the first two toggles ("Está grávida ou amamentando?" and "Possui alergias conhecidas?") are ON (active, indigo color).
- The "Possui alergias conhecidas?" toggle being ON triggers a text input field to appear directly below it.
- This conditional text input must have a left border accent (2px solid #6366f1) and a dark background (#1E222B) with a subtle slate border, matching the Design System for Dark Mode inputs. The placeholder text in the image is "wwwwwwwww", but use a realistic placeholder like "Descreva as alergias...".
- The remaining toggles ("Possui problemas de pele...", "Tem diabetes...", "Faz uso de medicamentos...", "Está usando ácidos...", "Realizou cirurgias...") are OFF (gray).
- Ensure adequate vertical spacing (spacing-md or spacing-lg) between each question block.
- The background of this panel should be the modal content background (#1e293b).
- Text color should be #f1f5f9 (slate-100) for the questions.
```

---

## Prompt 5: Aba "Histórico" (Usando Imagem de Referência)

**Instrução para o Stitch:** Faça o upload da imagem de referência (screenshot da aba Histórico com a tabela escura) e envie este prompt.

```
DESIGN SYSTEM CONTEXT — [copiar bloco acima]

---

Design the "Histórico" tab content for the Client Edit Modal using Tailwind CSS.
Use the provided image as an structural layout reference, but strictly apply the styling rules from the DESIGN SYSTEM CONTEXT.
Must support both Light and Dark modes. Generate the Dark Mode version to match the reference.

CONTENT AND LAYOUT REQUIREMENTS (Based on reference image):
- The layout is a data table displaying the client's service history.
- The table has 3 columns: "Data" (left-aligned), "Itens" (left-aligned), and "Valor Total" (right-aligned).
- Table Header: Darker background (#1f2937 or similar slate-800) with small, muted text (#94a3b8). Sort indicators are visible next to column names.
- Table Rows: Alternating background colors for readability. Even rows have a slightly lighter background (e.g., #334155 opacity 20%) than odd rows (#1e293b).
- Data formatting:
  - "Data": DD/MM/YYYY, HH:mm (e.g., "24/10/2025, 14:00")
  - "Itens": Miltiline text. Example: "[S] Manutenção anual micro\n[S] Design de sobrancelhas". Use small text for these items.
  - "Valor Total": Currency format "R$ 40,00".
- The second row in the reference image is highlighted/selected with a purple background accent (#2e1065 or similar deep indigo/purple from the brand palette). Implement this row hover or active state styling.
- Pagination Footer: Located at the bottom of the table. "Mostrando 1 a 6 de 6 registros" on the left. Navigation controls "< Anterior | Página 1 de 1 | Próximo >" on the right.
- The pagination footer must have a border-top and use muted text.
```

---

## Prompt 6: Lista de Clientes - Banner de Insights da IA (Usando Imagem de Referência)

**Instrução para o Stitch:** Faça o upload da imagem de referência (screenshot da Lista de Clientes com o bloco "Análise de Retenção IA") e envie este prompt.

```
DESIGN SYSTEM CONTEXT — [copiar bloco acima]

---

Design the "Insights de IA" banner component for the Client List page using Tailwind CSS.
Use the provided image as a structural reference for where this component lives (between the header and the filters), but improve its visual design so it stands out as an "AI Feature" without being visually overwhelming.
Must support both Light and Dark modes. Generate the Dark Mode version.

CONTENT AND LAYOUT REQUIREMENTS (Based on reference image):
- Position: Below the main "Clientes" header and above the pill filters / data table.
- Container: Make it a distinct, wide card. Instead of just plain text on the background like the image, wrap it in a container with a subtle background tint (e.g., a very dark, low-opacity indigo/purple mix like #312e81 at 20% opacity) and a soft border (#4c1d95 or similar). It needs to look like a designated "smart" zone.
- Iconography: Add a subtle AI sparkles icon (✨) next to the "Análise de Retenção IA" title to reinforce the AI context.
- Title: "Análise de Retenção IA" - slightly bolder or with a primary accent color (#818cf8).
- Body Text: The main insight text (e.g., "Há 91 clientes em risco, sendo que ISABELA ABRAÃO..."). Text should be highly readable, using secondary text colors (#cbd5e1), with key data points (like client names or ID numbers) slightly highlighted (e.g., white text or subtle indigo text) to make scanning easier.
- Action Link: Keep the "Ver todos na Central Githa AI →" link at the bottom of the card. Make it look like a clickable tertiary action (small, indigo text, hover underline).
- Visual Balance: Ensure it doesn't compress the table too much. Use padding thoughtfully (e.g., p-4 or p-5) and keep the text concise.
```

## Dicas de Uso

1. **Sempre inclua o bloco "DESIGN SYSTEM CONTEXT"** no início de cada prompt para manter consistência visual entre todas as telas geradas.

2. **Itere no Stitch** — após gerar cada tela, use o recurso "Edit" para ajustar detalhes visuais sem recriar do zero.

3. **Gere variantes** — use "Generate Variants" do Stitch para explorar diferentes estilos mantendr o mesmo conteúdo.

4. **Device types no Stitch:**
   - Use `DESKTOP` para as telas principais
   - Use `MOBILE` para validar a responsividade
   - Use `TABLET` para verificar o layout intermediário

5. **Fluxo sugerido:**
   1. Gere a Lista de Clientes (Desktop) → revise e ajuste
   2. Gere a Lista de Clientes (Mobile) → valide cards layout
   3. Gere o Formulário de Cliente → valide cada tab
   4. Gere a Ficha de Anamnese → valide seções e chips
   5. Use as telas como referência para implementar no Vue.js

# Refinamento: Modernização da Agenda (Appointments)

## Objetivo
Transformar a atual tela de Agendamentos (hoje baseada em uma tabela genérica) em uma experiência visual rica, responsiva e intuitiva usando Tailwind CSS, aproximando-se de uma verdadeira ferramenta de "Gestão de Agenda" ou Prontuário Eletrônico.

## Visões e Sugestões

Atendendo ao seu pedido de ter pelo menos duas visões (Calendário e Lista), desenvolvi as sugestões abaixo. Também incluí algumas ideias extras (Visão de Recursos e Kanban) que costumam ser o grande diferencial em softwares de clínicas com alto volume:

### 1. Visão de Calendário (Google Calendar Style)
Uma visualização em grade com blocos de tempo literais.
*   **Layout:** O eixo Y representa os horários (ex: 08:00, 08:30, 09:00) e o eixo X os dias da semana (semanal) ou focado no dia atual.
*   **Cards Proporcionais:** A altura do bloco (card) de agendamento é desenhada de forma proporcional à duração do serviço (um bloco de 1h será visivelmente o dobro de um de 30min).
*   **Identidade Visual do Status:** O fundo do bloco de tempo pode herdar a cor do status da consulta (Ex: fundo verde e borda esmeralda para "Confirmado", fundo azulado para "Agendado", fundo laranja para "Falta").

### 2. Visão de Listagem (Resumo do Dia / Agenda List)
Substitui a tabela de dados atual por uma lista em blocos (timeline horizontal). Focaliza leituras rápidas da recepção.
*   **Linha do Tempo Clean:** Agrupamentos visuais dividindo o dia, e as consultas listadas ordenadamente pelo horário.
*   **Design da Linha:** 
    * *Esquerda:* Horário formatado bem grande (ex: `14:00 - 15:00`).
    * *Meio:* Iniciais do cliente (Avatar) + Nome do Cliente, Serviço, e Nome do Profissional.
    * *Direita:* Status Badge tradicional (como os da lista de clientes) e Actions minimalistas em ícone (Confirmar [✓], Concluir [★], Excluir [✕]).

### 3. Sugestão Extra: Visão "Recursos" (Timeline View / Daily by Professional)
*   **Por que sugerir:** Clínicas ou salões de beleza que possuem mais de um profissional atendendo simultaneamente usam massivamente essa visão.
*   **Como funciona:** Foca-se em um único dia. O eixo Y continua sendo o tempo. No entanto, o **eixo X passa a ser as colunas dos Profissionais** (Ex: Coluna 1 = Dra. Ana, Coluna 2 = Dr. Carlos). É a única forma de bater o olho na tela e descobrir que há um "buraco na agenda" às 14h porque as três colunas estão vazias naquele horário.

### 4. Sugestão Extra: Agenda Kanban (Gestão do Fluxo Diário)
*   **Por que sugerir:** Facilita o trabalho da recepção rastreando *onde o paciente está*.
*   **Como funciona:** Um board com as colunas baseadas no Status da Consulta: "Agendado", "Aguardando Recepção", "Em Atendimento", e "Finalizado". O recepcionista ou médico só precisa arrastar o card ("drag and drop") entre as colunas conforme o paciente progride na clínica durante o dia de hoje.

## Elementos Chaves da Nova Interface (O que devemos construir)
1.  **Header da Agenda Totalmente Novo:**
    *   Navegação temporal rápida (`< Hoje >` e um mini-calendário popover).
    *   Toggles ou Tabs de visualização (`Mês | Semana | Dia | Lista | Profissionais`).
    *   Espaço dedicado para os Selects de Filtro Múltiplo (Por qual profissional quero filtrar a visão de lista?).
2.  **Modal Reestruturado (`AppointmentForm`):**
    *   O layout ficará idêntico à experiência unificada que desenhamos no `ClientForm` e `ProfessionalForm` (Modal blur, campos organizados, toggle Ativo, autocomplete flutuante para clientes e serviços, cálculo de hora final automático baseado no começo).

## Validação Visual via GenAI
Acabamos de disparar um prompt para o modelo de geração de UI (Google Stitch) visando as principais visões (Calendário e Lista) para obtermos mockups e darmos o pontapé inicial no desenvolvimento de acordo com essas abstrações!

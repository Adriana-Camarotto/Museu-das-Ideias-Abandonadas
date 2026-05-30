# Componentes Reutilizáveis

Este documento resume a padronização de UI feita no frontend, com foco em reutilização e consistência visual.

## Objetivo

Evitar repetição de markup/classes, facilitar manutenção e criar uma base de design system simples para o projeto.

## Componentes Criados

### 1. Button
Arquivo: `src/components/Button.jsx`

Componente base para botões com variantes visuais e estados compartilhados.

Variantes disponíveis:
- `primary`: botão principal de ação (ex.: enviar formulário)
- `secondary`: botão secundário (ex.: limpar/resetar)
- `nav`: botão de navegação lateral
- `icon`: botão compacto de ícone (ex.: fechar modal)

Props principais:
- `variant` (default: `primary`)
- `type` (default: `button`)
- `active` (usado em `nav`)
- `disabled`
- `className`
- quaisquer props nativas de `<button>` (`onClick`, `aria-*`, etc.)

Exemplo:

```jsx
<Button variant="primary" type="submit">
  Salvar
</Button>
```

### 2. Panel
Arquivo: `src/components/Panel.jsx`

Componente de container para blocos com fundo/borda do tema do Museu.

Variantes disponíveis:
- `soft`: painel translúcido com borda suave
- `solid`: painel sólido escuro

Props principais:
- `variant` (default: `soft`)
- `as` (tag do elemento, default: `div`)
- `className`
- `children`

Exemplo:

```jsx
<Panel className="p-6">
  Conteúdo
</Panel>
```

### 3. Alert
Arquivo: `src/components/Alert.jsx`

Componente para mensagens semânticas de feedback ao usuário.

Variantes disponíveis:
- `error`
- `success`
- `info`
- `warning`

Props principais:
- `variant` (default: `info`)
- `title`
- `message`
- `icon` (opcional, substitui ícone padrão)
- `className`
- `children` (conteúdo adicional)

Exemplo:

```jsx
<Alert
  variant="error"
  title="Erro ao processar"
  message="Tente novamente em instantes."
/>
```

## Onde Foi Reaplicado

- `src/components/IdeaForm.jsx`
  - Botões migrados para `Button`
  - Bloco de erro migrado para `Alert`

- `src/components/Sidebar.jsx`
  - Itens de navegação migrados para `Button` (`variant="nav"`)

- `src/components/MuseumModal.jsx`
  - Botão de fechar migrado para `Button` (`variant="icon"`)

- `src/components/AnalysisResult.jsx`
  - Blocos repetidos de conteúdo migrados para `Panel`

- `src/components/ModalContent.jsx`
  - Cards informativos migrados para `Panel`

## Benefícios Obtidos

- Menos duplicação de classes Tailwind
- Consistência visual entre telas
- Mudanças globais de estilo mais simples
- Melhor legibilidade dos componentes de negócio

## Próximos Passos Recomendados

1. Criar `SectionHeader` para títulos/subtítulos repetidos
2. Criar `StatusIndicator` para status online/offline e loading
3. Extrair tokens visuais (cores/espaçamentos) para um arquivo de tema compartilhado
4. Adicionar testes de snapshot/render para os componentes reutilizáveis

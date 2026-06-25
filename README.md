# SysAlmoxarifado - Controle de Estoque (Enfermagem)

Este projeto foi desenvolvido para a disciplina de Desenvolvimento Mobile com o objetivo de modernizar e digitalizar o controle de insumos médicos do almoxarifado de enfermagem. 

O sistema substitui os antigos rascunhos de papel e planilhas manuais por um aplicativo mobile integrado a uma API em tempo real.

---

## 🛠️ Tecnologias e Bibliotecas Utilizadas

- **React Native** (Interface nativa e responsiva)
- **Expo** (Ambiente de desenvolvimento e build)
- **MockAPI** (Persistência de dados através de serviços REST)
- **Jest & Testing Library** (Estrutura de testes automatizados e assíncronos)
- **Expo Vector Icons (FontAwesome)** (Identidade visual e ícones clínicos)

---

## 🛠️ Evolução do Projeto & Funcionalidades

###  Sprint 1: Estrutura Base & CRUD de Materiais
- **Integração com API REST:** Conexão assíncrona com o servidor *MockAPI*  para persistência dos dados de insumos médicos.
- **Operações de CRUD:** Listagem dinâmica de materiais cadastrados e formulário funcional para adição de novos insumos.
- **Interface Base:** Estrutura visual desenvolvida em React Native focando no almoxarifado de enfermagem.

###  Sprint 2: Movimentação de Estoque & Validações
- **Operação de Baixa Automática:** Implementação do campo de quantidade e do botão "Baixar" para deduzir itens do estoque de forma rápida.
- **Validação de Regras de Negócio:** Integração de funções puras e isoladas para validar se a quantidade a ser retirada está disponível, bloqueando valores negativos ou acima do saldo atual.
- **Aviso de Estoque Zerado:** Emissão de alertas visuais (`Estoque: 0` em vermelho e negrito) e avisos em tempo real caso o insumo acabe por completo no almoxarifado.

###  Sprint 3: Filtros, Alertas Críticos & Resiliência
- **Filtro de Pesquisa em Tempo Real:** Campo de busca dinâmico para filtragem instantânea de materiais por nome à medida que o usuário digita (`testID="input-busca"`).
- **Indicador de Estoque Crítico:** Alerta visual que altera o fundo e a borda do cartão do material para tons de vermelho claro quando a quantidade em estoque é menor que 10 unidades (`accessibilityLabel="estoque-critico"`).
- **Dashboard com Totalizador:** Contador fixado no topo da listagem que exibe em tempo real o número exato de itens exibidos com base no filtro aplicado (`testID="total-itens"`).
- **Resiliência e Tratamento de Erros:** Blocos `try/catch` robustos em todas as operações HTTP (`GET`, `POST`, `PUT`, `DELETE`), exibindo mensagens amigáveis na tela caso ocorra instabilidade ou queda na conexão com a rede.
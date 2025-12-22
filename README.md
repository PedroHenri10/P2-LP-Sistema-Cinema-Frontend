# CineManager - Frontend

Este é o **Frontend** do sistema de gerenciamento de cinema "CineManager". A aplicação oferece uma interface visual interativa para administradores gerenciarem filmes, salas, sessões e vendas de ingressos.

## 🖥️ Funcionalidades

A interface é dividida em quatro painéis principais:

1.  **Gerenciar Filmes:**
    *   Listagem de filmes cadastrados.
    *   Filtros por nome, categoria (Ação, Comédia, Drama) e classificação indicativa.
    *   Formulário para cadastro de novos filmes (Título, Duração, Classificação, Gênero e Sinopse).
    *   Modal de detalhes do filme.

2.  **Mapa das Salas:**
    *   Visualização das salas de cinema disponíveis.
    *   Status das salas (Ativa/Inativa).

3.  **Gerenciar Sessões:**
    *   Listagem de sessões agendadas.
    *   Filtros por filme, sala e data.
    *   Criação de novas sessões associando Filme + Sala + Horário + Preço.

4.  **Vendas (Bilheteria):**
    *   Sistema de Ponto de Venda (PDV).
    *   Seleção de sessão.
    *   **Mapa de Assentos Interativo:** Seleção visual de assentos livres/ocupados.
    *   Cálculo automático do valor total.
    *   Registro de venda com nome do cliente.

## 🚀 Tecnologias Utilizadas

*   **HTML5:** Estrutura semântica.
*   **CSS3:** Estilização com design responsivo, variáveis CSS (`:root`), Flexbox e Grid Layout. Tema escuro (Dark Mode).
*   **JavaScript (Vanilla):** Lógica de interação com o DOM e consumo da API (arquivo `app.js`).

## 📂 Estrutura de Arquivos

*   `index.html`: Arquivo principal contendo a estrutura da Single Page Application (SPA).
*   `style.css`: Folhas de estilo contendo o tema "CineAdmin".
*   `app.js`: (Necessário) Contém a lógica de frontend e chamadas `fetch` para a API.
*   `assets/`: Pasta para imagens e recursos estáticos.

## 📦 Como rodar o projeto

1.  Certifique-se de que a **API (Backend)** esteja rodando (veja as instruções do backend).
2.  Clone este repositório.
3.  Abra o arquivo `index.html` em seu navegador.
    *   *Recomendação:* Utilize uma extensão como **Live Server** (VS Code) para evitar erros de CORS ao carregar módulos ou recursos locais.

## 🎨 Design

O projeto utiliza um design moderno com transparências (`backdrop-filter`), fontes da família 'Inter' e um esquema de cores focado em alto contraste para ambientes de cinema (fundo escuro com acentos em vermelho e verde).
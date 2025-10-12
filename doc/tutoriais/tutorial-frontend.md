# Tutorial: Criando uma Nova Página no Frontend do GranaLivre

Bem-vindo ao guia de desenvolvimento frontend do GranaLivre! Este tutorial irá guiá-lo pelo processo de criação de uma nova página, explicando nossa estrutura de arquivos e como integrar a lógica de autenticação usando as melhores práticas do Next.js App Router.

## 1. Entendendo a Estrutura de Arquivos
Nosso projeto frontend utiliza uma estrutura organizada para separar responsabilidades, facilitando a manutenção e a escalabilidade.
  - app/: O coração do nosso sistema de roteamento. Cada pasta dentro de app/ representa uma rota (URL) da aplicação.
    - app/entrar/page.js: Define a página /entrar.
  - components/: Contém componentes React reutilizáveis que formam a UI da nossa aplicação.
    - components/layout/: Componentes de estrutura, como a TopBar e o Footer.
    - components/user/: Componentes relacionados ao usuário, como modais de edição e exclusão.
  - config/: Arquivos de configuração que não contêm lógica, apenas dados.
    - config/content.js: Armazena textos e conteúdos, como os da landing page.
    - config/styles.js: Armazena constantes de estilo (classes Tailwind) para manter a consistência visual.
  - context/: Gerenciamento de estado global do lado do cliente.
    -context/AuthContext.js: O nosso provedor de autenticação, que disponibiliza informações do usuário e funções (logout, refreshUser) para os componentes de cliente.
  - lib/: Funções de suporte e lógica de negócios (nossa "biblioteca" de código).
    - lib/api.js: Centraliza todas as chamadas à nossa API backend feitas pelo cliente.
    - lib/axiosInstance.js: Configuração da instância do Axios, incluindo os interceptors para renovação de tokens.
    - lib/serverAuth.js: Utilitário para validar a sessão do usuário no lado do servidor (em Componentes de Servidor).

## 2. Criando uma Nova Rota (Página)
Com o App Router do Next.js, criar uma nova página é muito simples:
  1. Dentro da pasta app/, crie uma nova pasta com o nome da rota desejada (ex: app/extrato/).
  2. Dentro da nova pasta, crie um arquivo chamado page.js.
  3. Este arquivo page.js exportará o componente React que será renderizado quando o usuário acessar a rota.

## 3. Padrões de Autenticação para Páginas
A melhor forma de proteger uma página é fazer a verificação no servidor. Temos dois cenários principais:

#### Cenário A: Página Privada Apenas para Exibição
Para páginas que apenas exibem informações e não possuem interatividade complexa (formulários, botões com estado, etc.), podemos usar um único Componente de Servidor.

Exemplo: Criando uma página /extrato

1. Crie o arquivo app/extrato/page.js.
2. Adicione o seguinte código:

```js
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/serverAuth';
import TopBar from '@/components/layout/topbar/TopBar';

/**
 * A página de Extrato é um Componente de Servidor.
 * Ela valida a sessão e, se for válida, renderiza o conteúdo.
 */
export default async function ExtratoPage() {
  // 1. Valida a sessão no servidor. Graças ao React.cache, esta chamada é otimizada.
  const user = await validateSession();

  // 2. Se não houver usuário, redireciona para a página de login.
  if (!user) {
    redirect('/entrar?redirect=/extrato');
  }

  // 3. Se a sessão for válida, renderiza o conteúdo.
  return (
    <main className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Extrato Financeiro</h1>
        <p className="text-gray-600 mt-2">
          Olá, {user.username}! Aqui está o seu extrato completo.
        </p>
        {/* O conteúdo do extrato viria aqui */}
      </div>
    </main>
  );
}
```

#### Cenário B: Página Privada e Interativa (Padrão Recomendado)
Para páginas que terão interatividade (formulários, botões que disparam ações, etc.), usamos um padrão mais robusto:

1. page.js (Componente de Servidor): Atua como uma "casca". Ele valida a sessão e passa os dados de usuario para um componente filho.
2. Componente Filho (Componente de Cliente): Recebe os dados iniciais via props e gerencia toda a interatividade.

Exemplo: Criando uma página /perfil interativa

##### Passo 1: Crie a "Casca" do Servidor
Crie o arquivo app/perfil/page.js. Este arquivo protege a rota.

```js
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/serverAuth';
import TopBar from '@/components/layout/topbar/TopBar';
import ProfileClient from './ProfileClient'; // Importa o componente de cliente

/**
 * Esta é a "casca" da página de perfil. É um Componente de Servidor.
 */
export default async function PerfilPage() {
  // 1. Valida a sessão e obtém os dados do usuário.
  const user = await validateSession();

  // 2. Protege a rota.
  if (!user) {
    redirect('/entrar?redirect=/perfil');
  }

  // 3. Renderiza o componente de cliente, passando os dados do usuário como prop.
  return (
    <main className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Os dados validados no servidor são "injetados" no cliente */}
        <ProfileClient user={user} />
      </div>
    </main>
  );
}
```

##### Passo 2: Crie o Componente de Cliente Interativo

Crie o arquivo app/perfil/ProfileClient.js. Este arquivo conterá a UI e a lógica interativa.

```js
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

/**
 * Este é um Componente de Cliente. Ele gerencia a interatividade.
 */
export default function ProfileClient({ user: initialUser }) {
  // Usa o AuthContext para acessar FUNÇÕES, como refreshUser.
  const { refreshUser } = useAuth();
  
  // O estado local é inicializado com os dados do servidor para evitar "flicker".
  const [user, setUser] = useState(initialUser);

  const handleRefresh = async () => {
    await refreshUser();
    // A função refreshUser atualiza o estado global
    // com os dados mais recentes fornecidos pelo backend
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Perfil de {user.username}
      </h1>
      <p className="text-gray-600 mt-2">
        Email: {user.email}
      </p>

      <button
        onClick={handleRefresh}
        className="mt-4 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Atualizar Informações
      </button>
    </div>
  );
}
```

## 4. Por que usar o Padrão Servidor + Cliente?
- Performance: A página carrega instantaneamente com os dados corretos, pois o servidor envia o HTML já pronto.
- Sem "Flicker": A interface não "pisca" de um estado deslogado para logado, pois o cliente é inicializado com os dados corretos (useState(initialUser)).
- Separação de Responsabilidades: A lógica do servidor (busca de dados, segurança) fica separada da lógica do cliente (interatividade, estado da UI).

## 5. Conclusão
Parabéns! Você aprendeu a navegar pela nossa estrutura de arquivos e a criar páginas seguras e performáticas, utilizando os padrões mais modernos do Next.js.
  - Para páginas simples: Um único Componente de Servidor é suficiente.
  - Para páginas interativas: Use o padrão Servidor (casca) + Cliente, passando os dados via props.
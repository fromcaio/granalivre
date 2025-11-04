# Tutorial: Criando uma Nova Página no Frontend do GranaLivre

Bem-vindo ao guia de desenvolvimento frontend do GranaLivre!
Neste tutorial, você aprenderá como criar uma nova página seguindo o padrão de separação entre **componentes de servidor** e **componentes de cliente**, utilizando o App Router do **Next.js**.

---

## 1. Estrutura de Arquivos

Nosso projeto frontend segue uma estrutura modular que separa responsabilidades e facilita a manutenção:

* **app/**: Onde ficam as rotas da aplicação. Cada subpasta representa uma página (ex: `app/entrar/page.js` → `/entrar`).
* **components/**: Contém componentes React reutilizáveis.

  * `components/layout/`: Estrutura da UI (TopBar, Footer etc.)
  * `components/user/`: Elementos relacionados ao usuário (modais, formulários etc.)
* **config/**: Arquivos de configuração e constantes (textos e estilos globais).
* **context/**: Estado global do cliente (ex: `AuthContext.js` com login, logout, refresh).
* **lib/**: Funções utilitárias e lógica de negócios.

  * `lib/api.js`: Centraliza chamadas à API backend.
  * `lib/axiosInstance.js`: Configuração da instância Axios e interceptors.
  * `lib/serverAuth.js`: Valida a sessão do usuário no **lado do servidor**.

---

## 2. Criando uma Nova Página

Com o App Router, criar uma página é simples:

1. Crie uma pasta dentro de `app/` com o nome da rota desejada (ex: `app/perfil/`).
2. Dentro dela, crie dois arquivos:

   * `page.js`: **Componente de Servidor** — responsável por validar a sessão e renderizar o conteúdo inicial.
   * `PerfilClient.js`: **Componente de Cliente** — responsável pela interatividade da página.

---

## 3. Exemplo Prático: Página `/perfil`

### 🧩 Passo 1 — Componente de Servidor (`page.js`)

O componente de servidor protege a rota, valida a sessão e envia os dados do usuário ao cliente.

```js
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/serverAuth';
import TopBar from '@/components/layout/topbar/TopBar';
import PerfilClient from './PerfilClient';

export default async function PerfilPage() {
  // 1. Valida a sessão do usuário no servidor
  const user = await validateSession();

  // 2. Se não estiver logado, redireciona para /entrar
  if (!user) {
    redirect('/entrar?redirect=/perfil');
  }

  // 3. Renderiza o componente de cliente, passando os dados
  return (
    <main className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <PerfilClient user={user} />
      </div>
    </main>
  );
}
```

---

### ⚙️ Passo 2 — Componente de Cliente (`PerfilClient.js`)

O componente de cliente lida com a lógica interativa, utilizando o contexto de autenticação.

```js
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function PerfilClient({ user: initialUser }) {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState(initialUser);

  const handleRefresh = async () => {
    await refreshUser();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Perfil de {user.username}
      </h1>
      <p className="text-gray-600 mt-2">Email: {user.email}</p>

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

---

## 4. Por Que Separar Servidor e Cliente?

* **Segurança**: O servidor valida a sessão antes de renderizar qualquer conteúdo.
* **Performance**: O HTML chega ao navegador já com os dados corretos.
* **Experiência fluida**: Sem “flicker” de estado (logado ↔ deslogado).
* **Organização**: Lógica de autenticação no servidor, interatividade no cliente.

---

## 5. Conclusão

Você aprendeu a criar uma nova página no frontend do GranaLivre, aplicando o padrão **Servidor + Cliente**:

1. `page.js` → valida sessão e envia dados iniciais.
2. `PerfilClient.js` → gerencia interatividade e atualizações.

Esse padrão mantém o código limpo, seguro e performático — e é o modelo recomendado para todas as novas páginas do projeto.
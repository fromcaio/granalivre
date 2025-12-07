import { redirect } from 'next/navigation';
import { headers } from "next/headers";
import { validateSession, fetchAccountsServer } from '@/lib/serverAuth';
import TopBar from '@/components/layout/topbar/TopBar';
import SideMenu from "@/components/layout/sidebar/SideMenu";
import ContasPageClient from './ContasPageClient'; // Este é o nosso componente de cliente

/**
 * Página de Contas (Server Component)
 * * Responsável por:
 * 1. Validar a sessão do usuário no servidor.
 * 2. Redirecionar para /entrar se o usuário não estiver logado.
 * 3. Renderizar a TopBar e o componente de cliente (ContasPageClient).
 */
export default async function ContaPage() {
  // 1. Valida a sessão
  const user = await validateSession();

  // 2. Redireciona se não estiver logado
  if (!user) {
    redirect('/entrar?redirect=/contas');
  }

  const cookieHeader = (await headers()).get("cookie") || "";
  const initialAccounts = await fetchAccountsServer(cookieHeader);

  // 3. Renderiza o layout principal e passa o usuário para o cliente
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex flex-col sm:flex-row min-h-[calc(100vh-64px)]">
          <div className="h-full sm:h-auto flex-shrink-0">
            <SideMenu activeLabel="Conta Corrente" />
          </div>
          <div className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6">
            <div className="w-full">
              {/* Passa o usuário validado e dados iniciais para o componente de cliente */}
              <ContasPageClient user={user} initialAccounts={initialAccounts} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/serverAuth';
import TopBar from '@/components/layout/topbar/TopBar';
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
    redirect('/entrar?redirect=/conta');
  }

  // 3. Renderiza o layout principal e passa o usuário para o cliente
  return (
    <main className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Passa o usuário validado para o componente de cliente */}
        <ContasPageClient user={user} />
      </div>
    </main>
  );
}
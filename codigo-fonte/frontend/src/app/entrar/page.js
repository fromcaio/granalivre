import { validateSession } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';
import LoginPageClient from './LoginPageClient';

/**
 * Este é o ponto de entrada para a rota /entrar.
 * Atua como um "porteiro" no lado do servidor.
 */
export default async function LoginPage({ searchParams }) {
  // 1. Verifica a sessão no servidor. A chamada é otimizada pelo React.cache.
  const user = await validateSession();

  // 2. Se o usuário já estiver logado, redireciona imediatamente.
  //    O navegador recebe uma resposta de redirecionamento antes de renderizar qualquer coisa.
  if (user) {
    const redirectPath = searchParams.redirect || '/';
    redirect(redirectPath);
  }

  // 3. Se não houver usuário, renderiza o componente de cliente com o formulário.
  return <LoginPageClient />;
}
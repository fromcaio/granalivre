import { validateSession } from '@/lib/serverAuth';
import RegisterPageClient from './RegisterPageClient';
import AlreadyLoggedIn from './AlreadyLoggedIn';

/**
 * Este é o ponto de entrada para a rota /cadastrar.
 * Atua como um "porteiro" no lado do servidor.
 */
export default async function RegisterPage() {
  // 1. Verifica a sessão no servidor. A chamada é otimizada pelo React.cache.
  const user = await validateSession();

  // 2. Se o usuário já estiver logado, renderiza o componente de aviso.
  if (user) {
    return <AlreadyLoggedIn user={user} />;
  }

  // 3. Se não houver usuário, renderiza o componente de cliente com o formulário.
  return <RegisterPageClient />;
}
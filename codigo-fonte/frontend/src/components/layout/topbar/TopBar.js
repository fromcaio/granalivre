import Link from 'next/link';
import { validateSession } from '@/lib/serverAuth';
import UserMenu from './UserMenu'; // O menu do usuário continua sendo um Componente de Cliente

/**
 * A TopBar agora é um Componente de Servidor assíncrono.
 * 1. Ela busca a sessão do usuário no servidor.
 * 2. Renderiza o UserMenu (para usuários logados) ou os links de Login/Cadastro.
 * 3. Passa os dados do usuário (`user`) como uma prop para o UserMenu.
 */
export default async function TopBar() {
  // A chamada é "gratuita" graças ao React.cache em validateSession
  const user = await validateSession();

  return (
    <nav className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-white text-xl sm:text-2xl font-bold hover:text-green-100 transition">
              GranaLivre
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              // Passamos o usuário validado no servidor como prop para o componente de cliente
              <UserMenu user={user} />
            ) : (
              // Conteúdo para usuários deslogados
              <>
                <Link
                  href="/cadastrar"
                  className="text-white text-sm sm:text-base font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Cadastrar
                </Link>
                <Link
                  href="/entrar"
                  className="bg-white text-green-600 text-sm sm:text-base font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-50 transition"
                >
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
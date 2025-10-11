'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { landingPageContent } from '@/config/content'; // Importar o conteúdo centralizado

// Componente para o Cabeçalho (Hero Section)
const HeroSection = () => (
  <section className="text-center py-20">
    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 animate-fade-in-down">
      {landingPageContent.hero.title}
    </h1>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in-up">
      {landingPageContent.hero.subtitle}
    </p>
    <div className="flex justify-center gap-4">
      <Link href="/entrar" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105">
        {landingPageContent.hero.ctaLogin}
      </Link>
      <Link href="/cadastrar" className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105">
        {landingPageContent.hero.ctaRegister}
      </Link>
    </div>
  </section>
);

// Componente para a Seção "Sobre"
const AboutSection = () => (
  <section className="py-20 bg-white p-8 rounded-lg shadow-lg">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="order-2 md:order-1">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{landingPageContent.about.title}</h2>
        <p className="text-gray-600 leading-relaxed text-justify">{landingPageContent.about.story}</p>
      </div>
      <div className="order-1 md:order-2">
        <Image
          src={landingPageContent.about.imageUrl}
          alt="Demonstração do sistema GranaLivre"
          width={1200}
          height={800}
          className="rounded-lg shadow-2xl"
        />
      </div>
    </div>
  </section>
);

// Componente para a Seção de Contribuidores
const ContributorsSection = () => (
  <section className="py-20">
    <div className="text-center max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">{landingPageContent.contributors.title}</h2>
      <div className="flex justify-center gap-8 flex-wrap">
        {landingPageContent.contributors.members.map((member) => (
          <a key={member.githubUser} href={`https://github.com/${member.githubUser}`} target="_blank" rel="noopener noreferrer" className="text-center group">
            <Image
              src={`https://github.com/${member.githubUser}.png`}
              alt={`Foto de perfil de ${member.name}`}
              width={96}
              height={96}
              className="rounded-full mx-auto mb-2 border-4 border-transparent group-hover:border-green-500 transition-all duration-300"
            />
            <p className="font-semibold text-gray-700 group-hover:text-green-600">{member.name}</p>
          </a>
        ))}
      </div>
    </div>
  </section>
);

// Novo Componente para o Rodapé da Landing Page
const LandingFooter = () => (
  // Classe de gradiente invertida: bg-gradient-to-l (esquerda) em vez de bg-gradient-to-r (direita)
  // Mantém a altura h-17 e as cores do TopBar
  <footer className="bg-gradient-to-l from-green-601 to-emerald-600 mt-auto">
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-center items-center">
      <p className="text-white text-sm">
        &copy; {new Date().getFullYear()} GranaLivre. {landingPageContent.footer.copyright}
      </p>
    </div>
  </footer>
);


// Conteúdo completo da Landing Page
const LandingContent = () => (
  <div>
    <HeroSection />
    <AboutSection />
    <ContributorsSection />
  </div>
);

// Conteúdo do Dashboard (permanece o mesmo)
const DashboardContent = ({ user }) => (
   <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Bem-vindo de volta, {user.username}!
      </h1>
      <p className="text-gray-600 mb-6">
        Este é o seu resumo financeiro.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Seu Dashboard</h2>
        <p className="text-gray-500">(Conteúdo do dashboard aparecerá aqui.)</p>
      </div>
    </div>
);


export default function HomePageClient({ initialUser }) {
  const { user, loading } = useAuth();

  if (loading) {
    return initialUser ? <DashboardContent user={initialUser} /> : <LandingContent />;
  }

  return user ? <DashboardContent user={user} /> : <LandingContent />;
}
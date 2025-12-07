import Link from 'next/link';
import Image from 'next/image';
import { landingPageContent } from '@/config/content';

const HeroSection = () => (
  <section className="text-center py-20">
    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 animate-fade-in-down">
      {landingPageContent.hero.title}
    </h1>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in-up">
      {landingPageContent.hero.subtitle}
    </p>
    <div className="flex justify-center gap-4">
      <Link
        href="/entrar"
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
      >
        {landingPageContent.hero.ctaLogin}
      </Link>
      <Link
        href="/cadastrar"
        className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105"
      >
        {landingPageContent.hero.ctaRegister}
      </Link>
    </div>
  </section>
);

const AboutSection = () => (
  <section className="py-20 bg-white p-8 rounded-lg shadow-lg">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="order-2 md:order-1">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {landingPageContent.about.title}
        </h2>
        <p className="text-gray-600 leading-relaxed text-justify">
          {landingPageContent.about.story}
        </p>
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

const ContributorsSection = () => (
  <section className="py-20">
    <div className="text-center max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        {landingPageContent.contributors.title}
      </h2>
      <div className="flex justify-center gap-8 flex-wrap">
        {landingPageContent.contributors.members.map((member) => (
          <a
            key={member.githubUser}
            href={`https://github.com/${member.githubUser}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center group"
          >
            <Image
              src={`https://github.com/${member.githubUser}.png`}
              alt={`Foto de perfil de ${member.name}`}
              width={96}
              height={96}
              className="rounded-full mx-auto mb-2 border-4 border-transparent group-hover:border-green-500 transition-all duration-300"
            />
            <p className="font-semibold text-gray-700 group-hover:text-green-600">
              {member.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  </section>
);

const LandingContent = () => (
  <div>
    <HeroSection />
    <AboutSection />
    <ContributorsSection />
  </div>
);

export default LandingContent;

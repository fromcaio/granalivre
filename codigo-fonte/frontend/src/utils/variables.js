export const formStyles = {
  container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-3 py-4 sm:px-6 lg:px-8",
  formWrapper: "w-full max-w-md bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 max-h-[95vh] overflow-y-auto",
  title: "text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 md:mb-8",
  form: "space-y-3 sm:space-y-4 md:space-y-6",
  input: "w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200 text-sm sm:text-base text-gray-900",
  baseButton: "w-full font-semibold py-2 sm:py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  loginButton: "bg-green-600 hover:bg-green-700 text-white",
  registerButton: "bg-blue-600 hover:bg-blue-700 text-white",
  cancelButton: "bg-red-600 hover:bg-red-700 text-white",
  deleteButton: "bg-red-600 hover:bg-red-700 text-white",
  secondaryCancelButton: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  menuItem: "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition duration-200",
  menuItemDanger: "w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 cursor-pointer transition duration-200"
};

export const colors = {
  primary: "green-600",
  primaryHover: "green-700",
  secondary: "blue-600",
  secondaryHover: "blue-700",
  background: "green-50",
  backgroundDark: "emerald-100",
  menuHover: "gray-100",
  menuHoverDanger: "red-100"
};

// --- NOVO CONTEÚDO PARA A LANDING PAGE ---

export const landingPageContent = {
  hero: {
    title: "Assuma o controle da sua vida financeira.",
    subtitle: "GranaLivre é a plataforma open-source, criada por e para brasileiros, que simplifica a gestão das suas finanças com transparência e segurança.",
    ctaLogin: "Acessar minha conta",
    ctaRegister: "Criar uma conta gratuita"
  },
  about: {
    title: "A Nossa História",
    story: "O GranaLivre nasceu da paixão de quatro estudantes de Ciência da Computação determinados a criar uma solução financeira que realmente entendesse a realidade brasileira. Cansados de ferramentas estrangeiras, caras ou com funcionalidades limitadas, decidimos construir uma plataforma open-source, transparente e acessível. Nosso objetivo é democratizar o acesso à gestão financeira e, ao mesmo tempo, fortalecer a comunidade de desenvolvedores do Brasil, com um projeto 100% documentado em português.",
    imageUrl: "https://cdn.prod.website-files.com/65d163ce6ca432aa06f93e10/65d1668b3cad5a50b3566d17_5f7ba1877c0076e9c5180805_5d5def15766201938bf56684_1_qAzDPU61Hi4MYGHiUlQSOw.gif" // Substitua pelo seu GIF
  },
  contributors: {
    title: "Nossa Equipe",
    members: [
      {
        name: "From Caio",
        githubUser: "fromcaio"
      },
      {
        name: "Gabriel Bernardini",
        githubUser: "Gabriel0Bernardini"
      },
      {
        name: "Felipe Girardi",
        githubUser: "girafinos"
      },
      {
        name: "Sandro Filho",
        githubUser: "s4ndr0F1lh0"
      }
    ]
  }
};
export const formStyles = {
  container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-3 py-4 sm:px-6 lg:px-8",
  formWrapper: "w-full max-w-md bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 max-h-[95vh] overflow-y-auto",
  title: "text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 md:mb-8",
  form: "space-y-3 sm:space-y-4 md:space-y-6",
  input: "w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200 text-sm sm:text-base text-gray-900",
  // Button styles refactored for better reusability and explicit loading state
  baseButton: "w-full font-semibold py-2 sm:py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  loginButton: "bg-green-600 hover:bg-green-700 text-white", // Combined with baseButton
  registerButton: "bg-blue-600 hover:bg-blue-700 text-white", // Combined with baseButton
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

// NOTE: The usage of loginButton and registerButton in the RegisterPage
// has been updated to use the combination of formStyles.baseButton and the
// specific button color classes.
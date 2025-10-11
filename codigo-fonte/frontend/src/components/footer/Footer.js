import { footerContent } from "@/config/content";

export default function Footer() {
  return (
  // FIXED: Changed 'from-green-601' to the correct Tailwind class 'from-green-600'.
  // Also adjusted max-width and height to better match the topBar's container for consistency.
  <footer className="bg-gradient-to-l from-green-600 to-emerald-600 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-center items-center">
      <p className="text-white text-sm">
        &copy; {new Date().getFullYear()} GranaLivre. {footerContent.copyright}
      </p>
    </div>
  </footer>
  );
}
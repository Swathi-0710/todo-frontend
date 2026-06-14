import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Lavender Todo",
  description: "A complete todo web application with login and sign up pages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import Script from 'next/script';
import "./globals.css";

export const metadata = {
  title: "WaBot.ai — AI Sales Agent for WhatsApp",
  description: "Automatically qualify leads, answer questions, and book appointments on WhatsApp 24/7 with AI.",
  keywords: "WhatsApp AI, WhatsApp chatbot, WhatsApp business automation, lead qualification",
  openGraph: {
    title: "WaBot.ai — AI Sales Agent for WhatsApp",
    description: "Automatically qualify leads 24/7 on WhatsApp with AI.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}

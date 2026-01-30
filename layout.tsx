import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { ResponseLogger } from "@/components/response-logger";
import { cookies } from "next/headers";
import { ReadyNotifier } from "@/components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "@/components/FarcasterWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestId = cookies().get("x-request-id")?.value;

  return (
        <html lang="en">
          <head>
            {requestId && <meta name="x-request-id" content={requestId} />}
            <meta name="base:app_id" content="697a8dc7a35c6ecde6aca562" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {/* Do not remove this component, we use it to notify the parent that the mini-app is ready */}
            <ReadyNotifier />
            <Providers>
              <FarcasterWrapper>
                {children}
              </FarcasterWrapper>
            </Providers>
            <ResponseLogger />
          </body>
        </html>
      );
}

export const metadata: Metadata = {
  title: "Calisthenics Fitness - Expert Verified Workouts on Base",
  description: "Professional calisthenics fitness platform with expert-verified workout videos. Earn CALI tokens for completed exercises verified by certified fitness professionals. Built on Base blockchain with OnchainKit integration.",
  keywords: [
    "fitness",
    "health",
    "calisthenics",
    "workout",
    "bodyweight"
  ],
  authors: [
    { name: "Calisthenics Fitness Platform" }
  ],
  creator: "Calisthenics Fitness Platform",
  publisher: "Calisthenics Fitness Platform",
  applicationName: "Calisthenics Fitness",
  generator: "Next.js",
  metadataBase: new URL("https://bound-began-091.app.ohara.ai"),
  alternates: {
    canonical: "https://bound-began-091.app.ohara.ai"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bound-began-091.app.ohara.ai",
    title: "Calisthenics Fitness - Expert Verified Workouts on Base",
    description: "Professional calisthenics fitness platform with expert-verified workout videos. Earn CALI tokens for completed exercises verified by certified fitness professionals. Built on Base blockchain.",
    siteName: "Calisthenics Fitness",
    images: [
      {
        url: "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_a6cd4dc2-f219-48a8-a38b-87ad5ea8f727-VabTValdze4zTiU6HP0gupLltL8Lla",
        width: 1200,
        height: 630,
        alt: "Calisthenics Fitness - Expert Verified Workouts"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Calisthenics Fitness - Expert Verified Workouts on Base",
    description: "Professional calisthenics fitness platform with expert-verified workout videos. Earn CALI tokens for completed exercises verified by certified fitness professionals.",
    images: ["https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_a6cd4dc2-f219-48a8-a38b-87ad5ea8f727-VabTValdze4zTiU6HP0gupLltL8Lla"],
    creator: "@baseonchn"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico"
  },
  manifest: "/manifest.json",
  category: "fitness",
  classification: "Health & Fitness, Blockchain, Web3",
  other: { 
    "fc:frame": JSON.stringify({
      "version":"next",
      "imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_a6cd4dc2-f219-48a8-a38b-87ad5ea8f727-VabTValdze4zTiU6HP0gupLltL8Lla",
      "button":{
        "title":"Open with Ohara",
        "action":{
          "type":"launch_frame",
          "name":"Calisthenics Fitness",
          "url":"https://bound-began-091.app.ohara.ai",
          "splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg",
          "splashBackgroundColor":"#ffffff"
        }
      }
    }),
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Calisthenics Fitness",
    "format-detection": "telephone=no"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ]
};

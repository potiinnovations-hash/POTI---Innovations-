import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'მდგრადი განვითარებისა და ინოვაციების სამსახური',
  description: 'Service of Sustainable Development and Innovation',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ka">
      <head>
        <link rel="stylesheet" href="//cdn.web-fonts.ge/fonts/bpg-glaho-web-caps/css/bpg-glaho-web-caps.min.css" />
        <link rel="icon" href="https://i.ibb.co/NdQ3Hrnj/logo.png" />
      </head>
      <body suppressHydrationWarning className="font-['BPG_Glaho_Web_Caps'] antialiased">
        {children}
      </body>
    </html>
  );
}

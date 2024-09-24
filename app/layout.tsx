import './globals.css';
import '@contentstack/venus-components/build/main.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check In/Out App',
  description: 'Developed by TSO',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div>{children}</div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { theme } from '@/theme/theme';
import '@mantine/core/styles.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "Off Work",
  description: "Application for tracking annual leave and planning holiday days.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">{children}</MantineProvider>
      </body>
    </html>
  );
}
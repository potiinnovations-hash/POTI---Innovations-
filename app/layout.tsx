import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import MenuWidget from "@/components/MenuWidget";
import PWAPromptWidget from "@/components/PWAPromptWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Poti.ge",
  description: "City Directory for Poti",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Poti.ge",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: "/fav.png",
    apple: "/fav.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && !window.__JSON_STRINGIFY_PATCHED__) {
                  window.__JSON_STRINGIFY_PATCHED__ = true;
                  var originalStringify = JSON.stringify;
                  JSON.stringify = function(value, replacer, space) {
                    try {
                      return originalStringify(value, replacer, space);
                    } catch (err) {
                      var isCircular = err instanceof Error && 
                        (err.message.indexOf('circular') !== -1 || err.message.indexOf('Circular') !== -1);
                      if (isCircular) {
                        var seen = new WeakSet();
                        var safeReplacer = function(key, val) {
                          var resolvedValue = val;
                          if (typeof replacer === 'function') {
                            resolvedValue = replacer.call(this, key, val);
                          }
                          if (typeof resolvedValue === 'object' && resolvedValue !== null) {
                            if (seen.has(resolvedValue)) {
                              return '[Circular]';
                            }
                            try {
                              var constructorName = resolvedValue.constructor ? resolvedValue.constructor.name : '';
                              var isReactOrDOM = 
                                String(key).indexOf('__react') === 0 ||
                                resolvedValue.$$typeof ||
                                constructorName === 'FiberNode' ||
                                (constructorName && constructorName.indexOf('Fiber') !== -1) ||
                                constructorName === 'SyntheticBaseEvent' ||
                                (constructorName && constructorName.indexOf('Element') !== -1) ||
                                (constructorName && constructorName.indexOf('HTML') !== -1) ||
                                (constructorName && constructorName.indexOf('Window') !== -1) ||
                                (constructorName && constructorName.indexOf('Document') !== -1) ||
                                resolvedValue.nodeType ||
                                resolvedValue.nodeName;

                              if (isReactOrDOM) {
                                return '[' + (constructorName || 'ComplexObject') + ']';
                              }
                            } catch (e) {
                              return '[Restricted]';
                            }
                            seen.add(resolvedValue);
                          }
                          if (Array.isArray(replacer) && key !== '') {
                            if (replacer.indexOf(key) === -1) {
                              return undefined;
                            }
                          }
                          return resolvedValue;
                        };
                        try {
                          return originalStringify(value, safeReplacer, space);
                        } catch (secondErr) {
                          return '"[Unserializable]"';
                        }
                      }
                      throw err;
                    }
                  };
                }
              })();

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        <ThemeProvider>
          {children}
          <MenuWidget />
          <PWAPromptWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}

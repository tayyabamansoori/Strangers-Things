import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'THE UPSIDE DOWN — A STRANGER THINGS EXPERIENCE' },
      { name: 'description', content: 'Enter the Upside Down. Vecna is watching.' },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700;900&family=Share+Tech+Mono&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#010105' }}>
      <head>
        <HeadContent />
      </head>
      <body style={{ background: '#010105', minHeight: '100vh' }}>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

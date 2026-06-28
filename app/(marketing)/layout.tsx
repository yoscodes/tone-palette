import { Noto_Sans_JP } from 'next/font/google'

const noto = Noto_Sans_JP({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={noto.className}>{children}</div>
}

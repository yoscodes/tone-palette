import { HeroDemoCard } from '@/components/marketing/HeroDemoCard'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const Logo = ({ size = 19 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <div style={{ position: 'relative', width: 30, height: 26 }}>
      <div style={{ position: 'absolute', left: 0, top: 3, width: 17, height: 17, borderRadius: '50%', background: '#ff8a5b', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', left: 11, top: 0, width: 17, height: 17, borderRadius: '50%', background: '#7b8cf0', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', left: 6, top: 9, width: 14, height: 14, borderRadius: '50%', background: '#f76b8a', mixBlendMode: 'multiply' }} />
    </div>
    <span style={{ fontWeight: 700, fontSize: size, letterSpacing: '-0.01em' }}>tone palette</span>
  </div>
)

const GreenCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill="#22c55e"/>
    <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PurpleCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill="#7b6ad0"/>
    <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const BlueCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a7bf0" strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <path d="M5 12l4 4 10-10"/>
  </svg>
)

const PALETTE_QUADRANTS = [
  { main: '親密', sub: 'フランク',     pos: { top: '25%', left: '25%' } },
  { main: '丁寧', sub: '標準的',       pos: { top: '25%', left: '75%' } },
  { main: '事務的', sub: '簡潔',       pos: { top: '75%', left: '25%' } },
  { main: '厳格', sub: 'かしこまった', pos: { top: '75%', left: '75%' } },
]

const CursorDot = ({ size = 28 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,.96)', boxShadow: '0 6px 20px rgba(0,0,0,.28), 0 2px 6px rgba(0,0,0,.18), 0 0 0 2px rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={Math.round(size * 0.43)} height={Math.round(size * 0.43)} viewBox="0 0 24 24" fill="none" stroke="#9a78c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5,9 2,12 5,15"/><polyline points="9,5 12,2 15,5"/>
      <polyline points="15,19 12,22 9,19"/><polyline points="19,9 22,12 19,15"/>
      <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  </div>
)

const PaletteMini = ({ size = 140, cursorX = 50, cursorY = 50 }: { size?: number; cursorX?: number; cursorY?: number }) => (
  <div style={{ position: 'relative', width: size, height: size, borderRadius: 14, background: GRADIENT_PALETTE, overflow: 'hidden' }}>
    {/* Groove lines */}
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 1px)', width: 3, background: 'rgba(0,0,0,.12)' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - 1px)', height: 3, background: 'rgba(0,0,0,.12)' }} />
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 0.5px)', width: 1, background: 'rgba(255,255,255,.45)' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - 0.5px)', height: 1, background: 'rgba(255,255,255,.45)' }} />
    {/* Quadrant labels */}
    {PALETTE_QUADRANTS.map(q => (
      <div key={q.main} style={{ position: 'absolute', top: q.pos.top, left: q.pos.left, transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0.45 }}>
        <div style={{ fontSize: size * 0.075, fontWeight: 800, color: '#fff', lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,.3)' }}>{q.main}</div>
        <div style={{ fontSize: size * 0.055, fontWeight: 600, color: '#fff', marginTop: 2, textShadow: '0 1px 3px rgba(0,0,0,.25)' }}>{q.sub}</div>
      </div>
    ))}
    {/* Cursor */}
    <div style={{ position: 'absolute', left: `${cursorX}%`, top: `${cursorY}%`, transform: 'translate(-50%,-50%)', zIndex: 1 }}>
      <CursorDot size={Math.round(size * 0.2)} />
    </div>
  </div>
)

const GRADIENT_BTN = 'linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%)'
const GRADIENT_PALETTE = 'linear-gradient(135deg,#ff8a5b 0%,#f76b8a 38%,#b06ab3 66%,#6a82fb 100%)'

export default function LandingPage() {
  return (
    <div style={{ width: '100%', background: '#f2f2f6', overflow: 'hidden', color: '#1f2230', WebkitFontSmoothing: 'antialiased' }}>

      <style>{`
        /* ── HEADER ── */
        .lp-header-inner { max-width: 1080px; margin: 0 auto; padding: 14px 28px; display: flex; align-items: center; gap: 28px; }
        .lp-nav { display: flex; align-items: center; gap: 24px; margin-left: 18px; font-size: 14px; font-weight: 500; color: #4a4d60; white-space: nowrap; }
        .lp-header-right { margin-left: auto; display: flex; align-items: center; gap: 18px; }
        .lp-login { font-size: 14px; font-weight: 500; color: #4a4d60; text-decoration: none; }
        .lp-signup { text-decoration: none; font-size: 13.5px; font-weight: 700; color: #fff; padding: 10px 18px; border-radius: 999px; white-space: nowrap; background: linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%); box-shadow: 0 6px 16px rgba(150,90,200,.28); }
        @media (max-width: 768px) {
          .lp-nav { display: none; }
          .lp-header-right { gap: 10px; }
          .lp-signup { font-size: 12px; padding: 8px 12px; }
          .lp-header-inner { gap: 16px; }
        }
        @media (max-width: 480px) {
          .lp-login { display: none; }
          .lp-header-inner { padding: 12px 16px; }
        }

        /* ── HERO ── */
        .lp-hero-grid { max-width: 1080px; margin: 0 auto; padding: 64px 28px 80px; display: grid; grid-template-columns: 1fr 1.18fr; gap: 48px; align-items: center; position: relative; }
        .lp-hero-h1 { margin-top: 22px; font-size: 46px; line-height: 1.3; font-weight: 900; letter-spacing: -0.01em; color: #222536; }
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr; padding: 48px 28px 60px; gap: 40px; }
          .lp-hero-demo { display: none; }
          .lp-hero-h1 { font-size: 36px; margin-top: 16px; }
        }
        @media (max-width: 640px) {
          .lp-hero-grid { padding: 36px 20px 48px; gap: 32px; }
          .lp-hero-demo { display: block; }
          .lp-hero-h1 { font-size: 30px; }
        }
        @media (max-width: 480px) {
          .lp-hero-grid { padding: 28px 16px 40px; }
          .lp-hero-h1 { font-size: 28px; }
        }

        /* ── PAIN GRID ── */
        .pain-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .pain-card { display: flex; flex-direction: column; overflow: hidden; }
        .pain-card-media { display: flex; align-items: center; justify-content: center; padding: 36px 28px 24px; }
        .pain-card-body { flex: 1; min-width: 0; padding: 4px 28px 36px; display: flex; flex-direction: column; }
        @media (max-width: 768px) {
          .pain-grid { grid-template-columns: 1fr; }
          .pain-card { flex-direction: row; }
          .pain-card-media { flex-shrink: 0; width: 140px; padding: 28px 20px; }
          .pain-card-body { padding: 28px 24px; justify-content: center; }
        }
        @media (max-width: 480px) {
          .pain-card { flex-direction: column; }
          .pain-card-media { width: 100%; padding: 32px 28px 20px; }
          .pain-card-body { padding: 4px 28px 32px; }
        }

        /* ── SECTION PADDING ── */
        .lp-section { padding: 80px 0; }
        .lp-section-inner { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) {
          .lp-section { padding: 56px 0; }
          .lp-section-inner { padding: 0 16px; }
        }
        @media (max-width: 480px) {
          .lp-section { padding: 44px 0; }
        }

        /* ── FEATURES BENTO ── */
        .lp-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
        .lp-b1 { grid-column: span 7; }
        .lp-b2 { grid-column: span 5; }
        .lp-b3 { grid-column: span 5; }
        .lp-b4 { grid-column: span 7; }
        @media (max-width: 900px) {
          .lp-bento { grid-template-columns: 1fr 1fr; gap: 14px; }
          .lp-b1, .lp-b2, .lp-b3, .lp-b4 { grid-column: span 1; }
        }
        @media (max-width: 580px) {
          .lp-bento { grid-template-columns: 1fr; }
        }

        /* ── HOW IT WORKS ── */
        .lp-how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; position: relative; }
        .lp-how-line { position: absolute; top: 32px; left: 16.7%; right: 16.7%; height: 2px; background: linear-gradient(90deg,#ff7e5f,#b06ab3,#6a7bf0); border-radius: 1px; z-index: 0; }
        @media (max-width: 640px) {
          .lp-how-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-how-line { display: none; }
        }

        /* ── SITUATIONS ── */
        .lp-sit-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .lp-sit-see-all { font-size: 13px; font-weight: 700; color: #7b6ad0; text-decoration: none; white-space: nowrap; }
        .lp-sit-cmp { background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 8px 28px rgba(120,90,200,.1); display: grid; grid-template-columns: 1fr auto 1fr auto; gap: 26px; align-items: center; }
        @media (max-width: 900px) {
          .lp-sit-header { flex-direction: column; align-items: flex-start; gap: 10px; }
          .lp-sit-cmp { grid-template-columns: 1fr; }
          .lp-sit-palette, .lp-sit-phone { display: none; }
        }

        /* ── PRICING ── */
        .lp-pricing-grid { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 20px; align-items: start; }
        .lp-pro-card { border-radius: 22px; padding: 3px; background: linear-gradient(95deg,#ff7e5f 0%,#b06ab3 55%,#6a7bf0 100%); box-shadow: 0 20px 60px rgba(150,90,200,.3); position: relative; transform: scale(1.03); z-index: 1; }
        @media (max-width: 900px) {
          .lp-pricing-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
          .lp-pro-card { transform: none; }
        }

        /* ── CTA ── */
        .lp-cta-section { max-width: 1080px; margin: 0 auto; padding: 60px 28px; }
        .lp-cta-inner { border-radius: 28px; padding: 48px 52px; background: linear-gradient(105deg,#ff8a5b 0%,#f76b8a 38%,#b06ab3 68%,#6a82fb 100%); display: flex; align-items: center; justify-content: space-between; gap: 40px; box-shadow: 0 24px 60px rgba(150,90,200,.3); position: relative; overflow: hidden; }
        .lp-cta-h2 { font-size: 28px; font-weight: 900; color: #fff; line-height: 1.35; }
        .lp-cta-checks { margin-top: 18px; display: flex; gap: 20px; font-size: 13px; color: #fff; font-weight: 600; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .lp-cta-section { padding: 40px 20px; }
          .lp-cta-inner { flex-direction: column; align-items: stretch; padding: 36px 28px; gap: 28px; }
        }
        @media (max-width: 480px) {
          .lp-cta-section { padding: 32px 16px; }
          .lp-cta-inner { padding: 28px 20px; border-radius: 20px; }
          .lp-cta-checks { flex-direction: column; gap: 8px; }
          .lp-cta-h2 { font-size: 22px; }
        }

        /* ── FOOTER ── */
        .lp-footer-inner { max-width: 1080px; margin: 0 auto; padding: 32px 28px 48px; display: flex; align-items: center; gap: 30px; }
        .lp-footer-nav { display: flex; gap: 26px; font-size: 13px; font-weight: 500; color: #6b6f82; }
        .lp-footer-social { margin-left: auto; display: flex; gap: 14px; color: #8a8ea0; }
        @media (max-width: 640px) {
          .lp-footer-inner { flex-wrap: wrap; gap: 20px; padding: 28px 20px 40px; }
          .lp-footer-social { margin-left: 0; }
          .lp-footer-nav { flex-wrap: wrap; gap: 14px; }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(242,242,246,.82)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(20,20,40,.05)' }}>
        <div className="lp-header-inner">
          <Logo />
          <nav className="lp-nav">
            {[['#features','機能'],['#how','使い方'],['#usecase','ユースケース'],['#pricing','料金プラン'],['#faq','よくある質問']].map(([h,l]) => (
              <a key={h} href={h} style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>
            ))}
          </nav>
          <div className="lp-header-right">
            <a href="/login" className="lp-login">ログイン</a>
            <a href="/login" className="lp-signup">
              無料で始める
            </a>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(176,106,179,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(106,123,240,.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 120, left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,126,95,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="lp-hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: '#fff', border: '1px solid rgba(180,120,210,.25)', boxShadow: '0 2px 8px rgba(120,90,170,.08)', fontSize: 12.5, fontWeight: 700, color: '#6b4f9e' }}>
              <span style={{ fontSize: 14 }}>✦</span> AIが文脈と相手に合わせて、最適な表現を提案
            </div>
            <h1 className="lp-hero-h1">
              言葉の迷いをゼロにする、<br />ビジネス表現の<br />
              <span style={{ background: 'linear-gradient(95deg,#ff7e5f,#f857a6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>カラー</span>
              <span style={{ background: 'linear-gradient(95deg,#b06ab3,#6a7bf0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>パレット</span>
            </h1>
            <p style={{ marginTop: 20, fontSize: 15.5, lineHeight: 1.9, color: '#55596b', fontWeight: 500 }}>
              相手との距離感を選ぶだけ。<br />チャットもメールも、もう送信ボタンの前で悩みません。
            </p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
              <a href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 28px', borderRadius: 999, background: GRADIENT_BTN, color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 800, boxShadow: '0 8px 28px rgba(150,90,200,.32)', whiteSpace: 'nowrap' }}>
                <GoogleIcon />
                Googleで無料登録する
              </a>
              <a href="/dashboard" style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: '#7b6ad0', textDecoration: 'none', padding: '6px' }}>
                まずはゲストで試す（3回まで無料）→
              </a>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 20, fontSize: 12.5, color: '#6a6e80', fontWeight: 500, flexWrap: 'wrap' }}>
              {['クレジットカード不要', 'すぐに利用開始', 'いつでも解除OK'].map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GreenCheck />{t}</span>
              ))}
            </div>
          </div>
          <div className="lp-hero-demo">
            <HeroDemoCard />
          </div>
        </div>
      </section>

      {/* ===== PAIN — dark section ===== */}
      <section className="lp-section" style={{ background: '#16192a' }}>
        <div className="lp-section-inner">
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, background: 'rgba(255,126,95,.15)', border: '1px solid rgba(255,126,95,.3)', fontSize: 12.5, fontWeight: 700, color: '#ff9170', marginBottom: 18 }}>
              あなただけじゃない
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>
              こんな経験、<span style={{ background: 'linear-gradient(95deg,#ff7e5f,#f857a6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>ありませんか？</span>
            </h2>
            <p style={{ marginTop: 12, fontSize: 15, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>
              ビジネスシーンでの言葉の選択に、毎日時間を取られていませんか？
            </p>
          </div>

          <div className="pain-grid" style={{ marginTop: 48 }}>
            {[
              { img: '/assets/ill-confused.png', size: 116, title: '上司へのSlackで絵文字を使っていいか迷う…', sub: '失礼に見えないか不安で送信ボタンが押せない', color: '#ff8a5b' },
              { img: '/assets/ill-email.png',   size: 138, title: '初めてのクライアントへのメール作成に時間がかかる…', sub: '適切な表現がわからず何度も書き直してしまう', color: '#f76b8a' },
              { img: '/assets/ill-questions.png', size: 116, title: '相手や業界によって言葉遣いを変えるのが難しい…', sub: 'いつも「これで合ってる？」と自信が持てない', color: '#7b8cf0' },
            ].map((item) => (
              <div key={item.title} className="pain-card" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, backdropFilter: 'blur(8px)' }}>
                <div className="pain-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt="" style={{ width: item.size, height: item.size, objectFit: 'contain', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.35))' }} />
                </div>
                <div className="pain-card-body">
                  <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.65, color: '#fff', overflowWrap: 'break-word' }}>{item.title}</p>
                  <p style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,.65)', fontWeight: 500, lineHeight: 1.75, overflowWrap: 'break-word' }}>{item.sub}</p>
                  <div style={{ marginTop: 22, height: 2, width: 60, borderRadius: 1, background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES — bento grid ===== */}
      <section id="features" className="lp-section" style={{ background: '#f2f2f6', paddingBottom: 60 }}>
        <div className="lp-section-inner">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#272a3a' }}>
              <span style={{ background: 'linear-gradient(95deg,#ff7e5f,#b06ab3 60%,#6a7bf0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>tone palette</span> ができること
            </h2>
            <p style={{ marginTop: 12, fontSize: 15, color: '#7a7e90', fontWeight: 500 }}>4つの機能で、言葉選びの迷いをゼロにします。</p>
          </div>

          <div className="lp-bento">

            {/* 01 — large left */}
            <div className="lp-b1" style={{ background: '#fff', borderRadius: 24, padding: '34px 36px', boxShadow: '0 12px 40px rgba(70,60,120,.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(95deg,#ff7e5f,#b06ab3)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>01</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, color: '#1c1f2b' }}>2軸（親密さ×敬意）で<br />直感的にトーンを選択</h3>
                  <p style={{ marginTop: 8, fontSize: 13, color: '#7a7e90', fontWeight: 500, lineHeight: 1.7 }}>画面を見ながら選ぶから、ニュアンスの微調整が思いのまま。どんな相手にも最適なトーンがすぐ見つかります。</p>
                </div>
              </div>
              <div style={{ marginTop: 28, position: 'relative', padding: '8px 0' }}>
                <div style={{ width: '100%', maxWidth: 300, margin: '0 auto', aspectRatio: '1/1', borderRadius: 18, background: GRADIENT_PALETTE, position: 'relative', overflow: 'hidden' }}>
                  {/* Groove lines */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 1px)', width: 3, background: 'rgba(0,0,0,.12)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - 1px)', height: 3, background: 'rgba(0,0,0,.12)' }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 0.5px)', width: 1, background: 'rgba(255,255,255,.45)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - 0.5px)', height: 1, background: 'rgba(255,255,255,.45)' }} />
                  {/* Quadrant labels */}
                  {PALETTE_QUADRANTS.map(q => (
                    <div key={q.main} style={{ position: 'absolute', top: q.pos.top, left: q.pos.left, transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0.45 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,.3)' }}>{q.main}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', marginTop: 2, textShadow: '0 1px 3px rgba(0,0,0,.25)' }}>{q.sub}</div>
                    </div>
                  ))}
                  {/* Cursor at 丁寧/標準的 (top-right) */}
                  <div style={{ position: 'absolute', left: '66%', top: '40%', transform: 'translate(-50%,-50%)', zIndex: 1 }}>
                    <CursorDot size={30} />
                  </div>
                </div>
              </div>
            </div>

            {/* 02 — small right */}
            <div className="lp-b2" style={{ background: '#fff', borderRadius: 24, padding: '34px 28px', boxShadow: '0 12px 40px rgba(70,60,120,.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(95deg,#ff7e5f,#b06ab3)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>02</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, color: '#1c1f2b' }}>状況別プリセットと<br />安全性バッジ</h3>
                  <p style={{ marginTop: 8, fontSize: 12.5, color: '#7a7e90', fontWeight: 500, lineHeight: 1.7 }}>シーンや業界に合わせた提案で、どんな相手にも安心。</p>
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f7fb', borderRadius: 12, padding: '12px 14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}><GreenCheck />スタートアップ向け</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#e08a2a', background: '#fdf0dc', padding: '3px 10px', borderRadius: 6 }}>おすすめ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f7fb', borderRadius: 12, padding: '12px 14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a7bf0" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
                    伝統的な企業向け
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82c4', background: '#dceaf8', padding: '3px 10px', borderRadius: 6 }}>安心</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f7f7fb', borderRadius: 12, padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b06ab3" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9"/></svg>
                  フリーランス向け
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#edfaf3', borderRadius: 12, padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#22a06b' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>
                  全業界で安全な表現を保証
                </div>
              </div>
            </div>

            {/* 03 — small left */}
            <div className="lp-b3" style={{ background: '#fff', borderRadius: 24, padding: '34px 28px', boxShadow: '0 12px 40px rgba(70,60,120,.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(95deg,#ff7e5f,#b06ab3)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>03</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, color: '#1c1f2b' }}>ワンクリックで<br />コピー＆プレビュー</h3>
                  <p style={{ marginTop: 8, fontSize: 12.5, color: '#7a7e90', fontWeight: 500, lineHeight: 1.7 }}>生成した表現をすぐコピー。メールやチャットに貼るだけ。</p>
                </div>
              </div>
              <div style={{ marginTop: 20, background: '#f7f7fb', borderRadius: 14, padding: '16px 16px 12px' }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.7, color: '#2c2f40' }}>承知いたしました。<br />確認後、対応いたします。</p>
                <div style={{ marginTop: 10, height: 1, background: '#eee' }} />
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#9295a8', fontWeight: 600 }}>フォーマル × 丁寧</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#22a06b' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>
                    全業界で安全
                  </span>
                </div>
              </div>
              <button style={{ marginTop: 14, width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: '#fff', padding: '14px', borderRadius: 12, background: '#1c1f2b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>
                コピーする
              </button>
            </div>

            {/* 04 — large right */}
            <div className="lp-b4" style={{ background: 'linear-gradient(140deg,#1c1f2b 0%,#2a1f4a 100%)', borderRadius: 24, padding: '34px 36px', boxShadow: '0 12px 40px rgba(40,20,80,.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(176,106,179,.3) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
                <span style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(95deg,#ff7e5f,#b06ab3)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>04</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, color: '#fff' }}>自分だけのトーンを<br />設定・保存</h3>
                  <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500, lineHeight: 1.7 }}>あなたの会社やキャラに合わせた基準を保存して、いつでも呼び出し。</p>
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>保存済みのトーン設定</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(176,106,179,.5)', borderRadius: 14, padding: '14px 16px' }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: GRADIENT_BTN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l4 4 10-10"/></svg>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>私の会社（スタートアップ）<br /><span style={{ fontWeight: 500, color: 'rgba(255,255,255,.5)', fontSize: 12 }}>フランク寄りのカジュアル</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '14px 16px' }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>クライアントA（大手企業）<br /><span style={{ fontWeight: 500, color: 'rgba(255,255,255,.4)', fontSize: 12 }}>フォーマル寄りの丁寧</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.06)', border: '1px dashed rgba(255,255,255,.2)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: '2px dashed rgba(176,106,179,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, color: 'rgba(176,106,179,.9)', lineHeight: 1 }}>+</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(176,106,179,.9)' }}>新しい基準を作成</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — white section ===== */}
      <section id="how" className="lp-section" style={{ background: '#fff' }}>
        <div className="lp-section-inner">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, background: 'linear-gradient(95deg,rgba(255,126,95,.12),rgba(176,106,179,.12))', border: '1px solid rgba(176,106,179,.2)', fontSize: 12.5, fontWeight: 700, color: '#8b5cf6', marginBottom: 16 }}>
              ✦ シンプルな3ステップ
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1c1f2b' }}>使い方はとってもシンプル</h2>
            <p style={{ marginTop: 12, fontSize: 15, color: '#7a7e90', fontWeight: 500 }}>3ステップで、最適な表現が手元に届きます。</p>
          </div>

          <div className="lp-how-grid">
            <div className="lp-how-line" />

            {[
              {
                n: '01', color: '#ff7e5f',
                title: 'テキストを入力',
                desc: '変換したい文章や言葉を入力するだけ。「了解です」など短くてOK。',
                visual: (
                  <div style={{ marginTop: 28, background: '#f7f7fb', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#2c2f40' }}>了解です。</span>
                    <span style={{ fontSize: 11, color: '#a3a6b8' }}>4/200</span>
                  </div>
                ),
              },
              {
                n: '02', color: '#b06ab3',
                title: '2軸でトーンを選ぶ',
                desc: 'パレットをドラッグして、相手との距離感を直感的にセット。',
                visual: (
                  <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
                    <PaletteMini size={130} cursorX={66} cursorY={40} />
                  </div>
                ),
              },
              {
                n: '03', color: '#6a7bf0',
                title: 'コピーして使う',
                desc: '生成された表現をワンクリックでコピー。そのまま貼り付けるだけ。',
                visual: (
                  <div style={{ marginTop: 28 }}>
                    <div style={{ background: '#f7f7fb', borderRadius: 12, padding: '12px 14px', fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: '#2c2f40' }}>
                      承知いたしました。<br />確認後、対応いたします。
                    </div>
                    <button style={{ marginTop: 10, width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', padding: '11px', borderRadius: 10, background: '#1c1f2b' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>
                      コピーする
                    </button>
                  </div>
                ),
              },
            ].map((step) => (
              <div key={step.n} style={{ textAlign: 'center', padding: '0 28px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: '#fff', border: `3px solid ${step.color}`, boxShadow: `0 4px 20px ${step.color}44`, fontSize: 22, fontWeight: 900, color: step.color }}>
                  {step.n}
                </div>
                <h3 style={{ marginTop: 18, fontSize: 17, fontWeight: 700, color: '#1c1f2b' }}>{step.title}</h3>
                <p style={{ marginTop: 8, fontSize: 13.5, color: '#7a7e90', fontWeight: 500, lineHeight: 1.7 }}>{step.desc}</p>
                {step.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SITUATIONS — lavender section ===== */}
      <section id="usecase" className="lp-section" style={{ background: 'linear-gradient(160deg,#f5f0ff 0%,#ede8fc 50%,#eef2ff 100%)', paddingBottom: 60 }}>
        <div className="lp-section-inner">
          <div className="lp-sit-header">
            <div>
              <h2 style={{ fontSize: 30, fontWeight: 900, color: '#1c1f2b' }}>よく使う<span style={{ color: '#7b6ad0' }}>5つのシチュエーション</span>で即解決</h2>
              <p style={{ marginTop: 8, fontSize: 14, color: '#7a7e90', fontWeight: 500 }}>どのシーンでも、同じ簡単操作で最適な表現が見つかります。</p>
            </div>
            <a href="#" className="lp-sit-see-all">すべてのシチュエーションを見る →</a>
          </div>

          {/* Tab bar */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 8, boxShadow: '0 8px 28px rgba(120,90,200,.1)', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#fff', padding: '11px 18px', borderRadius: 12, background: GRADIENT_BTN }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>承諾する
              </span>
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v4h4"/></svg>, label: '謝罪する' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20l4-1L19 8a2 2 0 0 0-3-3L5 16z"/></svg>, label: '依頼する' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>, label: '日程調整する' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5l14 14M19 5L5 19"/></svg>, label: 'お断りする' },
              ].map(item => (
                <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#6b6f82', padding: '11px 16px' }}>
                  {item.icon}{item.label}
                </span>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: '#e85a9b', padding: '6px 10px' }}>📱 スマホでもサクッと使える！</span>
            </div>
          </div>

          {/* Comparison */}
          <div className="lp-sit-cmp">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: '#2c2f40', marginBottom: 14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7e5f" strokeWidth="1.8"><path d="M3 21v-2a4 4 0 0 1 4-4h4M14 7l5-4v6M19 3l-6 8 3 3"/><circle cx="9" cy="7" r="3"/></svg>
                スタートアップ向け <span style={{ color: '#9295a8', fontWeight: 600 }}>（フランク）</span>
              </div>
              {['いいですね！\nやってみます！', '承知しました！\n進めていきますね。'].map((text, i) => (
                <div key={i} style={{ marginTop: i === 0 ? 0 : 10, display: 'flex', alignItems: 'center', gap: 10, background: '#fbf3f4', borderRadius: 12, padding: '13px 15px' }}>
                  <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#ff7e5f' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>{text.replace('\n', '\n')}</span>
                </div>
              ))}
            </div>
            <div className="lp-sit-palette" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PaletteMini size={140} cursorX={66} cursorY={40} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: '#2c2f40', marginBottom: 14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6a7bf0" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2"/></svg>
                伝統的な企業向け <span style={{ color: '#9295a8', fontWeight: 600 }}>（フォーマル）</span>
              </div>
              {['承知いたしました。\n速やかに対応いたします。', 'かしこまりました。\n進めさせていただきます。'].map((text, i) => (
                <div key={i} style={{ marginTop: i === 0 ? 0 : 10, display: 'flex', alignItems: 'center', gap: 10, background: '#f1f2fb', borderRadius: 12, padding: '13px 15px' }}>
                  <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#6a7bf0' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
            {/* Phone mockup */}
            <div className="lp-sit-phone" style={{ width: 150, height: 300, borderRadius: 26, background: '#1c1f2b', padding: 9, boxShadow: '0 18px 40px rgba(40,30,80,.22)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 19, background: '#f7f7fb', padding: '12px 10px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#6b6f82' }}>
                  <span>承諾する</span>
                  <div style={{ display: 'flex', gap: 5, color: '#a3a6b8' }}><span>⌘</span><span>↻</span></div>
                </div>
                <div style={{ marginTop: 5, position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 10, background: GRADIENT_PALETTE, overflow: 'hidden' }}>
                  {/* Groove lines */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 1px)', width: 2, background: 'rgba(0,0,0,.12)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - 1px)', height: 2, background: 'rgba(0,0,0,.12)' }} />
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 0.5px)', width: 1, background: 'rgba(255,255,255,.45)' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - 0.5px)', height: 1, background: 'rgba(255,255,255,.45)' }} />
                  <div style={{ position: 'absolute', left: '66%', top: '40%', transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.96)', boxShadow: '0 3px 8px rgba(0,0,0,.25), 0 0 0 1.5px rgba(255,255,255,.6)' }} />
                </div>
                <div style={{ marginTop: 8, background: '#fff', borderRadius: 8, padding: 8, fontSize: 8.5, fontWeight: 500, lineHeight: 1.5, color: '#2c2f40' }}>
                  承知いたしました。<br />確認後、対応いたします。
                </div>
                <button style={{ marginTop: 7, border: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 8.5, fontWeight: 700, color: '#fff', padding: 8, borderRadius: 8, background: '#1c1f2b', cursor: 'pointer' }}>
                  ⧉ コピーする
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="lp-section" style={{ background: '#f2f2f6', paddingBottom: 60 }}>
        <div className="lp-section-inner">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#272a3a' }}>
              料金プラン <span style={{ fontSize: 16, fontWeight: 600, color: '#8a8ea0' }}>（今後の予定）</span>
            </h2>
            <p style={{ marginTop: 12, fontSize: 15, color: '#7a7e90', fontWeight: 500 }}>まずは無料で始めましょう。クレジットカード不要、今すぐ利用開始できます。</p>
          </div>

          <div className="lp-pricing-grid">

            {/* Free */}
            <div style={{ background: '#fff', borderRadius: 22, padding: '32px 28px', boxShadow: '0 8px 28px rgba(70,60,120,.07)' }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#272a3a' }}>Free</h3>
              <p style={{ marginTop: 14 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#1c1f2b' }}>¥0</span>
                <span style={{ fontSize: 14, color: '#8a8ea0', fontWeight: 600 }}> /月</span>
              </p>
              <p style={{ marginTop: 6, fontSize: 13, color: '#7a7e90', fontWeight: 600 }}>基本の5つのシチュエーション</p>
              <div style={{ marginTop: 22, height: 1, background: '#f0f0f4' }} />
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
                {['5つの基本シチュエーション', 'スタートアップ向け / 伝統的企業向け対応', '1日10回までの変換', 'コピー＆プレビュー機能'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600 }}><GreenCheck />{t}</span>
                ))}
              </div>
              <a href="/login" style={{ marginTop: 26, display: 'block', fontSize: 14, fontWeight: 700, color: '#fff', padding: '15px', borderRadius: 13, background: GRADIENT_BTN, textAlign: 'center', textDecoration: 'none' }}>
                無料で始める
              </a>
            </div>

            {/* Pro — highlighted */}
            <div className="lp-pro-card">
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: GRADIENT_BTN, padding: '6px 22px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(150,90,200,.4)' }}>
                ✦ 人気No.1（予定）
              </div>
              <div style={{ background: '#fff', borderRadius: 20, padding: '36px 28px' }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#272a3a' }}>Pro <span style={{ fontSize: 13, fontWeight: 600, color: '#8a8ea0' }}>（予定）</span></h3>
                <p style={{ marginTop: 14 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#1c1f2b' }}>¥980</span>
                  <span style={{ fontSize: 14, color: '#8a8ea0', fontWeight: 600 }}> /月</span>
                </p>
                <p style={{ marginTop: 6, fontSize: 13, color: '#7a7e90', fontWeight: 600 }}>より高度な表現力をあなたに</p>
                <div style={{ marginTop: 22, height: 1, background: '#f0f0f4' }} />
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {['業界特化辞書（IT・士業・医療など）', 'カスタムシチュエーション作成', '自社トーン設定の保存・管理', 'チーム共有・権限管理'].map(t => (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600 }}><PurpleCheck />{t}</span>
                  ))}
                </div>
                <a href="/login" style={{ marginTop: 26, display: 'block', fontSize: 14, fontWeight: 700, color: '#fff', padding: '15px', borderRadius: 13, background: GRADIENT_BTN, textAlign: 'center', textDecoration: 'none' }}>
                  今すぐ試す
                </a>
              </div>
            </div>

            {/* Update plan */}
            <div style={{ background: '#fff', borderRadius: 22, padding: '32px 28px', boxShadow: '0 8px 28px rgba(70,60,120,.07)', position: 'relative', overflow: 'hidden' }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#272a3a' }}>今後のアップデート予定</h3>
              <p style={{ marginTop: 8, fontSize: 13, color: '#7a7e90', fontWeight: 500 }}>ご意見を参考に機能拡充予定</p>
              <div style={{ marginTop: 22, height: 1, background: '#f0f0f4' }} />
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['AIによる文脈理解の強化', 'メールテンプレート自動生成', '多言語対応（英語・中国語など）', 'Outlook / Slack 拡張機能'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600 }}><BlueCheck />{t}</span>
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/ill-idea.png" alt="" style={{ position: 'absolute', right: 4, bottom: 0, width: 140, height: 140, objectFit: 'contain' }} />
            </div>

          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section>
        <div className="lp-cta-section">
          <div className="lp-cta-inner">
            {/* Decorative orbs */}
            <div style={{ position: 'absolute', top: -60, right: 300, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 className="lp-cta-h2">言葉に迷わない毎日を、<br />あなたの手に。</h2>
              <p style={{ marginTop: 10, fontSize: 14.5, color: 'rgba(255,255,255,.88)', fontWeight: 500 }}>今すぐ無料で始めて、ビジネスの言葉に迷う時間をゼロにしましょう。</p>
              <div className="lp-cta-checks">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>✓ クレジットカード不要</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>✓ すぐに利用開始</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>✓ いつでも解除OK</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 'min(340px, 100%)' }}>
              <a href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '17px 28px', borderRadius: 14, background: '#fff', color: '#1c1f2b', textDecoration: 'none', fontSize: 15, fontWeight: 800, boxShadow: '0 8px 28px rgba(0,0,0,.22)', whiteSpace: 'nowrap' }}>
                <GoogleIcon />
                Googleで無料登録する
              </a>
              <a href="/dashboard" style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.8)', textDecoration: 'none', padding: '8px' }}>
                まずはゲストで試す →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid rgba(20,20,40,.06)', background: '#f2f2f6' }}>
        <div className="lp-footer-inner">
          <Logo size={17} />
          <nav className="lp-footer-nav">
            {['運営会社', 'プライバシーポリシー', '利用規約', 'お問い合わせ'].map(l => (
              <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>
            ))}
          </nav>
          <div className="lp-footer-social">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4c-.8.4-1.6.6-2.5.8A4.3 4.3 0 0 0 21.4 3a8.6 8.6 0 0 1-2.7 1A4.3 4.3 0 0 0 11.3 7.8 12.2 12.2 0 0 1 2.4 3.2 4.3 4.3 0 0 0 3.8 9 4.2 4.2 0 0 1 1.9 8.5v.05A4.3 4.3 0 0 0 5.3 12.8a4.3 4.3 0 0 1-1.9.07 4.3 4.3 0 0 0 4 3 8.6 8.6 0 0 1-5.3 1.8A12.1 12.1 0 0 0 8.3 20.6c7.9 0 12.2-6.5 12.2-12.2v-.55A8.7 8.7 0 0 0 22 4z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.5-.95 1.8-1.95 3.65-1.95 3.9 0 4.6 2.55 4.6 5.85V21h-4v-5.5c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H9z"/></svg>
          </div>
        </div>
      </footer>

    </div>
  )
}

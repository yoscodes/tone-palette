'use client'

import { useRef, useState } from 'react'

export function HeroDemoCard() {
  const [pos, setPos] = useState({ hx: 0.66, hy: 0.40 })
  const sqRef = useRef<HTMLDivElement>(null)

  const clamp = (v: number) => Math.max(0.06, Math.min(0.94, v))

  const handleStart = (e: React.PointerEvent) => {
    e.preventDefault()

    const updatePos = (clientX: number, clientY: number) => {
      if (!sqRef.current) return
      const r = sqRef.current.getBoundingClientRect()
      setPos({
        hx: clamp((clientX - r.left) / r.width),
        hy: clamp((clientY - r.top) / r.height),
      })
    }

    updatePos(e.clientX, e.clientY)

    const onMove = (ev: PointerEvent) => updatePos(ev.clientX, ev.clientY)
    const onEnd = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
  }

  const { hx, hy } = pos
  const formal = hx > 0.5
  const polite = hy > 0.5
  let line1: string, line2: string
  if (formal && polite) { line1 = '承知いたしました。'; line2 = '確認後、対応いたします。' }
  else if (formal && !polite) { line1 = '承知しました。'; line2 = '確認のうえ対応します。' }
  else if (!formal && polite) { line1 = '了解しました。'; line2 = '確認して対応しますね。' }
  else { line1 = '了解です！'; line2 = '確認しておきますね。' }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ background: '#fff', borderRadius: 22, padding: '22px 22px 26px', boxShadow: '0 24px 60px rgba(70,60,120,.16)', border: '1px solid rgba(255,255,255,.7)' }}>
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #eee' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>依頼する</span>
          <div style={{ display: 'flex', gap: 14, color: '#9a78c8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.2"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="13.5" cy="6.5" r="2"/><circle cx="6.5" cy="11.5" r="2"/><circle cx="13.5" cy="16.5" r="2"/><path d="M11.7 7.6 8.3 10.4M8.3 12.6l3.4 2.8"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20l4-1L19 8a2 2 0 0 0-3-3L5 16z"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
          </div>
        </div>

        {/* Input display */}
        <p style={{ marginTop: 16, fontSize: 11.5, color: '#9295a8', fontWeight: 600 }}>入力した文章</p>
        <div style={{ marginTop: 7, background: '#f6f6fa', borderRadius: 12, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>了解です。</span>
          <span style={{ fontSize: 11, color: '#a3a6b8' }}>4/200</span>
        </div>

        {/* Palette grid */}
        <div style={{ marginTop: 30, position: 'relative', padding: '30px 56px 34px' }}>
          <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#5c6072', lineHeight: 1.4 }}>
            親密さ<br /><span style={{ fontWeight: 500, color: '#8a8ea0' }}>フランク（親密）</span>
          </span>
          <span style={{ position: 'absolute', left: -2, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#5c6072', lineHeight: 1.4, width: 54 }}>
            カジュアル<br /><span style={{ fontWeight: 500, color: '#8a8ea0' }}>（くだけた）</span>
          </span>
          <span style={{ position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#5c6072', lineHeight: 1.4, width: 54 }}>
            フォーマル<br /><span style={{ fontWeight: 500, color: '#8a8ea0' }}>（かしこまった）</span>
          </span>
          <span style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 11.5, fontWeight: 700, color: '#5c6072' }}>
            丁寧（標準的）
          </span>

          {/* Gradient square */}
          <div
            ref={sqRef}
            onPointerDown={handleStart}
            style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 18, background: 'linear-gradient(135deg,#ff8a5b 0%,#f76b8a 38%,#b06ab3 66%,#6a82fb 100%)', cursor: 'grab', touchAction: 'none', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1.5, background: 'rgba(255,255,255,.55)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1.5, background: 'rgba(255,255,255,.55)' }} />
            {/* Handle */}
            <div style={{ position: 'absolute', left: `${hx * 100}%`, top: `${hy * 100}%`, transform: 'translate(-50%,-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.9)', boxShadow: '0 4px 12px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a78c8" strokeWidth="2"><path d="M7 7l-3 3 3 3M17 7l3 3-3 3M7 7h10M10 4l-3 3M14 4l3 3"/></svg>
            </div>
            {/* Result card */}
            <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, background: 'rgba(255,255,255,.96)', borderRadius: 13, padding: '13px 15px', boxShadow: '0 8px 22px rgba(60,40,100,.18)' }}>
              <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.55, color: '#272a3a' }}>
                {line1}<br />{line2}
              </p>
              <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#22a06b' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>
                  全業界で安全
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: '#6b6f82', padding: '5px 11px', borderRadius: 8, background: '#f1f1f6' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>
                  コピー
                </span>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#8a8ea0', fontWeight: 500, marginTop: 4 }}>
          🖐 ドラッグするだけで、言葉のトーンが変わります
        </p>
      </div>

      {/* Annotation */}
      <div style={{ position: 'absolute', top: 108, right: -6, textAlign: 'center', color: '#e85a9b', fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, transform: 'rotate(-4deg)' }}>
        2軸を直感的に<br />ドラッグするだけ！
        <svg width="46" height="34" viewBox="0 0 46 34" fill="none" style={{ position: 'absolute', left: -30, top: 30 }}>
          <path d="M44 2C30 2 8 6 4 26" stroke="#e85a9b" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4"/>
          <path d="M3 19l1 9 8-4" stroke="#e85a9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

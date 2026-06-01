'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, SwitchCamera, Trash2, Save, Share2, Home, Settings, LogOut, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// ─── Overlay presets ──────────────────────────────────────────────
const PRESET_OVERLAYS = [
  { name: 'The Plug Live',    src: '/img/overlays/maino_frame_01.svg' },
  { name: '48 Laws Tape',     src: '/img/overlays/maino_frame_02.svg' },
  { name: 'Twitch Stream',    src: '/img/overlays/maino_frame_03.svg' },
  { name: 'Neon Cyber Grid',  src: '/img/overlays/maino_frame_04.svg' },
  { name: 'Equalizer Wave',   src: '/img/overlays/maino_frame_05.svg' },
  { name: 'Plugged In',       src: '/img/overlays/maino_frame_06.svg' },
  { name: 'Retro Vinyl',      src: '/img/overlays/maino_frame_07.svg' },
  { name: 'VIP Access Gold',  src: '/img/overlays/maino_frame_08.svg' },
  { name: 'Voltage Surge',    src: '/img/overlays/maino_frame_09.svg' },
]

const PRESET_PROPS = [
  { name: 'DJ Headphones', src: '/img/props/headphones.svg' },
  { name: 'DJ Turntable',  src: '/img/props/turntable.svg' },
  { name: 'Neon Glasses',  src: '/img/props/neon_sunglasses.svg' },
  { name: 'The Plug 🔌',    src: '/img/props/plug.svg' },
  { name: 'Lightning ⚡',   src: '/img/props/lightning.svg' },
  { name: 'Gold Mic 🎤',    src: '/img/props/gold_mic.svg' },
]

// ─── Props: sticker type ─────────────────────────────────────────────────────
interface Sticker {
  id: string
  src: string
  x: number
  y: number
  scale: number
  rot: number
}

interface PhotoboothCoreProps {
  /** When true, saves go to localStorage only (kiosk mode) */
  kioskMode?: boolean
  /** Supabase user ID for cloud saves */
  userId?: string
}

export function PhotoboothCore({ kioskMode = false, userId }: PhotoboothCoreProps) {
  const router = useRouter()
  const supabase = createClient()

  // ─── Refs ───────────────────────────────────────────────────────
  const videoRef   = useRef<HTMLVideoElement>(null)
  const stageRef   = useRef<HTMLDivElement>(null)
  const composeRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLImageElement>(null)

  // ─── Camera state ───────────────────────────────────────────────
  const [stream, setStream]         = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [mirror, setMirror]         = useState(true)
  const [aspect, setAspect]         = useState('9:16')

  // ─── Overlay / props ────────────────────────────────────────────
  const [overlayUrl, setOverlayUrl] = useState('')
  const [stickers, setStickers]     = useState<Sticker[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ─── Countdown / preview ────────────────────────────────────────
  const [countdown, setCountdown]       = useState<number | null>(null)
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null)
  const [showPreview, setShowPreview]   = useState(false)
  const [saving, setSaving]             = useState(false)

  // ─── Camera control ─────────────────────────────────────────────
  const startCamera = useCallback(async (mode: 'user' | 'environment' = facingMode) => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 2560 } },
        audio: false,
      })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
    } catch (err) {
      toast.error('Camera error. Ensure HTTPS and camera permissions are granted.')
    }
  }, [facingMode, stream])

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function switchCamera() {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next)
    setMirror(next === 'user')
    startCamera(next)
  }

  // ─── Sticker management ─────────────────────────────────────────
  function addSticker(src: string) {
    const rect = stageRef.current?.getBoundingClientRect()
    const sticker: Sticker = {
      id: crypto.randomUUID(),
      src,
      x: (rect?.width ?? 200) / 2,
      y: (rect?.height ?? 300) / 2,
      scale: 1,
      rot: 0,
    }
    setStickers(prev => [...prev, sticker])
    setSelectedId(sticker.id)
  }

  function deleteSelected() {
    if (!selectedId) return
    setStickers(prev => prev.filter(s => s.id !== selectedId))
    setSelectedId(null)
  }

  // ─── Capture ────────────────────────────────────────────────────
  async function runCapture() {
    // Countdown 3-2-1
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      await new Promise(r => setTimeout(r, 800))
    }
    setCountdown(null)

    const video = videoRef.current
    const canvas = composeRef.current
    if (!video || !canvas) return

    const [arW, arH] = aspect.split(':').map(Number)
    const targetAR = arW / arH
    const vw = video.videoWidth, vh = video.videoHeight
    let cropW = vw, cropH = Math.round(vw / targetAR)
    if (cropH > vh) { cropH = vh; cropW = Math.round(vh * targetAR) }
    const sx = Math.floor((vw - cropW) / 2)
    const sy = Math.floor((vh - cropH) / 2)

    canvas.width = cropW
    canvas.height = cropH
    const ctx = canvas.getContext('2d')!

    ctx.save()
    if (mirror) { ctx.translate(cropW, 0); ctx.scale(-1, 1) }
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH)
    ctx.restore()

    // Draw overlay
    if (overlayUrl && overlayRef.current?.complete) {
      ctx.drawImage(overlayRef.current, 0, 0, cropW, cropH)
    }

    // Draw stickers
    const rect = stageRef.current!.getBoundingClientRect()
    for (const st of stickers) {
      const img = await loadImage(st.src)
      const scaleX = cropW / rect.width
      const scaleY = cropH / rect.height
      const cx = st.x * scaleX
      const cy = st.y * scaleY
      const s = st.scale * (220 * scaleX) / img.width
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(st.rot)
      ctx.scale(s, s)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      ctx.restore()
    }

    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
    setShowPreview(true)
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = rej
      img.src = src
    })
  }

  // ─── Save ───────────────────────────────────────────────────────
  async function savePhoto() {
    if (!previewUrl) return
    setSaving(true)

    if (kioskMode || !userId) {
      // localStorage save (kiosk)
      try {
        const list = JSON.parse(localStorage.getItem('photos') || '[]')
        list.push({ id: crypto.randomUUID(), dataURL: previewUrl, createdAt: Date.now() })
        localStorage.setItem('photos', JSON.stringify(list))
        toast.success('Saved to device!')
      } catch {
        toast.error('Storage full — delete some photos first.')
      }
    } else {
      // Supabase Storage save (member)
      try {
        const blob = await (await fetch(previewUrl)).blob()
        const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.png`
        const path = `${userId}/${filename}`
        const { error } = await supabase.storage.from('photos').upload(path, blob, {
          contentType: 'image/png',
          upsert: false,
        })
        if (error) throw error
        toast.success('Photo saved to your gallery!')
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save photo.')
      }
    }

    setSaving(false)
    setShowPreview(false)
  }

  // ─── Share ──────────────────────────────────────────────────────
  async function sharePhoto() {
    if (!previewUrl) return
    const blob = await (await fetch(previewUrl)).blob()
    const file = new File([blob], 'glogang-booth.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Glo Gang Photobooth' }) } catch {}
    } else {
      const a = document.createElement('a')
      a.href = previewUrl; a.download = 'glogang-booth.png'
      a.click()
    }
  }

  // ─── End session (member mode) ──────────────────────────────────
  async function endSession() {
    if (!confirm('End session and go home?')) return
    await supabase.auth.signOut()
    router.push('/')
  }

  // ─── Sticker gesture handling (pointer events) ──────────────────
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const gestureBase = useRef<{ x: number; y: number; scale: number; rot: number } | null>(null)
  const gestureStart = useRef<{ cx: number; cy: number; dist: number; angle: number } | null>(null)
  const gestureTarget = useRef<string | null>(null)

  function computeGesture(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return null
    if (pts.length === 1) return { count: 1, cx: pts[0].x, cy: pts[0].y, dist: 0, angle: 0 }
    const cx = (pts[0].x + pts[1].x) / 2
    const cy = (pts[0].y + pts[1].y) / 2
    const dx = pts[1].x - pts[0].x
    const dy = pts[1].y - pts[0].y
    return { count: 2, cx, cy, dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) }
  }

  function onStickerPointerDown(e: React.PointerEvent, stickerId: string) {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    gestureTarget.current = stickerId
    const st = stickers.find(s => s.id === stickerId)
    if (st) {
      gestureBase.current = { x: st.x, y: st.y, scale: st.scale, rot: st.rot }
      gestureStart.current = computeGesture(Array.from(activePointers.current.values()))
    }
    setSelectedId(stickerId)
  }

  function onStickerPointerMove(e: React.PointerEvent) {
    if (!gestureTarget.current || !gestureBase.current || !gestureStart.current) return
    if (!activePointers.current.has(e.pointerId)) return
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = computeGesture(Array.from(activePointers.current.values()))
    if (!g) return
    setStickers(prev => prev.map(st => {
      if (st.id !== gestureTarget.current) return st
      const base = gestureBase.current!
      const start = gestureStart.current!
      if (g.count === 1) {
        return { ...st, x: base.x + (g.cx - start.cx), y: base.y + (g.cy - start.cy) }
      }
      const scaleMul = g.dist / (start.dist || g.dist)
      return {
        ...st,
        x: base.x + (g.cx - start.cx),
        y: base.y + (g.cy - start.cy),
        scale: Math.max(0.2, Math.min(4, base.scale * scaleMul)),
        rot: base.rot + (g.angle - start.angle),
      }
    }))
  }

  function onStickerPointerUp(e: React.PointerEvent) {
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size === 0) {
      gestureTarget.current = null
      gestureBase.current = null
      gestureStart.current = null
    }
  }

  // ─── Render ─────────────────────────────────────────────────────
  const [arW, arH] = aspect.split(':').map(Number)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(15,17,21,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', gap: 12 }}>
          <div style={{ fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 14 }}>
            PLUG BOOTH
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!kioskMode && (
              <Link href="/member/dashboard" className="gg-btn gg-btn--ghost gg-btn--sm">
                <Home size={14} />
              </Link>
            )}
            {kioskMode && (
              <Link href="/kiosk" className="gg-btn gg-btn--ghost gg-btn--sm">
                ← Back
              </Link>
            )}
            {!kioskMode && (
              <button onClick={endSession} className="gg-btn gg-btn--danger gg-btn--sm">
                <LogOut size={14} /> End
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main: camera + controls */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: 16,
        padding: 16,
        maxHeight: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }} className="booth-grid">

        {/* Left — Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Camera stage */}
          <div
            ref={stageRef}
            style={{
              position: 'relative',
              borderRadius: 18,
              overflow: 'hidden',
              background: '#0b0f16',
              border: '1px solid var(--border)',
              aspectRatio: `${arW} / ${arH}`,
              maxHeight: '72vh',
              touchAction: 'none',
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: mirror ? 'scaleX(-1)' : 'none',
              }}
            />

            {/* Overlay image */}
            {overlayUrl && (
              <img
                ref={overlayRef}
                src={overlayUrl}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                crossOrigin="anonymous"
              />
            )}

            {/* Stickers */}
            <div style={{ position: 'absolute', inset: 0, touchAction: 'none' }}>
              {stickers.map(st => (
                <img
                  key={st.id}
                  src={st.src}
                  draggable={false}
                  alt=""
                  onPointerDown={e => onStickerPointerDown(e, st.id)}
                  onPointerMove={onStickerPointerMove}
                  onPointerUp={onStickerPointerUp}
                  onPointerCancel={onStickerPointerUp}
                  style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    width: 220,
                    userSelect: 'none',
                    touchAction: 'none',
                    cursor: 'grab',
                    transformOrigin: 'center center',
                    transform: `translate(${st.x}px, ${st.y}px) translate(-50%, -50%) rotate(${st.rot}rad) scale(${st.scale})`,
                    outline: selectedId === st.id ? '3px dashed rgba(255,255,255,0.35)' : 'none',
                    outlineOffset: 2,
                    borderRadius: 8,
                    filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.6))',
                  }}
                />
              ))}
            </div>

            {/* Countdown overlay */}
            {countdown !== null && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'min(22vw, 22vh)',
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 12px 30px rgba(0,0,0,0.8)',
                background: 'radial-gradient(600px 400px at 50% -10%, rgba(0,0,0,0.2), transparent)',
                pointerEvents: 'none',
              }}>
                {countdown}
              </div>
            )}
          </div>

          {/* Capture controls */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={runCapture} disabled={countdown !== null} className="gg-btn gg-btn--primary">
              <Camera size={16} /> Capture
            </button>
            <button onClick={switchCamera} className="gg-btn gg-btn--secondary">
              <SwitchCamera size={16} /> Switch
            </button>
            <button onClick={() => setMirror(m => !m)} className="gg-btn gg-btn--ghost">
              Mirror: {mirror ? 'On' : 'Off'}
            </button>
            <select
              value={aspect}
              onChange={e => setAspect(e.target.value)}
              className="gg-btn gg-btn--ghost"
              style={{ appearance: 'none', paddingRight: 24 }}
            >
              <option value="3:4">3:4</option>
              <option value="1:1">1:1</option>
              <option value="9:16">9:16</option>
            </select>
          </div>
        </div>

        {/* Right — Overlays & Props */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Overlays */}
          <div className="gg-card" style={{ padding: 14 }}>
            <h4 style={{ marginBottom: 10, fontSize: 13 }}>Overlays</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button onClick={() => setOverlayUrl('')} className="gg-btn gg-btn--ghost gg-btn--sm">None</button>
              <label className="gg-btn gg-btn--ghost gg-btn--sm" style={{ cursor: 'pointer' }}>
                Load ↑
                <input
                  type="file" accept="image/png,image/webp,image/svg+xml" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) setOverlayUrl(URL.createObjectURL(f)); e.target.value = '' }}
                />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
              {PRESET_OVERLAYS.map(o => (
                <button
                  key={o.src}
                  onClick={() => setOverlayUrl(overlayUrl === o.src ? '' : o.src)}
                  title={o.name}
                  style={{
                    padding: 4, borderRadius: 10,
                    background: overlayUrl === o.src ? 'rgba(255,209,0,0.15)' : 'var(--surface)',
                    border: `1px solid ${overlayUrl === o.src ? 'var(--border-accent)' : 'var(--border)'}`,
                    cursor: 'pointer', overflow: 'hidden',
                  }}
                >
                  <img src={o.src} alt={o.name} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Props */}
          <div className="gg-card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontSize: 13 }}>Props</h4>
              {selectedId && (
                <button onClick={deleteSelected} className="gg-btn gg-btn--danger gg-btn--sm">
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <label className="gg-btn gg-btn--ghost gg-btn--sm" style={{ cursor: 'pointer' }}>
                Add Prop ↑
                <input
                  type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { addSticker(URL.createObjectURL(f)); e.target.value = '' } }}
                />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
              {PRESET_PROPS.map(p => (
                <button
                  key={p.src}
                  onClick={() => addSticker(p.src)}
                  title={p.name}
                  style={{
                    padding: 6, borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <img src={p.src} alt={p.name} style={{ width: '100%', height: 60, objectFit: 'contain', display: 'block' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden compose canvas */}
      <canvas ref={composeRef} style={{ display: 'none' }} />

      {/* Preview modal */}
      {showPreview && previewUrl && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div className="gg-card" style={{ maxWidth: 500, width: '100%', padding: 12 }}>
            <img
              src={previewUrl}
              alt="Captured"
              style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block', borderRadius: 12 }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowPreview(false)} className="gg-btn gg-btn--ghost gg-btn--sm">
                  <X size={14} /> Retake
                </button>
                <button onClick={savePhoto} disabled={saving} className="gg-btn gg-btn--ok gg-btn--sm">
                  <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={sharePhoto} className="gg-btn gg-btn--secondary gg-btn--sm">
                  <Share2 size={14} /> Share
                </button>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .booth-grid {
            grid-template-columns: 1fr !important;
            overflow-y: auto !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  )
}

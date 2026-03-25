'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface TesseraCardProps {
  nome: string
  cognome: string
  nickname?: string | null
  avatarSrc?: string | null
  iniziali: string
  numeroTessera?: string | null
  scadenzaTessera?: string | null
  dataIscrizione: string
  attivo: boolean
  badge?: string[] | null
}

export function TesseraCard({
  nome,
  cognome,
  nickname,
  avatarSrc,
  iniziali,
  numeroTessera,
  scadenzaTessera,
  dataIscrizione,
  attivo,
  badge,
}: TesseraCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [gloss, setGloss] = useState({ x: 50, y: 50 })
  const orientationActive = useRef(false)

  const nomeCompleto = `${nome} ${cognome}`

  const dataIscrizioneFormattata = new Date(dataIscrizione + 'T00:00:00').toLocaleDateString(
    'it-IT',
    { month: 'short', year: 'numeric' }
  )

  const scadenzaFormattata = scadenzaTessera
    ? new Date(scadenzaTessera + 'T00:00:00').toLocaleDateString('it-IT', {
        month: '2-digit',
        year: 'numeric',
      })
    : null

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const beta = Math.min(Math.max(e.beta ?? 0, -30), 30)
    const gamma = Math.min(Math.max(e.gamma ?? 0, -30), 30)
    setTilt({ x: -(beta / 30) * 10, y: (gamma / 30) * 12 })
    setGloss({
      x: ((gamma + 30) / 60) * 100,
      y: ((beta + 30) / 60) * 100,
    })
  }, [])

  useEffect(() => {
    const card = cardRef.current

    const onMouseMove = (e: MouseEvent) => {
      if (!card) return
      const rect = card.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      setTilt({ x: -dy * 10, y: dx * 14 })
      setGloss({ x: ((dx + 1) / 2) * 100, y: ((dy + 1) / 2) * 100 })
    }

    const onMouseLeave = () => {
      setTilt({ x: 0, y: 0 })
      setGloss({ x: 50, y: 50 })
    }

    card?.addEventListener('mousemove', onMouseMove)
    card?.addEventListener('mouseleave', onMouseLeave)

    // Android e altri browser non-iOS: attiva orientamento direttamente
    const needsPermission =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'

    if (!needsPermission && typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation)
      orientationActive.current = true
    }

    return () => {
      card?.removeEventListener('mousemove', onMouseMove)
      card?.removeEventListener('mouseleave', onMouseLeave)
      if (orientationActive.current) {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [handleOrientation])

  // iOS 13+: richiede permesso esplicito al primo tap
  const handleClick = async () => {
    const DOE = DeviceOrientationEvent as {
      requestPermission?: () => Promise<string>
    }
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DOE.requestPermission === 'function' &&
      !orientationActive.current
    ) {
      try {
        const perm = await DOE.requestPermission()
        if (perm === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation)
          orientationActive.current = true
        }
      } catch {}
    }
  }

  return (
    <div style={{ perspective: '1200px' }} onClick={handleClick}>
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.08s ease-out',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          aspectRatio: '1.586 / 1',
          background:
            'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #1e3a5f 65%, #0c1a3a 100%)',
        }}
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl cursor-pointer select-none"
      >
        {/* Texture a punti sullo sfondo */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Overlay olografico — gradiente arcobaleno che segue cursore/giroscopio */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at ${gloss.x}% ${gloss.y}%,
              rgba(255, 100, 100, 0.45),
              rgba(255, 220, 80, 0.45),
              rgba(100, 255, 130, 0.45),
              rgba(80, 220, 255, 0.45),
              rgba(120, 100, 255, 0.45),
              rgba(255, 80, 200, 0.45),
              rgba(255, 100, 100, 0.45)
            )`,
            mixBlendMode: 'screen',
            opacity: 0.5,
          }}
        />

        {/* Riflesso speculare */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 45% at ${gloss.x}% ${gloss.y}%, rgba(255,255,255,0.13) 0%, transparent 70%)`,
          }}
        />

        {/* Contenuto della tessera */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">

          {/* Riga superiore: logo + chip */}
          <div className="flex items-start justify-between">
            <img
              src="/logotipo.svg"
              alt="La Tavola Gioconda"
              className="h-6 w-auto brightness-0 invert opacity-90"
            />
            <ChipIcon />
          </div>

          {/* Sezione centrale: avatar + nome */}
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 rounded-full overflow-hidden ring-2 ring-white/30 bg-white/20"
              style={{ width: '52px', height: '52px' }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={nomeCompleto}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                  {iniziali}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight truncate">{nomeCompleto}</p>
              {nickname && (
                <p className="text-white/55 text-xs truncate">@{nickname}</p>
              )}
              {badge && badge.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {badge.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-white/15 text-white/80 leading-none"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Riga inferiore: numero tessera + scadenza */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/45 text-[10px] uppercase tracking-widest mb-0.5">
                Tessera N°
              </p>
              <p className="font-mono font-bold text-sm tracking-widest">
                {numeroTessera ?? '—'}
              </p>
              <p className="text-white/35 text-[10px] mt-1">
                Socio dal {dataIscrizioneFormattata}
              </p>
            </div>
            {scadenzaFormattata && (
              <div className="text-right">
                <p className="text-white/45 text-[10px] uppercase tracking-widest mb-0.5">
                  Valida fino
                </p>
                <p className="font-mono font-medium text-sm">{scadenzaFormattata}</p>
              </div>
            )}
          </div>
        </div>

        {/* Watermark "Sospesa" se la tessera non è attiva */}
        {!attivo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-red-400 font-black text-2xl tracking-[0.3em] uppercase border-4 border-red-400 px-3 py-1 opacity-70"
              style={{ transform: 'rotate(-18deg)' }}
            >
              Sospesa
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ChipIcon() {
  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none" aria-hidden="true">
      <rect width="32" height="24" rx="3" fill="#d4af37" />
      <rect x="10" y="0" width="12" height="24" fill="#c9a227" />
      <rect x="0" y="8" width="32" height="8" fill="#c9a227" />
      <rect x="10" y="8" width="12" height="8" fill="#b8960f" />
      <line x1="10" y1="0" x2="10" y2="24" stroke="#a07800" strokeWidth="0.5" />
      <line x1="22" y1="0" x2="22" y2="24" stroke="#a07800" strokeWidth="0.5" />
      <line x1="0" y1="8" x2="32" y2="8" stroke="#a07800" strokeWidth="0.5" />
      <line x1="0" y1="16" x2="32" y2="16" stroke="#a07800" strokeWidth="0.5" />
    </svg>
  )
}

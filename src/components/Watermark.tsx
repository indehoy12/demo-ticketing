const LOGO = '/watermark-logo.png'

/**
 * Page-wide watermark: the Sumber Rejeki Tech logo, tiled and tilted, semi-transparent.
 * pointer-events-none so it never blocks clicks; QR wrappers sit above it (z-[60]) so it never covers a QR code.
 */
export function Watermark() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 select-none overflow-hidden">
      <div
        className="absolute -inset-1/2"
        style={{
          backgroundImage: `url(${LOGO})`,
          backgroundSize: 'clamp(300px, 36vw, 480px) auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          opacity: 0.12,
          transform: 'rotate(-22deg)',
        }}
      />
    </div>
  )
}

/** Stronger local watermark for the e-ticket card (the QR stays above it). */
export function LocalWatermark({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 z-10 select-none overflow-hidden ${className}`}>
      <div
        className="absolute -inset-1/2"
        style={{
          backgroundImage: `url(${LOGO})`,
          backgroundSize: '230px auto',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          opacity: 0.1,
          transform: 'rotate(-22deg)',
        }}
      />
    </div>
  )
}

export function DemoPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-2.5 py-1 text-[11px] font-bold text-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-ink" /> DEMO
    </span>
  )
}

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { qrPayload } from '../lib/seed'

/** Renders a demo ticket QR. Payload is "DEMO-TICKET:<code>" — it carries no payment data. */
export function QrImage({ code, size = 180 }: { code: string; size?: number }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(qrPayload(code), { margin: 1, width: size * 2, errorCorrectionLevel: 'M', color: { dark: '#001f5a', light: '#ffffff' } })
      .then((u) => { if (alive) setUrl(u) })
      .catch(() => { if (alive) setUrl('') })
    return () => { alive = false }
  }, [code, size])

  return (
    // z-[60] keeps the QR above the page watermark (z-50) so it is never covered.
    <div className="relative z-[60] inline-block rounded-xl bg-white p-2 ring-1 ring-line" style={{ width: size + 16, height: size + 16 }}>
      {url ? <img src={url} alt={`QR code tiket demo ${code}`} width={size} height={size} /> : <div style={{ width: size, height: size }} className="animate-pulse rounded bg-mist" />}
    </div>
  )
}

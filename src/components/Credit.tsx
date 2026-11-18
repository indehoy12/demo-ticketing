import { SITE_URL, BRAND } from '../lib/constants'

/** Bottom-most strip on every page. */
export function Credit() {
  return (
    <div className="border-t border-line bg-white px-4 py-4 text-center">
      <a
        href={SITE_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 text-xs font-semibold text-mute hover:text-ink sm:text-sm"
      >
        <img src="/logo-mark.png" alt="" className="h-6 w-auto" />
        <span>Developed by {BRAND}</span>
      </a>
    </div>
  )
}

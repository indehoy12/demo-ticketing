import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

/** Props to give a <td> so it becomes a labelled row on phones (card layout) and a normal cell from md up. */
export const cellProps = (label: string | undefined) => ({
  'data-label': label ?? '',
})
export const rowCls =
  'block rounded-2xl border border-line bg-white p-2 md:table-row md:rounded-none md:border-0 md:p-0'
export const cellCls =
  'flex items-start justify-between gap-4 px-3 py-2 text-right before:shrink-0 before:text-left before:text-xs before:font-semibold before:text-mute before:content-[attr(data-label)] md:table-cell md:px-4 md:py-3 md:text-left md:before:hidden'

type ElWithChildren = ReactElement<{ className?: string; children?: ReactNode; labels?: string[] }>

/**
 * Responsive table: a normal table from md (tablet portrait) upwards,
 * and stacked cards with labels on phones, so nothing needs sideways scrolling.
 */
export function Table({ head, children, caption }: { head: string[]; children: ReactNode; caption?: string }) {
  const rows = Children.map(children, (row) => {
    if (!isValidElement(row)) return row
    const r = row as ElWithChildren
    if (typeof r.type !== 'string') return cloneElement(r, { labels: head }) // component rows render their own cells
    return cloneElement(r, {
      className: `${r.props.className ?? ''} ${rowCls}`.trim(),
      children: Children.map(r.props.children, (cell, i) => {
        if (!isValidElement(cell)) return cell
        const c = cell as ElWithChildren
        return cloneElement(c, {
          ...(cellProps(head[i]) as object),
          className: `${c.props.className ?? ''} ${cellCls}`.trim(),
          children: <span className="min-w-0 md:contents">{c.props.children}</span>,
        } as never)
      }),
    })
  })
  return (
    <div className="md:overflow-x-auto md:rounded-2xl md:border md:border-line md:bg-white">
      <table className="block w-full text-left text-sm md:table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="sr-only md:not-sr-only md:table-header-group md:border-b md:border-line md:bg-mist md:text-xs md:font-semibold md:text-mute">
          <tr>{head.map((h) => <th key={h || 'x'} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="block space-y-3 md:table-row-group md:space-y-0 md:divide-y md:divide-line">{rows}</tbody>
      </table>
    </div>
  )
}

export const td = 'align-middle'

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0"><h1 className="text-3xl font-extrabold">{title}</h1>{sub && <p className="mt-1 max-w-2xl text-sm text-mute">{sub}</p>}</div>
      {right}
    </div>
  )
}

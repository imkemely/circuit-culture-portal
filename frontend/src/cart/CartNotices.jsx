import { useCart } from './useCart'

export default function CartNotices() {
  const { notices, undoRemove, dismissNotice } = useCart()
  if (notices.length === 0) return null

  return (
    <ul className="cc-notices">
      {notices.map((notice) => (
        <li
          key={notice.id}
          className={`cc-notice cc-notice-${notice.kind}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          <span>{notice.text}</span>
          {notice.line && (
            <button type="button" className="cc-link-button" onClick={() => undoRemove(notice.id)}>
              Undo
            </button>
          )}
          <button
            type="button"
            className="cc-notice-dismiss"
            aria-label="Dismiss message"
            onClick={() => dismissNotice(notice.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}

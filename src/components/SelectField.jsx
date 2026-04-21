import { Children, useEffect, useRef, useState } from 'react';

// Drop-in replacement for <select> with a fully custom dropdown.
// Children should be <option value="...">label</option> elements — the same API
// as a native select — so existing call-sites don't need to change.
//
// The popup panel is absolutely positioned with left-0 right-0, so its width
// always matches the trigger. Clicks outside or Escape close it.

function getLabel(node) {
  // Option's children may be a string or a React node; render as-is.
  return node;
}

export default function SelectField({ value, onChange, disabled, children, className = '', placeholder }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Extract option descriptors from <option> children without rendering them to the DOM.
  const options = Children.toArray(children)
    .filter((c) => c && typeof c === 'object' && c.props && 'value' in c.props)
    .map((c) => ({
      value: c.props.value,
      label: getLabel(c.props.children),
      disabled: Boolean(c.props.disabled),
    }));

  const current = options.find((o) => String(o.value) === String(value));
  // Heuristic: an option with value === "" is treated as placeholder
  const placeholderLabel = placeholder
    || options.find((o) => o.value === '')?.label
    || 'Select…';
  const displayLabel = current ? current.label : placeholderLabel;
  const isPlaceholderShowing = !current || String(current.value) === '';

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function choose(v) {
    // Emit a synthetic event shape so existing onChange handlers
    // written for a native <select> (e.target.value) keep working.
    onChange?.({ target: { value: v } });
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        className={`w-full h-10 pl-3 pr-9 text-sm text-left bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      >
        <span className={`block truncate ${isPlaceholderShowing ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>
            <polyline points="5 8 10 13 15 8" />
          </svg>
        </span>
      </button>

      {open && options.length > 0 && (
        <ul
          ref={panelRef}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1"
        >
          {options.map((opt, idx) => {
            const selected = String(opt.value) === String(value);
            return (
              <li
                key={`${opt.value}-${idx}`}
                role="option"
                aria-selected={selected}
                aria-disabled={opt.disabled || undefined}
                onClick={() => { if (!opt.disabled) choose(opt.value); }}
                className={
                  `px-3 py-2 text-sm ` +
                  (opt.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : selected
                      ? 'bg-aps-blue-light text-aps-blue font-medium cursor-pointer'
                      : 'text-gray-700 hover:bg-aps-blue-light/40 cursor-pointer')
                }
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

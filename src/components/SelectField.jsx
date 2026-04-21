// Styled select that hides the native caret and draws its own chevron.
// Use anywhere a vanilla <select> would go; it forwards all props.
//
// The trouble with native <select>: the browser draws its caret at a fixed
// position that ignores the element's right padding. Using `appearance-none`
// suppresses it so we can place our own SVG with proper breathing room.

export default function SelectField({ className = '', children, ...props }) {
  return (
    <div className="relative inline-block w-full">
      <select
        {...props}
        className={`appearance-none w-full h-10 pl-3 pr-9 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 8 10 13 15 8" />
        </svg>
      </span>
    </div>
  );
}

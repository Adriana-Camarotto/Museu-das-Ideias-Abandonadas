/**
 * Alert reutilizavel com variantes semanticas.
 */

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

const variants = {
  error: {
    container: 'bg-[#2d1a1a] border border-[rgba(224,96,96,0.3)] rounded-xl p-6',
    title: 'text-[#e06060]'
  },
  success: {
    container: 'bg-[#1a2d22] border border-[rgba(109,212,126,0.3)] rounded-xl p-6',
    title: 'text-[#6dd47e]'
  },
  info: {
    container: 'bg-[#1a2330] border border-[rgba(126,170,255,0.3)] rounded-xl p-6',
    title: 'text-[#8fb3ff]'
  },
  warning: {
    container: 'bg-[#2d251a] border border-[rgba(232,184,109,0.3)] rounded-xl p-6',
    title: 'text-[#e8b86d]'
  }
};

const defaultIcons = {
  error: '💀',
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️'
};

export default function Alert({
  variant = 'info',
  title,
  message,
  icon,
  className,
  children
}) {
  const selected = variants[variant] || variants.info;

  return (
    <div className={joinClasses(selected.container, className)}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon || defaultIcons[variant]}</span>
        <div>
          {title ? (
            <h3 className={joinClasses(selected.title, 'font-semibold mb-1')}>
              {title}
            </h3>
          ) : null}
          {message ? <p className="text-sm text-[#d4a8a8]">{message}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

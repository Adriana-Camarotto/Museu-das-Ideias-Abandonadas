/**
 * Botao reutilizavel com variantes visuais do Museu.
 */

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses = {
  primary:
    'bg-gradient-to-r from-[#7c5ce8] to-[#c4a8ff] text-white hover:opacity-90 transition-opacity px-6 py-3',
  secondary:
    'px-6 py-3 border border-[rgba(180,140,255,0.3)] text-[#c4a8ff] hover:bg-[rgba(180,140,255,0.1)]',
  nav: 'w-full justify-start gap-3 px-3 py-2 text-sm',
  icon: 'flex-shrink-0 w-8 h-8 bg-[rgba(180,140,255,0.1)] text-[#c4a8ff] hover:bg-[rgba(180,140,255,0.2)]'
};

const navStateClasses = {
  active: 'bg-[rgba(180,140,255,0.1)] text-[#c4a8ff]',
  inactive: 'text-[#a898c8] hover:bg-[rgba(180,140,255,0.05)]'
};

export default function Button({
  variant = 'primary',
  active = false,
  type = 'button',
  className,
  children,
  ...props
}) {
  const isNav = variant === 'nav';

  const classes = joinClasses(
    baseClasses,
    variantClasses[variant],
    isNav ? (active ? navStateClasses.active : navStateClasses.inactive) : '',
    className
  );

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
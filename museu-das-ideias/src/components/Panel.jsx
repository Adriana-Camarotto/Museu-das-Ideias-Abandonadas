/**
 * Panel reutilizavel para blocos de conteudo com o visual do Museu.
 */

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

const variantClasses = {
  soft: 'bg-[rgba(180,140,255,0.05)] border border-[rgba(180,140,255,0.15)] rounded-lg',
  solid: 'bg-[#161020] border border-[rgba(180,140,255,0.15)] rounded-xl'
};

export default function Panel({
  as: Component = 'div',
  variant = 'soft',
  className,
  children,
  ...props
}) {
  return (
    <Component className={joinClasses(variantClasses[variant], className)} {...props}>
      {children}
    </Component>
  );
}

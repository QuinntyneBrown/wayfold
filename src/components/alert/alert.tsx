type Props = { tone: "danger" | "warning"; title: string; children: React.ReactNode };

export function Alert({ tone, title, children }: Props) {
  return (
    <div className={`alert alert--${tone}`} role="alert">
      <div className="alert__body">
        <div className="alert__title">{title}</div>
        <p>{children}</p>
      </div>
    </div>
  );
}

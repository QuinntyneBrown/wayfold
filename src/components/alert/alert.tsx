type Props = { tone: "danger" | "warning" | "success"; title: string; children: React.ReactNode };

/** Danger and warning interrupt (role=alert); success is a polite status. */
export function Alert({ tone, title, children }: Props) {
  return (
    <div className={`alert alert--${tone}`} role={tone === "success" ? "status" : "alert"}>
      <div className="alert__body">
        <div className="alert__title">{title}</div>
        <p>{children}</p>
      </div>
    </div>
  );
}

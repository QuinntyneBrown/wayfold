export function AuthLoading() {
  return (
    <>
      <div className="card stack" aria-hidden="true">
        <span className="skeleton skeleton--text" style={{ width: "65%" }} />
        <span className="skeleton skeleton--text" style={{ width: "95%" }} />
        <span className="skeleton skeleton--text" style={{ width: "80%" }} />
        <span className="skeleton skeleton--text" style={{ width: "45%" }} />
      </div>
      <p role="status">Loading…</p>
    </>
  );
}

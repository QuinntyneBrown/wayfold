type Props = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel";
  autoComplete?: string;
  error?: string;
  defaultValue?: string;
  optional?: boolean;
};

/** Labelled input whose error is tied to it with aria-describedby (L2-016 AC3). */
export function TextField({ id, name, label, type = "text", autoComplete, error, defaultValue, optional }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="input"
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span className="field__error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}

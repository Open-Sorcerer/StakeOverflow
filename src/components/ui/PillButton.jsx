import Icon from "./Icon";

/** Pill button with its trailing icon nested in its own circle. */
function PillButton({
  variant = "primary",
  size,
  icon = "arrowUpRight",
  busy = false,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" && "btn-sm",
    icon && "has-icon",
    busy && "is-busy",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} {...props}>
      <span>{children}</span>
      {icon && (
        <span className="btn-icon">
          <Icon name={busy ? "loader" : icon} size={size === "sm" ? 15 : 17} />
        </span>
      )}
    </button>
  );
}

export default PillButton;

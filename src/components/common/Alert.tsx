import { type ReactNode } from "react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => {
  return (
    <div className="alert alert-error">
      <p className="text-sm">{message}</p>
    </div>
  );
};

/**
 * Flexible alert component for displaying messages with different severity levels.
 * Can display success, warning, info, or error messages based on variant prop.
 *
 * @prop message - The message text or React component to display
 * @prop variant - Alert type: 'info' (default), 'success', 'warning', or error
 */
interface InfoAlertProps {
  message: string | ReactNode;
  variant?: "info" | "success" | "warning";
}

export const Alert = ({ message, variant = "info" }: InfoAlertProps ) => {
  const variantClass = {
    error: "alert-error",
    success: "alert-success",
    warning: "alert-warning",
    info: "alert-info",
  }[variant] || "alert-info";

  return (
    <div className={`alert ${variantClass}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};

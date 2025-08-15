import Swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from "sweetalert2";

/**
 * Custom shadcn/ui themed SweetAlert function
 * @param options - SweetAlert2 options with TypeScript types
 */
export function sweetAlert(
  options: SweetAlertOptions
): Promise<SweetAlertResult<any>> {
  return Swal.fire({
    ...options,
    customClass: {
      popup: "rounded-xl bg-background text-foreground shadow-lg",
      title: "text-lg font-semibold text-foreground",
      htmlContainer: "text-sm text-muted-foreground",
      confirmButton:
        "bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary",
      cancelButton:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-secondary",
    },
    buttonsStyling: false,
  });
}

// Optional: small helper for quick alerts
export function showToast(
  title: string,
  icon: SweetAlertIcon = "success",
  timer = 8000
) {
  return Swal.fire({
    title,
    icon,
    toast: true,
    position: "center",
    timer,
    showConfirmButton: false,
    customClass: {
      popup: "rounded-lg bg-background text-foreground shadow-md p-4",
      title: "text-sm font-medium",
    },
    buttonsStyling: false,
  });
}

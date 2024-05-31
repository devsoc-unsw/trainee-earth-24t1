import { Toaster, toast } from 'sonner'

type alertStyles = (
  "Default"
  | "Success"
  | "Info"
  | "Warning"
  | "Error"
)

export function Alert(style: alertStyles, title: string, message: string) {
  switch (style) {
    case "Default":
      toast(
        title, {
          description: message,
        }
      );
      break;
    case "Success":
      toast.success(
        title, {
          description: message,
        }
      );
      break;
    case "Info":
      toast.info(
        title, {
          description: message,
        }
      );
      break;
    case "Warning":
      toast.warning(
        title, {
          description: message,
        }
      );
      break;
    case "Error":
      toast.error(
        title, {
          description: message,
        }
      );
      break;
  }
}

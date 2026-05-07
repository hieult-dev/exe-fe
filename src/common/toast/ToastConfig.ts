import type { ToastContainerProps } from "react-toastify";

export const toastConfig: ToastContainerProps = {
  position: "top-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  limit: 3,
  newestOnTop: true,
};

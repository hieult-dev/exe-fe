import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastConfig } from "@/common/toast/ToastConfig";

export default function ToastProvider() {
  return <ToastContainer {...toastConfig} />;
}

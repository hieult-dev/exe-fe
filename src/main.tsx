import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "bootstrap/dist/css/bootstrap.min.css"
import "@/common/style/global.css"
import "ol/ol.css"
ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
)

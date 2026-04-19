import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "bootstrap/dist/css/bootstrap.min.css"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import "@/common/style/global.css"
import "ol/ol.css"
import { PrimeReactProvider } from 'primereact/api'
ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <PrimeReactProvider>
            <App />
        </PrimeReactProvider>
    </BrowserRouter>
)

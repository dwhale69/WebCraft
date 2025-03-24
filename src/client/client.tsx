import "./global.css";
import { createRoot } from "react-dom/client";
import App from "./index.tsx";

const root = createRoot(document.getElementById("root")!);

root.render(<App />);

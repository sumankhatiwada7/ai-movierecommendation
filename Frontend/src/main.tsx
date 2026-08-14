import ReactDOM from "react-dom/client";
import App from "./App";
import  {Toaster}  from "sonner";
import { AuthProvider } from "./context/authcontext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-edge)",
          },
        }}
      />

  </AuthProvider>
);
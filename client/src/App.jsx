import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;

import "./App.css";
import AppRoutes from "./routes/appRoutes";
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

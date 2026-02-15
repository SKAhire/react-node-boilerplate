import "./App.css";
import AppRoutes from "./routes";
import { AuthProvider } from "@/context/auth-context";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

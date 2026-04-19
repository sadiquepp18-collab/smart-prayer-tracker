import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthButton } from "@/components/AuthButton";
import { PrayerTracker } from "@/components/PrayerTracker";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Auth */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8" data-testid="app-header">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" data-testid="app-title">
              Smart Prayer Tracker
            </h1>
            <p className="text-white/80 text-sm sm:text-base" data-testid="app-subtitle">
              Track your daily prayers with ease
            </p>
          </div>
          <AuthButton />
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <PrayerTracker />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center" data-testid="app-footer">
          <a
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            href="https://emergent.sh"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="emergent-link"
          >
            <img 
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" 
              alt="Emergent"
              className="w-8 h-8 rounded-full"
            />
            <span>Powered by Emergent</span>
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;

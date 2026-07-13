import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Work from "./pages/Work";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Admin from "./pages/Admin";
import Evaluate from "./pages/Evaluate";
import ProjectDetail from "./pages/ProjectDetail";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/avaliar/:projectId" element={<Evaluate />} />
          <Route path="/projeto/:projectId" element={<ProjectDetail />} />
        </Routes>
      </div>
    </AnimatePresence>
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const isEvaluate = location.pathname.startsWith("/avaliar");

  return (
    <main className="relative min-h-screen bg-white">
      {!isAdmin && !isEvaluate && <Navbar />}
      <AnimatedRoutes />
      {!isAdmin && !isEvaluate && <Footer />}
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout />
    </Router>
  );
}

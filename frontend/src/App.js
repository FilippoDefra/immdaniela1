import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import HomePage from "./pages/Home";
import HomeV2 from "./pages/HomeV2";
import AcquisitoreOccasionale from "./pages/AcquisitoreOccasionale";
import ListingsPage from "./pages/Listings";
import ListingDetailPage from "./pages/ListingDetail";
import { ContactPage, AcquisizioniPage, SegnalaPage } from "./pages/Forms";
import { ClientiCercanoPage, AgenziaPage } from "./pages/Static";
import { ToolsHub, ToolPage } from "./pages/Tools";
import { BlogListPage, BlogDetailPage } from "./pages/Blog";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeV2 />} />
            <Route path="/v1" element={<HomePage />} />
            <Route path="/preview" element={<HomeV2 />} />
            <Route path="/immobili" element={<ListingsPage category="vendita" />} />
            <Route path="/affitti" element={<ListingsPage category="affitto" />} />
            <Route path="/immobili/:id" element={<ListingDetailPage />} />
            <Route path="/clienti-cercano" element={<ClientiCercanoPage />} />
            <Route path="/acquisitore" element={<AcquisitoreOccasionale />} />
            <Route path="/strumenti" element={<ToolsHub />} />
            <Route path="/strumenti/:tool" element={<ToolPage />} />
            <Route path="/agenzia" element={<AgenziaPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/contatti" element={<ContactPage />} />
            <Route path="/acquisizioni" element={<AcquisizioniPage />} />
            <Route path="/segnala-immobile" element={<SegnalaPage />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProxyConfig from "@/pages/ProxyConfig";
import Memory from "@/pages/Memory";
import SegmentationConfig from "@/pages/SegmentationConfig";
import TokenManagement from "@/pages/TokenManagement";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import ApiDocs from "@/pages/ApiDocs";
import KnowledgeGraph from "@/pages/KnowledgeGraph";
import TemporalEntities from "@/pages/TemporalEntities";
import RelationInference from "@/pages/RelationInference";
import MemorySynthesis from "@/pages/MemorySynthesis";
import RAGKnowledgeSources from "@/pages/RAGKnowledgeSources";
import FusionSearchConfig from "@/pages/FusionSearchConfig";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="proxy-config" element={<ProxyConfig />} />
            <Route path="memory" element={<Memory />} />
            <Route path="segmentation-config" element={<SegmentationConfig />} />
            <Route path="token-management" element={<TokenManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="api-docs" element={<ApiDocs />} />
            <Route path="knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="temporal-entities" element={<TemporalEntities />} />
            <Route path="relation-inference" element={<RelationInference />} />
            <Route path="memory-synthesis" element={<MemorySynthesis />} />
            <Route path="rag-knowledge-sources" element={<RAGKnowledgeSources />} />
            <Route path="fusion-search-config" element={<FusionSearchConfig />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

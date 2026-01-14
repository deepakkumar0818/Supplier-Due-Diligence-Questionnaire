"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateForm = async () => {
    setGenerating(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Please add it to .env.local file");
      }

      const response = await fetch(
        `${apiUrl}/api/qhse/due-diligence/due-diligence-questionnaire/code`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status}. ${errorText.slice(0, 100)}`);
      }

      const data = await response.json();

      if (!data.formCode && !data.code) {
        throw new Error("API did not return formCode");
      }

      const formCode = data.formCode || data.code;
      
      // Redirect to form page with formCode
      router.push(`/supplier-questionnaire?formCode=${formCode}`);
    } catch (err) {
      let errorMessage = "Failed to generate form code. ";
      
      if (err.message.includes("fetch") || err.message.includes("Network")) {
        errorMessage += "Cannot connect to backend. Please check if backend is running and NEXT_PUBLIC_API_BASE_URL is correct.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#005A9C' }}>
      <div className="w-full max-w-4xl px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-white/20 text-center mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              Supplier Due Diligence Questionnaire
            </h1>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <p className="text-white/90 text-lg mb-10 leading-relaxed">
            Welcome to the Supplier Due Diligence Questionnaire. Create and
            manage your audit reports efficiently.
          </p>

          {error && (
            <div className="mb-6 text-sm text-red-200 bg-red-950/50 border border-red-500/50 rounded-lg px-4 py-3 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateForm}
              disabled={generating}
              className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-orange-500/50 text-lg disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Code...
                </span>
              ) : (
                "Create New Supplier Questionnaire"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

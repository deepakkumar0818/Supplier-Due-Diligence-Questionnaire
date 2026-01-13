import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen futuristic-bg flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white">
              Supplier Due Diligence Questionnaire
            </h1>
          </div>

          <p className="text-gray-300 text-lg mb-8">
            Welcome to the Supplier Due Diligence Questionnaire. Create and
            manage your audit reports efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/supplier-questionnaire"
              className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/50 text-lg"
            >
              Create New Supplier Questionnaire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

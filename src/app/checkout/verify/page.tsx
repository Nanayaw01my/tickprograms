import { Suspense } from "react";
import { VerifyContent } from "./VerifyContent";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

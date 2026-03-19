"use client";

export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";

const EmployeeNewRequestPage = dynamicImport(() => import("./new-request-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default EmployeeNewRequestPage;

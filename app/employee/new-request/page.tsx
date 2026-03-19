"use client";

import dynamicImport from "next/dynamic";

const EmployeeNewRequestPage = dynamicImport(
  () => import("./new-request-client"),
  { ssr: false },
);

export default EmployeeNewRequestPage;

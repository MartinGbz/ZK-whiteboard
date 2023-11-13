"use client"; // Error components must be Client Components

import ErrorModal from "@/components/error-modal/error-modal";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorModal errorMessage={error.message} reset={reset} />;
}

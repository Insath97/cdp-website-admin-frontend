"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AwardTypesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/awards?tab=categories");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      Redirecting to unified Award Categories...
    </div>
  );
}

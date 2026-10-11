import { Suspense } from "react";

export default function SubscriptionLayout({ children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
} 
"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => ({
      missionId: searchParams.get("mission") ?? "transporter-17",
      payloadId: searchParams.get("payload") ?? undefined,
      operator: searchParams.get("operator") ?? "all",
      status: searchParams.get("status") ?? "all",
      query: searchParams.get("q") ?? ""
    }),
    [searchParams]
  );

  const setState = useCallback(
    (patch: Partial<typeof state>) => {
      const params = new URLSearchParams(searchParams.toString());
      const entries: Array<[string, string | undefined]> = [
        ["mission", patch.missionId ?? state.missionId],
        ["payload", patch.payloadId ?? state.payloadId],
        ["operator", patch.operator ?? state.operator],
        ["status", patch.status ?? state.status],
        ["q", patch.query ?? state.query]
      ];

      for (const [key, value] of entries) {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, state]
  );

  return [state, setState] as const;
}
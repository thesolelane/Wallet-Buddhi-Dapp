import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AddWalletForm } from "@/components/add-wallet-form";
import { TokenTable } from "@/components/token-table";
import { AlertRow } from "@/components/alert-row";
import type { WatchedWallet, PurchasedToken, Alert } from "@shared/schema";

function shortPubkey(p: string) {
  return `${p.slice(0, 6)}…${p.slice(-6)}`;
}

export function Dashboard() {
  const queryClient = useQueryClient();

  const { data: wallets = [] } = useQuery<WatchedWallet[]>({
    queryKey: ["/api/wallets"],
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && wallets.length > 0) setSelectedId(wallets[0].id);
    if (selectedId && !wallets.find((w) => w.id === selectedId)) {
      setSelectedId(wallets[0]?.id ?? null);
    }
  }, [wallets, selectedId]);

  const { data: tokens = [] } = useQuery<PurchasedToken[]>({
    queryKey: [`/api/wallets/${selectedId}/tokens`],
    enabled: !!selectedId,
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: [`/api/wallets/${selectedId}/alerts`],
    enabled: !!selectedId,
  });

  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/wallets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
    },
  });

  return (
    <div className="space-y-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Watched wallets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddWalletForm />
            {wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add a Solana public key to start watching it.
              </p>
            ) : (
              <ul className="divide-y">
                {wallets.map((w) => (
                  <li
                    key={w.id}
                    className={`py-2 flex items-center justify-between gap-3 px-2 rounded-md ${
                      selectedId === w.id ? "bg-primary/10" : "hover-elevate"
                    }`}
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => setSelectedId(w.id)}
                    >
                      <div className="font-medium">{w.label || "Wallet"}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {shortPubkey(w.pubkey)}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Remove"
                      onClick={() => {
                        if (
                          confirm(
                            "Remove this wallet and all its recorded tokens & alerts?",
                          )
                        ) {
                          deleteWallet.mutate(w.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {selectedId && (
        <>
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Purchased tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenTable tokens={tokens} />
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>Copycat alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No alerts yet. Alerts fire when a new token mimics one you already hold.
                  </p>
                ) : (
                  alerts.map((a) => <AlertRow key={a.id} alert={a} />)
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

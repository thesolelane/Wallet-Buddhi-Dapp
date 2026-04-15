import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AddWalletForm() {
  const [pubkey, setPubkey] = useState("");
  const [label, setLabel] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wallets", {
        pubkey: pubkey.trim(),
        label: label.trim() || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      setPubkey("");
      setLabel("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({ title: "Wallet added", description: "Initial scan has started." });
    },
    onError: (err: any) => {
      toast({
        title: "Could not add wallet",
        description: String(err?.message ?? err),
        variant: "destructive",
      });
    },
  });

  return (
    <form
      className="flex flex-col sm:flex-row gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (pubkey.trim().length < 32) {
          toast({ title: "Enter a valid Solana public key", variant: "destructive" });
          return;
        }
        mutation.mutate();
      }}
    >
      <Input
        placeholder="Solana public key"
        value={pubkey}
        onChange={(e) => setPubkey(e.target.value)}
        className="font-mono text-sm"
      />
      <Input
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="sm:w-48"
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding…" : "Watch wallet"}
      </Button>
    </form>
  );
}

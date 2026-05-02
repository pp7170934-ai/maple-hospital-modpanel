import React, { useState } from "react";
import { useLocation } from "wouter";
import { useStartVerify, useVerifyBio } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Copy, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [robloxUsername, setRobloxUsername] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [verifyCode, setVerifyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const startVerify = useStartVerify();
  const verifyBio = useVerifyBio();
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleGetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!robloxUsername) return;

    startVerify.mutate(
      { data: { robloxUsername } },
      {
        onSuccess: (data) => {
          setErrorMsg("");
          setVerifyCode(data.code);
          setStep(2);
        },
        onError: (err: any) => {
          const msg = err.message || "Failed to reach server. Make sure the backend is running.";
          setErrorMsg(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const handleVerify = () => {
    verifyBio.mutate(
      { data: { robloxUsername } },
      {
        onSuccess: (data) => {
          setErrorMsg("");
          setToken(data.token);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          const msg = err.message || "Could not verify bio. Make sure the code is in your Roblox bio.";
          setErrorMsg(msg);
          toast({ title: "Verification Failed", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const copyCode = () => {
    navigator.clipboard.writeText(verifyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <Card className="w-full max-w-md relative z-10 border-border shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Mod Panel</CardTitle>
          <CardDescription className="text-base">
            Maple Hospital Authority
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleGetCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Roblox Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your Roblox username"
                  value={robloxUsername}
                  onChange={(e) => { setRobloxUsername(e.target.value); setErrorMsg(""); }}
                  disabled={startVerify.isPending}
                  className="bg-muted/50 border-muted"
                />
              </div>
              {errorMsg && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">{errorMsg}</p>
              )}
              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={!robloxUsername || startVerify.isPending}
              >
                {startVerify.isPending ? "Generating..." : "Get Verification Code"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Add this code to your Roblox profile bio:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded font-mono text-center text-lg tracking-wider border border-border">
                    {verifyCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">{errorMsg}</p>
              )}
              <div className="space-y-3">
                <Button
                  onClick={handleVerify}
                  className="w-full font-semibold"
                  disabled={verifyBio.isPending}
                >
                  {verifyBio.isPending ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep(1)}
                  disabled={verifyBio.isPending}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

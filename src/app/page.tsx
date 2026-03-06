import { Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-slate-100">
              Stop Loss Scholar
            </h1>
          </div>
          <p className="text-slate-400">
            Learn Exactly Where to Draw the Line
          </p>
        </header>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 animate-fade-in">
          <p>App components coming soon...</p>
        </div>
      </div>
    </main>
  );
}

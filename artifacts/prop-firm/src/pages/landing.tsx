import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-10">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-black mb-6">POP FIRM</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Objetivo de lucro 10%, perda diária máxima 10%, perda total máxima 10% e mínimo de 2 dias.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/challenges">
            <Button className="h-12 px-8 text-base">Ver Challenges</Button>
          </Link>
          <Link href="/terminal">
            <Button variant="outline" className="h-12 px-8 text-base">Abrir Terminal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

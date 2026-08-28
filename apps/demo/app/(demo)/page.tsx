import { ArrowRight, Stethoscope, Sun } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IconTile,
  Typography,
} from "@remi/ui/server";

const surfaces = [
  {
    href: "/practitioner",
    icon: Stethoscope,
    intent: "primary" as const,
    title: "Côté praticien",
    body: "Voir ce qui se passe entre deux consultations, structurer ses recommandations, et fixer le cadre dans lequel REMI travaille.",
    cta: "Ouvrir la console praticien",
  },
  {
    href: "/patient",
    icon: Sun,
    intent: "success" as const,
    title: "Côté personne accompagnée",
    body: "Recevoir le plan de son praticien traduit en repas, en courses et en un petit pas à la fois.",
    cta: "Ouvrir l'espace personnel",
  },
];

const Page = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-8">
    <div className="flex flex-col gap-3">
      <Typography variant="eyebrow" tone="muted">
        Maquettes
      </Typography>
      <Typography as="h1" variant="display" size="4xl" balance>
        Deux côtés, une seule boucle
      </Typography>
      <Typography size="lg" tone="muted" balance>
        Le praticien recommande, REMI traduit, la progression remonte. Ces
        écrans montrent les deux moitiés de cette boucle.
      </Typography>
    </div>

    <div className="grid gap-6 sm:grid-cols-2">
      {surfaces.map((surface) => {
        const Icon = surface.icon;

        return (
          <Card
            key={surface.href}
            elevation="flat"
            className="border-border h-full gap-4"
          >
            <CardHeader className="gap-4">
              <IconTile intent={surface.intent}>
                <Icon />
              </IconTile>
              <CardTitle>{surface.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
              <Typography tone="muted">{surface.body}</Typography>
              <div className="mt-auto">
                <Button asChild variant="outline">
                  <NextLink href={surface.href}>
                    {surface.cta}
                    <ArrowRight aria-hidden="true" />
                  </NextLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    <Alert variant="warning">
      <AlertTitle>Maquette, pas produit</AlertTitle>
      <AlertDescription>
        Toutes les données de ces écrans sont fictives. Rien n'est connecté à
        une base, à un compte ou à un praticien réel.
      </AlertDescription>
    </Alert>
  </div>
);

export default Page;

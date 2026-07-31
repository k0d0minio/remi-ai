import { Badge, Card, CardContent, CardHeader, CardTitle, Typography } from "@remi/ui";

const Home = () => (
  <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-8">
    <div className="flex items-center gap-3">
      <Typography as="h1" size="2xl" weight="semibold">
        Remi AI
      </Typography>
      <Badge variant="success">demo</Badge>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Prototype sandbox</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Typography size="sm" muted>
          The Design stage builds here. Mock data only — no services, no auth, nothing that can reach a real customer record.
        </Typography>
        <Typography size="sm" muted>
          Merges straight to the live demo URL so a stakeholder reviews the real deployed thing, never a screenshot.
        </Typography>
      </CardContent>
    </Card>
  </main>
);

export default Home;

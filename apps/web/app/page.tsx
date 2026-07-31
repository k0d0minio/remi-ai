import { Badge, Card, CardContent, CardHeader, CardTitle, Typography } from "@remi/ui";

const Home = () => (
  <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-8">
    <div className="flex items-center gap-3">
      <Typography as="h1" size="2xl" weight="semibold">
        Remi AI
      </Typography>
      <Badge variant="info">web</Badge>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>The product app</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Typography size="sm" muted>
          Signed-in product surface. Primitives come from <code>@remi/ui</code>; anything that
          touches storage, email or a model goes through <code>@remi/services/server</code>.
        </Typography>
        <Typography size="sm" muted>
          Work reaches this app through the pipeline — start with{" "}
          <code>/pipeline scope &quot;&lt;topic&gt;&quot;</code>.
        </Typography>
      </CardContent>
    </Card>
  </main>
);

export default Home;

import { Badge, Card, CardContent, CardHeader, CardTitle, Typography } from "@remi/ui";

const Home = () => (
  <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-8">
    <div className="flex items-center gap-3">
      <Typography as="h1" size="2xl" weight="semibold">
        Remi AI
      </Typography>
      <Badge variant="neutral">marketing</Badge>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>The public site</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Typography size="sm" muted>
          Unauthenticated, content-led, indexable. Fast by default: server components, no client bundle unless a page truly needs one.
        </Typography>
        <Typography size="sm" muted>
          It shares the design system so the site and the product never drift apart.
        </Typography>
      </CardContent>
    </Card>
  </main>
);

export default Home;

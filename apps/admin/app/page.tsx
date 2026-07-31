import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui";

const Home = () => (
  <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 p-8">
    <div className="flex items-center gap-3">
      <Typography as="h1" size="2xl" weight="semibold">
        Remi AI
      </Typography>
      <Badge variant="warning">admin</Badge>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Internal operations</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Typography size="sm" muted>
          Operator-only surface: configuration, support tooling, and anything a
          customer must never reach.
        </Typography>
        <Typography size="sm" muted>
          Every route here is behind the admin boundary — see
          apps/admin/AGENTS.md before adding one.
        </Typography>
      </CardContent>
    </Card>
  </main>
);

export default Home;

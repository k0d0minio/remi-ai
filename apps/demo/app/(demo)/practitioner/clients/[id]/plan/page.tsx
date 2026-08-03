import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { Link, Typography } from "@remi/ui/server";
import { PlanComposer } from "@/components/plan-composer";
import { clients } from "@/lib/mock/clients";

type Params = { id: string };

export const generateStaticParams = (): Params[] =>
  clients.map((client) => ({ id: client.id }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { id } = await params;
  const client = clients.find((candidate) => candidate.id === id);
  return { title: `Plan · ${client?.name ?? "Personne accompagnée"}` };
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const client = clients.find((candidate) => candidate.id === id);
  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          as={NextLink}
          href={`/practitioner/clients/${client.id}`}
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {client.name}
        </Link>

        <div className="flex flex-col gap-2">
          <Typography as="h1" size="2xl" weight="semibold">
            Des notes au plan
          </Typography>
          <Typography tone="muted">
            Consultation du 22 juillet 2026 · {client.name}
          </Typography>
        </div>
      </div>

      <PlanComposer clientName={client.name} />
    </div>
  );
};

export default Page;

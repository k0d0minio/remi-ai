import Image from "next/image";
import { Container, Section, Typography } from "@remi/ui/server";
import { TEAM, TEAM_INTRO } from "@/lib/content/landing";

/** « L'équipe derrière REMI ». Three portraits, from `public/team/`. */
export const TeamSection = () => (
  <Section id="equipe" spacing="md">
    <Container className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <Typography as="h2" size="3xl" weight="bold" balance>
          {TEAM_INTRO.title}
        </Typography>
        <Typography variant="lead">{TEAM_INTRO.text}</Typography>
      </div>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
        {TEAM.map((member) => (
          <li
            key={member.id}
            className="border-border bg-card grid grid-cols-[72px_1fr] items-center gap-4 rounded-2xl border p-4 shadow-sm md:grid-cols-1 md:justify-items-center md:p-6 md:text-center"
          >
            <Image
              src={member.photo}
              alt={TEAM_INTRO.portraitLabel(member.name)}
              width={128}
              height={128}
              className="size-[72px] rounded-full object-cover md:size-32"
            />
            <div>
              <Typography as="h3" weight="semibold">
                {member.name}
              </Typography>
              <Typography size="xs" weight="semibold" className="text-success-text mt-0.5">
                {member.role}
              </Typography>
              <Typography size="sm" tone="muted" className="mt-1.5">
                {member.bio}
              </Typography>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  </Section>
);

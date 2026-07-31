"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@remi/ui";
import { Card, Container, Section, Typography } from "@remi/ui/server";
import { steps } from "@/lib/content/landing";

/**
 * A client component because the tabs hold selection state — but only this
 * section is, and everything inside it is still made of server-safe primitives.
 */
export const HowItWorksSection = () => (
  <Section id="how-it-works" tone="muted" spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          How it works
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          Three steps, and the third is the point
        </Typography>
      </div>

      <Tabs defaultValue={steps[0].id}>
        <TabsList>
          {steps.map((step) => (
            <TabsTrigger key={step.id} value={step.id}>
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {steps.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <Card elevation="flat" className="gap-4 p-8">
              <Typography as="h3" size="2xl" weight="semibold" balance>
                {step.title}
              </Typography>
              <Typography tone="muted" size="lg" className="max-w-2xl">
                {step.body}
              </Typography>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </Container>
  </Section>
);

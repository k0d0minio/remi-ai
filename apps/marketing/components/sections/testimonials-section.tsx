import { Avatar, AvatarFallback } from "@remi/ui";
import { Stagger, StaggerItem } from "@remi/ui/motion";
import {
  Container,
  Section,
  TestimonialCard,
  Typography,
} from "@remi/ui/server";
import { testimonials } from "@/lib/content/landing";

/**
 * PLACEHOLDER CONTENT. The quotes and attributions in lib/content/landing.ts are
 * stand-ins so the layout can be reviewed. Replace them with real, consented
 * testimonials before launch, or delete this section — invented ones on a
 * product that gives nutritional advice are worse than no section at all.
 */
export const TestimonialsSection = () => (
  <Section spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          Placeholder testimonials
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          What people say
        </Typography>
      </div>

      <Stagger className="grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <StaggerItem key={item.id} className="h-full">
            <TestimonialCard
              quote={item.quote}
              author={item.author}
              role={item.role}
              rating={item.rating}
              avatar={
                <Avatar>
                  <AvatarFallback>{item.initials}</AvatarFallback>
                </Avatar>
              }
            />
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  </Section>
);

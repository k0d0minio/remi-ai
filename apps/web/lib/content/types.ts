/**
 * The shape every locale dictionary fills in full. One type, two files —
 * TypeScript is what guarantees the French app never silently misses a label
 * the English one has.
 *
 * This covers the shell's chrome only: navigation, the user menu, empty and
 * placeholder states. Feature copy belongs with the feature.
 */

export type NavItem = {
  /** Path without the locale prefix — the shell adds it. */
  href: string;
  /** Matches a key in the `icons` map in `components/shell/nav-icons.ts`. */
  icon: string;
  label: string;
};

export type PlaceholderContent = {
  title: string;
  body: string;
};

export type Content = {
  shell: {
    /** Announced to screen readers on the sidebar and the mobile panel. */
    navLabel: string;
    openNav: string;
    closeNav: string;
    skipToContent: string;
  };
  roles: {
    practitioner: string;
    person: string;
    /** The dev-only affordance that flips between the two surfaces. */
    switchTo: string;
  };
  userMenu: {
    label: string;
    account: string;
    language: string;
    signOut: string;
  };
  practitionerNav: NavItem[];
  personNav: NavItem[];
  clients: {
    title: string;
    lead: string;
    columns: {
      name: string;
      status: string;
      readiness: string;
      nextConsultation: string;
      lastActive: string;
    };
    status: {
      invited: string;
      active: string;
      paused: string;
      ended: string;
    };
    readiness: {
      exploring: string;
      committed: string;
      struggling: string;
    };
    never: string;
    empty: PlaceholderContent;
  };
  today: {
    title: string;
    lead: string;
    currentStep: string;
    stepProgress: string;
    noPlan: PlaceholderContent;
  };
  placeholders: {
    /** Keyed by route segment, so a new placeholder route is one dictionary entry. */
    practice: PlaceholderContent;
    frame: PlaceholderContent;
    meals: PlaceholderContent;
    steps: PlaceholderContent;
    plan: PlaceholderContent;
  };
  prototypeNote: {
    title: string;
    body: string;
  };
};

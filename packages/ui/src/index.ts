/**
 * @remi/ui — the CLIENT surface.
 *
 * Everything exported here is a client component: tsup stamps a "use client"
 * banner on this entry (tsup.config.ts), so a server component that imports from
 * it turns that subtree into a client boundary.
 *
 * A primitive belongs here only if it needs a hook, an event handler, or a
 * browser API. Everything presentational lives in "@remi/ui/server", which is
 * built without the banner and renders on the server — check there first.
 *
 * A barrel export is a public-API commitment: export a symbol only once an app
 * imports it, and delete the line when its last consumer goes (CONVENTIONS.md →
 * "Keeping the codebase lean").
 *
 * `cn()` is deliberately NOT re-exported here — it lives on the server-safe
 * "@remi/ui/utils" subpath.
 */

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/accordion";
export { Avatar, AvatarFallback, AvatarImage } from "./components/avatar";
export { Button } from "./components/button";
export { Checkbox } from "./components/checkbox";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/dropdown-menu";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/select";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/sheet";
export { Switch } from "./components/switch";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";
export { ThemeToggle } from "./components/theme-toggle";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/tooltip";

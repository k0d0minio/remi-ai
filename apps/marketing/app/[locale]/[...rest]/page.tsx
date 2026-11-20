import { notFound } from "next/navigation";

/**
 * An address that no route matches. Without this page the framework answers
 * with its own 404 page, which is in English. With it, the French
 * `not-found.tsx` of this folder's parent answers.
 */
const UnknownAddress = () => {
  notFound();
};

export default UnknownAddress;

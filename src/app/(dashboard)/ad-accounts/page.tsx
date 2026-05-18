import { redirect } from "next/navigation";

export default function AdAccountsRoute() {
  redirect("/settings?section=integrations");
}

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { InputForm } from "./form";

export default async function UserFormPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const session = await auth();
  const slug = (await params).slug;

  if (!session) {
    return redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <div className="container mx-auto py-10">
        <InputForm id={slug === "new" ? undefined : slug} />
      </div>
    </HydrateClient>
  );
}

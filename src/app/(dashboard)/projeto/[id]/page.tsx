// src/app/(dashboard)/projeto/[id]/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getProjeto } from "@/app/actions/projeto";
import ProjetoContent from "./ProjetoContent";

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjeto(id);

  if ("error" in data) {
    redirect("/hub");
  }

  return <ProjetoContent projeto={data.projeto} />;
}
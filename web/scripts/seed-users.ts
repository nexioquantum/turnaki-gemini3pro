#!/usr/bin/env node

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

type SeedUser = {
  email: string;
  password: string;
  fullName: string;
  role: "ADMIN" | "ODONTOLOGO" | "ASISTENTE";
};

const USERS: SeedUser[] = [
  {
    email: "junior.cbss@gmail.com",
    password: process.env.ADMIN_PASSWORD ?? "Admin123!",
    fullName: "Calixto Saldarriaga",
    role: "ADMIN",
  },
  {
    email: "kelvin.delgado@kmdt.com",
    password: process.env.ODONTOLOGO1_PASSWORD ?? "Kelvin123!",
    fullName: "Kelvin Delgado",
    role: "ODONTOLOGO",
  },
  {
    email: "josue.xx@kmdt.com",
    password: process.env.ODONTOLOGO2_PASSWORD ?? "Josue123!",
    fullName: "Josue XX",
    role: "ODONTOLOGO",
  },
  {
    email: "asistente1@kmdt.com",
    password: process.env.ASISTENTE_PASSWORD ?? "Asistente123!",
    fullName: "Asistente 1",
    role: "ASISTENTE",
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function findAuthUserByEmail(email: string) {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (u) => normalizeEmail(u.email ?? "") === normalizeEmail(email)
    );

    if (user) {
      return user;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function seedUser(user: SeedUser) {
  let existingUser = null;
  try {
    existingUser = await findAuthUserByEmail(user.email);
  } catch (err) {
    console.error(`Error consultando usuario ${user.email}:`, (err as Error).message);
    return;
  }

  if (existingUser) {
    console.log(`Usuario ${user.email} ya existe. Actualizando profile…`);
    await upsertProfile(existingUser.id, user);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    console.error(`Error creando usuario ${user.email}:`, error?.message);
    return;
  }

  console.log(`Usuario ${user.email} creado.`);
  await upsertProfile(data.user.id, user);
}

async function upsertProfile(userId: string, user: SeedUser) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: user.fullName,
      role: user.role,
      active: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error(
      `Error creando/actualizando profile de ${user.email}:`,
      error.message
    );
  } else {
    console.log(`Profile de ${user.email} listo (${user.role}).`);
  }
}

async function main() {
  for (const user of USERS) {
    await seedUser(user);
  }
  console.log("Seed finalizado.");
}

main().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});



import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HAS_CREDS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

test.describe("Administración de pacientes", () => {
  test.skip(!HAS_CREDS, "Configura E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD");

  test("permite registrar un paciente desde el panel admin", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Correo electrónico").fill(ADMIN_EMAIL!);
    await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await page.waitForURL("**/");
    await page.goto("/admin/pacientes");

    await expect(
      page.getByRole("heading", { name: "Gestión de pacientes" })
    ).toBeVisible();

    const timestamp = Date.now();
    await page.getByLabel("Nombres *").fill(`Paciente ${timestamp}`);
    await page.getByLabel("Apellidos *").fill("E2E");
    await page.getByLabel("Cédula (CI)").fill(`E2E-${timestamp}`);
    await page.getByLabel("Teléfono *").fill(`099${timestamp % 1_000_0000}`);
    await page
      .getByLabel("Correo electrónico")
      .fill(`paciente+${timestamp}@test.com`);

    await page.getByRole("button", { name: "Guardar paciente" }).click();

    await expect(
      page.getByText("Paciente registrado correctamente.")
    ).toBeVisible();
  });
});


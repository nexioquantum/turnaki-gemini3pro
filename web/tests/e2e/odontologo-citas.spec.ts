import { expect, test } from "@playwright/test";

const ODONTOLOGO_EMAIL = process.env.E2E_ODONTOLOGO_EMAIL;
const ODONTOLOGO_PASSWORD = process.env.E2E_ODONTOLOGO_PASSWORD;
const HAS_ODONTOLOGO_CREDS =
  Boolean(ODONTOLOGO_EMAIL) && Boolean(ODONTOLOGO_PASSWORD);

test.describe("Citas para odontólogo", () => {
  test.skip(
    !HAS_ODONTOLOGO_CREDS,
    "Configura E2E_ODONTOLOGO_EMAIL y E2E_ODONTOLOGO_PASSWORD"
  );

  test("permite confirmar una cita directamente", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Correo electrónico").fill(ODONTOLOGO_EMAIL!);
    await page.getByLabel("Contraseña").fill(ODONTOLOGO_PASSWORD!);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await page.waitForURL("**/");
    await page.goto("/odontologo/citas/nueva");

    await expect(
      page.getByRole("heading", { name: "Crear cita confirmada" })
    ).toBeVisible();

    const patientSelect = page.locator('select[name="patient_id"]');
    await expect(patientSelect).toBeVisible();
    const patientOptions = await patientSelect.locator("option").all();
    expect(patientOptions.length, "Se requiere al menos un paciente").toBeGreaterThan(1);
    await patientSelect.selectOption({ index: 1 });

    const sillonSelect = page.locator('select[name="sillon_id"]');
    await expect(sillonSelect).toBeVisible();
    const sillonOptions = await sillonSelect.locator("option").all();
    expect(sillonOptions.length, "Se requiere al menos un sillón").toBeGreaterThan(0);
    const firstSillonValue = await sillonOptions[0].getAttribute("value");
    expect(firstSillonValue).toBeTruthy();
    await sillonSelect.selectOption(firstSillonValue!);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const dateString = targetDate.toISOString().split("T")[0];
    await page.locator('input[name="date"]').fill(dateString);

    await page.locator('input[name="start_time"]').fill("11:00");

    const notes = `Cita e2e ${Date.now()}`;
    await page.locator('textarea[name="motivo_detalle"]').fill(notes);

    await page.getByRole("button", { name: "Confirmar cita" }).click();

    await expect(
      page.getByText("Cita confirmada", { exact: false })
    ).toBeVisible();
  });
});


import { expect, test } from "@playwright/test";

const ODONTOLOGO_EMAIL = process.env.E2E_ODONTOLOGO_EMAIL;
const ODONTOLOGO_PASSWORD = process.env.E2E_ODONTOLOGO_PASSWORD;
const HAS_ODONTOLOGO_CREDS =
  Boolean(ODONTOLOGO_EMAIL) && Boolean(ODONTOLOGO_PASSWORD);

test.describe.configure({ mode: "serial" });

test.describe("Citas para odontólogo", () => {
  test.skip(
    !HAS_ODONTOLOGO_CREDS,
    "Configura E2E_ODONTOLOGO_EMAIL y E2E_ODONTOLOGO_PASSWORD"
  );

  test("crea cita y valida solapamientos", async ({ page }) => {
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
    expect(
      patientOptions.length,
      "Se requiere al menos un paciente"
    ).toBeGreaterThan(1);
    await patientSelect.selectOption({ index: 1 });

    const sillonSelect = page.locator('select[name="sillon_id"]');
    await expect(sillonSelect).toBeVisible();
    const sillonOptions = await sillonSelect.locator("option").all();
    expect(
      sillonOptions.length,
      "Se requiere al menos un sillón"
    ).toBeGreaterThan(0);
    const firstSillonValue = await sillonOptions[0].getAttribute("value");
    expect(firstSillonValue).toBeTruthy();
    await sillonSelect.selectOption(firstSillonValue!);

    const targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    targetDate.setHours(0, 0, 0, 0);
    const dateString = targetDate.toISOString().split("T")[0];

    const formatTime = (hour: number, minute: number) =>
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    const minuteOptions = [0, 15, 30, 45];
    const seed = Date.now();
    const baseHour = 8 + (Math.floor(seed / 60000) % 6); // 8..13
    const baseMinute = minuteOptions[seed % minuteOptions.length];
    const slotA = formatTime(baseHour, baseMinute);
    const slotB = formatTime(baseHour + 2, baseMinute);

    const fillSlot = async (time: string) => {
      await page.locator('input[name="date"]').fill(dateString);
      await page.locator('input[name="start_time"]').fill(time);
      const notes = `Cita e2e ${dateString} ${time}`;
      await page.locator('textarea[name="motivo_detalle"]').fill(notes);
    };

    const assertSuccess = async () => {
      await expect(
        page.getByText("Cita confirmada para", { exact: false })
      ).toBeVisible();
    };

    // Primer registro exitoso
    await fillSlot(slotA);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await assertSuccess();

    // Intento duplicado en la misma franja -> debe devolver error de solapamiento
    await fillSlot(slotA);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await expect(
      page.getByText("Ya tienes una cita asignada en ese horario.")
    ).toBeVisible();

    // Cambio de horario para confirmar que otro slot se registra correctamente
    await fillSlot(slotB);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await assertSuccess();
  });
});


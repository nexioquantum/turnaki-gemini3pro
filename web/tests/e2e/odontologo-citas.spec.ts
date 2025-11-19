import { expect, test } from "@playwright/test";

const ODONTOLOGO_EMAIL = process.env.E2E_ODONTOLOGO_EMAIL;
const ODONTOLOGO_PASSWORD = process.env.E2E_ODONTOLOGO_PASSWORD;
const HAS_ODONTOLOGO_CREDS =
  Boolean(ODONTOLOGO_EMAIL) && Boolean(ODONTOLOGO_PASSWORD);

const timeZone = "America/Guayaquil";

const formatLocalTime = (date: string, time: string) => {
  const normalized = time.length === 5 ? `${time}:00` : time;
  const dateTime = new Date(`${date}T${normalized}-05:00`);
  return new Intl.DateTimeFormat("es-EC", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(dateTime);
};

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

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const dateString = targetDate.toISOString().split("T")[0];

    const fillSlot = async (time: string) => {
      await page.locator('input[name="date"]').fill(dateString);
      await page.locator('input[name="start_time"]').fill(time);
      const notes = `Cita e2e ${Date.now()} - ${time}`;
      await page.locator('textarea[name="motivo_detalle"]').fill(notes);
    };

    const assertSuccess = async (time: string) => {
      const formattedTime = formatLocalTime(dateString, time);
      await expect(
        page.getByText("Cita confirmada para", { exact: false })
      ).toContainText(formattedTime);
    };

    const slotA = "10:30";
    const slotB = "12:00";

    // Primer registro exitoso
    await fillSlot(slotA);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await assertSuccess(slotA);

    // Intento duplicado en la misma franja -> debe devolver error de solapamiento
    await fillSlot(slotA);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await expect(
      page.getByText("Ya tienes una cita asignada en ese horario.")
    ).toBeVisible();

    // Cambio de horario para confirmar que otro slot se registra correctamente
    await fillSlot(slotB);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await assertSuccess(slotB);
  });
});


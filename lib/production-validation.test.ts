import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateProductionInput,
} from "./production-validation";

describe(
  "production validation",
  () => {

    const validInput = {
      productionDate:
        "2026-09-19",

      lineCode:
        "LINE-01",

      productName:
        "Industrial Part A",

      plannedUnits:
        1000,

      producedUnits:
        800,

      rejectedUnits:
        10,

      status:
        "running",
    };

    it(
      "accepts valid production input",
      () => {
        const result =
          validateProductionInput(
            validInput
          );

        expect(
          result.ok
        ).toBe(true);
      }
    );

    it(
      "rejects zero planned units",
      () => {
        const result =
          validateProductionInput({
            ...validInput,

            plannedUnits: 0,
          });

        expect(
          result.ok
        ).toBe(false);
      }
    );

    it(
      "rejects negative produced units",
      () => {
        const result =
          validateProductionInput({
            ...validInput,

            producedUnits: -1,
          });

        expect(
          result.ok
        ).toBe(false);
      }
    );

    it(
      "rejects rejected units above produced units",
      () => {
        const result =
          validateProductionInput({
            ...validInput,

            producedUnits: 20,

            rejectedUnits: 21,
          });

        expect(
          result.ok
        ).toBe(false);
      }
    );

    it(
      "rejects invalid status",
      () => {
        const result =
          validateProductionInput({
            ...validInput,

            status:
              "deleted",
          });

        expect(
          result.ok
        ).toBe(false);
      }
    );

    it(
      "rejects invalid date format",
      () => {
        const result =
          validateProductionInput({
            ...validInput,

            productionDate:
              "19/09/2026",
          });

        expect(
          result.ok
        ).toBe(false);
      }
    );

    it(
      "trims line and product names",
      () => {
        const result =
          validateProductionInput({
            ...validInput,

            lineCode:
              "  LINE-01 ",

            productName:
              " Part A ",
          });

        expect(
          result
        ).toMatchObject({
          ok: true,

          value: {
            lineCode:
              "LINE-01",

            productName:
              "Part A",
          },
        });
      }
    );
  }
);
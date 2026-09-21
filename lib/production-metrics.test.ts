import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateProductionMetrics,
} from "./production-metrics";

describe(
  "production dashboard metrics",
  () => {
    it(
      "calculates output, efficiency, active lines and reject rate",
      () => {
        const result =
          calculateProductionMetrics(
            "2026-09-19",
            [
              {
                lineCode: "LINE-01",
                plannedUnits: 5000,
                producedUnits: 4820,
                rejectedUnits: 35,
                status: "completed",
              },
              {
                lineCode: "LINE-02",
                plannedUnits: 4500,
                producedUnits: 4310,
                rejectedUnits: 28,
                status: "running",
              },
              {
                lineCode: "LINE-03",
                plannedUnits: 4000,
                producedUnits: 3350,
                rejectedUnits: 19,
                status: "running",
              },
            ]
          );

        expect(result).toEqual({
          productionDate:
            "2026-09-19",

          producedUnits:
            12480,

          plannedUnits:
            13500,

          efficiency:
            92.4,

          activeLines:
            2,

          totalLines:
            3,

          rejectedUnits:
            82,

          rejectRate:
            0.66,
        });
      }
    );

    it(
      "counts duplicate line codes only once",
      () => {
        const result =
          calculateProductionMetrics(
            "2026-09-19",
            [
              {
                lineCode: "LINE-01",
                plannedUnits: 100,
                producedUnits: 50,
                rejectedUnits: 1,
                status: "running",
              },
              {
                lineCode: "LINE-01",
                plannedUnits: 100,
                producedUnits: 50,
                rejectedUnits: 0,
                status: "running",
              },
            ]
          );

        expect(
          result.totalLines
        ).toBe(1);

        expect(
          result.activeLines
        ).toBe(1);
      }
    );

    it(
      "returns zero metrics when there is no production data",
      () => {
        expect(
          calculateProductionMetrics(
            null,
            []
          )
        ).toEqual({
          productionDate:
            null,

          producedUnits:
            0,

          plannedUnits:
            0,

          efficiency:
            0,

          activeLines:
            0,

          totalLines:
            0,

          rejectedUnits:
            0,

          rejectRate:
            0,
        });
      }
    );

    it(
      "avoids division by zero when produced units are zero",
      () => {
        const result =
          calculateProductionMetrics(
            "2026-09-21",
            [
              {
                lineCode: "LINE-05",
                plannedUnits: 2500,
                producedUnits: 0,
                rejectedUnits: 0,
                status: "planned",
              },
            ]
          );

        expect(
          result.rejectRate
        ).toBe(0);
      }
    );
  }
);
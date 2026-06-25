import { describe, expect, it } from "vitest";
import {
  computeWage,
  DEFAULT_INPUTS,
  resolveAnnualSalary,
  WageInputs,
} from "./wage";

function inputs(overrides: Partial<WageInputs> = {}): WageInputs {
  return { ...DEFAULT_INPUTS, ...overrides };
}

describe("computeWage", () => {
  it("matches a fully worked example", () => {
    // $60k salary, 40 official hrs, 45 actual, 30min one-way commute,
    // 30min/day prep, $500/mo of job costs.
    const result = computeWage(
      inputs({
        annualSalary: 60000,
        officialHoursPerWeek: 40,
        actualHoursPerWeek: 45,
        oneWayCommuteMin: 30,
        dailyPrepMin: 30,
        commuteCost: 200,
        lunches: 150,
        clothes: 50,
        childcare: 0,
        decompSpending: 100,
      }),
    );

    // nominal = 60000 / (40 * 52) = 60000 / 2080
    expect(result.nominalHourly).toBeCloseTo(28.84615, 4);

    // weekly commute = (30 * 2 * 5) / 60 = 5
    expect(result.weeklyCommuteHours).toBeCloseTo(5, 6);
    // weekly prep = (30 * 5) / 60 = 2.5
    expect(result.weeklyPrepHours).toBeCloseTo(2.5, 6);
    // real hours/week = 45 + 5 + 2.5 = 52.5
    expect(result.realHoursPerWeek).toBeCloseTo(52.5, 6);

    // annual job costs = 500 * 12 = 6000
    expect(result.annualJobCosts).toBe(6000);
    // real annual value = 60000 - 6000 = 54000
    expect(result.realAnnualValue).toBe(54000);

    // real hourly = 54000 / (52.5 * 52) = 54000 / 2730
    expect(result.realHourly).toBeCloseTo(19.78022, 4);

    // % drop = (28.84615 - 19.78022) / 28.84615 * 100 ≈ 31.43%
    expect(result.percentDrop).toBeCloseTo(31.4286, 3);

    // 312 extra hours/year: (52.5 - 40) * 52 = 12.5 * 52 = 650
    expect(result.extraHoursPerYear).toBeCloseTo(650, 6);
  });

  it("real wage equals nominal when there is no hidden time or cost", () => {
    const result = computeWage(
      inputs({
        annualSalary: 52000,
        officialHoursPerWeek: 40,
        actualHoursPerWeek: 40,
        oneWayCommuteMin: 0,
        dailyPrepMin: 0,
        commuteCost: 0,
        lunches: 0,
        clothes: 0,
        childcare: 0,
        decompSpending: 0,
      }),
    );

    expect(result.nominalHourly).toBe(25);
    expect(result.realHourly).toBe(25);
    expect(result.percentDrop).toBe(0);
    expect(result.extraHoursPerYear).toBe(0);
  });

  it("derives annual salary from hourly mode using official hours", () => {
    const config = inputs({
      salaryMode: "hourly",
      hourlyRate: 30,
      officialHoursPerWeek: 40,
    });

    // 30 * 40 * 52 = 62400
    expect(resolveAnnualSalary(config)).toBe(62400);
    // nominal hourly should round-trip back to the entered rate
    expect(computeWage(config).nominalHourly).toBeCloseTo(30, 6);
  });

  it("does not divide by zero on empty/degenerate input", () => {
    const result = computeWage(
      inputs({
        annualSalary: 0,
        officialHoursPerWeek: 0,
        actualHoursPerWeek: 0,
        oneWayCommuteMin: 0,
        dailyPrepMin: 0,
      }),
    );

    expect(Number.isFinite(result.nominalHourly)).toBe(true);
    expect(Number.isFinite(result.realHourly)).toBe(true);
    expect(result.nominalHourly).toBe(0);
    expect(result.realHourly).toBe(0);
  });

  it("handles costs exceeding salary as a negative real wage", () => {
    const result = computeWage(
      inputs({
        annualSalary: 24000,
        officialHoursPerWeek: 40,
        actualHoursPerWeek: 40,
        oneWayCommuteMin: 0,
        dailyPrepMin: 0,
        childcare: 2500, // $2500/mo = $30k/yr, more than the salary
      }),
    );

    expect(result.realAnnualValue).toBe(24000 - 30000);
    expect(result.realHourly).toBeLessThan(0);
  });
});

// The "Your Real Wage" math.
//
// This is the heart of the app: it takes a job's salary and the hidden time +
// money it really costs, and returns both the wage you *think* you make and the
// wage you *actually* make. Pure functions, no side effects — easy to test.

export const WEEKS_PER_YEAR = 52;

export type SalaryMode = "annual" | "hourly";

export interface WageInputs {
  salaryMode: SalaryMode;
  /** Used when salaryMode === "annual". */
  annualSalary: number;
  /** Used when salaryMode === "hourly". */
  hourlyRate: number;

  officialHoursPerWeek: number;
  /** The honest number: includes unpaid overtime you don't log. */
  actualHoursPerWeek: number;
  oneWayCommuteMin: number;
  /** Getting ready + the dead decompression zone after work, per day. */
  dailyPrepMin: number;

  // Monthly costs the job creates. All optional, default 0.
  commuteCost: number;
  lunches: number;
  clothes: number;
  childcare: number;
  decompSpending: number;
}

export interface WageResult {
  /** Salary in dollars/year, resolved from whichever mode the user chose. */
  annualSalary: number;

  // The illusion.
  nominalHourly: number;

  // The reality.
  realHourly: number;
  realAnnualValue: number;
  annualJobCosts: number;

  // Time breakdown.
  weeklyCommuteHours: number;
  weeklyPrepHours: number;
  realHoursPerWeek: number;
  officialHoursPerYear: number;
  realHoursPerYear: number;
  extraHoursPerWeek: number;
  extraHoursPerYear: number;

  /** How much smaller the real wage is, as a percent of the nominal wage. */
  percentDrop: number;
}

/** Resolve the user's chosen input mode into a single annual salary figure. */
export function resolveAnnualSalary(inputs: WageInputs): number {
  if (inputs.salaryMode === "hourly") {
    return inputs.hourlyRate * inputs.officialHoursPerWeek * WEEKS_PER_YEAR;
  }
  return inputs.annualSalary;
}

export function computeWage(inputs: WageInputs): WageResult {
  const annualSalary = resolveAnnualSalary(inputs);

  // --- THE ILLUSION (what they think they make) ---
  const officialHoursPerYear = inputs.officialHoursPerWeek * WEEKS_PER_YEAR;
  const nominalHourly = safeDivide(annualSalary, officialHoursPerYear);

  // --- THE REALITY ---
  // Real time the job consumes each week.
  const weeklyCommuteHours = (inputs.oneWayCommuteMin * 2 * 5) / 60;
  const weeklyPrepHours = (inputs.dailyPrepMin * 5) / 60;
  const realHoursPerWeek =
    inputs.actualHoursPerWeek + weeklyCommuteHours + weeklyPrepHours;
  const realHoursPerYear = realHoursPerWeek * WEEKS_PER_YEAR;

  // Real money the job costs each year.
  const annualJobCosts =
    (inputs.commuteCost +
      inputs.lunches +
      inputs.clothes +
      inputs.childcare +
      inputs.decompSpending) *
    12;

  const realAnnualValue = annualSalary - annualJobCosts;
  const realHourly = safeDivide(realAnnualValue, realHoursPerYear);

  const percentDrop =
    nominalHourly > 0 ? ((nominalHourly - realHourly) / nominalHourly) * 100 : 0;

  return {
    annualSalary,
    nominalHourly,
    realHourly,
    realAnnualValue,
    annualJobCosts,
    weeklyCommuteHours,
    weeklyPrepHours,
    realHoursPerWeek,
    officialHoursPerYear,
    realHoursPerYear,
    extraHoursPerWeek: realHoursPerWeek - inputs.officialHoursPerWeek,
    extraHoursPerYear: realHoursPerYear - officialHoursPerYear,
    percentDrop,
  };
}

/** Divide, but return 0 instead of Infinity/NaN when the denominator is 0. */
function safeDivide(a: number, b: number): number {
  if (!b || !Number.isFinite(b)) return 0;
  const result = a / b;
  return Number.isFinite(result) ? result : 0;
}

export const DEFAULT_INPUTS: WageInputs = {
  salaryMode: "annual",
  annualSalary: 60000,
  hourlyRate: 30,
  officialHoursPerWeek: 40,
  actualHoursPerWeek: 45,
  oneWayCommuteMin: 30,
  dailyPrepMin: 30,
  commuteCost: 0,
  lunches: 0,
  clothes: 0,
  childcare: 0,
  decompSpending: 0,
};

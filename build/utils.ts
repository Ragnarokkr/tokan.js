const SUCCESS = "color: #29cf20; font-weight: bold";
const WARNING = "color: #f58352";
const ERROR = "color: #fe4040";
const INFO = "color: #b9b9b9";

export const Colors: { [status: string]: string } = {
  Success: SUCCESS,
  Warning: WARNING,
  Error: ERROR,
  Info: INFO,
} as const;

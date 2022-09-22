import { readFileSync } from "fs";
import { template } from "./html";

export default (list: string[]): string =>
  template.replace(
    "<!-- RELPACE THIS INTO FILE LIST -->",
    list
      .map((value: string) => `<li><a href="down/${value}">${value}</a></li>`)
      .join("\n")
  );

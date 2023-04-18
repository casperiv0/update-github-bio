import "dotenv/config";
import axios from "axios";
import format from "date-fns/format/index.js";
import { WakatimeItem } from "./interfaces.js";

const GITHUB_API_URL = "https://api.github.com";
const WAKATIME_API_URL = "https://wakatime.com/api/v1";

const ENDPOINTS = {
  GITHUB: `${GITHUB_API_URL}/user`,
  WAKATIME: `${WAKATIME_API_URL}/users/current/summaries`,
} as const;

async function getWakatimeTotalTime(): Promise<string | undefined> {
  try {
    const res = await axios({
      method: "GET",
      url: ENDPOINTS.WAKATIME,
      params: {
        api_key: process.env["WAKATIME_API_KEY"],
        scope: "read_logged_time",
        range: "today",
      },
    });

    const grandTotal: WakatimeItem["grand_total"] = res.data.data[0].grand_total;

    return grandTotal.text;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown";
    console.error(`Could not get Wakatime stats: ${errorMessage}`);
  }
}

async function updateBio(message: string) {
  try {
    await axios({
      method: "PATCH",
      url: ENDPOINTS.GITHUB,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${process.env["GH_TOKEN"]}`,
      },

      data: {
        bio: message,
      },
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown";
    console.error(`Could not update GitHub bio: ${errorMessage}`);
  }
}

async function init() {
  _checkEnv();

  try {
    const age = calculateAge("07/21/2005");

    const total = await getWakatimeTotalTime();
    if (!total) return;

    const today = format(Date.now(), "yyyy-MM-dd");
    const bioMessage = `${age}y/o programmer and student - Frontend focused web dev. Coded Today (${today}): ${total}`;

    await updateBio(bioMessage);
  } catch (e) {
    console.error(e);
  }
}

function calculateAge(birthDate: string): string {
  return ((Date.now() - new Date(birthDate).getTime()) / (60 * 60 * 24 * 365.25 * 1000))
    .toString()
    .split(".")[0];
}

/* updates bio every 15minutes */
init();
setInterval(init, 60 * 1000 * 15);

function _checkEnv() {
  if (!process.env["GH_TOKEN"]) {
    throw new Error("`GH_TOKEN` is a required `.env` item");
  }

  if (!process.env["WAKATIME_API_KEY"]) {
    throw new Error("`WAKATIME_API_KEY` is a required `.env` item");
  }
}

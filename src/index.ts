import "dotenv/config";
import axios, { AxiosResponse } from "axios";
import format from "date-fns/format";
import { WakatimeItem } from "./interfaces";

const GITHUB_API_URL = "https://api.github.com";
const WAKATIME_API_URL = "https://wakatime.com/api/v1";

const ENDPOINTS = {
  GITHUB: `${GITHUB_API_URL}/user`,
  WAKATIME: `${WAKATIME_API_URL}/users/current/summaries`,
};

async function getWakatimeTotalTime(): Promise<string | undefined> {
  let res: AxiosResponse | null = null;

  try {
    res = await axios({
      method: "GET",
      url: ENDPOINTS.WAKATIME,
      params: {
        api_key: process.env["WAKATIME_API_KEY"],
        scope: "read_logged_time",
        start: new Date(Date.now()),
        end: new Date(Date.now()),
      },
    });
  } catch (e) {
    console.error(e);
  }

  if (res === null) return;

  const grandTotal: WakatimeItem["grand_total"] = res.data.data[0].grand_total;

  return grandTotal.text;
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
    console.error(e);
  }
}

async function init() {
  try {
    const age = calculateAge("07/21/2005");

    const total = await getWakatimeTotalTime();
    const today = format(Date.now(), "yyyy-MM-dd");
    const bioMessage = `${age}y/o programmer and student - Frontend focused web dev. Coded Today (${today}): ${total}`;

    await updateBio(bioMessage);
  } catch (e) {
    console.error(e);
  }
}

function calculateAge(birthDate: string): string {
  return ((Date.now() - +new Date(birthDate)) / (60 * 60 * 24 * 365 * 1000))
    .toString()
    .split(".")[0];
}

/* updates bio every 15minutes */
init();
setInterval(init, 60 * 1000 * 15);

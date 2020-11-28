import "dotenv/config";
import axios from "axios";
import { WakatimeItem } from "./interfaces";

const ghUrl = "https://api.github.com";
const wakatimeUrl = "https://wakatime.com/api/v1";
const endPoints = {
  gh_update: `${ghUrl}/user`,
  get_wakatime: `${wakatimeUrl}/users/current/summaries`,
};

async function getWakatimeTotalTime(): Promise<string> {
  const res = await axios({
    method: "GET",
    url: endPoints.get_wakatime,
    params: {
      api_key: process.env.WAKATIME_API_KEY,
      scope: "read_logged_time",
      start: new Date(Date.now()),
      end: new Date(Date.now()),
    },
  });

  const grandTotal: WakatimeItem["grand_total"] = res.data.data[0].grand_total;

  return grandTotal.text;
}

async function updateBio(message: string) {
  await axios({
    method: "PATCH",
    url: endPoints.gh_update,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${process.env?.GH_TOKEN}`,
    },

    data: {
      bio: message,
    },
  });
}

async function init() {
  try {
    const total = await getWakatimeTotalTime();

    const bioMessage = `15y/o programmer and student - Frontend focused web dev. Coded today: ${total}`;

    await updateBio(bioMessage);

    console.log("UPDATE: Successfully updated bio");
  } catch (e) {
    console.error(e);
  }
}

/* Updates bio every 15minutes */
init()
setInterval(init, 900000);

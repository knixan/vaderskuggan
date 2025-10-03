"use server";

import { WeatherType } from "../type/types";

export async function getWeatherByLocation(
  location: string
): Promise<WeatherType | null> {
  if (!location) return null;
  try {
    const respone = await fetch(
      `https://weather.lexlink.se/forecast/location/${location}`
    );

    const data = await respone.json();
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

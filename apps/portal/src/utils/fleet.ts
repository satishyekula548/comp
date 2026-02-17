'use server';

import axios from 'axios';

export const getFleetInstance = async () => {
  const fleet = axios.create({
    baseURL: `${process.env.FLEET_SERVER_URL}/api/latest/fleet`,
    headers: {
      Authorization: `Bearer ${process.env.FLEET_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return fleet;
};
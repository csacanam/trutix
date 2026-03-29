import dotenv from "dotenv";
dotenv.config();

import Airtable from "airtable";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID!);

export const tradesTable = base("Trades");
export const usersTable = base("Users");

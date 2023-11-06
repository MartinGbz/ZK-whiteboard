import axios from "axios";

export interface Group {
  id: string;
  name: string;
  timestamp: number;
  description: string;
  publicContacts: string[];
  specs: string;
  generatedBy: string;
  valueType: string;
  accountSource: string[];
  tags: string[];
  properties: {
    accountsNumber: number;
    tierDistribution: object;
    minValue: string;
    maxValue: string;
  };
  dataUrl: string;
}

export const fetchGroups = async () => {
  let response;
  try {
    response = await axios.get("https://hub.sismo.io/groups/latests", {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("API request error:", error);
    throw new Error("An error occured while fetching Sismo Data Groups");
  }
  const groups: Group[] = response.data.items;
  return groups;
};

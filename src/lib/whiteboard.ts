import { Whiteboard } from "@/types/whiteboard-types";
import axios from "axios";

export const getWhiteboard = async (id: number) => {
  // wait 5 seconds to test loading modal
  // await new Promise((resolve) => setTimeout(resolve, 100000));
  try {
    const response = await axios.post(
      process.env.WEBSITE_DOMAIN + "/api/whiteboard",
      id,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const whiteboard: Whiteboard = response.data;
    return whiteboard;
  } catch (error: any) {
    console.error("API request error:", error);
    const defaultErrorMessage = "An error occured while fetching whiteboard";
    const errorMessage = error.response.data.error
      ? `${defaultErrorMessage}: ${error.response.data.error}`
      : defaultErrorMessage;
    throw new Error(errorMessage);
  }
};

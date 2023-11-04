import { getWhiteboardById } from "@/app/api/common";

export const getWhiteboard = async (id: number) => {
  // wait 5 seconds to test loading modal
  // await new Promise((resolve) => setTimeout(resolve, 100000));
  try {
    const whiteboard = await getWhiteboardById(id);
    if (!whiteboard) throw new Error("Whiteboard not found");
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

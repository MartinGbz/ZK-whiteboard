import { getWhiteboardById } from "@/app/api/common";

export const getWhiteboard = async (id: number) => {
  try {
    const whiteboard = await getWhiteboardById(id);
    if (!whiteboard) throw new Error("Whiteboard not found");
    return whiteboard;
  } catch (error: any) {
    console.error("API request error:", error);
    const defaultErrorMessage = "An error occured while fetching whiteboard";
    const errorMessage = error?.response?.data?.error
      ? `${defaultErrorMessage}: ${error.response.data.error}`
      : defaultErrorMessage;
    throw new Error(errorMessage);
  }
};

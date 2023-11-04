import {
  WhiteboardIndex,
  whiteboardWithMessageCount,
} from "@/types/whiteboard-types";
import axios from "axios";

export async function getWhiteboards() {
  // wait 5 seconds to test loading modal
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const whiteboards = await fetchWhiteboards();
  if (!whiteboards) return;
  const whiteboardsWithResolvedGroupIds: WhiteboardIndex[] =
    await convertWhiteboardIdsToNames(whiteboards);
  if (!whiteboardsWithResolvedGroupIds) return;

  return whiteboardsWithResolvedGroupIds;
}

const fetchWhiteboards = async () => {
  let response;
  try {
    response = await axios.get(`${process.env.WEBSITE_DOMAIN}/api/whiteboard`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("API request error:", error);
    const defaultErrorMessage = "An error occured while fetching whiteboards";
    const errorMessage = error.response.data.error
      ? `${defaultErrorMessage}: ${error.response.data.error}`
      : defaultErrorMessage;
    throw new Error(errorMessage);
  }
  const whiteboards: whiteboardWithMessageCount[] = await response.data;
  return whiteboards;
};

async function convertWhiteboardIdsToNames(
  whiteboards: whiteboardWithMessageCount[]
) {
  const whiteboardsWithResolvedGroupIds: WhiteboardIndex[] = await Promise.all(
    whiteboards.map(async (whiteboard: whiteboardWithMessageCount) => {
      const resolvedGroupNames = await Promise.all(
        whiteboard.groupIds.map(async (groupId: string) => {
          const groupName = await resolveGroupId(groupId);
          return groupName;
        })
      );
      return {
        id: whiteboard.id,
        name: whiteboard.name,
        description: whiteboard.description,
        appId: whiteboard.appId,
        authorVaultId: whiteboard.authorVaultId,
        curated: whiteboard.curated,
        createdAt: whiteboard.createdAt,
        updatedAt: whiteboard.updatedAt,
        groupNames: resolvedGroupNames,
        messagesCount: whiteboard.messagesCount,
      };
    })
  );
  return whiteboardsWithResolvedGroupIds;
}

const resolveGroupId = async (groupId: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://hub.sismo.io/group-snapshots/" + groupId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
    );
    const groupSnapshots = await response.json();
    return groupSnapshots.items[0].name;
  } catch (error) {
    console.error(error);
    return "";
  }
};

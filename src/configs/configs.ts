import { SismoConnectConfig } from "@sismo-core/sismo-connect-react";

export const sismoConnectConfig: SismoConnectConfig = {
  appId: "0xf4cdb005c588dfce6eae2dd4907390c7",
};

export const ZKWHITEBOARD_VAULTID_VARNAME = "zkWhiteboardVaultId";
export const WHITEBOARD_VAULTID_VARNAME = "vaultId-whiteboard-";
export const CURRENT_APPID_VARNAME = "currentAppId";

export const MAX_Z_INDEX = 1000;
export const TRANSPARENCY = "E6";

export const defaultInputColor = "#dddddd";

export const greenColor = "#5eca7e";
export const greenColorDisabled = "#83a48d";
export const redColor = "#ff5656";
export const purpleColor = "#a888e7";
export const blueColor = "#82a5ff";

export const MIN_WHITEBOARD = 1;
export const MAX_WHITEBOARD_PER_USER = 5;
export const MAX_CHARACTERS = 100;
export const MAX_CHARACTERS_WHITEBOARD_NAME = 50;
export const MAX_CHARACTERS_WHITEBOARD_DESCRIPTION = 300;
export const MAX_WHITEBOARD_GROUPS = 10;

export const MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE = `Your whiteboard name should be ${MIN_WHITEBOARD} to ${MAX_CHARACTERS_WHITEBOARD_NAME} characters long`;
export const MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE = `Your description should be ${MIN_WHITEBOARD} to ${MAX_CHARACTERS_WHITEBOARD_DESCRIPTION} characters long`;
export const MAX_WHITEBOARD_GROUPS_MESSAGE = `Please select between ${MIN_WHITEBOARD} to ${MAX_WHITEBOARD_GROUPS} groups.`;

export const preWrittenPostXSlug = "http://twitter.com/intent/tweet?text=";
export const preWrittenPostLensSlug = "https://lenster.xyz/?text=";
export const preWrittenPostFarcasterSlug =
  "https://warpcast.com/~/compose?text=";

export const creatorXName = "0xMartinGbz";
export const creatorLensName = "martingbz.lens";
export const creatorFarcasterName = "martingbz";

export const LOGO_BASE_64 =
  "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ADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOIgAAACAgwgAAAA4iAAAAICDCAAAADiIAAAAgIMIAAAAOOj/AmVkcc2KxILaAAAAAElFTkSuQmCC";
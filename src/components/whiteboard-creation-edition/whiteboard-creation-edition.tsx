"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WhiteboardOperationType,
  WhiteboardCreateSignedMessage,
  WhiteboardEditSignedMessage,
  User,
} from "@/types/whiteboard-types";
import Header from "../header/header";

import "./whiteboard-creation-edition.css";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { TextareaAutosize } from "@mui/base";
import { Whiteboard } from "@prisma/client";
import {
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION,
  MAX_CHARACTERS_WHITEBOARD_NAME,
  MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE,
  MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE,
  MAX_WHITEBOARD_GROUPS_MESSAGE,
  greenColor,
  purpleColor,
  sismoConnectConfig,
  MAX_WHITEBOARD_GROUPS,
  greenColorDisabled,
  MAX_WHITEBOARD_PER_USER,
  MIN_WHITEBOARD,
} from "@/configs/configs";
import Loading from "../loading-modal/loading-modal";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

const API_BASE_URL = "/api/whiteboard";
const API_ENDPOINTS = {
  CREATE: "/create",
  EDIT: "/edit",
};

interface Group {
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

interface WhiteboardCreationEditionProps {
  isEdition?: boolean;
  whiteboardId?: number;
}

const WhiteboardCreationEdition: React.FC<WhiteboardCreationEditionProps> = ({
  isEdition,
  whiteboardId,
}) => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [whiteboardName, setWhiteboardName] = useState<string>("");
  const [whiteboardNameOk, setWhiteboardNameOk] = useState<boolean>(false);
  const [whiteboardNameChanged, setWhiteboardNameChanged] =
    useState<boolean>(false);
  const [whiteboardDescription, setWhiteboardDescription] =
    useState<string>("");
  const [whiteboardDescriptionOk, setWhiteboardDescriptionOk] =
    useState<boolean>(false);
  const [whiteboardDescriptionChanged, setWhiteboardDescriptionChanged] =
    useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedGroupsOk, setSelectedGroupsOk] = useState<boolean>(false);
  const [selectedGroupsChanged, setSelectedGroupsChanged] =
    useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [initalWhiteboard, setInitalWhiteboard] = useState<Whiteboard>();
  const [isWhiteboardDataLoading, setIsWhiteboardDataLoading] =
    useState<boolean>(true);
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [disableValidation, setDisableValidation] = useState<boolean>(false);
  const [disableValidationEdition, setDisableValidationEdition] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchGroups = async () => {
      setIsWhiteboardDataLoading(true);
      try {
        const response = await fetch("https://hub.sismo.io/groups/latests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseDecoded = await response.json();
        const groups: Group[] = responseDecoded.items;
        setGroups(groups);
      } catch (error) {
        console.error(error);
      }
      if (!isEdition) {
        setIsWhiteboardDataLoading(false);
      }
    };
    fetchGroups();
  }, [isEdition]);

  useEffect(() => {
    const fetchWhiteboard = async (id: number) => {
      try {
        const response = await fetch("/api/whiteboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(id),
          cache: "no-cache",
        });

        const whiteboard: Whiteboard = await response.json();
        setInitalWhiteboard(whiteboard);
        setWhiteboardName(whiteboard?.name || "");
        setWhiteboardDescription(whiteboard?.description || "");
        setSelectedGroups(
          groups.filter((group: Group) =>
            whiteboard?.groupIds?.includes(group.id)
          )
        );
      } catch (error) {
        console.error(error);
      }
      setIsWhiteboardDataLoading(false);
    };
    if (isEdition && whiteboardId) {
      fetchWhiteboard(whiteboardId);
    }
  }, [groups, isEdition, whiteboardId]);

  async function createWhiteboard() {
    const sismoConnectSignedMessage: WhiteboardCreateSignedMessage = {
      type: WhiteboardOperationType.CREATE,
      message: {
        name: whiteboardName,
        description: whiteboardDescription,
        groupIds: selectedGroups.map((group: Group) => group.id),
      },
    };
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      signature: {
        message: JSON.stringify(sismoConnectSignedMessage),
      },
    });
  }

  async function saveWhiteboard() {
    if (!initalWhiteboard) {
      console.error("No initial whiteboard");
      return;
    }
    const sismoConnectSignedMessage: WhiteboardEditSignedMessage = {
      type: WhiteboardOperationType.EDIT,
      message: {
        ...initalWhiteboard,
        description: whiteboardDescription,
      },
    };
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
      signature: {
        message: JSON.stringify(sismoConnectSignedMessage),
      },
    });
  }

  useEffect(() => {
    const responseMessage: SismoConnectResponse | null =
      sismoConnect.getResponse();
    if (responseMessage) {
      const fetchData = async () => {
        if (responseMessage.signedMessage) {
          setSismoConnectResponseMessage(responseMessage);
        }
      };
      fetchData();
    }
  }, []);

  useEffect(() => {
    const constructUrlFromMessage = (message: SismoConnectResponse) => {
      let url = API_BASE_URL;
      const signedMessage = message.signedMessage
        ? (JSON.parse(message.signedMessage) as WhiteboardCreateSignedMessage)
        : null;

      if (signedMessage?.type === WhiteboardOperationType.CREATE) {
        url += API_ENDPOINTS.CREATE;
      } else if (signedMessage?.type === WhiteboardOperationType.EDIT) {
        url += API_ENDPOINTS.EDIT;
      }

      return url;
    };

    async function retryRequest(
      functionToRetry: any,
      url: string,
      message: SismoConnectResponse,
      retryMax: number
    ) {
      for (let i = 0; i < retryMax; i++) {
        console.log("API request attempt:", i);
        try {
          return await functionToRetry(url, message);
        } catch (error: any) {
          if (i === retryMax - 1) {
            console.error("API request error:", error);
            alert("An error occured. Error: " + error.response.data.error);
          }
        }
      }
    }

    const performApiRequest = async (
      url: string,
      message: SismoConnectResponse
    ) => {
      await axios.post(url, message, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsVerifying(false);
      router.push("/");
    };

    const postWhiteboard = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      await retryRequest(performApiRequest, url, message, 2);

      setIsVerifying(false);
      router.push("/");
    };
    if (sismoConnectResponseMessage?.signedMessage) {
      postWhiteboard(sismoConnectResponseMessage);
    }
  }, [router, sismoConnectResponseMessage]);

  useEffect(() => {
    if (whiteboardName) {
      setWhiteboardNameChanged(true);
    }
    if (whiteboardDescription) {
      setWhiteboardDescriptionChanged(true);
    }
    if (selectedGroups.length > 0) {
      setSelectedGroupsChanged(true);
    }

    if (
      whiteboardName.length > MAX_CHARACTERS_WHITEBOARD_NAME ||
      whiteboardName.length < MIN_WHITEBOARD
    ) {
      setWhiteboardNameOk(false);
    } else {
      setWhiteboardNameOk(true);
    }

    if (
      whiteboardDescription.length > MAX_CHARACTERS_WHITEBOARD_DESCRIPTION ||
      whiteboardDescription.length < MIN_WHITEBOARD
    ) {
      setWhiteboardDescriptionOk(false);
    } else {
      setWhiteboardDescriptionOk(true);
    }

    if (
      selectedGroups.length > MAX_WHITEBOARD_GROUPS ||
      selectedGroups.length < MIN_WHITEBOARD
    ) {
      setSelectedGroupsOk(false);
    } else {
      setSelectedGroupsOk(true);
    }
  }, [whiteboardName, whiteboardDescription, selectedGroups]);

  useEffect(() => {
    if (
      whiteboardNameOk &&
      whiteboardDescriptionOk &&
      selectedGroupsOk &&
      user
    ) {
      setDisableValidation(false);
    } else {
      setDisableValidation(true);
    }
    if (whiteboardNameOk && whiteboardDescriptionOk) {
      setDisableValidationEdition(false);
    } else {
      setDisableValidationEdition(true);
    }
  }, [whiteboardNameOk, whiteboardDescriptionOk, selectedGroupsOk, user]);

  return (
    <div className="container">
      <Header
        currentRoute={
          isEdition
            ? "/whiteboard/settings/" + whiteboardId
            : "/create-whiteboard"
        }
        onChangeUser={(user) => setUser(user)}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "10px",
          width: "fit-content",
        }}>
        <div
          style={{
            color: "black",
            fontSize: "20px",
          }}>
          <span>
            {isEdition ? "Edit a whiteboard" : "Create a new whiteboard"}
          </span>
          <span
            style={{
              color: "grey",
              fontSize: "11px",
            }}>
            {isEdition
              ? " (You can only edit the description for now)"
              : " (Currently only " +
                MAX_WHITEBOARD_PER_USER +
                " max per user)"}
          </span>
        </div>
        <p className="form-labels"> Name </p>
        <input
          disabled={isEdition}
          type="text"
          className="whiteboard-creation-inputs"
          style={{
            padding: "10px",
            height: "40x",
            fontSize: "14px",
            cursor: isEdition ? "not-allowed" : "default",
          }}
          onChange={(event) => {
            setWhiteboardName(event.target.value);
          }}
          value={whiteboardName}
        />
        {whiteboardNameChanged && !whiteboardNameOk && (
          <div className="warning-message">
            {MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE}
          </div>
        )}
        <p className="form-labels"> Description </p>
        <TextareaAutosize
          className="whiteboard-creation-inputs"
          style={{
            fontSize: "14px",
            paddingBottom: "10px",
            paddingTop: "10px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
          onChange={(event) => {
            setWhiteboardDescription(event.target.value);
          }}
          value={whiteboardDescription}
        />
        {whiteboardDescriptionChanged && !whiteboardDescriptionOk && (
          <div className="warning-message">
            {MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE}
          </div>
        )}
        <p className="form-labels"> Group(s) </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}>
            <Autocomplete
              disabled={isEdition}
              className="inputs"
              ListboxProps={{
                style: {
                  fontSize: "14px",
                  backgroundColor: "#e9e9e9",
                  cursor: isEdition ? "not-allowed" : "default",
                },
              }}
              noOptionsText={"No groups found"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    style: {
                      borderRadius: "5px",
                      backgroundColor: "#e9e9e9",
                      width: "300px",
                      fontSize: "14px",
                      paddingBottom: "10px",
                      paddingTop: "10px",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    },
                  }}
                />
              )}
              options={groups}
              multiple={true}
              size="small"
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <li
                  style={{
                    backgroundColor: "#e9e9e9",
                  }}
                  {...props}
                  key={option.id}>
                  {option.name}
                </li>
              )}
              value={selectedGroups}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    style={{
                      fontSize: "12px",
                    }}
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                  />
                ))
              }
              onChange={(event, value) => {
                setSelectedGroups(value);
              }}
            />
            {!isEdition && selectedGroupsChanged && !selectedGroupsOk && (
              <div className="warning-message">
                {MAX_WHITEBOARD_GROUPS_MESSAGE}
              </div>
            )}
            <a
              style={{
                fontSize: "11px",
                color: "grey",
                textDecoration: "underline",
              }}
              target="_blank"
              href="https://docs.sismo.io/sismo-docs/data-groups/data-groups-and-creation">
              What are Groups?
            </a>
          </div>
          {!isEdition && (
            <div
              style={{
                marginLeft: "20px",
              }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "black",
                  backgroundColor: "#e9e9e9",
                }}>
                No groups fit your needs? Create one here!
              </p>
              <a target="_blank" href="https://factory.sismo.io/create-group">
                <div
                  className="create-group-button"
                  style={{
                    fontSize: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: purpleColor,
                    cursor: "pointer",
                    width: "fit-content",
                    color: "black",
                    marginTop: "5px",
                    boxShadow: "rgba(0, 0, 0, 0.25) 0px 1px 2px",
                  }}>
                  <OpenInNewIcon
                    sx={{
                      fontSize: "15px",
                    }}
                  />{" "}
                  Create a group
                </div>
              </a>
            </div>
          )}
        </div>
        <button
          className="create-edit-button validate-button"
          style={{
            backgroundColor:
              (isEdition && disableValidationEdition) ||
              (!isEdition && disableValidation)
                ? greenColorDisabled
                : greenColor,
            cursor:
              (isEdition && disableValidationEdition) ||
              (!isEdition && disableValidation)
                ? "default"
                : "pointer",
            pointerEvents:
              (isEdition && disableValidationEdition) ||
              (!isEdition && disableValidation)
                ? "none"
                : "auto",
            alignSelf: "start",
            marginTop: "20px",
            fontSize: "18px",
          }}
          onClick={() => {
            if (!isEdition) createWhiteboard();
            if (isEdition) saveWhiteboard();
          }}
          disabled={isEdition ? disableValidationEdition : disableValidation}>
          {!isEdition && "Create"}
          {isEdition && "Save"}
        </button>
      </div>
      {isWhiteboardDataLoading && !isVerifying && (
        <Loading text="Loading whiteboard" />
      )}
      {isVerifying && <Loading text="Checking the proof..." />}
    </div>
  );
};

export default WhiteboardCreationEdition;
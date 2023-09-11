"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WhiteboardOperationType,
  WhiteboardCreateSignedMessage,
  WhiteboardEditSignedMessage,
  User,
} from "@/app/types/whiteboard-types";
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
} from "@/app/configs/configs";
import Loading from "../loading-modal/loading-modal";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

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
  const [whiteboardDescription, setWhiteboardDescription] =
    useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [initalWhiteboard, setInitalWhiteboard] = useState<Whiteboard>();
  const [isWhiteboardDataLoading, setIsWhiteboardDataLoading] =
    useState<boolean>(true);
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [disableValidation, setDisableValidation] = useState<boolean>(false);

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
  }, []);

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
  }, [groups]);

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

    const performApiRequest = async (
      url: string,
      message: SismoConnectResponse
    ) => {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    };

    const postWhiteboard = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      try {
        const res = await performApiRequest(url, message);
        if (res.error) {
          console.error(res.error);
          return;
        }
      } catch (error) {
        console.error("API request error:", error);
      }

      setIsVerifying(false);
      router.push("/");
    };
    if (sismoConnectResponseMessage?.signedMessage) {
      postWhiteboard(sismoConnectResponseMessage);
    }
  }, [sismoConnectResponseMessage]);

  useEffect(() => {
    if (
      whiteboardName.length > MAX_CHARACTERS_WHITEBOARD_NAME ||
      whiteboardDescription.length > MAX_CHARACTERS_WHITEBOARD_DESCRIPTION ||
      selectedGroups.length > MAX_WHITEBOARD_GROUPS
    ) {
      setDisableValidation(true);
    } else {
      setDisableValidation(false);
    }
  }, [whiteboardName, whiteboardDescription, selectedGroups]);

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
          <span>Create a new whiteboard</span>
          <span
            style={{
              color: "grey",
              fontSize: "11px",
            }}>
            {!isEdition && " (Currently only 3 max per person)"}
          </span>
        </div>
        <p className="p"> Name </p>
        <input
          type="text"
          className="whiteboard-creation-inputs"
          style={{
            padding: "10px",
            height: "40x",
          }}
          onChange={(event) => {
            setWhiteboardName(event.target.value);
          }}
          value={whiteboardName}
        />
        {whiteboardName.length > MAX_CHARACTERS_WHITEBOARD_NAME && (
          <div className="warning-message">
            {MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE}
          </div>
        )}
        <p className="p"> Description </p>
        <TextareaAutosize
          className="whiteboard-creation-inputs"
          style={{
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
        {whiteboardDescription.length >
          MAX_CHARACTERS_WHITEBOARD_DESCRIPTION && (
          <div className="warning-message">
            {MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE}
          </div>
        )}
        <p className="p"> Group(s) </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}>
          <div>
            <Autocomplete
              className="inputs"
              ListboxProps={{ style: { fontSize: "15px" } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    style: {
                      borderRadius: "5px",
                      backgroundColor: "#e9e9e9",
                      width: "300px",
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
            {selectedGroups.length > MAX_WHITEBOARD_GROUPS && (
              <div className="warning-message">
                {MAX_WHITEBOARD_GROUPS_MESSAGE}
              </div>
            )}
            <a
              style={{
                fontSize: "10px",
                color: "grey",
              }}
              target="_blank"
              href="https://docs.sismo.io/sismo-docs/data-groups/data-groups-and-creation">
              What are Groups?
            </a>
          </div>
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
        </div>
        <button
          className="create-edit-button"
          style={{
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: disableValidation
              ? greenColorDisabled
              : greenColor,
            cursor: disableValidation ? "default" : "pointer",
            pointerEvents: disableValidation ? "none" : "auto",
            alignSelf: "start",
            width: "fit-content",
            color: "black",
            marginTop: "20px",
            boxShadow: "rgba(0, 0, 0, 0.25) 0px 1px 2px",
            fontSize: "15px",
          }}
          onClick={() => {
            if (!isEdition) createWhiteboard();
            if (isEdition) saveWhiteboard();
          }}
          disabled={disableValidation}>
          {!isEdition && "Create"}
          {isEdition && "Save"}
        </button>
      </div>
      {isWhiteboardDataLoading && <Loading text="Loading whiteboard" />}
      {isVerifying && <Loading text="Checking the proof..." />}
    </div>
  );
};

export default WhiteboardCreationEdition;

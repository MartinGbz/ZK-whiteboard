"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WhiteboardOperationType,
  WhiteboardCreateSignedMessage,
  WhiteboardEditSignedMessage,
} from "@/app/types/whiteboard-types";
import Header from "../header/header";

import "./whiteboard-creation.css";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { Whiteboard } from "@prisma/client";
import { greenColor, sismoConnectConfig } from "@/app/configs/configs";
import Loading from "../loading-modal/loading-modal";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";

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

interface WhiteboardCreationProps {
  isEdition?: boolean;
  whiteboardId?: number;
}

const WhiteboardCreation: React.FC<WhiteboardCreationProps> = ({
  isEdition,
  whiteboardId,
}) => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [whiteboardName, setWhiteboardName] = useState<string>("");
  const [whiteboardDescription, setWhiteboardDescription] =
    useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [initalWhiteboard, setInitalWhiteboard] = useState<Whiteboard>();
  const [isWhiteboardDataLoading, setIsWhiteboardDataLoading] =
    useState<boolean>(true);
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

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
        await performApiRequest(url, message);
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

  return (
    <div className="container">
      <Header
        currentRoute="/create-whiteboard"
        onChangeVaultId={(vaultId) => setVaultId(vaultId)}
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
        <TextField
          className="inputs"
          size="small"
          InputProps={{
            style: {
              borderRadius: "5px",
              backgroundColor: "#e9e9e9",
            },
          }}
          onChange={(event) => {
            setWhiteboardName(event.target.value);
          }}
          value={whiteboardName}
        />
        <p className="p"> Description </p>
        <TextField
          size="small"
          InputProps={{
            style: {
              borderRadius: "5px",
              backgroundColor: "#e9e9e9",
            },
          }}
          onChange={(event) => {
            setWhiteboardDescription(event.target.value);
          }}
          value={whiteboardDescription}
        />
        <p className="p"> Group(s) </p>
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
        <p
          style={{
            fontSize: "10px",
            color: "grey",
          }}>
          <a
            target="_blank"
            href="https://docs.sismo.io/sismo-docs/data-groups/data-groups-and-creation">
            What are Groups?
          </a>
        </p>
        <button
          className="create-edit-button"
          style={{
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: greenColor,
            cursor: "pointer",
            alignSelf: "flex-end",
            width: "fit-content",
            color: "black",
            marginTop: "20px",
          }}
          onClick={() => {
            if (!isEdition) createWhiteboard();
            if (isEdition) saveWhiteboard();
          }}>
          {!isEdition && "Create"}
          {isEdition && "Save"}
        </button>
      </div>
      {isWhiteboardDataLoading && <Loading text="Loading whiteboard" />}
      {isVerifying && <Loading text="Checking the proof..." />}
    </div>
  );
};

export default WhiteboardCreation;

"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  WhiteboardCreateSignedMessage,
  WhiteboardEditSignedMessage,
  User,
  OperationType,
} from "@/types/whiteboard-types";
import Header from "../header/header";

import "./whiteboard-creation-edition.css";
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
} from "@/configs/configs";
import Loading from "../loading-modal/loading-modal";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";
import ErrorModal from "../error-modal/error-modal";
import SuccessAnimation from "../success-animation/success-animation";
import WhiteboardCreationEditionInput from "../whiteboard-creation-edition-input/whiteboard-creation-edition-input";
import Button from "../button/button";
import { useLoginContext } from "@/context/login-context";

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

const API_BASE_URL = "/api/whiteboard";
const API_ENDPOINTS = {
  POST: "/post",
  EDIT: "/edit",
  DELETE: "/delete",
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
  const [whiteboardNameOk, setWhiteboardNameOk] = useState<boolean>(
    isEdition ? true : false
  );
  const [whiteboardDescription, setWhiteboardDescription] =
    useState<string>("");
  const [whiteboardDescriptionOk, setWhiteboardDescriptionOk] =
    useState<boolean>(isEdition ? true : false);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedGroupsOk, setSelectedGroupsOk] = useState<boolean>(
    isEdition ? true : false
  );
  const [initalWhiteboard, setInitalWhiteboard] = useState<Whiteboard>();
  const [isWhiteboardDataLoading, setIsWhiteboardDataLoading] =
    useState<boolean>(true);
  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [disableValidation, setDisableValidation] = useState<boolean>(false);
  const [disableValidationEdition, setDisableValidationEdition] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const pathname = usePathname();

  const { user } = useLoginContext();

  useEffect(() => {
    const fetchWhiteboard = async (id: number, groups: Group[]) => {
      let response;
      try {
        response = await axios.post("/api/whiteboard", id, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error: any) {
        console.error("API request error:", error);
        const defaultErrorMessage =
          "An error occured while fetching the whiteboard data";
        const errorMessage = error.response.data.error
          ? `${defaultErrorMessage}: ${error.response.data.error}`
          : defaultErrorMessage;
        setErrorMessage(errorMessage);
        return null;
      }
      const whiteboard: Whiteboard = response.data;
      setInitalWhiteboard(whiteboard);
      setWhiteboardName(whiteboard?.name || "");
      setWhiteboardDescription(whiteboard?.description || "");
      setSelectedGroups(
        groups.filter((group: Group) =>
          whiteboard?.groupIds?.includes(group.id)
        )
      );
      setIsWhiteboardDataLoading(false);
    };

    const fetchGroups = async () => {
      setIsWhiteboardDataLoading(true);
      let response;
      try {
        response = await axios.get("https://hub.sismo.io/groups/latests", {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error: any) {
        console.error("API request error:", error);
        setErrorMessage("An error occured while fetching Sismo Data Groups");
        return null;
      }
      const groups: Group[] = response.data.items;

      setGroups(groups);

      if (isEdition && whiteboardId) {
        fetchWhiteboard(whiteboardId, groups);
      } else {
        setIsWhiteboardDataLoading(false);
      }
    };
    fetchGroups();
  }, [isEdition, whiteboardId]);

  function performAction(type: OperationType) {
    if (
      ![OperationType.POST, OperationType.EDIT, OperationType.DELETE].includes(
        type
      )
    ) {
      console.error("Invalid action type");
      return;
    }

    if (
      (type === OperationType.EDIT || type === OperationType.DELETE) &&
      !initalWhiteboard
    ) {
      console.error("No initial whiteboard");
      return;
    }

    let sismoConnectSignedMessage;
    switch (type) {
      case OperationType.POST:
        sismoConnectSignedMessage = {
          type: type,
          message: {
            name: whiteboardName,
            description: whiteboardDescription,
            groupIds: selectedGroups.map((group: Group) => group.id),
          },
        } as WhiteboardCreateSignedMessage;
        break;
      case OperationType.EDIT:
        sismoConnectSignedMessage = {
          type: type,
          message: {
            ...initalWhiteboard,
            description: whiteboardDescription,
          },
        } as WhiteboardEditSignedMessage;
        break;
      case OperationType.DELETE:
        sismoConnectSignedMessage = {
          type: type,
          message: initalWhiteboard,
        } as WhiteboardEditSignedMessage;
        break;
      default:
        console.error("Invalid action type");
        return;
    }

    if (!sismoConnectSignedMessage) {
      console.error("No message");
      return;
    }

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

      if (signedMessage?.type === OperationType.POST) {
        url += API_ENDPOINTS.POST;
      } else if (signedMessage?.type === OperationType.EDIT) {
        url += API_ENDPOINTS.EDIT;
      } else if (signedMessage?.type === OperationType.DELETE) {
        url += API_ENDPOINTS.DELETE;
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
            const defaultErrorMessage = "An error occured";
            const errorMessage = error.response.data.error
              ? `${defaultErrorMessage}: ${error.response.data.error}`
              : defaultErrorMessage;
            setErrorMessage(errorMessage);
            return false;
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
      return true;
    };

    const postWhiteboard = async (message: SismoConnectResponse) => {
      setIsVerifying(true);

      const url = constructUrlFromMessage(message);

      const success = await retryRequest(performApiRequest, url, message, 2);

      setIsVerifying(false);

      if (!success) {
        router.push(pathname);
      } else {
        const mess = message.signedMessage
          ? JSON.parse(message.signedMessage)
          : null;
        if (mess.type === OperationType.POST) {
          setSuccessMessage("Whiteboard created!");
        } else if (mess.type === OperationType.EDIT) {
          setSuccessMessage("Whiteboard edited!");
        } else if (mess.type === OperationType.DELETE) {
          setSuccessMessage("Whiteboard deleted!");
        } else {
          setSuccessMessage("Success");
        }
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    };
    if (sismoConnectResponseMessage?.signedMessage) {
      postWhiteboard(sismoConnectResponseMessage);
    }
  }, [pathname, router, sismoConnectResponseMessage]);

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
    if (whiteboardDescriptionOk) {
      setDisableValidationEdition(false);
    } else {
      setDisableValidationEdition(true);
    }
  }, [whiteboardNameOk, whiteboardDescriptionOk, selectedGroupsOk, user]);

  return (
    <div className="container">
      <Header />
      <div className="edition-container">
        <div className="edition-title">
          <div>
            {isEdition ? "Edit a whiteboard" : "Create a new whiteboard"}
          </div>
          <div>
            {isEdition
              ? " (You can only edit the description for now)"
              : " (Currently only " +
                MAX_WHITEBOARD_PER_USER +
                " max per user)"}
          </div>
        </div>
        <WhiteboardCreationEditionInput
          isEdition={isEdition}
          type="name"
          title="Name"
          maxNumber={MAX_CHARACTERS_WHITEBOARD_NAME}
          warningMessage={MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE}
          inputOk={setWhiteboardNameOk}
          onChange={setWhiteboardName}
          value={whiteboardName}
        />
        <WhiteboardCreationEditionInput
          isEdition={isEdition}
          type="description"
          title="Description"
          maxNumber={MAX_CHARACTERS_WHITEBOARD_DESCRIPTION}
          warningMessage={MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE}
          inputOk={setWhiteboardDescriptionOk}
          onChange={setWhiteboardDescription}
          value={whiteboardDescription}
        />
        <div className="groups-input-container">
          <div>
            <WhiteboardCreationEditionInput
              isEdition={isEdition}
              type="groups"
              title="Group(s)"
              maxNumber={MAX_WHITEBOARD_GROUPS}
              warningMessage={MAX_WHITEBOARD_GROUPS_MESSAGE}
              inputOk={setSelectedGroupsOk}
              onChange={setSelectedGroups}
              value={selectedGroups}
              groups={groups}
            />
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
            <div>
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
                    backgroundColor: purpleColor,
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
        <Button
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
            marginTop: "20px",
          }}
          onClick={() => {
            if (!isEdition) performAction(OperationType.POST);
            if (isEdition) performAction(OperationType.EDIT);
          }}
          disabled={isEdition ? disableValidationEdition : disableValidation}
          type="validate"
          title={isEdition ? "Save" : "Create"}
          fontSize="15px"
          iconSpace="4px"></Button>
        {isEdition && (
          <Button
            className="create-edit-button"
            type="delete"
            title="Delete"
            onClick={() => {
              performAction(OperationType.DELETE);
            }}
            fontSize="15px"
            style={{
              alignSelf: "end",
              marginTop: "20px",
            }}
          />
        )}
      </div>
      {isWhiteboardDataLoading && !isVerifying && (
        <Loading text="Loading whiteboard" />
      )}
      {isVerifying && <Loading text="Checking the proof..." />}
      {errorMessage && <ErrorModal text={errorMessage} />}
      <SuccessAnimation text={successMessage} duration={0.5} />
    </div>
  );
};

export default WhiteboardCreationEdition;

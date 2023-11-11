"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  WhiteboardCreateSignedMessage,
  WhiteboardEditSignedMessage,
  OperationType,
  Whiteboard,
} from "@/types/whiteboard-types";

import "./whiteboard-creation-edition.css";
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
import SuccessAnimation from "../success-animation/success-animation";
import WhiteboardCreationEditionInput from "../whiteboard-creation-edition-input/whiteboard-creation-edition-input";
import Button from "../button/button";
import { Group } from "@/lib/groups";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const sismoConnect = SismoConnect({ config: sismoConnectConfig });

const API_BASE_URL = "/api/whiteboard";
const API_ENDPOINTS = {
  POST: "/post",
  EDIT: "/edit",
  DELETE: "/delete",
};

interface WhiteboardCreationEditionProps {
  isEdition?: boolean;
  whiteboard?: Whiteboard;
  groups: Group[];
}

const WhiteboardCreationEdition: React.FC<WhiteboardCreationEditionProps> = ({
  isEdition,
  whiteboard,
  groups,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (!whiteboard) return;
    reset({
      name: whiteboard.name,
      description: whiteboard.description,
      groups: groups.filter((group: Group) =>
        whiteboard?.groupIds?.includes(group.id)
      ),
    });
  }, [reset, whiteboard]);

  function performAction(
    type: OperationType,
    name?: string,
    description?: string,
    groups?: Group[]
  ) {
    if (
      (type === OperationType.EDIT || type === OperationType.DELETE) &&
      !whiteboard
    ) {
      const errorMessage = "No whiteboard to edit";
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    let sismoConnectSignedMessage;
    switch (type) {
      case OperationType.POST:
        if (!name || !description || !groups) {
          const errorMessage = "Missing parameters";
          console.error(errorMessage);
          toast.error(errorMessage);
          return;
        }
        sismoConnectSignedMessage = {
          type: type,
          message: {
            name: name,
            description: description,
            groupIds: groups?.map((group: Group) => group.id),
          },
        } as WhiteboardCreateSignedMessage;
        break;
      case OperationType.EDIT:
        if (!description) {
          const errorMessage = "Missing description";
          console.error(errorMessage);
          toast.error(errorMessage);
          return;
        }
        sismoConnectSignedMessage = {
          type: type,
          message: {
            ...whiteboard,
            description: description,
          },
        } as WhiteboardEditSignedMessage;
        break;
      case OperationType.DELETE:
        sismoConnectSignedMessage = {
          type: type,
          message: whiteboard,
        } as WhiteboardEditSignedMessage;
        break;
      default:
        const errorMessage = "Invalid action type";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
    }

    if (!sismoConnectSignedMessage) {
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
            const errorMessage = error?.response?.data?.error
              ? `${defaultErrorMessage}: ${error.response.data.error}`
              : defaultErrorMessage;
            console.error(errorMessage);
            toast.error(errorMessage);
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

  const onSubmit = (formData: FieldValues) => {
    if (isEdition) {
      performAction(OperationType.EDIT, undefined, formData.description);
    } else {
      performAction(
        OperationType.POST,
        formData.name,
        formData.description,
        formData.groups
      );
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        width: "100%",
        height: "100%",
      }}>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <WhiteboardCreationEditionInput
            isEdition={isEdition}
            type="name"
            label="Name"
            maxNumber={MAX_CHARACTERS_WHITEBOARD_NAME}
            warningMessage={MAX_CHARACTERS_WHITEBOARD_NAME_MESSAGE}
            register={register}
            errors={errors}
          />
          <WhiteboardCreationEditionInput
            isEdition={isEdition}
            type="description"
            label="Description"
            maxNumber={MAX_CHARACTERS_WHITEBOARD_DESCRIPTION}
            warningMessage={MAX_CHARACTERS_WHITEBOARD_DESCRIPTION_MESSAGE}
            register={register}
            errors={errors}
          />
          <div className="groups-input-container">
            <div>
              <WhiteboardCreationEditionInput
                isEdition={isEdition}
                type="groups"
                label="Group(s)"
                maxNumber={MAX_WHITEBOARD_GROUPS}
                warningMessage={MAX_WHITEBOARD_GROUPS_MESSAGE}
                groups={groups}
                control={control}
                errors={errors}
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
            type="submit"
            style={{
              backgroundColor:
                Object.keys(errors).length !== 0
                  ? greenColorDisabled
                  : greenColor,
              cursor: Object.keys(errors).length !== 0 ? "default" : "pointer",
              pointerEvents: Object.keys(errors).length !== 0 ? "none" : "auto",
              marginTop: "20px",
            }}
            disabled={Object.keys(errors).length !== 0}
            buttonType="validate"
            title={isEdition ? "Save" : "Create"}
            fontSize="15px"
            iconSpace="4px"></Button>
        </form>
        {isEdition && (
          <Button
            className="create-edit-button"
            buttonType="delete"
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
      {isVerifying && <Loading text="Checking the proof..." />}
      <SuccessAnimation text={successMessage} duration={0.5} />
    </div>
  );
};

export default WhiteboardCreationEdition;

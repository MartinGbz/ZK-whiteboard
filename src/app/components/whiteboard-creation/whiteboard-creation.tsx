"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WhiteboardCreation } from "@/app/types/whiteboard-types";
import Header from "../header/header";

import "./whiteboard-creation.css";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { Whiteboard } from "@prisma/client";
import { greenColor } from "@/app/configs/configs";

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

const WhiteboardCreation = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [whiteboardName, setWhiteboardName] = useState<string>("");
  const [whiteboardDescription, setWhiteboardDescription] =
    useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [vaultId, setVaultId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
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
    };
    fetchGroups();
  }, []);

  async function createWhiteboard() {
    if (!vaultId) {
      console.error("No vaultId");
      return;
    }
    const whiteboardRequest: WhiteboardCreation = {
      name: whiteboardName,
      description: whiteboardDescription,
      groupIds: selectedGroups.map((group: Group) => group.id),
      authorVaultId: vaultId,
    };
    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whiteboardRequest),
      });
      const whiteboard: Whiteboard = await response.json();
      router.push("/whiteboard/" + whiteboard.id);
    } catch (error) {
      console.error(error);
    }
  }

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
            {" "}
            {"(Currently only 3 max per person)"}{" "}
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
            What are Groups?{" "}
          </a>
        </p>
        <button
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
          onClick={() => createWhiteboard()}>
          {" "}
          Create{" "}
        </button>
      </div>
    </div>
  );
};

export default WhiteboardCreation;

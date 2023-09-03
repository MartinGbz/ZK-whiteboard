"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WhiteboardCreation } from "@/app/types/whiteboard-types";
import Header from "../header/header";
// import Select from "@mui/base/Select";
// import Option from "@mui/base/Option";
// import { Input } from "@mui/base";
// import { useAutocomplete } from "@mui/base";

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
    // get all groups from this URL: https://hub.sismo.io/group-generators
    const fetchGroups = async () => {
      try {
        const response = await fetch("https://hub.sismo.io/groups/latests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // cache: "no-cache",
        });
        console.log(response);
        const responseDecoded = await response.json();
        console.log(responseDecoded);
        const groups: Group[] = responseDecoded.items;
        console.log(groups);
        // const groupNames = groups.map((group: Group) => group.name);
        // console.log(groupNames);
        setGroups(groups);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGroups();
    console.log(groups);
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
      console.log(response);
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
        <h1
          style={{
            color: "black",
            fontSize: "20px",
          }}>
          {" "}
          Create a new whiteboard{" "}
        </h1>
        <p className="p"> Name </p>
        <TextField
          className="inputs"
          size="small"
          onChange={(event) => {
            setWhiteboardName(event.target.value);
          }}
        />
        <p className="p"> Description </p>
        <TextField
          className="inputs"
          size="small"
          onChange={(event) => {
            setWhiteboardDescription(event.target.value);
          }}
        />
        <p className="p"> Group(s) </p>
        <Autocomplete
          className="inputs"
          ListboxProps={{ style: { fontSize: "15px" } }}
          renderInput={(params) => <TextField {...params} />}
          options={groups}
          multiple={true}
          size="small"
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
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
            // margin: "10px",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: greenColor,
            cursor: "pointer",
            // alignSelf: "center",
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

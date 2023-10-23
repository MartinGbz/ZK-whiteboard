"use client";
import React, { useEffect, useState } from "react";
import { User } from "@/types/whiteboard-types";

import { MIN_WHITEBOARD } from "@/configs/configs";
import { Autocomplete, Chip, TextField, TextareaAutosize } from "@mui/material";

import "./whiteboard-creation-edition-input.css";

interface WhiteboardCreationEditionInputProps {
  isEdition?: boolean;
  type: string;
  title: string;
  maxNumber: number;
  warningMessage?: string;
  groups?: any;
  onChange: (data: any) => void;
  inputOk: (state: boolean) => void;
  baseValue?: any;
}

const WhiteboardCreationEdition: React.FC<
  WhiteboardCreationEditionInputProps
> = ({
  isEdition,
  type,
  title,
  maxNumber,
  warningMessage,
  groups,
  onChange,
  inputOk,
  baseValue,
}) => {
  const [inputData, setInputData] = useState<any>(
    baseValue ? baseValue : type == "groups" ? [] : ""
  );
  const [inputDataOk, setInputDataOk] = useState<boolean>(false);
  const [inputDataChanged, setInputDataChanged] = useState<boolean>(false);

  useEffect(() => {
    if (baseValue) {
      setInputData(baseValue);
    }
  }, [baseValue]);

  useEffect(() => {
    onChange(inputData);
    if (inputData?.length > 0) {
      setInputDataChanged(true);
    }

    if (inputData?.length > maxNumber || inputData?.length < MIN_WHITEBOARD) {
      setInputDataOk(false);
      inputOk(false);
    } else {
      setInputDataOk(true);
      inputOk(true);
    }
  }, [maxNumber, inputData?.length, inputData, inputOk, onChange]);

  return (
    <div className="input-container">
      <p className="form-labels"> {title} </p>
      {type == "name" && (
        <input
          disabled={isEdition}
          type="text"
          className="whiteboard-creation-inputs"
          style={{
            height: "40x",
            cursor: isEdition ? "not-allowed" : "default",
          }}
          onChange={(event) => {
            setInputData(event.target.value);
          }}
          value={inputData}
        />
      )}
      {type == "description" && (
        <TextareaAutosize
          className="whiteboard-creation-inputs"
          onChange={(event) => {
            setInputData(event.target.value);
          }}
          value={inputData}
        />
      )}
      {type == "groups" && (
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
                  padding: "10px",
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
          value={inputData}
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
            setInputData(value);
          }}
        />
      )}
      {inputDataChanged && !inputDataOk && (
        <div className="warning-message">{warningMessage}</div>
      )}
    </div>
  );
};

export default WhiteboardCreationEdition;

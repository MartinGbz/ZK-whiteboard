"use client";
import React, { useState } from "react";

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
  value?: any;
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
  value,
}) => {
  const [inputDataOk, setInputDataOk] = useState<boolean>(false);
  const [inputDataChanged, setInputDataChanged] = useState<boolean>(false);

  function onInputChange(value: any) {
    if (value?.length > 0) {
      setInputDataChanged(true);
    }

    if (value?.length > maxNumber || value?.length < MIN_WHITEBOARD) {
      setInputDataOk(false);
      inputOk(false);
    } else {
      setInputDataOk(true);
      inputOk(true);
    }

    onChange(value);
  }

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
            cursor: isEdition ? "not-allowed" : "text",
          }}
          onChange={(event) => {
            onInputChange(event.target.value);
          }}
          value={value ? value : ""}
        />
      )}
      {type == "description" && (
        <TextareaAutosize
          className="whiteboard-creation-inputs"
          onChange={(event) => {
            onInputChange(event.target.value);
          }}
          value={value ? value : ""}
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
              cursor: isEdition ? "not-allowed" : "text",
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
          value={value ? value : []}
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
            onInputChange(value);
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

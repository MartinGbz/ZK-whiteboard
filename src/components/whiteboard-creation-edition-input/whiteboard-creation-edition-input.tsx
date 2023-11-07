"use client";
import React, { useState } from "react";

import { MIN_WHITEBOARD } from "@/configs/configs";
import { Autocomplete, Chip, TextField, TextareaAutosize } from "@mui/material";
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

import "./whiteboard-creation-edition-input.css";

interface WhiteboardCreationEditionInputProps {
  isEdition?: boolean;
  type: string;
  label: string;
  maxNumber: number;
  warningMessage?: string;
  groups?: any;
  // onChange: (data: any) => void;
  // inputOk: (state: boolean) => void;
  // value?: any;
  control?: Control<FieldValues, any>;
  register?: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

const WhiteboardCreationEdition: React.FC<
  WhiteboardCreationEditionInputProps
> = ({
  isEdition,
  type,
  label,
  maxNumber,
  warningMessage,
  groups,
  // onChange,
  // inputOk,
  // value,
  control,
  register,
  errors,
}) => {
  // console.log("errors", errors);
  // const [inputDataOk, setInputDataOk] = useState<boolean>(false);
  // const [inputDataChanged, setInputDataChanged] = useState<boolean>(false);

  // function onInputChange(value: any) {
  // if (value?.length > 0) {
  //   setInputDataChanged(true);
  // }
  // if (value?.length > maxNumber || value?.length < MIN_WHITEBOARD) {
  //   setInputDataOk(false);
  //   inputOk(false);
  // } else {
  //   setInputDataOk(true);
  //   inputOk(true);
  // }
  // onChange(value);
  // }

  // console.log("render");

  return (
    <div className="input-container">
      <p className="form-labels"> {label} </p>
      {type == "name" && register && (
        <input
          {...register(type, {
            required: isEdition ? false : true,
            minLength: MIN_WHITEBOARD,
            maxLength: maxNumber,
          })}
          disabled={isEdition}
          type="text"
          name={type}
          className="whiteboard-creation-inputs"
          style={{
            height: "40x",
            cursor: isEdition ? "not-allowed" : "text",
          }}
          // onChange={(event) => {
          //   onInputChange(event.target.value);
          // }}
          // value={value ? value : undefined}
        />
      )}
      {type == "description" && register && (
        <TextareaAutosize
          {...register(type, {
            required: true,
            minLength: MIN_WHITEBOARD,
            maxLength: maxNumber,
          })}
          name={type}
          className="whiteboard-creation-inputs"
          // onChange={(event) => {
          //   onInputChange(event.target.value);
          // }}
          // value={value ? value : ""}
        />
      )}
      {type == "groups" && (
        <Controller
          name="groups"
          control={control}
          rules={{
            required: isEdition ? false : true,
            minLength: MIN_WHITEBOARD,
            maxLength: maxNumber,
          }}
          render={({ field }) => {
            const { onChange, value } = field;
            // console.log("value", value);
            return (
              <Autocomplete
                // componentName="groups"
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
                    name={type}
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
                  onChange(value);
                  // onInputChange(value);
                  // console.log(value);
                }}
              />
            );
          }}
        />
      )}
      {/* {inputDataChanged && !inputDataOk && (
        <div className="warning-message">{warningMessage}</div>
      )} */}
      {/* // test if errors is not empty */}
      {errors[type] && <div className="warning-message">{warningMessage}</div>}
    </div>
  );
};

export default WhiteboardCreationEdition;

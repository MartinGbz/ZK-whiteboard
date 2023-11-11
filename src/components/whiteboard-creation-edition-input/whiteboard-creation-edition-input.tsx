import React from "react";

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
  type: "text" | "textareaAutosize" | "autocomplete";
  name: string;
  label: string;
  maxNumber: number;
  warningMessage?: string;
  groups?: any;
  control?: Control<FieldValues, any>;
  register?: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

const WhiteboardCreationEdition: React.FC<
  WhiteboardCreationEditionInputProps
> = ({
  isEdition,
  type,
  name,
  label,
  maxNumber,
  warningMessage,
  groups,
  control,
  register,
  errors,
}) => {
  return (
    <div className="input-container">
      <label className="form-labels"> {label} </label>
      {type == "text" && register && (
        <input
          {...register(name, {
            required: isEdition ? false : true,
            minLength: MIN_WHITEBOARD,
            maxLength: maxNumber,
          })}
          disabled={isEdition}
          type="text"
          className="whiteboard-creation-inputs"
          style={{
            height: "40x",
            cursor: isEdition ? "not-allowed" : "text",
          }}
        />
      )}
      {type == "textareaAutosize" && register && (
        <TextareaAutosize
          {...register(name, {
            required: true,
            minLength: MIN_WHITEBOARD,
            maxLength: maxNumber,
          })}
          className="whiteboard-creation-inputs"
        />
      )}
      {type == "autocomplete" && (
        <Controller
          name={name}
          control={control}
          rules={{
            required: isEdition ? false : true,
            minLength: MIN_WHITEBOARD,
            maxLength: maxNumber,
          }}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
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
                  onChange(value);
                }}
              />
            );
          }}
        />
      )}
      {errors[name] && <div className="warning-message">{warningMessage}</div>}
    </div>
  );
};

export default WhiteboardCreationEdition;

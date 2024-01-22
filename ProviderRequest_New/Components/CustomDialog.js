import React from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { ActionTypes } from "../Store/Constants";
import { useDispatch } from "react-redux";

function CustomDialog({submitText, cancelText, showDialog, content}) {
  const dispatch = useDispatch();
  const dialogButtons = [
    {
      click: () => {
        updateConfimationAction(true);
      },
      buttonModel: {
        content: submitText || "Yes",
        isPrimary: true,
      },
    },
    {
      click: () => {
        updateConfimationAction(false);
      },
      buttonModel: { content: cancelText || "No" },
    },
  ];

  const updateConfimationAction = (data) => {
    dispatch({
      type: ActionTypes.UPDATE_CONFIRMATION_ACTION,
      payload: data,
    });
  };

  return (
    <>
      <DialogComponent
        isModal
        visible={showDialog || false}
        width={"400px"}
        buttons={dialogButtons}
        position={{ X: "center", Y: "top" }}
        style={{ marginTop: "40px" }}
        closeOnEscape={false}
      >
        <p style={{ fontSize: "16px" }}>{content}</p>
      </DialogComponent>
    </>
  );
}

export default CustomDialog;

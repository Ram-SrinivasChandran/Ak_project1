import React, { Component } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { ActionTypes } from "../Store/Constants";

class CustomDialog extends Component {
  constructor() {
    super(...arguments);

    this.dialogButtons = [
      {
        click: () => {
          this.updateConfirmationAction(true);
        },
        buttonModel: {
          content: this.props.submitText || "Yes",
          isPrimary: true,
        },
      },
      {
        click: () => {
          this.updateConfirmationAction(false);
        },
        buttonModel: { content: this.props.cancelText || "No" },
      },
    ];
  }

  updateConfirmationAction = (data) => {
    this.props.dispatch({
      type: ActionTypes.UPDATE_CONFIRMATION_ACTION,
      payload: data,
    });
  };

  render() {
    return (
      <DialogComponent
        isModal
        visible={this.props.showDialog || false}
        width={"400px"}
        buttons={this.dialogButtons}
        position={{ X: "center", Y: "top" }}
        style={{ marginTop: "40px" }}
        closeOnEscape={false}
      >
        <p style={{ fontSize: "16px" }}>{this.props.content}</p>
      </DialogComponent>
    );
  }
}

export default CustomDialog;

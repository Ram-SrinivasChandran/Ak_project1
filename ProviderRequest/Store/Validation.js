import { isValidDate } from "../../Common/Actions/DateHandler";
import { RegExPatterns } from "../../Common/Actions/RegExPatterns";
import { Util } from "../../Common/Actions/Util";
import { ToastTypes } from "../../Common/Constants/CommonConstants";
import { Actions } from "./Actions";
import { ActionFields, RequestMode,ErrorMessages } from "./Constants";


export const Validation = {
  ValidateAction: (nState, action) => {
    let errorMsg = [];
    let requestMode = nState?.RequestForm?.ActiveQuery?.RequestMode?.Value?.toUpperCase();
    if (!nState.RequestForm.CallerName.Value) {
      nState.RequestForm.CallerName.Error = "Please enter caller name";
      errorMsg.push(nState.RequestForm.CallerName.Error);
    }
    if (nState.RequestForm.AuditId.Error) {
      errorMsg.push("Please enter valid audit id");
    }
    if (!nState.RequestForm.RequestTypeId.Value) {
      nState.RequestForm.RequestTypeId.Error = "Please select request type";
      errorMsg.push(nState.RequestForm.RequestTypeId.Error);
    }
    if (
      nState.RequestForm.RequesterMail.Value &&
      !RegExPatterns.Email.test(nState.RequestForm.RequesterMail.Value)
    ) {
      nState.RequestForm.RequesterMail.Error = "Please enter valid email";
      errorMsg.push(nState.RequestForm.RequesterMail.Error);
    }
    if (
      nState.RequestForm.IsCallerNumberRequired &&
      !nState.RequestForm.CallerNumber.Value
    ) {
      nState.RequestForm.CallerNumber.Error = "Please enter caller number";
      errorMsg.push(nState.RequestForm.CallerNumber.Error);
    }
    if (
      nState.RequestForm.IsEmailRequired &&
      !nState.RequestForm.RequesterMail.Value
    ) {
      nState.RequestForm.RequesterMail.Error = "Please enter Requester email";
      errorMsg.push(nState.RequestForm.RequesterMail.Error);
    }
    if (nState.RequestForm.ActiveQuery.ShowEditCard) {
      if (!nState.RequestForm.ActiveQuery.RequestMode.Value) {
        nState.RequestForm.ActiveQuery.RequestMode.Error =
          "Please select channel";
        errorMsg.push(nState.RequestForm.ActiveQuery.RequestMode.Error);
      }
      if (!nState.RequestForm.ActiveQuery.Query.Value) {
        nState.RequestForm.ActiveQuery.Query.Error = "Please enter query";
        errorMsg.push(nState.RequestForm.ActiveQuery.Query.Error);
      }
      if (
        nState.RequestForm.IsResponseRequired &&
        !nState.RequestForm.ActiveQuery.Response.Value
      ) {
        nState.RequestForm.ActiveQuery.Response.Error = "Please enter response";
        errorMsg.push(nState.RequestForm.ActiveQuery.Response.Error);
      }
      if (
        nState.RequestForm.IsVerifiedUsingRequired &&
        !nState.RequestForm.ActiveQuery.VerifiedUsing.Value
        && requestMode != RequestMode.PORTAL
      ) {
        nState.RequestForm.ActiveQuery.VerifiedUsing.Error =
          "Please select atleast one caller verified using";
        errorMsg.push(nState.RequestForm.ActiveQuery.VerifiedUsing.Error);
      }
    }

    if (nState.RequestForm.AdditionalAuditIds.Error) {
      errorMsg.push(ErrorMessages.AdditionalAuditIdNotValid);
    }

    if (Util.isValidArray(errorMsg)) {
      Actions.showToast(nState, ToastTypes.Warning, errorMsg.join("<br />"));
      return false;
    } else {
      return true;
    }
  },
  validateSearchDates: (nState) => {
    nState.SearchParameters.FromDate.Error = "";
    nState.SearchParameters.ToDate.Error = "";
    nState.SearchParameters.SearchPanelHasError = false;
    let fromDate = new Date(nState.SearchParameters.FromDate.Value);
    let toDate = new Date(nState.SearchParameters.ToDate.Value);
    if (isValidDate(fromDate) && isValidDate(toDate)) {
      nState.SearchParameters.SearchPanelHasError = false;
      let diffDays = Math.round(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)
      );
      if (new Date(fromDate) > new Date(toDate)) {
        nState.SearchParameters.FromDate.Error = "Invalid date range";
        nState.SearchParameters.ToDate.Error = "Invalid date range";
        nState.SearchParameters.SearchPanelHasError = true;
      } else if (new Date(toDate) > new Date()) {
        nState.SearchParameters.FromDate.Error =
          "Date range should be less than or equal to current date";
        nState.SearchParameters.ToDate.Error =
          "Date range should be less than or equal to current date";
        nState.SearchParameters.SearchPanelHasError = true;
      } else if (
        diffDays > nState.SearchParameters.MaxNoOfDaysToSearch &&
        !nState.SearchParameters.AuditIds.Value
      ) {
        const msg =
          "Date Range cannot be more than " +
          nState.SearchParameters.MaxNoOfDaysToSearch +
          " days";

        nState.SearchParameters.FromDate.Error = msg;
        nState.SearchParameters.ToDate.Error = msg;
        nState.SearchParameters.SearchPanelHasError = true;
      }
    } else {
      if (!nState.SearchParameters.AuditIds.Value) {
        nState.SearchParameters.FromDate.Error = isValidDate(fromDate)
          ? ""
          : "Enter from date";
        nState.SearchParameters.ToDate.Error = isValidDate(toDate)
          ? ""
          : "Enter to date";

        if (
          nState.SearchParameters.FromDate.Error ||
          nState.SearchParameters.ToDate.Error
        )
          nState.SearchParameters.SearchPanelHasError = true;
      }
    }
  },
  ValidateAdditionalAuditIds: (nState) => {
    let isValid = true;
    if (nState.RequestForm.AdditionalAuditIds.Value) {
        let arrAuditIds = [];
        let splitStr = nState.RequestForm.AdditionalAuditIds.Value.split(",")
        if (Util.isValidArray(splitStr)) {
            splitStr.map(x => {
                if (Util.isValidString(x) && Util.isValidNumber(x.trim())) { //Ignore invalid numbers
                    if (!arrAuditIds.includes(x.trim()) && (nState.RequestForm.AuditId.Value != x.trim())) //Ignore duplicate id
                        arrAuditIds.push(x.trim());
                }

            });
        }

        if (Util.isValidArray(arrAuditIds))
            nState.RequestForm.AdditionalAuditIds.Value = arrAuditIds.join(", ");
        else {
            nState.RequestForm.AdditionalAuditIds.Value = "";
            nState.RequestForm.AdditionalAuditIds.Error = "";
        }

    }
    if (!nState.RequestForm.AdditionalAuditIds.Value)
        isValid = false;

    if (!nState.RequestForm.CapId.Value) {
        isValid = false;
        nState.RequestForm.CapId.Error = "Select valid client audit program";
    }
    return isValid;
},
ValidateAuditStatus: (nState, auditStatuses, field) => {
  let errorMessage = "";
  let invalidClients = [];
  let invalidCAPS = [];
  if (Util.isValidArray(auditStatuses)) {
      auditStatuses.map(x => {
          if (!x.IsAuditValid) {
              if (!x.IsAuditIdValid) {
                  invalidClients.push(x.AuditId);
              }
              else if (!x.IsCapIdValid) {
                  invalidCAPS.push(x.AuditId);
              }
          }
      });
      if (invalidClients.length) {
          errorMessage = ErrorMessages.InvalidClient + invalidClients.join(', ');
      }
      if (invalidCAPS.length) {          
          errorMessage =  errorMessage.length ? " <br/> " : "" + ErrorMessages.InvalidCAPS + invalidCAPS.join(', ');
      }
  }
  else {
      errorMessage = ErrorMessages.ServerError; // exception scenario
  }

  if (errorMessage.length > 0) {
      field.Error = errorMessage;
      Actions.showToast(nState, ToastTypes.Warning, errorMessage);
      return false;
  }
  else {
      field.Error = "";
      return true;
  }
},
};

import {
  isValidDate,
  GetFormattedDateHyphan,
  GetFormattedFileName,
} from "../../Common/Actions/DateHandler";
import {
  ActionTypes,
  FieldNames,
  ScreenType,
  ActionFields,
  ConfirmMessages,
  ConfirmationAction,
  RequestMode,
} from "./Constants";
import { ToastTypes } from "../../Common/Constants/CommonConstants";

import FieldData, { SetValue } from "../../Common/Actions/FieldData";
import { DataMap } from "./DataMap";
import { Util } from "../../Common/Actions/Util";
import { Validation } from "./Validation";
import { RegExPatterns } from "../../Common/Actions/RegExPatterns";
import { initialState }  from "./InitialState"; 

export const Actions = {
  updateScreenState: (nState, screenState) => {
    if (screenState == ScreenType.AddForm) {
      nState.CurrentScreen = screenState;
      DataMap.clearStoreDataForAdd(nState);
      if (nState.CallId === "") {
        Actions.showConfirmation(
          nState,
          ConfirmationAction.ADD_FORM_CALL_TRACKER,
          ConfirmMessages.CallTrackerNotStarted
        );
      }
    } else {
      nState.CurrentScreen = screenState;
    }
  },

  showConfirmation: (
    nState,
    action,
    message,
    actionParameter = null,
    submitText = "Yes",
    cancelText = "No"
  ) => {
    nState.ConfirmationDialog = {
      action,
      message,
      visible: true,
      actionParameter,
      submitText,
      cancelText,
    };
  },

  confirmCallNotStarted: (nState) => {
    if (
      nState.CallId === "" &&
      !nState.IsReadOnlyMode &&
      !nState.RequestForm.CallNotStartedApprove
    ) {
      Actions.showConfirmation(
        nState,
        ConfirmationAction.EDIT_FORM_CALL_TRACKER,
        ConfirmMessages.CallTrackerNotStarted
      );
    }
  },
  updateWindowSize: (nState, payload) => {
    nState.WindowHeight = payload.height;
    nState.WindowWidth = payload.width;
  },
  copyValuesFromDbObject: (nState, DBCopy) => {
    nState.MasterData.Statuses = DBCopy.MasterData.Statuses;
    nState.MasterData.ChannelTypes = initialState.MasterData.ChannelTypes;
    nState.MasterData.CapDetails = DBCopy.MasterData.CapDetails;
    nState.MasterData.RequestTypes = DBCopy.MasterData.RequestTypes;

    if(nState.MasterData.Statuses && nState.MasterData.Statuses.length) {
      //Hide follow up, since it's applicable only for outbound
      nState.MasterData.Statuses = nState.MasterData.Statuses.filter(x => x.Code != 'FOLLOWUP');
    }
    nState.MasterData.Clients = [];
    DBCopy.MasterData.CapDetails.map((x) => {
      if (!nState.MasterData.Clients.filter((y) => y.Id == x.ClientId).length)
        nState.MasterData.Clients.push({ Id: x.ClientId, Name: x.ClientName });
    });

    nState.SearchParameters.StatusIds = DBCopy.SearchParameters.StatusIds;
    nState.SearchParameters.Channels = DBCopy.SearchParameters.Channels ? DBCopy.SearchParameters.Channels : [];
    if (DBCopy.SearchParameters.FromDate) {
      nState.SearchParameters.FromDate.Value = GetFormattedDateHyphan(
        DBCopy.SearchParameters.FromDate
      );
    }

    if (DBCopy.SearchParameters.ToDate) {
      nState.SearchParameters.ToDate.Value = GetFormattedDateHyphan(
        DBCopy.SearchParameters.ToDate
      );
    }

    if (DBCopy.SearchParameters.AuditIds)
      nState.SearchParameters.AuditIds.Value = DBCopy.SearchParameters.AuditIds;

    if (DBCopy.SearchParameters.ClientId)
      nState.SearchParameters.Client.Value = DBCopy.SearchParameters.ClientId;

    nState.SearchParameters.MaxNoOfDaysToSearch =
      DBCopy.SearchParameters.MaxNoOfDaysToSearch;

    nState.ResultCount = DBCopy?.GridData?.length;

    nState.IsReadOnlyMode = DBCopy.IsReadOnlyMode;
    if (nState.IsReadOnlyMode) {
      nState.SearchParameters.ClientName = nState.MasterData.Clients.find(
        (x) => x.Id == DBCopy.SearchParameters.ClientId
      ).Name;
    }
  },
  updateSearchFieldData: (nState, payload) => {
    switch (payload.field) {
      case FieldNames.FromDate:
      case FieldNames.ToDate:
        if (payload.data === "" || isValidDate(new Date(payload.data)))
          nState.SearchParameters[payload.field].Value = payload.data;
        Validation.validateSearchDates(nState);
        break;
      case FieldNames.AddStatus:
        nState.SearchParameters.StatusIds.push(payload.data.Id);
        break;
      case FieldNames.RemoveStatus:
        nState.SearchParameters.StatusIds =
          nState.SearchParameters.StatusIds.filter((x) => x != payload.data.Id);
        break;
      case FieldNames.AddChannel:
        nState.SearchParameters.Channels.push(payload.data.Code);
        break;
      case FieldNames.RemoveChannel:
        nState.SearchParameters.Channels =
          nState.SearchParameters.Channels.filter((x) => x !== payload.data.Code);
        break;
      case FieldNames.SearchAuditIds:
        if (
          payload.data === "" ||
          RegExPatterns.CommaSeparatedNumberAllowedChar.test(payload.data)
        )
          nState.SearchParameters.AuditIds.Value = payload.data;
        Validation.validateSearchDates(nState);
        break;
      case FieldNames.SearchClient:
        nState.SearchParameters.Client.Value = payload.data;
        break;
      case FieldNames.SearchAuditIds_OnBlur:
        if (nState.SearchParameters.AuditIds.Value) {
          let arrAuditIds = [];
          let splitStr = nState.SearchParameters.AuditIds.Value.split(",");
          if (Util.isValidArray(splitStr)) {
            splitStr.map((x) => {
              //Ignore invalid numbers
              if (Util.isValidString(x) && Util.isValidNumber(x.trim())) {
                //Ignore duplicate id
                if (!arrAuditIds.includes(x.trim())) arrAuditIds.push(x.trim());
              }
            });
          }
          if (Util.isValidArray(arrAuditIds))
            nState.SearchParameters.AuditIds.Value = arrAuditIds.join(", ");
          else nState.SearchParameters.AuditIds = new FieldData();
        }
        Validation.validateSearchDates(nState);
        break;
      default:
        break;
    }
  },
  updateSearchStatus: (nState, payload) => {
    nState.ShowLoader = payload.isSearchInProgress;
    if (payload.resultCount != null) nState.ResultCount = payload.resultCount;
  },

  showToast: (nState, type, content) => {
    nState.Toast.Id = Date.now();
    nState.Toast.Message = { type: type, content: content };
  },
  triggerAction: (nState, action) => {
    nState.ShowLoader = true;
    nState.ActionState.CurrentAction = action;
    nState.ActionState.ActionTriggerId = Date.now();
  },

  updateActiveQueryFields: (nState, payload) => {
    nState.RequestForm.ActiveQuery.HasChanges = true;
    //Restrict '<' & '>' special char
    if (RegExPatterns.SecurityPolicyViolationChars.test(payload.data)) {
      if (
        payload.field === FieldNames.Query ||
        payload.field === FieldNames.Response ||
        payload.field === FieldNames.RequestMode ||
        payload.field === FieldNames.VerifiedUsing
      ) {
        SetValue(nState.RequestForm.ActiveQuery[payload.field], payload.data);

        if (payload.field === FieldNames.RequestMode)
          DataMap.setRequiredFlagForCallerInfo(nState);
      } else if (payload.field === FieldNames.CopyPreviousQuery) {
        let value =
          (nState.RequestForm.ActiveQuery.Query.Value
            ? nState.RequestForm.ActiveQuery.Query.Value + "\n"
            : "") + nState.PreviousQueryDetails.Query;
        SetValue(nState.RequestForm.ActiveQuery.Query, value);
      } else if (payload.field === FieldNames.CopyPreviousResponse) {
        let value =
          (nState.RequestForm.ActiveQuery.Response.Value
            ? nState.RequestForm.ActiveQuery.Response.Value + "\n"
            : "") + nState.PreviousQueryDetails.Response;
        SetValue(nState.RequestForm.ActiveQuery.Response, value);
      } else {
        nState.RequestForm.ActiveQuery[payload.field] = payload.data;
      }
    }
  },

  updateRequestFields: (nState, payload) => {
    //Restrict '<' & '>' special char
    if (RegExPatterns.SecurityPolicyViolationChars.test(payload.data)) {
      if (
        payload.field !== FieldNames.CallNotStartedApprove &&
        payload.field !== FieldNames.IsAddAnother &&
        payload.field !== FieldNames.ShowCurrentCallRequests
      ) {
        nState.RequestForm.HasChanges = true;
      }
      if (payload.field == FieldNames.CapId) {
        SetValue(nState.RequestForm[payload.field], payload.data);
        const filterCapDetail = nState.MasterData.CapDetails.find(
          (cap) => cap.ClientAuditProgramId == payload.data
        );
        nState.RequestForm.ClientId = filterCapDetail?.ClientId;
        nState.RequestForm.AuditProgramId = filterCapDetail?.AuditProgramId;
        Actions.triggerFetchAuditIdDetails(nState);
      } else if (payload.field == FieldNames.AuditId_OnBlur) {
        if (nState.RequestForm.AuditId.Value == "") {
          nState.RequestForm.FlowName = "";
          nState.RequestForm.ProviderName = "";
          nState.RequestForm.PatientName = "";
          nState.RequestForm.ProviderAddress = "";
        }
        Actions.triggerFetchAuditIdDetails(nState);
      } else if (payload.field == FieldNames.IsAddAnother) {
        nState.RequestForm.IsAddAnother = payload.data;
      } else if (payload.field == FieldNames.CallNotStartedApprove) {
        nState.RequestForm.CallNotStartedApprove = payload.data;
      } else if (payload.field === FieldNames.ShowCurrentCallRequests) {
        nState.ShowCurrentCallRequests = payload.data;
        if (nState.ShowCurrentCallRequests) {
          nState.CurrentScreen =
            nState.CurrentScreen == ScreenType.AddForm
              ? ScreenType.AddFormWithHistory
              : nState.CurrentScreen == ScreenType.Grid ||
                nState.CurrentScreen == ScreenType.GridWithCurrentRequests
              ? ScreenType.GridWithCurrentRequests
              : ScreenType.EditFormWithHistory;
        }
      }      
      else if (payload.field === FieldNames.AdditionalAuditId_OnBlur) {
        if (Validation.ValidateAdditionalAuditIds(nState) && nState.RequestForm.AdditionalAuditIds.Value != nState.RequestForm.AdditionalAuditIds.PrevValue) {
            Actions.triggerAction(nState, ActionTypes.VALIDATE_ADDITIONAL_AUDITIDS);
            nState.RequestForm.AdditionalAuditIds.PrevValue = nState.RequestForm.AdditionalAuditIds.Value;
        }
    }
      else {
        if (
          payload.field == FieldNames.AuditId &&
          !(RegExPatterns.NumbersOnly.test(payload.data) || payload.data == "")
        ) {
          return;
        } else if (
          payload.field == FieldNames.CallerNumber &&
          !(
            RegExPatterns.PhoneNoWithExtAllowedChar.test(payload.data) ||
            payload.data == ""
          )
        ) {
          return;
        } else if (
          payload.field == FieldNames.AdditionalAuditIds &&
          !(
            RegExPatterns.CommaSeparatedNumberAllowedChar.test(payload.data) ||
            payload.data == ""
          )
        ) {
          return;
        }


        SetValue(nState.RequestForm[payload.field], payload.data);
      }
    }
  },
  triggerFetchAuditIdDetails: (nState) => {
    if (
      nState.RequestForm.CapId.Value &&
      nState.RequestForm.AuditId.Value &&
      nState.RequestForm.AuditId.Value !== nState.RequestForm.AuditId.PrevValue
    ) {
      Actions.triggerAction(nState, ActionTypes.GET_AUDITID_DETAILS);
    }
    if(nState.RequestForm.AdditionalAuditIds.Value){
      Actions.triggerAction(nState, ActionTypes.VALIDATE_ADDITIONAL_AUDITIDS);
    }
  },
  
  updateAuditIdDetails: (nState, payload) => {
    //Clear audit id related fields
    nState.RequestForm.FlowId = "";
    nState.RequestForm.FlowName = "";
    nState.RequestForm.ProviderName = "";
    nState.RequestForm.PatientName = "";
    nState.RequestForm.ProviderAddress = "";
    nState.RequestForm.AuditId.Error = "";
    nState.RequestForm.AuditId.PrevValue = "";

    if (
      payload.data.IsAuditsExists.IsAuditIdValid &&
      payload.data.IsAuditsExists.IsCapIdValid
    ) {
      nState.RequestForm.AuditId.PrevValue = nState.RequestForm.AuditId.Value;
      nState.RequestForm.FlowId = payload.data.IsAuditsExists.FlowId;
      nState.RequestForm.FlowName = payload.data.IsAuditsExists.FlowName;
      nState.RequestForm.ProviderName = payload.data.ClaimInfo.ProviderName;
      nState.RequestForm.PatientName = payload.data.ClaimInfo.MemberName;
      nState.RequestForm.ProviderAddress =
        payload.data.ClaimInfo.ProviderFullAddress;
    } else if (!payload.data.IsAuditsExists.IsCapIdValid) {
      nState.RequestForm.AuditId.Error =
        "Following Audit id does not belong to the selected Client Audit Program";
    } else if (!payload.data.IsAuditsExists.IsAuditIdValid) {
      nState.RequestForm.AuditId.Error =
        "Following Audit id does not belong to the selected Client";
    }

    //Show audit id validation in toast message
    if (nState.RequestForm.AuditId.Error) {
      Actions.showToast(
        nState,
        ToastTypes.Warning,
        nState.RequestForm.AuditId.Error
      );
    }
  },

  updateActiveQuerySelection: (nState, payload) => {
    if (payload.selectedId) {
      let selectedResponse = nState.RequestForm.QueryDetails.find(
        (x) => x.Id == payload.selectedId
      );

      DataMap.mapActiveQueryStoreData(nState, selectedResponse);
    }
  },
  openFollowUp: (nState, payload) => {
    DataMap.clearActiveQueryStoreData(nState, true, true);
    DataMap.setRequiredFlagForCallerInfo(nState);
  },

  updateConfirmationAction: (nState, payload) => {
    nState.ConfirmationDialog.visible = false;
    if (
      nState.ConfirmationDialog.action ===
        ConfirmationAction.ADD_FORM_CALL_TRACKER ||
      nState.ConfirmationDialog.action ===
        ConfirmationAction.EDIT_FORM_CALL_TRACKER
    ) {
      if (
        nState.ConfirmationDialog.action ===
        ConfirmationAction.EDIT_FORM_CALL_TRACKER
      )
        nState.RequestForm.CallNotStartedApprove = true;

      if (payload) {
        Actions.triggerAction(nState, ActionTypes.START_CALL);
      }
    }
    if(nState.ConfirmationDialog.action === ConfirmationAction.PORTAL_RESOLVE_CONFIRMATION) {
      if (payload) {
        let d = { action : ActionFields.RESOLVED, IsConfirmed: true };
        Actions.initServerCall(nState, d);
      }
    }
  },

  initServerCall: (nState, payload) => {
    if (
      payload.action === ActionFields.SAVE ||
      payload.action === ActionFields.RESOLVED ||
      payload.action === ActionFields.UNRESOLVED ||
      payload.action === ActionFields.NEW_REQUEST
    ) {
      if (Validation.ValidateAction(nState, payload.action)) {
        let requestMode = nState?.RequestForm?.ActiveQuery?.RequestMode?.Value?.toUpperCase();
        if(!payload.IsConfirmed && payload.action === ActionFields.RESOLVED && requestMode == RequestMode.PORTAL ){

          Actions.showConfirmation(nState, ConfirmationAction.PORTAL_RESOLVE_CONFIRMATION, ConfirmMessages.ConfirmToResolved);
        }
        else{
          Actions.triggerAction(nState, payload.action);
        }
      }
    } else if (payload.action === ActionFields.RESET) {
      if (nState.RequestForm.IsAddRequest) {
        DataMap.clearStoreDataForAdd(nState);
      } else {
        DataMap.mapRequestDbDataToStore(
          nState,
          nState.SelectedRequestOriginalData
        );
        nState.CurrentScreen = ScreenType.EditForm;
      }
    } else if (payload.action === ActionTypes.UPDATE_AUDITID_DETAILS) {
      Actions.triggerAction(nState, payload.action);
    } else if (payload.action === ActionTypes.GET_PROVIDER_REQUEST_DETAILS) {
      nState.SelectedRequestId = payload.data;
      Actions.triggerAction(nState, payload.action);
    } else if (payload.action === ActionTypes.STOP_CALL) {
      nState.CallTrackerTime = payload.data.time;
      if (payload.data?.callId) {
        nState.IsAutoCallStop = payload.data.isAutoCallStop;
        nState.CallId = payload.data.callId;
      }
      Actions.triggerAction(nState, payload.action);
    } else if (payload.action === ActionTypes.GET_CALL_HISTORY) {
      nState.CurrentScreen = ScreenType.EditFormWithHistory;
      nState.RequestForm.CallHistory = [];
      nState.ShowCurrentCallRequests = false;
      Actions.triggerAction(nState, payload.action);
    } else Actions.triggerAction(nState, payload.action);
  },

  updateServerCallStatus: (nState, payload) => {
    nState.ShowLoader = false;
    if (!payload.isFailed) {
      if (payload.action === ActionTypes.START_CALL) {
        nState.CallId = payload.data;
        localStorage.setItem("callId", payload.data);
        nState.RequestForm.ActiveQuery.RequestMode = new FieldData("Phone");
        DataMap.setRequiredFlagForCallerInfo(nState);
      } else if (payload.action === ActionTypes.STOP_CALL) {
        nState.CallId = "";
        nState.IsAutoCallStop = false;
        nState.CallNotStartedApprove = false;
        localStorage.removeItem("callId");
        localStorage.removeItem("time");
        DataMap.clearCallerDataForStopCall(nState);
        nState.CurrentCallRequests = [];
        nState.PreviousQueryDetails.Query = "";
        nState.PreviousQueryDetails.Response = "";
        if (nState.ShowCurrentCallRequests) {
          // hide current call requests if call tracker stopped
          nState.ShowCurrentCallRequests = false;
          if (nState.CurrentScreen === ScreenType.EditFormWithHistory)
            nState.CurrentScreen = ScreenType.EditForm;
          else if (nState.CurrentScreen === ScreenType.AddFormWithHistory)
            nState.CurrentScreen = ScreenType.AddForm;
        }
      } else if (payload.action === ActionTypes.GET_AUDITID_DETAILS) {
        Actions.updateAuditIdDetails(nState, payload);
      } else if (payload.action === ActionTypes.GET_PROVIDER_REQUEST_DETAILS) {
        nState.SelectedRequestOriginalData = Util.cloneObject(payload.data);
        DataMap.mapRequestDbDataToStore(nState, payload.data);
        Actions.confirmCallNotStarted(nState);
        if (nState.CurrentScreen === ScreenType.EditFormWithHistory)
          nState.CurrentScreen = ScreenType.EditFormWithHistory;
        else nState.CurrentScreen = ScreenType.EditForm;
        nState.RequestForm.HasChanges = false;
      } else if (payload.action === ActionTypes.GET_CALL_HISTORY) {
        nState.RequestForm.CallHistory = payload.data;
      } else if (
        payload.action === ActionFields.SAVE ||
        payload.action === ActionFields.RESOLVED ||
        payload.action === ActionFields.UNRESOLVED ||
        payload.action === ActionFields.NEW_REQUEST
      ) {
        if (
          nState.CallId !== "" &&
          nState.RequestForm.ActiveQuery.ShowEditCard
        ) {
          nState.PreviousQueryDetails.Query =
            nState.RequestForm.ActiveQuery.Query.Value;
          nState.PreviousQueryDetails.Response =
            nState.RequestForm.ActiveQuery.Response.Value;
        }
        Actions.showToast(
          nState,
          ToastTypes.Success,
          nState.CurrentScreen === ScreenType.AddForm ||
            nState.CurrentScreen === ScreenType.AddFormWithHistory
            ? "Request created successfully"
            : "Changes saved successfully"
        );
        nState.SelectedRequestOriginalData = Util.cloneObject(payload.data);
        DataMap.addToCurrentCallRequests(nState, payload.data);

        nState.GridDataLoadingId = Date.now();
        DataMap.mapCallerDataTOStore(nState, payload.data);
        if (!nState.RequestForm.IsAddAnother) {
          DataMap.mapRequestDbDataToStore(nState, payload.data);
        } else if (nState.RequestForm.IsAddAnother || nState.CallId !== "") {
          DataMap.clearStoreDataForAdd(nState);
        }
      } else if (payload.action === ActionTypes.EXPORT) {
        if (!payload.hasData) {
          Actions.showToast(
            nState,
            ToastTypes.Warning,
            "No data available to export."
          );
        }
      } else if (payload.action === ActionTypes.VALIDATE_ADDITIONAL_AUDITIDS) {
        Validation.ValidateAuditStatus(nState, payload.data, nState.RequestForm.AdditionalAuditIds);
    }
    } else {
      if (payload.action === ActionTypes.START_CALL) {
        nState.CallId = "";
      }
      Actions.showToast(
        nState,
        ToastTypes.Error,
        "An unexpected error has occurred. Please contact support team."
      );
    }
  },
};

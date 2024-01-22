import axios from "axios";
import { GetFormattedFileName } from "../../Common/Actions/DateHandler";
import { Util } from "../../Common/Actions/Util";
import { ActionFields, ActionTypes } from "./Constants";
import { DataMap } from "./DataMap";

export const ServerCalls = {
  triggerAjax: (state, dispatch) => {
    if (
      state.ActionState.CurrentAction === ActionFields.SAVE ||
      state.ActionState.CurrentAction === ActionFields.UNRESOLVED ||
      state.ActionState.CurrentAction === ActionFields.RESOLVED ||
      state.ActionState.CurrentAction === ActionFields.NEW_REQUEST
    ) {
      ServerCalls.saveProviderRequest(state, dispatch);
    } else if (state.ActionState.CurrentAction === ActionTypes.GET_CALL_HISTORY)
      ServerCalls.getCallHistory(state, dispatch);
    else if (state.ActionState.CurrentAction === ActionTypes.START_CALL)
      ServerCalls.startCall(state, dispatch);
    else if (state.ActionState.CurrentAction === ActionTypes.STOP_CALL)
      ServerCalls.stopCall(state, dispatch);
    else if (
      state.ActionState.CurrentAction === ActionTypes.GET_AUDITID_DETAILS
    )
      ServerCalls.getAuditIdDetails(state, dispatch);
    else if (
      state.ActionState.CurrentAction ===
      ActionTypes.GET_PROVIDER_REQUEST_DETAILS
    )
      ServerCalls.getProviderRequestDetails(state.SelectedRequestId, dispatch);
    else if (state.ActionState.CurrentAction === ActionTypes.EXPORT)
      ServerCalls.export(state, dispatch);
      else if (state.ActionState.CurrentAction === ActionTypes.VALIDATE_ADDITIONAL_AUDITIDS)
        ServerCalls.validateAdditionalAuditIdsDetails(state, dispatch);
  },

  getApiRootUrl: () => {
    //For Production mode ApiRootUrl should be empty
    //For debug of react set ApiRootUrl in index.html
    return window.ApiRootUrl ? window.ApiRootUrl : "";
  },

  getProviderRequestDetails: (requestId, dispatch) => {
    let urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/GetProviderRequestById?requestId=${requestId}`;

    ServerCalls.getData(
      urlString,
      dispatch,
      ActionTypes.GET_PROVIDER_REQUEST_DETAILS
    );
  },
  export: (state, dispatch) => {
    let urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/Export`;
    let data = {
      FromDate: state.SearchParameters.FromDate.Value,
      ToDate: state.SearchParameters.ToDate.Value,
      StatusIds: state.SearchParameters.StatusIds,
      Channels: state.SearchParameters.Channels?.join(","),
      ClientId: state.SearchParameters.Client.Value,
      AuditIds: state.SearchParameters.AuditIds.Value,
    };
    axios
      .post(urlString, data, {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(
        (response) => {
          let dispatchData = {
            type: ActionTypes.UPDATE_SERVERCALLSTATUS,
            payload: { action: ActionTypes.EXPORT, isFailed: false },
          };
          if (response.status === 204) {
            //No data available to export
            dispatchData.payload.hasData = false;
          } else {
            const type = response.headers["content-type"];
            const blob = new Blob([response.data], {
              type: type,
              encoding: "UTF-8",
            });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = GetFormattedFileName("ProviderRequest_", ".xlsx");
            link.click();
            dispatchData.payload.hasData = true;
          }
          dispatch(dispatchData);
        },
        (error) => {
          console.error(error);
          dispatch({
            type: ActionTypes.UPDATE_SERVERCALLSTATUS,
            payload: { action: ActionTypes.EXPORT, isFailed: true },
          });
        }
      );
  },
  getCallHistory: (state, dispatch) => {
    const requestId = state.SelectedRequestOriginalData.Id;
    let urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/GetCallHistory?requestId=${requestId}`;

    ServerCalls.getData(urlString, dispatch, ActionTypes.GET_CALL_HISTORY);
  },
  saveProviderRequest: (state, dispatch) => {
    let urlString;
    if (state.RequestForm.IsAddRequest) {
      urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/Save`;
    } else {
      urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/Update`;
    }

    const data = DataMap.mapStoreDataToDb(state);

    ServerCalls.postData(
      urlString,
      data,
      dispatch,
      state.ActionState.CurrentAction
    );
  },
  startCall: function (state, dispatch) {
    const urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/StartCall`;
    /* For localhost development uncomment below line and comment above line */
    // const urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/StartCall?attendedBy=raths1`;

    ServerCalls.postData(urlString, {}, dispatch, ActionTypes.START_CALL);
  },

  stopCall: function (state, dispatch) {
    const urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/StopCall?callId=${
      state.CallId
    }&callTime=${state.CallTrackerTime}`;
    ServerCalls.postData(urlString, {}, dispatch, ActionTypes.STOP_CALL);
  },

  getAuditIdDetails: function (state, dispatch) {
    const urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/GetAuditIdDetails?capId=${
      state.RequestForm.CapId.Value
    }&auditId=${state.RequestForm.AuditId.Value}`;

    ServerCalls.getData(urlString, dispatch, ActionTypes.GET_AUDITID_DETAILS);
  },
  
  validateAdditionalAuditIdsDetails: (state, dispatch) => {   
    let urlString = `${ServerCalls.getApiRootUrl()}/ProviderRequest/ValidateAddtionalAuditIds`;
    let data = {
        capId: state.RequestForm.CapId.Value,
        auditIds: state.RequestForm.AdditionalAuditIds.Value
    };
    ServerCalls.postData(urlString, data, dispatch, ActionTypes.VALIDATE_ADDITIONAL_AUDITIDS);        
},


  successResponseHandler: (response, dispatch, action) => {
    let dispatchData = {
      type: ActionTypes.UPDATE_SERVERCALLSTATUS,
      payload: { action },
    };

    //If success status code returned with submit ticket response, then dispatch failed status
    if (
      response.data &&
      Util.isValidString(response.data) &&
      response.data.includes('action="/Errors/SupportTicket"') //Yet to find proper way to identify submit ticket response
    ) {
      console.error(response);
      dispatchData.payload.isFailed = true;
    } else {
      dispatchData.payload.data = response.data;
    }

    dispatch(dispatchData);
  },

  getData: (url, dispatch, action) => {
    axios.get(url).then(
      (response) => {
        ServerCalls.successResponseHandler(response, dispatch, action);
      },
      (error) => {
        console.error(error);
        dispatch({
          type: ActionTypes.UPDATE_SERVERCALLSTATUS,
          payload: { action, isFailed: true },
        });
      }
    );
  },
  postData: (url, requestData = {}, dispatch, action) => {
    axios.post(url, requestData).then(
      (response) => {
        ServerCalls.successResponseHandler(response, dispatch, action);
      },
      (error) => {
        console.error(error);
        dispatch({
          type: ActionTypes.UPDATE_SERVERCALLSTATUS,
          payload: { action, isFailed: true },
        });
      }
    );
  },
};

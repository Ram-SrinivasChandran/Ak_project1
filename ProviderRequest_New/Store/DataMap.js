import FieldData from "../../Common/Actions/FieldData";
import { Util } from "../../Common/Actions/Util";
import { ActionFields, RequestMode, Status, RequestTypeCode } from "./Constants";

export const DataMap = {
  clearStoreDataForAdd: (nState) => {
    nState.RequestForm.IsAddRequest = true;
    nState.RequestForm.RequestId = "";
    nState.RequestForm.RequestTypeId = new FieldData("");
    nState.RequestForm.CallerName =
      !nState.RequestForm.IsAddAnother && nState.CallId === ""
        ? new FieldData()
        : new FieldData(nState.CallerInformation.CallerName.Value);
    nState.RequestForm.CallerNumber =
      !nState.RequestForm.IsAddAnother && nState.CallId === ""
        ? new FieldData()
        : new FieldData(nState.CallerInformation.CallerNumber.Value);
    nState.RequestForm.OutreachContact =
      !nState.RequestForm.IsAddAnother && nState.CallId === ""
        ? new FieldData()
        : new FieldData(nState.CallerInformation.OutreachContact.Value);
    nState.RequestForm.RequesterMail =
      !nState.RequestForm.IsAddAnother && nState.CallId === ""
        ? new FieldData()
        : new FieldData(nState.CallerInformation.RequesterMail.Value);

    nState.RequestForm.CapId = new FieldData(null);
    nState.RequestForm.ClientId = "";
    nState.RequestForm.AuditProgramId = "";
    nState.RequestForm.AuditId = new FieldData("");
    nState.RequestForm.AdditionalAuditIds = new FieldData("");
    nState.RequestForm.FlowName = "";
    nState.RequestForm.FlowId = "";
    nState.RequestForm.ProviderName = "";
    nState.RequestForm.PatientName = "";
    nState.RequestForm.ProviderAddress = "";
    nState.RequestForm.StatusId = "";
    nState.RequestForm.StatusCode = "";
    nState.RequestForm.ChannelCode = "";
    nState.RequestForm.StatusName = "";
    nState.RequestForm.ChannelName = "";
    nState.RequestForm.StartedAt = new Date();
    nState.RequestForm.HasChanges = false;
    nState.RequestForm.IsReadOnly = false;
    nState.RequestForm.QueryDetails = [];
    nState.RequestForm.RequestTypeCode = "";
    DataMap.clearActiveQueryStoreData(nState, true);
    nState.RequestForm.IsAddAnother = false;

    DataMap.setRequiredFlagForCallerInfo(nState);
  },

  clearActiveQueryStoreData: (
    nState,
    showEditCard = false,
    isFollowUp = false
  ) => {
    nState.RequestForm.ActiveQuery = {
      ShowEditCard: showEditCard,
      IsFollowUp: isFollowUp,
      HasChanges: false,
      DisableQueryWindow: false,
      Id: "",
      AttendedAt: "",
      AttendedBy: "",
      AttendedByFullName: "",
      Query: new FieldData(""),
      Response: new FieldData(""),
      UpdatedBy: "",
      UpdatedByFullName: "",
      UpdatedAt: "",
      RequestMode: new FieldData("Phone"),
      VerifiedUsing:
        !nState.RequestForm.IsAddAnother && nState.CallId === ""
          ? new FieldData()
          : new FieldData(nState.CallerInformation.VerifiedUsing.Value)
    };
  },
  mapActiveQueryStoreData: (nState, responseData) => {
    nState.RequestForm.ActiveQuery = {
      ShowEditCard: true,
      HasChanges: false,
      Id: responseData.Id,
      AttendedAt: responseData.AttendedAt,
      AttendedBy: responseData.AttendedBy,
      AttendedByFullName: responseData.AttendedByFullName,
      Query: new FieldData(responseData.Query),
      Response: new FieldData(responseData.Response),
      UpdatedBy: responseData.UpdatedBy,
      UpdatedByFullName: responseData.UpdatedByFullName,
      UpdatedAt: responseData.UpdatedAt,      
      RequestMode: new FieldData(responseData.RequestMode),
      VerifiedUsing: new FieldData(responseData.VerifiedUsing),
      DisableQueryWindow: new FieldData(responseData.Query) ? true: false, 
    };
  },
  setRequiredFlagForCallerInfo: (nState) => {
    nState.RequestForm.CallerNumber.Error = "";
    nState.RequestForm.RequesterMail.Error = "";
    nState.RequestForm.IsCallerNumberRequired = false;
    nState.RequestForm.IsEmailRequired = false;
    nState.RequestForm.IsVerifiedUsingRequired = true;
    nState.RequestForm.IsResponseRequired = true;

    const setFlag = (nState, requestMode) => {
      if (requestMode === RequestMode.PHONE) {
        nState.RequestForm.IsCallerNumberRequired = true;
      } else if (requestMode === RequestMode.EMAIL) {
        nState.RequestForm.IsEmailRequired = true;
      } else if (requestMode === RequestMode.VOICEMAIL) {
        nState.RequestForm.IsVerifiedUsingRequired = false;
        nState.RequestForm.IsResponseRequired = false;
        nState.RequestForm.ActiveQuery.VerifiedUsing.Error = "";
        nState.RequestForm.ActiveQuery.Response.Error = "";
      }
    };

    if (nState.RequestForm.ActiveQuery.ShowEditCard) {
      setFlag(
        nState,
        nState.RequestForm.ActiveQuery.RequestMode.Value.toUpperCase()
      );
    }

    if (!nState.RequestForm.IsAddRequest && nState.RequestForm.QueryDetails) {
      nState.RequestForm.QueryDetails.map((x) => {
        setFlag(nState, x.RequestMode?.toUpperCase());
      });
    }
  },
  mapRequestDbDataToStore: (nState, requestData) => {
    if (Util.isValidObject(requestData)) {
      nState.RequestForm.IsAddRequest = false;
      nState.RequestForm.RequestId = requestData.Id;
      nState.RequestForm.RequestTypeId = new FieldData(
        requestData.RequestTypeId
      );
      nState.RequestForm.CallerName = new FieldData(requestData.CallerName);
      nState.RequestForm.CallerNumber = new FieldData(requestData.CallerNumber);
      nState.RequestForm.OutreachContact = new FieldData(
        requestData.OutreachContact
      );
      nState.RequestForm.RequesterMail = new FieldData(
        requestData.RequesterEmailId
      );
      nState.RequestForm.CapId = new FieldData(requestData.CapId);
      nState.RequestForm.ClientId = requestData.ClientId;
      nState.RequestForm.AuditProgramId = requestData.AuditProgramId;
      nState.RequestForm.AuditId = new FieldData(requestData.AuditId);
      nState.RequestForm.AdditionalAuditIds = new FieldData(requestData.AdditionalAuditIds);
      nState.RequestForm.FlowName = requestData.FlowName;
      nState.RequestForm.FlowId = requestData.FlowId;
      nState.RequestForm.ProviderName = requestData.ProviderName;
      nState.RequestForm.PatientName = requestData.MemberName;
      nState.RequestForm.ProviderAddress = requestData.ProviderFullAddress;
      nState.RequestForm.StatusId = requestData.StatusId;
      nState.RequestForm.StatusCode = requestData.StatusCode;
      nState.RequestForm.StatusName = requestData.StatusName;
      nState.RequestForm.ChannelCode = requestData.ChannelCode;
      nState.RequestForm.ChannelName = requestData.ChannelName;
      nState.RequestForm.StartedAt = new Date();
      nState.RequestForm.IsAddAnother = false;
      nState.RequestForm.HasChanges = false;
      nState.RequestForm.RequestTypeCode = requestData.RequestTypeCode;
      nState.RequestForm.IsReadOnly =
        nState.IsReadOnlyMode ||
        requestData.StatusCode.toUpperCase() === Status.RESOLVED ||
        requestData.StatusCode.toUpperCase() === Status.AUTORESOLVED;

      nState.RequestForm.QueryDetails = [];
      if (Util.isValidArray(requestData.ProviderRequestResponseDetails)) {
        requestData.ProviderRequestResponseDetails.map((res) => {
          nState.RequestForm.QueryDetails.push(
            DataMap.mapResponseDbDataToStore(res)
          );
        });
      }

      DataMap.clearActiveQueryStoreData(nState);
    }
    DataMap.setRequiredFlagForCallerInfo(nState);
  },
  mapResponseDbDataToStore: (responseData) => {
    let responseObj = {
      Id: responseData.Id,
      AttendedAt: responseData.AttendedAt,
      AttendedBy: responseData.AttendedBy,
      AttendedByFullName: responseData.AttendedByFullName,
      Query: responseData.Query,
      Response: responseData.Response,
      UpdatedBy: responseData.UpdatedBy,
      UpdatedByFullName: responseData.UpdatedByFullName,
      UpdatedAt: responseData.UpdatedAt,
      VerifiedUsing: responseData.VerifiedUsing,
      RequestMode: responseData.RequestMode,
      NotificationStatus: responseData.NotificationStatus,
      NotifiedAt: responseData.NotifiedAt,
      RequestDataJson: responseData.RequestDataJson,
    };

    return responseObj;
  },

  mapStoreDataToDb: (state) => {
    let statusId;
    let requestTypeName;
    if (state.ActionState.CurrentAction === ActionFields.SAVE) {
      statusId = state.RequestForm.StatusId;
    } else {
      statusId = state.MasterData.Statuses.find(
        (status) => status.Code === state.ActionState.CurrentAction
      ).Id;
    }

    if(state.RequestForm.RequestTypeId.Value && state.MasterData.RequestTypes) {
        let reqTypeObj = state.MasterData.RequestTypes.find(x => x.Id === state.RequestForm.RequestTypeId.Value);
        if(reqTypeObj) {
          requestTypeName = reqTypeObj.Name;
        }
    }

    let activeResponse = [];
    if (state.RequestForm.ActiveQuery.ShowEditCard) {

      const obj = {
        Id: state.RequestForm.ActiveQuery.Id,
        Query: state.RequestForm.ActiveQuery.Query.Value,
        Response: state.RequestForm.ActiveQuery.Response.Value,
        VerifiedUsing: state.RequestForm.ActiveQuery.VerifiedUsing.Value,
        ProviderCall_Id: state.CallId,
        RequestMode: state.RequestForm.ActiveQuery.RequestMode.Value,
        StartedAt: state.RequestForm.StartedAt,
        EndedAt: new Date(),
      };

      if(state.RequestForm.RequestTypeCode == RequestTypeCode.ADDRESS_CHANGE_REQUEST && 
        obj.RequestMode.toUpperCase() == RequestMode.PORTAL) {
        obj.RequestDataJson = state.RequestForm.QueryDetails[0].RequestDataJson;
      }

      activeResponse.push(obj);
    }

    let data = {
      Id: state.RequestForm.RequestId,
      ClientId: state.RequestForm.ClientId,
      AuditProgramId: state.RequestForm.AuditProgramId,
      CapId: state.RequestForm.CapId.Value,
      FlowId: state.RequestForm.FlowId,
      CallerNumber: state.RequestForm.CallerNumber.Value,
      CallerName: state.RequestForm.CallerName.Value,
      RequesterEmailId: state.RequestForm.RequesterMail.Value,
      OutreachContact: state.RequestForm.OutreachContact.Value,
      AuditId: state.RequestForm.AuditId.Value,
      RequestTypeId: state.RequestForm.RequestTypeId.Value,
      RequestTypeCode: state.RequestForm.RequestTypeCode,
      RequestTypeName: requestTypeName,
      StatusId: statusId,
      ProviderRequestResponseDetails: activeResponse,
      StatusCode: state.ActionState.CurrentAction,
      AdditionalAuditIds: state.RequestForm.AdditionalAuditIds.Value
    };

    return data;
  },

  mapCallerDataTOStore: (nState, callerData) => {
    nState.CallerInformation.CallerName = new FieldData(callerData.CallerName);
    nState.CallerInformation.CallerNumber = new FieldData(
      callerData.CallerNumber
    );
    nState.CallerInformation.OutreachContact = new FieldData(
      callerData.OutreachContact
    );
    nState.CallerInformation.RequesterMail = new FieldData(
      callerData.RequesterEmailId
    );
    nState.CallerInformation.VerifiedUsing = new FieldData(
      nState.RequestForm.ActiveQuery.VerifiedUsing.Value
    );
  },

  addToCurrentCallRequests: (nState, savedData) => {
    let updateRequetResponse;
    if (nState.callId !== "") {
      if (nState.RequestForm.IsAddRequest) {
        updateRequetResponse = savedData.ProviderRequestResponseDetails[0];
      } else if (nState.RequestForm.ActiveQuery.ShowEditCard) {
        if (nState.RequestForm.ActiveQuery.Id) {
          updateRequetResponse = savedData.ProviderRequestResponseDetails.find(
            (x) => x.Id == nState.RequestForm.ActiveQuery.Id
          );

          nState.CurrentCallRequests = nState.CurrentCallRequests.filter(
            (request) => request.Id !== nState.RequestForm.ActiveQuery.Id
          );
        } else {
          const oldIds = nState.RequestForm.QueryDetails.map((x) => x.Id);
          updateRequetResponse = savedData.ProviderRequestResponseDetails.find(
            (x) => !oldIds.includes(x.Id)
          );
        }
      }

      if (updateRequetResponse) {
        nState.CurrentCallRequests.push({
          ...updateRequetResponse,
          RequestId: savedData.Id,
          RequestTypeName: savedData.RequestTypeName,
        });
      }
    }
  },
  clearCallerDataForStopCall: (nState) => {
    nState.CallerInformation.CallerName = new FieldData("");
    nState.CallerInformation.CallerNumber = new FieldData("");
    nState.CallerInformation.OutreachContact = new FieldData("");
    nState.CallerInformation.RequesterMail = new FieldData("");
    nState.CallerInformation.VerifiedUsing = new FieldData("");
    nState.CallTrackerTime = "";
  },
};

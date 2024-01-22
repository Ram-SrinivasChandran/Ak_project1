export const ScreenType = {
  Grid: "Grid",
  AddForm: "AddForm",
  AddFormWithHistory: "AddFormWithHistory",
  EditForm: "EditForm",
  EditFormWithHistory: "EditFormWithHistory",
  GridWithCurrentRequests: "GridWithCurrentRequests",
};

export const ActionTypes = {
  INIT_APP: "INIT_APP",
  INIT_CONNECTED: "INIT_CONNECTED",
  UPDATE_SCREENSTATE: "UPDATE_SCREENSTATE",
  UPDATE_WINDOWSIZE: "UPDATE_WINDOWSIZE",

  UPDATE_SEARCH_FIELDVALUE: "UPDATE_SEARCH_FIELDVALUE",
  UPDATE_RESPONSEDATA_FIELDVALUE: "UPDATE_RESPONSEDATA_FIELDVALUE",
  ON_SEARCH_CLICK: "ON_SEARCH_CLICK",
  UPDATES_SEARCHSTATUS: "UPDATES_SEARCHSTATUS",
  VALIDATE_SEARCHDATES: "VALIDATE_SEARCHDATES",
  UPDATE_EDIT_SELECTION: "UPDATE_EDIT_SELECTION",
  OPEN_FOLLOWUP: "OPEN_FOLLOWUP",

  UPDATE_ACTIVE_QUERY: "UPDATE_ACTIVE_QUERY",
  UPDATE_ACTIVEQUERY_SELECTION: "UPDATE_ACTIVEQUERY_SELECTION",
  UPDATE_REQUEST_FIELD: "UPDATE_REQUEST_FIELD",
  GET_PROVIDER_REQUEST_DETAILS: "GET_PROVIDER_REQUEST_DETAILS",

  START_CALL: "START_CALL",
  STOP_CALL: "STOP_CALL",
  GET_CALL_HISTORY: "GET_CALL_HISTORY",
  SAVE_PROVIDER_REQUEST: "SAVE_PROVIDER_REQUEST",
  INIT_SERVERCALL: "INIT_SERVERCALL",
  GET_AUDITID_DETAILS: "GET_AUDITID_DETAILS",
  UPDATE_SERVERCALLSTATUS: "UPDATE_SERVERCALLSTATUS",
  UPDATE_CONFIRMATION_ACTION: "UPDATE_CONFIRMATION_ACTION",
  EXPORT: "EXPORT",
  VALIDATE_ADDITIONAL_AUDITIDS: "VALIDATE_ADDITIONAL_AUDITIDS",
};

export const ActionFields = {
  SAVE: "SAVE",
  RESET: "RESET",
  RESOLVED: "RESOLVED",
  UNRESOLVED: "UNRESOLVED",
  NEW_REQUEST: "NEW",
};

export const FieldNames = {
  //Grid Serach fields
  FromDate: "FromDate",
  ToDate: "ToDate",
  AddStatus: "AddStatus",
  RemoveStatus: "RemoveStatus",
  AddChannel: "AddChannel",
  RemoveChannel: "RemoveChannel",
  RequestId: "RequestId",
  SearchClient: "SearchClient",
  SearchAuditIds: "SearchAuditIds",
  SearchAuditIds_OnBlur: "SearchAuditIds_OnBlur",

  //Request entry fields
  AddAnother: "AddAnother",

  //Service Request
  AuditId: "AuditId",
  AuditId_OnBlur: "AuditId_OnBlur",
  AdditionalAuditId_OnBlur: "AdditionalAuditId_OnBlur",
  AdditionalAuditIds:"AdditionalAuditIds",
  RequesterMail: "RequesterMail",
  OutreachContact: "OutreachContact",
  CallerNumber: "CallerNumber",
  CallerName: "CallerName",
  RequestTypeId: "RequestTypeId",
  AuditProgramId: "AuditProgramId",
  ClientId: "ClientId",
  CapId: "CapId",
  StatusId: "StatusId",
  ChannelCode: "ChannelCode",
  IsAddAnother: "IsAddAnother",
  CallNotStartedApprove: "CallNotStartedApprove",
  
  //Active Query Details
  Query: "Query",
  Response: "Response",
  RequestMode: "RequestMode",
  VerifiedUsing: "VerifiedUsing",
  CopyPreviousQuery: "CopyPreviousQuery",
  CopyPreviousResponse: "CopyPreviousResponse",

  ShowCurrentCallRequests: "ShowCurrentCallRequests",
};

export const RequestMode = {
  PHONE: "PHONE",
  PORTAL: "PORTAL",
  EMAIL: "EMAIL",
  VOICEMAIL: "VOICEMAIL",
};

export const Status = {
  NEW: "NEW",
  UNRESOLVED: "UNRESOLVED",
  RESOLVED: "RESOLVED",
  AUTORESOLVED: "AUTORESOLVED",
};

export const ConfirmationAction = {
  ADD_FORM_CALL_TRACKER: "ADD_FORM_CALL_TRACKER",
  EDIT_FORM_CALL_TRACKER: "EDIT_FORM_CALL_TRACKER",
  PORTAL_RESOLVE_CONFIRMATION: "PORTAL_RESOLVE_CONFIRMATION",
};

export const RequestTypeCode = {
  ADDRESS_CHANGE_REQUEST: "ACR"
};

export const RequestModeIcon = {
  get: (mode) => {
    if (mode.toUpperCase() === RequestMode.EMAIL) {
      return "/content/images/Email.png";
    } else if (mode.toUpperCase() === RequestMode.PORTAL) {
      return "/content/images/Portal.png";
    } else if (mode.toUpperCase() === RequestMode.VOICEMAIL) {
      return "/content/images/voicemail.png";
    } else {
      return "/content/images/Phone.png";
    }
  },
};

export const ConfirmMessages = {
  CallTrackerNotStarted:"Call Tracker not started. Do you want to start a new Call?",
  ConfirmToResolved:"This response will be notified to Provider via email. Are You Sure to Resolve?",
};
export const ErrorMessages={
  InvalidClient: "Following Audit id(s) does not belong to the selected Client: ",
  InvalidCAPS: "Following Audit id(s) does not belong to the selected Client Audit Program: ",
  ServerError: "Audit ids validation failed", 
  AdditionalAuditIdNotValid: "Please enter valid additional audit ids",
};
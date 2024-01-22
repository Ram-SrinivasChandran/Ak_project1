import React, { Component } from "react";
import { connect } from "react-redux";
import {
  ActionTypes,
  ScreenType,
  FieldNames,
  ActionFields,
  Status,
  RequestMode,
} from "../Store/Constants";
import RequestCardEdit from "./RequestCardEdit";
import RequestCard from "./RequestCard";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { Query } from "@syncfusion/ej2-data";
import { SetErrorClass, SetErrorTitle } from "../../Common/Actions/FieldData";

class RequestForm extends Component {
  constructor() {
    super(...arguments);
    this.getPanelStyle = this.getPanelStyle.bind(this);

    this.callerNameRef = React.createRef();
    this.requestDetailsRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.RequestForm.CapId.Value !== prevProps.RequestForm.CapId.Value
    ) {
      if (!this.props.RequestForm.CapId.Value) {
        this.dropDownListObject.value = null;
      } else {
        this.dropDownListObject.value = this.props.RequestForm.CapId.Value;
      }
    }

    if (
      prevProps.CurrentScreen !== this.props.CurrentScreen &&
      (this.props.CurrentScreen === ScreenType.AddForm ||
        this.props.CurrentScreen === ScreenType.EditForm)
    ) {
      this.callerNameRef.current.scrollTop = 0;
    }
  }

  getPanelStyle() {
    let objStyle = { width: "0", marginRight: "0px" };
    if (
      this.props.CurrentScreen == ScreenType.AddForm ||
      this.props.CurrentScreen == ScreenType.EditForm
    )
      objStyle = { width: "60.5%", marginRight: "20px" };
    else if (
      this.props.CurrentScreen == ScreenType.AddFormWithHistory ||
      this.props.CurrentScreen == ScreenType.EditFormWithHistory
    )
      objStyle = { width: "54%", marginRight: "45%" };

    return objStyle;
  }

  openFollowUp = () => {
    if (
      !this.props.ActiveQuery.HasChanges ||
      window.confirm("Current Changes will be lost. Are you sure to proceed?")
    ) {
      this.props.openFollowUp();
    }
  };

  onCloseRequestForm = () => {
    if (
      !this.props.RequestForm.HasChanges ||
      window.confirm("Current Changes will be lost. Are you sure to proceed?")
    ) {
      this.props.updateScreenState(ScreenType.Grid);
    }
  };

  render() {
    let {
      MasterData,
      ActiveQuery,
      RequestForm,
      updateRequestField,
      queryDetails,
    } = this.props;
    let requestMode =
      this.props.RequestForm?.ActiveQuery?.RequestMode?.Value?.toUpperCase();

    const disableActions =
      RequestForm.StatusCode.toUpperCase() === Status.RESOLVED ||
      RequestForm.StatusCode.toUpperCase() === Status.AUTORESOLVED;

    const inputDisabled = RequestForm.IsReadOnly;

    return (
      <div id="rightPane_psq_view_details" style={this.getPanelStyle()}>
        <div className="sticky_head col-md-12 p0">
          <div
            className={
              RequestForm.IsAddRequest ? "col-md-12 pad10" : "col-md-4 pad10"
            }
          >
            <p className="serv-titlepsq">
              <strong>
                {RequestForm.IsAddRequest
                  ? `Add New Request`
                  : `Request Detailed View`}
              </strong>
              {RequestForm.IsAddRequest && (
                <span
                  className="rightCloseBtn_add closebtn_add closeicon glyphicon glyphicon-remove-circle pull-right"
                  onClick={this.onCloseRequestForm}
                ></span>
              )}
            </p>
          </div>
          {!RequestForm.IsAddRequest && (
            <>
              <div className="col-md-5 bgclip">
                <div className="reqid">
                  Request # {RequestForm?.RequestId}
                  <span
                    className={`requestStatus ${
                      RequestForm?.StatusCode === "NEW"
                        ? "statusNew"
                        : RequestForm?.StatusCode === "UNRESOLVED"
                        ? "statusWIP"
                        : RequestForm?.StatusCode === "REOPENED"
                        ? "statusReopen"
                        : "statusRes"
                    }
                    `}
                  >
                    {RequestForm?.StatusName}
                  </span>
                </div>
              </div>
              <div className="col-md-3 pad10">
                <p className="followupbtn">
                  {!this.props.RequestForm.IsReadOnly ? (
                    requestMode !== RequestMode.PORTAL ? (
                      <span
                        className="followupssection"
                        onClick={this.openFollowUp}
                      >
                        <img src="/content/images/Followup.png" alt="" /> Add
                        Follow up
                      </span>
                    ) : null
                  ) : null}
                  <span
                    onClick={this.onCloseRequestForm}
                    className="rightCloseBtn_view closeicon glyphicon glyphicon-remove-circle pull-right"
                  ></span>
                </p>
              </div>
            </>
          )}
        </div>
        <div className="col-md-12 p0">
          <div
            className="col-md-4 view_form_elements"
            style={{
              height: RequestForm.IsReadOnly
                ? this.props.WindowHeight - 257
                : this.props.WindowHeight - 306,
            }}
            ref={this.callerNameRef}
          >
            <div className="seg_section seg_section_bdr">
              <h4 className="seg_title">Caller Information</h4>
              <div className="form-group">
                <label>Caller Name*</label>
                <input
                  type="text"
                  value={RequestForm?.CallerName.Value}
                  maxLength={100}
                  title={SetErrorTitle(RequestForm.CallerName)}
                  className={SetErrorClass(RequestForm.CallerName)}
                  onChange={(e) =>
                    updateRequestField(FieldNames.CallerName, e.target.value)
                  }
                  disabled={inputDisabled}
                ></input>
              </div>
              <div className="form-group">
                <label>
                  Caller Number
                  {RequestForm.IsCallerNumberRequired ? "*" : ""}
                </label>
                <input
                  type="text"
                  value={RequestForm?.CallerNumber.Value}
                  placeholder="Phone"
                  maxLength={50}
                  title={SetErrorTitle(RequestForm.CallerNumber)}
                  className={SetErrorClass(RequestForm.CallerNumber)}
                  onChange={(e) =>
                    updateRequestField(FieldNames.CallerNumber, e.target.value)
                  }
                  disabled={inputDisabled}
                ></input>
              </div>
              <div className="form-group">
                <label>Outreach Contact</label>
                <input
                  type="text"
                  value={RequestForm?.OutreachContact.Value}
                  placeholder="Email or Phone"
                  maxLength={100}
                  title={SetErrorTitle(RequestForm.OutreachContact)}
                  className={SetErrorClass(RequestForm.OutreachContact)}
                  onChange={(e) =>
                    updateRequestField(
                      FieldNames.OutreachContact,
                      e.target.value
                    )
                  }
                  disabled={inputDisabled}
                ></input>
              </div>
              <div className="form-group">
                <label>
                  Requester Email
                  {RequestForm.IsEmailRequired ? "*" : ""}
                </label>
                <input
                  type="text"
                  value={RequestForm?.RequesterMail.Value}
                  placeholder="Email"
                  maxLength={100}
                  title={SetErrorTitle(RequestForm.RequesterMail)}
                  className={SetErrorClass(RequestForm.RequesterMail)}
                  onChange={(e) =>
                    updateRequestField(FieldNames.RequesterMail, e.target.value)
                  }
                  disabled={inputDisabled}
                ></input>
              </div>
            </div>

            <div className="seg_section seg_section_bdr">
              <h4 className="seg_title">Basic Information</h4>
              <div className="form-group">
                <label>Request Type*</label>
                <select
                  name="Request Type"
                  title={SetErrorTitle(RequestForm.RequestTypeId)}
                  className={SetErrorClass(RequestForm.RequestTypeId)}
                  id="SelReqType"
                  value={RequestForm?.RequestTypeId.Value}
                  onChange={(e) =>
                    updateRequestField(FieldNames.RequestTypeId, e.target.value)
                  }
                  disabled={inputDisabled}
                >
                  <option>-Select-</option>
                  {MasterData.RequestTypes.map((option) => {
                    if (
                      !RequestForm.IsAddRequest || //Show all request types, if edit mode
                      option.ShowIn.includes("MINE") //Show only allowed types, if new request
                    ) {
                      return (
                        <option key={option.Id} value={option.Id}>
                          {option.Name}
                        </option>
                      );
                    }
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Client Audit Program</label>
                <DropDownListComponent
                  ref={(scope) => (this.dropDownListObject = scope)}
                  className="form-control"
                  dataSource={MasterData?.CapDetails}
                  filterType="Contains"
                  allowFiltering={true}
                  filterBarPlaceholder={"Search"}
                  fields={{
                    text: "ClientAuditProgramName",
                    value: "ClientAuditProgramId",
                  }}
                  value={RequestForm?.CapId.Value}
                  placeholder={"Select"}
                  change={(e) => {
                    if (e.isInteracted) {
                      this.props.updateRequestField(FieldNames.CapId, e.value);
                    }
                  }}
                  enabled={!inputDisabled}
                  cssClass={!inputDisabled ? "cap-ddl" : "cap-ddl-disabled"}
                />
              </div>
              <div className="form-group">
                <label>Audit ID</label>
                <input
                  type="text"
                  value={RequestForm?.AuditId.Value}
                  maxLength={10}
                  title={SetErrorTitle(RequestForm.AuditId)}
                  className={SetErrorClass(RequestForm.AuditId)}
                  onChange={(e) =>
                    updateRequestField(FieldNames.AuditId, e.target.value)
                  }
                  onBlur={(e) => updateRequestField(FieldNames.AuditId_OnBlur)}
                  disabled={inputDisabled}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateRequestField(FieldNames.AuditId_OnBlur);
                    }
                  }}
                ></input>
              </div>
              <div className="form-group">
                <label>Additional Audit Id's</label>
                <textarea
                  disabled={inputDisabled}
                  rows="2"
                  title={SetErrorTitle(RequestForm.AdditionalAuditIds)}
                  className={SetErrorClass(RequestForm.AdditionalAuditIds)}
                  value={RequestForm?.AdditionalAuditIds.Value}
                  onBlur={(e) =>
                    updateRequestField(FieldNames.AdditionalAuditId_OnBlur)
                  }
                  onChange={(e) =>
                    updateRequestField(
                      FieldNames.AdditionalAuditIds,
                      e.target.value
                    )
                  }
                ></textarea>
              </div>
              <div className="form-group">
                <label>Flow Name</label>
                <p>{RequestForm?.FlowName}</p>
              </div>
            </div>

            <div className="seg_section">
              <h4 className="seg_title">Provider/Patient Information</h4>
              <div className="form-group">
                <label>Provider Name</label>
                <p>{RequestForm?.ProviderName}</p>
              </div>
              <div className="form-group">
                <label>Patient Name</label>
                <p>{RequestForm?.PatientName}</p>
              </div>
              <div className="form-group">
                <label>Provider Address</label>
                <p>{RequestForm?.ProviderAddress}</p>
              </div>
            </div>
          </div>
          <div
            ref={this.requestDetailsRef}
            className="col-md-8 right_section"
            style={{
              height: RequestForm.IsReadOnly
                ? this.props.WindowHeight - 257
                : this.props.WindowHeight - 306,
            }}
          >
            {!RequestForm.IsAddRequest && (
              <h3 className="Querytitle mTop10">
                Request Details
                <p className="pull-right ">
                  <span
                    className="showcall_history mLeft15"
                    onClick={() => {
                      this.props.initServerCall(ActionTypes.GET_CALL_HISTORY);
                    }}
                  >
                    <img src="/content/images/Call history.png" alt="" />
                    Call History
                  </span>
                </p>
              </h3>
            )}

            <div className="clearFix">
              {ActiveQuery?.ShowEditCard && (
                <RequestCardEdit popUpEditorRef={this.props.popUpEditorRef} />
              )}

              {queryDetails
                ?.filter((queryDetail) => queryDetail?.Id !== ActiveQuery?.Id)
                .map((queryDetail) => (
                  <RequestCard
                    key={queryDetail.Id}
                    queryDetail={queryDetail}
                    requestDetailsRef={this.requestDetailsRef}
                  />
                ))}
            </div>
          </div>
        </div>
        {this.props.RequestForm.IsReadOnly ? null : (
          <div className="sticky_footer">
            {RequestForm.IsAddRequest && (
              <>
                <input
                  type="checkbox"
                  checked={RequestForm?.IsAddAnother}
                  onChange={(e) =>
                    updateRequestField(
                      FieldNames.IsAddAnother,
                      e.target.checked
                    )
                  }
                  style={{ marginRight: "5px" }}
                />
                <label className="mar-l-5">Add another</label>
              </>
            )}
            {RequestForm.IsAddRequest && (
              <button
                className="btn btn-sm btn-primary mLeft15 mRight5"
                onClick={() =>
                  this.props.initServerCall(ActionFields.NEW_REQUEST)
                }
              >
                New Request
              </button>
            )}
            <button
              className="btn btn-sm btn-primary mRight5"
              onClick={() => this.props.initServerCall(ActionFields.RESOLVED)}
              disabled={disableActions}
            >
              Resolved
            </button>
            <button
              className="btn btn-sm btn-primary mRight5"
              onClick={() => this.props.initServerCall(ActionFields.UNRESOLVED)}
              disabled={
                disableActions ||
                RequestForm.StatusCode.toUpperCase() === Status.UNRESOLVED
              }
            >
              Unresolved
            </button>
            {!RequestForm.IsAddRequest && (
              <button
                className="btn btn-sm btn-primary mRight5"
                onClick={() => this.props.initServerCall(ActionFields.SAVE)}
                disabled={disableActions}
              >
                Save
              </button>
            )}
            <button
              className="btn btn-sm btn-primary mRight5"
              onClick={() => this.props.initServerCall(ActionFields.RESET)}
              disabled={disableActions}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  let props = {
    state: state,
    WindowHeight: state.WindowHeight,
    MasterData: state.MasterData,
    Toast: state.Toast,
    CurrentScreen: state.CurrentScreen,
    ActiveQuery: state.RequestForm.ActiveQuery,
    RequestForm: state.RequestForm,
    queryDetails: state.RequestForm.QueryDetails,
    CallId: state.CallId,
  };
  return props;
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  updateScreenState: (screen) => {
    dispatch({ type: ActionTypes.UPDATE_SCREENSTATE, screen });
  },
  openFollowUp: () => {
    dispatch({ type: ActionTypes.OPEN_FOLLOWUP });
  },
  updateRequestField: (field, data) =>
    dispatch({
      type: ActionTypes.UPDATE_REQUEST_FIELD,
      payload: { field: field, data: data },
    }),
  initServerCall: (action) =>
    dispatch({
      type: ActionTypes.INIT_SERVERCALL,
      payload: { action: action },
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestForm);

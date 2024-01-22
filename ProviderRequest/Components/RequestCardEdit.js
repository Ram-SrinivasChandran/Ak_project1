import React, { Component } from "react";
import { connect } from "react-redux";
import { ActionTypes, FieldNames, RequestMode, RequestTypeCode } from "../Store/Constants";
import { Util } from "../../Common/Actions/Util";
import ContactChangeRequest from "./ContactChangeRequest";
import { SetErrorClass, SetErrorTitle } from "../../Common/Actions/FieldData";
import ReactHtmlParser from "react-html-parser";

class RequestCardEdit extends Component {
  state = {
    verifiedUsing: [
      { text: "Audit Id", checked: false, name: "Audit Id" },
      { text: "Patient Info", checked: false, name: "Patient Info" },
      { text: "Facility Info", checked: false, name: "Facility Info" },
      { text: "Claim Number", checked: false, name: "Claim Number" },
    ],
  };

  renderVerfiedUsing = () => {
    let verifiedUsing = [];
    if (this.props.ActiveQuery.VerifiedUsing.Value)
      verifiedUsing = this.props.ActiveQuery?.VerifiedUsing.Value.split(",");
    const updatedVerifiedUsing = [...this.state.verifiedUsing];
    updatedVerifiedUsing.map((el) => {
      el.checked = false;
      verifiedUsing.map((element) => {
        if (el.name.toLowerCase().trim() === element.toLowerCase().trim()) {
          const index = updatedVerifiedUsing.findIndex(
            (option) =>
              option.name.toLowerCase().trim() === el.name.toLowerCase().trim()
          );
          updatedVerifiedUsing[index].checked = true;
        }
      });
    });
    const defaultState = this.state.verifiedUsing.map((elem) => {
      return {
        ...elem,
        checked: false,
      };
    });
    this.setState((prevState) => {
      return {
        ...prevState,
        verifiedUsing:
          this.props.ActiveQuery?.VerifiedUsing.Value === ""
            ? defaultState
            : updatedVerifiedUsing,
      };
    });
  };

  componentDidMount() {
    this.renderVerfiedUsing();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.ActiveQuery.Id !== this.props.ActiveQuery.Id ||
      prevProps.ActiveQuery.HasChanges !== this.props.ActiveQuery.HasChanges ||
      prevProps.ActiveQuery.VerifiedUsing.Value !==
        this.props.ActiveQuery.VerifiedUsing.Value
    ) {
      this.renderVerfiedUsing();
    }
  }

  onChangeVerifiedUsing = (event) => {
    const { name, checked } = event.target;
    const updatedVerifiedUsing = [...this.state.verifiedUsing];
    const index = updatedVerifiedUsing.findIndex(
      (option) => option.name === name
    );
    updatedVerifiedUsing[index].checked = checked;
    this.setState((prevState) => {
      return {
        ...prevState,
        verifiedUsing: updatedVerifiedUsing,
      };
    });

    const checkedOptions = updatedVerifiedUsing
      .filter((option) => option.checked)
      .map((option) => option.name);
    this.props.updateActiveQueryField(
      FieldNames.VerifiedUsing,
      checkedOptions.join(", ")
    );
  };
  getRequestMode = () => {
    if (
      this.props.RequestForm.IsAddRequest ||
      this.props.RequestForm.ActiveQuery.IsFollowUp
    ) {
      //exclude portal mode for new request
      return this.props.MasterData.RequestMode.filter(
        (x) => x.toLowerCase() !== "portal"
      );
    } else {
      return this.props.MasterData.RequestMode;
    }
  };

  render() {
    const { ActiveQuery, RequestForm, updateActiveQueryField } = this.props;
    let requestMode = ActiveQuery?.RequestMode?.Value?.toUpperCase();
    let requestTypeCode = this.props.RequestForm?.RequestTypeCode;

    return (
      <div className="detailsCard" id="">
        <div className="textdetails1">
          <h3 className="detailsCardheader">
            {RequestForm.IsAddRequest
              ? "Add Query"
              : !ActiveQuery.IsFollowUp
              ? Util.getCustomDateTimeFormat(ActiveQuery?.AttendedAt)
              : "New Follow Up"}
            {!RequestForm.IsAddRequest && (
              <span className="pull-right ronlytxt">
                {ActiveQuery?.AttendedByFullName}
              </span>
            )}
          </h3>
          <div className="col-md-12 mBot10 Authparam mTop10">
            <div className="form-group">
              <label>Channel*:</label>
              <select
                name="Request Mode"
                disabled={this.props.CallId && !ActiveQuery.Id}
                title={SetErrorTitle(ActiveQuery.RequestMode)}
                className={SetErrorClass(ActiveQuery.RequestMode)}
                id="SelReqType"
                value={ActiveQuery?.RequestMode?.Value}
                onChange={(e) =>
                  updateActiveQueryField(FieldNames.RequestMode, e.target.value)
                }
              >
                {this.getRequestMode().map((option) => {
                  return (
                    <option key={option} value={option} defaultValue="Phone">
                      {option}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          {requestMode != RequestMode.PORTAL &&
          <div className="col-md-12 Authparam">
            <div className="form-group">
              <label>
                Requester Verified Using
                {RequestForm.IsVerifiedUsingRequired ? "*" : ""}:{" "}
              </label>
              <p>
                {this.state.verifiedUsing.map((option) => {
                  return (
                    <span className="checkboxparam" key={option.name}>
                      <input
                        type="checkbox"
                        title={SetErrorTitle(ActiveQuery.VerifiedUsing)}
                        name={option.name}
                        checked={option.checked}
                        onChange={this.onChangeVerifiedUsing}
                      />
                      {option.text}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>}

          { requestMode == RequestMode.PORTAL && requestTypeCode == RequestTypeCode.ADDRESS_CHANGE_REQUEST &&
              <ContactChangeRequest 
                    queryDetail={this.props.QueryDetails[0]}
                    statusCode={this.props.RequestForm.StatusCode}
              />
          }

          <div className="col-md-12 pn5">
            <div className="form-group">
              <span className="Icnclr">
                <img
                  className="v_align_bot mb5"
                  src="/content/images/query.png"
                  alt=""
                />
              </span>
              <label>Query*</label>&nbsp;
              {(requestMode == RequestMode.EMAIL && ActiveQuery?.DisableQueryWindow === true ) ? 
                <span title="Email Query cannot be modified" >
                  <div className="glyphicon glyphicon-edit grid-action-img"></div>
                </span> 
                :
                <span title="Edit in popup" onClick={() => this.props.popUpEditorRef.openEditor("Query", (ActiveQuery?.Query?.Value), {field: FieldNames.Query, actionType: ActionTypes.UPDATE_ACTIVE_QUERY} )}>
                  <span className="glyphicon glyphicon-edit"></span>
                </span>
              }
              {this.props.CallId !== "" &&
                this.props.PreviousQueryDetails.Query !== "" && (
                  <span
                    class="copyPrev"
                    onClick={() => {
                      this.props.updateActiveQueryField(
                        FieldNames.CopyPreviousQuery,
                        this.props.PreviousQueryDetails.Query
                      );
                    }}
                  >
                    <img class="" src="/content/images/qr-copy.png" alt="" />{" "}
                    Copy Previous Query
                  </span>
                )}
                { (requestMode == RequestMode.EMAIL && ActiveQuery?.DisableQueryWindow === true ) ?
                  <div className="col-md-11 p0 right_section query_section">
                    <p className="txtQuery">
                      {ReactHtmlParser(ActiveQuery?.Query?.Value)}
                    </p>
                  </div>
                  :
                  <textarea
                    name=""
                    id=""
                    cols="30"
                    rows="4"
                    maxLength={2000}
                    title={SetErrorTitle(ActiveQuery.Query)}
                    className={SetErrorClass(ActiveQuery.Query, "w100 bdr_dashed")}
                    value={ActiveQuery?.Query?.Value}
                    onChange={(e) =>
                      updateActiveQueryField(FieldNames.Query, e.target.value)
                    }
                  >
                    {ActiveQuery?.Query?.Value}
                  </textarea>
                }
            </div>
          </div>
          <div className="col-md-12 response">
            <div className="form-group">
              <span className="Icnclr">
                <img
                  className="v_align_bot mb5"
                  src="/content/images/response.png"
                  alt=""
                />
              </span>
              <label>
                Response
                {RequestForm.IsResponseRequired ? "*" : ""}
              </label>&nbsp;
              <span title="Edit in popup" onClick={() => this.props.popUpEditorRef.openEditor("Response", (ActiveQuery?.Response?.Value), {field: FieldNames.Response, actionType: ActionTypes.UPDATE_ACTIVE_QUERY} )}>
                  <span className="glyphicon glyphicon-edit"></span>
              </span>
              {this.props.CallId !== "" &&
                this.props.PreviousQueryDetails.Response !== "" && (
                  <span
                    class="copyPrev"
                    onClick={() => {
                      this.props.updateActiveQueryField(
                        FieldNames.CopyPreviousResponse,
                        this.props.PreviousQueryDetails.Response
                      );
                    }}
                  >
                    <img class="" src="/content/images/qr-copy.png" alt="" />{" "}
                    Copy Previous Response
                  </span>
                )}
              <span className="pull-right text-merun">
                Don't enter PHI details
              </span>
              <textarea
                name=""
                id=""
                cols="30"
                rows="4"
                maxLength={2000}
                title={SetErrorTitle(ActiveQuery.Response)}
                className={SetErrorClass(
                  ActiveQuery.Response,
                  "w100 bdr_dashed"
                )}
                value={ActiveQuery?.Response?.Value}
                onChange={(e) =>
                  updateActiveQueryField(FieldNames.Response, e.target.value)
                }
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  let props = {
    ActiveQuery: state.RequestForm.ActiveQuery,
    MasterData: state.MasterData,
    RequestForm: state.RequestForm,
    CallerInformation: state.CallerInformation,
    CallId: state.CallId,
    PreviousQueryDetails: state.PreviousQueryDetails,
    QueryDetails: state.RequestForm.QueryDetails,
  };
  return props;
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  updateActiveQueryField: (field, data) =>
    dispatch({
      type: ActionTypes.UPDATE_ACTIVE_QUERY,
      payload: { field: field, data: data },
    }),
});
export default connect(mapStateToProps, mapDispatchToProps)(RequestCardEdit);

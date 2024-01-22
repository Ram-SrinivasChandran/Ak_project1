import React, { Component } from "react";
import { connect } from "react-redux";
import { Util } from "../../Common/Actions/Util";
import { ActionTypes, RequestModeIcon, Status, RequestMode, RequestTypeCode } from "../Store/Constants";
import ContactChangeRequest from "./ContactChangeRequest";
import ReactHtmlParser from "react-html-parser";

class RequestCard extends Component {
  constructor() {
    super(...arguments);
  }

  onEditRequestCard = () => {
    this.openActiveQuery();
  };

  componentDidMount(){
    let requestMode = this.props.queryDetail.RequestMode.toUpperCase();
    let status = this.props.RequestForm?.StatusCode?.toUpperCase();
    if(requestMode == RequestMode.PORTAL && status != Status.RESOLVED && status != Status.AUTORESOLVED){
      this.openActiveQuery();
    }
  }

  openActiveQuery = () => {
    this.props.requestDetailsRef.current.scrollTop = 0;
    if (!this.props.ActiveQuery.HasChanges || window.confirm("Current Changes will be lost. Are you sure to proceed?")) 
    {
      this.props.updateActiveQuerySelection(this.props.queryDetail.Id);
    }
  }

  render() {
    const hideEdit = this.props.RequestForm.IsReadOnly;
    const queryDetail = this.props.queryDetail;
    const requestTypeCode = this.props.RequestForm.RequestTypeCode;

    return (
      <div className="detailsCard">
        <h3 className="detailsCardheader">
          <img
            src={RequestModeIcon.get(this.props.queryDetail.RequestMode)}
            alt="request mode"
            className="Icnclr"
            title={this.props.queryDetail.RequestMode}
          />
          {Util.getCustomDateTimeFormat(this.props.queryDetail.AttendedAt)}
          <span className="pull-right ronlytxt">
            {this.props.queryDetail.AttendedByFullName}
          </span>
        </h3>
        <div className="detailscardbody">
          <div>
            {this.props.queryDetail.NotificationStatus === "QUEUED" &&
              <p class="text-maroon"> Email notification to the provider has been Queued </p> 
            } 
            {this.props.queryDetail.NotificationStatus === "NOTIFIED" && 
              <p class="text-green"> 
                Email notification to the provider has been sent at {Util.getCustomDateTimeFormat(this.props.queryDetail.NotifiedAt)}
              </p> 
            }
             {this.props.queryDetail.NotificationStatus === "ERROR" && 
              <p class="text-maroon"> Email notification to the provider has been Failed </p>  
            }
          </div>
          <div className="col-md-12 p0">
            <div className="col-md-11 p0">
              <p className="txtQuery">
                <span className="Icnclr">
                  <img
                    className="v_align_bot"
                    src="/content/images/query.png"
                    alt=""
                  />
                </span>
                {ReactHtmlParser(this.props.queryDetail.Query)}
              </p>
            </div>
            <div className="col-md-1">
              {!hideEdit ? (
                <p className="Editinc">
                  <span
                    className="glyphicon glyphicon-edit"
                    onClick={this.onEditRequestCard}
                  ></span>
                </p>
              ) : null
              }
            </div>
          </div>
          { (queryDetail.RequestMode).toUpperCase() == RequestMode.PORTAL && 
            requestTypeCode == RequestTypeCode.ADDRESS_CHANGE_REQUEST &&
              <ContactChangeRequest 
                    queryDetail={this.props.queryDetail}
                    statusCode={this.props.RequestForm.StatusCode}
              />
          }
          <p className="txtResponse">
            <span className="Icnclr">
              <img
                className="v_align_bot"
                src="/content/images/response.png"
                alt=""
              />
            </span>
            {ReactHtmlParser(this.props.queryDetail.Response)}
          </p>
          <p className="verfied">
            {this.props.queryDetail.VerifiedUsing ? (
              <span
                className="verifiedicn glyphicon glyphicon-ok-sign"
                title="Requester Verified Using"
              ></span>
            ) : (
              ""
            )}
            {this.props.queryDetail.VerifiedUsing}
          </p>
          {this.props.queryDetail.UpdatedByFullName && (
            <p className="updatedet">
              Last Updated by:
              <span className="bluetxt">
                {this.props.queryDetail.UpdatedByFullName}
              </span>
              <span> On </span>
              <span className="bluetxt">
                {Util.getCustomDateTimeFormat(this.props.queryDetail.UpdatedAt)}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let props = {
    ActiveQuery: state.RequestForm.ActiveQuery,
    RequestForm: state.RequestForm,
  };
  return props;
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  updateActiveQuerySelection: (selectedId) => {
    dispatch({
      type: ActionTypes.UPDATE_ACTIVEQUERY_SELECTION,
      payload: { selectedId },
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestCard);

import { initialState } from "./InitialState";
import { Actions } from "./Actions";
import { ActionTypes } from "./Constants";

const reducer = (state = initialState, action) => {
  let nState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case ActionTypes.INIT_APP:
      Actions.copyValuesFromDbObject(nState, action.payload);
      break;
    case ActionTypes.INIT_CONNECTED:
      nState.IsConnected = true;
      break;
    case ActionTypes.UPDATE_WINDOWSIZE:
      Actions.updateWindowSize(nState, action.payload);
      break;
    case ActionTypes.UPDATE_SCREENSTATE:
      Actions.updateScreenState(nState, action.screen);
      break;

    case ActionTypes.UPDATE_SEARCH_FIELDVALUE:
      Actions.updateSearchFieldData(nState, action.payload);
      break;
    case ActionTypes.ON_SEARCH_CLICK:
      Actions.onSearchClick(nState, action.payload.dispatch);
      break;
    case ActionTypes.UPDATES_SEARCHSTATUS:
      Actions.updateSearchStatus(nState, action.payload);
      break;
    case ActionTypes.UPDATE_ACTIVE_QUERY:
      Actions.updateActiveQueryFields(nState, action.payload);
      break;
    case ActionTypes.UPDATE_ACTIVEQUERY_SELECTION:
      Actions.updateActiveQuerySelection(nState, action.payload);
      break;
    case ActionTypes.OPEN_FOLLOWUP:
      Actions.openFollowUp(nState, action.payload);
      break;
    case ActionTypes.INIT_SERVERCALL:
      Actions.initServerCall(nState, action.payload);
      break;
    case ActionTypes.UPDATE_SERVERCALLSTATUS:
      Actions.updateServerCallStatus(nState, action.payload);
      break;
    case ActionTypes.UPDATE_REQUEST_FIELD:
      Actions.updateRequestFields(nState, action.payload);
      break;
    case ActionTypes.UPDATE_CONFIRMATION_ACTION:
      Actions.updateConfirmationAction(nState, action.payload);
      break;
    default:
      break;
  }
  return nState;
};
export default reducer;

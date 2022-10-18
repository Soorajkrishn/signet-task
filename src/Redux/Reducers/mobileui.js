const initialState = {
  profileEdit: false,
  ticketEdit: false,
  profile:false,
  pageName:null,
  email:null,
  id:null
};

const MoblieuiReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'EDIT_PROFILE':
      return {
        profileEdit: true,        
        pageName:action.payload,
      };
    case 'REMOVE_EDIT_PROFILE':
      return {
        profileEdit: false,
        profile: true,
        pageName:action.payload,
      };
    case 'PROFILE_PAGE':
        return {
          profile: true,
          pageName:action.payload
        };
    case 'PROFILE_PAGE_ICON':
          return {
            profile: false,
            pageName:action.payload
          };
    case 'TICKET_VIEW':
      return{
        pageName:'View Ticket',
        email:action.payload.email,
        id:action.payload.id
      }
    default:
      return state;
  }
};

export default MoblieuiReducer;

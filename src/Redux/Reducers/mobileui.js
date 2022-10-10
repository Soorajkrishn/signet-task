const initialState = {
    profileEdit: false,
    ticketEdit: false
}

const MoblieuiReducer = (state = initialState, action) => {
    switch (action.type) {
        case "edit":
            return {
                profileEdit: true
            }
        case "noEdit":
            return {
                profileEdit: false
            }
        default:
            return state
    }
}

export default MoblieuiReducer
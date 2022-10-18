export const startlogin = () => ({
  type: 'START_LOGIN',
});

export const successlogin = (user) => ({
  type: 'SUCCESS_LOGIN',
  payload: user,
});

export const updateUser = (user) => ({
  type: 'UPDATE_USER',
  payload: user,
});

export const failedlogin = (error) => ({
  type: 'FAILED_LOGIN',
  payload: error,
});

export const editprofile = (pageName) => ({
  type: 'EDIT_PROFILE',
  payload: pageName,
});

export const removeEditProfile = (pageName) => ({
  type: 'REMOVE_EDIT_PROFILE',
  payload: pageName,
});

export const profile = (pageName) => ({
  type: 'PROFILE_PAGE',
  payload: pageName,
});

export const profileIcon = (pageName) => ({
  type: 'PROFILE_PAGE_ICON',
  payload: pageName,
});

export const ticketView = (email,id) => ({
  type: 'TICKET_VIEW',
  payload: {email,id},
});
export const HOST='http://localhost:8000'
//export const HOST='http://10.73.5.173:8000'
//export const HOST="https://d7lmxpx5-8000.uks1.devtunnels.ms"


export const checkUser=`${HOST}/api/auth/check-user`;
export const onboardUser=`${HOST}/api/auth/onboarding`
export const getAllUsers=`${HOST}/api/auth/get-all-contacts`

export const addMessage=`${HOST}/api/messages/add-message`
export const allMessages=`${HOST}/api/messages/all-messages`
export const addImageMessage=`${HOST}/api/messages/add-image-message`
export const addVoiceMessage=`${HOST}/api/messages/add-voice-message`
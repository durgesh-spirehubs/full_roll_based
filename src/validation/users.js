
import i18n from "../config/il8n.js";
export const userValidation={
    name:{
    exists: {
      errorMessage: i18n.__("uservalidation.firstName"),
    },
    isLength: {
      errorMessage: i18n.__("uservalidation.firstNameLength"),
      options: { min: 2},
    }
},
  password: {
    exists: {
      errorMessage: i18n.__("uservalidation.password.required"),
    },
    isLength: {
      errorMessage: i18n.__("uservalidation.password.isValid"),
      options: { min: 3 },
    },
  },
}
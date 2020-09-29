import * as Yup from 'yup'
import { AuthorizationInput } from '../AuthorizationInput'

const MIN_PASSWORD_LENGTH = 5;

export const validateRegisterInput = ({email, password}: AuthorizationInput) => {

  if(!Yup.string().email().isValidSync(email)) {
    return [{
      field: "email",
      message: 'Invalid email'
    }]
  }

  if(!Yup.string().min(MIN_PASSWORD_LENGTH).isValidSync(password)) {
    return [{
      field: 'password',
      message: `Password must be longer than ${MIN_PASSWORD_LENGTH}`
    }]
  }
  return null;
}
import * as Yup from 'yup'
import { RegisterInput } from './RegisterInput'

const MIN_PASSWORD_LENGTH = 5;

export const validateRegisterInput = ({email, password}: RegisterInput) => {

  if(!Yup.string().email().isValidSync(email)) {
    return [{
      field: "email",
      message: 'Invalid email'
    }]
  }

  console.log(password)
  console.log(Yup.string().min(MIN_PASSWORD_LENGTH).isValidSync(password))

  if(!Yup.string().min(MIN_PASSWORD_LENGTH).isValidSync(password)) {
    return [{
      field: 'password',
      message: `Password must be longer than ${MIN_PASSWORD_LENGTH}`
    }]
  }
  return null;
}
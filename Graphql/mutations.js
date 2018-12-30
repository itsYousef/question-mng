import gql from 'graphql-tag';

// SignUp
export const SIGNUP_USER = gql `
  mutation signUp(
    $grade: String!,
    $nationalCode: String!,
    $phoneNumber: String!,
  ){
    signUp(
      grade: $grade,
      nationalCode: $nationalCode,
      phoneNumber: $phoneNumber,
  ){
      moshaverUser{
        id
        token
        activationCode
      }
    }
  }
`

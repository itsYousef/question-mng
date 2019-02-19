import gql from 'graphql-tag';

// WelcomeScreen
export const GET_VERSION = gql`
  query checkVersion{
    checkVersion
  }
`

// QuestionScreen
export const GET_GRADE = gql`
  query getGrade{
    getGrade
  }
`

export const GET_BOOKNAME = gql`
  query getBookname(
    $grade: String!,
  ){
    getBookname(grade: $grade)
  }
`

export const GET_MABHAS = gql`
  query getChapter(
    $grade: String,
    $bookName: String,
  ){
    getMabhas(grade: $grade, bookName: $bookName)
  }
`

export const GET_FILE_ADDRESS = gql`
  query getFiles(
    $grade: String,
    $bookName: String,
    $mabhas: String,
  ){
    getFiles(
      grade: $grade,
      bookName: $bookName,
      mabhas: $mabhas,
    ){
      id
      question
      answer
    }
  }
`

export const GET_VIDEO_MAJOR = gql`
  query getVideoMajor{
    getVideoMajor {
      id
      title
    }
  }
`

export const GET_VIDEO_FILES = gql`
  query getVideoFile(
    $major: String!
  ){
    getVideoFile(
      major: $major
    ){
      id
      title
      video
      pdf
    }
  }
`

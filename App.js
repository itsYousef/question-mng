import React, { Component } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Slider,
  Switch,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
  AsyncStorage,
  Dimensions,
} from 'react-native';
import { ApolloProvider } from 'react-apollo';
import client from './Apollo/client';
import { createStackNavigator, createAppContainer, createMaterialTopTabNavigator } from "react-navigation";
import {
  ACTIVE_COLOR,
} from './statics/app_style';
// import {
//   WelcomeScreen,
//   MainScreen,
//   Login,
//   // SignUp,
//   // QuestionScreen,
//   PdfScreen,
// } from './screens';
import SignUp from './screens/SignUp';
import QuestionScreen from './screens/QuestionScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';
import Login from './screens/Login';
import PdfQScreen from './screens/PdfQScreen';
import PdfAScreen from './screens/PdfAScreen';
import MajorKnowQuestionScreen from './screens/MajorKnowQuestionScreen';
import CollegePdfScreen from './screens/CollegePdfScreen';
import CollegeVideoScreen from './screens/CollegeVideoScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const AppNavigator = createStackNavigator({
  welcome: {
    screen: WelcomeScreen,
  },
  signUp: {
    screen: SignUp,
  },
  // login: {
  //   screen: Login,
  // },
  main: {
    screen: MainScreen,
  },
  question: {
    screen: QuestionScreen,
  },
  pdfs: createMaterialTopTabNavigator({
    pdfQ: {
      screen: PdfQScreen,
    },
    pdfA: {
      screen: PdfAScreen,
    }
  }, {
    lazy: true,
    animationEnabled: false,
    tabBarOptions: {
      scrollEnabled: false,
      swipeEnabled: false,
      upperCaseLabel: false,
      activeTintColor: ACTIVE_COLOR,
      inactiveTintColor: 'gray',
      tintColor: '#000',
      style: {
        width: SCREEN_WIDTH,
        backgroundColor: '#FFF',
      },
      indicatorStyle: {
        borderWidth: 2,
        borderColor: ACTIVE_COLOR,
      },
      labelStyle: {
        fontSize: 15,
      },
    },
  }),
  majorQ: {
    screen: MajorKnowQuestionScreen,
  },
  college: createMaterialTopTabNavigator({
    collegeVideo: {
      screen: CollegeVideoScreen,
    },
    collegePdf: {
      screen: CollegePdfScreen,
    },
  }, {
    lazy: true,
    animationEnabled: false,
    tabBarOptions: {
      scrollEnabled: false,
      swipeEnabled: false,
      upperCaseLabel: false,
      activeTintColor: ACTIVE_COLOR,
      inactiveTintColor: 'gray',
      tintColor: '#000',
      style: {
        width: SCREEN_WIDTH,
        backgroundColor: '#FFF',
      },
      indicatorStyle: {
        borderWidth: 2,
        borderColor: ACTIVE_COLOR,
      },
      labelStyle: {
        fontSize: 15,
      },
    },
  }),
}, {
  headerMode: 'none',
  navigationOptions: {
    tabBarVisible: false
  },
  lazy: true
});

const AppContainer = createAppContainer(AppNavigator);

class App extends Component {
  render() {
    // AsyncStorage.removeItem('token')
    return (
      <ApolloProvider client={client}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <StatusBar hidden={true} />
          <AppContainer />
        </View>
      </ApolloProvider>
    );
  }
}

export default App;

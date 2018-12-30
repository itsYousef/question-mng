import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
  AsyncStorage,
  Dimensions,
  LayoutAnimation,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Toast from '../modules/react-native-smart-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextField } from '../modules/react-native-material-textfield';
import { Button } from 'react-native-elements';
import { StackActions, NavigationActions } from 'react-navigation';
import { graphql, compose } from 'react-apollo';
import { BACKGROUND_COLOR, SECONDARY_COLOR } from '../statics/app_style';

import logoImg from '../statics/images/logo.png';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('loading', () => require('../statics/animations/preloader.json')),
];

class Login extends Component {
  state = {
    showPassword: false,
    loading: false,
    isPlaying: true,
    isInverse: false,
    loop: true,
    animationFinished: false,
    username: '',
    password: '',
    errorUsername: '',
    errorPassword: '',
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ animationFinished: true })
    }, 500);
  }

  componentWillUpdate() {
    LayoutAnimation.linear();
  }

  showToast = (children) => {
    if (!this._toast) {
      return ;
    }
    this._toast.show({
      position: Toast.constants.gravity.bottom,
      duration: 255,
      children: <View><Text style={{color: 'white'}}>{children}</Text></View>
    })
  }

  onSubmitPress = () => {
    username = this.state.username;
    password = this.state.password;

    correct_data = true;

    if (username == '') {
      correct_data = false;
      this.setState({ errorUsername: 'باید این قسمت را پر کنید' });
    }

    if (password == '') {
      correct_data = false;
      this.setState({ errorPassword: 'باید این قسمت را پر کنید' });
    }

    if (!correct_data) return;

    username = username.toLowerCase();

    variables = {
      username,
      password,
    }
    this.setState({ loading: true, username: '', password: '' });

    this.props.login({
      variables
    })
    .then(res => {
      AsyncStorage.setItem('token', res.data.login.token);
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'main' })],
      });
      this.props.navigation.dispatch(resetAction);
    })
    .catch(err => {
      // console.log(err);
      this.showToast('لطفا نام کاربری و یا رمز عبور را با دقت بیشتری وارد کنید');
      this.setState({ loading: false });
    });
  }

  renderButton() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around', marginTop: 24, bottom: 2 }}>
        <Button
          iconRight={{name: 'sign-in', type: 'octicon', color: 'white'}}
          fontSize={25}
          borderRadius={30}
          buttonStyle={{ width: SCREEN_WIDTH/1.5 }}
          title='ورود'
          onPress={() => this.props.navigation.navigate('main')}
          backgroundColor={SECONDARY_COLOR}
          textStyle={{ color: 'white', fontFamily: 'Vazir-Medium' }}
          />

        <Button
          large
          borderRadius={30}
          fontSize={20}
          buttonStyle={{ width: SCREEN_WIDTH/1.5 }}
          onPress={() => this.props.navigation.navigate('signUp')}
          iconRight={{name: 'pencil', type: 'octicon', color: SECONDARY_COLOR}}
          title='ثبت نام'
          backgroundColor='tranparent'
          textStyle={{ color: SECONDARY_COLOR, fontFamily: 'Vazir-Medium' }}
          />
      </View>
    );
  }

  setAnim = anim => {
    this.anim = anim;
  };

  renderLoading = () => {
    const { isInverse, progress, loop } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LottieView
          ref={this.setAnim}
          autoPlay={!progress}
          style={[EXAMPLES[0].width && { width: EXAMPLES[0].width }, isInverse && styles.lottieViewInvse]}
          source={EXAMPLES[0].getJson()}
          progress={progress}
          loop={loop}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    );
  }

  changeUsername = (text) => {
    this.setState({username: text});
  }

  changePassword = (text) => {
    this.setState({password: text});
  }

  render() {
    return (
      <KeyboardAwareScrollView
        backgroundColor={BACKGROUND_COLOR}
        style={{ flex: 1 }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        contentContainerStyle={{ flex: 3 }}
        extraScrollHeight={50}
        extraHeight={50}
        enableOnAndroid={true}
        >

        <Toast
          spacing={SCREEN_WIDTH / 2}
          ref={ component => this._toast = component }>
          Unable to show Toast
        </Toast>

        <View style={styles.logoContainer}>
          <Image source={logoImg} style={styles.logoImage} />
          <Text style={styles.appNameStyle}>به ۷ استاد خوش آمدید</Text>
        </View>

        {this.state.animationFinished
          ?
            <View style={{ flex: 3 }}>
              <View style={styles.container}>

                <View style={styles.fields}>

                  <View style={{ paddingRight: 25, paddingLeft: 25 }}>
                    <TextField
                      value={this.state.username}
                      label="نام کاربری"
                      keyboardType='email-address'
                      title="ضروری"
                      error={this.state.errorUsername}
                      onChangeText={this.changeUsername.bind(this)}
                      onFocus={() => this.setState({errorUsername:''})}
                      fontSize={20}
                      editable={!this.state.loading}
                      baseColor="white"
                      textColor="white"
                      tintColor="white"
                      />
                  </View>

                  <View style={{ paddingRight: 25, paddingLeft: 25 }}>
                    <TextField
                      value={this.state.password}
                      secureTextEntry
                      label="کلمه عبور (کد ملی)"
                      title="ضروری"
                      error={this.state.errorPassword}
                      onChangeText={this.changePassword.bind(this)}
                      onFocus={() => this.setState({errorPassword:''})}
                      fontSize={20}
                      editable={!this.state.loading}
                      baseColor="white"
                      textColor="white"
                      tintColor="white"
                      />
                  </View>

                </View>

              </View>

              {this.state.loading
                ?
                this.renderLoading()
                :
                this.renderButton()
              }
            </View>
          :
          null
        }

      </KeyboardAwareScrollView>
    );
  }
}

const styles = {
  picture: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  container: {
    justifyContent: 'center',
    flex: 2,
    padding: 5,
  },
  fields: {
    marginRight: 18,
    flexDirection: 'column',
    flex: 2,
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appNameStyle: {
    color: 'white',
    backgroundColor: 'transparent',
    marginTop: 20,
    fontSize: 20,
    fontFamily: 'Vazir-Medium'
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    top: -15,
  },
  btnEye: {
    position: 'absolute',
    top: 110,
    left: 28,
  },
  iconEye: {
    width: 25,
    height: 25,
    tintColor: 'rgba(0,0,0,0.2)',
  },
  confirmButtonStyle: {
    flex: 1,
    top: 65,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
};

compose(

)(Login);

export { Login };

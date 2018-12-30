import React, { Component } from 'react';
import {
  View,
  Text,
  LayoutAnimation,
  AsyncStorage,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Header, Icon, Button } from 'react-native-elements';
import { StackActions, NavigationActions } from 'react-navigation';
import { graphql, compose } from 'react-apollo';
import Modal from 'react-native-modalbox';
import { BACKGROUND_COLOR, SECONDARY_COLOR } from '../statics/app_style';
import {
  GET_VERSION,
} from '../Graphql';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('done_welcome', () => require('../statics/animations/done.json')),
];

class WelcomeScreen extends Component {
  state = {
    version: 2,
    versionIsValid: true,
    isPlaying: true,
    isInverse: false,
    loop: false,
    token: '',
    animationFinished: false,
    updateModal: false,
    isNew: null,
  }

  componentWillReceiveProps(nextProps) {
    const { checkVersion } = nextProps;

    if (checkVersion && !checkVersion.loading && !checkVersion.error) {
      this.setState({ versionIsValid: checkVersion.checkVersion <= this.state.version });
    }
  }

  async componentWillMount() {
    let token = await AsyncStorage.getItem('token');
    let isNew = await AsyncStorage.getItem('V1');
    this.setState({ token, isNew })
  }

  componentWillUpdate() {
    LayoutAnimation.linear();
  }

  setAnim = anim => {
    this.anim = anim;
  }

  componentDidMount() {
    setTimeout(() => {
      if (!this.state.versionIsValid) {
        this.setState({ updateModal: true });
        return;
      }
      if (this.state.isNew == null) {
        this.setState({ animationFinished: true });
        return ;
      }
      if (this.state.token) {
        this.setState({ animationFinished: false });
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'main' })],
        });
        this.props.navigation.dispatch(resetAction);
        return;
      }
      this.setState({ animationFinished: true });
    }, 4000);
  }

  renderLoginSignUp = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Vazir-Medium', color: 'white', fontSize: 20 }}>امتحانات را با</Text>
          <Image
            style={styles.image}
            source={require('../statics/images/7ostad.png')}
            />
            {/*<Text style={{ fontFamily: 'Vazir-Medium', color: 'white', fontSize: 40 }}>۷ استاد</Text>*/}
          <Text style={{ fontFamily: 'Vazir-Medium', color: 'white', fontSize: 20 }}>۲۰ بگیرید</Text>
        </View>

        <View style={{ flex: 2, alignItems: 'center', justifyContent: 'flex-end', padding: 4 }}>
          {/*<Button
            iconRight={{name: 'sign-in', type: 'octicon', color: 'white'}}
            fontSize={25}
            borderRadius={30}
            buttonStyle={{ width: SCREEN_WIDTH/1.5 }}
            title='ورود'
            onPress={() => this.props.navigation.navigate('login')}
            backgroundColor={SECONDARY_COLOR}
            textStyle={{ color: 'white', fontFamily: 'Vazir-Medium' }}
            />*/}

          <Button
            large
            borderRadius={30}
            fontSize={20}
            buttonStyle={{ width: SCREEN_WIDTH/1.5, borderWidth: 1, borderColor: SECONDARY_COLOR }}
            onPress={() => this.props.navigation.navigate('signUp')}
            iconRight={{name: 'pencil', type: 'octicon', color: SECONDARY_COLOR}}
            title='ثبت نام'
            backgroundColor='tranparent'
            textStyle={{ color: SECONDARY_COLOR, fontFamily: 'Vazir-Medium' }}
            />
        </View>
      </View>
    );
  }

  render() {
    const { isPlaying, isInverse, progress, loop } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
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

        {this.state.animationFinished
          ?
          this.renderLoginSignUp()
          :
          null
        }

        <Modal
          isOpen={this.state.updateModal}
          position={"center"}
          onClosed={() => this.setState({ updateModal: false })}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 2, backgroundColor: 'rgb(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={false}
          swipeToClose={false}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'به روز رسانی برنامه', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              />

            <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', paddingLeft: 4, paddingRight: 4 }}>
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                از این که ما را انتخاب کردید متشکریم!{'\n'}
              </Text>

              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                نسخه ی جدید برنامه برای بروزرسانی آماده می باشد.
              </Text>

              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                لطفا ابتدا نسخه ی بروز شده را دانلود و نصب کنید سپس از امکانات ما بهره مند شوید
              </Text>
            </View>

            <View style={{ alignItems: 'center', width: SCREEN_WIDTH }}>
              <TouchableOpacity
                onPress={() => Linking.openURL('http://moshaver7.ir/moshaver7.apk')}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: BACKGROUND_COLOR, width: null }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: BACKGROUND_COLOR }}>دریافت فایل نصبی جدید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = {
  image: {
    width: 200,
    height: 110,
  },
}

export default compose(
  graphql(GET_VERSION, { name: 'checkVersion' }),
)(WelcomeScreen);

// export { WelcomeScreen };

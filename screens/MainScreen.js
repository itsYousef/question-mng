import React, { Component } from 'react';
import { View, Text, Dimensions, ScrollView, Image, TouchableOpacity, AsyncStorage, ActivityIndicator } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import Modal from 'react-native-modalbox';
import Toast from '../modules/react-native-smart-toast';
import ResponsiveImageView from 'react-native-responsive-image-view';
import { StackActions, NavigationActions } from 'react-navigation';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import ResponsiveImage from 'react-native-responsive-image';
import { graphql, compose } from 'react-apollo';
import { BACKGROUND_COLOR } from '../statics/app_style';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// const images = [{
//   props: {
//     source: require('../statics/images/splash.jpg'),
//   }
// }]
// url: 'http://moshaver7ostad.ir/media/SPLASH.jpg'

class MainScreen extends Component {
  state = {
    infoModal: true,
    actionModal: false,
    quitModal: false,
    images: [],
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

  // componentDidMount() {
  //   images = [{
  //     props: {
  //       source: require('../statics/images/SPLASH.jpg'),
  //     }
  //   }]
  //
  //   this.setState({ images });
  // }

  chooseAction = () => {
    this.setState({ actionModal: true });
  }

  goToQuestionScreen = async() => {
    let grade = await AsyncStorage.getItem('grade');
    this.setState({ actionModal: false }, () => {
      this.props.navigation.navigate('question', { grade })
    });
  }

  signOut = () => {
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('grade');
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'welcome' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  showUnAvailableToast = () => {
    this.showToast('این قسمت در حال آماده شدن می باشد')
  }

  render () {
    return (
      <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
        <Toast
          spacing={SCREEN_WIDTH / 2}
          ref={ component => this._toast = component }>
          Unable to show Toast
        </Toast>

        <Header
          backgroundColor={BACKGROUND_COLOR}
          centerComponent={{ text: 'نرم افزار بانک سوالات امتحانی', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
          />

        <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR, justifyContent: 'flex-start' }}>
          <ResponsiveImageView source={require('../statics/images/splash_blue.jpg')}>
            {({ getViewProps, getImageProps }) => (
              <View {...getViewProps()}>
                <Image {...getImageProps()} />
              </View>
            )}
          </ResponsiveImageView>
        </View>

        <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'flex-end', flexDirection: 'row', paddingBottom: 48 }}>
          <TouchableOpacity
            onPress={() => this.setState({ quitModal: true })}
            style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: BACKGROUND_COLOR, backgroundColor: 'white', elevation: this.state.actionModal || this.state.quitModal ? 0 : 4, width: null }}
            >
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: BACKGROUND_COLOR }}>خروج از حساب کاربری</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.chooseAction()}
            style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: BACKGROUND_COLOR, backgroundColor: 'white', elevation: this.state.actionModal || this.state.quitModal ? 0 : 4, width: SCREEN_WIDTH / 4 }}
            >
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: BACKGROUND_COLOR }}>شروع</Text>
          </TouchableOpacity>
        </View>

        <Modal
          isOpen={this.state.actionModal}
          position={'bottom'}
          onClosed={() => this.setState({ actionModal: false })}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 2 / 4, backgroundColor: 'rgb(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={true}
          swipeToClose={false}
          backButtonClose={true}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'درخواست خود را انتخاب کنید', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around', backgroundColor: BACKGROUND_COLOR }}>
              <TouchableOpacity
                onPress={() => this.goToQuestionScreen()}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: BACKGROUND_COLOR, width: SCREEN_WIDTH * 3 / 4, backgroundColor: 'white', elevation: 4 }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: BACKGROUND_COLOR }}>بانک سوالات امتحانی</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.showUnAvailableToast()}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: 'gray', width: SCREEN_WIDTH * 3 / 4, backgroundColor: 'gray' }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>برنامه ریزی درسی</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.showUnAvailableToast()}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: 'gray', width: SCREEN_WIDTH * 3 / 4, backgroundColor: 'gray' }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>آشنایی با رشته های دانشگاهی</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.showUnAvailableToast()}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: 'gray', width: SCREEN_WIDTH * 3 / 4, backgroundColor: 'gray' }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>اطلاعیه ها</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          isOpen={this.state.quitModal}
          position={'center'}
          onClosed={() => this.setState({ quitModal: false })}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 3, backgroundColor: 'rgb(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={true}
          swipeToClose={true}
          backButtonClose={true}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'خروج از حساب کاربری', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              />

            <View style={{ padding: 12, paddingBottom: 24, marginBottom: 24 }}>
              <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Vazir-Medium', color: 'white', fontSize: 20, textAlign: 'center' }}>آیا از خروج اطمینان دارید؟</Text>
              </View>
            </View>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => this.setState({ quitModal: false })}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: BACKGROUND_COLOR, width: SCREEN_WIDTH / 4, backgroundColor: 'white' }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: BACKGROUND_COLOR }}>خیر</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.signOut()}
                style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: BACKGROUND_COLOR, width: SCREEN_WIDTH / 4, backgroundColor: 'white' }}
                >
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: BACKGROUND_COLOR }}>بلی</Text>
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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
}

export default compose(
)(MainScreen)
//
// export { MainScreen };

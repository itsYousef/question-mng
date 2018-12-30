import React from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { BACKGROUND_COLOR } from '../statics/app_style';
import Pdf from 'react-native-pdf';
import LottieView from 'lottie-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('swipe_left', () => require('../statics/animations/swipe_left.json')),
];

class PdfQScreen extends React.Component {
  static navigationOptions = () => ({
    title: "سوال ها",
  });

  state = {
    loading: true,
    error: false,
    helpAnim: true,
    isPlaying: true,
    isInverse: false,
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ helpAnim: false });
    }, 3500);
  }

  renderLeftComponent = () => {
    return (
      <TouchableOpacity style={{ backgroundColor: 'transparent' }} onPress={() => this.props.navigation.goBack()}>
        <Icon
          name="chevron-left"
          color='white'
          size={25}
          />
      </TouchableOpacity>
    );
  }

  setAnim = anim => {
    this.anim = anim;
  }

  renderHelpAnim = () => {
    const { isPlaying, isInverse, progress } = this.state;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH, height: SCREEN_HEIGHT, position: 'absolute' }}>
        <LottieView
          ref={this.setAnim}
          autoPlay={!progress}
          style={[EXAMPLES[0].width && { width: EXAMPLES[0].width }, isInverse && styles.lottieViewInvse]}
          source={EXAMPLES[0].getJson()}
          progress={progress}
          loop={true}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    );
  }

  render() {
    const source = { uri: this.props.navigation.state.params.uriQ, cache: !this.state.error };

    return (
      <View style={styles.container}>
        {/*<Header
          backgroundColor={BACKGROUND_COLOR}
          centerComponent={{ text: 'موسسه ۷ استاد', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
          leftComponent={this.renderLeftComponent()}
          />*/}

        {this.state.loading
          ?
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 18, color: 'white', textAlign: 'center' }}>در حال دریافت فایل سوالات</Text>
          </View>
          :
          null
        }

        {this.state.error
          ?
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 18, color: 'white', textAlign: 'center' }}>دریافت فایل با مشکل مواجه شد</Text>
          </View>
          :
          <View style={{ flex: 1 }}>
            <Pdf
              activityIndicatorProps={{
                color: '#FFF',
                progressTintColor: '#FFF',
                borderWidth: 10,
              }}
              source={source}
              onLoadComplete={(numberOfPages,filePath)=>{
                // console.log(`number of pages: ${numberOfPages}`);
                this.setState({ loading: false, error: false })
              }}
              onPageChanged={(page,numberOfPages)=>{
                // console.log(`current page: ${page}`);
              }}
              onError={(error)=>{
                // console.log(error);
                this.setState({ error: true })
              }}
              style={styles.pdf}
            />

            {this.state.helpAnim
              ?
              this.renderHelpAnim()
              :
              null
            }
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  pdf: {
    flex:1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  }
});

export default PdfQScreen;
// export { PdfQScreen };

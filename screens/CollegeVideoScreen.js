import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  TouchableWithoutFeedback,
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { BACKGROUND_COLOR } from '../statics/app_style';
import Video from 'react-native-video';
import LottieView from 'lottie-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { Bar } from 'react-native-progress';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('loading', () => require('../statics/animations/preloader.json')),
];

class CollegeVideoScreen extends Component {
  static navigationOptions = () => ({
    title: "ویدیو آموزشی",
  });

  state = {
    loading: true,
    error: false,
    isInverse: false,
    loop: true,
    downloadProgress: 0,
    orientation: 'portrait',
    paused: false,
    playProgress: 0,
    duration: 0,
    showControls: true,
    errorTime: 0,
  }

  fetchFile = (videoUrl) => {
    let dirs = RNFetchBlob.fs.dirs;
    let video_list = this.props.navigation.state.params.videoUrl.split('/');

    let videoName = video_list[video_list.length - 1];
    if (this.state.errorTime == 2) {
      return ;
    }

    this.setState({ loading: true, errorTime: this.state.errorTime + 1 });
    RNFetchBlob
    .config({
      // response data will be saved to this path if it has access right.
      path : dirs.DownloadDir + '/questionBankVideos/' + videoName,
    })
    .fetch('GET', videoUrl, {
      //some headers ..
    })
    .progress((received, total) => {
      this.setState({ downloadProgress: received / total });
    })
    .then((res) => {
      // the path should be dirs.DocumentDir + 'path-to-file.anything'
      this.setState({ loading: false });
      // console.log('The file saved to ', res.path());
    })
    .catch((err) => {
      this.setState({ loading: false, error: true });
      // console.log(err);
    })
  }

  secondsToTime(time) {
    return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
  }

  componentWillMount() {
    let videoName = '';
    if (this.props.navigation.state) {
      if (this.props.navigation.state.params) {
        let video_list = this.props.navigation.state.params.videoUrl.split('/');

        videoName = video_list[video_list.length - 1];
      }
    }
    let dir = "file://" + RNFetchBlob.fs.dirs.DownloadDir + '/questionBankVideos/' + videoName;

    RNFetchBlob.fs.readFile(dir, 'base64')
    .then((data) => {
      this.setState({ loading: false, error: false });
    })
    .catch((err) => {
      this.fetchFile(this.props.navigation.state.params.videoUrl);
    });
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

  toggleOrientation = () => {
    this.setState(function(prevState, props){
      return {
        orientation: prevState.orientation === 'landscape' ? 'portrait' : 'landscape',
      }
    });
  }

  onLoad = (meta) => {
    this.setState({ loading: false, duration: meta.duration });
  }

  handleProgressPress = e => {
    const position = e.nativeEvent.locationX;
    let threshold = SCREEN_WIDTH / 2
    const progress = (position / threshold) * this.state.duration;

    this.video.seek(progress);
  };

  handleMainButtonTouch = () => {
    if (this.state.playProgress >= 1) {
      this.video.seek(0);
    }

    this.setState(state => {
      return {
        paused: !state.paused,
      }
    });
  };

  toggleShowControls = () => {
    this.setState(state => {
      return {
        showControls: !state.showControls,
      }
    });
  }

  handleProgress = progress => {
    this.setState({
      playProgress: progress.currentTime / this.state.duration,
    });
  };

  handleEnd = () => {
    this.setState({ paused: true });
  };

  render() {
    let videoName = '';
    if (this.props.navigation.state) {
      if (this.props.navigation.state.params) {
        let video_list = this.props.navigation.state.params.videoUrl.split('/');

        videoName = video_list[video_list.length - 1];
      }
    }
    let dir = "file://" + RNFetchBlob.fs.dirs.DownloadDir + "/questionBankVideos/" + videoName;

    return (
      <View style={styles.container}>
        {this.state.loading
          ?
          <View style={{ alignItems: 'center', justifyContent: 'space-around', paddingTop: 24, height: SCREEN_HEIGHT / 3 }}>
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 18, color: 'white', textAlign: 'center' }}>در حال دریافت ویدیو آموزشی</Text>

            <Bar progress={this.state.downloadProgress} size={SCREEN_WIDTH / 4} color={'white'} />
          </View>
          :
          null
        }

        {this.state.error || this.state.errorTime > 2
          ?
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 18, color: 'white', textAlign: 'center' }}>دریافت فایل با خطا مواجه شد</Text>
          </View>
          :
          null
        }

        {!this.state.loading && !this.state.error && this.state.errorTime < 3
          ?
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.toggleShowControls}>
              <Video source={{ uri: dir }}
                ref={(ref: Video) => {
                  this.video = ref
                }}
                paused={this.state.paused}
                resizeMode="contain"
                onLoad={this.onLoad}
                onLoadStart={this.onLoadStart}
                onProgress={this.handleProgress}
                maxBitRate={2000000}
                fullscreenOrientation={'landscape'}
                onError={(err) => {
                  this.fetchFile(this.props.navigation.state.params.videoUrl);
                }}
                onEnd={this.handleEnd}
                onBuffer={this.onBuffer}
                style={[styles.backgroundVideo, this.state.orientation === 'landscape' ? { transform: [{ rotate: '90deg' }], width: SCREEN_HEIGHT, height: SCREEN_WIDTH - 70 } : { width: SCREEN_WIDTH }]} />
            </TouchableWithoutFeedback>
          </View>
          :
          null
        }

        {!this.state.loading && !this.state.error && this.state.showControls && this.state.errorTime < 3
          ?
          <View
            style={styles.controls}
            >
            <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
              <Icon type="font-awesome" name={!this.state.paused ? "pause" : "play"} size={30} color="#FFF" />
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={this.handleProgressPress}>
              <View>
                <Bar
                  progress={this.state.playProgress}
                  color="#FFF"
                  unfilledColor="rgba(255,255,255,.5)"
                  borderColor="#FFF"
                  width={SCREEN_WIDTH / 2}
                  height={20}
                />
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={this.toggleOrientation}>
              <Icon name={this.state.orientation == 'landscape' ? 'portrait' : 'landscape'} size={30} color="#FFF" />
            </TouchableWithoutFeedback>

            <Text style={styles.duration}>
              {this.secondsToTime(Math.floor(this.state.playProgress * this.state.duration))}
            </Text>
          </View>
          :
          null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundVideo: {
    flex: 1,
  },
  controls: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: 48,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    bottom: 0,
    width: SCREEN_WIDTH,
  },
  duration: {
    color: "#FFF",
    marginLeft: 15,
    fontFamily: 'Vazir-Medium',
  },
});

export default CollegeVideoScreen;
// export { PdfAScreen };

import React, { Component } from 'react';
import { View, Text, Dimensions, Picker, ScrollView, TouchableOpacity, Linking, PermissionsAndroid } from 'react-native';
import Toast from '../modules/react-native-smart-toast';
import LottieView from 'lottie-react-native';
import { Header, Icon } from 'react-native-elements';
import { graphql, compose } from 'react-apollo';
import Modal from 'react-native-modalbox';
import { BACKGROUND_COLOR } from '../statics/app_style';
import {
  GET_VIDEO_MAJOR,
  GET_VIDEO_FILES,
} from '../Graphql';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('loading', () => require('../statics/animations/preloader.json')),
];

class MajorKnowQuestionScreen extends Component {
  // static navigationOptions = () => ({
  //   tabBarIcon: ({ tintColor }) => {
  //     return <Icon name="book" size={24} color={tintColor} />;
  //   }
  // });

  constructor(props) {
    super(props);
    this.state = {
      choosingModal: true,
      majorList: [],
      major: '',
      allVideoFiles: [],
      videoFileList: [],
      videoFile: '',
      selectedVideoObject: {},
      majorIsOk: false,
      videoIsOk: false,
      loading: false,
      isInverse: false,
      loop: true,
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   const { getGrade } = nextProps;
  //   if (getGrade && ! getGrade.loading && !getGrade.error) {
  //     gradeList = [];
  //     for (grade of getGrade.getGrade) {
  //       gradeList.push(<Picker.Item label={grade} value={grade} key={grade} />)
  //     }
  //
  //     this.setState({ gradeList });
  //   }
  // }

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

  componentDidMount() {
    this.props.getVideoMajor.refetch()
    .then(res => {
      this.setMajorList(res.data.getVideoMajor);
    })
    .catch(err => {
      this.showToast('خطا در برقراری ارتباط با سرور');
    });
  }

  setMajorList = (majors) => {
    let majorList = [];
    for (let major of majors) {
      majorList.push(<Picker.Item label={major.title} value={major.title} key={major.title} />)
    }

    this.setState({ majorList });

    if (majorList.length > 0) {
      this.setMajor(majorList[0].props.value);
    }
  }

  setMajor = (major) => {
    this.setState({ major, majorIsOk: true, videoIsOk: false });
    this.props.getVideoFile.refetch({
      major
    })
    .then(res => {
      this.setVideos(res.data.getVideoFile);
    })
    .catch(err => {
      this.showToast('خطا در برقراری ارتباط با سرور');
    });
  }

  setVideos = (videoFiles) => {
    let videoFileList = [];

    for (let videoFile of videoFiles) {
      videoFileList.push(<Picker.Item label={videoFile.title} value={videoFile.title} key={videoFile.title} />);
    }

    let allVideoFiles = [];
    for (let videoFile of videoFiles) {
      allVideoFiles.push(videoFile);
    }

    this.setState({ videoFileList, allVideoFiles });

    if (videoFileList.length > 0) {
      this.setVideoFile(videoFileList[0].props.value);
    }
  }

  setVideoFile = (videoFile) => {
    this.setState({ videoFile, videoIsOk: true });
    let index = 0;
    for (let video of this.state.allVideoFiles) {
      if (video.title == videoFile) {
        break;
      }
      index ++;
    }

    this.setState({ selectedVideoObject: this.state.allVideoFiles[index] });
  }

  refetchMajors = () => {
    this.props.getVideoMajor.refetch()
    .then(res => {
      this.setMajorList(res.data.getVideoMajor);
    })
    .catch(err => {
      this.showToast('خطا در برقراری ارتباط با سرور');
    });
  }

  renderRightComponent() {
    return (
      <TouchableOpacity
        style={{ padding: 4, width: null }}
        onPress={() => this.refetchMajors()}
        >
        <Icon
          name='refresh'
          size={20}
          color='white'
          />
      </TouchableOpacity>
    );
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

  setChapterList = (chapters) => {
    chapterList = [];

    for (chapter of chapters) {
      chapterList.push(<Picker.Item label={chapter} value={chapter} key={chapter} />);
    }

    this.setState({ chapterList });

    if (chapterList.length > 0)
      this.setChapter(chapterList[0].props.value);
  }

  isAllOkToContinue = () => {
    return this.state.majorIsOk && this.state.videoIsOk;
  }

  checkPermissionAndGo = async() => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          'title': 'اجازه دسترسی به خواندن حافظه',
          'message': 'برای استفاده از امکانات بهتر این اپلیکیشن نیاز است که اجازه دسترسی به خواندن حافظه را بدهید.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera")
      } else {
        console.log("Camera permission denied")
      }
      console.log(granted);
    } catch (err) {
      console.warn(err)
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          'title': 'اجازه دسترسی به نوشتن روی حافظه',
          'message': 'برای استفاده از امکانات بهتر این اپلیکیشن نیاز است که اجازه دسترسی به نوشتن بر روی حافظه داخلی را بدهید.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera")
      } else {
        console.log("Camera permission denied")
      }
      console.log(granted);
    } catch (err) {
      console.warn(err)
    }

    this.setState({ loading: false });
    this.props.navigation.navigate('college');
  }

  getVideoFiles = () => {
    const { selectedVideoObject } = this.state;

    this.props.navigation.navigate('college', { videoUrl: selectedVideoObject.video, pdfUrl: selectedVideoObject.pdf });
  }

  setAnim = anim => {
    this.anim = anim;
  };

  renderLoading = () => {
    const { isInverse, progress, loop } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH, height: SCREEN_WIDTH / 3, paddingTop: 48 }}>
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

  render () {
    return (
      <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
        <Toast
          ref={ component => this._toast = component }
          marginTop={64}>
          Unable to show Toast
        </Toast>

        <Modal
          isOpen={this.state.choosingModal}
          position={"center"}
          onClosed={() => this.setState({ choosingModal: false })}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: 'rgba(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={false}
          swipeToClose={false}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'دانش آموز عزیز، انتخابتو انجام بده', style: { color: 'white', fontSize: 14, fontFamily: 'Vazir-Medium' } }}
              leftComponent={this.renderLeftComponent()}
              rightComponent={this.renderRightComponent()}
              />

            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
              <View style={{ padding: 12, paddingBottom: 24, marginBottom: 24, borderBottomWidth: 1, borderColor: BACKGROUND_COLOR }}>
                <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Vazir-Medium', color: 'gray', fontSize: 20, textAlign: 'center' }}>لطفا رشته پایه را انتخاب کنید</Text>
                </View>

                <View style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25 }}>
                  <Picker
                    style={{ flex: 1, color: BACKGROUND_COLOR, alignItems: 'center' }}
                    selectedValue={this.state.major}
                    onValueChange={major => this.setMajor(major)}
                    >
                    {this.state.majorList}
                  </Picker>
                </View>
              </View>

              <View style={{ padding: 12, paddingBottom: 24, borderBottomWidth: 1, borderColor: BACKGROUND_COLOR }}>
                <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Vazir-Medium', color: 'gray', fontSize: 20, textAlign: 'center' }}>لطفا رشته دانشگاهی را انتخاب کنید</Text>
                </View>

                <View style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25 }}>
                  <Picker
                    style={{ flex: 1, color: BACKGROUND_COLOR, alignItems: 'center' }}
                    selectedValue={this.state.videoFile}
                    onValueChange={videoFile => this.setVideoFile(videoFile)}
                    >
                    {this.state.videoFileList}
                  </Picker>
                </View>
              </View>

              {this.state.loading
                ?
                this.renderLoading()
                :
                <View style={{ width: SCREEN_WIDTH, justifyContent: 'flex-start', alignItems: 'center', flex: 1, paddingTop: 24, paddingBottom: 24 }}>
                  <TouchableOpacity
                    onPress={() => this.isAllOkToContinue() ? this.getVideoFiles() : null}
                    style={{ padding: 8, margin: 8, borderRadius: 15, backgroundColor: this.isAllOkToContinue() ? BACKGROUND_COLOR : 'gray', width: null, elevation: 4 }}
                    >
                    <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>دریافت فایل های آموزشی</Text>
                  </TouchableOpacity>
                </View>
              }
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}

export default compose(
  graphql(GET_VIDEO_MAJOR, { name: 'getVideoMajor' }),
  graphql(GET_VIDEO_FILES, {
    name: 'getVideoFile',
    options: (props) => ({ variables: { major: '' }}),
  }),
)(MajorKnowQuestionScreen)

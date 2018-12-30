import React, { Component } from 'react';
import { View, Text, Dimensions, Picker, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Toast from '../modules/react-native-smart-toast';
import LottieView from 'lottie-react-native';
import { Header, Icon } from 'react-native-elements';
import { graphql, compose } from 'react-apollo';
import Modal from 'react-native-modalbox';
import { BACKGROUND_COLOR } from '../statics/app_style';
import {
  GET_GRADE,
  GET_BOOKNAME,
  GET_MABHAS,
  GET_FILE_ADDRESS,
} from '../Graphql';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('loading', () => require('../statics/animations/preloader.json')),
];

class QuestionScreen extends Component {
  // static navigationOptions = () => ({
  //   tabBarIcon: ({ tintColor }) => {
  //     return <Icon name="book" size={24} color={tintColor} />;
  //   }
  // });

  constructor(props) {
    super(props);
    this.state = {
      choosingModal: true,
      grade: this.props.navigation.state.params.grade,
      gradeList: [],
      bookList: [],
      bookValue: '',
      chapterList: [],
      chapterValue: '',
      bookIsOk: false,
      chapterIsOk: false,
      loading: false,
      isPlaying: true,
      isInverse: false,
      loop: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { getGrade } = nextProps;
    if (getGrade && ! getGrade.loading && !getGrade.error) {
      gradeList = [];
      for (grade of getGrade.getGrade) {
        gradeList.push(<Picker.Item label={grade} value={grade} key={grade} />)
      }

      this.setState({ gradeList });
    }
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

  componentDidMount() {
    this.props.getBookname.refetch({
      grade: this.props.navigation.state.params.grade,
    })
    .then(res => {
      this.setBookList(res.data.getBookname);
    })
    .catch(err => {
      // console.log(err);
      // this.showToast('گرفتن اطلاعات پایه با خطا مواجه شد');
    });
  }

  refetchBooks = () => {
    this.props.getBookname.refetch({
      grade: this.props.navigation.state.params.grade,
    })
    .then(res => {
      this.setBookList(res.data.getBookname);
    })
    .catch(err => {
      // console.log(err);
      this.showToast('گرفتن اطلاعات پایه با خطا مواجه شد');
    });
  }

  renderRightComponent() {
    return (
      <TouchableOpacity
        style={{ padding: 4, width: null }}
        onPress={() => this.refetchBooks()}
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

  setBookList = (books) => {
    bookList = [];

    for (book of books) {
      bookList.push(<Picker.Item label={book} value={book} key={book} />);
    }

    this.setState({ bookList });

    if (bookList.length > 0)
      this.setBook(bookList[0].props.value);
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

  setGrade = (grade) => {
    this.setState({ grade, bookIsOk: false });

    this.props.getBookname.refetch({
      grade,
    })
    .then(res => {
      this.setBookList(res.data.getBookname);
    })
    .catch(err => {
      // console.log(err);
      this.showToast('گرفتن اطلاعات پایه با خطا مواجه شد');
    });
  }

  setBook = (bookValue) => {
    this.setState({ bookValue, bookIsOk: true, chapterIsOk: false });

    this.props.getChapter.refetch({
      grade: this.state.grade,
      bookName: bookValue,
    })
    .then(res => {
      this.setChapterList(res.data.getMabhas);
    })
    .catch(err => {
      // console.log(err);
      // this.showToast('گرفتن اطلاعات سرفصل ها با خطا مواجه شد');
    });
  }

  setChapter = (chapterValue) => {
    this.setState({ chapterValue, chapterIsOk: true });
  }

  isAllOkToContinue = () => {
    return this.state.bookIsOk && this.state.chapterIsOk;
  }

  getQuestionsAndAnswers = () => {
    this.setState({ loading: true });

    const { bookValue, chapterValue } = this.state;

    this.props.getFiles.refetch({
      grade: this.state.grade,
      bookName: bookValue,
      mabhas: chapterValue,
    })
    .then(res => {
      // console.log(res);
      this.setState({ loading: false });
      if (res.data.getFiles.length == 0 || res.data.getFiles[0].question == "" || res.data.getFiles[0].answer == "") {
        this.showToast('در حال حاضر سوالی برای این مبحث موجود نیست');
        return;
      }

      this.props.navigation.navigate('pdfs', { uriQ: res.data.getFiles[0].question, uriA: res.data.getFiles[0].answer });
    })
    .catch(err => {
      // console.log(err);
      this.showToast('گرفتن اطلاعات با خطا مواجه شد. لطفا بعدا دوباره تلاش کنید');
      this.setState({ loading: false });
    });
  }

  getAnswers = () => {
    this.setState({ loading: true });

    const { bookValue, chapterValue } = this.state;

    this.props.getFiles.refetch({
      bookName: bookValue,
      mabhas: chapterValue,
    })
    .then(res => {
      // console.log(res);
      this.setState({ loading: false });
      if (res.data.getFiles.length == 0 || res.data.getFiles[0].answer == "") {
        this.showToast('در حال حاضر پاسخ نامه ای برای این قسمت موجود نیست');
        return;
      }

      this.props.navigation.navigate('pdf', { uri: res.data.getFiles[0].answer });
    })
    .catch(err => {
      // console.log(err);
      this.showToast('گرفتن اطلاعات با خطا مواجه شد. لطفا بعدا دوباره تلاش کنید');
      this.setState({ loading: false });
    });
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
                  <Text style={{ fontFamily: 'Vazir-Medium', color: 'gray', fontSize: 20, textAlign: 'center' }}>مقطع تحصیلی شما <Text style={{ color: BACKGROUND_COLOR }}>{this.state.grade}</Text> می باشد</Text>
                </View>
              </View>

              <View style={{ padding: 12, paddingBottom: 24, marginBottom: 24, borderBottomWidth: 1, borderColor: BACKGROUND_COLOR }}>
                <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Vazir-Medium', color: 'gray', fontSize: 20, textAlign: 'center' }}>مقطع را انتخاب کنید</Text>
                </View>

                <View style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25 }}>
                  <Picker
                    style={{ flex: 1, color: BACKGROUND_COLOR, alignItems: 'center' }}
                    selectedValue={this.state.grade}
                    onValueChange={grade => this.setGrade(grade)}
                    >
                    {this.state.gradeList}
                  </Picker>
                </View>
              </View>

              <View style={{ padding: 12, paddingBottom: 24, marginBottom: 24, borderBottomWidth: 1, borderColor: BACKGROUND_COLOR }}>
                <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Vazir-Medium', color: 'gray', fontSize: 20, textAlign: 'center' }}>لطفا درس را انتخاب کنید</Text>
                </View>

                <View style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25 }}>
                  <Picker
                    style={{ flex: 1, color: BACKGROUND_COLOR, alignItems: 'center' }}
                    selectedValue={this.state.bookValue}
                    onValueChange={bookValue => this.setBook(bookValue)}
                    >
                    {this.state.bookList}
                  </Picker>
                </View>
              </View>

              <View style={{ padding: 12, paddingBottom: 24, borderBottomWidth: 1, borderColor: BACKGROUND_COLOR }}>
                <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Vazir-Medium', color: 'gray', fontSize: 20, textAlign: 'center' }}>لطفا مبحث را انتخاب کنید</Text>
                </View>

                <View style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25 }}>
                  <Picker
                    style={{ flex: 1, color: BACKGROUND_COLOR, alignItems: 'center' }}
                    selectedValue={this.state.chapterValue}
                    onValueChange={chapterValue => this.setChapter(chapterValue)}
                    >
                    {this.state.chapterList}
                  </Picker>
                </View>
              </View>

              {/*<View style={{ alignItems: 'center', flex: 1, paddingLeft: 4, paddingRight: 4, paddingTop: 48 }}>
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                  درس و مبحث مورد نظر را انتخاب کنید و برای دیدن سوالات و پاسخ ها، دکمه ی زیر را فشار دهید
                </Text>
              </View>*/}

              {this.state.loading
                ?
                this.renderLoading()
                :
                <View style={{ width: SCREEN_WIDTH, justifyContent: 'flex-start', alignItems: 'center', flex: 1, paddingTop: 24, paddingBottom: 24 }}>
                  <TouchableOpacity
                    onPress={() => this.isAllOkToContinue() ? this.getQuestionsAndAnswers() : null}
                    style={{ padding: 8, margin: 8, borderRadius: 15, backgroundColor: this.isAllOkToContinue() ? BACKGROUND_COLOR : 'gray', width: null, elevation: 4 }}
                    >
                    <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>دریافت سوالات و پاسخ ها</Text>
                  </TouchableOpacity>

                  {/*<TouchableOpacity
                    onPress={() => this.isAllOkToContinue() ? this.getAnswers() : null}
                    style={{ padding: 8, margin: 8, borderWidth: 2, borderRadius: 15, borderColor: this.isAllOkToContinue() ? BACKGROUND_COLOR : 'gray', width: SCREEN_WIDTH / 2 }}
                    >
                    <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: this.isAllOkToContinue() ? BACKGROUND_COLOR : 'gray' }}>دریافت پاسخ سوالات</Text>
                  </TouchableOpacity>*/}
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
  graphql(GET_GRADE, {
    name: 'getGrade',
  }),
  graphql(GET_BOOKNAME, {
    name: 'getBookname',
    options: (props) => ({ variables: { grade: props.navigation.state.params.grade }}),
  }),
  graphql(GET_MABHAS, {
    name: 'getChapter',
    options: (props) => ({ variables: { grade: props.navigation.state.params.grade, bookName: '' }}),
  }),
  graphql(GET_FILE_ADDRESS, { name: 'getFiles' }),
)(QuestionScreen)

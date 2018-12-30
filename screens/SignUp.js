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
  ScrollView,
  Picker,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Toast from '../modules/react-native-smart-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextField } from '../modules/react-native-material-textfield';
import { Header, Icon, Button } from 'react-native-elements';
import { StackActions, NavigationActions } from 'react-navigation';
import { graphql, compose } from 'react-apollo';
import Modal from 'react-native-modalbox';
import { BACKGROUND_COLOR, SECONDARY_COLOR, HEADER_COLOR } from '../statics/app_style';
import {
  SIGNUP_USER,
  GET_GRADE,
} from '../Graphql';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('loading', () => require('../statics/animations/preloader.json')),
];

class SignUp extends Component {
  state = {
    showPassword: false,
    loading: false,
    isPlaying: true,
    isInverse: false,
    loop: true,
    gradeList: [],
    grade: '',
    ssn: '',
    ssnError: '',
    phoneNumber: '',
    phoneNumberError: '',
    activation: '',
    activationError: '',
    gradeModal: true,
    ssnModal: false,
    phoneNumberModal: false,
    registryModal: false,
    activationCode: '',
    token: '',
    ssnDuplicateError: false,
  }

  componentWillReceiveProps(nextProps) {
    const { getGrade } = nextProps;

    if (getGrade && !getGrade.loading && !getGrade.error) {
      this.setGrades(getGrade.getGrade);
    }

    if (getGrade && getGrade.error) {
      this.showToast('گرفتن اطلاعات مقطع با خطا مواجه شد');
    }
  }

  setGrades = (grades) => {
    gradeList = [];
    gradeList.push(<Picker.Item label={"انتخاب پایه تحصیلی"} value={"انتخاب پایه تحصیلی"} key={"انتخاب پایه تحصیلی"} />);
    for (grade of grades) {
      gradeList.push(<Picker.Item label={grade} value={grade} key={grade} />);
    }

    grade = this.state.grade;
    if (gradeList.length > 0 && grade == '') {
      grade = gradeList[0].props.value;
    }

    this.setState({ gradeList, grade });
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

  renderButton() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around', backgroundColor: 'tranparent' }}>

        {/*<Button
          large
          borderRadius={30}
          fontSize={20}
          buttonStyle={{ width: SCREEN_WIDTH/1.5, borderWidth: 1, borderColor: SECONDARY_COLOR }}
          onPress={() => this.props.navigation.navigate('login')}
          iconRight={{name: 'sign-in', type: 'octicon', color: SECONDARY_COLOR}}
          title='ورود'
          backgroundColor='tranparent'
          textStyle={{ color: SECONDARY_COLOR, fontFamily: 'Vazir-Medium' }}
          />*/}
      </View>
    );
  }

  refetchGrades = () => {
    this.props.getGrade.refetch()
    .then(res => {
      this.setGrades(res.data.getGrade);
    })
    .catch(err => {
      // console.log(err);
      this.showToast('گرفتن اطلاعات مقطع با مشکل مواجه شد');
    });
  }

  goModalBack = () => {
    if (this.state.phoneNumberModal) {
      this.setState({ phoneNumberModal: false, ssnModal: true });
    } else if (this.state.ssnModal) {
      this.setState({ ssnModal: false, gradeModal: true });
    }
  }

  renderLeftComponent() {
    return (
      <TouchableOpacity
        style={{ padding: 4, width: null }}
        onPress={() => this.goModalBack()}
        >
        <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 12, color: 'white' }}>قبلی</Text>
      </TouchableOpacity>
    );
  }

  renderRightComponent() {
    return (
      <TouchableOpacity
        style={{ padding: 4, width: null }}
        onPress={() => this.refetchGrades()}
        >
        <Icon
          name='refresh'
          size={20}
          color='white'
          />
      </TouchableOpacity>
    );
  }

  setAnim = anim => {
    this.anim = anim;
  };

  renderLoading = () => {
    const { isInverse, progress, loop } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH }}>
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

  changeSsn = (ssn) => {
    this.setState({ ssn });
  }

  changePhoneNumber = (phoneNumber) => {
    this.setState({ phoneNumber });
  }

  phoneNumberRegex(input) {
    return /^(\+98|0)?9\d{9}$/.exec(input);
  }

  ssnRegex(input) {
    if (!/^\d{10}$/.test(input))
      return false;
    var check = parseInt(input[9]);
    var sum = 0;
    var i;
    for (i = 0; i < 9; ++i) {
      sum += parseInt(input[i]) * (10 - i);
    }
    sum %= 11;
    return (sum < 2 && check == sum) || (sum >= 2 && check + sum == 11);
  }

  check_error(list, arg1, arg2) {
    arg1_exists = false;
    for (i of list) {
      if (arg1 == i) {
        arg1_exists = true;
        break;
      }
    }

    arg2_exists = false;
    for (i of list) {
      if (arg2 == i) {
        arg2_exists = true;
        break;
      }
    }

    return arg1_exists && arg2_exists;
  }

  signUpUser = () => {
    variables = {
      grade: this.state.grade,
      nationalCode: this.state.ssn,
      phoneNumber: this.state.phoneNumber,
    }

    this.props.signUp({
      variables,
    })
    .then(res => {
      // console.log(res);
      this.setState({
        loading: false,
        phoneNumberModal: false,
        registryModal: true,
        activationCode: res.data.signUp.moshaverUser.activationCode,
        token: res.data.signUp.moshaverUser.token,
      });
      this.showToast('درخواست شما ثبت شد. منتظر دریافت کد فعال سازی باشید تا ثبت نام شما پایان یابد.');
    })
    .catch(err => {
      err_message = err.toString().split(' ');
      // console.log(err_message);
      if (this.check_error(err_message, 'register', '2')) {
        this.showToast('شما نمیتوانید در یک سال تحصیلی در دو مقطع ثبت نام کنید');
        this.setState({ ssnDuplicateError: true, loading: false, phoneNumberModal: false, ssnModal: true });
        return;
      }
      this.setState({ loading: false });
      this.showToast('خطا در برقراری ارتباط با سرور. لطفا ورودی های خود را چک کنید و دوباره تلاش کنید');
    });
  }

  checkPhoneNumber = () => {
    phoneNumber = this.state.phoneNumber;
    if (!this.phoneNumberRegex(phoneNumber)) {
      this.setState({ phoneNumberError: 'شماره وارد شده نامعتبر است' });
      this.showToast('شماره وارد شده نامعتبر است');
      return;
    }

    this.setState({
      loading: true
    });

    this.signUpUser();
  }

  checkGrade = () => {
    if (this.state.grade != 'انتخاب پایه تحصیلی' && this.state.grade != '') {
      this.setState({ gradeModal: false, ssnModal: true });
    } else {
      this.showToast('مقطعی انتخاب نشده است')
    }
  }

  checkSSN = () => {
    ssn = this.state.ssn;
    if (!this.ssnRegex(ssn)) {
      this.setState({ ssnError: 'کد ملی وارد شده نا معتبر است' });
      this.showToast('کد ملی وارد شده نامعتبر است');
      return;
    }

    this.setState({
      ssnError: '',
      ssnModal: false,
      phoneNumberModal: true,
    });
  }

  login = () => {
    AsyncStorage.setItem('token', this.state.token);
    AsyncStorage.setItem('grade', this.state.grade);
    AsyncStorage.setItem('V1', 'V1');
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'main' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  changeActivation = (activation) => {
    this.setState({ activation }, () => {
      if (this.state.activation === this.state.activationCode) {
        this.login();
      }
    });
  }

  checkActivation = () => {
    if (this.state.activation !== this.state.activationCode) {
      this.setState({ activationError: 'کد وارد شده صحیح نمیباشد' });
      this.showToast('کد وارد شده صحیح نیست');
      return;
    }

    this.login();
  }

  render() {
    return (
      <View style={{ backgroundColor: BACKGROUND_COLOR, flex: 1 }}>
        <Toast
          spacing={SCREEN_WIDTH / 2}
          ref={ component => this._toast = component }>
          Unable to show Toast
        </Toast>

        {/*<View style={{ backgroundColor: HEADER_COLOR, alignItems: 'center', justifyContent: 'center', elevation: 3, padding: 8 }}>
          <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 25, color: 'white' }}>ثبت نام</Text>
        </View>*/}

        <Modal
          isOpen={this.state.gradeModal}
          position={"bottom"}
          onClosed={() => this.setState({ gradeModal: false })}
          style={{ width: SCREEN_WIDTH, flex: 1, backgroundColor: 'rgb(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={false}
          swipeToClose={false}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              rightComponent={this.renderRightComponent()}
              centerComponent={{ text: 'تعیین پایه تحصیلی دانش آموز', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              />

            <View style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25, flex: 1 }}>
              <Picker
                style={{ flex: 1, color: BACKGROUND_COLOR, alignItems: 'center' }}
                selectedValue={this.state.grade}
                onValueChange={grade => this.setState({ grade })}
                >
                {this.state.gradeList}
              </Picker>
            </View>

            <View style={{ alignItems: 'center', flex: 1, paddingLeft: 4, paddingRight: 4 }}>
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                توجه داشته باشید شما تنها به کتاب های این پایه تحصیلی دسترسی خواهید داشت
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => this.checkGrade()}
              style={{ padding: 8, margin: 8, borderRadius: 15, backgroundColor: this.state.grade != 'انتخاب پایه تحصیلی' && this.state.grade != '' ? BACKGROUND_COLOR : 'gray', width: SCREEN_WIDTH / 4, elevation: 4 }}
              >
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>بعدی</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          isOpen={this.state.ssnModal}
          position={"bottom"}
          onClosed={() => this.setState({ ssnModal: false })}
          style={{ width: SCREEN_WIDTH, flex: 1, backgroundColor: 'rgb(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={false}
          swipeToClose={false}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'کد ملی', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              leftComponent={this.renderLeftComponent()}
              />

            <View style={{ width: SCREEN_WIDTH, flex: 1, alignItems: 'center' }}>
              <View style={{ paddingRight: 25, paddingLeft: 25, width: SCREEN_WIDTH }}>
                <TextField
                  value={this.state.ssn}
                  label="کد ملی"
                  keyboardType='numeric'
                  title="ضروری"
                  error={this.state.ssnError}
                  onChangeText={this.changeSsn.bind(this)}
                  onFocus={() => this.setState({ssnError:'', ssnDuplicateError: false})}
                  fontSize={20}
                  editable={!this.state.loading}
                  baseColor={BACKGROUND_COLOR}
                  textColor={BACKGROUND_COLOR}
                  tintColor={BACKGROUND_COLOR}
                  />
              </View>
            </View>

            <View style={{ alignItems: 'center', flex: 1, paddingLeft: 4, paddingRight: 4 }}>
              {this.state.ssnDuplicateError
                ?
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 16, textAlign: 'center', color: 'rgb(212, 43, 84)' }}>
                  در این سال تحصیلی، با این کد ملی در یک مقطع دیگر ثبت نام شده است. لطفا برای ثبت نام در یک مقطع دیگر، از کد ملی دیگری استفاده کنید{'\n'}
                </Text>
                :
                null
              }
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 16, textAlign: 'center', color: 'gray' }}>
                دانش آموز محترم شما با این کدملی فقط می توانید به یک پایه دسترسی داشته باشید در صورت نیاز به تغییر پایه باید از طریق خروج از حساب کاربری، با یک کد ملی جدید دوباره ثبت نام کرده و وارد پایه جدید شوید
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => this.checkSSN()}
              style={{ padding: 8, margin: 8, borderRadius: 15, backgroundColor: BACKGROUND_COLOR, width: SCREEN_WIDTH / 4, elevation: 4 }}
              >
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>بعدی</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          isOpen={this.state.phoneNumberModal}
          position={"bottom"}
          onClosed={() => this.setState({ phoneNumberModal: false })}
          style={{ width: SCREEN_WIDTH, flex: 1, backgroundColor: 'rgba(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={false}
          swipeToClose={false}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'شماره تلفن', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              leftComponent={this.renderLeftComponent()}
              />

            <View style={{ flex: 1, backgroundColor: 'white' }}>
              <View style={{ width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                <View style={{ paddingRight: 25, paddingLeft: 25, width: SCREEN_WIDTH }}>
                  <TextField
                    value={this.state.phoneNumber}
                    label="شماره تلفن"
                    keyboardType='numeric'
                    title="ضروری"
                    error={this.state.phoneNumberError}
                    onChangeText={this.changePhoneNumber.bind(this)}
                    onFocus={() => this.setState({phoneNumberError:''})}
                    fontSize={20}
                    editable={!this.state.loading}
                    baseColor={BACKGROUND_COLOR}
                    textColor={BACKGROUND_COLOR}
                    tintColor={BACKGROUND_COLOR}
                    />
                </View>
              </View>

              <View style={{ alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'gray' }}>
                  09*********
                </Text>

                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'gray' }}>
                  یا
                </Text>

                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'gray' }}>
                  +989*********
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                  این شماره جهت ارسال کد فعالسازی برنامه می باشد{'\n'} پس از ارسال منتظر دریافت پیامک کد فعال سازی باشید.
                </Text>
              </View>

              {this.state.loading
                ?
                this.renderLoading()
                :
                <View style={{ width: SCREEN_WIDTH, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => this.checkPhoneNumber()}
                    style={{ padding: 8, margin: 8, borderRadius: 15, backgroundColor: BACKGROUND_COLOR, width: SCREEN_WIDTH / 4, elevation: 4 }}
                    >
                    <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>ارسال</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </View>
        </Modal>

        <Modal
          isOpen={this.state.registryModal}
          position={"bottom"}
          onClosed={() => this.setState({ registryModal: false })}
          style={{ width: SCREEN_WIDTH, flex: 1, backgroundColor: 'rgb(255, 255, 255)', marginRights: 25 }}
          backdropPressToClose={false}
          swipeToClose={false}
          animationDuration={400}
          backdropOpacity={0.4}
          >
          <View style={{ flex: 1 }}>
            <Header
              backgroundColor={BACKGROUND_COLOR}
              centerComponent={{ text: 'کد ارسال شده را وارد کنید', style: { color: 'white', fontSize: 15, fontFamily: 'Vazir-Medium' } }}
              />

            <View style={{ width: SCREEN_WIDTH, flex: 1, alignItems: 'center' }}>
              <View style={{ paddingRight: 25, paddingLeft: 25, width: SCREEN_WIDTH }}>
                <TextField
                  value={this.state.activation}
                  label="کد ارسال شده"
                  keyboardType='numeric'
                  title="ضروری"
                  error={this.state.activationError}
                  onChangeText={this.changeActivation.bind(this)}
                  onFocus={() => this.setState({activationError:''})}
                  fontSize={20}
                  editable={!this.state.loading}
                  baseColor={BACKGROUND_COLOR}
                  textColor={BACKGROUND_COLOR}
                  tintColor={BACKGROUND_COLOR}
                  />
              </View>
            </View>

            <View style={{ alignItems: 'center', flex: 1, paddingLeft: 4, paddingRight: 4 }}>
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 17, textAlign: 'center', color: 'gray' }}>
                منتظر دریافت پیام ما باشید و کدی که برایتان ارسال کردیم را در قسمت بالا وارد کنید
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => this.checkActivation()}
              style={{ padding: 8, margin: 8, borderRadius: 15, backgroundColor: BACKGROUND_COLOR, width: SCREEN_WIDTH / 4, elevation: 4 }}
              >
              <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 15, textAlign: 'center', color: 'white' }}>چک کن</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
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
    elevation: 4,
  },
  logoImage: {
    width: 80,
    height: 80,
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

export default compose(
  graphql(SIGNUP_USER, { name: 'signUp' }),
  graphql(GET_GRADE, { name: 'getGrade' }),
)(SignUp);
// compose(
//   graphql(SIGNUP_USER, { name: 'signUp' }),
// )(SignUp);
//
// export { SignUp };

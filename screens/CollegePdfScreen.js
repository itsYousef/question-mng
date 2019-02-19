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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class CollegePdfScreen extends React.Component {
  static navigationOptions = () => ({
    title: "فایل آموزشی",
  });

  state = {
    loading: true,
    error: false,
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

  render() {
    const source = { uri: this.props.navigation.state.params.pdfUrl, cache: !this.state.error };

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
            <Text style={{ fontFamily: 'Vazir-Medium', fontSize: 18, color: 'white', textAlign: 'center' }}>در حال دریافت فایل آموزشی</Text>
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
            style={styles.pdf}/>
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

export default CollegePdfScreen;
// export { PdfAScreen };

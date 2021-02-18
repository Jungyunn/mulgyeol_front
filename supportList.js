import React, { Component } from 'react';
import {
  Animated, StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TextInput,
  errortext, TouchableOpacity, Dimensions, Picker, Image, TouchableWithoutFeedback, Keyboard, AsyncStorage,
} from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon, Row } from 'native-base';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
const screenWidth = Math.round(Dimensions.get('window').width);
const deviceWidth = Dimensions.get('window').width - 20
const FIXED_BAR_WIDTH = 280
const BAR_SPACE = 10
const images = [
  'https://lh3.googleusercontent.com/kvVM3FtdHb92rtB0plul6njzQYx5rqL-rYS5WBGWdc_DsJYBraSbXqdvLTrjxuJxJAeyC-sVItm27iqec0gLBJKMaX1-JQ_1L5UKNkMZfyQgKvP57dlmi5DyyP5z67DmzExJWi5YMeZM_xDsTCFnMWm6L9-8g-jRU72nHajM7fbJu_YqVweD04-7RA6ymnx4Q_JlXa0Tjmm0I4ZmsV2VL3iYTHgz5sBjAaavBAb4gb9zfK7vQAToEY3bQKYx2AulmheSfbxXPCf7vJh8pyLsWJQm8_Sz6j_MbtVkYnUtNZYzOpYXL2-YgnYZbElBGzIIFz5e5oYHWft-oRczrciKD2PFEb8rWcimAtMdps_ocTqWeLLPwyR9lS97ds_jYazbxuyTlOsVEpNpuwXAAMy6FFVSLyqB5L7dt7XSuWezIGoCVPdrCjLtjz3HcqfoAXXueAY6z0dCHh0YLL9qD-xCXCbiCWI8CZPVJfhxahzHQcS7ZEc1chLTJT-OW40iKrBcxcNI0num02PVf9ru3pIBI4IwgxVXbnKWrHLC5SCyEXjBsrMl1KSNLlSX8fdju-vznIPLCAe85m2X4R5Gj_w8BBAVcTz3hoezk3G-oAVLQPjR-jBUxtKIOpKj5TN_X2egcz1kQR2rPS8ievhKf_d9l40mFp0KiIlRREquTLDZGuyQOvDzDd_J0jtJVJ5H=s241-no?authuser=0L',
  'https://lh3.googleusercontent.com/MyfnWNgLcWiZYQSQM2qSCp9Rf8FDh9osEwnRRPS6aRB7_RXiMzxTArCoaWMmU7ZEh1An3ite3hc-Ylj8I4Qw7j9n4B9_MUl2YQoI9Uu7LBvzGiKwmo6rei8_ZU0l4jkAsLw3QuYaAOc7kPvBLPZvr8xs0jAigJYqiz_u1SesvO1pelso9tTQcOoeHNoR5qc2uMcB1yhdprGcY-C5ZdZ41wTzvcvHb-VV-RSm5UH8HjbwVvLq4YZs9byY8bTy1BfQKA3azHtCnqItp1z3GX6nPlPfSaL_4U9mkMWu2BXCO1E6IhAOiDvaYQc9mxEntduZi0RMzK-o2FnU2zUTFkz9d7YmGjEmkDP4ss2H2d4nJaAFaJnXpzX_kDOqrtcMO7A3bSDPJBW16q1mx8VFKj63Mr7t-vI_D3_iQxXnDZJTJBYe3bBwhkOmxl3PgRMfni2Lp7Wltj4VpdsHTrNYmCbqlj8bKKlphIvrCVWPDk2MQgwtfv4w23t3Upap75ZmCHxVXA67EXo6a8VU00P2gedA0Xb9ZJ-Sv_vQT1MuEf41ljyeNP0wbGzLj5CekixS8mpiPRjBNsEmvAx55wkpJ11nMaX7wX1gNMkjbv9cy0cNavN4AClKOmEmtK2n8q2_6jSNT6D5MQv2HAEwW8KjCH8llsSFO9qr-lFYYF3oV_iqEIS2mXca5MvFNpOJAri5=w708-h943-no?authuser=0',
  'https://lh3.googleusercontent.com/r69z3SXibsq8s-4_YxxGi18YDkFCfPwnrxUGt9TDpak2nOVSWBurPIc6Br1O7e1RByNyHKD3mjBfLSL9Kd6MWLMJaV4y-zvq8oULQvQbbM7PCCVBJVEN-D-dTerWG1ChumPyjQ6nD9DHsbvvSprzY782i15yr43BDb07CEm1q8l8kzLOz_ePkhNespmL1wPysmKyOalAhb90gUI6I4BiWLsuyEpZlqggD2CGOfJJXX9RnSJbM5YEd1gTX7fbc5-8byml8Ic2_DKKeXOvFR0fOaYKlA6LEa7nvdq-_nrxZpyPwRr5zqpi-QFgP7RK7palWibR92GUvz1kSaXj5V2gBTnH_q1bAM2G4qfhqXDEq4bCZaYZangqN7Rfe5cRmjT7h-gimPMC_vHKnydJM5ngS4uw5wMtYJyiTmNUvIwk5TcEVfxN_uRgO0lCdzewYG8CPoemM-CP5bxCf_SHkJ4ses0ccgtgoqgc_qXDEnRQkSHtJS1OmCkzPojbCRA6eyUw9OlVM8f9A3IaRQxrDlARD6W9zDv1i_PIJzGab6C2gr__c6q9FvVegYRg7NoPUtvoxYDhYW2HkFfhgPRQYK1cXL5dhZNeDABcwA9RXFxsA13TxLkD1ETJOiZ610_qTfnWc20wnVl3w-cu7DGoU5UlEukDTbd4xl7GHPtvZywYfnN51a8Blyz2X6NHNvPs=w154-h205-no?authuser=0',
  'https://lh3.googleusercontent.com/83OeGSNgVknOHlAJm_6j8THOYiB3Vk4avsMbX5M0PeHmReuB4YJT1OWI01bupmg0dtllIKZLSpuGYWNu7m3gXkeHZHovLwHsdnok3Anx_RRxaXS6YakSCDi0zBfxI-Ta106Yu3V9uDvMvDcpUVJyBKbRc24Wardfo3cvxcCF9lwhX08MlUDnbI32kj_tyPNVBCwsb6Uwi-xfJLUaDwYQlGsDk3hNBXZgjtP_g0IBR03w6UjGivLs01JPq3kW_KEDOTqcXPgdO8JMgUAjfBs2oBBotggxWEKfTDOTNT8SvYPP9sQLNTKOMfh5Z7eY20G6N13ni6gfH1_3yt-lTG8llZ4TqqbcwxQYYcwoEMNi4IkAyLkV2IsoSSCKxZl9nlVrVerhV9Hjk01M_7CliolXBp_u_qG0k3ahhKU-Q6oTv1n2Ukg5lIZU7i9vNZb6KfzSYmNNZXttZXB7qIhzS_lEC2ypm0pXOkKQHWV-jzxY1_bGcwCYA4PHnBpjXQ_3PgJ6lfp6blx7Qth9KqspgOZDimjBQBcePDAgmjTw691skCFwVhGMd2vVLwyszy3V3ENXSOZpnnURYYqwv37MixUVx_WeSFIHrWzEr824qf_0EZxCK2ysnqStVSgG2SmTp20pbePUHXTAi20fTFCB49ImFwvPxTsayy-PD29-7RHu373N7KhzecA4bO5LMi_f=w708-h943-no?authuser=0',
  'https://lh3.googleusercontent.com/0T0MHVazEhbAQPEAg_pxqV9gEzpUybcAcwfhoSOxiLGoAmyvOOIhHTIXBazf-faU_ZzKPm5yl25Lo_sItN4eNMc88yy_qqcmQVWYN9xs-roaEpJOraIGYRrEy5kw8FSnVkQW86IEpJukMrlnCu1hobu2CLBnYH_HY0xhDHUdLumeLwCtx0Q9y579QPc9MHKBx9JyO4B-j4AbDcW5xGCOyPYX-2G0Qi48MhmMF8751gxg0NgbTqvCJBO7ivZpxplyFtmYw1_yx3K6ORuaQ-yrjg3U3h09ImFKmh4YypLqRuWx4rTdQ4zyufneA70FYtf1E8zU5QOVjjssUGHwp-Nw0vIlT6dHyBgxdM48aCr5mB-Q3DjPJWvcswPKD80oNhUOeXISbnow5G4h2XqXr9oAFVAoLx7z_TvbJkll1fgeFiR6ffcbniE9HpkJ-8YEF7R-w-q24O2Qq9u9iu53couGrjOa_S4SKuYmJG0YhHwseeyPIXdmbsNdkqHDJ70bWSHkGlGOgRk2DnZlbFb-Mxz-DdYNAapZmlWFIxh7XnsdWRG5vDQsrP_0fuKD_PRnmkosj1Z20rNyDEdlixuOlp9d5P8Wrlx-XR_RI6hORPokL6HFhd2ZAVJELTElrxHQt_F0OwTaHtAws4MsC8F77-vzNtkZtuJL7a-RIRt32NQNTlPhR5pY7cgm6eiURG4Q=w143-h191-no?authuser=0',

]


export default class supportList extends Component {

  state = {
    visibleModal: null,
    image: null,
    date: '',
    photos: [],
    jwt: null,

    showBongBtn: false, //메인페이지에서 봉 플로팅 버튼 (보호소에게만 보여야 함)
    showAppyBtn: false, //메인페이지에서 봉사신청 버튼 (로그인하고, 봉사자 에게만 보여야 함)

  };

  _renderButton1 = (text, onPress) => (
    <TouchableOpacity onPress={onPress}>
      <View >
        <Text style={styles.fabIcon}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  _renderButton2 = (text, onPress) => (
    <TouchableOpacity
      onPress={onPress} >
      <View style={styles.button}>
        <Text>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('TOKEN');
      if (value != null) {
        // We have data!!
        //console.log(value);
        //this.state.jwt = value;
        this.setState({ jwt: value })
        this.checkLogin()

      } else {
        console.log("token이 없습니다!")
      }
    } catch (error) {
      console.log(error)
    }
  };

  checkLogin() { //AsyncStorate.getItem('Token') 으로 하면 엉망임. async await을 해야 제대로 들어감
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization", `jwt ${this.state.jwt}`
    );

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',

    }

    axios("http://3.34.59.121:8000/volunteer/", requestOptions)
      .then((response) => {
        if (response.status == 200) {

          console.log(response);
          this._userRole();
          //loading:true
        }
        else {
          console.log("로그인되지 않음");
        }
      })
      .catch((error) => {
        console.log("error:" + this.state.jwt)
        this.setState({
          error: 'Error retrieving data',
          loading: false

        });
        console.log(error)
      });

  }

  _userRole = () => {
    var decoded = (jwt_decode(this.state.jwt)["user_role"]);
    console.log(decoded)
    if (decoded == "2") {
      this.setState({ showBongBtn: true, showAppyBtn: false })

    }
    else if (decoded == "1") { //봉사자면 보이지 않게
      this.setState({ showBongBtn: false, showAppyBtn: true })
    }
  }

  componentDidMount() {
    this.getPermissionAsync();
    /*
    var month = new Date().getMonth() + 1;
    var date = new Date().getDate();
    var hours = new Date().getHours();
    var min = new Date().getMinutes();

    this.setState({
      date: month + '월' + date + '일' + ' ' + hours + ':' + min
    })
    */
    this._retrieveData();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };


  //multiple full example
  componentDidUpdate() {
    const { params } = this.props.navigation.state;
    if (params) {
      const { photos } = params;
      if (photos) this.setState({ photos });
      delete params.photos;
    }
  }

  renderImage(item, i) {
    return (
      <Image
        style={{ height: 100, width: 100 }}
        source={{ uri: item.uri }}
        key={i}
      />
    )
  }

  numItems = images.length
  itemWidth = (FIXED_BAR_WIDTH / this.numItems) - ((this.numItems - 1) * BAR_SPACE)
  animVal = new Animated.Value(0)

  render() {
    let imageArray = []
    let barArray = []
    images.forEach((image, i) => {
      console.log(image, i)
      const thisImage = (
        <Image
          key={`image${i}`}
          source={{ uri: image }}
          style={{ width: deviceWidth }}
        />
      )
      imageArray.push(thisImage)

      const scrollBarVal = this.animVal.interpolate({
        inputRange: [deviceWidth * (i - 1), deviceWidth * (i + 1)],
        outputRange: [-this.itemWidth, this.itemWidth],
        extrapolate: 'clamp',
      })

      const thisBar = (
        <View
          key={`bar${i}`}
          style={[
            styles.track,
            {
              width: this.itemWidth,
              marginLeft: i === 0 ? 0 : BAR_SPACE,
            },
          ]}
        >
          <Animated.View

            style={[
              styles.bar,
              {
                width: this.itemWidth,
                transform: [
                  { translateX: scrollBarVal },
                ],
              },
            ]}
          />
        </View>
      )
      barArray.push(thisBar)
    })




    return (
      <View style={styles.backScreen}>
        <ScrollView>
          <Card style={styles.cardStyle}>
            <CardItem>
              <Left>
                <Thumbnail source={require('./assets/icon.png')} />
                <Body>
                  <View flexDirection="row">
                    <Text style={{ fontWeight: '900', fontSize: 17, fontWeight: "bold" }}>물결 보호소</Text>
                    <TouchableOpacity
                      style={{ position: "absolute", right: 0 }}
                    ><Text style={{ color: "#5f5f5f", fontSize: 16 }}>삭제</Text>
                    </TouchableOpacity>
                  </View>

                  <Text>Date</Text>

                </Body>
              </Left>
            </CardItem>

            <CardItem cardBody>
              <View style={{ height: deviceWidth }}
                flex={1}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={10}
                  pagingEnabled
                  onScroll={
                    Animated.event(
                      [{ nativeEvent: { contentOffset: { x: this.animVal } } }]
                    )
                  }
                >{imageArray}</ScrollView>
                <View

                  style={styles.barContainer}
                >{barArray}</View>
              </View>
            </CardItem>
            <CardItem>
              <Body>
                <Text>안녕하세요 반갑습니다. </Text>
              </Body>
            </CardItem>
          </Card>

          <Card style={styles.cardStyle}>
            <CardItem>
              <Left>
                <Thumbnail source={require('./assets/icon.png')} />
                <Body>
                  <View flexDirection="row">
                    <Text style={{ fontWeight: '900', fontSize: 17, fontWeight: "bold" }}>물결 보호소</Text>
                    <TouchableOpacity
                      style={{ position: "absolute", right: 0 }}
                    ><Text style={{ color: "#5f5f5f", fontSize: 16 }}>삭제</Text>
                    </TouchableOpacity>
                  </View>

                  <Text>Date</Text>

                </Body>
              </Left>
            </CardItem>

            <CardItem cardBody>
              <View style={{ height: deviceWidth }}
                flex={1}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={10}
                  pagingEnabled
                  onScroll={
                    Animated.event(
                      [{ nativeEvent: { contentOffset: { x: this.animVal } } }]
                    )
                  }
                >{imageArray}</ScrollView>
                <View

                  style={styles.barContainer}
                >{barArray}</View>
              </View>
            </CardItem>
            <CardItem>
              <Body>
                <Text>안녕하세요 반갑습니다. </Text>
              </Body>
            </CardItem>
          </Card>





        </ScrollView>
        {this.state.showBongBtn ? (
          <View style={styles.fab}>
            {this._renderButton1('후', () =>

              this.props.navigation.navigate("writeList"))}

          </View>
        ) : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({

  backScreen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },


  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardStyle: {
    width: screenWidth - 20,
    //backgroundColor: '#eaf6f8',
    borderRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: .3,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 3,
    justifyContent: "center",
    alignContent: "center",
    marginLeft: 10,
    marginRight: 10

  },

  button: {
    backgroundColor: '#D3E1F8',
    padding: 12,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  modalContent: {
    backgroundColor: 'white',
    marginTop: 40,
    height: 550,
    //padding: 22,
    justifyContent: 'center',
    //alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    //left: Dimensions.get('window').width - 70,
    bottom: 20,
    backgroundColor: '#D3E1F8',
    borderRadius: 30,
    //elevation: 8
  },

  fabIcon: {
    fontSize: 40,
    color: 'white'
  },
  bar: {
    backgroundColor: '#5294d6',
    height: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',

  },
  barContainer: {
    position: 'absolute',
    zIndex: 2,
    width: screenWidth - 20,
    bottom: 40,

    flexDirection: 'row',
    justifyContent: "center",
  },
  track: {
    backgroundColor: '#ccc',
    overflow: 'hidden',
    height: 2,
  },

})
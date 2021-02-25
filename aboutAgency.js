import React, { Component } from 'react';
import {
    StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TextInput,
    errortext, TouchableOpacity, Dimensions, Picker, Image, TouchableWithoutFeedback, Keyboard, AsyncStorage,
} from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon, Row } from 'native-base';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
import jwt_decode from 'jwt-decode';
import SyncStorage from 'sync-storage';
import { FlatList } from 'react-native-gesture-handler';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const seoul_gu = ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
    "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
    "양춘구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"]

const gyeong_gu = ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시",
    "평택시", "의정부시", "시흥시", "파주시", "광명시", "김포시", "군포시", "광주시", "이천시",
    "양주시", "오산시", "구리시", "안성시", "포천시", "의왕시", "하남시", "여주시", "양평군",
    "동두천시", "과천시", "가평군", "연천군"]

const gyeongnam_gu = ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군",
    "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"]


const limit = ["7", "8", "9", "10", "11", "12", "13"]

export default class aboutAgency extends Component {
    constructor(props) {
        super(props);


        this.state = {
            volnum: '', // 봉사자 인원 제한 숫자
            sido: '서울특별시', //시도 (보호소 주소)
            sigu: '',   //시구 (보호소 주소)
            ad_detail: '', //상세주소 수정을 위해서

            visibleModal: null,

            agencyName: '', //보호소 이름
            agencyAnimal: '', // 보호소 동물현황
            agencyUrl: '', //보호소 홍보 인터넷 주소
            kakaoUrl: '', // 보호소 오픈채팅 URL
            aboutAgencyText: '', // 보호소 소개 
            aboutVolunText: '', //보호소 봉사 소개 및 주의사항        
            image: null, //보호소 대표 이미지
            jwt: null,

            showBongBtn: false, //메인페이지에서 봉 플로팅 버튼 (보호소에게만 보여야 함)

            shelterNum: '',
            sheldata: [], //response로 불러오기
        }
        this._shelterForm = this._shelterForm.bind(this);
    }

    _shelterForm() {
        const fileURL = this.state.image

        var formData = new FormData();
        var photo = {
            uri: Platform.OS === 'android' ? fileURL : fileURL.replace('file://', ''),
            type: 'image/jpg',
            name: 'photo.jpg'
        };

        if (this.state.image !== this.state.sheldata.thumbnail) {
            formData.append('thumbnail', photo);
        }
        if (this.state.agencyName !== this.state.sheldata.shelter_name) {
            formData.append('shelter_name', this.state.agencyName)
        }
        if (this.state.sido + ' ' + this.state.sigu !== this.state.sheldata.loc_short) {
            formData.append('loc_short', this.state.sido + ' ' + this.state.sigu)
        }
        if (this.state.ad_detail !== this.state.sheldata.loc_detail) {
            formData.append('loc_detail', this.state.ad_detail)
        }
        if (this.state.agencyAnimal !== this.state.sheldata.status) {
            formData.append('status', this.state.agencyAnimal)
        }
        if (this.state.agencyUrl !== this.state.sheldata.url) {
            formData.append('url', this.state.agencyUrl)
        }
        if (this.state.kakaoUrl !== this.state.sheldata.chat_url) {
            formData.append('chat_url', this.state.kakaoUrl)
        }

        if (this.state.volnum !== this.state.sheldata.limit_number) {
            formData.append('limit_number', this.state.volnum)
        }

        if (this.state.aboutAgencyText !== this.state.sheldata.content) {
            formData.append('content', this.state.aboutAgencyText)
        }
        if (this.state.aboutVolunText !== this.state.sheldata.caution) {
            formData.append('caution', this.state.aboutVolunText)
        }

        var config = {
            method: 'patch',
            url: `http://3.34.119.63/shelter/${this.state.shelterNum}/`,
            headers: {
                Accept: "application/json",
                'Content-Type': 'multipart/form-data',
                'Authorization': `jwt ${this.state.jwt}`
            },
            data: formData
        };
        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    console.log("shelterForm 로그확인:", this.state.jwt);
                    console.log(response);
                    //alert(JSON.stringify(response.data.));
                    this._userRole();
                    this.getShelterData();
                    
                }
                else {
                    console.log("status 200 XXXX");

                }
            })
            .catch((error) => {
                console.log("shelterForm error:" + error)
            });

    }


    getItems(val) {
        if (val == '서울특별시') {
            return seoul_gu;
        }
        if (val == '경기도') {
            return gyeong_gu;
        }
        if (val == '경상남도') {
            return gyeongnam_gu;
        }
    }

    onValueChange1(value) {
        this.setState({
            sido: value
        });
    }
    onValueChange2(value) {
        this.setState({
            sigu: value
        });
    }

    onValueChange(value) {
        this.setState({
            volnum: value
        });
    }


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
    _renderButton3 = (text, onPress) => (
        <TouchableOpacity onPress={onPress}>
            <View >
                <Text style={styles.fabIcon2}>{text}</Text>
            </View>
        </TouchableOpacity>
    );

    dismissKeyboard() {
        Keyboard.dismiss()
    }

  

    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('TOKEN');
            const shelterID = SyncStorage.get('SHELTERID')
            SyncStorage.set('THUMBNAIL');
            this.setState({ shelterNum: shelterID })

            if (value != null) {
                // We have data!!
                //console.log(value);
                //this.state.jwt = value;
                this.setState({ jwt: value });
                this.getShelterData();
                //this._shelterForm();

            } else {
                this._getaboutAgency();
                console.log("token이 없습니다!")
            }
        } catch (error) {
            console.log(error)
        }
    };

    getShelterData() { //AsyncStorate.getItem('Token') 으로 하면 엉망임. async await을 해야 제대로 들어감
        var config = {
            method: 'get',
            url: `http://3.34.119.63/shelter/${this.state.shelterNum}/`,
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };
        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    console.log("getShelterData 로그확인:", this.state.jwt);
                    console.log(response.data.limit_number);
                    this.setState({ sheldata: response.data })
                    this.setState({
                        agencyName: this.state.sheldata.shelter_name, //보호소 이름
                        agencyAnimal: this.state.sheldata.status, // 보호소 동물현황
                        agencyUrl: this.state.sheldata.url, //보호소 홍보 인터넷 주소
                        kakaoUrl: this.state.sheldata.chat_url, // 보호소 오픈채팅 URL
                        aboutAgencyText: this.state.sheldata.content, // 보호소 소개 
                        aboutVolunText: this.state.sheldata.caution, //보호소 봉사 소개 및 주의사항 
                        ad_detail: this.state.sheldata.loc_detail,
                        image: this.state.sheldata.thumbnail,
                    })
                    this._userRole();
                    SyncStorage.set('THUMBNAIL');
                }
                else {
                    console.log("로그인되지 않음");

                }
            })
            .catch((error) => {
                console.log("getShelterData error:" + this.state.jwt)
                console.log(error)
            });

    }

    _getaboutAgency() { //로그인을 안해도 글을 볼 수 있게 하기 위한 함수
        axios(`http://3.34.119.63/shelter/${this.state.shelterNum}/`)
            .then((response) => {
                if (response.status == 200) {
                    console.log("로그확인:");
                    console.log(response.data);
                    this.setState({ sheldata: response.data })
                }
            })
            .catch((error) => {
                console.log("error:" + this.state.jwt)
                this.setState({
                    error: 'Error retrieving data',
                    loading: false

                });
                console.log("getaboutAgency" + error)
            });
    }
    _split() {
        var str1 = this.state.sheldata.loc_short.split(' ');
        var limnum = this.state.sheldata.limit_number;
        const local1 = str1[0];
        const local2 = str1[1];

        if (local1 == '서울특별시') this.setState({ sido: "서울특별시" })
        else if (local1 == '경기도') this.setState({ sido: "경기도" })
        else if (local1 == '경상남도') this.setState({ sido: "경상남도" })

        this.setState({ sigu: local2 })

        var n = this.state.sheldata.limit_number;

        if (n == 7) this.setState({ volnum: "7" })
        else if (n == 8) this.setState({ volnum: "8" })
        else if (n == 9) this.setState({ volnum: "9" })
        else if (n == 10) this.setState({ volnum: "10" })
        else if (n == 11) this.setState({ volnum: "11" })
        else if (n == 12) this.setState({ volnum: "12" })
        else if (n == 13) this.setState({ volnum: "13" })
        else if (n == 14) this.setState({ volnum: "14" })
    }

    _userRole = () => {
        var decoded_role = (jwt_decode(this.state.jwt)["user_role"]);
        var decoded_id = (jwt_decode(this.state.jwt)["shelter"]);

        if (this.state.shelterNum != decoded_id || decoded_role == "1") {
            this.setState({ showBongBtn: false })
            console.log("버튼" + this.state.showBongBtn)
        }

        else if (decoded_role == "2" && (this.state.shelterNum == decoded_id)) {
            this.setState({ showBongBtn: true })
            console.log("버튼" + this.state.showBongBtn)
        }
    }

    componentDidMount() {
        this.getPermissionAsync();
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

    _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.cancelled) {
                this.setState({ image: result.uri });
            }

            //console.log(result);
        } catch (E) {
            //console.log(E);
        }
    }

    _imageLoad = () => {
        let { image } = this.state;
        if (image != null) {
            return (
                <TouchableOpacity style={{ width: 350, height: 250, borderWidth: 0.3, marginTop: 10 }} onPress={this._pickImage}>
                    {image && <Image source={{ uri: image }}
                        style={{ width: 350, height: 250, resizeMode: "cover" }} />}
                </TouchableOpacity>
            )
        }
        else if (this.state.sheldata.thumbnail != null) {
            return (
                <TouchableOpacity style={{ width: 350, height: 250, borderWidth: 0.3, justifyContent: "center", alignItems: "center", marginTop: 10 }} onPress={this._pickImage}>
                    <Image source={{ uri: this.state.sheldata.thumbnail }} style={{ width: 350, height: 250, resizeMode: "cover" }} />
                </TouchableOpacity>
            )
        }

        else {
            return (
                <TouchableOpacity style={{ width: 350, height: 250, borderWidth: 0.3, justifyContent: "center", alignItems: "center", marginTop: 10 }} onPress={this._pickImage}>
                    <Ionicons style={[{ color: "#000", paddingTop: 10, }]} size={50} name={'ios-images'} onPress={this._pickImage} />
                </TouchableOpacity>
            )
        }
    }



    render() {
        return (
            <View style={styles.backScreen}>


                <Modal isVisible={this.state.visibleModal === 1}>
                    <KeyboardAvoidingScrollView stickyFooter={this._renderButton2('시설 소개 하기',
                        () => {
                            this.setState({ visibleModal: null });
                            //alert(this.state.image)
                            this._shelterForm();
                        })}>
                        <View style={styles.fab2}>
                            {this._renderButton3('X', () => this.setState({ visibleModal: null, }))}
                        </View>
                        <View style={styles.modalContent}>
                            <ScrollView>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ paddingBottom: 10 }}>
                                        {this._imageLoad()}
                                    </View>
                                </View>
                                <View>
                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[보호소 이름]</Text>
                                    <TextInput
                                        placeholder="보호소 이름을 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(agencyName) => this.setState({ agencyName })}
                                        value={this.state.agencyName}
                                    />

                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>
                                        [보호소 주소]
                                        </Text>
                                    <View style={{ flexDirection: 'row', height: 50, marginLeft: 40, marginRight: 40, justifyContent: 'space-between', marginBottom: 10 }}>
                                        <Picker
                                            itemStyle={{ height: 50 }}
                                            selectedValue={this.state.sido}
                                            style={{ height: 50, width: 150 }}
                                            onValueChange={this.onValueChange1.bind(this)}>
                                            <Picker.Item label="서울특별시" value="서울특별시" />
                                            <Picker.Item label="경기도" value="경기도" />
                                            <Picker.Item label="경상남도" value="경상남도" />

                                        </Picker>


                                        <Picker
                                            itemStyle={{ height: 50 }}
                                            style={{ height: 50, width: 150 }}
                                            selectedValue={this.state.sigu}
                                            onValueChange={this.onValueChange2.bind(this)}>
                                            {this.getItems(this.state.sido).map((item, i) => {
                                                return (
                                                    <Picker.Item label={item} key={`${i}+1`} value={item} />
                                                )

                                            })}
                                        </Picker>
                                    </View>

                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[상세주소]</Text>
                                    <TextInput
                                        placeholder="상세주소 수정이 필요한 경우에만 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(ad_detail) => this.setState({ ad_detail })}
                                        value={this.state.ad_detail}
                                    />


                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[보호소 동물 현황]</Text>
                                    <TextInput
                                        placeholder="보호 동물 현황을 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(agencyAnimal) => this.setState({ agencyAnimal })}
                                        value={this.state.agencyAnimal}
                                    />

                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[보호소 홍보 인터넷 주소]</Text>
                                    <TextInput
                                        multiline
                                        numberOfLines={3}
                                        placeholder="보호소 홍보 인터넷 주소를 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(agencyUrl) => this.setState({ agencyUrl })}
                                        value={this.state.agencyUrl}
                                    />


                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[보호소 오픈채팅 URL]</Text>
                                    <TextInput
                                        multiline
                                        numberOfLines={3}
                                        placeholder="보호소 오픈채팅 URL을 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(kakaoUrl) => this.setState({ kakaoUrl })}
                                        value={this.state.kakaoUrl}
                                    />

                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>
                                        [보호소 일일 봉사 인원 제한]
                                        </Text>
                                    <View style={styles.container}>
                                        <Picker
                                            itemStyle={{ height: 50 }}
                                            style={{ height: 50, width: 85, textAlign: 'center', justifyContent: "center", alignContent: "center" }}
                                            selectedValue={this.state.volnum}
                                            onValueChange={this.onValueChange.bind(this)}>
                                            <Picker.Item label="7" value="7" />
                                            <Picker.Item label="8" value="8" />
                                            <Picker.Item label="9" value="9" />
                                            <Picker.Item label="10" value="10" />
                                            <Picker.Item label="11" value="11" />
                                            <Picker.Item label="12" value="12" />
                                            <Picker.Item label="13" value="13" />
                                            <Picker.Item label="14" value="14" />

                                        </Picker>


                                    </View>


                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[보호소 소개]</Text>
                                    <TextInput
                                        multiline
                                        numberOfLines={3}
                                        placeholder="보호소 설명을 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(aboutAgencyText) => this.setState({ aboutAgencyText })}
                                        value={this.state.aboutAgencyText}
                                    />

                                    <Text style={{ paddingTop: 10, textAlign: 'center' }}>[보호소 봉사 소개 및 주의사항]</Text>
                                    <TextInput
                                        multiline
                                        numberOfLines={3}
                                        placeholder="보호소 봉사 소개와 주의사항을 입력해주세요."
                                        placeholderTextColor="#3A4C7F"
                                        style={{ textAlign: "center", padding: 10, color: "blue" }}
                                        onChangeText={(aboutVolunText) => this.setState({ aboutVolunText })}
                                        value={this.state.aboutVolunText}
                                    />
                                </View>
                            </ScrollView>
                        </View>

                    </KeyboardAvoidingScrollView>
                </Modal>


                <ScrollView>
                    <View style={{ paddingTop: 30, paddingLeft: 20, paddingRight: 20, justifyContent: "center", alignItems: "center" }}>

                        <Image //보호소 대표 이미지 넣기
                            source={{ uri: this.state.sheldata.thumbnail }}
                            resizeMode={'cover'}
                            onLoad={() => this.forceUpdate()}
                            style={styles.shelterImage}
                        />
                        <View>
                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 이름]</Text>
                            <Text style={styles.textSytle}>{this.state.sheldata.shelter_name}</Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 주소]</Text>
                            <Text style={styles.textSytle}>{this.state.sheldata.loc_short}</Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 동물현황]</Text>
                            <Text style={styles.textSytle}>{this.state.sheldata.status}</Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 홍보 인터넷 주소]</Text>
                            <Text style={styles.textSytle}>{this.state.sheldata.url} </Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 오픈채팅]</Text>
                            <Text style={styles.textSytle}> {this.state.sheldata.chat_url}</Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [일일 봉사 인원 제한]</Text>
                            <Text style={styles.textSytle}>{this.state.sheldata.limit_number} </Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 소개]</Text>
                            <Text style={styles.textSytle}> {this.state.sheldata.content}</Text>

                            <Text style={{ textAlign: 'center', fontWeight: "200" }}> [보호소 봉사 소개 및 주의사항]</Text>
                            <Text style={styles.textSytle}> {this.state.sheldata.caution}</Text>


                        </View>



                    </View>
                </ScrollView>
                {this.state.showBongBtn ? (
                    <View style={styles.fab}>
                        {this._renderButton1('시', () => {
                            this.setState({ visibleModal: 1 }), this._split()
                        })}
                    </View>
                ) : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({

    backScreen: {
        flex: 1,
        //justifyContent: 'center',
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
        marginTop: 50,
        height: 540,
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
        elevation: 8
    },

    fabIcon: {
        fontSize: 40,
        color: 'white'
    },
    fab2: {
        position: 'absolute',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        right: 5,
        top: 10,
        //left: Dimensions.get('window').width - 70,

        backgroundColor: '#D3E1F8',
        borderRadius: 30,
        elevation: 8
    },
    fabIcon2: {
        fontSize: 20,
        fontWeight: "bold"
    },
    textSytle: {
        textAlign: 'center',
        fontSize: 17,
        paddingTop: 5,
        paddingBottom: 10,

    },
    shelterImage: {
        width: screenWidth-15,
        height: screenHeight/2.7,
        marginBottom: 30,
        borderWidth: 0.3,
        justifyContent: "center",
        alignItems: "center",

    }


})
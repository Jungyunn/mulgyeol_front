import React, { Component } from 'react';
import {
    StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TextInput, Alert,
    errortext, TouchableOpacity, Dimensions, Picker,
} from 'react-native';
import { ThemeColors } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from "axios";

const screenHeight = Math.round(Dimensions.get('window').height);
const idNum = 0;
const url = "http://3.34.119.63/"



const seoul_gu = ["시/구", "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
    "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
    "양춘구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"]

const gyeong_gu = ["시/구", "수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시",
    "평택시", "의정부시", "시흥시", "파주시", "광명시", "김포시", "군포시", "광주시", "이천시",
    "양주시", "오산시", "구리시", "안성시", "포천시", "의왕시", "하남시", "여주시", "양평군",
    "동두천시", "과천시", "가평군", "연천군"]

const gyeongnam_gu = ["시/구", "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군",
    "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"]



export default class signinAgency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            role: '2',
            name: 'E',
            id: 'E',
            pw: 'E',
            pw_re: 'E',
            phoneNumber: '0101',
            agencyName: '12',
            adDetail: 'E',
            agencyUrl: 'E',
            agencyAnimal: 'E',
            kakaoUrl: 'E',

            sido: '서울특별시',
            sigu: '',

            numCheck: '',

            currentMessage: 'TADA',
            idMessage: '',

            makeDisable: false, //번호인증 버튼 한 번 이상 못누르게
            readOnly: true, // 번호 인증 버튼 누르면 번호 부분 

            verify_num: false, //번호 인증 확인 했는지 여부
            verify_id: "",
        }
        this.signUp = this.signUp.bind(this);
    }

    signUp() {
        let url = "http://3.34.119.63/shelter/";

        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "profile": {
                    "userID": this.state.id,
                    "password": this.state.pw,
                    "name": this.state.name,
                    "phone": this.state.phoneNumber,
                    "role": "2"
                },
                "shelter": {
                    "user": this.state.id,
                    "shelter_name": this.state.agencyName,
                    "loc_short": this.state.sido + this.state.sigu,
                    "loc_detail": this.state.adDetail,
                    "url": this.state.agencyUrl,
                    "chat_url": this.state.kakaoUrl,
                    "status": this.state.agencyAnimal,
                }
            }),
            redirect: 'follow',
            credentials: 'same-origin'

        }).then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));

        /*.then((response) => {
            if (response.status == 400) {
                console.log(response.data);
            }
            else if (response.status == 500) {
                console.log('error500'); //같은 번호이거나 같은 아이디 일때!
                Alert.alert("확인해주세요!", "같은 번호나 같은 아이디로 회원가입된 회원이 이미 존재합니다.");
            }
            else {
                console.log('signin success');
                //console.log(this.state.sigu);
            }

        }).catch((e) => {
            console.log(e);
            this.setState({ currentMessage: 'Error' });
        }).then(result => console.log(result))
        */
    }

    f_sendNum() { //번호인증 버튼
        if (!this.state.makeDisable) {
            Alert.alert("인증번호가 전송되었습니다.", "인증번호는 한번만 발급됩니다.");
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({ "phone_number": this.state.phoneNumber });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch(url + "auth/", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
        }

        this.setState({ makeDisable: true, readOnly: false });
    }

    f_getNum() {
        axios.get(`http://3.34.119.63/auth/?phone_number=${this.state.phoneNumber}&auth_number=${this.state.numCheck}`)
            .then(response => {
                if (response.status == 200) {
                    console.log("success!");
                    Alert.alert("인증확인", "인증이 완료되었습니다");
                    this.setState({ verify_num: true })
                }
            })
            .catch(error => {
                console.log('error', error)
                Alert.alert("오류", "잘못된 인증번호 입니다.");
            });
    }


    f_idCheck() { //id 중복여부 체크

        axios.get(`http://3.34.119.63/id/?id=${this.state.id}`)
            .then(response => {
                if (response.status == 200) {
                    console.log("available ID");
                    //Alert.alert("ID", "사용할 수 있는 ID입니다");
                    this.setState({ verify_id: this.state.id })
                    this.setState({ idMessage: 'same' })
                }
            })
            .catch(error => {
                console.log('error', error);
                //Alert.alert("ID", "사용할 수 없는 ID입니다");
                this.setState({ id: '', idMessage: 'diff' }) // 사용할 수 없는 ID는 입력창 비우기
            });
    }

    _isSameID = () => {
        
        if (this.state.idMessage == 'same') {

            return (
                <Text style={{ paddingLeft: 50, fontWeight: "bold", color: "green" }}>사용할 수 있는 ID입니다</Text>
            )
        }
        else if (this.state.idMessage == 'diff') {
            return (
                <Text style={{ paddingLeft: 50, fontWeight: "bold", color: "red" }}>사용할 수 없는 ID입니다</Text>
            )
        }else if (this.state.idMessage == '' && this.state.id == '' || this.state.verify_id == "") {
            return (
                <Text style={{ paddingLeft: 50 }}>중복확인 버튼을 눌러주세요</Text>
            )
        }
    }


    _isSamePW = () => { //비밀번호 일치여부 체크
        if (this.state.pw_re == '' || this.state.pw == '') {
            return (
                <Text></Text>
            )
        }
        else if (this.state.pw != this.state.pw_re) {
            return (
                <Text style={{ paddingLeft: 50, fontWeight: "bold", color: "red" }}>입력하신 비밀번호가 일치하지 않습니다</Text>
            )
        }
        else {
            return (
                <Text style={{ paddingLeft: 50, fontWeight: "bold", color: "green" }}> 입력하신 비밀번호가 일치합니다</Text>
            )
        }
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

    onValueChange(value) {
        this.setState({
            sido: value
        });
    }
    onValueChange2(value) {
        this.setState({
            sigu: value
        });
    }


    CheckTextInput = () => {
        //Handler for the Submit onPress
        if (this.state.name == '' || this.state.id == '' || this.state.pw == '' || this.state.pw_re == '' || this.state.phoneNumber == ''
            || this.state.agencyName == '' || this.state.adDetail == '' || this.state.agencyUrl == '' || this.state.agencyAnimal == '' || this.state.kakaoUrl == ''
        ) {
            Alert.alert("필수 항목 누락", '모든 항목을 입력해주세요.');
        }
        else if (this.state.pw != this.state.pw_re) { //비밀번호가 일치하지 않을 때
            Alert.alert("비밀번호 일치 오류", '입력하신 비밀번호가 일치하지 않습니다.');
        }
        else if (this.state.id != this.state.verify_id) {
            Alert.alert("ID", "아이디 중복확인을 하지 않았습니다.");
            this.setState({ verify_id: "" });
        }

        else if (this.state.verify_num == false) {
            Alert.alert("번호인증", "번호인증을 하지 않으셨습니다.");
        } else if (this.state.sigu == "시/구" || this.state.sigu == "") {
            Alert.alert("주소오류", "시/구를 선택해주세요.")
        }

        else if (this.state.idMessage == 'same' && this.state.verify_num) {
            Alert.alert("회원가입 성공", "회원가입을 성공하였습니다. 당신의 봉사를 응원합니다!");
            { this.signUp() }
            this.props.navigation.navigate("Login") //회원가입 완료 시 로그인 페이지로 이동

        }
    };



    render() {
        return (
            <View style={styles.backScreen}>
                <Text style={styles.title}>보호소 회원가입</Text>
                <Text style={{ marginTop: 10, textAlign: 'center', marginBottom: 10 }}>관리자 승인을 받은 후에 계정에 로그인 할 수 있습니다.</Text>
                <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={{ paddingTop: 20 }}>
                        <KeyboardAvoidingView >
                            <KeyboardAwareScrollView enableOnIOS extraScrollHeight={0}>
                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="이름"
                                        placeholderTextColor="#3A4C7F"
                                        autoCapitalize="none"
                                        onChangeText={(name) => this.setState({ name })}
                                        value={this.state.name}
                                    //blurOnSubmit={false} 제출되면 text field blur
                                    />

                                </View>
                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="아이디"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(id) => this.setState({ id })}
                                        value={this.state.id}
                                    />
                                    <TouchableOpacity style={styles.idBtn} onPress={() => this.f_idCheck()}>
                                        <Text style={styles.idText}>중복확인</Text>
                                    </TouchableOpacity>

                                </View>
                                <View label="check" style={{ marginTop: 10 }}>
                                    {this._isSameID()}
                                </View>
                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="비밀번호"
                                        placeholderTextColor="#3A4C7F"
                                        secureTextEntry={true}
                                        onChangeText={(pw) => this.setState({ pw })}
                                        value={this.state.pw}
                                    />
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="비밀번호 확인"
                                        placeholderTextColor="#3A4C7F"
                                        secureTextEntry={true}
                                        onChangeText={(pw_re) => this.setState({ pw_re })}
                                        value={this.state.pw_re}

                                    />
                                </View>

                                <View label="check" style={{ marginTop: 10 }}>
                                    {this._isSamePW()}
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        keyboardType={'number-pad'}
                                        autoCompleteType={'tel'}
                                        style={styles.inputStyle}
                                        placeholder="'-'없이 전화번호를 입력해주세요"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
                                        value={this.state.phoneNumber}
                                        editable={this.state.readOnly}
                                    />

                                    <TouchableOpacity style={styles.idBtn} disabled={this.state.makeDisable} onPress={() => this.f_sendNum()}>
                                        <Text style={styles.idText}>번호인증</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        keyboardType={'number-pad'}
                                        style={styles.inputStyle}
                                        placeholder="인증번호"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(numCheck) => this.setState({ numCheck })}
                                        value={this.state.numCheck}
                                    />

                                    <TouchableOpacity style={styles.idBtn} onPress={() => this.f_getNum()} >
                                        <Text style={styles.idText}>확인</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="보호소 이름"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(agencyName) => this.setState({ agencyName })}
                                        value={this.state.agencyName}
                                    />
                                </View>


                                <View style={{ marginTop: 10, marginBottom: 10 }}>
                                    <Text style={{ paddingLeft: 50 }}>보호소 주소를 입력해주세요</Text>
                                </View>
                                <View style={{ flexDirection: 'row', height: 50, marginLeft: 40, marginRight: 40, justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Picker
                                        itemStyle={{ height: 50 }}
                                        selectedValue={this.state.sido}
                                        style={{ height: 50, width: 150 }}
                                        onValueChange={this.onValueChange.bind(this)}
                                    >
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
                                <View style={{ flexDirection: 'row', height: 50, marginLeft: 40, marginRight: 40, }}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="상세주소 (이 부분은 공개되지 않습니다)"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(adDetail) => this.setState({ adDetail })}
                                        value={this.state.adDetail}
                                    />
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="센터 SNS주소 또는 홈페이지 URL"
                                        autoCapitalize="none"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(agencyUrl) => this.setState({ agencyUrl })}
                                        value={this.state.agencyUrl}
                                    />
                                </View>

                                <View label="check" style={{ marginTop: 10 }}>
                                    <Text style={{ paddingLeft: 50, marginBottom: 10 }}>센터 동물 현황</Text>
                                </View>
                                <View style={{ flexDirection: 'row', height: 50, marginLeft: 40, marginRight: 40, }}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="ex) 개 12마리, 고양이 30마리"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(agencyAnimal) => this.setState({ agencyAnimal })}
                                        value={this.state.agencyAnimal}
                                    />
                                </View>
                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="봉사문의를 위한 카카오톡 오픈채팅 주소"
                                        autoCapitalize="none"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(kakaoUrl) => this.setState({ kakaoUrl })}
                                        value={this.state.kakaoUrl}
                                    />
                                </View>
                                {errortext != '' ? (
                                    <Text style={styles.errorTextStyle}> {errortext} </Text>
                                ) : null}
                            </KeyboardAwareScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.registerBtn} onPress={() => this.CheckTextInput()}>
                    <Text style={styles.registerBtnText}>보호소 회원가입 신청</Text>
                </TouchableOpacity>
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

    SectionStyle: {
        flexDirection: 'row',
        height: 50,
        marginTop: 10,
        marginLeft: 40,
        marginRight: 40,
    },

    title: {
        fontWeight: 'bold',
        textAlign: "center",
        fontSize: 15,
        paddingTop: 60,
        fontSize: 25,

    },

    idBtn: {
        backgroundColor: '#7599FF',
        color: '#FFF',
        height: 50,
        width: 70,
        marginLeft: 10,
        alignItems: 'center',
        borderRadius: 15,
        justifyContent: "center",
        textAlign: "center",
    },

    idText: {
        color: "#fFF",
        fontSize: 14,
    },

    registerBtn: {
        backgroundColor: '#7599FF',
        color: '#FFF',
        height: 60,
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 2,
        marginBottom: 20,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    registerBtnText: {
        color: '#FFF',
        paddingVertical: 12,
        fontSize: 20,
    },

    inputStyle: {
        flex: 1,
        color: '#000',
        paddingLeft: 15,
        paddingRight: 15,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#7599FF',
    },

    errorTextStyle: {
        color: 'red',
        textAlign: 'center',
        fontSize: 14,
    },

    registerText_non_T: {
        textAlign: "center",
        fontSize: 13,
        color: "#3A4C7F",
        paddingBottom: 5
    },

    registerText: {
        textAlign: "center",
        fontSize: 15,
        color: "#7599FF"
    },


});
import React, { Component } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, errortext, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from "axios";

const screenHeight = Math.round(Dimensions.get('window').height);
const idNum = 0;
const url = "http://3.34.119.63/"
//fetch에서는 GET에 header를 쓸 수 없어서 axios를 사용함


export default class signinVolunteer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            role: '1',
            name: '',
            id: '',
            pw: '',
            pw_re: '',
            phoneNumber: '',
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
        let url = "http://3.34.119.63/signup/";

        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "userID": this.state.id,
                "password": this.state.pw,
                "name": this.state.name,
                "phone": this.state.phoneNumber,
                "role": "1"
            }),
            redirect: 'follow',
            credentials: 'same-origin'

        }).then((response) => {
            if (response.status == 400) {
                console.log('error400');
            }
            else if (response.status == 500) {
                console.log('error500'); //같은 번호이거나 같은 아이디 일때!
                Alert.alert("확인해주세요!", "같은 번호나 같은 아이디로 회원가입된 회원이 이미 존재합니다.");
            }
            else {
                console.log('signin success');
            }


        }).catch((e) => {
            console.log(e);
            this.setState({ currentMessage: 'Error' });
        }).then(result => console.log(result))
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
        if (this.state.idMessage == '' && this.state.id == '' || this.state.verify_id == "") {
            return (
                <Text style={{ paddingLeft: 50 }}>중복확인 버튼을 눌러주세요</Text>
            )
        }
        else if (this.state.idMessage == 'same') {

            return (
                <Text style={{ paddingLeft: 50, fontWeight: "bold", color: "green" }}>사용할 수 있는 ID입니다</Text>
            )
        }
        else if (this.state.idMessage == 'diff') {

            return (
                <Text style={{ paddingLeft: 50, fontWeight: "bold", color: "red" }}>사용할 수 없는 ID입니다</Text>
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

    CheckTextInput = () => {
        //Handler for the Submit onPress
        if (this.state.name == '' || this.state.id == '' || this.state.pw == '' || this.state.pw_re == '' || this.state.phoneNumber == '' || this.state.numCheck == '') {
            Alert.alert("필수 항목 누락", '모든 항목을 입력해주세요.');
        }
        else if (this.state.pw != this.state.pw_re) { //비밀번호가 일치하지 않을 때
            Alert.alert("비밀번호 일치 오류", '입력하신 비밀번호가 일치하지 않습니다.');
        }
        else if (this.state.id != this.state.verify_id) {
            Alert.alert("ID", "아이디 중복확인을 하지 않았습니다.");
            this.setState({ idMessage: 'diff' });
        }

        else if (this.state.verify_num == false) {
            Alert.alert("번호인증", "번호인증을 하지 않으셨습니다.");
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
                <Text style={styles.title}>봉사자 회원가입</Text>
                <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={{ paddingTop: 20 }}>
                        <KeyboardAvoidingView>
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
                                        style={styles.inputStyle}
                                        keyboardType={'number-pad'}
                                        placeholder="'-'없이 전화번호를 입력해주세요"
                                        placeholderTextColor="#3A4C7F"
                                        onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
                                        value={this.state.phoneNumber}
                                        editable={this.state.readOnly}
                                    />

                                    <TouchableOpacity style={styles.idBtn} disabled={this.state.makeDisable} onPress={() => this.f_sendNum()} >
                                        <Text style={styles.idText}>번호인증</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder="인증번호"
                                        placeholderTextColor="#3A4C7F"
                                        keyboardType={'number-pad'}
                                        onChangeText={(numCheck) => this.setState({ numCheck })}
                                        value={this.state.numCheck}
                                    />

                                    <TouchableOpacity style={styles.idBtn} onPress={() => this.f_getNum()}>
                                        <Text style={styles.idText}>확인</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.registerBtn} onPress={() => this.CheckTextInput()}>
                                    <Text style={styles.registerBtnText}>봉사자 회원가입</Text>
                                </TouchableOpacity>
                            </KeyboardAwareScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </ScrollView>
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
        marginTop: 30,
        marginBottom: 20,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    registerBtnText: {
        color: '#FFF',
        paddingVertical: 12,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
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
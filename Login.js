import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, Text, View, KeyboardAvoidingView, TextInput, errortext, TouchableOpacity, Dimensions, Alert } from 'react-native';
import jwt_decode from 'jwt-decode';

const screenHeight = Math.round(Dimensions.get('window').height);


export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //id: 'shunnyjang',
            //pw: 'shunnyjang',
            id: '',
            pw: ''
        }
        this.onLogin = this.onLogin.bind(this);
    }

    onLogin() {
        let url = "http://3.34.119.63/";

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ "userID": this.state.id, "password": this.state.pw });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            //redirect: 'follow'
        };

        fetch(url + "login/", requestOptions)
            .then(response => response.json(Object))
            .then(result => {

                if (result.token != null) {
                    console.log(result.token)
                    AsyncStorage.setItem(
                        'TOKEN',
                        result.token
    
                    );              
                    var decoded = (jwt_decode(result.token)["user_role"]);
                    //alert(jwt_decode(result.token)["user_id"]);
                    console.log(decoded) 
                    if(decoded == 1){
                        this.props.navigation.navigate("myVolunteer")
                    }
                    else {
                        this.props.navigation.navigate("agencyVolunList") // role이 2일때
                    }     
                    console.log(result.token)                  
                }
                else {
                    Alert.alert("로그인", "로그인에 실패하였습니다.");
                }
            })
            .catch(error => console.log('error', error));
    }




    render() {
        return (
            <View style={styles.backScreen}>
                <Text style={styles.title}> 로그인 하기 </Text>
                <View style={{ marginTop: 50 }}>
                    <KeyboardAvoidingView enabled>
                        <View style={styles.SectionStyle}>
                            <TextInput
                                value={this.state.id}
                                onChangeText={(id) => this.setState({ id })}
                                style={styles.inputStyle}
                                placeholder="아이디를 입력해주세요"
                                placeholderTextColor="#3A4C7F"
                                autoCapitalize="none"
                            //blurOnSubmit={false} 제출되면 text field blur
                            />
                        </View>
                        <View style={styles.SectionStyle}>
                            <TextInput
                                value={this.state.pw}
                                onChangeText={(pw) => this.setState({ pw })}
                                style={styles.inputStyle}
                                placeholder="비밀번호를 입력해주세요"
                                placeholderTextColor="#3A4C7F"
                                secureTextEntry={true}
                            />
                        </View>
                        {errortext != '' ? (
                            <Text style={styles.errorTextStyle}> {errortext} </Text>
                        ) : null}
                        <TouchableOpacity style={styles.loginBtn} onPress={this.onLogin.bind(this)}
                            /*onPress={()=>this.props.navigation.navigate(" ")}*/>
                            <Text style={styles.loginBtnText}>로그인</Text>
                        </TouchableOpacity>

                        <Text style={styles.registerText_non_T}>아직 계정이 없으시다면?</Text>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("signinAgency")}>
                            <Text style={styles.registerText}>보호소 계정 만들기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("signinVolunteer")}>
                            <Text style={styles.registerText}>봉사자 계정 만들기</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
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

    loginBtn: {
        backgroundColor: '#7599FF',
        color: '#FFF',
        height: 60,
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 15,
        marginBottom: 20,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    loginBtnText: {
        color: '#FFF',
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
        paddingTop: 20,
        paddingBottom: 5
    },

    registerText: {
        textAlign: "center",
        fontSize: 15,
        color: "#7599FF"
    },

    title: {
        fontWeight: 'bold',
        textAlign: "center",
        fontSize: 15,
        paddingTop: 40,
        fontSize: 25,
    },


});
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';
import React, { Component } from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

import Login from './Login'; //로그인

//회원가입을 안했을 때
import signinVolunteer from './signinVolunteer'; //봉사자 회원가입
import signinAgency from './signinAgency'; // 보호소 회원가입

//로그인을 했을 때 페이지는 role에 따라 나눠짐  1= 봉사자 2= 보호소
import myVolunteer from './myVolunteer'; //봉사자 기준 봉사리스트
import agencyVolunList from './agencyVolunList'; //보호소 기준 봉사리스트


class AuthLoadingScreen extends React.Component {
    componentDidMount() {
        this._bootstrapAsync();
    }

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem('TOKEN');

        if (userToken == null) {
            this.props.navigation.navigate('Login');
            console.log(userToken);
        }
        else { //role에 따라서 다르게 이동
            this.props.navigation.navigate('agencyVolunList');
            console.log("이동!" + userToken);
        }
    };

    // Render any loading content that you like here
    render() {
        return (
            <View>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}

const stackBeforeLogin = createStackNavigator({
    Login: {screen: Login},
    signinAgency: { screen: signinAgency },
    signinVolunteer: { screen: signinVolunteer },
},
    {
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    },
    {
        initialRouteName: 'Login',
    },


)


const stackLogin1 = createSwitchNavigator({

    AuthLoadingScreen: { screen: AuthLoadingScreen },
    myVolunteer: { screen: myVolunteer },
    agencyVolunList: { screen: agencyVolunList },
    beforeLogin: { screen: stackBeforeLogin }

},
    {
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    },
    {
        initialRouteName: 'AuthLoadingScreen',
    },

);

const StackForLogin = createAppContainer(stackLogin1);

export default class stackLogin extends Component {
    render() {
        return <StackForLogin />
    }

}
import React, { useState, useEffect, Component } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Alert,
  Text,
  Picker,
} from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import { createAppContainer } from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons';



import Login from './Login'; //로그인
import signinVolunteer from './signinVolunteer'; //봉사자 회원가입
import signinAgency from './signinAgency'; // 보호소 회원가입


import mainPage from './mainPage'; //홈
import myVolunteer from './myVolunteer' //봉사내역
import agencyVolunList from './agencyVolunList' // 보호소 기준 봉사자 리스트
import volunteerDate from './volunteerDate' // 봉사신청 페이지

import aboutAgency from './aboutAgency' //시설소개
import Community from './Community' //각 보호소 별 커뮤니티


import ToptabNav from './TopNav'
import stackLogin from './stackLogin'

const stackHome = createStackNavigator(
  {
    mainPage: mainPage,
    aboutAgency: ToptabNav,
    volunteerDate: volunteerDate,
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    }
  },
  {
    initialRouteName: "mainPage"
  }
);

const TabNav = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: stackHome,
      navigationOptions: {
        tabBarLabel: '홈',
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon
              style={[{ color: tintColor }]} size={25} name={'ios-home'} />
          </View>
        ),
        activeColor: '#000080',
        inactiveColor: '#f8ead3',
        barStyle: { backgroundColor: '#bdd2f5' },
      },
    },

    Member: {
      screen: stackLogin,
      navigationOptions: {
        tabBarLabel: '마이페이지',
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon
              style={[{ color: tintColor }]} size={25} name={'ios-person'} />
          </View>
        ),
        activeColor: '#000080',
        inactiveColor: '#f8ead3',
        barStyle: { backgroundColor: '#D3E1F8' },
      },
    },
  },
  {
    initialRouteName: 'Home',
    shifting: true,
  },
);



const TabContainer = createAppContainer(TabNav)

export default class App extends Component {
  render(

  ) {
    return <TabContainer />
  }
}
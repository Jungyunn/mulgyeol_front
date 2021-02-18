import supportList from './supportList'
import Community from './Community'
import aboutAgency from './aboutAgency'

import React, { Component } from 'react';
import {
  StatusBar,
  StyleSheet
} from 'react-native';

import { createAppContainer } from 'react-navigation'
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import {createStackNavigator} from 'react-navigation-stack';
import { View } from 'native-base';

import stackNav from './stackNav'

const ToptapNav = createMaterialTopTabNavigator(
  {
    시설소개: {
      screen: aboutAgency
    },

    커뮤니티: {
      screen: Community
    },

    후원내역: {
      screen: stackNav
    },
  },
  {
    tabBarOptions: {
      style: { backgroundColor: '#D3E1F8'},
      activeTintColor: "#1BA1F3",
      inactiveTintColor: "#000",
      labelStyle: {marginTop: 20}
    },
    initialRouteName: "시설소개"
  }

);

const TopTabContainer = createAppContainer(ToptapNav)
export default class TopNav extends Component {
  render() {
    return (
      <TopTabContainer />
    )
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#D3E1F8',
    width: "100%",
    height: "15%"
  }
});
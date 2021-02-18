//이미지 여러 개 선택하기 위한 stackNav
import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';

import supportList from './supportList';
import ImageBrowserScreen from './ImageBrowserScreen';
import writeList from './writeList'

const stackNav = createStackNavigator({
  supportList: {
    screen: supportList,
    navigationOptions: {
      headerShown: false
    }
  },
  ImageBrowser: {
    screen: ImageBrowserScreen,
  },
  writeList: {
    screen: writeList,
    navigationOptions: {
      headerShown: false
    }
  }
},
  {
    initialRouteName: 'supportList',
  },

);
export default createAppContainer(stackNav);
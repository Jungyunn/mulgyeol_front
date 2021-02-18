import React, { Component } from 'react';
import {
  StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TextInput,
  errortext, TouchableOpacity, Dimensions, Picker, Image, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
const screenWidth = Math.round(Dimensions.get('window').width);

export default class writeList extends Component {

  state = {
    date: '', //업로드 시간
    photos: [], //사진 여러장 업로드
    supportText: '', //후원/사용내역 설명
  };

  _submit = async () => {
    const { photos, date, supportText } = this.state
}

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

  componentDidMount() {
    this.getPermissionAsync();
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
    console.log(params.photos);
    delete params.photos;
  }
}

  renderImage(item, i) {
    return (
      <Image
        style={{ height: 200, width: 200 }}
        source={{ uri: item.uri }}
        key={i}
      />
      
    )
    
  }

  render() {
    return (
      <View style={styles.backScreen}>
      <KeyboardAvoidingScrollView stickyFooter={this._renderButton2('후원/사용내역 올리기', () => this.props.navigation.navigate("supportList"))}>
      <View style={styles.fab2}>
        {this._renderButton3('X', () => this.props.navigation.goBack())}
      </View>
        <View style={styles.modalContent}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ paddingBottom: 10, justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity style={{ width: 30, height: 30 }}>
                <Ionicons style={[{ color: "#000", paddingTop: 10 }]} size={25} name={'ios-images'} onPress={() => this.props.navigation.navigate("ImageBrowser")} />
              </TouchableOpacity>
              <Text style={{paddingTop: 10}}>사진을 변경하려면 아이콘을 눌러주세요</Text>
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {this.state.photos.map((item, i) => this.renderImage(item, i))}
            </ScrollView>


          </View>
          <TextInput
            multiline
            numberOfLines={10}
            placeholder="후원/사용내역에 대한 설명을 적어주세요!"
            placeholderTextColor="#3A4C7F"
            height={235}
            onChangeText={(supportText) => this.setState({ supportText })}
            value={this.state.supportText}
            style={{ textAlign: "center", padding: 10 }}>
          </TextInput>

        </View>

      </KeyboardAvoidingScrollView>
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
    right: 20,
    top:10,
    //left: Dimensions.get('window').width - 70,
    
    backgroundColor: '#D3E1F8',
    borderRadius: 30,
    elevation: 8
},
fabIcon2: {
    fontSize: 20,
    fontWeight:"bold"        
},

})
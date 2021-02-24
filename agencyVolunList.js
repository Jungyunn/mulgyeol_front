import React, { Component } from 'react';
import { Button, Linking, View, StyleSheet, Dimensions, ScrollView, Text, TouchableOpacity, 
    Image, AsyncStorage, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import jwt_decode from 'jwt-decode';
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler';

export default class agencyVolunList extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            image: null,
            chat_url: '',
            name:'',

            posts:[],
            name_vol:'',
            date:'',
        }
    }
    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('TOKEN');
            if (value != null) {
                this.setState({ jwt: value })
                this.getShelterInfo()
                this.getVolunList()
            }
            else {
                console.log("token이 없습니다!") 
            }
        } catch (error) {
            console.log(error)
        }
    };
   
    getShelterInfo(){
        var shelter_id = (jwt_decode(this.state.jwt)["shelter"]);
        axios('http://3.34.119.63/shelter/'+shelter_id+'/')
            .then((response)=>{
                if(response.status==200){
                    this.setState({
                        image: response.data.thumbnail,
                        chat_url: response.data.chat_url,
                        name:response.data.shelter_name
                    })
                }
            })
            
    }

    getVolunList() {
        var config = {
            method: 'get',
            url: 'http://3.34.119.63/volunteer/status/',
            headers: { 
              'Authorization': `jwt ${this.state.jwt}`
              
            }
          };
          
        axios(config)
        .then((response) => {
            if (response.status == 200) {
                
                this.setState({
                   posts:response.data,
                })
            
            }
            else {
                console.log("status is not 200");

            }
        })
        .catch((error) => {
            console.log(this.state.jwt + '!!!!!!!error!!!!!!!')
            console.log(error)
        });
    }

    


    _signOut = async() =>{        
        await AsyncStorage.clear();
        const value = await AsyncStorage.getItem('TOKEN');
        console.log(value);
        this.props.navigation.navigate('Login');       
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
                cropperCircleOverlay: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.cancelled) {
                this.setState({ image: result.uri });
            }

            console.log(result);
        } catch (E) {
            console.log(E);
        }
    }

    _imageLoad = () => {
        let { image } = this.state;
        if (image != null) {
            return (
                <TouchableOpacity style={{ width: 100, height: 100, borderWidth: 0.3, borderRadius: 63 }} onPress={this._pickImage}>
                    {image && <Image source={{ uri: image }}
                        style={{ width: 100, height: 100, borderRadius: 63, resizeMode: "cover" }} />}
                </TouchableOpacity>

            )
        }
        else {
            return (
                <TouchableOpacity style={{ width: 100, height: 100, borderWidth: 0.3, borderRadius: 63, justifyContent: "center", alignItems: "center" }} onPress={this._pickImage}>
                    <Ionicons style={[{ color: "#000", paddingTop: 10, }]} size={50} name={'ios-images'} onPress={this._pickImage} />
                </TouchableOpacity>
            )
        }
    }

    componentDidMount() {
        this._retrieveData();
        
    }

    render() {

        return (
            <View style={styles.backScreen}>
                <View style={styles.backScreen}>
                    <Text style={styles.title}> 봉사활동 신청자 리스트 </Text>
                    <View style={{ paddingTop: 10, paddingLeft: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                        <View style={{ paddingBottom: 10 }}>
                            {this._imageLoad()}
                        </View>
                       
                        <View>
                            <Text style={{textAlign:"center", fontSize:20, fontWeight:''}}>{this.state.name}</Text>
                            <TouchableOpacity
                                title="Open URL with ReactNative.Linking"
                                onPress={this._handleOpenWithLinking}
                                style={styles.URLbox}>
                                <Text style={{ fontSize: 16, paddingLeft: 10, paddingRight: 10 }}> 보호소 오픈채팅 바로가기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                   
                    <ScrollView>
                        <View style={styles.list}>
                            <View style={styles.forwidth_left}>

                                <FlatList
                                    keyExtractor={item => item.id}
                                    data={this.state.posts}
                                    renderItem={({ item }) => (
                                        <View>
                                            <Text style={styles.dateText}>{item.date}       (신청 인원:{item.current_number})</Text>
                                            {item.applicant.map((value,index) => {
                                                return <Text key = {index} style={styles.agencyText}>봉사자 {index+1}. {value.slice(4,)}</Text>
                                            })}
                                            <Text> </Text>
                                        </View>  
                                        
                                        
                                    )}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    <View>
                        <TouchableOpacity style={styles.logoutBtn} onPress={() => this._signOut()}>
                            <Text style={styles.logoutBtnText}>로그아웃하기</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );
    }

    _handleOpenWithLinking = () => {
        //Linking.openURL('https://open.kakao.com/o/sPKotCrc');
        Linking.openURL(this.state.chat_url);
    };

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
    },
    button: {
        marginVertical: 10,
    },
    backScreen: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    forwidth_left: {
        width: '100%',
        textAlign: 'center',
        justifyContent: 'center',
        
    },
    cancelBtn: {
        backgroundColor: '#7599FF',
        color: '#FFF',
        height: 60,
        alignItems: 'center',
        borderRadius: 15,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 15,
        marginBottom: 20,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    cancelBtnText: {
        color: '#FFF',
        fontSize: 20,
    },

    list: {
        width: '100%',
        flexDirection: 'row',
        borderBottomColor: '#e3e3e1',
        // borderBottomWidth:2 ,
        paddingTop: 30,
        paddingBottom: 0,
        alignContent: 'center',
        paddingLeft:Math.round(Dimensions.get('window').width)/6,
        //marginTop: 3,
        //width: screenWidth / 2 - 30,
        //marginRight: 20      
    },

    title: {
        fontWeight: 'bold',
        textAlign: "center",
        paddingTop: 50,
        paddingBottom: 15,
        fontSize: 15,
        fontSize: 25,
    },

    agencyText: {
        fontSize:16,
        paddingLeft:Math.round(Dimensions.get('window').width)/10,
    },

    dateText: {
        fontSize:18,
        backgroundColor:'#D3E1F8',
        paddingLeft:Math.round(Dimensions.get('window').width)/20,
        alignSelf: 'flex-start'
    },
  
    URLbox: {
        backgroundColor: '#81BEF7',
        color: '#FFF',
        height: 50,
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 25,
        marginRight: 25,
        marginTop: 15,
        marginBottom: 20,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    logoutBtn: {
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

    logoutBtnText: {
        color: '#FFF',
        paddingVertical: 12,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: 20,
    },


});
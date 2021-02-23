import React, { Component } from 'react';
import {
    AsyncStorage,
    StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TextInput,
    errortext, TouchableOpacity, Dimensions, Picker, Image, TouchableWithoutFeedback, Keyboard, Alert
} from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button, Icon, Row } from 'native-base';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import jwt_decode from 'jwt-decode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
import axios from 'axios'
import SyncStorage from 'sync-storage';
import { ThemeColors } from 'react-navigation';
import { FlatList } from 'react-native-gesture-handler';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


export default class Community extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleModal: null,
            image: null,
            date: '',
            commuText: null,
            jwt: null,
            showBongBtn: false, //메인페이지에서 봉 플로팅 버튼 (보호소에게만 보여야 함)
            showDeleteText: false,
            thumbnail:null,
            shelterNum: '',
            commuData: [],
            postId: '',

            comp_image: null,
            comp_commuText: null
        };
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
            const shelterID = SyncStorage.get('SHELTERID');
            const thumbnail = SyncStorage.get('THUMBNAIL');
            this.setState({ shelterNum: shelterID, thumbnail:thumbnail });

            if (value != null) {
                // We have data!!
                //console.log(value);
                //this.state.jwt = value;
                this.setState({ jwt: value })
                this.getCommunity()

            } else {
                this._watchCommunity()
                console.log("token이 없습니다!")
            }
        } catch (error) {
            console.log(error)
        }
    };

 
    getCommunity() { //AsyncStorate.getItem('Token') 으로 하면 엉망임. async await을 해야 제대로 들어감
        var config = {
            method: 'get',
            url: `http://3.34.119.63/community/?shelter=${this.state.shelterNum}`,
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    //console.log("getCommunity 로그확인:", this.state.jwt);
                    //console.log(response.data);
                    this.setState({ commuData: response.data })
                    this._userRole();
                }
                else {
                    console.log("로그인되지 않음");

                }
            })
            //.then(response=> console.log(response.data))

            .catch((error) => {
                console.log("error:" + this.state.jwt)
                console.log(error)
            });
    }


    _watchCommunity() { //로그인 없이도 글을 볼 수 있게 함
        axios(`http://3.34.119.63/community/?shelter=${this.state.shelterNum}`)
            .then((response) => {
                if (response.status == 200) {
                    //console.log(response.data);
                    this.setState({ commuData: response.data })
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

    _userRole = () => {
        var decoded_role = (jwt_decode(this.state.jwt)["user_role"]);
        var decoded_id = (jwt_decode(this.state.jwt)["shelter"]);
    
        if (decoded_role == "2" && (this.state.shelterNum == decoded_id )) {
            this.setState({ showBongBtn: true, showDeleteText: true})
        }
        else if ( decoded_role == "1" || this.state.shelterNum != decoded_id) { //봉사자면 보이지 않게
            this.setState({ showBongBtn: false, showDeleteText: false})
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

            console.log(result);
        } catch (E) {
            console.log(E);
        }
    }

    _imageLoad = () => {
        let { image } = this.state;
        if (image != null) {
            return (
                <TouchableOpacity style={{ width: 350, height: 250, borderWidth: 0.3, }} onPress={this._pickImage}>
                    {image && <Image source={{ uri: image }}
                        style={{ width: 350, height: 250, resizeMode: "cover" }} />}
                </TouchableOpacity>

            )
        }
        else {
            return (
                <TouchableOpacity style={{ width: 350, height: 250, borderWidth: 0.3, justifyContent: "center", alignItems: "center" }} onPress={this._pickImage}>
                    <Ionicons style={[{ color: "#000", paddingTop: 10, }]} size={50} name={'ios-images'} onPress={this._pickImage} />
                </TouchableOpacity>
            )
        }
    }

    post_community() {
        let url ='http://3.34.119.63/community/';
        const fileURL = this.state.image

        let formdata = new FormData();
         var photo = {
             uri: Platform.OS === 'android' ? fileURL : fileURL.replace('file://', ''),
             type: 'image/jpg',
             name: 'photo.jpg'
         }
        
        formdata.append("image", photo)
        formdata.append("content", this.state.commuText)

        fetch(url, {
            method: 'post',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `jwt ${this.state.jwt}`
            },
            body: formdata,

        }).then((response) => {
            if (response.status == 200) {
                alert(response.data.message)
               
            }
            else  {
                //alert(response.data.message)
                //alert(response.status + "^^")
                console.log(response.status)
            }

        }).catch((e) => {
            //alert(e)
            console.log(e);
        })
      
    }

    patch_community(){
        const fileURL = this.state.image

        let formdata = new FormData();
         var photo = {
             uri: Platform.OS === 'android' ? fileURL : fileURL.replace('file://', ''),
             type: 'image/jpg',
             name: 'photo.jpg'
         }
        
         /*
        if(this.state.commuText !== this.state.comp_commuText){
            formdata.append("content", this.state.commuText);
        }
        if(this.state.image !== this.state.comp_image){
            formdata.append("image", photo);
        } 
        */
       formdata.append("content", this.state.commuText);  
       formdata.append("image", photo);    
        
        var config = {
            method: 'patch',
            url: `http://3.34.119.63/community/${this.state.postId}/`,
            headers: {
                Accept: "application/json",
                'Content-Type': 'multipart/form-data',
                'Authorization': `jwt ${this.state.jwt}`
            },
            data: formdata
        };
        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    alert(response.status)
                }
                else {
                    alert(response.status)
                }
            })
            .catch((error) => {
                console.log(error.resp)
            });
       
    }

    
    get_commuPostId(){
        var config = {
            method: 'get',
            url: `http://3.34.119.63/community/${this.state.postId}/`,
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                console.log(response)
            })
            //.then(response=> console.log(response.data))

            .catch((error) => {
                console.log(error.response)
            });

    }

    
    delete_commuPost(){
        var config = {
            method: 'DELETE',
            url: `http://3.34.119.63/community/${this.state.postId}/`,
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                console.log(response)
            })
            //.then(response=> console.log(response.data))

            .catch((error) => {
                console.log(error.response)
            });

    }

    postORpatch(){
        if(this.state.postId == null){
            this.post_community();
        }
        else{
            this.patch_community();
        }
    }
    

    render() {
        return (
            <View style={styles.backScreen}>

                <FlatList
                    keyExtractor={item => item.id}
                    data={this.state.commuData}
                    renderItem={({ item }) => (
                        <Card style={styles.cardStyle}>
                            <CardItem>
                                <Left>
                                    <Thumbnail source={{uri:'https://mulgyeol-static-storage.s3.ap-northeast-2.amazonaws.com/' + this.state.thumbnail}} />
                                    <Body>
                                        <View flexDirection="row">
                                            <Text style={{ fontWeight: '900', fontSize: 17, fontWeight: "bold" }}>{item.shelter_name}</Text>
                                            <TouchableOpacity style={{ position: "absolute", right: 50 }} 
                                            onPress={() => {this.setState({postId: item.id, visibleModal: 1});} 
                                                            }>

                                                {this.state.showDeleteText ? (
                                                    <Text style={{ color: "#5f5f5f", fontSize: 16 }}>수정</Text>

                                                ) : null }                
                                                
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ position: "absolute", right: 0 }} 
                                            onPress={() => {this.setState({postId: item.id});     
                                                            Alert.alert('삭제', '삭제하시겠습니까?', 
                                                            [
                                                                {text:"OK", onPress:()=>{this.delete_commuPost(), console.log(this.state.postId)}},
                                                                {text:"NO", style:'cancel'}
                                                            ],
                                                            {cancelable: true}
                                                            )                                            
                                                            }}>

                                                {this.state.showDeleteText ? (
                                                    <Text style={{ color: "#5f5f5f", fontSize: 16 }}>삭제</Text>

                                                ) : null }                
                                                
                                            </TouchableOpacity>
                                        </View>

                                        <Text>{item.created_at.slice(0, 10)}</Text>

                                    </Body>
                                </Left>
                            </CardItem>
                            <CardItem cardBody>
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ height:screenHeight/2.5, width: null, flex: 1 }}
                                />
                            </CardItem>
                            <CardItem>
                                <Body>
                                    <Text>{item.content}</Text>
                                </Body>
                            </CardItem>
                        </Card>
                    )}
                />

                <Modal isVisible={this.state.visibleModal === 1}>
                    <KeyboardAvoidingScrollView stickyFooter={this._renderButton2('새로운 소식 알리기', () => {this.setState({ visibleModal: null }), this.postORpatch()})}>
                        <View style={styles.fab2}>
                            {this._renderButton3('X', () => this.setState({ visibleModal: null, }))}
                        </View>
                        <View style={styles.modalContent}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ paddingBottom: 10 }}>
                                    {this._imageLoad()}
                                </View>
                            </View>

                            <TextInput
                                multiline
                                numberOfLines={10}
                                placeholder="커뮤니티에 올릴 소식을 적어주세요!"
                                placeholderTextColor="#3A4C7F"
                                height={235}
                                style={{ textAlign: "center", padding: 10 }}
                                onChangeText={(commuText => this.setState({ commuText }))}
                                value={this.state.commuText}>
                            </TextInput>

                        </View>

                    </KeyboardAvoidingScrollView>
                </Modal>

                <View style={{ paddingTop: 30 }}>

                </View>
                {this.state.showBongBtn ? (
                    <View style={styles.fab}>
                        {this._renderButton1('커', () =>
                            this.setState({ visibleModal: 1 }))}
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

})
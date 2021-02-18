import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Text,
    TextInput,
    Picker,
    TouchableOpacity,
    Image,
    Dimensions,
    AsyncStorage,



} from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TagSelect } from 'react-native-tag-select';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { round, onChange } from 'react-native-reanimated';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'axios'
import jwt_decode from 'jwt-decode';
import SyncStorage from 'sync-storage';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';

const screenWidth = Math.round(Dimensions.get('window').width);


const tagData = [
    { id: 1, label: '#모집중' },
    { id: 2, label: '#모집종료' },
    { id: 3, label: '#급구' },
    { id: 4, label: '#개' },
    { id: 5, label: '#고양이' },
    { id: 6, label: '#기타동물' },
    { id: 7, label: '#정기봉사' },
    { id: 8, label: '#단기봉사' },
    { id: 9, label: '#청소' },
    { id: 10, label: '#산책' },
    { id: 11, label: '#목욕' },
    { id: 12, label: '#기타봉사' },
];

const seoul_gu = ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
    "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
    "양춘구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"]

const gyeong_gu = ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시",
    "평택시", "의정부시", "시흥시", "파주시", "광명시", "김포시", "군포시", "광주시", "이천시",
    "양주시", "오산시", "구리시", "안성시", "포천시", "의왕시", "하남시", "여주시", "양평군",
    "동두천시", "과천시", "가평군", "연천군"]

const gyeongnam_gu = ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군",
    "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"]



export default class mainPage extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            sido: 'key1',
            visibleModal: null,
            image: null,
            selectedArray: [],
            jwt: null,
            loading: null,
            showBongBtn: true, //메인페이지에서 봉 플로팅 버튼 (보호소에게만 보여야 함)
            showAppyBtn: true, //메인페이지에서 봉사신청 버튼 (로그인하고, 봉사자 에게만 보여야 함)
            posts: [],
            info: '',

        }
        this.t = setInterval(() => {
            this.setState({ count: this.state.count + 1 });
        }, 10);
        clearInterval(this.t);
    }



    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('TOKEN');
            if (value != null) {
                // We have data!!
                //console.log(value);
                //this.state.jwt = value;
                this.setState({ jwt: value })
                this.checkLogin()


            } else {
                console.log("token이 없습니다!")
                this.setState({ showAppyBtn: false, showBongBtn: false })


            }
        } catch (error) {
            console.log(error)
        }
    };

    getItems(val) {
        if (val == 'key1') {
            return seoul_gu;
        }
        if (val == 'key2') {
            return gyeong_gu;
        }
        if (val == 'key3') {
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



    componentDidMount() {
        this.getPermissionAsync();
        this.getVolunPost();
        //this.getVolunPost();
        //Here is the Trick
        const { navigation } = this.props;
        //Adding an event listner om focus
        //So whenever the screen will have focus it will set the state to zero
        this.focusListener = navigation.addListener('didFocus', () => {
            this.setState({ count: 0 });
            this._retrieveData();
            this.getVolunPost();
            //console.log(this.state.count)
        });
    }

    componentWillUnmount() {
        // Remove the event listener before removing the screen from the stack
        this.focusListener.remove();
        clearTimeout(this.t);

    }

    checkLogin() { //AsyncStorate.getItem('Token') 으로 하면 엉망임. async await을 해야 제대로 들어감
        var config = {
            method: 'get',
            url: 'http://3.34.59.121:8000/volunteer',
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    console.log("로그확인:", this.state.jwt);
                    //console.log("물결말고shelter번호:" , response.data[0].shelter_location);
                    //console.log(response.data);
                    //this.setState({ posts: response.data })
                    //console.log("shelter번호:", response.data[0].shelter);

                    //console.log("here"+this.state.feeds)
                    this._userRole();

                    //loading:true
                }
                else {
                    console.log("로그인되지 않음");

                }
            })

            .catch((error) => {
                console.log("error:" + this.state.jwt)
                this.setState({
                    error: 'Error retrieving data',
                    loading: false

                });
                console.log(error)
            });
    }

    getVolunPost() { //로그인을 안해도 글을 볼 수 있게 하기 위한 함수
        axios('http://3.34.59.121:8000/volunteer')
            .then((response) => {
                if (response.status == 200) {
                    console.log("로그확인:");
                    console.log(response.data);
                    this.setState({ posts: response.data })
                }
            })
            .catch((error) => {
                console.log("error:" + this.state.jwt)
                this.setState({
                    error: 'Error retrieving data',
                    loading: false

                });
                console.log(error)
            });
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

            //console.log(result);
        } catch (E) {
            console.log(E);
        }
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
    showdata() {
        return tagData.map(function (tag, i) {
            return (

                <View key={i}>
                    <Text>{tag.id}</Text>
                    <View>
                        <Text>{tag.label}</Text>
                    </View>
                </View>
            )
        })
    }


    CheckTag = () => {
        var tagS = JSON.stringify(this.tag1.itemsSelected)


        //tagS.slice(7,8):1
        //tagS.slice(31,32)):2
        //alert(tagS.slice(32,33))

        //if ((data.filter(data => data.id == 1) && data.filter(data => data.id == 2)) ||
        if (tagS.slice(7, 9) == "1," && tagS.slice(31, 32) == '2' ||
            tagS.slice(7, 9) != "1," && tagS.slice(7, 8) != '2'
            //(data.filter(data => data.id != 1) && data.filter(data => data.id != 2))
        ) {
            alert("모집상태는 1개만 선택할 수 있습니다.")
        }
        else if (tagS.slice(7, 8) == '2' && tagS.slice(32, 33) == '3') {
            alert("'모집종료'상태에서는 '급구'를 선택할 수 없습니다.")
        }
        else {
            this.setState({ visibleModal: null, /*image: null 버튼 누르면 기존 이미지 지우도록*/ });
        }
    };

    _userRole = () => {
        var decoded = (jwt_decode(this.state.jwt)["user_role"]);

        console.log(decoded)
        if (decoded == "2") {
            this.setState({ showBongBtn: true, showAppyBtn: false })

        }
        else if (decoded == "1") { //봉사자면 보이지 않게
            this.setState({ showBongBtn: false, showAppyBtn: true })
        }
    }





    render() {
        //const { navigate } = this.props.navigation;
        return (

            <View style={styles.backScreen}>
                <View style={{ paddingTop: 30, flex: 1 }}>
                    <View style={{ flexDirection: 'row', height: 40, marginLeft: 20, marginRight: 20, justifyContent: 'center', marginBottom: 10 }}>
                        <View style={styles.inputStyle}>

                            <Text style={styles.idText}>봉사지역</Text>
                            <Picker
                                itemStyle={{ height: 50 }}
                                selectedValue={this.state.sido}
                                style={{ height: 50, width: 150 }}
                                onValueChange={this.onValueChange.bind(this)}>
                                <Picker.Item label="서울특별시" value="key1" />
                                <Picker.Item label="경기도" value="key2" />
                                <Picker.Item label="경상남도" value="key3" />
                            </Picker>


                            <Picker
                                itemStyle={{ height: 50 }}
                                style={{ height: 50, width: 115 }}
                                selectedValue={this.state.sigu}
                                onValueChange={this.onValueChange2.bind(this)}>
                                {this.getItems(this.state.sido).map((item, i) => {
                                    return <Picker.Item label={item} key={`${i}+1`} value={i} />
                                })}
                            </Picker>
                        </View>

                    </View>
                    <View style={styles.SectionStyle}>
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}>
                            <TagSelect

                                data={tagData}
                                max={12}
                                itemStyle={{ backgroundColor: "#E9ECEF" }}
                                itemLabelStyle={{ fontSize: 11.4 }}

                                ref={(tag) => {
                                    this.tag = tag;
                                }}

                            /*
                            onMaxError={() => {
                              Alert.alert('Ops', 'Max reached');
                            }}
                          />
                          <View style={styles.buttonContainer}>
                            <View style={styles.buttonInner}>
                              <Button
                                title="Get selected count"
                                style={styles.button}
                                onPress={() => {
                                  Alert.alert('Selected count', `Total: ${this.tag.totalSelected}`);
                                }}
                              />
                            </View>
                            <View>
                              <Button
                                title="Get selected"
                                onPress={() => {
                                  Alert.alert('Selected items:', JSON.stringify(this.tag.itemsSelected));
                                }}
                              />
                            </View>
                          </View>
                          아래에 />은 주석지우면 지워야함!
                          */

                            />


                        </ScrollView>

                    </View>
                    <View>
                        <TouchableOpacity style={styles.searchBtn} onPress={() => {
                            /*{this.tag.itemsSelected.map((item, i) => {
                                    return <selectedArray label={item} key={`${i}+1`} value={i} />
                            })}*/
                            //this.state.selectedArray = this.tag.itemsSelected[0]["label"]
                            //Alert.alert('Selected items:', JSON.stringify(this.state.selectedArray));
                            alert(this.state.posts);
                        }}>
                            <Text style={styles.searchBtnText}>
                                보호소 검색
                                </Text>
                        </TouchableOpacity>
                    </View>



                    <FlatList
                        keyExtractor={item => item.id}
                        data={this.state.posts}
                        renderItem={({ item }) => (
                            <Card style={styles.cardStyle}>
                                <TouchableOpacity onPress={() => {
                                    //this.setState({shelterId:item.shelter})
                                    SyncStorage.set('SHELTERID', item.shelter);
                                    this.props.navigation.navigate('aboutAgency')
                                }}>

                                    <CardItem cardBody>
                                        {item.image == null ?
                                            (<Image
                                                source={require('./assets/icon.png')}
                                                style={{ height: 200, width: null, flex: 1, borderTopRightRadius: 20, borderTopLeftRadius: 20, }}
                                            />) :
                                            (
                                                <Image
                                                    source={{ uri: item.image }}
                                                    style={{ height: 200, width: null, flex: 1, borderTopRightRadius: 20, borderTopLeftRadius: 20, }}
                                                />
                                            )}

                                    </CardItem>
                                </TouchableOpacity>
                                <CardItem>
                                    <Left>
                                        <Thumbnail source={require('./assets/icon.png')} />
                                        <Body>
                                            <View flexDirection="row">
                                                <Text style={{ fontWeight: '900', fontSize: 17, fontWeight: "bold" }}>{item.shelter_name}</Text>

                                                {this.state.showAppyBtn ?
                                                    (<TouchableOpacity
                                                        style={styles.regiBtn}
                                                        onPress={() => this.props.navigation.navigate("volunteerDate")}>
                                                        <Text>봉사신청</Text>
                                                    </TouchableOpacity>) : null}

                                            </View>

                                            <Text>모집중</Text>

                                        </Body>
                                    </Left>
                                </CardItem>
                                <CardItem>
                                    <Left>
                                        <Text style={{ fontSize: 15, fontWeight: '200' }}>{item.shelter_location}</Text>
                                    </Left>
                                    <Right>
                                        <Text style={{ fontSize: 15, fontWeight: '400' }}> {item.shelter_status}</Text>
                                    </Right>
                                </CardItem>
                                <CardItem>

                                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                        {item.tags.map((tags) =>
                                            <View style={styles.tag_shape}>
                                                <Text style={{ fontSize: 13.5, fontWeight: "300" }}>{tags["name"]}</Text>
                                            </View>
                                        )}
                                    </View>

                                </CardItem>
                                <CardItem>
                                    <View style={styles.info}>
                                        <Text style={{ paddingLeft: 10, paddingRight: 10 }} >{item.information}</Text>
                                    </View>
                                </CardItem>
                            </Card>
                        )}
                    />
                </View>



                <Modal isVisible={this.state.visibleModal === 1}>
                    <KeyboardAvoidingScrollView stickyFooter={this._renderButton2('봉사자 모집하기', () => this.setState({ visibleModal: null }))}>
                        <View style={styles.fab2}>
                            {this._renderButton3('X', () => this.setState({ visibleModal: null, }))}
                        </View>
                        <View style={styles.modalContent}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ paddingBottom: 10, paddingTop: 20 }}>
                                    {this._imageLoad()}
                                </View>
                            </View>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', paddingLeft: 10 }}> 보호소 이름 (데베에서) </Text>
                            <View style={{ flexDirection: "row", paddingBottom: 10, paddingLeft: 10 }}>
                                <Text style={{ fontSize: 15 }}> 지역(데베에서) </Text>
                                <Text style={{ fontSize: 15 }}> 동물 현황(데베에서) </Text>
                            </View>

                            <View style={{ paddingLeft: 10 }}>
                                <TagSelect

                                    data={tagData}
                                    max={12}
                                    itemStyle={{ backgroundColor: "#E9ECEF", }}
                                    itemLabelStyle={{ fontSize: 11.4 }}
                                    ref={(tag1) => {
                                        this.tag1 = tag1;
                                    }}

                                />
                            </View>

                            <TextInput
                                multiline
                                numberOfLines={3}
                                placeholder="커뮤니티에 올릴 소식을 적어주세요!"
                                placeholderTextColor="#3A4C7F"
                                height={85}
                                maxLength={75}
                                style={{ textAlign: "center", padding: 10 }}
                                onChangeText={(commuText => this.setState({ commuText }))}
                                value={this.state.commuText}>
                            </TextInput>

                        </View>

                    </KeyboardAvoidingScrollView>
                </Modal>


                {this.state.showBongBtn ? (
                    <View style={styles.fab}>
                        {this._renderButton1('봉', () =>
                            this.setState({ visibleModal: 1 }))}
                    </View>
                ) : null}

            </View>


        );
    }
}

const styles = StyleSheet.create({
    backScreen: {
        flex: 1,
        //justifyContent: 'center',
        backgroundColor: '#FFF',
    },

    cardStyle: {
        width: screenWidth - 20,
        //backgroundColor: '#eaf6f8',
        borderRadius: 20,
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

    SectionStyle: {
        flexDirection: 'row',
        marginTop: 10,
        marginLeft: 36,
        marginRight: 36,
    },

    idText: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 10,
        textAlign: 'center',
        marginLeft: 10,
        marginRight: 10,
    },

    searchBtn: {
        backgroundColor: '#7599FF',
        color: '#FFF',
        height: 40,
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

    searchBtnText: {
        color: '#FFF',

        fontSize: 20,
    },

    inputStyle: {
        //flex: 1,
        flexDirection: 'row',
        color: '#000',
        height: 50,
        borderWidth: 2,
        borderRadius: 15,
        borderColor: '#7599FF',
        alignItems: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
        justifyContent: 'center', //Centered vertically

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        height: 560,
        //padding: 22,
        justifyContent: 'center',
        //alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',

    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
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
        top: 5,
        //left: Dimensions.get('window').width - 70,

        backgroundColor: '#D3E1F8',
        borderRadius: 30,
        elevation: 8
    },
    fabIcon2: {
        fontSize: 20,
        fontWeight: "bold"
    },
    regiBtn: {
        position: "absolute",
        right: -5,
        backgroundColor: '#D3E1F8',
        padding: 10,

        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',

    },

    tag_shape: {
        width: 80,
        height: 34,
        marginLeft: 5,
        backgroundColor: '#E9ECEF',
        borderRadius: 10,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    info: {

        width: screenWidth - 50,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000',
        paddingTop: 5, paddingBottom: 5,
        textAlignVertical: 'center',
        justifyContent: 'center',
    }

});
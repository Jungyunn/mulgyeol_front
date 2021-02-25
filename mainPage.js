import React, { useState } from 'react';
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
}
    from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TagSelect } from 'react-native-tag-select';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { round, onChange, set } from 'react-native-reanimated';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import axios from 'axios'
import jwt_decode from 'jwt-decode';
import SyncStorage from 'sync-storage';
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
import DatePicker from 'react-native-datepicker';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

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

const regardless=[]
const seoul_gu = ["전체", "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
    "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
    "양춘구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"]

const gyeong_gu = ["전체", "수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시",
    "평택시", "의정부시", "시흥시", "파주시", "광명시", "김포시", "군포시", "광주시", "이천시",
    "양주시", "오산시", "구리시", "안성시", "포천시", "의왕시", "하남시", "여주시", "양평군",
    "동두천시", "과천시", "가평군", "연천군"]

const gyeongnam_gu = ["전체", "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군",
    "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"]

var taglabel = '';
var searchtaglabel = '';
const currentDate = new Date();
var location_sido, location_sigu, location;

export default class mainPage extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            sido: 'key1',
            sigu:0,
            visibleModal: null,
            image: null,
            selectedArray: [],
            jwt: null,
            loading: null,
            showBongBtn: true, //메인페이지에서 봉 플로팅 버튼 (보호소에게만 보여야 함)
            showAppyBtn: true, //메인페이지에서 봉사신청 버튼 (로그인하고, 봉사자 에게만 보여야 함)
            posts: [],
            info: '',
            shelterIdnum: '',
            info_name: '',
            info_location: '',
            info_animal: '',
            volunteerText: null,
            tag_size: '',
            comp_info: null,
            comp_image: null,
            post_id: null,

            start_date: new Date(),
            end_date: new Date(),
            max_date: new Date(currentDate.setMonth(currentDate.getMonth() + 1)),

            comp_startDate: null,
            comp_endDate: null
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
        if (val == 'key4') {
            return regardless;
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
        this._retrieveData();
        this.getVolunPost();
        //Here is the Trick
        const { navigation } = this.props;
        //Adding an event listner om focus
        //So whenever the screen will have focus it will set the state to zero
        this.focusListener = navigation.addListener('didFocus', () => {
            this.setState({ count: 0 });
            this._retrieveData();
            this.getVolunPost();
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
            url: 'http://3.34.119.63/volunteer',
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    //console.log("물결말고shelter번호:" , response.data[0].shelter_location);
                    //console.log(response.data);

                    this._userRole();
                    //alert(response.data[2].shelter_name)
                    this.setState({
                        posts: response.data,
                    })
                    var cnt = 1;
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].shelter == this.state.shelterIdnum) {
                            this.setState({
                                post_id: response.data[i].id,
                            })
                            cnt++;
                        } else if (cnt == 1) {
                            this.setState({
                                post_id: null,
                            })
                        }
                    }

                    //  if(response.data[this.state.shelterIdnum]==null){
                    //      this.setState({post_id:null})

                    //  }else{
                    //      this.setState({post_id:response.data[this.state.shelterIdnum].id});
                    //      alert(response.data[this.state.shelterIdnum].shelter_name);
                    //  }
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

    getShelterInfo() {
        var shelter_id = (jwt_decode(this.state.jwt)["shelter"]);
        axios('http://3.34.119.63/shelter/' + shelter_id + '/')
            .then((response) => {
                if (response.status == 200) {
                    this.setState({
                        info_name: response.data.shelter_name,
                        info_location: response.data.loc_short,
                        info_animal: response.data.status,
                        
                    })
                }
            })

    }

    getVolunPost() { //로그인을 안해도 글을 볼 수 있게 하기 위한 함수
        axios('http://3.34.119.63/volunteer')
            .then((response) => {
                if (response.status == 200) {
                    //console.log("로그확인:");
                    //console.log(response.data);
                    this.setState({
                        posts: response.data
                    })
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

    getSearchPost() {
        //axios(`http://3.34.119.63/volunteer/?tag=#모집종료&location=경기도 고양시`)
        let url = `http://3.34.119.63/volunteer/${searchtaglabel}${location}`
        axios(url)
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data)
                    console.log(url);
                    this.setState({
                        posts: response.data
                    })
                }
            })
            .catch((error) => {
                console.log(error.response);
            });
        searchtaglabel = '';
    }

    getVolunPostId() {
        var config = {
            method: 'get',
            url: `http://3.34.119.63/volunteer/${this.state.post_id}/`,
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    console.log(200);
                    console.log(response.data);
                    this.setState({
                        comp_image: response.data.image,
                        comp_info: response.data.information,
                        comp_startDate: response.data.start_date,
                        comp_endDate: response.data.end_date,

                        image: response.data.image,
                        volunteerText: response.data.information,
                        start_date: response.data.start_date,
                        end_date: response.data.end_date

                    })

                    // for(var i=0; i<response.data.tags.length;i++){
                    //     get_tags[i]=response.data.tags[i]["text"];
                    //     comp_tags+=response.data.tags[i]["text"]+", ";
                    // }
                    //comp_image=response.data.image;
                    //comp_info=response.data.info;
                }
                else {
                    console.log(response);

                }
                //alert(response.data.information);

            })

            .catch((error) => {
                this.setState({
                    comp_image: response.data.image,
                    comp_info: response.data.information,
                })
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
    
    SearchTag = () => {

        if(this.state.sido=='key1') {location_sido='서울특별시'; location_sigu=seoul_gu[this.state.sigu]}
        else if(this.state.sido=='key2') {location_sido='경기도'; location_sigu=gyeong_gu[this.state.sigu]}
        else if(this.state.sido=='key3') {location_sido='경상남도'; location_sigu=gyeongnam_gu[this.state.sigu]}
        if(location_sigu=="전체") {location='location='+location_sido}
        else if(this.state.sido=='key4') {location=''}
        else {location='location='+location_sido+' '+location_sigu}

        if(this.tag.itemsSelected.length==0)
        {  
            searchtaglabel='?';
        }else{
            for (var i = 0; i < this.tag.itemsSelected.length; i++) {
                searchtaglabel += '?tag='+this.tag.itemsSelected[i]["label"]+'&'
            }
        }        
        
        //alert(location)
        this.getSearchPost();
    }




    CheckTag = () => {

        if (this.tag1.itemsSelected.length == 0) {
            alert("'모집상태'를 선택해야합니다.");
            return 0;
        }

        for (var i = 0; i < this.tag1.itemsSelected.length; i++) {
            taglabel += this.tag1.itemsSelected[i]["label"] + ", "
        }

        if (this.tag1.itemsSelected.length != 1) {
            if (this.tag1.itemsSelected[0]["id"] == 1 && this.tag1.itemsSelected[1]["id"] == 2 ||
                this.tag1.itemsSelected[0]["id"] != 1 && this.tag1.itemsSelected[0]["id"] != 2) {
                alert("모집상태는 1개만 선택할 수 있습니다.");
            }
            else if (this.tag1.itemsSelected[0]["id"] == 2 && this.tag1.itemsSelected[1]["id"] == 3) {
                alert("'모집종료'상태에서는 '급구'를 선택할 수 없습니다.");
            }
            else {
                this.setState({ visibleModal: null, /*image: null 버튼 누르면 기존 이미지 지우도록*/ });
                //comp_tag로 수정해야함
                if (this.state.post_id == null) {
                    this.post_volunteer();
                }
                else {
                    this.patch_volunteer();
                }
            }
        } else {
            if (this.tag1.itemsSelected[0]['id'] == 1 || this.tag1.itemsSelected[0]['id'] == 2) {
                this.setState({ visibleModal: null, /*image: null 버튼 누르면 기존 이미지 지우도록*/ });

                if (this.state.post_id == null) {
                    this.post_volunteer();
                }
                else {
                    this.patch_volunteer();
                }
            }
            else {
                alert("'모집상태'를 선택해야합니다.");
            }
        }

    };


    patch_volunteer() {
        const fileURL = this.state.image;

        var formData = new FormData();
        var photo = {
            uri: Platform.OS === 'android' ? fileURL : fileURL.replace('file://', ''),
            type: 'image/jpg',
            name: 'photo.jpg'
        }

        if (this.state.volunteerText !== this.state.comp_info) {
            formData.append('information', this.state.volunteerText);
        }
        if (this.state.image !== this.state.comp_image) {
            formData.append('image', photo);
        }

        formData.append("start_date", this.state.start_date);        
        formData.append("end_date", this.state.end_date);  
        formData.append('tags', taglabel);

        var config = {
            method: 'patch',
            url: `http://3.34.119.63/volunteer/${this.state.post_id}/`,
            headers: {
                Accept: "application/json",
                'Content-Type': 'multipart/form-data',
                'Authorization': `jwt ${this.state.jwt}`
            },
            data: formData
        };
        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    //alert(response.status)
                    this.getVolunPost();
                }
                else {
                    //alert(response.status)
                }
            })
            .catch((error) => {
                console.log(error.response)
            });
        taglabel = '';

    }

    post_volunteer() {
        let url = "http://3.34.119.63/volunteer/";
        const fileURL = this.state.image
        let formdata = new FormData();
        var photo = {
            uri: Platform.OS === 'android' ? fileURL : fileURL.replace('file://', ''),
            type: 'image/jpg',
            name: 'photo.jpg'
        }

        formdata.append("image", photo)
        formdata.append("information", this.state.volunteerText)
        formdata.append("start_date", this.state.start_date)
        formdata.append("end_date", this.state.end_date)
        formdata.append("tags", taglabel);

        fetch(url, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `jwt ${this.state.jwt}`
            },
            body: formdata,
        }).then((response) => {
            if (response.status == 200) {
               
                //alert(response.status)
                //alert(response.data.message)
               

            }
            else if (response.status == 400) {
                //alert(response.data.message)
                //alert(response.status)
            }
            alert("봉사 모집 공고를 올렸습니다.")
            this.getVolunPost();

        }).catch((e) => {
            console.log(e);
        });
        taglabel = '';

    }




    _userRole = () => {
        var decoded = (jwt_decode(this.state.jwt)["user_role"]);
        var user_id = (jwt_decode(this.state.jwt)["shelter"]);

        console.log(decoded)

        if (decoded == "2") {
            this.setState({ showBongBtn: true, showAppyBtn: false, shelterIdnum: user_id })
            this.getShelterInfo();
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
                                <Picker.Item label="지역무관" value="key4" />
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
                            {
                                this.tag.itemsSelected.map((item, i) => {
                                    return <selectedArray label={item} key={`${i}+1`} value={i} />
                                })
                            }

                            //this.state.selectedArray = this.tag.itemsSelected[0]["label"]
                            //Alert.alert('Selected items:', JSON.stringify(this.state.selectedArray));

                            this.SearchTag()
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
                                    this.setState({ shelterId: item.shelter })
                                    SyncStorage.set('SHELTERID', item.shelter);
                                    SyncStorage.set('THUMBNAIL', item.shelter_thumbnail);
                                    this.props.navigation.navigate('aboutAgency')
                                   

                                }}>

                                    <CardItem cardBody>
                                        {item.image == null ?
                                            (<Image
                                                source={require('./assets/icon.png')}
                                                style={{ height: screenHeight / 3, width: null, flex: 1, borderTopRightRadius: 20, borderTopLeftRadius: 20, }}
                                            />) :
                                            (
                                                <Image
                                                    source={{ uri: item.image }}
                                                    style={{ height: screenHeight / 3, width: null, flex: 1, borderTopRightRadius: 20, borderTopLeftRadius: 20, }}
                                                />
                                            )}

                                    </CardItem>
                                </TouchableOpacity>
                                <CardItem>
                                    <Left>
                                        <Thumbnail source={{ uri: 'https://mulgyeol-static-storage.s3.ap-northeast-2.amazonaws.com/' + item.shelter_thumbnail }} />
                                        <Body>
                                            <View flexDirection="row">
                                                <Text style={{ fontWeight: '900', fontSize: 17, fontWeight: "bold" }}>{item.shelter_name}</Text>
                                                   
                                                    {this.state.showAppyBtn && item.tags[0]["text"]==="#모집중" ?
                                                        (<TouchableOpacity
                                                            style={styles.regiBtn}
                                                            onPress={() => {
                                                                this.props.navigation.navigate("volunteerDate"),
                                                                SyncStorage.set('SHELTERID', item.shelter);
                                                                SyncStorage.set('START', item.start_date);
                                                                SyncStorage.set('END', item.end_date);
                                                                
                                                                }}>
                                                            <Text>봉사신청</Text>
                                                        </TouchableOpacity>) : null}
                                                
                                            </View>
                                            <Text>{item.tags[0]["text"].slice(1,)} </Text>
                                        </Body>
                                    </Left>
                                </CardItem>
                                <CardItem>
                                    <Left>
                                            <Text style={{ fontSize: 15, fontWeight: '200' }}>{item.shelter_location}</Text>
                                                      
                                    </Left> 
                                        { item.tags[0]["text"]==="#모집중" ?
                                            ( <Text style={{ fontSize: 15, fontWeight: '200' }}>{item.start_date} ~ {item.end_date} </Text>)  : null}
                                       
                                    
                                </CardItem>

                                <CardItem >

                                    <ScrollView>
                                        <View style={{ flexDirection: 'row' }}>
                                            {item.tags.slice(0, 4).map((tags) =>
                                                <View style={styles.tag_shape}>
                                                    <Text style={{ fontSize: 13.5, fontWeight: "300" }}>
                                                        {tags["text"]}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                            {item.tags.slice(4, 8).map((tags) =>
                                                <View style={styles.tag_shape}>
                                                    <Text style={{ fontSize: 13.5, fontWeight: "300" }}>
                                                        {tags["text"]}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                            {item.tags.slice(8, 12).map((tags) =>
                                                <View style={styles.tag_shape}>
                                                    <Text style={{ fontSize: 13.5, fontWeight: "300" }}>
                                                        {tags["text"]}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </ScrollView>
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
                    <KeyboardAvoidingScrollView stickyFooter={this._renderButton2('봉사자 모집하기', () => this.CheckTag())}>
                        <View style={styles.fab2}>
                            {this._renderButton3('X', () => this.setState({ visibleModal: null, }))}
                        </View>
                        <View style={styles.modalContent}>
                            <ScrollView>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ paddingBottom: 10, paddingTop: 20 }}>
                                    {this._imageLoad()}
                                </View>
                            </View>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', paddingLeft: 10 }}> {this.state.info_name} </Text>
                            <View style={{ flexDirection: "row", paddingBottom: 10, paddingLeft: 10 }}>
                                <Text style={{ fontSize: 15 }}> {this.state.info_location}</Text>
                                <Text style={{ fontSize: 15 }}> {this.state.info_animal}</Text>
                            </View>
                            <View style={{ flexDirection: "row",  justifyContent: "center", alignContent: "center", marginBottom:15}}>
                                <DatePicker
                                    style={{ width: (screenWidth/5)*2 }}
                                    date={this.state.start_date}
                                    mode="date"
                                    placeholder="select date"
                                    format="YYYY-MM-DD"
                                    minDate={this.state.start_date}
                                    maxDate={this.state.max_date}
                                    confirmBtnText="확인"
                                    cancelBtnText="취소"
                                    customStyles={{
                                        dateIcon: {
                                            position: 'absolute',
                                            left: 0,
                                            top: 4,
                                            marginLeft: 0
                                        },
                                        dateInput: {
                                            marginLeft: 40
                                        }
                                        // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={(date) => { this.setState({ start_date: date }) }}
                                />
                                <Text> ~</Text>
                                <DatePicker
                                    style={{ width: (screenWidth/5)*2 }}
                                    date={this.state.end_date}
                                    mode="date"
                                    placeholder="select date"
                                    format="YYYY-MM-DD"
                                    minDate={this.state.start_date}
                                    maxDate={this.state.max_date}
                                    confirmBtnText="확인"
                                    cancelBtnText="취소"
                                    customStyles={{
                                        dateIcon: {
                                            position: 'absolute',
                                            left: 0,
                                            top: 4,
                                            marginLeft: 0
                                        },
                                        dateInput: {
                                            marginLeft: 40
                                        }
                                        // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={(date) => { this.setState({ end_date: date }) }}
                                />
                            </View>
                            <View style={{ paddingLeft: 16 }}>
                                <TagSelect

                                    data={tagData}
                                    max={12}
                                    itemStyle={{ backgroundColor: "#E9ECEF", }}
                                    itemLabelStyle={{ fontSize: 12 }}
                                    ref={(tag1) => {
                                        this.tag1 = tag1;
                                    }}
                                />
                            </View>

                            <TextInput
                                multiline
                                numberOfLines={3}
                                placeholder="봉사 모집 소개를 간략히 적어주세요!"
                                placeholderTextColor="#3A4C7F"
                                height={85}
                                maxLength={200}
                                style={{ textAlign: "center", padding: 10, marginBottom:10 }}
                                onChangeText={(volunteerText => this.setState({ volunteerText }))}
                                value={this.state.volunteerText}>
                            </TextInput>
                            </ScrollView>
                        </View>

                    </KeyboardAvoidingScrollView>
                </Modal>


                {
                    this.state.showBongBtn ? (
                        <View style={styles.fab}>
                            {this._renderButton1('봉', () => {
                                this.setState({ visibleModal: 1 });
                                this.getVolunPostId();
                            })}
                        </View>
                    ) : null
                }

            </View >


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
        marginTop: 45,
        height: (screenHeight/5)*4,
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
        width: screenWidth/4.95,
        height: 34,
        marginLeft: 5,
        backgroundColor: '#E9ECEF',
        borderRadius: 10,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',

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
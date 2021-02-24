import React, { Component } from 'react';

import { Button, Linking, View, StyleSheet, ScrollView, Text,  Dimensions, TouchableOpacity, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios'
import { StackActions, NavigationActions, SwitchActions } from 'react-navigation';
import { Card, CardItem, Thumbnail, Body, Left, Right } from 'native-base'
import { FlatList } from 'react-native-gesture-handler';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class myVolunteer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            jwt: null,
            //chatURL: 'default',
            volunData: [],
        }
    }

    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('TOKEN');
            if (value != null) {
                // We have data!!
                //console.log(value);
                //this.state.jwt = value;
                this.setState({ jwt: value })
                this.getMyVolunList()
                //alert(this.state.chatURL)
            }
            else {
                console.log("token이 없습니다!")
            }
        } catch (error) {
            console.log(error)
        }
    };


    getMyVolunList() {
        var config = {
            method: 'get',
            url: 'http://3.34.119.63/volunteer/list/',
            headers: {
                'Authorization': `jwt ${this.state.jwt}`
            }
        };

        axios(config)
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data);
                    //console.log(response.data[1].shelter_chat_url);
                    this.setState({ 
                        volunData: response.data })
                }
                else {
                    console.log("NOT 200");

                }
            })
            .catch((error) => {
             
                console.log(error)
            });
    }

    _signOut = async () => {
        await AsyncStorage.clear();
        const value = await AsyncStorage.getItem('TOKEN');
        console.log(value);
        this.props.navigation.navigate("Login")

        /*const resetAction = StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate('TabNav')
            ],
          });
        this.props.navigation.dispatch(resetAction);
        this.props.navigation.navigate("mainPage")*/

        /*const navigateAction = NavigationActions.navigate({
            routeName: 'Home',
            params: {},
            action: NavigationActions.navigate({ routeName: 'mainPage' }),
        });
        this.props.navigation.dispatch(navigateAction); */
        //this.props.navigation.dispatch(SwitchActions.jumpTo({routeName: 'Home'}));

        /*this.props.navigation.navigate(NavigationActions.navigate({
            routeName: 'Home',
            action: NavigationActions.navigate({ routeName: 'mainPage' })
        }))*/
    }

    componentDidMount() {
        this._retrieveData();
    }

    _handleOpenWithLinking = (link) => {
        Linking.openURL(link);
        //console.log(this.state.chatURL + " !!")
        // alert(link)
    };

    render() {
        return (
            <View style={styles.backScreen}>

                <View>
                    <Text style={styles.title}> 나의 봉사 내역 </Text>
                    </View>
                    <ScrollView>
                        <View style={styles.list}>
                    <FlatList
                        keyExtractor={item => item.id}
                        data={this.state.volunData}
                        renderItem={({ item }) => (
                            <View style={styles.list}>
                                <View style={styles.forwidth_left}>
                                    <Text style={styles.agencyText}> {item.shelter_name}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text>[신청날짜] </Text>
                                        <Text>{item.applying_date}</Text>
                                    </View>
                                </View>
                                <View style={{marginRight:40}}>
                                    <TouchableOpacity                                     
                                    style={styles.URLBtn}
                                 >
                                        {item.shelter_chat_url == "" ?
                                            (
                                                <Text>카톡 없음</Text>
                                            ) :
                                            (
                                                <Text style={styles.URLBtnText}    
                                                onPress={() => {
                                                    // this.setState({ chatURL:item.shelter_chat_url }),
                                                    this._handleOpenWithLinking(item.shelter_chat_url)
                                                    }} > 보호소 카톡</Text>
                                            )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                                            
                        )}
                    />
                    </View>
                    </ScrollView>
                    <View>
                        <TouchableOpacity style={styles.logoutBtn} onPress={() => this._signOut()}>
                            <Text style={styles.logoutBtnText}>로그아웃하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>



        );
    }
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
        paddingTop: 50,
        flex: 1,
        backgroundColor: '#FFF',
    },
    forwidth_left: {
        marginLeft: 40,
        width: '60%',
        textAlign: 'center',
        justifyContent: 'center'

    },

   
    
    URLBtn: {
        backgroundColor: '#7599FF',
        color: '#FFF',
        height: 40,
        width: screenWidth/5,
        alignItems: 'center',
        borderRadius: 15,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 15,
        marginBottom: 20,
        textAlignVertical: "center",
        justifyContent: "center",
        textAlign: "center",
    },

    URLBtnText: {
        color: '#FFF',
        fontSize: 11,
    },

    list: {
        width: '100%',
        flexDirection: 'row',
        borderBottomColor: '#e3e3e1',
        // borderBottomWidth:2 ,
        paddingTop: 30,
        paddingBottom: 0,
        alignContent: 'center',
        paddingRight:screenWidth/20,
        //marginTop: 3,
        //width: screenWidth / 2 - 30,
        //marginRight: 20      
    },

    title: {
        fontWeight: 'bold',
        textAlign: "center",
        fontSize: 15,
        fontSize: 25,
    },

    agencyText: {
        fontSize: 20,
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
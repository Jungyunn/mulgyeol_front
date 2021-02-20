import React, { Component } from 'react';
import { Button, Linking, View, StyleSheet, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios'
import { StackActions, NavigationActions, SwitchActions } from 'react-navigation';
import { Card, CardItem, Thumbnail, Body, Left, Right } from 'native-base'
import { FlatList } from 'react-native-gesture-handler';


export default class myVolunteer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            jwt: null,
            chatURL: '',
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
                    //this.setState({ volunData: response.data })
                    //this.setState({ chatURL: response.data[0].shelter_chat_url})
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

    render() {
        return (
            <View style={styles.backScreen}>

                <View>
                    <Text style={styles.title}> 나의 봉사 내역 </Text>
                    <FlatList
                        keyExtractor={item => item.id}
                        data={this.state.volunData}
                        renderItem={({ item }) => (
                            <View style={styles.list}>
                                <View style={styles.forwidth_left}>
                                    <Text style={styles.agencyText}> {item.shelter_name}</Text>
                                    <Text style={styles.dateText}> {item.applied_at.slice(0, 10)}</Text>
                                    {item.shelter_chat == "" ?
                                        (
                                            <Text>보호소 채팅 URL이 없습니다.</Text>
                                        ) :
                                        (
                                            <TouchableOpacity
                                                onPress={this._handleOpenWithLinking()}
                                                style={styles.kakaoURL}>
                                                <Text style={{ color: '#81BEF7', textDecorationLine: 'underline' }}> {item.shelter_chat_url}</Text>
                                            </TouchableOpacity>
                                        )}

                                </View>
                                <View style={styles.forwidth_right}>
                                    <TouchableOpacity style={styles.cancelBtn} /*onPress={()=>this.props.navigation.navigate(" ")}*/>
                                        <Text style={styles.cancelBtnText}>취소</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                             )}
                             />
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
        Linking.openURL(this.state.chatURL);
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
    forwidth_right: {
        width: '45%',
        justifyContent: 'center'
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
        width: '80%',
        flexDirection: 'row',
        borderBottomColor: '#e3e3e1',
        // borderBottomWidth:2 ,
        paddingTop: 30,
        paddingBottom: 0,
        alignContent: 'center',

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

    dateText: {

    },

    kakaoURL: {

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
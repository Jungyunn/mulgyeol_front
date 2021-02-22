import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment'
import axios from 'axios';



export default class volunteerDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shelter: "sample",
      selectedDate: "",
      start:"2021-02-23",
      end:"2021-02-25",
    };

    //moment.locale('ko');
    this.onDateChange = this.onDateChange.bind(this);

  }

  onDateChange(date) {
    this.setState({
      selectedDate: date,

    });

  }

  getDateInfo(){
    var config = {
      method: 'get',
      url: 'http://3.34.119.63/volunteer/apply/',
      headers: {
        'Authorization': `jwt ${this.state.jwt}`
      }
    };

    axios(config)
    .then((response) => {
      if(response.status == 200){
        console.log(response.data);
      }else {
        console.log("not 200");
      }
      
    })
    .catch((error) => {
      console.log(error)
    });
  }

  applyVolunteer(){
    let url = 'http://3.34.119.63/volunteer/apply/';
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "shelter": this.state.shelter,
        "date": this.state.selectedDate 
      }),
      redirect: 'follow',
      credentials: 'same-origin'

    })
    .then((response) => {
      if(response.status == 201){
        console.log(response.data);
      } 
    })
  }





  render() {
    const { selectedDate } = this.state;
    //const registerDate = selectedDate ? (selectedDate.month() + 1 + '월' + ' ' + selectedDate.date() + '일') : '';
    const registerDate = selectedDate ? moment(this.state.selectedDate).format('YYYY-MM-DD') : '';
    return (
      <View style={styles.backScreen}>
        <View>
          <Text style={styles.title}> 봉사날짜 선택 </Text>
        </View>
        <Text style={styles.period}>모집 기간: {this.state.start} ~ {this.state.end}</Text>
        <View style={{ marginTop: 30 }}>
          <CalendarPicker
            minDate={Date()}
            onDateChange={this.onDateChange}
            weekdays={['일', '월', '화', '수', '목', '금', '토']}
            months={['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']}
            todayBackgroundColor={'#e3eaff'}
            selectedDayColor={'#9eb7ff'}
            selectMonthTitle={3}
            previousTitle="이전달"
            nextTitle="다음달" //특정 일 ex. 매달 25일 마다는 다음달로 넘어갈 수 있게
            minDate={this.state.start}
            maxDate={this.state.end}
          />
        </View>
        <View>
          <Text style={{ marginLeft: 28, paddingTop: 20, fontSize: 17, paddingBottom: 5 }}>선택한 날짜: {registerDate}</Text>
          <Text style={{ marginLeft: 28, paddingTop: 5, fontSize: 17, paddingBottom: 20 }}>신청한 인원: (제한 인원: 데베에서 가져오기) </Text>
          <TouchableOpacity style={styles.applyBtn}
            onPress={() => alert(`${moment(this.state.selectedDate).format('YYYY-MM-DD')}`)}
          /*onPress={()=>this.props.navigation.navigate(" ")}*/>
            <Text style={styles.applyBtnText} 
            onPress={()=> this.applyVolunteer()}/* 신청하기 누르면 날짜 신청인원 +1 */>신청하기</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  backScreen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },

  title: {
    fontWeight: 'bold',
    textAlign: "center",
    fontSize: 25,
    marginTop: 20
  },

  period:{
    textAlign: "center",
    fontSize: 18,
    marginTop:10
  },

  applyBtn: {
    backgroundColor: '#7599FF',
    color: '#FFF',
    height: 60,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
    marginBottom: 20,
    textAlignVertical: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  applyBtnText: {
    color: '#FFF',
    fontSize: 20,
  },

});
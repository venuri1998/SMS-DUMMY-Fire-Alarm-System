const express = require('express');
const bodyParser = require('body-parser');

//help filter the API data that requested from REST-API
const _ = require('underscore');

//help with comparing co2 and smoke level
const Alarm = require('./models/alarm');

//help with http requests from API
const axios = require('axios');

const app = express();
const smsService = require('./services/smsService');


const cron = require('cron');

//help with checking and getting API data periodically after 1 minute and send sms to the client phone
const MessageAlert = cron.job("0 * * * * *", function () {
    axios.get("http://localhost:5000/all").then(res => {
        let floors = res.data;
       // console.log(floors);

        let alarm = new Alarm({

            co2level:5,
            smokelevel:5,
            fll:0

        });


        //get each floors
        for( let floor_identifier = 1;floor_identifier<6;floor_identifier++ ){

            let floor_no = _.findWhere(floors, { FloorNo: alarm.fll + floor_identifier});


            //get each rooms in floors
            for(let n=0;n<6;n++){

                if((floor_no.Rooms[n].SmokeLevel>alarm.smokelevel) &&(floor_no.Rooms[n].CO2Level>alarm.co2level) ){

                    let message1 = "\n#####\n\n"+"***ALERT***\n\n"+
                        "CO2 level is increased to "+ floor_no.Rooms[n].CO2Level +" and Smoke Level is increased to "+
                        floor_no.Rooms[n].SmokeLevel+" in Room "+floor_no.Rooms[n].RoomNo+" /Floor "+ floor_no.FloorNo;

                    //send message when both co2 and smoke level are exceeded limit
                    smsService.sendSms(message1, () => {
                          console.log("successfully send this ===" + message1);
                      });
                }


                else  if(floor_no.Rooms[n].SmokeLevel>alarm.smokelevel){

                    let message2 = "\n#####\n\n"+"***ALERT***\n\n"+
                        "Smoke Level is increased to "+
                        floor_no.Rooms[n].SmokeLevel+" in Room "+floor_no.Rooms[n].RoomNo+" /Floor "+ floor_no.FloorNo;


                      smsService.sendSms(message2, () => {
                          console.log("successfully send this ==" + message2);
                      });

                }
                else  if(floor_no.Rooms[n].CO2Level>alarm.co2level){

                 let message3 =  "\n#####\n\n"+"***ALERT***\n\n"+
                     "CO2 level is increased to "
                     + floor_no.Rooms[n].CO2Level +" in Room "+floor_no.Rooms[n].RoomNo+" /Floor "+ floor_no.FloorNo;

                    smsService.sendSms(message3, () => {
                        console.log("successfully send this ==" + message3);
                    });

                }

            }
        }


    });

    console.info('cron job completed');
});


// Start listening on port 3000 to start receiving requests
app.listen(3000, () => {
    console.log('Coin Alert app listening on port 3000!');

    MessageAlert.start();
});
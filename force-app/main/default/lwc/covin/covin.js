import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Covin extends LightningElement {
    date='';
    pincode='';
    data = [];
    columns = [];
    isTable = false;
    apiUrl = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin`

    get showButton() {
        return !(this.date.length > 0 && this.pincode.length > 0);
    }


    handleDateChange(event) {
        this.date = event.target.value;
        const newDate = new Date(this.date);
        const today = new Date();
       
        if (
            (newDate.getDate() < today.getDate() && newDate.getMonth() === today.getMonth())
             || newDate.getMonth() < today.getMonth()) {
            this.showNotifications('Invalid Date', 'Please select today or future date', 'error');
            this.date = '';
        } else {

            this.date =this.formattedDate(this.date);
            
            this.columns = [
                {label: 'Center Name', fieldName: 'centerName', type: 'text'},
                {label: this.date, fieldName: 'onDate', type: 'text'},
            ];
        }

    }

    handlePincodeChange(event) {
        this.pincode = event.target.value;
    }

    async submitForm() {
        const centers = await fetch(`${this.apiUrl}?pincode=${this.pincode}&date=${this.date}`);
        const centersAsJson = await centers.json();
        console.log(centersAsJson)
        if (centersAsJson.centers.length > 0) {
            
            this.data = centersAsJson.centers.map((x) => x = {
                id:x.center_id,
                centerName: x.name,
                onDate: `Available Slots : ${this.getCapcity(x.sessions)}, Min Age: ${this.getMinAge(x.sessions)}`,
            })
            this.isTable = true;
        } else {
            this.isTable = false
            this.showNotifications('Warning', 'No Slots Available for Selected Date', 'warning');
        }
    }

    getCapcity(sessions) {
        
        if (sessions.length > 0) {
            const filetrArr = sessions.filter(x =>  x.date === this.date);
            if (filetrArr.length> 0 ) {
                return filetrArr.reduce((a,b) => ( {available_capacity: a.available_capacity + b.available_capacity})).available_capacity;
            }
        }
        return 0;
    }

    getMinAge(sessions) {
        if (sessions.length > 0) {
            const filetrArr = sessions.filter(x =>  x.date === this.date);
            if (filetrArr.length> 0 ) {
                return filetrArr[0].min_age_limit;
            }
        }
        return 'NaN';
    }

    formattedDate(date) {
        const newDate = new Date(date);

        const month = newDate.getMonth() + 1;
        const day = newDate.getDate();
        const year = newDate.getFullYear();

        return `${(day > 9)? day : '0'+ day}-${(month > 9)? month : '0'+month}-${year}`;


    }

    goBack() {
        this.isTable = false;
    }

    showNotifications(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }
}